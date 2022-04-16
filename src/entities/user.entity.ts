import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({default: () => 'now()', name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({default: () => 'now()', name: 'updated_at'})
  updatedAt: Date;
}
