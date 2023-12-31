import { Prisma, Transaction, TransactionType } from '@prisma/client';

export class TransactionResponse {
  id: number;
  title: string;
  type: TransactionType;
  amount: Prisma.Decimal;
  walletId: number;
  createdAt: Date;

  static fromTransactionEntity(entity: Transaction): TransactionResponse {
    const response = new TransactionResponse();

    response.id = entity.id;
    response.title = entity.title;
    response.type = entity.type;
    response.amount = entity.amount;
    response.walletId = entity.walletId;
    response.createdAt = entity.createdAt;

    return response;
  }
}
