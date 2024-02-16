import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class LoginRequest {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsBoolean()
  @IsOptional()
  remember: boolean;
}
