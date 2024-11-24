import { Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  adminID: number;

  @OneToOne(() => User, (user: User) => user.userID)
  userID: number;
}
