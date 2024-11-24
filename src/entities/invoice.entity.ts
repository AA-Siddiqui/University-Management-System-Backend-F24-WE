import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Student } from './student.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  invoiceID: number;

  @ManyToOne(() => Student, (student: Student) => student.studentID)
  studentID: number;

  @Column()
  description: string;

  @Column()
  amount: number;
}
