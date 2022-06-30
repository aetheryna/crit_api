import * as request from 'supertest';
import { getManager } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import {
  clearDB,
  createUser,
  createNestAppInstanceWithENVMock,
} from '../test.helper';
import { Users } from 'src/entities/user.entity';

describe('Users Controller', () => {
  let app: INestApplication;
  let mockConfig;

  const userData = {
    username: 'TestUser',
    email: 'testuser@crit.io',
    firstname: 'Test',
    lastname: 'User',
    password: 'password',
  };

  beforeEach(async () => {
    await clearDB();
  });

  beforeAll(async () => {
    ({ app, mockConfig } = await createNestAppInstanceWithENVMock());
  });

  describe('POST /api/users/register-user', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(userData);

      expect(response.statusCode).toBe(201);

      const createdUser = await getManager().findOneOrFail(Users, {
        where: { email: userData.email },
      });

      expect(createdUser.email).toEqual('testuser@crit.io');
    });

    it('should return a 400 error when fields are empty', async () => {
      const emptyData = {};

      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(emptyData);

      expect(response.statusCode).toBe(400);
      expect(response.body.message.message).toStrictEqual([
        'username must be a string',
        'firstname must be a string',
        'lastname must be a string',
        'password must be longer than or equal to 8 characters',
        'password must be a string',
        'email must be an email',
      ]);
    });

    it('should return a 400 error when username is already taken', async () => {
      await createUser(app, userData);

      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toStrictEqual(
        'Username is already in use, please try another username',
      );
    });

    it('should return a 400 error when email is already taken', async () => {
      await createUser(app, userData);

      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send({
          username: 'newTestUser',
          email: 'testuser@crit.io',
          firstname: 'Test',
          lastname: 'User',
          password: 'password',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toStrictEqual(
        'Email is already in use, please try another email',
      );
    });
  });

  describe('POST /api/users/login-user', () => {
    it('should return an error if fields are empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login-user')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message.message).toStrictEqual([
        'email must be an email',
        'password must be a string',
      ]);
    });

    it('should return an error if the email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login-user')
        .send({
          email: 'fakeEmail@email.io',
          password: 'password',
        });

      expect(response.body.message.message).toStrictEqual(
        'fakeEmail@email.io does not exist',
      );
    });

    it('should verify the user and return an access and refresh token', async () => {
      await createUser(app, { email: 'testaccount@email.io' });

      const response = await request(app.getHttpServer())
        .post('/api/users/login-user')
        .send({
          email: 'testaccount@email.io',
          password: 'password',
        });

      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(typeof response.body).toBe('object');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
