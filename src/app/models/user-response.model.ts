import { UserRole } from "./user-role.types";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
