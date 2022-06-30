import { INestApplication } from '@nestjs/common';
import { EntityNotFoundError, getManager } from 'typeorm';
import { clearDB, createNestAppInstance, createUser } from '../test.helper';
import { UsersService } from 'src/services/users.service';
import { Users } from 'src/entities/user.entity';
import { genSalt, hash } from 'bcrypt';

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
      const salt = await genSalt(5);
      const encryptedPassword = await hash(password, salt);

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

    it('should return an error if the email or username is already taken', async () => {
      await service.registerUser(userData);

      try {
        await service.registerUser(userData);
      } catch (error) {
        expect(error).toEqual(
          new Error(
            'duplicate key value violates unique constraint "UQ_user_email"',
          ),
        );
      }
    });

    it('should return an error if fields are empty', async () => {
      expect(async () => await service.registerUser({})).rejects.toThrowError(
        Error,
      );
    });

    it('should find a user', async () => {
      const createdUser = await createUser(nestApp, {
        email: 'testEmail@crit.io',
      });

      const findUser = await service.findUser({ email: createdUser.email });

      expect(findUser).toEqual(createdUser);
      expect(typeof findUser).toEqual('object');
      expect(findUser).toBeTruthy();
    });

    it('should fail trying to find a non-existent user', async () => {
      expect(
        async () => await service.findUser('randomEmailShouldFail@crit.io'),
      ).rejects.toThrowError(EntityNotFoundError);
    });

    it('should update a users refresh token', async () => {
      const createdUser = await createUser(nestApp, {});

      await service.findAndUpdateUserRefreshToken(
        createdUser.user_id,
        '1234-1234-1234-1234',
      );

      const manager = getManager();
      const findRefreshtoken = manager.findOne(Users, {
        where: { user_id: createdUser.user_id },
      });

      expect((await findRefreshtoken).refreshToken).toEqual(
        '1234-1234-1234-1234',
      );
    });
  });

  afterAll(async () => {
    await nestApp.close();
  });
});
