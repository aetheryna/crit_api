import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { Connection } from 'typeorm';

import ormconfig from './config/ormconfig';
import { HelloWorldController } from './controllers/hello-world.controller';

import { SeedsModule } from './modules/seeds/seeds.module'

import { SeedsService } from '@services/seeds.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../env']
    }),
    TypeOrmModule.forRoot(ormconfig),
    SeedsModule
  ],
  controllers: [HelloWorldController],
  providers: [SeedsService],
})

export class AppModule {
  constructor(private connection: Connection) {}

  onModuleInit(): void {
    console.log('Initializing CRIT Server');
  }

  onApplicationBootstrap(): void {
    console.log('Server started!');
  }
}
