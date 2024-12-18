import { z } from "zod";
import { useApi } from "./_api";
import { useSetAtom, useAtomValue } from "jotai";
import { setAuthAtom, clearAuthAtom, sessionAtom } from "../store/auth";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

const SessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;

type AuthResponse = {
  user: User;
  session?: Session;
};

export function useAuthService() {
  const api = useApi();
  const setAuth = useSetAtom(setAuthAtom);
  const clearAuth = useSetAtom(clearAuthAtom);
  const session = useAtomValue(sessionAtom);

  const signIn = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/auth/signin", { email, password });
    if (!data.session) throw new Error("No session returned");
    
    const user = UserSchema.parse(data.user);
    const session = SessionSchema.parse(data.session);
    
    setAuth({ user, session });
    
    return { user, session };
  };

  const signUp = async (email: string, password: string, inviteCode: string) => {
    const data = await api.post<AuthResponse>("/auth/signup", { 
      email, 
      password,
      inviteCode
    });
    return {
      user: UserSchema.parse(data.user),
    };
  };

  const validateSession = async () => {
    if (!session) {
      clearAuth();
      return null;
    }

    try {
      const data = await api.get<AuthResponse>("/auth/validate");
      const user = UserSchema.parse(data.user);
      
      // Only update user data, keep existing session
      setAuth({ user, session });
      
      return user;
    } catch (error) {
      clearAuth();
      throw error; // Let React Query handle the error
    }
  };

  const signOut = () => {
    clearAuth();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post("/auth/change-password", { currentPassword, newPassword });
  };

  return {
    signIn,
    signUp,
    validateSession,
    signOut,
    changePassword,
  };
}
