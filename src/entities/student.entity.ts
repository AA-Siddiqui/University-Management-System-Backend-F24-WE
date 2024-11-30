import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Program } from './program.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  studentID: number;

  @ManyToOne(() => User, (user: User) => user.userID, { onDelete: 'CASCADE' })
  userID: number;

  @ManyToOne(() => Program, (program: Program) => program.programID, { onDelete: 'CASCADE' })
  programID: number;

  @Column()
  rollNo: string;
}
