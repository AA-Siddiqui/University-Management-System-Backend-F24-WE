import { Controller, Get, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  @Get("dashboard/:id")
  async getDashboard(@Param('id') id: number) {
    return await this.teacherService.getDashboard(id);
  }
}
