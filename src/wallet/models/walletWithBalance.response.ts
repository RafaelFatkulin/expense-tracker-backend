import type { Prisma } from '@prisma/client';

export class WalletResponseWithBalance {
  id: number;
  title: string;
  balance: Prisma.Decimal | null;
  userId: number;

  static fromWalletEntity(
    entity: WalletResponseWithBalance,
  ): WalletResponseWithBalance {
    const response = new WalletResponseWithBalance();

    response.id = entity.id;
    response.title = entity.title;
    response.balance = entity.balance;
    response.userId = entity.userId;

    return response;
  }
}
