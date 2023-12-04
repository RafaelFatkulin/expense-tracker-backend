import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
