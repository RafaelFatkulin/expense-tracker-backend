import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletResponse,
} from './models';

import { PrismaService } from 'src/common/services/prisma.service';
import { WalletResponseWithBalance } from './models/walletWithBalance.response';
import { WalletWithTransactionsResponse } from './models/walletWithTransactions.response';
import { SuccessMessageResponse } from 'src/common/models';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(walletId: number): Promise<WalletResponse> {
    try {
      return await this.prisma.wallet.findUnique({ where: { id: walletId } });
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new NotFoundException();
    }
  }

  async createWallet(
    createWalletRequest: CreateWalletRequest,
  ): Promise<WalletResponse> {
    try {
      const createdWallet = await this.prisma.wallet.create({
        data: createWalletRequest,
      });

      return WalletResponse.fromWalletEntity(createdWallet);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new ConflictException();
    }
  }

  async updateWallet(
    walletId: number,
    userId: number,
    updateWalletRequest: UpdateWalletRequest,
  ): Promise<WalletResponse> {
    try {
      const walletToUpdate = await this.getOneUserWallet(userId, walletId);

      if (!walletToUpdate) {
        throw new NotFoundException();
      }

      if (userId !== walletToUpdate.userId) {
        throw new ForbiddenException();
      }

      const updatedWallet = await this.prisma.wallet.update({
        where: { id: walletId },
        data: updateWalletRequest,
      });

      return WalletResponse.fromWalletEntity(updatedWallet);
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

  async deleteWallet(
    walletId: number,
    userId: number,
  ): Promise<SuccessMessageResponse> {
    try {
      const walletToDelete = await this.getOneUserWallet(userId, walletId);

      if (!walletToDelete) {
        throw new NotFoundException();
      }

      if (userId !== walletToDelete.userId) {
        throw new ForbiddenException();
      }

      await this.prisma.wallet.delete({
        where: { id: walletId },
      });

      return { message: 'Кошелек удален' };
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

  async getUserWallets(userId: number): Promise<WalletResponseWithBalance[]> {
    try {
      return await this.prisma.$queryRaw<WalletResponseWithBalance[]>`
        SELECT
          w.id as "id",
          w.name as "name",
          w."userId" as "userId",
          COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS balance
        FROM 
          "wallet" w
        LEFT JOIN 
          "transaction" t ON w.id = t."walletId"
        WHERE 
          w."userId" = ${userId}
        GROUP BY 
          w.id, w.name, w."userId"
      ;
    `;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException();
    }
  }

  async getOneUserWallet(
    userId: number,
    walletId: number,
  ): Promise<WalletWithTransactionsResponse> {
    try {
      const foundedWallet = await this.prisma
        .$queryRaw<WalletWithTransactionsResponse>`
          SELECT
            w.id as "id",
            w.name as "name",
            w."userId" as "userId",
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS balance,
            CASE 
              WHEN EXISTS (
                SELECT 1 
                FROM "transaction" t
                WHERE t."walletId" = ${walletId} AND t.type = 'INCOME'
              )
              THEN (
                SELECT json_agg(json_build_object('id', t.id, 'type', t.type, 'title', t.title, 'amount', t.amount))
                FROM (
                  SELECT DISTINCT ON (t.id) t.id, t.type, t.title, t.amount
                  FROM "transaction" t
                  WHERE t."walletId" = ${walletId} AND t.type = 'INCOME'
                  ORDER BY t.id DESC
                  LIMIT 5
                ) t
              )
              ELSE NULL -- Можно вернуть NULL или [] (пустой массив) в зависимости от предпочтений
            END as "incomes",
            CASE 
              WHEN EXISTS (
                SELECT 1 
                FROM "transaction" t
                WHERE t."walletId" = ${walletId} AND t.type = 'EXPENSE'
              )
              THEN (
                SELECT json_agg(json_build_object('id', t.id, 'type', t.type, 'title', t.title, 'amount', t.amount))
                FROM (
                  SELECT DISTINCT ON (t.id) t.id, t.type, t.title, t.amount
                  FROM "transaction" t
                  WHERE t."walletId" = ${walletId} AND t.type = 'EXPENSE'
                  ORDER BY t.id DESC
                  LIMIT 5
                ) t
              )
              ELSE NULL -- Можно вернуть NULL или [] (пустой массив) в зависимости от предпочтений
            END as "expenses"
          FROM 
            "wallet" w
          LEFT JOIN 
            "transaction" t ON w.id = t."walletId"
          WHERE 
            w.id = ${walletId} AND w."userId" = ${userId}
          GROUP BY 
            w.id, w.name, w."userId"
          LIMIT 1;
    `;

      if (!foundedWallet[0]) {
        const walletWithoutTransactions = await this.prisma.wallet.findUnique({
          where: { id: walletId },
        });

        if (!walletWithoutTransactions) {
          throw new NotFoundException();
        }

        return walletWithoutTransactions;
      }

      return foundedWallet[0];
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
