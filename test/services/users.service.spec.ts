import { INestApplication } from '@nestjs/common';
import { getManager, TypeORMError } from 'typeorm';
import { clearDB, createNestAppInstance } from '../test.helper';
import { UsersService } from 'src/services/users.service';
import { Users } from 'src/entities/user.entity';
const bcrypt = require('bcrypt');

describe('Users Service', () => {
  let nestApp: INestApplication;
  let service: UsersService;

  const userData = {
    userName: 'TestUser',
    firstName: 'Test',
    lastName: 'User',
    password: 'password',
    email: 'testuser@crit.io',
  };

  beforeEach(async () => {
    await clearDB();
  });

  beforeAll(async () => {
    nestApp = await createNestAppInstance();
    service = nestApp.get<UsersService>(UsersService);
  });

  describe('Create', () => {
    it('should encrypt the password', async () => {
      const password = 'password';
      const salt = await bcrypt.genSalt(5);
      const encryptedPassword = await bcrypt.hash(password, salt);

      expect(encryptedPassword).toBeTruthy();
    });

    it('should create a new user', async () => {
      await service.registerUser(userData);

      const manager = getManager();
      const createdUser = await manager.findOneOrFail(Users, {
        where: { email: 'testuser@crit.io' },
      });

      expect(createdUser.firstName).toEqual('Test');
      expect(createdUser.lastName).toEqual('User');
      expect(createdUser.userName).toEqual('TestUser');
    });

    it('should return an error if the email is already taken', async () => {
      await service.registerUser(userData);

      expect(
        async () => await service.registerUser(userData),
      ).rejects.toThrowError(TypeORMError);
    });

    it('should return an error if fields are empty', async () => {
      expect(async () => await service.registerUser({})).rejects.toThrowError(
        Error,
      );
    });
  });

  afterAll(async () => {
    await nestApp.close();
  });
});
