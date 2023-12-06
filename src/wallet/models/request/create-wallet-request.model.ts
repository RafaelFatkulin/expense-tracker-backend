import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Prisma } from '@prisma/client';

export class CreateWalletRequest {
  @IsString()
  @MaxLength(48)
  @MinLength(4)
  name: string;

  @IsOptional()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  balance?: Prisma.Decimal | null;
}
