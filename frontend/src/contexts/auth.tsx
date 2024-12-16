import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "../services/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  setAuth: (user: User, session: Session) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    const savedUser = localStorage.getItem("user");

    if (savedSession && savedUser) {
      setSession(JSON.parse(savedSession));
      setUser(JSON.parse(savedUser));
    }
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

  return (
    <AuthContext.Provider value={{ user, session, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
