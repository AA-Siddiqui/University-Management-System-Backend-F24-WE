import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { Assessment } from './assessment.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  submissionID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID)
  studentID: number;

  @ManyToOne(() => Assessment, (assessment: Assessment) => assessment.assessmentID)
  assessmentID: number;
}
