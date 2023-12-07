import type { Prisma, Transaction } from '@prisma/client';

export class WalletWithTransactionsResponse {
  id: number;
  name: string;
  balance?: Prisma.Decimal;
  userId: number;
  incomes?: Transaction[];
  expenses?: Transaction[];

  static fromWalletEntity(
    entity: WalletWithTransactionsResponse,
  ): WalletWithTransactionsResponse {
    const response = new WalletWithTransactionsResponse();

    response.id = entity.id;
    response.name = entity.name;
    response.balance = entity.balance;
    response.userId = entity.userId;
    response.incomes = entity.incomes;
    response.expenses = entity.expenses;

    return response;
  }
}
