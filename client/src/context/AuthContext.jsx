import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Ambil session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen untuk perubahan auth (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Skip INITIAL_SESSION karena sudah ditangani getSession di atas
        if (event === 'INITIAL_SESSION') return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUpWithEmail = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, lastupdateddate: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  const value = useMemo(() => ({
    user, profile, loading, isAdmin,
    signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateProfile, fetchProfile,
  }), [user, profile, loading, isAdmin, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateProfile, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
