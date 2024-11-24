import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Student } from './student.entity';
import { Schedule } from './schedule.entity';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  attendanceID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID)
  studentID: number;

  @ManyToOne(() => Schedule, (schedule: Schedule) => schedule.scheduleID)
  scheduleID: number;

  @Column({ default: true })
  present: boolean;
}
