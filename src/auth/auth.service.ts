import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findUser(username); // Replace with DB call
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { username: user.username, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Mock user fetch; replace with actual DB query
  private async findUser(username: string) {
    const mockUsers = [
      { id: 1, username: 'test', password: await bcrypt.hash('test', 10) },
      { id: 2, username: 'test1', password: await bcrypt.hash('test', 10) },
    ];
    const user = mockUsers.filter((user) => username === user.username)[0];
    return user;
  }
}
