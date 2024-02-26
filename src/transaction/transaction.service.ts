import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTransactionRequest,
  TransactionResponse,
  UpdateTransactionRequest,
} from './models';
import { PrismaService } from 'src/common/services/prisma.service';
import { SuccessMessageResponse } from 'src/common/models';
import { Prisma, TransactionType } from "@prisma/client";

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
      const whereClause: Prisma.TransactionWhereInput = { walletId };
      if (transactionType) {
        whereClause.type = transactionType;
      }
      if (transactionTagId) {
        whereClause.transactionTagId = transactionTagId;
      }

      const transactionsOfWallet = await this.prisma.transaction.findMany({
        where: whereClause,
        orderBy: {
          id: 'desc',
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
  ): Promise<SuccessMessageResponse> {
    try {
      const createdTransaction = await this.prisma.transaction.create({
        data: createTransactionRequest,
      });

      return { message: `Транзакция "${createdTransaction.title}" создана` };
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException();
    }
  }

  async updateTransaction(
    transactionId: number,
    updateTransactionRequest: UpdateTransactionRequest,
  ): Promise<SuccessMessageResponse> {
    try {
      const transactionToUpdate = await this.getTransaction(transactionId);
      console.log(transactionToUpdate);
      if (!transactionToUpdate) {
        throw new NotFoundException();
      }

      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionToUpdate.id },
        data: updateTransactionRequest,
      });

      if (transactionToUpdate.title !== updatedTransaction.title) {
        return {
          message: `Транзакция "${transactionToUpdate.title}" редактирована`,
        };
      }

      return {
        message: `Транзакция "${transactionToUpdate.title}" редактирована, новое название - "${updatedTransaction.title}"`,
      };
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
