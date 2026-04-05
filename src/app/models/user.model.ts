import { UserRole } from "./user-role.types";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}
