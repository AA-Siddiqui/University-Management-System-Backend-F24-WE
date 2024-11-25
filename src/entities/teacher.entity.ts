import { Entity, PrimaryGeneratedColumn, OneToOne, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  teacherID: number;

  @ManyToOne(() => User, (user: User) => user.userID)
  userID: number;

  @Column()
  position: string;

  @Column()
  officeLocation: string;
}
