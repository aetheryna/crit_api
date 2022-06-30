import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { Users } from 'src/entities/user.entity';
import { HttpExceptionFilter } from 'src/http-exception-filter';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { hash, genSalt } from 'bcrypt';

export async function createNestAppInstance(): Promise<INestApplication> {
  let app: INestApplication;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    providers: [],
  }).compile();

  // eslint-disable-next-line prefer-const
  app = moduleRef.createNestApplication();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  return app;
}

export async function createNestAppInstanceWithENVMock(): Promise<{
  app: INestApplication;
  mockConfig: DeepMocked<ConfigService>;
}> {
  let app: INestApplication;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    providers: [
      {
        provide: ConfigService,
        useValue: createMock<ConfigService>(),
      },
    ],
  }).compile();

  // eslint-disable-next-line prefer-const
  app = moduleRef.createNestApplication();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  return { app, mockConfig: moduleRef.get(ConfigService) };
}

export async function clearDB() {
  const entities = getConnection().entityMetadatas;
  for (const entity of entities) {
    const repository = getConnection().getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
}

export async function createUser(
  nestApp,
  { username, email, firstname, lastname, password }: any,
) {
  let userRepository: Repository<Users>;

  const salt = await genSalt(5);
  const encryptedPassword = await hash('password' || password, salt);

  // eslint-disable-next-line prefer-const
  userRepository = nestApp.get('UsersRepository');

  const user = await userRepository.save(
    userRepository.create({
      userName: username || 'TestAccount',
      password: encryptedPassword,
      firstName: firstname || 'Test',
      lastName: lastname || 'Account',
      email: email || 'dev@crit.io',
      role: 'user',
      refreshToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  );

  return user;
}
