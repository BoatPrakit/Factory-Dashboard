import { Controller, Post, Body } from '@nestjs/common';
import { ProductionPlanService } from './production-plan.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';

@Controller('production-plan')
export class ProductionPlanController {
  constructor(private readonly productionPlanService: ProductionPlanService) {}

  @Post()
  async create(@Body() createProductionPlanDto: CreateProductionPlanDto) {
    return await this.productionPlanService.create(createProductionPlanDto);
  }
}
