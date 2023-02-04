import { Module } from '@nestjs/common';
import { ProductionPlanService } from './production-plan.service';
import { ProductionPlanController } from './production-plan.controller';

@Module({
  controllers: [ProductionPlanController],
  providers: [ProductionPlanService],
  exports: [ProductionPlanService],
})
export class ProductionPlanModule {}
