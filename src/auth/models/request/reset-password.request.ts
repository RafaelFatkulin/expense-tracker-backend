import { IsNotEmpty, Length, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordRequest {
  @IsNotEmpty()
  @Length(21)
  token: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
