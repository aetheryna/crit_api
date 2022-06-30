import {
  BadRequestException,
  ForbiddenException,
  INestApplication,
} from '@nestjs/common';
import { getManager } from 'typeorm';
import { clearDB, createUser, createNestAppInstance } from '../test.helper';
import { AuthService } from '@services/auth/auth.service';
import { Users } from 'src/entities/user.entity';

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

  it('should generate an access and refresh token and update refresh token on the user', async () => {
    const createdUser = await createUser(nestApp, {});

    const generateTokens = await service.assignAuthTokens({
      user_id: createdUser.user_id,
      email: createdUser.email,
      role: createdUser.role,
    });

    expect(typeof generateTokens.access_token).toBe('string');
    expect(typeof generateTokens.refresh_token).toBe('string');

    const findRefreshToken = await getManager().findOneOrFail(Users, {
      where: { user_id: createdUser.user_id },
    });

    expect(findRefreshToken.refreshToken).toEqual(generateTokens.refresh_token);
  });

  it('should refresh existing tokens', async () => {
    const createdUser = await createUser(nestApp, {});

    const generateTokens = await service.assignAuthTokens({
      user_id: createdUser.user_id,
      email: createdUser.email,
      role: createdUser.role,
    });

    const refreshedTokens = await service.refreshTokens(
      createdUser.email,
      generateTokens.refresh_token,
    );

    expect(typeof refreshedTokens.access_token).toBe('string');
    expect(typeof refreshedTokens.refresh_token).toBe('string');
    expect(
      await service.refreshTokens(
        createdUser.email,
        generateTokens.refresh_token,
      ),
    ).not.toEqual(generateTokens.refresh_token);
  });

  it('should return a forbidden exception if user cannot be found and tokens refreshed', async () => {
    expect(
      async () =>
        await service.refreshTokens('randomTestEmail@email.io', '123456789'),
    ).rejects.toThrowError(new ForbiddenException('Access denied'));
  });

  it('should return a forbidden acception if the refresh token does not match the user', async () => {
    const createdUser = await createUser(nestApp, {});

    try {
      await service.refreshTokens(createdUser.email, '123456789');
    } catch (error) {
      expect(error).toEqual(new ForbiddenException('Access denied'));
    }
  });
});

afterAll(async () => {
  await nestApp.close();
});
