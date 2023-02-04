import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ProductModule } from 'src/product/product.module';
import { ProductionPlanModule } from 'src/production-plan/production-plan.module';
import { WorkingTimeModule } from 'src/working-time/working-time.module';
import { StationModule } from 'src/station/station.module';

@Module({
  imports: [ProductModule, ProductionPlanModule, StationModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
