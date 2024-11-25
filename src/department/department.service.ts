import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/entities/department.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(@InjectRepository(Department) private readonly departmentRespository: Repository<Department>) {}

  async getDepartments() {
    return await this.departmentRespository.find();
  }
}
