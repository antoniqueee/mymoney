export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UserSession {
  user: UserProfile | null;
  isLoading: boolean;
}
