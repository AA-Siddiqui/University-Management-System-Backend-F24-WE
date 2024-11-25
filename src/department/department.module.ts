import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
  ],
  providers: [DepartmentService],
  controllers: [DepartmentController]
})
export class DepartmentModule {}
