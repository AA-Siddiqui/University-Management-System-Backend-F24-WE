import { Entity, PrimaryGeneratedColumn, OneToOne, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  adminID: number;

  @ManyToOne(() => User, (user: User) => user.userID)
  userID: number;
}
