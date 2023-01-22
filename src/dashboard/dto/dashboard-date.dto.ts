import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class DashboardDateDto {
  @IsNotEmpty()
  @IsNumber()
  lineId: number;

  @IsNotEmpty()
  @IsDateString()
  targetDate: string;
}
