import type { Prisma } from '@prisma/client';

export class WalletWithTransactionsResponse {
  id: number;
  title: string;
  balance?: Prisma.Decimal;
  userId: number;

  static fromWalletEntity(
    entity: WalletWithTransactionsResponse,
  ): WalletWithTransactionsResponse {
    const response = new WalletWithTransactionsResponse();

    response.id = entity.id;
    response.title = entity.title;
    response.balance = entity.balance;
    response.userId = entity.userId;

    return response;
  }
}
