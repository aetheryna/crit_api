import { Controller, Get } from '@nestjs/common';

@Controller('hello-world')
export class HelloWorldController {
  @Get()
  helloWorld(): string {
    return 'Hello world!';
  }
}
