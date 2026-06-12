export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profilePicture: string | null;
}

export interface UpdateProfileRequest {
  name: string;
  profilePicture?: string | null;
}
