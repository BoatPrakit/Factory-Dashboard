import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductService } from 'src/product/product.service';
import { getStartDateAndEndDate } from 'src/utils/interceptor/date.utils';
import { DashboardDateDto } from './dto/dashboard-date.dto';
import { DashboardResponse } from './interface/dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
  ) {}

  async getDashboardByDate(
    dashboardDate: DashboardDateDto,
  ): Promise<DashboardResponse> {
    const date = getStartDateAndEndDate(dashboardDate.targetDate);
    const goods = await this.productService.findAllProductBetween(
      {
        isGoods: true,
        lineId: dashboardDate.lineId,
      },
      date.startDate,
      date.endDate,
    );
    return {
      actual: goods.length,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }
}
