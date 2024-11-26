import { Controller, Get, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';

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
}
