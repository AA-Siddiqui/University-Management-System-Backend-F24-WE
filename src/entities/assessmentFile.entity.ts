import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity()
export class AssessmentFile {
  @PrimaryGeneratedColumn()
  assessmentFileID: number;

  @ManyToOne(() => Assessment, (assessment: Assessment) => assessment.assessmentID, { onDelete: 'CASCADE' })
  assessmentID: number;

  @Column()
  name: string;
}
