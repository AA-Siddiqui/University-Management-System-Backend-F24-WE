import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StudentService } from './student.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

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

  @Get("course/attendance/:studentID&:classID")
  async getAttendances(
    @Param('studentID') studentID: number,
    @Param('classID') classID: number,
  ) {
    return await this.studentService.getAttendances(studentID, classID);
  }

  @Get("course/results/:studentID&:classID")
  async getCourseResults(
    @Param('studentID') studentID: number,
    @Param('classID') classID: number,
  ) {
    return await this.studentService.getCourseResults(studentID, classID);
  }

  @Get("course/activity/:studentID&:classID")
  async getActivities(
    @Param('studentID') studentID: number,
    @Param('classID') classID: number,
  ) {
    return await this.studentService.getActivities(studentID, classID);
  }

  @Get("course/:studentID&:classID")
  async getCourseHeaderData(
    @Param('studentID') studentID: number,
    @Param('classID') classID: number,
  ) {
    return await this.studentService.getCourseHeaderData(studentID, classID);
  }

  @Get("course/submission/:assessmentID")
  async getSubmissionPageData(
    @Param('assessmentID') assessmentID: number,
  ) {
    return await this.studentService.getSubmissionPageData(assessmentID);
  }

  @Post('course/submission/:studentID&:assessmentID')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const assessmentID = req.params.assessmentID; // Get assessmentID from request params
        const uploadPath = `./submission/${assessmentID}`;
        // Ensure the directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        callback(null, `${file.originalname}`);
      },
    }),
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File, 
    @Body() body: {assessmentID: number},
    @Param('assessmentID') assessmentID: number,
    @Param('studentID') studentID: number
  ) {
    this.studentService.dealWithSubmission(file, body.assessmentID, studentID);
    if (!file) {
      return { message: "Uploaded Failed" };
    }
    return { message: "Uploaded Successfully" };
  }
}
