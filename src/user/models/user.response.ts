import type { User } from '@prisma/client';

export class UserResponse {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image: string | null;
  birthDate: Date | null;
  registrationDate: Date;

  static fromUserEntity(entity: User): UserResponse {
    const response = new UserResponse();

    response.id = entity.id;
    response.username = entity.username;
    response.email = entity.email;
    response.emailVerified = entity.emailVerified;
    response.name = [entity.lastName, entity.firstName, entity.middleName]
      .filter((s: string | null) => s !== null)
      .join(' ');
    response.image = entity.image;
    response.birthDate = entity.birthDate;
    response.registrationDate = entity.registrationDate;

    return response;
  }
}
