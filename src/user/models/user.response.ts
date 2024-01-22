// import type { User } from '@prisma/client';

export class UserResponse {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
  registrationDate: Date;

  static fromUserEntity(entity: UserResponse): UserResponse {
    const response = new UserResponse();

    response.id = entity.id;
    response.username = entity.username;
    response.email = entity.email;
    response.emailVerified = entity.emailVerified;
    response.registrationDate = entity.registrationDate;

    return response;
  }
}
