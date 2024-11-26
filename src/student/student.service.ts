import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/entities/class.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { Program } from 'src/entities/program.entity';
import { Request } from 'src/entities/request.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

const currentTerm = "'Summer 2024'";
@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    @InjectRepository(Student) private readonly studentRespository: Repository<Student>,
    @InjectRepository(Invoice) private readonly invoiceRespository: Repository<Invoice>,
    @InjectRepository(Program) private readonly programRespository: Repository<Program>,
    @InjectRepository(Class) private readonly classRespository: Repository<Class>,
    @InjectRepository(Request) private readonly requestRespository: Repository<Request>,
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

    const courses = await this.connection.query(
      `
      SELECT st.studentID, c.classID, t.teacherID, cc.name as title, c.term, c.section
      FROM User u 
      JOIN Student st ON u.userID = st.userIDUserID 
      JOIN Enrollment e ON st.studentID = e.studentIDStudentID 
      JOIN Class c ON e.classIDClassID = c.classID 
      JOIN Course cc ON c.courseIDCourseID = cc.courseID 
      JOIN Teacher t ON t.teacherID = c.teacherIDTeacherID
      WHERE u.userID = ${id}
      `
    );


    for (let i = 0; i < courses.length; i++) {
      const teacherName = await this.connection.query(
        `SELECT u.name from User u
        JOIN Teacher t ON t.userIDUserID = u.userID
        WHERE t.teacherID = ${courses[i].teacherID}`
      );

      const scheduless = await this.connection.query(
        `SELECT COUNT(*) as classesDone FROM Schedule s
        WHERE Date(s.endTime) < CURDATE() AND s.classIDClassID = ${courses[i].classID}`
      );
      const schedules = await this.connection.query(
        `SELECT s.scheduleID FROM Schedule s
        WHERE Date(s.endTime) < CURDATE() AND s.classIDClassID = ${courses[i].classID}`
      );

      let classesAttended = 0;
      for (let j = 0; j < schedules.length; j++) {
        const classesAttendedx = await this.connection.query(
          `SELECT COUNT(a.present) as classesAttended FROM Attendance a
          WHERE 
            a.scheduleIDScheduleID = ${schedules[j].scheduleID} AND 
            a.studentIDStudentID = ${courses[i].studentID} AND
            a.present = TRUE`
        );
        classesAttended += classesAttendedx[0].classesAttended;
      }

      const grade = await this.connection.query(
        `SELECT s.marks / a.max * a.weight as marks, a.weight FROM Assessment a
        JOIN Submission s on s.assessmentIDAssessmentID = a.assessmentID
        WHERE s.studentIDStudentID = ${courses[i].studentID}`
      );

      let obtained = 0;
      let total = 0;
      for (let j = 0; j < grade.length; j++) {
        obtained += Number(grade[j].marks);
        total += Number(grade[j].weight);
      }

      const finalPer = total === 0 ? 100 : obtained / total * 100;
      let returnGrade = "F";
      if (finalPer >= 85) returnGrade = "A+";
      else if (finalPer >= 80) returnGrade = "A";
      else if (finalPer >= 75) returnGrade = "B+";
      else if (finalPer >= 71) returnGrade = "B";
      else if (finalPer >= 68) returnGrade = "B-";
      else if (finalPer >= 64) returnGrade = "C+";
      else if (finalPer >= 61) returnGrade = "C";
      else if (finalPer >= 58) returnGrade = "C-";
      else if (finalPer >= 54) returnGrade = "D+";
      else if (finalPer >= 50) returnGrade = "D";

      courses[i] = { ...courses[i], teacherName: teacherName[0].name, classesAttended: Number(classesAttended), classesTotal: Number(scheduless[0].classesDone), grade: returnGrade };
    }

    const requests = await this.connection.query(
      `SELECT r.approved, cc.name as class FROM Request r
      JOIN Class c on c.classID = r.classIDClassID
      JOIN Course cc on cc.courseID = c.courseIDCourseID
      WHERE r.studentIDStudentID = ${student.studentID}`
    );

    return {
      student: { ...user, ...student },
      program: program,
      todaysClasses: todaysClasses,
      completedCredits: completedCreditHrs[0].totalCompletedCreditHours,
      courses: courses,
      requests: requests.map((request) => {
        if (request.approved === null) return { class: request.class, judged: false, approved: false };
        return { class: request.class, judged: true, approved: request.approved };
      })
    };
  }

  async getUpcomingActivities(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const student = await this.studentRespository.findOne({ where: { userID: user.userID } });

    const activities = await this.connection.query(
      `SELECT cc.name as course, a.title as name, a.deadline as time FROM Assessment a
      JOIN Class c ON c.classID = a.classIDClassID
      JOIN Enrollment e ON e.classIDClassID = c.classID
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
      WHERE e.studentIDStudentID = ${student.studentID} AND a.deadline > CURDATE()`
    );
    // TODO: Improve this by checking if there is a submission agianst this activity

    return { activities };
  }

  async getInvoice(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const student = await this.studentRespository.findOne({ where: { userID: user.userID } });
    const invoices = await this.invoiceRespository.find({ where: { studentID: student.studentID } });
    return invoices;
  }

  async getResults(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const student = await this.studentRespository.findOne({ where: { userID: user.userID } });
    const grade = await this.connection.query(`
      WITH CompletedClasses AS (
        SELECT
        c.classID,
        cc.creditHr,
        cc.name
        FROM
        Class c
        INNER JOIN Schedule s ON c.classID = s.classIDClassID
        INNER JOIN Course cc ON c.courseIDCourseID = cc.courseID
        WHERE
          Date(s.endTime) < CURDATE()
      GROUP BY c.classID
      HAVING
      COUNT(*) = SUM(CASE WHEN Date(s.endTime) < CURDATE() THEN 1 ELSE 0 END)
      )
      SELECT x.name, sum(s.marks / a.max * a.weight) as marks, sum(a.weight) as weight FROM Assessment a
        JOIN CompletedClasses x on x.classID = a.classIDClassID
        JOIN Submission s on s.assessmentIDAssessmentID = a.assessmentID
        WHERE s.studentIDStudentID = ${student.studentID}
        GROUP BY x.name`
    );

    const getGrade = (marks: number) => {
      if (marks >= 85) return "A+";
      else if (marks >= 80) return "A";
      else if (marks >= 75) return "B+";
      else if (marks >= 71) return "B";
      else if (marks >= 68) return "B-";
      else if (marks >= 64) return "C+";
      else if (marks >= 61) return "C";
      else if (marks >= 58) return "C-";
      else if (marks >= 54) return "D+";
      else if (marks >= 50) return "D";
      return "F";
    }

    const data = grade.map((course: typeof grade[0]) => {
      return {
        title: course.name,
        marks: Number(course.marks) / Number(course.weight) * 100,
        grade: getGrade(Number(course.marks) / Number(course.weight) * 100)
      };
    });

    return { data };
  }

  async getEnrollables(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const student = await this.studentRespository.findOne({ where: { userID: user.userID } });
    const enrollables = await this.connection.query(
      `
      SELECT u.name as instructor, cc.name as title, c.section, c.classID FROM Class c
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
      JOIN Teacher t ON t.teacherID = c.teacherIDTeacherID
      JOIN User u ON u.userID = t.userIDUserID
      WHERE c.term = ${currentTerm} AND cc.courseID NOT IN (
        SELECT cc.courseID FROM Enrollment e
        JOIN Class c ON c.classID = e.classIDClassID
        JOIN Course cc ON cc.courseID = c.courseIDCourseID
        WHERE e.studentIDStudentID = ${student.studentID}
      )
      `
    );

    // const data = await enrollables.map(async (course) => {
    for (let i = 0; i < enrollables.length; i++) {
      const schedule = await this.connection.query(`
        SELECT DISTINCT WEEKDAY(s.startTime) as day,Time(s.startTime) as startTime, Time(s.endTime) as endTime, s.venue FROM Schedule s
        WHERE s.classIDClassID = ${enrollables[i].classID}
        `);
        enrollables[i] = {...enrollables[i], schedule}
    }
    
    return {data: enrollables};
  }

  async sendEnrollmentRequest(studentID: number, classID: number) {
    const request = {studentID, classID}
    if (this.studentRespository.exists({where: {studentID}}) && this.classRespository.exists({where: {classID}})) {
      this.requestRespository.save(request);
      return {message: "Success"};
    }
    return {message: "IDs doesn't exist"};
  }
}
