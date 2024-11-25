import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Teacher } from 'src/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Teacher])],
  providers: [TeacherService],
  controllers: [TeacherController]
})
export class TeacherModule {}
