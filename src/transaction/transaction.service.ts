import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TransactionResponse, UpdateTransactionRequest } from './models';

import { CreateTransactionRequest } from './models/request/create-transaction-request.model';
import { PrismaService } from 'src/common/services/prisma.service';
import { SuccessMessageResponse } from 'src/common/models';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransaction(transactionId: number): Promise<TransactionResponse> {
    try {
      return await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          transactionTag: true,
        },
      });
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new NotFoundException();
    }
  }

  async getWalletTransactions(
    walletId: number,
    transactionType?: TransactionType,
    transactionTagId?: number,
  ): Promise<TransactionResponse[]> {
    try {
      const transactionsOfWallet = await this.prisma.transaction.findMany({
        where: { type: transactionType, walletId, transactionTagId },
        orderBy: {
          id: 'asc',
        },
        include: {
          transactionTag: true,
        },
      });

      if (!transactionsOfWallet) {
        throw new NotFoundException();
      }

      return transactionsOfWallet;
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async createTransaction(
    createTransactionRequest: CreateTransactionRequest,
  ): Promise<TransactionResponse> {
    try {
      const createdTransaction = await this.prisma.transaction.create({
        data: createTransactionRequest,
      });

      return TransactionResponse.fromTransactionEntity(createdTransaction);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException();
    }
  }

  async updateTransaction(
    transactionId: number,
    updateTransactionRequest: UpdateTransactionRequest,
  ): Promise<TransactionResponse> {
    try {
      const transactionToUpdate = await this.getTransaction(transactionId);

      if (!transactionToUpdate) {
        throw new NotFoundException();
      }

      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: updateTransactionRequest.walletId },
        data: updateTransactionRequest,
      });

      return TransactionResponse.fromTransactionEntity(updatedTransaction);
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new ConflictException();
    }
  }

  async deleteTransaction(
    transactionId: number,
  ): Promise<SuccessMessageResponse> {
    try {
      const transactionToDelete = await this.getTransaction(transactionId);

      if (!transactionToDelete) {
        throw new NotFoundException();
      }

      await this.prisma.transaction.delete({
        where: { id: transactionId },
      });

      return { message: 'Транзакция удалена' };
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new ConflictException();
    }
  }
}
