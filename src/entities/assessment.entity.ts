import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Class } from './class.entity';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  assessmentID: number;

  @ManyToOne(() => Class, (classI: Class) => classI.classID)
  classID: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  deadline: Date;

  @Column()
  max: number;

  @Column()
  weight: number;
}
