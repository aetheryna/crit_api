import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginUser } from 'src/dto/loginUser.dto';
import { RegisterNewUser } from 'src/dto/registerNewUser.dto';
import { UsersService } from 'src/services/users.service';
import { AuthService } from 'src/services/auth/auth.service';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { GetCurrentUser } from 'src/common/decorators/getCurrentUser.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
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

  @Public()
  @Post('/login-user')
  async loginUser(@Body() loginUser: LoginUser) {
    const verifyLoginAndReturnUser = await this.authService.validateUser(
      loginUser.email,
      loginUser.password,
    );

    if (verifyLoginAndReturnUser) {
      return await this.authService.assignAuthTokens(verifyLoginAndReturnUser);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logoutUser(@GetCurrentUser('sub') userId: string) {
    return await this.authService.logoutUser(userId);
  }

  @Post('/get-user-details')
  async getUserDetails(@Req() request: Request) {
    return await this.usersService.findUser(request.body);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUser('email') email: string,
  ) {
    return await this.authService.refreshTokens(email, refreshToken);
  }
}
