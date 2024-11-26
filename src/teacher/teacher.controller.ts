import { Body, Controller, Get, NotFoundException, Param, Put, Res } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  @Get("dashboard/:id")
  async getDashboard(@Param('id') id: number) {
    return await this.teacherService.getDashboard(id);
  }

  @Get("course/attendance/:userID&:classID")
  async getAttendanceData(
    @Param('userID') userID: number,
    @Param('classID') classID: number,
  ) {
    return this.teacherService.getAttendanceData(userID, classID);
  }

  @Get("course/grading/:userID&:classID")
  async getGradingData(
    @Param('userID') userID: number,
    @Param('classID') classID: number,
  ) {
    return this.teacherService.getGradingData(userID, classID);
  }

  @Get("course/activity/:userID&:classID")
  async getActivityData(
    @Param('userID') userID: number,
    @Param('classID') classID: number,
  ) {
    return this.teacherService.getActivityData(userID, classID);
  }

  @Get("course/:classID")
  async getCourseHeader(
    @Param('classID') classID: number,
  ) {
    return this.teacherService.getCourseHeader(classID);
  }

  @Get("course/attendance/list/:userID&:scheduleID")
  async getAttendanceListData(
    @Param('userID') userID: number,
    @Param('scheduleID') scheduleID: number,
  ) {
    return this.teacherService.getAttendanceListData(userID, scheduleID);
  }

  @Put("course/attendance/list/:userID&:scheduleID&:studentID")
  async putAttendanceListData(
    @Param('userID') userID: number,
    @Param('scheduleID') scheduleID: number,
    @Param('studentID') studentID: number,
  ) {
    return this.teacherService.putAttendanceListData(userID, scheduleID, studentID);
  }


  @Get("course/grade/list/:userID&:assessmentID")
  async getGradeListData(
    @Param('userID') userID: number,
    @Param('assessmentID') assessmentID: number,
  ) {
    return this.teacherService.getGradeListData(userID, assessmentID);
  }

  @Put("course/grade/list/:assessmentID")
  async putGradeListData(
    @Param('assessmentID') assessmentID: number,
    @Body("studentID") studentID: number,
    @Body("marks") marks: number,
  ) {
    return this.teacherService.putGradeListData(assessmentID, { studentID, marks });
  }

  @Get('course/grade/:submissionID')
  async getFile(@Param('submissionID') submissionID: number, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'submission', submissionID.toString());
    fs.readdir(filePath, (err, files) => {
      files.forEach(file => {
        if (!fs.existsSync(join(filePath, file))) {
          throw new NotFoundException('File not found');
        }
        res.sendFile(join(filePath, file));
      });
    });


  }
}
