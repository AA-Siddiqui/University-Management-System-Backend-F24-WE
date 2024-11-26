import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/entities/class.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    @InjectRepository(Teacher) private readonly teacherRespository: Repository<Teacher>,
    @InjectDataSource() private readonly connection: DataSource,
  ) { }

  async getDashboard(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const teacher = await this.teacherRespository.findOne({ where: { userID: user.userID } });

    const todaysClass = await this.connection.query(`SELECT s.startTime, s.endTime, s.venue, cc.name FROM User u JOIN Teacher st ON u.userID = st.userIDUserID JOIN Class c ON c.teacherIDTeacherID = st.teacherID JOIN Schedule s ON s.classIDClassID = c.classID JOIN Course cc ON c.courseIDCourseID = cc.courseID WHERE u.userID = ${id} AND Date(s.startTime) = CURDATE()`);
    const classesOverall = await this.connection.query(`SELECT c.classID, c.term, c.section, cc.name AS title FROM User u JOIN Teacher st ON u.userID = st.userIDUserID JOIN Class c ON c.teacherIDTeacherID = st.teacherID JOIN Course cc ON c.courseIDCourseID = cc.courseID WHERE u.userID = ${id}`);

    return {
      teacher: { ...teacher, ...user },
      todaysClasses: todaysClass,
      classes: classesOverall
    };
  }

  async getAttendanceData(userID: number, classID: number) {
    const user = await this.userRespository.findOne({ where: { userID: userID } });
    const teacher = await this.teacherRespository.findOne({ where: { userID: user.userID } });

    const prevData = await this.connection.query(`
      SELECT s.scheduleID, Date(s.endTime) as date FROM Schedule s
      WHERE s.classIDClassID = ${classID} AND Date(s.endTime) < CURDATE()
    `);

    const data = prevData.map((i) => {
      return { ...i, locked: true };
    })

    const newData = await this.connection.query(`
      SELECT s.scheduleID, Date(s.endTime) as date FROM Schedule s
      WHERE s.classIDClassID = ${classID} AND Date(s.endTime) = CURDATE()
    `);
    if (newData.length > 0)
      data.push({ ...newData[0], locked: false });

    return { data: data };
  }

  async getCourseHeader(classID: number) {
    const data = await this.connection.query(`
      SELECT cc.name, c.term FROM Class c
      JOIN Course cc ON c.courseIDCourseID = cc.courseID
      WHERE c.classID = ${classID}
    `);

    return data[0];
  }

  async getGradingData(userID: number, classID: number) {
    const user = await this.userRespository.findOne({ where: { userID: userID } });
    const teacher = await this.teacherRespository.findOne({ where: { userID: user.userID } });

    const data = await this.connection.query(`
      SELECT a.assessmentID, a.title as assessmentMode, a.max, a.weight FROM Assessment a
      WHERE a.classIDClassID = ${classID}
    `);

    return {data};
  }

  async getActivityData(userID: number, classID: number) {
    const user = await this.userRespository.findOne({ where: { userID: userID } });
    const student = await this.teacherRespository.findOne({ where: { userID: user.userID } });
    const studentID = student.teacherID;
    const assessments = await this.connection.query(`
      SELECT a.assessmentID, a.title, a.description, a.deadline as date, a.weight FROM Assessment a
      WHERE a.classIDClassID = ${classID} AND a.weight > 0
    `);
    for (let i = 0; i < assessments.length; i++) {
      const files = await this.connection.query(`
        SELECT af.name FROM Assessment_File af
        WHERE af.assessmentIDAssessmentID = ${assessments[i].assessmentID}
      `);
      const done = await this.connection.query(`
        SELECT COUNT(*) as n from Submission s
        JOIN Assessment a ON s.assessmentIDAssessmentID = a.assessmentID
        WHERE s.studentIDStudentID = ${studentID} AND a.classIDClassID = ${classID}
      `)
      
      assessments[i] = {...assessments[i], files: files.map((file) => file.name), submittable: (Number(done.n) === 0), done: (Number(done.n) > 0)}
    }
    const courseMaterial = await this.connection.query(`
      SELECT a.assessmentID, a.title, a.description, Date(a.deadline) as date, a.weight FROM Assessment a
      WHERE a.classIDClassID = ${classID} AND a.weight = 0
    `);
    for (let i = 0; i < courseMaterial.length; i++) {
      const files = await this.connection.query(`
        SELECT af.name FROM Assessment_File af
        WHERE af.assessmentIDAssessmentID = ${courseMaterial[i].assessmentID}
      `)
      courseMaterial[i] = {...courseMaterial[i], submittable: false, files: files.map((file) => file.name)}
    }
    
    return {data: [{title: "Assessment", details: assessments}, {title: "Course Material", details: courseMaterial}]};
  }

  async getAttendanceListData(userID: number, scheduleID: number) {
    const user = await this.userRespository.findOne({ where: { userID: userID } });
    const teacher = await this.teacherRespository.findOne({ where: { userID: user.userID } });

    const headData = await this.connection.query(`
      SELECT cc.name, c.term, Date(s.startTime) as date FROM Schedule s
      JOIN Class c ON c.classID = s.classIDClassID
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
      WHERE s.scheduleID = ${scheduleID}
    `);

    const bodyData = await this.connection.query(`
      SELECT u.name, st.studentID, st.rollNo as roll, a.present FROM Schedule s
      JOIN Attendance a ON a.scheduleIDScheduleID = s.scheduleID
      JOIN Student st ON st.studentID = a.studentIDStudentID
      JOIN User u ON u.userID = st.userIDUserID
      WHERE s.scheduleID = ${scheduleID}
    `);

    return {headData, bodyData}
  }

  async putAttendanceListData(userID: number, scheduleID: number, studentID: number) {
    await this.connection.query(`
      UPDATE Attendance a
      SET a.present = NOT a.present
      WHERE a.scheduleIDScheduleID = ${scheduleID} AND a.studentIDStudentID = ${studentID}
    `);
  }

  async getGradeListData(userID: number, assessmentID: number) {
    const user = await this.userRespository.findOne({ where: { userID: userID } });
    const teacher = await this.teacherRespository.findOne({ where: { userID: user.userID } });

    const headData = await this.connection.query(`
      SELECT cc.name, c.term, a.title as date FROM Assessment a
      JOIN Class c ON c.classID = a.classIDClassID
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
      WHERE a.assessmentID = ${assessmentID}
    `);

    const bodyData = await this.connection.query(`
      SELECT s.submissionID, u.name, st.studentID, st.rollNo as roll, s.marks FROM Assessment aa
      JOIN Submission s ON aa.assessmentID = s.assessmentIDAssessmentID
      JOIN Student st ON st.studentID = s.studentIDStudentID
      JOIN User u ON u.userID = st.userIDUserID
      WHERE aa.assessmentID = ${assessmentID}
    `);
    console.log(bodyData[0].marks);

    return {headData, bodyData}
  }

  async putGradeListData(assessmentID: number, body: {studentID: number, marks: number}) {
    await this.connection.query(`
      UPDATE Submission s
      SET s.marks = ${body.marks}
      WHERE s.assessmentIDAssessmentID = ${assessmentID} AND s.studentIDStudentID = ${body.studentID}
    `);
  }
}
