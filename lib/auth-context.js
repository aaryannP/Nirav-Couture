'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check saved session on mount — no auto-admin fallback
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('nirav_user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      // No else — unauthenticated visitors stay as null (not auto-admin)
    } catch (e) {}
    setLoading(false);
  }, []);

  const loginWithEmail = async (email, password, rememberMe = true) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        // Respect rememberMe: if false, use sessionStorage instead of localStorage
        if (rememberMe) {
          localStorage.setItem('nirav_user_session', JSON.stringify(data.user));
          sessionStorage.removeItem('nirav_user_session');
        } else {
          sessionStorage.setItem('nirav_user_session', JSON.stringify(data.user));
          localStorage.removeItem('nirav_user_session');
        }
        return { success: true, message: 'Logged in successfully!' };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const registerWithEmail = async (name, email, password, phone) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password, phone })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('nirav_user_session', JSON.stringify(data.user));
        return { success: true, message: 'Account created successfully!' };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginWithSocial = async (provider) => {
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('nirav_user_session', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nirav_user_session');
    sessionStorage.removeItem('nirav_user_session');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithSocial,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
