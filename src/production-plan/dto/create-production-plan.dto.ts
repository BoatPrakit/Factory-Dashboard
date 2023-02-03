import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ProductionPlanDto } from './production-plan.dto';

export class CreateProductionPlanDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductionPlanDto)
  plans: ProductionPlanDto[];
}
