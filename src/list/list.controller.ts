import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('list')
export class ListController {
  @UseGuards(JwtAuthGuard)
  @Get()
  async getList(@Req() req) {
    const user = req.user;
    return this.getUserData(user.id); // Query DB for user-specific data
  }

  private async getUserData(userId: number) {
    // Replace with actual DB query
    const mockData = {
      1: ['a', 'b', 'c'],
      2: ['x', 'y', 'z'],
    };
    return mockData[userId] || [];
  }
}
