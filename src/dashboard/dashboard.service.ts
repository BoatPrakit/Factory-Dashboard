import { BadRequestException, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductService } from 'src/product/product.service';
import { ProductionPlanService } from 'src/production-plan/production-plan.service';
import { StationService } from 'src/station/station.service';
import {
  diffTimeAsMinutes,
  getStartDateAndEndDate,
} from 'src/utils/interceptor/date.utils';
import { DashboardDateDto } from './dto/dashboard-date.dto';
import {
  DashboardBase,
  DashboardDateResponse,
  DowntimeDefect,
  FailureDefect,
  WorkingTime,
} from './interface/dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
    private productionPlanService: ProductionPlanService,
    private stationService: StationService,
  ) {}

  async getDashboardByDate(
    dashboardDate: DashboardDateDto,
  ): Promise<DashboardDateResponse> {
    const date = getStartDateAndEndDate(dashboardDate.targetDate);
    const baseDashboard = await this.mappingDashboard(
      dashboardDate.lineId,
      date,
    );
    const stationBottleNeck = await this.prisma.station.findFirst({
      where: { lineId: dashboardDate.lineId },
      orderBy: { cycleTime: 'desc' },
    });

    let plan = 0;
    if (moment(dashboardDate.targetDate).isSame(new Date(), 'day')) {
      const sevenAmOnToday = moment(dashboardDate.targetDate)
        .set('hour', 7)
        .set('minute', 30);

      const diffMinutes = diffTimeAsMinutes(
        sevenAmOnToday.toDate(),
        new Date(),
      );
      const allStationInLine = await this.stationService.findAllStationByLineId(
        dashboardDate.lineId,
      );
      plan = allStationInLine.reduce(
        (total, station) =>
          Math.floor(Math.floor(diffMinutes) / station.cycleTime) + total,
        0,
      );
    } else plan = baseDashboard.target;

    return {
      ...baseDashboard,
      bottleNeck: stationBottleNeck?.stationId || '',
      plan,
    };
  }

  async mappingWorkingTime(date: {
    startDate: Date;
    endDate: Date;
  }): Promise<WorkingTime> {
    const plans = await this.productionPlanService.findProductionPlansByDate(
      date,
    );
    const mins = plans.reduce(
      (total, plan) => plan.workingTime.duration + total,
      0,
    );
    const timeString = `ALL_DAY`;
    // switch (workingTime.type) {
    //   case 'NOT_OVERTIME':
    //     timeString = 'NO_OT';
    //     break;
    //   case 'OVERTIME':
    //     timeString = 'OT';
    // }
    // timeString += ` ${workingTime.shift}`;
    return { time: timeString, min: mins };
  }

  async mappingDashboard(
    lineId: number,
    date: { startDate: Date; endDate: Date },
  ): Promise<DashboardBase> {
    const { failureDefect, failureTotal } = await this.mappingFailure(
      lineId,
      date,
    );
    const { downtimeDefect, downtimeTotal } = await this.mappingDowntime(
      lineId,
      date,
    );
    const plans = await this.productionPlanService.findProductionPlansByDate(
      date,
    );
    const target = plans.reduce((total, plan) => plan.target + total, 0);
    const goods = await this.productService.findAllProductBetween(
      { isGoods: true, lineId: lineId },
      date.startDate,
      date.endDate,
    );
    const actual = goods.length;
    const workingTime = await this.mappingWorkingTime(date);

    const performance = (actual * 100) / target || 0;
    const quality = actual > 0 ? ((actual - failureTotal) * 100) / actual : 0;
    const availability =
      ((workingTime.min - downtimeTotal) * 100) / workingTime.min || 0;
    const oee = (performance * availability * quality) / Math.pow(100, 2);
    return {
      failureDefect,
      failureTotal,
      downtimeDefect,
      downtimeTotal,
      target,
      availability: Number(availability.toFixed(2)),
      performance: Number(performance.toFixed(2)),
      quality: Number(quality.toFixed(2)),
      oee: Number(oee.toFixed(2)),
      workingTime,
      actual,
    };
  }

  async mappingDowntime(
    lineId: number,
    { startDate, endDate }: { startDate: Date; endDate: Date },
  ): Promise<{ downtimeDefect: DowntimeDefect[]; downtimeTotal: number }> {
    const downtimes = await this.findAllDowntimeBetween(
      lineId,
      startDate,
      endDate,
    );
    const downtimeDefect = _.chain(downtimes)
      .uniqBy((downtime) => downtime.availabilityId)
      .map(
        (downtime): DowntimeDefect => ({
          details: downtime.availabilityLose.details,
          downtime: downtimes
            .filter((dt) => dt.availabilityId === downtime.availabilityId)
            .reduce((total, dt) => dt.duration + total, 0),
          id: downtime.availabilityId,
          station: downtime.stationId,
        }),
      )
      .value();
    const downtimeTotal = downtimeDefect.reduce(
      (total, downtime) => downtime.downtime + total,
      0,
    );
    return {
      downtimeDefect,
      downtimeTotal,
    };
  }

  async mappingFailure(
    lineId: number,
    { startDate, endDate }: { startDate: Date; endDate: Date },
  ): Promise<{ failureDefect: FailureDefect[]; failureTotal: number }> {
    const failures = await this.findAllFailureBetween(
      lineId,
      startDate,
      endDate,
    );
    const countFailureDetails = _.map(
      _.countBy(failures, (defect) => defect.failure.failureDetailId),
      (value, failureDetailId) => ({
        failureDetailId,
        sum: value,
      }),
    );

    const distinctDefect = _.uniqBy(
      failures,
      (failure) => failure.failure.failureDetailId,
    );
    const failureDefect = distinctDefect.map(
      (defect): FailureDefect => ({
        details: defect.failure.failureDetail.details,
        station: defect.failure.station.stationName,
        sum: countFailureDetails.find(
          (count) => +count.failureDetailId === defect.failure.failureDetailId,
        ).sum,
        type: defect.failure.failureDetail.type,
      }),
    );
    const failureTotal = failureDefect.reduce(
      (total, defect) => defect.sum + total,
      0,
    );
    return {
      failureDefect,
      failureTotal,
    };
  }

  private async findAllDowntimeBetween(
    lineId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.prisma.downtime.findMany({
      where: {
        station: { lineId: lineId },
        timestamp: { gte: startDate, lte: endDate },
      },
      include: { availabilityLose: true },
    });
  }

  private async findAllFailureBetween(
    lineId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.prisma.productHaveFailure.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        failure: { failureDetail: { lineId } },
      },
      include: {
        failure: { include: { failureDetail: true, station: true } },
        product: true,
      },
    });
  }
}
