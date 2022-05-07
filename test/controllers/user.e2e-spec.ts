import * as request from 'supertest';
import { getManager } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { clearDB, createNestAppInstanceWithENVMock } from '../test.helper';
import { Users } from 'src/entities/user.entity';

describe('Users Controller', () => {
  let app: INestApplication;
  let mockConfig;

  beforeEach(async () => {
    await clearDB();
  });

  beforeAll(async () => {
    jest.setTimeout(10000);

    ({ app, mockConfig } = await createNestAppInstanceWithENVMock());
  });

  describe('POST /api/users/register-user', () => { 
    it ('should register a new user', async () => {
      const userData = {
        username: 'TestUser',
        firstname: 'Test',
        lastname: 'User',
        email: 'testuser@crit.io',
        password: 'password'
      }

      const response = await request(app.getHttpServer())
        .post('/api/users/register-user')
        .send(userData);

      expect(response.statusCode).toBe(201)

      const createdUser = await getManager().findOneOrFail(Users, { where: { email: userData.email }})
      
      expect(createdUser.email).toEqual('testuser@crit.io')
    })
  })

  afterAll(async () => {
    await app.close();
  });
})
