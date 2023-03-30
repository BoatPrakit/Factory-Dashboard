import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LineModule } from './line/line.module';
import { PrismaModule } from './prisma/prisma.module';
import { ModelModule } from './model/model.module';
import { ProductModule } from './product/product.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StationModule } from './station/station.module';
import { FailureDetailModule } from './failure-detail/failure-detail.module';
import { WorkingTimeModule } from './working-time/working-time.module';
import { EmployeeModule } from './employee/employee.module';
import { ProductionPlanModule } from './production-plan/production-plan.module';
import { DowntimeModule } from './downtime/downtime.module';
import { AvaiabilityLoseModule } from './availability-lose/availability-lose.module';
import { AuthModule } from './auth/auth.module';
import { LineChatbotModule } from './line-chatbot/line-chatbot.module';
import { AlertModule } from './alert/alert.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LineModule,
    PrismaModule,
    ModelModule,
    ProductModule,
    DashboardModule,
    StationModule,
    FailureDetailModule,
    WorkingTimeModule,
    EmployeeModule,
    ProductionPlanModule,
    DowntimeModule,
    AvaiabilityLoseModule,
    AuthModule,
    LineChatbotModule,
    AlertModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
