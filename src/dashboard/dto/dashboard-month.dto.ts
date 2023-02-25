import { SHIFT } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class DashboardMonthDto {
  @IsNotEmpty()
  @IsNumber()
  lineId: number;

  @IsNotEmpty()
  @IsNumber()
  month: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsEnum(SHIFT)
  @IsNotEmpty()
  shift: SHIFT;
}
