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

@Module({
  imports: [LineModule, PrismaModule, ModelModule, ProductModule, DashboardModule, StationModule, FailureDetailModule, WorkingTimeModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
