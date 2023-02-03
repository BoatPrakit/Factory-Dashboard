import { EMPLOYEE_SHIFT_GROUP, SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class ProductionPlanDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  target: number;

  @IsNotEmpty()
  @IsEnum(SHIFT)
  shift: SHIFT;

  @IsNotEmpty()
  @IsEnum(EMPLOYEE_SHIFT_GROUP)
  group: EMPLOYEE_SHIFT_GROUP;

  @IsNotEmpty()
  @IsEnum(WORKING_TIME_TYPE)
  workingTimeType: WORKING_TIME_TYPE;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
