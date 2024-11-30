import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Student } from './student.entity';
import { Assessment } from './assessment.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  submissionID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID, { onDelete: 'CASCADE' })
  studentID: number;

  @ManyToOne(() => Assessment, (assessment: Assessment) => assessment.assessmentID, { onDelete: 'CASCADE' })
  assessmentID: number;

  @Column()
  marks: number;
}
