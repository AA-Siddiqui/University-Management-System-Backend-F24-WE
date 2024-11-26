import { Controller, Get, Param, Req } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Get("dashboard/:id")
  async getStudent(@Param('id') id: number) {
    return await this.studentService.getStudent(id);
  }

  @Get("invoice/:id")
  async getInvoice(@Param('id') id: number) {
    return await this.studentService.getInvoice(id);
  }

  @Get("upcomingActivities/:id")
  async getUpcomingActivites(@Param('id') id: number) {
    return await this.studentService.getUpcomingActivities(id);
  }
}
