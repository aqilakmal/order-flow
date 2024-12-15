import { useState, useEffect } from "react";
import type { User, Session } from "../services/auth";
import { AuthContext } from "./auth-context";
import { validateSession } from "../services/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateStoredSession() {
      const savedSession = localStorage.getItem("session");
      const savedUser = localStorage.getItem("user");
      
      if (savedSession && savedUser) {
        try {
          const parsedSession = JSON.parse(savedSession);
          const parsedUser = JSON.parse(savedUser);
          
          // Validate the session with the backend
          await validateSession(parsedSession.access_token);
          
          setSession(parsedSession);
          setUser(parsedUser);
        } catch (error) {
          // If validation fails, clear the stored session
          console.error("Session validation failed:", error);
          clearAuth();
        }
      }
      setLoading(false);
    }

    validateStoredSession();
  }, []);

  const setAuth = (user: User, session: Session) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("session", JSON.stringify(session));
    setUser(user);
    setSession(session);
  };

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    setUser(null);
    setSession(null);
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, session, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
} 