import { Decimal } from '@prisma/client/runtime';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWalletRequest {
  @IsString()
  @MaxLength(48)
  @MinLength(4)
  name: string;

  @IsOptional()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  balance?: Decimal | number | string | null;
}
