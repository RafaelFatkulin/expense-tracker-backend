import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTransactionTagRequest {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(4)
  title: string;

  @IsOptional()
  @IsHexColor()
  color: string;
}
