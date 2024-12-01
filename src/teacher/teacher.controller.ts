import { Body, Controller, Get, NotFoundException, Param, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as archiver from 'archiver';
import { diskStorage } from 'multer';

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
    @Param('classID') classID: number
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

  @Get('course/grade/:submissionID&:studentID')
  async getFile(@Param('submissionID') submissionID: number, @Param('studentID') studentID: number, @Res() res: Response) {
    // const filePath = join(__dirname, '..', '..', 'submission', submissionID.toString(), studentID.toString());
    // if (!fs.existsSync(filePath)) {
    //   throw new NotFoundException("File Not Found");
    // }
    // fs.readdir(filePath, (err, files) => {
    //   files.forEach(file => {
    //     if (!fs.existsSync(join(filePath, file))) {
    //       throw new NotFoundException('File not found');
    //     }
    //     res.sendFile(join(filePath, file));
    //   });
    // });
    const filePath = join(__dirname, '..', '..', 'submission', (await this.teacherService.getUserIDFromStudentID(studentID)).toString(), submissionID.toString());

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Assessment folder not found');
    }

    fs.readdir(filePath, (err, files) => {
      if (err || files.length === 0) {
        throw new NotFoundException('No files found in the assessment folder');
      }

      // Set the output file name for the zip file
      const zipFileName = `assessment_${studentID}.zip`;
      const zipStream = archiver('zip', {
        zlib: { level: 9 }, // maximum compression
      });

      // Set the response headers to download the file as a zip
      res.attachment(zipFileName);

      // Pipe the archiver output to the response stream
      zipStream.pipe(res);

      // Add all files in the directory to the zip archive
      files.forEach((file) => {
        const filePathWithName = join(filePath, file);
        if (fs.existsSync(filePathWithName)) {
          zipStream.file(filePathWithName, { name: file });
        }
      });

      // Finalize the zip file
      zipStream.finalize();

      // Error handling for archiver stream
      zipStream.on('error', (zipErr) => {
        throw new NotFoundException('Error during file compression');
      });
    });
  }

  @Post('add/assessment/:classID')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        // const assessmentID = req.params.classID;
        // const uploadPath = `./assessment/${assessmentID}`;
        // // Ensure the directory exists
        // fs.mkdirSync(uploadPath, { recursive: true });
        // callback(null, uploadPath);
        callback(null, '');
      },
      filename: (req, file, callback) => {
        callback(null, `${file.originalname}`);
      },
    }),
  }))
  async addAssessment(
    @Param('classID') classID: number,
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('deadline') deadline: string,
    @Body('weight') weight: number,
    @Body('maximum') max: number,
    @Body('description') description: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.teacherService.handleAssessment(classID, name, type, deadline, weight, max, description, file);
    if (!file) {
      return { message: "Uploaded Failed" };
    }
    return { message: "Uploaded Successfully" };
  }
}
