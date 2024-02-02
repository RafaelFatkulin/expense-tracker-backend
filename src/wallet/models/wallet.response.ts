import type { Wallet } from '@prisma/client';

export class WalletResponse {
  id: number;
  name: string;
  userId: number;
  balance: number;

  static fromWalletEntity(entity: Wallet): WalletResponse {
    const response = new WalletResponse();

    response.id = entity.id;
    response.name = entity.title;
    response.userId = entity.userId;
    response.balance = 0;

    return response;
  }
}
