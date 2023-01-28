import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWorkingTimeDto {
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsEnum(SHIFT)
  shift: SHIFT;

  @IsNotEmpty()
  @IsEnum(WORKING_TIME_TYPE)
  type: WORKING_TIME_TYPE;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
