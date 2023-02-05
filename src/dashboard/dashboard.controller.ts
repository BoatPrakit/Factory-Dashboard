import { Controller, Post, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardDateDto } from './dto/dashboard-date.dto';
import { DashboardMonthDto } from './dto/dashboard-month.dto';
import { DashboardWeekDto } from './dto/dashboard-week.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('/date')
  async getDashboardByDate(@Body() payload: DashboardDateDto) {
    return await this.dashboardService.getDashboardByDate(payload);
  }

  @Post('/week')
  async getDashBoardByWeek(@Body() payload: DashboardWeekDto) {
    return await this.dashboardService.getDashboardByWeek(payload);
  }

  @Post('/month')
  async getDashBoardByMonth(@Body() payload: DashboardMonthDto) {
    return await this.dashboardService.getDashboardByMonth(payload);
  }
}
