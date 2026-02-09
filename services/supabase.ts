
import { createClient } from '@supabase/supabase-js';
import { ClinicData } from '../types';
import { INITIAL_DATA } from '../initialData';

const SUPABASE_URL = 'https://ssiyxruwbmmtbbewkxvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaXl4cnV3Ym1tdGJiZXdreHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzgzMDksImV4cCI6MjA4NjE1NDMwOX0.Y-3AxhFlHi5rePMhQow-6b70V4Rkd59wGXBieHHdWzk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  checkAccountStatus: async (): Promise<{ exists: boolean; error: boolean }> => {
    try {
      const user = await supabaseService.getUser();
      if (!user) return { exists: false, error: false };

      const { data, error } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Check Account Status Error:', error.message);
        return { exists: true, error: true };
      }
      return { exists: data && data.length > 0, error: false };
    } catch (e: any) {
      console.error('Check Account Status Exception:', e.message || String(e));
      return { exists: true, error: true };
    }
  },

  loadData: async (): Promise<ClinicData | null> => {
    const user = await supabaseService.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading data:', error.message, error.details);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0];
    
    // معالجة دفاعية: jsonb قد يعود أحياناً ككائن أو كنص حسب إعدادات التوصيل
    let content = row.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse content string from jsonb column", e);
        content = {};
      }
    }

    const cloudTimestamp = content?.lastUpdated || 0;

    return { 
        ...INITIAL_DATA, 
        ...content,
        lastUpdated: cloudTimestamp
    };
  },

  saveData: async (clinicData: ClinicData) => {
    const user = await supabaseService.getUser();
    if (!user) return;

    // تنظيف البيانات قبل الحفظ لضمان سلامة هيكل JSON
    const cleanData = JSON.parse(JSON.stringify(clinicData));
    
    // إزالة الصور الكبيرة التي لا نحتاج حفظها في قاعدة البيانات (حفظ الروابط فقط)
    if (cleanData.settings) {
        cleanData.settings.rxBackgroundImage = cleanData.settings.rxBackgroundImage?.startsWith('data:') ? "" : cleanData.settings.rxBackgroundImage;
        cleanData.settings.consentBackgroundImage = cleanData.settings.consentBackgroundImage?.startsWith('data:') ? "" : cleanData.settings.consentBackgroundImage;
        cleanData.settings.instructionsBackgroundImage = cleanData.settings.instructionsBackgroundImage?.startsWith('data:') ? "" : cleanData.settings.instructionsBackgroundImage;
    }
    
    if (cleanData.doctors) {
        cleanData.doctors = cleanData.doctors.map((doc: any) => ({
            ...doc,
            rxBackgroundImage: doc.rxBackgroundImage?.startsWith('data:') ? "" : doc.rxBackgroundImage
        }));
    }

    cleanData.lastUpdated = Date.now();

    try {
      // البحث عن السجل الحالي
      const { data: existing, error: fetchError } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // تحديث السجل باستخدام كائن JSON مباشر (يتوافق تماماً مع jsonb)
        const { error: updateError } = await supabase
          .from('user_data')
          .update({ content: cleanData })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // إنشاء سجل جديد
        const { error: insertError } = await supabase
          .from('user_data')
          .insert({ 
            user_id: user.id, 
            content: cleanData 
          });
        
        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error('Database Sync Error:', error.message);
      throw new Error(error.message || 'فشلت عملية المزامنة مع قاعدة البيانات');
    }
  }
};
