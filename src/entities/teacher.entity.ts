import { Entity, PrimaryGeneratedColumn, OneToOne, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  teacherID: number;

  @OneToOne(() => User, (user: User) => user.userID)
  userID: number;

  @Column()
  position: string;

  @Column()
  officeLocation: string;
}
