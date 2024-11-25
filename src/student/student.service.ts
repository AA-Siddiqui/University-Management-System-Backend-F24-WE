import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/entities/class.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { Program } from 'src/entities/program.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    @InjectRepository(Student) private readonly studentRespository: Repository<Student>,
    @InjectRepository(Invoice) private readonly invoiceRespository: Repository<Invoice>,
    @InjectRepository(Program) private readonly programRespository: Repository<Program>,
    @InjectRepository(Enrollment) private readonly enrollmentRespository: Repository<Enrollment>,
    @InjectRepository(Class) private readonly classRespository: Repository<Class>,
    @InjectDataSource() private readonly connection: DataSource,
  ) { }

  async getStudent(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const student = await this.studentRespository.findOne({ where: { userID: user.userID } });
    const program = await this.programRespository.findOne({ where: { programID: student.programID } });
    const todaysClasses = await this.connection.query(`SELECT s.startTime, s.endTime, s.venue, cc.name FROM User u JOIN Student st ON u.userID = st.userIDUserID JOIN Enrollment e ON st.studentID = e.studentIDStudentID JOIN Schedule s ON e.classIDClassID = s.classIDClassID JOIN Class c ON s.classIDClassID = c.classID JOIN Course cc ON c.courseIDCourseID = cc.courseID WHERE u.userID = ${id} AND Date(s.startTime) = CURDATE()`);
    const completedCreditHrs = await this.connection.query(
      `WITH CompletedClasses AS (
        SELECT
        c.classID,
        cc.creditHr
        FROM
        Class c
        INNER JOIN Schedule s ON c.classID = s.classIDClassID
        INNER JOIN Course cc ON c.courseIDCourseID = cc.courseID
        WHERE
          Date(s.endTime) < CURDATE()
      GROUP BY
      c.classID
      HAVING
      COUNT(*) = SUM(CASE WHEN Date(s.endTime) < CURDATE() THEN 1 ELSE 0 END)
      )
      SELECT
      SUM(cc.creditHr) AS totalCompletedCreditHours
      FROM
      CompletedClasses cc
      INNER JOIN Enrollment e ON cc.classID = e.classIDClassID
      INNER JOIN Student st ON e.studentIDStudentID = st.studentID
      WHERE
      st.userIDUserID = ${id}`
    );

    return {
      student: { ...user, ...student },
      program: program,
      todaysClasses: todaysClasses,
      completedCredits: completedCreditHrs[0].totalCompletedCreditHours,
      // courses: courses
    };
  }

  async getInvoice(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const student = await this.studentRespository.findOne({ where: { userID: user.userID } });
    const invoices = await this.invoiceRespository.find({ where: { studentID: student.studentID } });
    return invoices;
  }
}
