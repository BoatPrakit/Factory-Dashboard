import { Module } from '@nestjs/common';
import { ProductionPlanService } from './production-plan.service';
import { ProductionPlanController } from './production-plan.controller';
import { ProductionPlanScheduler } from './production-plan.scheduler';
import { AlertModule } from 'src/alert/alert.module';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  // imports: [AlertModule, DashboardModule, ProductModule],
  controllers: [ProductionPlanController],
  providers: [ProductionPlanService, ProductionPlanScheduler],
  exports: [ProductionPlanService],
})
export class ProductionPlanModule {}
