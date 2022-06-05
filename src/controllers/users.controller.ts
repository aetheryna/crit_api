import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUser } from 'src/dto/loginUser.dto';
import { RegisterNewUser } from 'src/dto/registerNewUser.dto';
import { UsersService } from 'src/services/users.service';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/register-user')
  async registerUser(@Body() registerNewUser: RegisterNewUser) {
    const { username, firstname, lastname, password, email } = registerNewUser;

    await this.usersService
      .registerUser({
        userName: username,
        firstName: firstname,
        lastName: lastname,
        password: password,
        email: email,
      })
      .catch((error) => {
        if (error.code === '23505' && error.constraint === 'UQ_user_email')
          throw new HttpException(
            'Email is already in use, please try another email',
            HttpStatus.BAD_REQUEST,
          );
      });

    return 'User created';
  }

  @Post('/login-user')
  async loginUser(@Body() loginUser: LoginUser) {
    const verifyLogin = await this.authService.validateUser(
      loginUser.email,
      loginUser.password,
    );

    if (verifyLogin) return await this.authService.generateJWT(loginUser);
    else throw new UnauthorizedException();
  }
}
