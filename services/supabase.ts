
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
        .maybeSingle();

      if (error) {
          console.error('Account check error:', error.message || JSON.stringify(error));
          return { exists: true, error: true };
      }
      return { exists: !!data, error: false };
    } catch (e: any) {
      console.error('Unexpected account check error:', e.message || String(e));
      return { exists: true, error: true };
    }
  },

  loadData: async (): Promise<ClinicData | null> => {
    try {
      const user = await supabaseService.getUser();
      if (!user) {
          console.warn('LoadData called without an active session.');
          return null;
      }

      // إزالة .order('updated_at') لأن العمود غير موجود في الجدول
      // نعتمد على user_id كمعرف فريد لجلب سجل المريض
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error(`Database load error: ${error.message} (Code: ${error.code})`);
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        return null;
      }

      if (!data) {
        console.log('No cloud data found for user, returning INITIAL_DATA');
        return INITIAL_DATA;
      }

      // Parse content securely
      let content = data.content || {};
      if (typeof content === 'string') {
          try {
              content = JSON.parse(content);
          } catch (e) {
              console.error('Error parsing content JSON from DB:', e);
              content = {};
          }
      }
      
      // Merge separated RX image data if exists
      if (data['RX json']) {
          const rxData = data['RX json'];
          if (rxData && rxData.image) {
              if (!content.settings) content.settings = { ...INITIAL_DATA.settings };
              content.settings.rxBackgroundImage = rxData.image;
          }
      }

      return { 
          ...INITIAL_DATA, 
          ...content,
          lastUpdated: content.lastUpdated || 0
      };
    } catch (err: any) {
        console.error('Critical failure in loadData:', err.message || String(err));
        return null;
    }
  },

  saveData: async (clinicData: ClinicData) => {
    try {
        const user = await supabaseService.getUser();
        if (!user) return;

        const dataToSave = {
            ...clinicData,
            lastUpdated: Date.now()
        };

        // إزالة updated_at من الـ payload لتجنب الخطأ
        const payload = {
            user_id: user.id,
            content: dataToSave,
            "RX json": { image: clinicData.settings.rxBackgroundImage || '' }
        };

        const { error } = await supabase
          .from('user_data')
          .upsert(payload, { onConflict: 'user_id' });

        if (error) {
          console.error('Upsert failed:', error.message || JSON.stringify(error));
          
          // Fallback manual check
          const { data: existing, error: fetchError } = await supabase
            .from('user_data')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (existing) {
              await supabase.from('user_data').update(payload).eq('id', existing.id);
          } else if (!fetchError) {
              await supabase.from('user_data').insert(payload);
          }
        }
    } catch (err: any) {
        console.error('Critical failure in saveData:', err.message || String(err));
    }
  }
};
