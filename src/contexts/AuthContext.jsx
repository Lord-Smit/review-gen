import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import db, { resetDemoData as resetAdapterData } from '../lib/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const session = await db.auth.getSession();
        if (active) setUser(session);
      } catch (error) {
        console.error('Failed to restore session:', error);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    const unsubscribe = db.auth.onAuthStateChange?.((nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const result = await db.auth.signIn(email, password);
      if (result?.error) return { error: result.error };

      setUser(result?.user ?? null);
      return { error: null };
    } catch (error) {
      return { error: error?.message || 'Unable to sign in. Please try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await db.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out cleanly:', error);
    } finally {
      setUser(null);
    }
  }, []);

  const resetDemoData = useCallback(async () => {
    await resetAdapterData();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, resetDemoData, isAdmin: Boolean(user?.isAdmin) }),
    [user, loading, signIn, signOut, resetDemoData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
