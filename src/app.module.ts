import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Connection } from 'typeorm';

import ormconfig from '../ormconfig';

import { SeedsModule } from './modules/seeds/seeds.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { SeedsService } from '@services/seeds.service';
import { AccessTokenGuard } from './common/guards/accessToken.guard';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
  }),
  TypeOrmModule.forRoot(ormconfig),
  SeedsModule,
  AuthModule,
  UsersModule,
];

@Module({
  imports,
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    SeedsService,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}

  onModuleInit(): void {
    console.log('Initializing CRIT Server ✍🏻');
  }

  onApplicationBootstrap(): void {
    console.log('Server started! 🚀');
  }
}
