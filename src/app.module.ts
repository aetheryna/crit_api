import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { Connection } from 'typeorm';

import ormconfig from './config/ormconfig';
import { HelloWorldController } from './controllers/hello-world.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../env']
    }),
    TypeOrmModule.forRoot(ormconfig)
  ],
  controllers: [HelloWorldController],
  providers: [],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
