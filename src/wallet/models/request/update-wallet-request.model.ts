import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateWalletRequest {
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(48)
  @MinLength(4)
  name?: string;
}
