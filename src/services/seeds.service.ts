import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm/entity-manager/EntityManager'
import { User } from '../entities/user.entity'

@Injectable()
export class SeedsService {
  constructor (private readonly entityManager: EntityManager) {}

  async perform() :Promise<void> {
    const newUser = this.entityManager.create(User, {
      firstName: 'The',
      lastName: 'Developer',
      userName: 'NestJs',
      password: 'password',
      email: 'developer@nestjs.react',
    })

    await this.entityManager.save(newUser)
  }
}
