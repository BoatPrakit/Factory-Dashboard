import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthenticationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
