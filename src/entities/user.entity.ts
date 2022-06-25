import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Index('UQ_username', { unique: true })
  @Column()
  userName: string;

  @Index('UQ_user_email', { unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column()
  refreshToken: string;

  @CreateDateColumn({ default: () => 'now()', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'now()', name: 'updated_at' })
  updatedAt: Date;
}
