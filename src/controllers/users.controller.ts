import { Controller, Get } from '@nestjs/common';

@Controller('api/users')
export class UsersController {
  @Get()
  helloWorld(): string {
    return 'This is the users API'
  }
}
