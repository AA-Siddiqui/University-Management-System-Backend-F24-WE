import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Student } from 'src/entities/student.entity';
import { Invoice } from 'src/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Invoice])],
  controllers: [StudentController],
  providers: [StudentService]
})
export class StudentModule {}
