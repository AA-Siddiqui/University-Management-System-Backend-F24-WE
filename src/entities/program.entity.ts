import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Department } from './department.entity';

@Entity()
export class Program {
  @PrimaryGeneratedColumn()
  programID: number;

  @ManyToOne(() => Department, (department: Department) => department.departmentID)
  departmentID: number;

  @Column()
  level: string;

  @Column()
  name: string;
}
