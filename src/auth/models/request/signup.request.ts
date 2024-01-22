import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  // alphanumeric characters and - are valid
  // you can change this as you like
  @Matches(RegExp('^[a-zA-Z0-9\\-]+$'))
  @MaxLength(255)
  @MinLength(8)
  username: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
