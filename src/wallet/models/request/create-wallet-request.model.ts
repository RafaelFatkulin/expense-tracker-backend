import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWalletRequest {
  @IsNotEmpty()
  @IsString()
  @MaxLength(48)
  @MinLength(4)
  title: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
