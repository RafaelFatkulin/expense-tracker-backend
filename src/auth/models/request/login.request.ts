import { IsBoolean, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  remember: boolean;
}
