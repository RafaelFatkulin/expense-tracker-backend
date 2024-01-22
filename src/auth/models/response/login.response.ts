// import { User } from '@prisma/client';
import { UserResponse } from 'src/user/models';

export class LoginResponse {
  token: string;
  user: UserResponse;

  constructor(token: string, user: UserResponse) {
    this.token = token;
    this.user = UserResponse.fromUserEntity(user);
  }
}
