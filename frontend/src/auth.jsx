import { createContext, useContext, useState, useCallback } from 'react';
import { setToken, getToken } from './api.js';

const AuthContext = createContext(null);

// Decode JWT payload to get the username ("sub") without an extra API call.
function decodeUser(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Check expiry client-side so we can clear a stale session proactively.
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.sub ? { username: payload.sub } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    if (!token) return null;
    const u = decodeUser(token);
    if (!u) setToken(null);
    return u;
  });

  const signIn = useCallback((token) => {
    setToken(token);
    setUser(decodeUser(token) || { username: 'you' });
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
