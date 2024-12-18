import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { User, Session } from "../services/auth";

// Create a typed storage
const storage = {
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`[Auth] Storage read error:`, error);
      return null;
    }
  },
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[Auth] Storage write error:`, error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[Auth] Storage remove error:`, error);
    }
  },
};

// Initialize atoms with values from localStorage
const initialUser = storage.getItem<User>("user");
const initialSession = storage.getItem<Session>("session");

// Persist atoms in localStorage
export const userAtom = atomWithStorage<User | null>("user", initialUser, {
  ...storage,
  getItem: (key) => storage.getItem<User>(key),
  setItem: (key, value) => storage.setItem<User | null>(key, value),
});

export const sessionAtom = atomWithStorage<Session | null>("session", initialSession, {
  ...storage,
  getItem: (key) => storage.getItem<Session>(key),
  setItem: (key, value) => storage.setItem<Session | null>(key, value),
});

// Derived atom to check if user is authenticated
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  const session = get(sessionAtom);
  return !!user && !!session;
});

// Actions
export const setAuthAtom = atom(
  null,
  (_, set, { user, session }: { user: User; session: Session }) => {
    set(userAtom, user);
    set(sessionAtom, session);
  }
);

export const clearAuthAtom = atom(null, (_, set) => {
  set(userAtom, null);
  set(sessionAtom, null);
});
