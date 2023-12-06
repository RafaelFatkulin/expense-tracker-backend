import type { Prisma, Wallet } from '@prisma/client';

export class WalletResponse {
  id: number;
  name: string;
  balance: Prisma.Decimal | null;
  userId: number;

  static fromWalletEntity(entity: Wallet): WalletResponse {
    const response = new WalletResponse();

    response.id = entity.id;
    response.name = entity.name;
    response.balance = entity.balance;
    response.userId = entity.userId;

    return response;
  }
}
