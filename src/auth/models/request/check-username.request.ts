import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CheckUsernameRequest {
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(8)
  username: string;
}
