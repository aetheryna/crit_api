import { INestApplication } from '@nestjs/common';
import { getManager } from 'typeorm'
import { clearDB, createNestAppInstance } from '../test.helper';
import { UsersService } from 'src/services/users.service';
import { Users } from 'src/entities/user.entity';
const bcrypt = require('bcrypt')

describe('Users Service', () => { 
  let nestApp: INestApplication;
  let service: UsersService;

  beforeEach(async () => {
    await clearDB();
  })

  beforeAll(async () => {
    jest.setTimeout(10000);

    nestApp = await createNestAppInstance();
    service = nestApp.get<UsersService>(UsersService);
  })

  describe('Create', () => {
    it('should encrypt the password', async () => {
      const password = "password";
      const salt = await bcrypt.genSalt(5)
      const encryptedPassword = await bcrypt.hash(password, salt)

      expect(encryptedPassword).toBeTruthy()
    })

    it('should create a new user', async () => {
      await service.registerUser({
        userName: 'TestUser',
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
        email: 'testuser@crit.io'
      });

      const manager = getManager();
      const createdUser = await manager.findOneOrFail(Users, {where: {email: 'testuser@crit.io'}})

      expect(createdUser.firstName).toEqual('Test');
      expect(createdUser.lastName).toEqual('User');
      expect(createdUser.userName).toEqual('TestUser');
    })
  })

  afterAll(async () => {
    await nestApp.close();
  });
});
