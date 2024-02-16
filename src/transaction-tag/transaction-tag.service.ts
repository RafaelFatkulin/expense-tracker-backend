import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import {
  CreateTransactionTagRequest,
  TransactionTagResponse,
  UpdateTransactionTagRequest,
} from './models';
import { SuccessMessageResponse } from '../common/models';

@Injectable()
export class TransactionTagService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTransactionTags(userId: number): Promise<TransactionTagResponse[]> {
    try {
      const transactionTags = await this.prismaService.transactionTag.findMany({
        where: { userId },
        orderBy: {
          id: 'asc',
        },
      });

      if (!transactionTags) {
        throw new NotFoundException();
      }

      return transactionTags.map(TransactionTagResponse.fromTransactionEntity);
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async getTransactionTag(
    transactionTagId: number,
    userId: number,
  ): Promise<TransactionTagResponse> {
    try {
      const transactionTag = await this.prismaService.transactionTag.findUnique(
        {
          where: { id: transactionTagId, userId },
        },
      );

      if (!transactionTag) {
        throw new NotFoundException();
      }

      return TransactionTagResponse.fromTransactionEntity(transactionTag);
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async createTransactionTag(
    userId: number,
    createTransactionTagRequest: CreateTransactionTagRequest,
  ): Promise<SuccessMessageResponse> {
    try {
      const isTagAlreadyExists =
        await this.prismaService.transactionTag.findFirst({
          where: { title: createTransactionTagRequest.title, userId },
        });

      if (isTagAlreadyExists) {
        throw new ConflictException(
          `У вас уже есть тэг "${createTransactionTagRequest.title}"`,
        );
      }

      const createdTransactionTag =
        await this.prismaService.transactionTag.create({
          data: createTransactionTagRequest,
        });

      return { message: `Тэг ${createdTransactionTag.title} создан` };
    } catch (err) {
      Logger.error(JSON.stringify(err));

      if (err instanceof ConflictException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async updateTransactionTag(
    userId: number,
    transactionTagId: number,
    updateTransactionTagRequest: UpdateTransactionTagRequest,
  ): Promise<SuccessMessageResponse> {
    try {
      const transactionTagToUpdate = await this.getTransactionTag(
        transactionTagId,
        userId,
      );

      if (!transactionTagToUpdate) {
        throw new NotFoundException();
      }

      const updatedTransactionTag =
        await this.prismaService.transactionTag.update({
          where: { id: transactionTagId, userId },
          data: updateTransactionTagRequest,
        });

      return {
        message: `Тэг "${transactionTagToUpdate.title}" редактирован, новое название - "${updatedTransactionTag.title}"`,
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

  async deleteTransactionTag(
    transactionTagId: number,
    userId: number,
  ): Promise<SuccessMessageResponse> {
    try {
      const transactionTagToDelete = await this.getTransactionTag(
        transactionTagId,
        userId,
      );

      if (!transactionTagToDelete) {
        throw new NotFoundException();
      }

      await this.prismaService.transactionTag.delete({
        where: { id: transactionTagId, userId },
      });

      return { message: `Тег "${transactionTagToDelete.title}" удален` };
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
