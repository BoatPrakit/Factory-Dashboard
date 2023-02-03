import { PartialType } from '@nestjs/mapped-types';
import { CreateProductionPlanDto } from './create-production-plan.dto';

export class UpdateProductionPlanDto extends PartialType(CreateProductionPlanDto) {}
