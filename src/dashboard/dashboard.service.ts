import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductionPlan, SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductService } from 'src/product/product.service';
import { ProductionPlanService } from 'src/production-plan/production-plan.service';
import { StationService } from 'src/station/station.service';
import {
  diffTimeAsMinutes,
  getShiftTimings,
  getStartDateAndEndDate,
} from 'src/utils/interceptor/date.utils';
import { DashboardDateDto } from './dto/dashboard-date.dto';
import { DashboardMonthDto } from './dto/dashboard-month.dto';
import { DashboardWeekDto } from './dto/dashboard-week.dto';
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
  ) {}

  // async getDashboardByMonth({
  //   lineId,
  //   month,
  //   year,
  // }: DashboardMonthDto): Promise<DashboardBase> {
  //   const startDate = moment([year, month - 1])
  //     .startOf('month')
  //     .toDate()
  //     .toISOString();
  //   const endDate = moment(startDate).endOf('month').toDate().toISOString();
  //   const date = getStartDateAndEndDate(startDate, endDate);
  //   const baseDashboard = await this.mappingDashboard(lineId, date);
  //   return baseDashboard;
  // }

  // async getDashboardByWeek(
  //   dashboardWeekDto: DashboardWeekDto,
  // ): Promise<DashboardBase> {
  //   const date = getStartDateAndEndDate(
  //     dashboardWeekDto.startDate,
  //     dashboardWeekDto.endDate,
  //   );
  //   const baseDashboard = await this.mappingDashboard(
  //     dashboardWeekDto.lineId,
  //     date,
  //   );
  //   return baseDashboard;
  // }

  async getDashboardByMonth({
    lineId,
    month,
    year,
    shift,
  }: DashboardMonthDto): Promise<DashboardBase> {
    const startDate = moment([year, month - 1])
      .startOf('month')
      .toDate()
      .toISOString();
    const endDate = moment(startDate).endOf('month').toDate().toISOString();
    const date = getStartDateAndEndDate(startDate, endDate);
    const dashboardWeekDto = new DashboardWeekDto();
    dashboardWeekDto.endDate = date.endDate.toISOString();
    dashboardWeekDto.startDate = date.startDate.toISOString();
    dashboardWeekDto.lineId = lineId;
    dashboardWeekDto.shift = shift;
    const baseDashboard = await this.getDashboardByWeek(dashboardWeekDto);
    return baseDashboard;
  }

  async getDashboardByWeek(
    dashboardWeekDto: DashboardWeekDto,
  ): Promise<DashboardBase> {
    const days =
      moment(dashboardWeekDto.endDate).diff(
        moment(dashboardWeekDto.startDate),
        'd',
      ) + 1;

    const dashboardDatePromises = new Array(days).fill(1).map((date, index) => {
      const dateDto = new DashboardDateDto();
      dateDto.lineId = dashboardWeekDto.lineId;
      dateDto.shift = dashboardWeekDto.shift;
      dateDto.targetDate = moment(dashboardWeekDto.startDate)
        .add(index, 'day')
        .toISOString();
      return this.getDashboardByDate(dateDto);
    });

    const dashboardDates = await Promise.all([...dashboardDatePromises]);
    console.log(dashboardDates.filter((d) => d !== undefined));
    const defaultDashboard: DashboardBase = {
      actual: 0,
      availability: 0,
      downtimeDefect: [],
      downtimeTotal: 0,
      failureDefect: [],
      failureTotal: 0,
      oee: 0,
      performance: 0,
      quality: 0,
      target: 0,
      workingTime: { min: 0, time: dashboardWeekDto.shift },
    };
    if (!dashboardDates.length) return defaultDashboard;
    defaultDashboard.availability = 1;
    defaultDashboard.oee = 1;
    defaultDashboard.performance = 1;
    defaultDashboard.quality = 1;
    let dashboardWeek = dashboardDates
      .filter((date) => date !== undefined)
      .reduce(this.mappingDateToWeek, defaultDashboard);
    const performance =
      dashboardWeek.target > 0
        ? (dashboardWeek.actual * 100) / dashboardWeek.target
        : 0;
    const quality =
      dashboardWeek.actual > 0
        ? ((dashboardWeek.actual - dashboardWeek.failureTotal) * 100) /
          dashboardWeek.actual
        : 0;
    const availability =
      dashboardWeek.workingTime.min > 0
        ? ((dashboardWeek.workingTime.min - dashboardWeek.downtimeTotal) *
            100) /
          dashboardWeek.workingTime.min
        : 0;
    const oee = (performance * availability * quality) / Math.pow(100, 2);

    dashboardWeek = {
      ...dashboardWeek,
      performance: Number(performance.toFixed(2)),
      quality: Number(quality.toFixed(2)),
      availability: Number(availability.toFixed(2)),
      oee: Number(oee.toFixed(2)),
    };
    return dashboardWeek;
  }

  mappingDateToWeek(
    prev: DashboardBase,
    date: DashboardDateResponse,
  ): DashboardBase {
    return {
      actual: date.actual + prev.actual,
      downtimeDefect: _.union(prev.downtimeDefect, date.downtimeDefect),
      downtimeTotal: date.downtimeTotal + prev.downtimeTotal,
      failureDefect: _.union(prev.failureDefect, date.failureDefect),
      failureTotal: date.failureTotal + prev.failureTotal,
      availability: 1,
      oee: 1,
      performance: 1,
      quality: (date.quality * prev.quality) / Math.pow(100, 2),
      target: date.target + prev.target,
      workingTime: {
        min: date.workingTime.min + prev.workingTime.min,
        time: prev.workingTime.time,
      },
    };
  }

  async getDashboardByDate(
    dashboardDate: DashboardDateDto,
  ): Promise<DashboardDateResponse> {
    const date = getStartDateAndEndDate(dashboardDate.targetDate);
    const plans = await this.productionPlanService.findProductionPlansByDate(
      dashboardDate.lineId,

      date,
    );
    const targetPlan = plans.find(
      (plan) => plan.workingTime.shift === dashboardDate.shift,
    );
    if (!targetPlan) return;

    const timeShift = getShiftTimings(
      dashboardDate.shift,
      targetPlan.workingTime.type,
      date.startDate,
    );
    const stationBottleNeck = await this.prisma.station.findFirst({
      where: { lineId: dashboardDate.lineId },
      orderBy: { cycleTime: 'desc' },
    });

    let plan = 0;
    const isToday = moment(dashboardDate.targetDate).isSame(new Date(), 'day');
    const baseDashboard = await this.mappingDashboard(
      dashboardDate.lineId,
      timeShift,
      dashboardDate.shift,
      date,
      targetPlan.workingTime.type,
      isToday,
    );
    if (isToday) {
      const sevenAmOnToday = moment(dashboardDate.targetDate)
        .set('hour', 7)
        .set('minute', 30);

      const diffMinutes = diffTimeAsMinutes(
        sevenAmOnToday.toDate(),
        new Date(),
      );
      plan = Math.floor(Math.floor(diffMinutes) / stationBottleNeck.cycleTime);
    } else plan = baseDashboard.target;

    return {
      ...baseDashboard,
      bottleNeck: stationBottleNeck?.stationId || '',
      plan,
    };
  }

  async mappingWorkingTime(
    lineId: number,
    date: {
      startDate: Date;
      endDate: Date;
    },
    shift?: SHIFT,
    workingTime?: WORKING_TIME_TYPE,
  ): Promise<WorkingTime> {
    const plans = await this.productionPlanService.findProductionPlansByDate(
      lineId,
      date,
      shift,
    );
    const mins = plans.reduce(
      (total, plan) => plan.workingTime.duration + total,
      0,
    );
    let timeString = `ALL_DAY`;
    if (shift && workingTime) {
      let workingTimeType: string;
      switch (workingTime) {
        case 'NOT_OVERTIME':
          workingTimeType = 'NO OT';
          break;
        case 'OVERTIME':
          workingTimeType = 'OT';
          break;
      }
      timeString = `${workingTimeType} ${shift}`;
    }
    return { time: timeString, min: mins };
  }

  async mappingDashboard(
    lineId: number,
    date: { startDate: Date; endDate: Date },
    shift: SHIFT,
    baseDate?: { startDate: Date; endDate: Date },
    workingTimeType?: WORKING_TIME_TYPE,
    isToday?: boolean,
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
      lineId,
      baseDate || date,
      isToday ? shift : undefined,
    );
    const target = plans.reduce((total, plan) => plan.target + total, 0);
    const goods = await this.productService.findAllProductBetween(
      { isGoods: true, lineId: lineId },
      date.startDate,
      date.endDate,
    );
    const actual = goods.length;
    const workingTime = await this.mappingWorkingTime(
      lineId,
      baseDate || date,
      shift,
      workingTimeType,
    );

    const performance = target > 0 ? (actual * 100) / target : 0;
    const quality = actual > 0 ? ((actual - failureTotal) * 100) / actual : 0;
    const availability =
      workingTime.min > 0
        ? ((workingTime.min - downtimeTotal) * 100) / workingTime.min
        : 0;
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
