
import { createClient } from '@supabase/supabase-js';
import { ClinicData, INITIAL_DATA } from '../types';

const SUPABASE_URL = 'https://ionklmzfvsbbbbdakwhl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmtsbXpmdnNiYmJiZGFrd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTQ3MTEsImV4cCI6MjA3OTg3MDcxMX0.fAuimBEH6f5eCHS0UFj_NdU4WIx77v7fKvz6kok9lUg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  // Auth
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

  // Data
  loadData: async (): Promise<ClinicData | null> => {
    const user = await supabaseService.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return INITIAL_DATA;
      }
      console.error('Error loading data:', error);
      return null;
    }

    const content = data.content || {};
    
    // Check for "RX json" column specifically
    if (data['RX json']) {
        const rxData = data['RX json'];
        if (rxData && rxData.image) {
            if (!content.settings) content.settings = { ...INITIAL_DATA.settings };
            content.settings.rxBackgroundImage = rxData.image;
        }
    } else if (data.rx && typeof data.rx === 'string') {
        if (!content.settings) content.settings = { ...INITIAL_DATA.settings };
        content.settings.rxBackgroundImage = data.rx;
    }

    // Force extraction of top-level timestamp if it exists, otherwise use what's inside content
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

    const { data: existing } = await supabase
      .from('user_data')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Ensure we are saving with a fresh timestamp
    const dataToSave = {
        ...clinicData,
        lastUpdated: Date.now()
    };

    const payload = {
        content: dataToSave,
        "RX json": { image: clinicData.settings.rxBackgroundImage }
    };

    if (existing) {
      const { error } = await supabase
        .from('user_data')
        .update(payload)
        .eq('id', existing.id);
      
      if (error) console.error('Error updating data:', error);
    } else {
      const { error } = await supabase
        .from('user_data')
        .insert({ 
            user_id: user.id, 
            ...payload
        });

      if (error) console.error('Error inserting data:', error);
    }
  }
};
