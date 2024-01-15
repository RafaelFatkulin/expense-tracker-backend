import { AuthUser } from 'src/auth/auth-user';

export class LoginResponse {
  user: Omit<AuthUser, 'passwordHash'>;
  token: string;
  refreshToken: string;

  constructor(
    user: Omit<AuthUser, 'passwordHash'>,
    token: string,
    refreshToken: string,
  ) {
    this.user = user;
    this.token = token;
    this.refreshToken = refreshToken;
  }
}
