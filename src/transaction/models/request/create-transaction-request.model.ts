import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Prisma, TransactionType } from '@prisma/client';

export class CreateTransactionRequest {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(4)
  title: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  @IsDecimal()
  amount: Prisma.Decimal;

  @IsNotEmpty()
  @IsNumber()
  walletId: number;

  @IsNotEmpty()
  @IsNumber()
  transactionTagId: number;
}
