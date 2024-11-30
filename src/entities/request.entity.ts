import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Student } from './student.entity';
import { Class } from './class.entity';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  requestID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID, { onDelete: 'CASCADE' })
  studentID: number;

  @ManyToOne(() => Class, (classI: Class) => classI.classID, { onDelete: 'CASCADE' })
  classID: number;

  @Column({ nullable: true })
  approved: boolean;
}
