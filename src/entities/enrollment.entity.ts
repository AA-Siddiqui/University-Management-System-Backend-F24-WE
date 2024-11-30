import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { Class } from './class.entity';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  enrollmentID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID, { onDelete: 'CASCADE' })
  studentID: number;

  @ManyToOne(() => Class, (classI: Class) => classI.classID, { onDelete: 'CASCADE' })
  classID: number;
}
