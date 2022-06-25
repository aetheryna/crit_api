import { Dependencies, Injectable, BadRequestException } from '@nestjs/common';
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
          expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE') || 60 * 15,
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
          expiresIn:
            this.configService.get('REFRESH_TOKEN_EXPIRE') || 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async generateJWT(user: any) {
    return this.signTokens(user.user_id, user.email, 'user');
  }
}
