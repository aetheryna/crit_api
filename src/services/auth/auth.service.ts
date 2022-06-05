import { Dependencies, Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@services/users.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Dependencies(UsersService, JwtService)
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

    const verify = await bcrypt.compare(password, foundUser.password);

    if (verify) return foundUser;

    return false;
  }

  async generateJWT(user: any) {
    const convertToJWTToken = {
      user_id: user.user_id,
      email: user.email,
      role: 'user',
    };

    return {
      access_token: this.jwtService.sign(convertToJWTToken),
    };
  }
}
