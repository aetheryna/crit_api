import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from 'src/controllers/users.controller';
import { UsersService } from 'src/services/users.service';
import { Users } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UsersService],
  controllers: [UsersController],
  exports:[UsersService],
})
export class UsersModule {}
