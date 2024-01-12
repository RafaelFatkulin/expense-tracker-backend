import { AuthUser } from 'src/auth/auth-user';

export class LoginResponse {
  user: Omit<AuthUser, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;

  constructor(
    user: Omit<AuthUser, 'passwordHash'>,
    accessToken: string,
    refreshToken: string,
  ) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
