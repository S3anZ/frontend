import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChatHistoryManager } from '../lib/chatHistory';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session and profile
    const getInitialSession = async () => {
      let { data: { session } } = await supabase.auth.getSession();
    
      // If no session but token exists in storage, try to refresh
      if (!session) {
        const { data: refreshedSession, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh error:', error);
        } else {
          session = refreshedSession;
        }
      }
    
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await getProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profiles table doesn't exist or no profile found, that's okay
        // The user can still use the app without a profile
        console.log('Profile not found or table not set up:', error.message);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.log('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username, // Use username as initial full_name
        }
      }
    });
    return { data, error };
  };

  const signUpWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/startmenu`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
  };

  const updateProfile = async (updates) => {
    try {
      // If profiles table doesn't exist, just return success
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) {
        console.log('Profile update failed (table may not exist):', error.message);
        return { error };
      }

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.log('Error updating profile:', error);
      return { error };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      console.log('Upload function called with file:', file.name, file.size);
      console.log('Current user:', user?.id);
      
      if (!user?.id) {
        console.error('No user ID available');
        return { error: { message: 'User not authenticated' } };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: uploadError };
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', data.publicUrl);
      return { data: data.publicUrl, error: null };
    } catch (error) {
      console.error('Upload function error:', error);
      return { error };
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/startmenu`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    try {
      // Clear current chat when signing out
      if (user?.id) {
        localStorage.removeItem(`current_chat_${user.id}`);
      }
      
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Even if there's an error, keep local state cleared
        return { error };
      }
      
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      // Keep local state cleared even on unexpected errors
      return { error: err };
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const signInWithPhone = async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      }
    });
    return { data, error };
  };

  const verifyOTP = async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    return { data, error };
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signUpWithGoogle,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    signInWithPhone,
    verifyOTP,
    updateProfile,
    uploadAvatar,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
