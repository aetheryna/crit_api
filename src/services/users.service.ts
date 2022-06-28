import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Users } from '../entities/user.entity';
import { genSalt, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private readonly entityManager: EntityManager,
  ) {}

  async registerUser(userParams: any): Promise<void> {
    const { userName, password, email, firstName, lastName } = userParams;
    const salt = await genSalt(5);
    const encryptedPassword = await hash(password, salt);

    const createNewUser = this.entityManager.create(Users, {
      userName: userName,
      password: encryptedPassword,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'user',
      refreshToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.entityManager.save(createNewUser);
  }

  async findUser(loginParams: any): Promise<void> {
    const { email } = loginParams;

    const findUserByEmail: Users | any = await this.entityManager.findOneOrFail(
      Users,
      {
        where: { email: email },
      },
    );

    return findUserByEmail;
  }

  async findAndUpdateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken: refreshToken,
    });
  }
}
