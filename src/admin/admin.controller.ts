import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
}
