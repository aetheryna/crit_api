import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersService } from 'src/services/users.service'
import { UsersController } from 'src/controllers/users.controller'
import { User } from 'src/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})

export class UsersModule {}
