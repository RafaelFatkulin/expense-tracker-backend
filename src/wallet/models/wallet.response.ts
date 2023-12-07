import type { Wallet } from '@prisma/client';

export class WalletResponse {
  id: number;
  name: string;
  userId: number;

  static fromWalletEntity(entity: Wallet): WalletResponse {
    const response = new WalletResponse();

    response.id = entity.id;
    response.name = entity.name;
    response.userId = entity.userId;

    return response;
  }
}
