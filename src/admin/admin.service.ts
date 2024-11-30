import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Class } from 'src/entities/class.entity';
import { Department } from 'src/entities/department.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

const currentTerm = "F24";
const currentTermFull = "Fall 2024";
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    @InjectRepository(Admin) private readonly adminRespository: Repository<Admin>,
    @InjectRepository(Department) private readonly departmentRespository: Repository<Department>,
    @InjectRepository(Class) private readonly classRespository: Repository<Class>,
    @InjectDataSource() private readonly connection: DataSource,
  ) { }

  async getDashboard(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const admin = await this.adminRespository.findOne({ where: { userID: user.userID } });
    const department = await this.departmentRespository.findOne({ where: { departmentID: user.departmentID } });


    return { name: user.name, department: department.name }
  }

  async getRequests(id: number) {
    const user = await this.userRespository.findOne({ where: { userID: id } });
    const admin = await this.adminRespository.findOne({ where: { userID: user.userID } });
    const department = await this.departmentRespository.findOne({ where: { departmentID: user.departmentID } });

    const x = await this.connection.query(`SELECT u.departmentIDDepartmentID as id FROM User u WHERE u.userID = ${id}`);
    const departmentID = x[0].id;
    const data = await this.connection.query(`
      SELECT rq.requestID, cc.name as class, st.rollNo as studentRoll FROM request rq
      JOIN Class c ON rq.classIDClassID = c.classID
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
      JOIN Student st ON st.studentID = rq.studentIDStudentID
      JOIN User u ON u.userID = st.userIDUserID
      WHERE u.departmentIDDepartmentID = ${departmentID} AND rq.approved IS NULL
      `);

    return { data };
  }

  async putRequest(requestID: number, approved: boolean) {
    await this.connection.query(`
      UPDATE Request rq
      SET rq.approved = ${approved ? "TRUE" : "FALSE"}
      WHERE rq.requestID = ${requestID}
    `);

    if (approved) {
      const result = await this.connection.query(`
        SELECT rq.studentIDStudentID, rq.classIDClassID
        FROM Request rq
        WHERE rq.requestID = ${requestID}`
      );

      const { studentIDStudentID, classIDClassID } = result[0];

      await this.connection.query(`
        INSERT INTO Enrollment (studentIDStudentID, classIDClassID)
        VALUES
          (${studentIDStudentID}, ${classIDClassID})
      `);
    }
    return { message: "Success" };
  }

  async getClasses() {
    const data = await this.connection.query(`
      SELECT c.classID, c.term, c.section, cc.name FROM Class c
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
    `);
    return data;
  }

  async getCourses() {
    const data = await this.connection.query(`
      SELECT c.courseID, c.name, c.creditHr, c.mode FROM Course c
    `);
    return data;
  }

  async getNameByRollNo(rollNo: string) {
    const data = await this.connection.query(`
      SELECT u.name, st.studentID FROM Student st
      JOIN User u ON st.userIDUserID = u.userID
      WHERE st.rollNo = '${rollNo}'
    `);
    if (data.length === 0) return -1;
    return data[0];
  }

  async postExtraClass(classID: number, body) {
    body.startTime = new Date(`${body.date}T${body.startTime}`).toISOString().slice(0, 19).replace('T', ' ');
    body.endTime = new Date(`${body.date}T${body.endTime}`).toISOString().slice(0, 19).replace('T', ' ');

    const data = await this.connection.query(`
      INSERT INTO Schedule (classIDClassID, startTime, endTime, venue)
      VALUES
        (${classID}, '${body.startTime}', '${body.endTime}', '${body.venue}')
    `);

    await this.connection.query(`
      INSERT INTO Attendance (studentIDStudentID, scheduleIDScheduleID, present)
      SELECT 
          e.studentIDStudentID, 
          ${data.insertId}, 
          1 AS present
      FROM Enrollment e
      WHERE e.classIDClassID = ${classID};
    `);

    return { message: "Success" };
  }

  async enrollStudentToClass(rollNo: string, classID: number) {
    const getID = await this.getNameByRollNo(rollNo);
    if (getID === -1) return { message: "User Not Found" };
    const studentID = getID.studentID;
    const data = await this.connection.query(`
      INSERT INTO Enrollment (studentIDStudentID, classIDClassID)
      VALUES
        (${studentID}, ${classID})
    `);
    return { message: "Success" };
  }

  async getFees(rollNo: string) {
    const getID = await this.getNameByRollNo(rollNo);
    if (getID === -1) return { message: "User Not Found" };
    const studentID = getID.studentID;
    const data = await this.connection.query(`
      SELECT inv.invoiceID, inv.description, inv.amount, inv.term FROM Invoice inv
      WHERE inv.studentIDStudentID = ${studentID} AND inv.amount > 0
    `);
    return { data };
  }

  async clearFees(invoiceID: number, amount: number) {
    ;
    const data = await this.connection.query(`
      SELECT inv.amount FROM Invoice inv
      WHERE inv.invoiceID = ${invoiceID}
    `);

    await this.connection.query(`
      UPDATE Invoice inv
      SET inv.amount = inv.amount - ${amount}${(data[0].amount - amount <= 0) ? ', inv.paidDate = CURDATE()' : ''}
      WHERE inv.invoiceID = ${invoiceID}
    `);

    return { message: "Success" };
  }

  async addFeesStudent(data) {
    const getID = await this.getNameByRollNo(data.rollNo);
    if (getID === -1) return { message: "User Not Found" };
    const studentID = getID.studentID;


    await this.connection.query(`
      INSERT INTO Invoice (studentIDStudentID, description, amount, term, dueDate)
      VALUES
        (${studentID}, '${data.description}', ${data.amount}, '${data.term}', ${data.dueDate})
    `);

    return { message: "Success" };
  }

  async generateFeeForTerm(term: string, amount: number, description: string, dueDate: string) {
    const result = await this.connection.query(`
      WITH Class_Credit_Hours AS (
          SELECT
              c.classID,
              SUM(co.creditHr) AS totalCreditHours
          FROM
              Class c
          JOIN Course co ON c.courseIDCourseID = co.courseID
          WHERE
              c.term = '${term}'
          GROUP BY
              c.classID
      ),

      Student_Invoice_Data AS (
          SELECT
              s.studentID as sid,
              cch.totalCreditHours,
              (cch.totalCreditHours * ${amount}) AS invoiceAmount,
              c.term -- Add the 'term' field here
          FROM
              Enrollment e
          JOIN Student s ON e.studentIDStudentID = s.studentID
          JOIN Class_Credit_Hours cch ON e.classIDClassID = cch.classID
          JOIN Class c ON e.classIDClassID = c.classID -- Join with Class to get the term
          WHERE
              c.term = '${term}'
      )
      SELECT
          sid,
          '${description}' AS description,
          invoiceAmount,
          term
      FROM
          Student_Invoice_Data;
    `);

    console.log(result);

    // Now you insert the results into the Invoice table
    for (const row of result) {
      await this.connection.query(`
            INSERT INTO Invoice (studentIDStudentID, description, amount, dueDate, term)
            VALUES (${row.sid}, '${row.description}', ${row.invoiceAmount}, '${dueDate}', '${row.term}');
        `);
    }

    return { message: "Success" };
  }

  async addCourse(name: string, creditHr: number, mode: string) {
    await this.connection.query(`
      INSERT INTO Course (name, creditHr, mode)
      VALUES
        ('${name}', ${creditHr}, '${mode}')
    `);
    return { message: "Added Course Successfully" };
  }

  async editCourse(courseID: number, name: string, creditHr: number, mode: string) {
    await this.connection.query(`
      UPDATE Course c
      SET
        c.name = '${name}',
        c.creditHr = ${creditHr},
        c.mode = '${mode}'
      WHERE
        c.courseID = ${courseID}
    `);
    return { message: "Updated Course Successfully" };
  }

  async deleteCourse(courseID: number) {
    await this.connection.query(`
      DELETE FROM Course WHERE courseID = ${courseID}
    `)
    return { message: "Deleted Course Successfully" };
  }

  async getPrograms() {
    return await this.connection.query(`
      SELECT programID, departmentIDDepartmentID, name FROM Program
    `);
  }

  async addUser(
    name: string,
    email: string,
    gender: string,
    dob: string,
    phoneNo: string,
    emergencyNo: string,
    address: string,
    departmentID: number,
    enrollmentDate: string,
    role: number
  ) {
    const data = await this.connection.query(`
      INSERT INTO User (name, email, gender, dob, phone, emergencyPhone, address, joinDate, departmentIDDepartmentID, role)
      VALUES
        ('${name}', '${email}', '${gender}', '${dob}', '${phoneNo}', '${emergencyNo}', '${address}', '${enrollmentDate}', ${departmentID}, ${role})
    `);

    this.connection.query(`
      UPDATE User
      SET username = '${{ 1: 'student', 2: 'teacher', 3: 'admin' }[role]}-${data.insertId}'
      WHERE userID = ${data.insertId}
    `);
    return data.insertId;
  }

  async addStudent(
    name: string,
    email: string,
    gender: string,
    dob: string,
    phoneNo: string,
    emergencyNo: string,
    address: string,
    departmentID: number,
    enrollmentDate: string,
    programID: number
  ) {
    const p = await this.connection.query(`
      SELECT name FROM Program WHERE programID = ${programID}
    `);
    const n = p[0].name.split(" ");
    let x = "";
    for (let i = 2; i < n.length; i++) {
      "".toUpperCase()
      if (n[i][0].toUpperCase() === n[i][0]) {
        x += n[i][0];
      }
    }

    const userID = await this.addUser(name,
      email,
      gender,
      dob,
      phoneNo,
      emergencyNo,
      address,
      departmentID,
      enrollmentDate,
      1);

    const data = await this.connection.query(`
      INSERT INTO Student (userIDUserID, programIDProgramID, rollNo)
      VALUES
        (${userID}, ${programID}, 'BS-${x}-${currentTerm}-${`${userID}`.padStart(3, "0")}')
    `);

    return { message: "Added Student Successfully" };
  }

  async getStudentByRoll(rollNo: string) {
    const data = await this.connection.query(`
      SELECT u.userID, st.studentID, u.name, u.email, u.gender, Date(u.dob) as dob, u.phone, u.emergencyPhone, u.address, Date(u.joinDate) as enrollmentDate, u.departmentIDDepartmentID as department, st.programIDProgramID as program FROM Student st
      JOIN User u ON st.userIDUserID = u.userID
      WHERE st.rollNo = '${rollNo}'
    `);
    return data;
  }

  async deleteStudentByRoll(rollNo: string) {
    const data = await this.connection.query(`
      SELECT u.userID FROM Student st
      JOIN User u ON u.userID = st.userIDUserID
      WHERE st.rollNo = '${rollNo}'
    `);
    const userID = data[0].userID;
    await this.connection.query(`
      DELETE FROM User WHERE userID = ${userID}
    `)
    return { message: "Deleted Student Successfully" };
  }

  async editStudent(
    name: string,
    email: string,
    gender: string,
    dob: string,
    phoneNo: string,
    emergencyNo: string,
    address: string,
    departmentID: number,
    enrollmentDate: string,
    programID: number,
    userID: number,
    studentID: number
  ) {
    await this.connection.query(`
      UPDATE User
      SET
        name = '${name}',
        email = '${email}',
        gender = '${gender}',
        dob = '${dob}',
        phone = '${phoneNo}',
        emergencyPhone = '${emergencyNo}',
        address = '${address}',
        departmentIDDepartmentID = ${departmentID},
        joinDate = '${enrollmentDate}'
      WHERE userID = ${userID}
    `);

    await this.connection.query(`
      UPDATE Student
      SET
        programIDProgramID = ${programID}
      WHERE studentID = ${studentID} AND userIDUserID = ${userID}
    `);

    return { message: "Updated Student Successfully!" };
  }

  async addTeacher(
    name: string,
    email: string,
    gender: string,
    dob: string,
    phoneNo: string,
    emergencyNo: string,
    address: string,
    departmentID: number,
    hireDate: string,
    position: string,
    officeLocation: string
  ) {

    const userID = await this.addUser(name,
      email,
      gender,
      dob,
      phoneNo,
      emergencyNo,
      address,
      departmentID,
      hireDate,
      2);

    const data = await this.connection.query(`
      INSERT INTO Teacher (userIDUserID, officeLocation, position)
      VALUES
        (${userID}, '${officeLocation}', '${position}')
    `);

    return { message: "Added Teacher Successfully" };
  }

  async editTeacher(
    name: string,
    email: string,
    gender: string,
    dob: string,
    phoneNo: string,
    emergencyNo: string,
    address: string,
    departmentID: number,
    hireDate: string,
    position: string,
    officeLocation: string,
    userID: number,
    teacherID: number
  ) {
    await this.connection.query(`
      UPDATE User
      SET
        name = '${name}',
        email = '${email}',
        gender = '${gender}',
        dob = '${dob}',
        phone = '${phoneNo}',
        emergencyPhone = '${emergencyNo}',
        address = '${address}',
        departmentIDDepartmentID = ${departmentID},
        joinDate = '${hireDate}'
      WHERE userID = ${userID}
    `);

    await this.connection.query(`
      UPDATE Teacher
      SET
        position = '${position}',
        officeLocation = '${officeLocation}'
      WHERE teacherID = ${teacherID} AND userIDUserID = ${userID}
    `);

    return { message: "Updated Teacher Successfully!" };
  }

  async getTeachers() {
    return await this.connection.query(`
      SELECT u.userID, t.teacherID, u.name, u.username, u.email, u.gender, Date(u.dob) as dob, u.phone, u.emergencyPhone, u.address, Date(u.joinDate) as hireDate, u.departmentIDDepartmentID as department, t.position, t.officeLocation FROM User u
      JOIN Teacher t ON u.userID = t.userIDUserID
    `);
  }

  async deleteTeacher(userID: number) {
    await this.connection.query(`
      DELETE FROM User WHERE userID = ${userID}
    `)
    return { message: "Deleted Teacher Successfully" };
  }

  async addClass(
    courseID: number,
    teacherID: number,
    section: string,
    schedules: Array<{ day: number, startTime: string, endTime: string, venue: string }>
  ) {
    function getNthWeekdayAfterToday(targetDay: number, n: number, time: string): string {
      if (targetDay === undefined) {
        throw new Error("Invalid weekday");
      }

      const today = new Date();
      const currentDay = today.getDay();

      let daysUntilNext = (targetDay - currentDay + 7) % 7;
      if (daysUntilNext === 0) {
        daysUntilNext = 7;
      }

      const date = new Date(today);
      date.setDate(today.getDate() + daysUntilNext + (n - 1) * 7);
      date.setHours(time.split(":").map(Number)[0]);
      date.setMinutes(time.split(":").map(Number)[1]);
      date.setSeconds(0);
      date.setMilliseconds(0);

      if (!(date instanceof Date)) {
        throw new Error("Input must be a Date object");
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const data = await this.connection.query(`
      INSERT INTO Class (term, section, teacherIDTeacherID, courseIDCourseID)
      VALUES
        ('${currentTermFull}', '${section}', ${teacherID}, ${courseID})
    `)
    const classID = data.insertId;

    for (let i = 1; i <= 16; i++) {
      for (const schedule of schedules) {
        await this.connection.query(`
          INSERT INTO Schedule (classIDClassID, startTime, endTime, venue)
          VALUES
            (${classID}, '${getNthWeekdayAfterToday(schedule.day, i, schedule.startTime)}', '${getNthWeekdayAfterToday(schedule.day, i, schedule.endTime)}', '${schedule.venue}')
        `);
      }
    }

    return { message: "Added Class Successfully" };
  }

  async editClass(
    classID: number,
    courseID: number,
    teacherID: number,
    section: string,
    schedules: Array<{ day: number, startTime: string, endTime: string, venue: string }>
  ) {
    function getNthWeekdayAfterToday(targetDay: number, n: number, time: string): string {
      if (targetDay === undefined) {
        throw new Error("Invalid weekday");
      }

      const today = new Date();
      const currentDay = today.getDay();

      let daysUntilNext = (targetDay - currentDay + 7) % 7;
      if (daysUntilNext === 0) {
        daysUntilNext = 7;
      }

      const date = new Date(today);
      date.setDate(today.getDate() + daysUntilNext + (n - 1) * 7);
      date.setHours(time.split(":").map(Number)[0]);
      date.setMinutes(time.split(":").map(Number)[1]);
      date.setSeconds(0);
      date.setMilliseconds(0);

      if (!(date instanceof Date)) {
        throw new Error("Input must be a Date object");
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    await this.connection.query(`
      UPDATE Class
      SET
        courseIDCourseID = ${courseID},
        teacherIDTeacherID = ${teacherID},
        section = '${section}'
      WHERE classID = ${classID}
    `);
    const classesDone = (await this.connection.query(`
      SELECT COUNT(*) AS ClassDone FROM Schedule
      WHERE classIDClassID = ${classID} 
      AND Date(startTime) < CURDATE()`))[0].ClassDone;
    const classesPerWeek = (await this.connection.query(`
        SELECT DISTINCT DAYOFWEEK(s.startTime) - 1 as day, TIME(s.startTime) as startTime, TIME(s.endTime) as endTime, s.venue FROM Schedule s
        WHERE s.classIDClassID = ${classID}
    `)).length;
    const noOfIteration = (classesPerWeek * 16 - classesDone) / classesPerWeek;

    await this.connection.query(`
      DELETE FROM Schedule WHERE classIDClassID = ${classID} AND Date(startTime) > CURDATE()
    `);

    for (let i = 1; i <= noOfIteration; i++) {
      for (const schedule of schedules) {
        await this.connection.query(`
          INSERT INTO Schedule (classIDClassID, startTime, endTime, venue)
          VALUES
            (${classID}, '${getNthWeekdayAfterToday(schedule.day, i, schedule.startTime)}', '${getNthWeekdayAfterToday(schedule.day, i, schedule.endTime)}', '${schedule.venue}')
        `);
      }
    }
    return { message: "Updated Class Successfully" };
  }

  async getExtendedClasses() {
    const data = await this.connection.query(`
      SELECT c.classID, c.term, c.section, cc.name, cc.courseID as course, cc.creditHr FROM Class c
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
    `);

    const mData = [];
    for (let i = 0; i < data.length; i++) {
      const schedule = await this.connection.query(`
        SELECT DISTINCT DAYOFWEEK(s.startTime) - 1 as day, TIME(s.startTime) as startTime, TIME(s.endTime) as endTime, s.venue FROM Schedule s
        WHERE s.classIDClassID = ${data[i].classID}
      `);
      mData.push({ ...data[i], schedule });
    }
    return mData;
  }

  async deleteClass(classID: number) {
    await this.connection.query(`
      DELETE FROM Class WHERE classID = ${classID}
    `)
    return { message: "Deleted Class Successfully" };
  }
}
