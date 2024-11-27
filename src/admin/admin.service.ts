import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Class } from 'src/entities/class.entity';
import { Department } from 'src/entities/department.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

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

    return { message: "Success" };
  }

  async getClasses() {
    const data = await this.connection.query(`
      SELECT c.classID, c.term, c.section, cc.name FROM Class c
      JOIN Course cc ON cc.courseID = c.courseIDCourseID
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
    return { message: "Success" };
  }

  async enrollStudentToClass(rollNo: string, classID: number) {
    const getID = await this.getNameByRollNo(rollNo);
    if (getID === -1) return {message: "User Not Found"};
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
    if (getID === -1) return {message: "User Not Found"};
    const studentID = getID.studentID;
    const data = await this.connection.query(`
      SELECT inv.invoiceID, inv.description, inv.amount, inv.term FROM Invoice inv
      WHERE inv.studentIDStudentID = ${studentID} AND inv.amount > 0
    `);
    return {data};
  }

  async clearFees(invoiceID: number, amount: number) {
    // const studentID = (await this.getNameByRollNo(rollNo)).studentID;
    // console.log(studentID, invoiceID, amount);
    const data = await this.connection.query(`
      UPDATE Invoice inv
      SET inv.amount = inv.amount - ${amount}
      WHERE inv.invoiceID = ${invoiceID}
    `);
  }

  async addFeesStudent(data) {
    const getID = await this.getNameByRollNo(data.rollNo);
    if (getID === -1) return {message: "User Not Found"};
    const studentID = getID.studentID;


    await this.connection.query(`
      INSERT INTO Invoice (studentIDStudentID, description, amount, term)
      VALUES
        (${studentID}, '${data.description}', ${data.amount}, '${data.term}')
    `);

    return {message: "Success"};
  }
}
