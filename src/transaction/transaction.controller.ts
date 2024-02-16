import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateTransactionRequest,
  TransactionResponse,
  UpdateTransactionRequest,
} from './models';
import { SuccessMessageResponse } from 'src/common/models';
import { TransactionTag, TransactionType } from "@prisma/client";

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(AuthGuard())
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRequest: CreateTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.transactionService.createTransaction(createRequest);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.transactionService.updateTransaction(id, updateRequest);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessMessageResponse> {
    return await this.transactionService.deleteTransaction(id);
  }

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getWalletTransactions(
    @Query('wallet', ParseIntPipe) walletId: number,
    @Query('type') transactionType?: TransactionType,
    @Query('tag') transactionTagId?: number,
  ): Promise<TransactionResponse[]> {
    return await this.transactionService.getWalletTransactions(
      walletId,
      transactionType,
      transactionTagId,
    );
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponse> {
    return await this.transactionService.getTransaction(id);
  }
}
