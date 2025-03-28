
// This file provides a mock client for local storage usage
// No actual connections are being made

// Mock client
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null })
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: '' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: async () => ({ data: null, error: null })
    })
  },
  auth: {
    signOut: async () => ({ error: null }),
    signUp: async () => ({ data: null, error: null }),
    signIn: async () => ({ data: null, error: null }),
    onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
    updateUser: async () => ({ data: null, error: null })
  }
};
