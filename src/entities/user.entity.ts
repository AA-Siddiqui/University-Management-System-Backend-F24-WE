import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Department } from './department.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userID: number;

  @ManyToOne(() => Department, (department: Department) => department.departmentID, { onDelete: 'CASCADE' })
  departmentID: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  gender: string;

  @Column()
  dob: Date;

  @Column()
  phone: string;

  @Column()
  emergencyPhone: string;

  @Column()
  address: string;

  @Column()
  joinDate: Date;

  @Column()
  role: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
