import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Student } from 'src/entities/student.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { Program } from 'src/entities/program.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { Class } from 'src/entities/class.entity';

// const entityList = [
//   Department,
//   User,
//   Program,
//   Course,
//   Admin,
//   Teacher,
//   Student,
//   Class,
//   Assessment,
//   Submission,
//   Schedule,
//   AssessmentFile,
//   Attendance,
//   Enrollment,
//   Invoice,
//   Request,
//   SubmissionFile,
// ];
@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Invoice, Program, Enrollment, Class])],
  controllers: [StudentController],
  providers: [StudentService]
})
export class StudentModule {}
