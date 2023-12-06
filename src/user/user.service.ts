import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { AuthUser } from 'src/auth/auth-user';
import { PrismaService } from 'src/common/services/prisma.service';
import { UpdateUserRequest } from './models/request/update-user-request.model';
import { UserResponse } from './models/user.response';
import { WalletResponse } from 'src/wallet/models';

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
    updateRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    try {
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
      throw new ConflictException();
    }
  }

  async getUserWallets(userId: number): Promise<WalletResponse[]> {
    try {
      const userWallets = await this.prisma.wallet.findMany({
        where: { userId },
      });

      return userWallets;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException();
    }
  }

  async getOneUserWallet(
    userId: number,
    walletId: number,
  ): Promise<WalletResponse> {
    try {
      const foundedWallet = await this.prisma.wallet.findFirst({
        where: { id: walletId },
      });

      if (!foundedWallet) {
        throw new NotFoundException();
      }

      if (foundedWallet?.userId !== userId) {
        throw new ForbiddenException();
      }

      return foundedWallet;
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
