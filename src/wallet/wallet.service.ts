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
import { WalletResponseWithBalance } from './models';
import { WalletWithTransactionsResponse } from './models';
import { SuccessMessageResponse } from 'src/common/models';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(walletId: number): Promise<WalletResponse> {
    try {
      return WalletResponse.fromWalletEntity(
        await this.prisma.wallet.findUnique({ where: { id: walletId } }),
      );
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new NotFoundException();
    }
  }

  async createWallet(
    createWalletRequest: CreateWalletRequest,
  ): Promise<SuccessMessageResponse> {
    try {
      const createdWallet = await this.prisma.wallet.create({
        data: createWalletRequest,
      });

      return { message: `Кошелек "${createdWallet.title}" создан` };
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new ConflictException();
    }
  }

  async updateWallet(
    walletId: number,
    userId: number,
    updateWalletRequest: UpdateWalletRequest,
  ): Promise<SuccessMessageResponse> {
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

      return {
        message: `Кошелек "${walletToUpdate.title}" редактирован, теперь он называется "${updatedWallet.title}"`,
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

      return { message: `Кошелек "${walletToDelete.title}" удален` };
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
        w.title as "title",
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
        w.id, w.title, w."userId"
      ORDER BY
        w.id;
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
           WITH last_transaction_date AS (
            SELECT MAX("createdAt"::date) as last_date
            FROM "transaction"
            WHERE "walletId" = ${walletId}
          )
          SELECT
            w.id as "id",
            w.title as "title",
            w."userId" as "userId",
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS balance,
            COALESCE((
                SELECT json_agg(json_build_object('id', t.id, 'type', t.type, 'title', t.title, 'amount', t.amount))
                FROM "transaction" t
                JOIN last_transaction_date ltd ON t."createdAt"::date = ltd.last_date
                WHERE t."walletId" = ${walletId}
            ), '[]'::json) as "transactions"
          FROM 
            "wallet" w
          LEFT JOIN 
            "transaction" t ON w.id = t."walletId"
          WHERE 
            w.id = ${walletId} AND w."userId" = ${userId}
          GROUP BY 
            w.id, w.title, w."userId"
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
