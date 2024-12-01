import { Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StudentService } from './student.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { Response } from 'express';
import * as path from 'path';
import * as archiver from 'archiver';

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
        const assessmentID = req.params.assessmentID;
        const studentID = req.params.studentID;
        const uploadPath = `./submission/${studentID}/${assessmentID}`;
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
    @Body() body: { assessmentID: number },
    @Param('assessmentID') assessmentID: number,
    @Param('studentID') studentID: number
  ) {
    this.studentService.dealWithSubmission(file, body.assessmentID, studentID);
    if (!file) {
      return { message: "Uploaded Failed" };
    }
    return { message: "Uploaded Successfully" };
  }

  @Get('download/:assessmentID/:filename')
  async downloadAssessment(@Param('assessmentID') assessmentID: number, @Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'assessment', assessmentID.toString(), filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    res.sendFile(filePath);

    // fs.readdir(filePath, (err, files) => {
    //   files.forEach(file => {
    //     if (!fs.existsSync(join(filePath, file))) {
    //       throw new NotFoundException('File not found');
    //     }
    //   });
    // });
  }

  @Get('download/:assessmentID')
  async downloadAssessments(@Param('assessmentID') assessmentID: number, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'assessment', assessmentID.toString());

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Assessment folder not found');
    }

    fs.readdir(filePath, (err, files) => {
      if (err || files.length === 0) {
        throw new NotFoundException('No files found in the assessment folder');
      }

      // Set the output file name for the zip file
      const zipFileName = `assessment_${assessmentID}.zip`;
      const zipStream = archiver('zip', {
        zlib: { level: 9 }, // maximum compression
      });

      // Set the response headers to download the file as a zip
      res.attachment(zipFileName);

      // Pipe the archiver output to the response stream
      zipStream.pipe(res);

      // Add all files in the directory to the zip archive
      files.forEach((file) => {
        const filePathWithName = path.join(filePath, file);
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
}
