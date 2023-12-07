import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthUser } from 'src/auth/auth-user';
import { PrismaService } from 'src/common/services/prisma.service';
import { UpdateUserRequest } from './models/request/update-user-request.model';
import { UserResponse } from './models/user.response';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public async getUserEntityById(id: number): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  public async getUserEntityByUsername(
    username: string,
  ): Promise<AuthUser | null> {
    const normalizedUsername = username.toLowerCase();

    return this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
  }

  async updateUser(
    userId: number,
    authUserId: number,
    updateRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    try {
      if (userId !== authUserId) {
        throw new UnauthorizedException();
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...updateRequest,
          birthDate:
            updateRequest.birthDate !== null &&
            updateRequest.birthDate !== undefined
              ? new Date(updateRequest.birthDate)
              : updateRequest.birthDate,
        },
      });

      return UserResponse.fromUserEntity(updatedUser);
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new ConflictException();
    }
  }
}
