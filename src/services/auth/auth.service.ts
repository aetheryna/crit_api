import {
  Dependencies,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@services/users.service';
import { compare } from 'bcrypt';

@Dependencies(UsersService, JwtService, ConfigService)
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const foundUser: any = await this.usersService
      .findUser({ email })
      .catch(() => {
        throw new BadRequestException({
          status: 400,
          message: email + ' does not exist',
        });
      });

    const verify = await compare(password, foundUser.password);

    if (verify) return foundUser;

    return false;
  }

  async signTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRE'),
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async assignAuthTokens(user: any) {
    const signedTokens = await this.signTokens(
      user.user_id,
      user.email,
      user.role,
    );

    await this.usersService.findAndUpdateUserRefreshToken(
      user.user_id,
      signedTokens.refresh_token,
    );

    return signedTokens;
  }

  async logoutUser(userId: string) {
    await this.usersService.findAndUpdateUserRefreshToken(userId, '');

    return 'User logged out';
  }

  async refreshTokens(email: string, refreshToken: string) {
    const foundUser: any = await this.usersService.findUser({ email });

    if (!foundUser) throw new ForbiddenException();

    if (foundUser.refreshToken !== refreshToken) throw new ForbiddenException();

    return await this.assignAuthTokens(foundUser);
  }
}
