
import { createClient } from '@supabase/supabase-js';
import { ClinicData } from '../types';
import { INITIAL_DATA } from '../initialData';

const SUPABASE_URL = 'https://ionklmzfvsbbbbdakwhl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmtsbXpmdnNiYmJiZGFrd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTQ3MTEsImV4cCI6MjA3OTg3MDcxMX0.fAuimBEH6f5eCHS0UFj_NdU4WIx77v7fKvz6kok9lUg';

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
      return null; // نعيد null لنعرف أن الحساب جديد تماماً
    }

    const row = data[0];
    const content = row.content || {};
    const cloudTimestamp = content.lastUpdated || 0;

    return { 
        ...INITIAL_DATA, 
        ...content,
        lastUpdated: cloudTimestamp
    };
  },

  saveData: async (clinicData: ClinicData) => {
    const user = await supabaseService.getUser();
    if (!user) return;

    // نسخة عميقة لتعديلها قبل الحفظ
    const dataToSave = JSON.parse(JSON.stringify(clinicData));
    
    // إزالة الصور الخلفية (تخزن محلياً فقط حسب الطلب السابق)
    if (dataToSave.settings) {
        dataToSave.settings.rxBackgroundImage = "";
        dataToSave.settings.consentBackgroundImage = "";
        dataToSave.settings.instructionsBackgroundImage = "";
    }
    
    if (dataToSave.doctors) {
        dataToSave.doctors = dataToSave.doctors.map((doc: any) => ({
            ...doc,
            rxBackgroundImage: ""
        }));
    }

    dataToSave.lastUpdated = Date.now();

    // استخدام upsert بدلاً من select ثم insert/update
    // هذا يضمن إنشاء صف جديد إذا لم يكن موجوداً بناءً على user_id
    const { error } = await supabase
        .from('user_data')
        .upsert({
            user_id: user.id,
            content: dataToSave,
        }, {
            onConflict: 'user_id' // العمود الذي نعتمد عليه لتحديد التكرار
        });

    if (error) {
        console.error('Error saving data to Supabase:', error.message);
        throw new Error(error.message || 'Database sync failed');
    }
  }
};
