import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Course } from './course.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  classID: number;

  @ManyToOne(() => Teacher, (teacher: Teacher) => teacher.teacherID)
  teacherID: number;

  @ManyToOne(() => Course, (course: Course) => course.courseID)
  courseID: number;

  @Column()
  term: string;

  @Column()
  section: string;
}
