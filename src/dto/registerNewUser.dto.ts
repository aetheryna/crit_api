import { IsString, IsEmail, Length } from "class-validator";

export class RegisterNewUser {
  @IsString()
  username: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  @Length(8, 25)
  password: string;

  @IsEmail()
  email: string;
}
