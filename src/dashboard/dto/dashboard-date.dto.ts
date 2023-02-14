import { SHIFT } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class DashboardDateDto {
  @IsNotEmpty()
  @IsNumber()
  lineId: number;

  @IsNotEmpty()
  @IsDateString()
  targetDate: string;

  @IsNotEmpty()
  @IsEnum(SHIFT)
  shift: SHIFT;
}
