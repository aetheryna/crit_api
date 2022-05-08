import * as request from 'supertest';
import { getManager } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { clearDB, createNestAppInstanceWithENVMock } from '../test.helper';
import { Users } from 'src/entities/user.entity';

describe('Users Controller', () => {
  let app: INestApplication;
  let mockConfig;

  const userData = {
    username: 'TestUser',
    firstname: 'Test',
    lastname: 'User',
    email: 'testuser@crit.io',
    password: 'password'
  }

  beforeEach(async () => {
    await clearDB();
  });

  beforeAll(async () => {
    ({ app, mockConfig } = await createNestAppInstanceWithENVMock());
  });

  describe('POST /api/users/register-user', () => { 
    it ('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(userData);

      expect(response.statusCode).toBe(201)

      const createdUser = await getManager().findOneOrFail(Users, { where: { email: userData.email }})
      
      expect(createdUser.email).toEqual('testuser@crit.io')
    })

    it ('should return a 400 error when fields are empty', async () => {
      const emptyData = {}

      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(emptyData)

      expect(response.statusCode).toBe(400)
      expect(response.body.message.message).toStrictEqual([
        "username must be a string",
        "firstname must be a string",
        "lastname must be a string",
        "password must be longer than or equal to 8 characters",
        "password must be a string",
        "email must be an email"
      ])
    })

    it ('should return a 422 error when fields are similar to DB', async () => {
      const firstSend = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(userData)

      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(userData)

      expect(response.statusCode).toBe(422)
      expect(response.body.message).toStrictEqual('Email is already in use, please try another email')
    })
  })

  afterAll(async () => {
    await app.close();
  });
})
