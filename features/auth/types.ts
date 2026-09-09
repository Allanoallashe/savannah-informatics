export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}
