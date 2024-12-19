import { z } from "zod";
import { useApi } from "../lib/api";
import { useSetAtom, useAtomValue } from "jotai";
import { setAuthAtom, clearAuthAtom, sessionAtom } from "../store/auth";

/**
 * @description Schema for user data validation
 */
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

/**
 * @description Schema for session data validation
 */
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

/**
 * @description Hook to access authentication-related functionality
 * @returns {Object} Object containing auth methods (signIn, signUp, validateSession, signOut, changePassword)
 */
export function useAuthService() {
  const api = useApi();
  const setAuth = useSetAtom(setAuthAtom);
  const clearAuth = useSetAtom(clearAuthAtom);
  const session = useAtomValue(sessionAtom);

  /**
   * @description Authenticate user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{user: User, session: Session}>} User and session data
   * @throws {Error} If authentication fails
   */
  const signIn = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/auth/signin", { email, password });
    if (!data.session) throw new Error("No session returned");

    const user = UserSchema.parse(data.user);
    const session = SessionSchema.parse(data.session);

    setAuth({ user, session });

    return { user, session };
  };

  /**
   * @description Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} inviteCode - Registration invite code
   * @returns {Promise<{user: User}>} Created user data
   * @throws {Error} If registration fails
   */
  const signUp = async (email: string, password: string, inviteCode: string) => {
    const data = await api.post<AuthResponse>("/auth/signup", {
      email,
      password,
      inviteCode,
    });
    return {
      user: UserSchema.parse(data.user),
    };
  };

  /**
   * @description Validate current session and update user data
   * @returns {Promise<User | null>} User data if session is valid, null otherwise
   * @throws {Error} If validation fails
   */
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

  /**
   * @description Clear current authentication state
   */
  const signOut = () => {
    clearAuth();
  };

  /**
   * @description Change user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   * @throws {Error} If password change fails
   */
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
