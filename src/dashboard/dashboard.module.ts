import { forwardRef, Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ProductModule } from 'src/product/product.module';
import { ProductionPlanModule } from 'src/production-plan/production-plan.module';
import { StationModule } from 'src/station/station.module';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [ProductionPlanModule, StationModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
