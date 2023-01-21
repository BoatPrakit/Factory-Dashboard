import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LineModule } from './line/line.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [LineModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
