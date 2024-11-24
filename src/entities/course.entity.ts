import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  courseID: number;

  @Column()
  name: string;

  @Column()
  creditHr: number;

  @Column()
  mode: string;
}
