import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, @InjectRepository(User) private readonly userRespository: Repository<User>, @InjectDataSource() private readonly connection: DataSource) { }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findUser(username);

    if (user && ((await bcrypt.compare(password, user.password)) || (password.length === user.password.length && password === user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: User) {
    const payload = { username: user.username, id: user.userID };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      id: user.userID,
    };
  }

  private async findUser(username: string) {
    const user = await this.userRespository.findOne({ where: { username: username } });
    // const mockUsers = [
    //   { id: 1, username: 'test', password: await bcrypt.hash('test', 10) },
    //   { id: 2, username: 'test1', password: await bcrypt.hash('test', 10) },
    // ]
    // const user = mockUsersfitr((user) => username === user.username)[0];
    return user;
  }

  async reset(username: string, password: string, oldPassword: string) {
    const user = await this.userRespository.findOne({ where: { username: username } });

    if ((await bcrypt.compare(password, user.password)) || (password.length === user.password.length && password === user.password))
      await this.connection.query(`
      UPDATE User
      SET password = ${await bcrypt.hash(password, 10)}
      WHERE username = ${username}
    `);
    return { message: "Password Changed Successfully" };
  }
}
