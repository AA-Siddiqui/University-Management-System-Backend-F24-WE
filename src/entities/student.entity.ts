import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Program } from './program.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  studentID: number;

  @OneToOne(() => User, (user: User) => user.userID)
  userID: number;

  @ManyToOne(() => Program, (program: Program) => program.programID)
  programID: number;

  @Column()
  rollNo: string;
}
