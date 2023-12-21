import { IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';

export class UpdateUserRequest {
  @IsOptional()
  @IsNotEmpty()
  @Matches(RegExp('^[a-zA-Z0-9\\-]+$'))
  @MaxLength(20)
  username?: string;

  @IsOptional()
  @IsNotEmpty()
  @Matches(RegExp('^[a-zA-Zа-яёА-ЯЁ]+$'))
  @MaxLength(20)
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  @Matches(RegExp('^[a-zA-Zа-яёА-ЯЁ]+$'))
  @MaxLength(40)
  lastName?: string;

  @IsOptional()
  @MaxLength(40)
  @Matches(RegExp('^([a-zA-Zа-яёА-ЯЁ]+)?$'))
  middleName?: string;
}
