import { BadRequestException, INestApplication } from '@nestjs/common';
import { clearDB, createUser, createNestAppInstance } from '../test.helper';
import { AuthService } from '@services/auth/auth.service';

let nestApp: INestApplication;
let service: AuthService;

beforeEach(async () => {
  await clearDB();
});

beforeAll(async () => {
  nestApp = await createNestAppInstance();
  service = nestApp.get<AuthService>(AuthService);
});

describe('Authenticate', () => {
  it('should validate if the user password is accepted', async () => {
    const userData = await createUser(nestApp, {});

    const verifyUser = await service.validateUser(userData.email, 'password');

    expect(verifyUser).toStrictEqual(userData);
  });

  it('should not validate the user if password is incorrect', async () => {
    const userData = await createUser(nestApp, {});

    const verifyUser = await service.validateUser(userData.email, 'passwordd');

    expect(verifyUser).toBe(false);
  });

  it('should not be able to find the user', async () => {
    expect(
      async () => await service.validateUser('fakeEmail@email.io', 'passwordd'),
    ).rejects.toThrowError(
      new BadRequestException('fakeEmail@email.io does not exist'),
    );
  });

  it('should generate a JWT token', async () => {
    const generateJWT = await service.generateJWT({
      user_id: '1234',
      email: 'testemail@crit.io',
    });

    expect(typeof generateJWT.access_token).toBe('string');
  });
});

afterAll(async () => {
  await nestApp.close();
});
