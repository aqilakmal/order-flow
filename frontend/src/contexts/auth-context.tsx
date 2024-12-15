import { createContext } from "react";
import type { User, Session } from "../services/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  setAuth: (user: User, session: Session) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null); 