import { Dependencies, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt"
import { UsersService } from "@services/users.service";
const bcrypt = require('bcrypt');

@Dependencies(UsersService, JwtService)
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, 
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const foundUser: any = await this.usersService.findUser({ email })

    const verify = await bcrypt.compare(password, foundUser.password)

    // return await bcrypt.compare(password, foundUser.password, (error, result) => {
    //   if (result == true) {
    //     return result
    //   } else {
    //     return error
    //   }
    // })

    if(verify)
      return foundUser

    return false
  }

  async authenticateLogin(user) {
    const payload = {email: user.email, user_id: user.user_id}
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
