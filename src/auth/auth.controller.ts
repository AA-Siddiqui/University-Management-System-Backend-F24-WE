import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    const ret = await this.authService.login(user);
    // const final = {access_token: ret.access_token, role: 3};
    return ret;
  }

  @Post('reset')
  async reset(@Body() body: { username: string, password: string, oldPassword: string }) {
    return await this.authService.reset(body.username, body.password, body.oldPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user; // User info from decoded JWT
  }
}
