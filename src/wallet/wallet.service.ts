import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { CreateWalletRequest, WalletResponse } from './models';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(
    createWalletRequest: CreateWalletRequest,
  ): Promise<WalletResponse> {
    try {
      const { name, userId, balance } = createWalletRequest;
      const createdWallet = await this.prisma.wallet.create({
        data: {
          name,
          userId,
          balance,
        },
      });

      return WalletResponse.fromWalletEntity(createdWallet);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new ConflictException();
    }
  }
}
