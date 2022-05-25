import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'
import { AuthService } from 'src/services/auth/auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { LocalStrategy } from 'src/services/auth/local.strategy'
import { JwtService } from "@nestjs/jwt"

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy, JwtService]
})
export class AuthModule {}
