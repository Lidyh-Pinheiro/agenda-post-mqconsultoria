
import { createClient } from '@supabase/supabase-js';

// Real Supabase client with actual project credentials
const supabaseUrl = 'https://jxhkpzdbfvefcapwgrwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4aGtwemRiZnZlZmNhcHdncnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMjUxNTIsImV4cCI6MjA1ODcwMTE1Mn0.OTGNN7ul4kcRCheobvNOIAz6WIAjP2ZsGNp5MtVGsbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});

// Fallback to local storage if Supabase operations fail
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return null;
  }
};
