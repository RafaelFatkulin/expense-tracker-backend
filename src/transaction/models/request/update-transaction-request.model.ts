import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Prisma, TransactionType } from '@prisma/client';

export class UpdateTransactionRequest {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @MinLength(4)
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsNotEmpty()
  @IsOptional()
  @IsDecimal()
  amount?: Prisma.Decimal;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  walletId?: number;
}
