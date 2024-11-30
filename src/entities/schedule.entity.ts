import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Class } from './class.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  scheduleID: number;

  @ManyToOne(() => Class, (classI: Class) => classI.classID, { onDelete: 'CASCADE' })
  classID: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  venue: string;
}
