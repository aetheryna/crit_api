import { Controller, Get } from '@nestjs/common';

@Controller('hello-world')
export class HelloWorldController {
  @Get()
  printHelloWorld(): string {
    return 'Hello World'
  }
}
