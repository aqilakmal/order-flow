import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

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

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  
  return {
    session: SessionSchema.parse(data.session),
    user: UserSchema.parse(data.user),
  };
}

export async function signUp(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  
  return {
    user: UserSchema.parse(data.user),
  };
}

export async function validateSession(token: string) {
  const response = await fetch(`${API_URL}/auth/validate`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    mode: 'cors',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Invalid session');
  }
  
  const data = await response.json();
  return {
    user: UserSchema.parse(data.user)
  };
}