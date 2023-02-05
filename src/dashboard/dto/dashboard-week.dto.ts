import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class DashboardWeekDto {
  @IsNotEmpty()
  @IsNumber()
  lineId: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
