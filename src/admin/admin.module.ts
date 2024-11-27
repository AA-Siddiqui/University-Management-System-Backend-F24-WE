import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Department } from 'src/entities/department.entity';
import { Admin } from 'src/entities/admin.entity';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from 'src/entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Department, Class])],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
