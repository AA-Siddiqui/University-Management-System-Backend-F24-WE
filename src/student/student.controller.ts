import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
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

  @Get("results/:id")
  async getResults(@Param('id') id: number) {
    return await this.studentService.getResults(id);
  }

  @Get("enroll/:id")
  async getEnrollables(@Param('id') id: number) {
    return await this.studentService.getEnrollables(id);
  }

  @Post("enroll/:studentID&:classID")
  async sendEnrollmentRequest(
    @Param('studentID') studentID: number,
    @Param('classID') classID: number,
  ) {
    return this.studentService.sendEnrollmentRequest(studentID, classID);
  }
}
