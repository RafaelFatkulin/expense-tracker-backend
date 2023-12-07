import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletResponse,
} from './models';

import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(walletId: number): Promise<WalletResponse> {
    try {
      return await this.prisma.wallet.findUnique({ where: { id: walletId } });
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new NotFoundException();
    }
  }

  async createWallet(
    createWalletRequest: CreateWalletRequest,
  ): Promise<WalletResponse> {
    try {
      const createdWallet = await this.prisma.wallet.create({
        data: createWalletRequest,
      });

      return WalletResponse.fromWalletEntity(createdWallet);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new ConflictException();
    }
  }

  async updateWallet(
    walletId: number,
    userId: number,
    updateWalletRequest: UpdateWalletRequest,
  ): Promise<WalletResponse> {
    try {
      const walletToUpdate = await this.getWallet(walletId);

      if (!walletToUpdate) {
        throw new NotFoundException();
      }

      if (userId !== walletToUpdate.userId) {
        throw new ForbiddenException();
      }

      const updatedWallet = await this.prisma.wallet.update({
        where: { id: walletId },
        data: updateWalletRequest,
      });

      return WalletResponse.fromWalletEntity(updatedWallet);
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new ConflictException();
    }
  }

  async deleteWallet(walletId: number, userId: number): Promise<void> {
    try {
      const walletToDelete = await this.getWallet(walletId);

      if (!walletToDelete) {
        throw new NotFoundException();
      }

      if (userId !== walletToDelete.userId) {
        throw new ForbiddenException();
      }

      await this.prisma.wallet.delete({
        where: { id: walletId },
      });
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new ConflictException();
    }
  }

  async getUserWallets(userId: number): Promise<WalletResponse[]> {
    try {
      return await this.prisma.user
        .findUnique({
          where: { id: userId },
        })
        .wallets();
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
      // ADD LAST 5 TRANSACTIONS IN FUTURE
      const foundedWallet = await this.prisma.wallet.findFirst({
        where: { id: walletId, userId },
      });

      if (!foundedWallet) {
        throw new NotFoundException();
      }

      return foundedWallet;
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
