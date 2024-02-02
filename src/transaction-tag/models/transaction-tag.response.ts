import { TransactionTag } from "@prisma/client";

export class TransactionTagResponse {
  id: number;
  title: string;
  color: string;
  userId: number;

  static fromTransactionEntity(entity: TransactionTag): TransactionTagResponse {
    const response = new TransactionTagResponse();

    response.id = entity.id;
    response.title = entity.title;
    response.color = entity.color;
    response.userId = entity.userId;

    return response;
  }
}