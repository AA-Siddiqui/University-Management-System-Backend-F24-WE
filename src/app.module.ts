import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ListController } from './list/list.controller';

@Module({
  imports: [AuthModule],
  controllers: [AppController, ListController],
  providers: [AppService],
})
export class AppModule {}
