import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterNewUser } from 'src/dto/registerNewUser.dto';
import { UsersService } from 'src/services/users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/register-user')
  async registerUser(@Body() registerNewUser: RegisterNewUser) {
    const { username, firstname, lastname, password, email } = registerNewUser

    const createUser = await this.usersService.registerUser({
      userName: username,
      firstName: firstname,
      lastName: lastname,
      password: password,
      email: email,
    }).catch(error => {
      if (error.code === '23505' && error.constraint === 'UQ_user_email')
        throw new HttpException('Email is already in use, please try another email', HttpStatus.UNPROCESSABLE_ENTITY)
    })

    return 'User created';
  }
}
