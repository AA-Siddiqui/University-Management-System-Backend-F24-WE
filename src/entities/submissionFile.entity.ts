import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Submission } from './submission.entity';

@Entity()
export class SubmissionFile {
  @PrimaryGeneratedColumn()
  submissionFileID: number;

  @ManyToOne(() => Submission, (submission: Submission) => submission.submissionID)
  submissionID: number;

  @Column()
  name: string;
}
