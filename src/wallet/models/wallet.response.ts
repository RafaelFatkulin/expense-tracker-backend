import type { Wallet } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';

export class WalletResponse {
  id: number;
  name: string;
  balance: Decimal;
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
