import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterNewUser } from 'src/dto/registerNewUser.dto';
import { LoginUser } from 'src/dto/loginUser.dto';
import { UsersService } from 'src/services/users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  @UseGuards(AuthGuard('local'))
  @Post('/login-user')
  async loginUser(@Body() loginUser: LoginUser) {
    const { email, password } = loginUser

    // if (!email) {
    //   throw new BadRequestException('Email cannot be empty')
    // }

    // if (!password) {
    //   throw new BadRequestException('Password cannot be empty')
    // }

    // await this.usersService
    //   .findUser({
    //     email: email,
    //   })
    //   .catch(error => {
    //     throw new HttpException(error, HttpStatus.BAD_REQUEST)
    //   })

    return {
      email: email,
      message: "Found user"
    }
  }
}
