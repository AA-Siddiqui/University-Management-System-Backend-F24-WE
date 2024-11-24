import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { Class } from './class.entity';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  requestID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID)
  studentID: number;

  @ManyToOne(() => Class, (classI: Class) => classI.classID)
  classID: number;
}
