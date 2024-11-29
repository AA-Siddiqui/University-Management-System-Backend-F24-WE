import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('dashboard/:id')
  async getDashboard(@Param('id') id: number) {
    return this.adminService.getDashboard(id);
  }

  @Get('requests/:id')
  async getRequests(@Param('id') id: number) {
    return this.adminService.getRequests(id);
  }

  @Put('requests/:requestID')
  async putRequest(
    @Param('requestID') requestID: number,
    @Body('approved') approved: boolean
  ) {
    return this.adminService.putRequest(requestID, approved);
  }

  @Get('classes')
  async getClasses() {
    return await this.adminService.getClasses();
  }

  @Get('getStudentNameByRoll/:rollNo')
  async getNameByRollNo(@Param('rollNo') rollNo: string) {
    return await this.adminService.getNameByRollNo(rollNo);
  }

  @Post('schedule/extra/:classID')
  async postExtraClass(
    @Param("classID") classID: number, 
    @Body('date') date: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
    @Body('venue') venue: string,
  ) {
    const body = {date, startTime, endTime, venue};
    return await this.adminService.postExtraClass(classID, body);
  }

  @Post('enroll/:rollNo&:classID')
  async enrollStudentToClass(
    @Param('rollNo') rollNo: string,
    @Param('classID') classID: number,
  ) {
    return this.adminService.enrollStudentToClass(rollNo, classID);
  }

  @Get('fees/:rollNo')
  async getFees(
    @Param('rollNo') rollNo: string,
  ) {
    return this.adminService.getFees(rollNo);
  }

  @Put('fees/:invoiceID&:amount')
  async clearFees(
    @Param('invoiceID') invoiceID: number,
    @Param('amount') amount: number
  ) {
    return this.adminService.clearFees(invoiceID, amount);
  }

  @Post('fees/add/student')
  async addFeesStudent(
    @Body() formData
  ) {
    return this.adminService.addFeesStudent(formData);
  }

  @Post('fees/add/term/:term&:amount&:description&:dueDate')
  async generateFeeForTerm(
    @Param('term') term: string,
    @Param('amount') amount: number,
    @Param('description') description: string,
    @Param('dueDate') dueDate: string,
  ) {
    return await this.adminService.generateFeeForTerm(term, amount, description, dueDate);
  }

  @Post('add/course')
  async addCourse(
    @Body('name') name: string,
    @Body('creditHr') creditHr: number,
    @Body('mode') mode: string
  ) {
    return this.adminService.addCourse(name, creditHr, mode);
  }

  @Put('add/course')
  async editCourse(
    @Body('courseID') courseID: number,
    @Body('name') name: string,
    @Body('creditHr') creditHr: number,
    @Body('mode') mode: string
  ) {
    return this.adminService.editCourse(courseID, name, creditHr, mode);
  }

  @Get('get/course')
  async getCourses() {
    return this.adminService.getCourses();
  }

  @Delete('delete/course/:courseID')
  async deleteCourse(@Param('courseID') courseID: number) {
    return await this.adminService.deleteCourse(courseID);
  }
}
