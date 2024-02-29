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
import { SuccessMessageResponse } from 'src/common/models';
import { TransactionResponse } from '../transaction/models';
import { SumOfWalletTransactionsByTypeResponse } from './models/sumOfWalletTransactionsByType.response';
import { CalendarDataResponse } from './models/calendarData.response';

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
  ): Promise<WalletResponseWithBalance> {
    try {
      const foundedWallet = await this.prisma
        .$queryRaw<WalletResponseWithBalance>`
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
              w.id = ${walletId} AND w."userId" = ${userId}
           GROUP BY 
              w.id, w.title, w."userId" 
        LIMIT 1;
      `;

      return foundedWallet[0];
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async getLastTransactions(walletId: number): Promise<TransactionResponse[]> {
    try {
      const lastTransaction = await this.prisma.transaction.findFirst({
        where: {
          walletId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!lastTransaction) {
        throw new NotFoundException('Последняя транзакция не найдена');
      }

      return await this.prisma.transaction.findMany({
        where: {
          walletId,
        },
        include: {
          transactionTag: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
      });
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async getWalletTransactionSum(
    walletId: number,
  ): Promise<SumOfWalletTransactionsByTypeResponse[]> {
    try {
      const lastMonthStartDate = new Date().setMonth(new Date().getMonth() - 1);
      const queryResult = await this.prisma.$queryRaw<
        SumOfWalletTransactionsByTypeResponse[]
      >`
        SELECT
            SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS "expense",
            SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS "income"
        FROM transaction
        WHERE transaction."walletId" = ${walletId}
            AND transaction."createdAt" >= TO_TIMESTAMP(${lastMonthStartDate} / 1000);
      `;

      if (queryResult.length === 0) {
        return [
          { name: 'expense', value: 0 },
          { name: 'income', value: 0 },
        ];
      }

      return Object.keys(queryResult[0]).map((key) => ({
        name: key,
        value: queryResult[0][key],
      }));
    } catch (err) {
      Logger.error(JSON.stringify(err));

      throw new InternalServerErrorException();
    }
  }

  async getWalletCalendarData(
    walletId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CalendarDataResponse[]> {
    try {
      // Проверяем, есть ли значения startDate и endDate и корректны ли они
      const isValidDate = (dateString: string) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/; // Формат даты: YYYY-MM-DD
        return dateString.match(regex) !== null;
      };

      // Устанавливаем начало и конец текущего года, если startDate и endDate отсутствуют или некорректны
      if (!startDate || !isValidDate(startDate)) {
        const currentYear = new Date().getFullYear();
        startDate = `${currentYear}-01-01`; // Начало текущего года
      }

      if (!endDate || !isValidDate(endDate)) {
        const currentYear = new Date().getFullYear();
        endDate = `${currentYear}-12-31`; // Конец текущего года
      }

      const transactions = await this.prisma.transaction.findMany({
        where: {
          walletId,
          createdAt: {
            gte: new Date(startDate), // Начало диапазона дат
            lte: new Date(endDate), // Конец диапазона дат
          },
        },
        select: {
          createdAt: true,
          amount: true,
          type: true,
        },
      });

      const dateMap = new Map<string, number>(); // Используем Map для хранения суммы транзакций по датам

      transactions.forEach((transaction) => {
        const dateKey = transaction.createdAt.toISOString().split('T')[0]; // Получаем строковое представление даты без времени
        let amountNumber = parseFloat(transaction.amount.toString()); // Конвертируем Decimal в число
        if (transaction.type === 'EXPENSE') {
          amountNumber *= -1; // Если тип транзакции - расход, изменяем знак суммы на отрицательный
        }
        if (dateMap.has(dateKey)) {
          dateMap.set(dateKey, dateMap.get(dateKey) + amountNumber);
        } else {
          dateMap.set(dateKey, amountNumber);
        }
      });

      // Преобразуем Map в массив объектов с датой и суммой
      const result = [];
      dateMap.forEach((value, key) => {
        result.push({ day: key, value });
      });

      return result;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException();
    }
  }
}
