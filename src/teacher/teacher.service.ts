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
    const classesOverall = await this.connection.query(`SELECT c.term, c.section, cc.name AS title FROM User u JOIN Teacher st ON u.userID = st.userIDUserID JOIN Class c ON c.teacherIDTeacherID = st.teacherID JOIN Course cc ON c.courseIDCourseID = cc.courseID WHERE u.userID = ${id}`);

    console.log(classesOverall);
    return { 
      teacher: { ...teacher, ...user },
      todaysClasses: todaysClass,
      classes: classesOverall
     };
  }
}
