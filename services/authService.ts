import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables via import.meta.env  
// @ts-ignore - Vite provides import.meta.env at runtime
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Authentication will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'customer' | 'manager' | 'super-admin';
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'customer' // Default role for new users
        }
      }
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get current session
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error: any) {
    console.error('Failed to get session:', error);
    return null;
  }
};

// Get current user from auth
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar,
      // IMPORTANT: Customer-facing auth should always be treated as "customer".
      // Admin/manager access is handled by separate admin login under /admin.
      role: 'customer',
      createdAt: data.user.created_at
    };
  } catch (error: any) {
    console.error('Failed to get user:', error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name,
        avatar: session.user.user_metadata?.avatar,
        // IMPORTANT: Customer-facing auth should always be treated as "customer".
        // Admin/manager access is handled by separate admin login under /admin.
        role: 'customer',
        createdAt: session.user.created_at
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  // Return unsubscribe function
  return () => {
    data?.subscription?.unsubscribe();
  };
};

// Update user profile
export const updateUserProfile = async (updates: Partial<AuthUser>) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Check if user is admin
export const isAdmin = (role: string) => {
  return role === 'super-admin' || role === 'manager';
};

// Check if user is super admin
export const isSuperAdmin = (role: string) => {
  return role === 'super-admin';
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  try {
    // Get the current domain for redirect URL
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};