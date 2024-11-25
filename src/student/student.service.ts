import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    @InjectRepository(Student) private readonly studentRespository: Repository<Student>,
    @InjectRepository(Invoice) private readonly invoiceRespository: Repository<Invoice>,
  ) {}

  async getStudent(id: number) {
    const user = await this.userRespository.findOne({where: {userID: id}});
    const student = await this.studentRespository.findOne({where: {userID: user.userID}});
    return {...user, ...student};
  }

  async getInvoice(id: number) {
    const user = await this.userRespository.findOne({where: {userID: id}});
    const student = await this.studentRespository.findOne({where: {userID: user.userID}});
    const invoices = await this.invoiceRespository.find({where: {studentID: student.studentID}});
    return invoices;
  }
}
