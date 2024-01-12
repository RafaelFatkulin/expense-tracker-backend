export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  emailVerified: boolean;
}
