import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentFile } from './entities/assessmentFile.entity';
import { Attendance } from './entities/attendance.entity';
import { Class } from './entities/class.entity';
import { Course } from './entities/course.entity';
import { Department } from './entities/department.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Invoice } from './entities/invoice.entity';
import { Program } from './entities/program.entity';
import { Request } from './entities/request.entity';
import { Schedule } from './entities/schedule.entity';
import { Student } from './entities/student.entity';
import { Submission } from './entities/submission.entity';
import { SubmissionFile } from './entities/submissionFile.entity';
import { Teacher } from './entities/teacher.entity';
import { User } from './entities/user.entity';
import { DepartmentController } from './department/department.controller';
import { DepartmentModule } from './department/department.module';
import { StudentModule } from './student/student.module';

const entityList = [
  Department,
  User,
  Program,
  Course,
  Admin,
  Teacher,
  Student,
  Class,
  Assessment,
  Submission,
  Schedule,
  AssessmentFile,
  Attendance,
  Enrollment,
  Invoice,
  Request,
  SubmissionFile,
];
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'project_ums',
      // entities: [__dirname + '//*.entity{.ts,.js}'],
      // entities: [
      //   Admin, 
      //   Assessment, 
      //   AssessmentFile,
      //   Attendance,
      //   Class,
      //   Course,
      //   Department,
      //   Enrollment,
      //   Invoice,
      //   Program,
      //   Request,
      //   Schedule,
      //   Student,
      //   Submission,
      //   SubmissionFile,
      //   Teacher,
      //   User
      // ],
      entities: entityList,
      synchronize: true, // set to false in production
    }),
    // TypeOrmModule.forFeature(entityList),
    AuthModule,
    DepartmentModule,
    StudentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
