import { Module } from '@nestjs/common';
import { HelloWorldController } from './controllers/hello-world/hello-world.controller';

@Module({
  imports: [],
  controllers: [HelloWorldController],
  providers: [],
})

export class AppModule {}
