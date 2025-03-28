
// This file provides a mock Supabase client for local storage usage
// No actual Supabase connection is being made

// Mock Supabase client
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
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};
