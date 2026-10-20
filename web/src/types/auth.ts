export type AuthUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
};

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};