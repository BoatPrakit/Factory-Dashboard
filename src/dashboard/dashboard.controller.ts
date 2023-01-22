import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardDateDto } from './dto/dashboard-date.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('/date')
  async getDashboardByDate(@Body() payload: DashboardDateDto) {
    return await this.dashboardService.getDashboardByDate(payload);
  }
}
