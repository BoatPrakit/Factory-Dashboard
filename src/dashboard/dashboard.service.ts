import { BadRequestException, Injectable } from '@nestjs/common';
import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductQuery } from 'src/product/interface/product-query.interface';
import { ProductionPlanService } from 'src/production-plan/production-plan.service';
import {
  diffTimeAsMinutes,
  getBreakTime,
  getShiftTimings,
  getStartDateAndEndDate,
  setTimeByMoment,
} from 'src/utils/date.utils';
import { TIME_RANGE } from 'src/utils/time-range';
import { FullDate } from 'src/utils/types/date.type';
import { DashboardDateDto } from './dto/dashboard-date.dto';
import { DashboardMonthDto } from './dto/dashboard-month.dto';
import { DashboardWeekDto } from './dto/dashboard-week.dto';
import {
  AvailabilityParams,
  CalculatePercentParams,
  PerformanceParams,
  QualityParams,
} from './interface/calculate-percent.params';
import {
  DashboardBase,
  DashboardDateResponse,
  DashboardInner,
  DowntimeDefect,
  FailureDefect,
  PerformanceResult,
  QualityResult,
  WorkingTime,
} from './interface/dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private productionPlanService: ProductionPlanService,
  ) {}

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
    const defaultDashboard: DashboardBase = {
      actual: 0,
      availabilityIssue: {
        diffMins: 0,
        downtimeBottleNeck: 0,
        result: 0,
      },
      availability: 0,
      quality: 0,
      qualityIssue: {
        failureDefectAmount: 0,
        productAmountAtFirstOp: 0,
        result: 0,
      },
      downtimeDefect: [],
      downtimeTotal: 0,
      failureDefect: [],
      failureTotal: 0,
      oee: 0,
      performance: 0,
      performanceIssue: {
        actual: 0,
        bottleNeckCycleTime: 0,
        diffTime: 0,
        result: 0,
        totalDowntimeBottleNeck: 0,
      },
      target: 0,
      workingTime: { min: 0, time: dashboardWeekDto.shift },
      startAt: null,
      endAt: null,
    };
    if (!dashboardDates.length) return defaultDashboard;
    const dashboardDatesWithOutUndefined = dashboardDates.filter(
      (date) => date !== undefined,
    );
    let dashboardWeek = dashboardDatesWithOutUndefined.reduce(
      this.mappingDateToWeek,
      defaultDashboard,
    );

    const availability = this.availabilityFormula(
      dashboardWeek.availabilityIssue.diffMins,
      dashboardWeek.availabilityIssue.downtimeBottleNeck,
    );
    const quality = this.qualityFormula(
      dashboardWeek.qualityIssue.productAmountAtFirstOp,
      dashboardWeek.qualityIssue.failureDefectAmount,
    );
    const performance = this.performanceFormula({
      actual: dashboardWeek.performanceIssue.actual,
      cycleTime: dashboardWeek.performanceIssue.bottleNeckCycleTime,
      diffTime: dashboardWeek.performanceIssue.diffTime,
      totalDowntimeBottleNeck:
        dashboardWeek.performanceIssue.totalDowntimeBottleNeck,
    });
    const oee = (availability * quality * performance) / Math.pow(100, 2);

    dashboardWeek = {
      ...dashboardWeek,
      performance: performance || 0,
      quality: quality || 0,
      availability: availability || 0,
      oee: Number(oee.toFixed(2)) || 0,
    };
    return dashboardWeek;
  }

  mappingDateToWeek(
    prev: DashboardBase,
    date: DashboardDateResponse,
  ): DashboardBase {
    if (!prev.startAt || !prev.endAt) {
      prev.startAt = date.startAt;
      prev.endAt = date.endAt;
    }
    return {
      actual: date.actual + prev.actual,
      downtimeDefect: _.union(prev.downtimeDefect, date.downtimeDefect),
      downtimeTotal: date.downtimeTotal + prev.downtimeTotal,
      failureDefect: _.union(prev.failureDefect, date.failureDefect),
      failureTotal: date.failureTotal + prev.failureTotal,
      availabilityIssue: {
        diffMins:
          date.availabilityIssue.diffMins + prev.availabilityIssue.diffMins,
        downtimeBottleNeck:
          date.availabilityIssue.downtimeBottleNeck +
          prev.availabilityIssue.downtimeBottleNeck,
        result: 0,
      },
      qualityIssue: {
        result: 0,
        failureDefectAmount:
          date.qualityIssue.failureDefectAmount +
          prev.qualityIssue.failureDefectAmount,
        productAmountAtFirstOp:
          date.qualityIssue.productAmountAtFirstOp +
          prev.qualityIssue.productAmountAtFirstOp,
      },
      performanceIssue: {
        actual: date.performanceIssue.actual + prev.performanceIssue.actual,
        diffTime:
          date.performanceIssue.diffTime + prev.performanceIssue.diffTime,
        result: 0,
        totalDowntimeBottleNeck:
          date.performanceIssue.totalDowntimeBottleNeck +
          prev.performanceIssue.totalDowntimeBottleNeck,
        bottleNeckCycleTime: date.performanceIssue.bottleNeckCycleTime,
      },
      quality: 0,
      availability: 0,
      oee: 1,
      performance: 1,
      target: date.target + prev.target,
      workingTime: {
        min: date.workingTime.min + prev.workingTime.min,
        time: prev.workingTime.time,
      },
      startAt: moment(date.startAt).isBefore(moment(prev.startAt))
        ? date.startAt
        : prev.startAt,
      endAt: moment(date.endAt).isAfter(moment(prev.endAt))
        ? date.endAt
        : prev.endAt,
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
    if (!stationBottleNeck)
      throw new BadRequestException('station bottle neck is not exist');
    let plan = 0;
    // const dateNow = moment().set('h', 17).set('m', 0).toDate();
    const dateNow = moment().toDate();
    const isFuture = moment(dateNow).isBefore(timeShift.startDate);
    const isNowInTimeShiftRange = moment(dateNow).isBetween(
      timeShift.startDate,
      timeShift.endDate,
    );
    const breakTime = getBreakTime(
      dashboardDate.shift,
      new Date(dashboardDate.targetDate),
    );
    const isNowAfterBreak = moment(dateNow).isAfter(breakTime.endDate);
    const baseDashboard = await this.mappingDashboard(
      dashboardDate.lineId,
      timeShift,
      dashboardDate.shift,
      isNowInTimeShiftRange,
      isNowAfterBreak,
      isFuture,
      dateNow,
      date,
      targetPlan.workingTime.type,
    );
    const diffTime = this.diffDowntimeStartAndEnd(
      timeShift,
      baseDashboard.isDowntimeOccurBeforeBreak,
      isNowAfterBreak,
      isFuture,
    );
    const diffMinutes =
      diffTime - baseDashboard.availabilityIssue.downtimeBottleNeck;
    plan = Math.floor(
      Math.floor(diffMinutes) / stationBottleNeck.cycleTime.toNumber(),
    );
    if (isNowInTimeShiftRange) {
      if (plan < 0) plan = 0;
    } else {
      if (isFuture) plan = 0;
    }

    return {
      ...baseDashboard,
      bottleNeck: stationBottleNeck?.stationId || '',
      plan,
      group: targetPlan.group,
      startAt: timeShift.startDate,
      endAt: timeShift.endDate,
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
    isNowInTimeShiftRange: boolean,
    isNowAfterBreak: boolean,
    isFuture: boolean,
    dateNow: Date,
    baseDate?: { startDate: Date; endDate: Date },
    workingTimeType?: WORKING_TIME_TYPE,
  ): Promise<DashboardInner> {
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
      shift,
    );
    const target = plans.reduce((total, plan) => plan.target + total, 0);
    const goods = await this.findAllProductBetween(
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
    const {
      availabilityIssue,
      qualityIssue,
      oee,
      performanceIssue,
      isDowntimeOccurBeforeBreak,
    } = await this.calculatePercent({
      actualFinishGood: actual,
      lineId,
      shift,
      timeShift: date,
      workingMin: workingTime.min,
      failureDefect,
      isNowInTimeShiftRange,
      dateNow,
      isNowAfterBreak,
      isFuture,
    });
    return {
      failureDefect,
      failureTotal,
      downtimeDefect,
      downtimeTotal,
      target,
      availability: availabilityIssue.result,
      availabilityIssue,
      qualityIssue,
      quality: qualityIssue.result,
      isDowntimeOccurBeforeBreak,
      performance: performanceIssue.result,
      performanceIssue,
      oee: Number(oee.toFixed(2)),
      workingTime,
      actual,
      startAt: date.startDate,
      endAt: date.endDate,
    };
  }

  async findAllProductBetween(query: ProductQuery, start: Date, end: Date) {
    return await this.prisma.product.findMany({
      where: {
        timestamp: { gte: start, lte: end },
        isGoods: query.isGoods,
        model: { lineId: query.lineId },
      },
    });
  }

  async calculatePercent(params: CalculatePercentParams) {
    const downtimes = await this.findAllDowntimeBetween(
      params.lineId,
      params.timeShift.startDate,
      params.timeShift.endDate,
    );
    const stationBottleNeck = await this.prisma.station.findFirst({
      where: { lineId: params.lineId },
      orderBy: { cycleTime: 'desc' },
    });
    const bottleNeckDowntimes = downtimes.filter(
      (d) => d.stationId === stationBottleNeck.stationId,
    );
    const downtimesBeforeBreak = bottleNeckDowntimes.filter((b) => {
      const downtimeStart = moment(b.startAt);
      const breakStart = setTimeByMoment(
        b.startAt,
        TIME_RANGE.DAY_BREAK.start.hour,
        TIME_RANGE.DAY_BREAK.start.minute,
      );
      return downtimeStart.isBefore(breakStart);
    });
    const isDowntimeOccurBeforeBreak = downtimesBeforeBreak.length
      ? true
      : false;
    const availabilityIssue = await this.calculateAvailability({
      bottleNeckDowntimes,
      isDowntimeOccurBeforeBreak,
      timeShift: params.timeShift,
      shift: params.shift,
      dateNow: params.dateNow,
      isNowInTimeShiftRange: params.isNowInTimeShiftRange,
      isNowAfterBreak: params.isNowAfterBreak,
      isFuture: params.isFuture,
    });
    const qualityIssue = await this.calculateQuality({
      failureDefect: params.failureDefect,
      timeShift: params.timeShift,
    });
    const performanceIssue = await this.calculatePerformance({
      actualFinishGood: params.actualFinishGood,
      bottleNeckDowntimes: bottleNeckDowntimes,
      isDowntimeOccurBeforeBreak,
      downtimes: downtimes,
      isNowInTimeShiftRange: params.isNowInTimeShiftRange,
      shift: params.shift,
      stationBottleNeck: stationBottleNeck,
      timeShift: params.timeShift,
      totalDowntimeBottleNeck: availabilityIssue.downtimeBottleNeck,
      dateNow: params.dateNow,
      isNowAfterBreak: params.isNowAfterBreak,
      isFuture: params.isFuture,
    });
    const performance = performanceIssue?.result || 0;
    const quality = qualityIssue.result;
    const availability = availabilityIssue.result;
    const oee = (performance * availability * quality) / Math.pow(100, 2);
    return {
      performanceIssue,
      qualityIssue,
      availabilityIssue,
      oee,
      isDowntimeOccurBeforeBreak,
    };
  }

  async calculateQuality(params: QualityParams): Promise<QualityResult> {
    const productInputAtFirstOp =
      await this.prisma.productInputAmount.findFirst({
        where: {
          position: 'FIRST_OP',
          date: {
            gte: params.timeShift.startDate,
            lte: params.timeShift.endDate,
          },
        },
      });
    const result = productInputAtFirstOp
      ? this.qualityFormula(
          productInputAtFirstOp?.amount,
          params.failureDefect.length,
        )
      : 0;
    return {
      result: result,
      failureDefectAmount: params.failureDefect.length,
      productAmountAtFirstOp: productInputAtFirstOp?.amount || 0,
    };
  }

  qualityFormula(productAmountAtFirstOp: number, defectAmount: number) {
    if (!productAmountAtFirstOp || _.isNil(defectAmount)) return 0;
    const quality =
      ((productAmountAtFirstOp - defectAmount) * 100) / productAmountAtFirstOp;
    return Number(quality.toFixed(2)) || 0;
  }

  async calculateAvailability(params: AvailabilityParams) {
    const sumDowntimeBottleNeck = params.bottleNeckDowntimes.reduce(
      (prev, bd) => bd.duration.toNumber() + prev,
      0,
    );

    let issueDate: FullDate;
    if (params.isNowInTimeShiftRange) {
      issueDate = {
        startDate: params.timeShift.startDate,
        endDate: params.dateNow,
      };
    } else {
      issueDate = {
        startDate: params.timeShift.startDate,
        endDate: params.timeShift.endDate,
      };
    }
    const diffMinuteBetweenStartAndIssueDate = this.diffDowntimeStartAndEnd(
      issueDate,
      params.isDowntimeOccurBeforeBreak,
      params.isNowAfterBreak,
      params.isFuture,
    );
    const availability = this.availabilityFormula(
      diffMinuteBetweenStartAndIssueDate,
      sumDowntimeBottleNeck,
    );
    return {
      result: availability,
      diffMins: diffMinuteBetweenStartAndIssueDate,
      downtimeBottleNeck: sumDowntimeBottleNeck,
    };
  }

  availabilityFormula(diff: number, sumDowntime: number) {
    if (_.isNil(diff) || _.isNil(sumDowntime)) return 0;
    const result = ((diff - sumDowntime) * 100) / diff;
    return Number(result.toFixed(2)) || 0;
  }

  async calculatePerformance(
    params: PerformanceParams,
  ): Promise<PerformanceResult> {
    const productInputOfBottleNeck =
      await this.prisma.productInputAmount.findFirst({
        where: {
          position: 'BOTTLE_NECK',
          date: {
            gte: params.timeShift.startDate,
            lte: params.timeShift.endDate,
          },
        },
      });

    const stationAfterBottleNeck = await this.prisma.station.findMany({
      where: { sequence: { gt: params.stationBottleNeck.sequence } },
    });
    const stationThatDowntimeAfterBottleNeck = _.chain(params.downtimes)
      .intersectionWith(
        stationAfterBottleNeck,
        (a, b) => a.stationId === b.stationId,
      )
      .value();
    if (params.isNowInTimeShiftRange) {
      params.timeShift.endDate = params.dateNow;
    }
    const diffTime = this.diffDowntimeStartAndEnd(
      params.timeShift,
      params.isDowntimeOccurBeforeBreak,
      params.isNowAfterBreak,
      params.isFuture,
    );
    let actual: number;
    if (
      (stationThatDowntimeAfterBottleNeck.length &&
        !params.bottleNeckDowntimes.length) ||
      !params.isNowInTimeShiftRange
    ) {
      // If sequence after bottle neck station has any downtime
      actual = params.actualFinishGood;
    } else {
      // If no downtime on any station
      // If bottle neck & after bottle neck has any downtime
      // If bottle neck station has any downtime
      actual = productInputOfBottleNeck?.amount || 0;
    }
    const performance = this.performanceFormula({
      actual,
      cycleTime: params.stationBottleNeck.cycleTime,
      diffTime: diffTime,
      totalDowntimeBottleNeck: params.totalDowntimeBottleNeck,
    });
    return {
      diffTime,
      actual: actual,
      totalDowntimeBottleNeck: params.totalDowntimeBottleNeck,
      result: performance,
      bottleNeckCycleTime: params.stationBottleNeck.cycleTime.toNumber(),
    };
  }

  performanceFormula({ actual, cycleTime, diffTime, totalDowntimeBottleNeck }) {
    const actualOfBottleNeckPlan = Math.floor(
      (diffTime - totalDowntimeBottleNeck) / cycleTime,
    );

    const performance = (actual * 100) / actualOfBottleNeckPlan;
    return Number(performance.toFixed(2)) || 0;
  }

  diffDowntimeStartAndEnd(
    { startDate, endDate }: FullDate,
    isDowntimeOccurBeforeBreak: boolean,
    isNowAfterBreak: boolean,
    isFuture: boolean,
  ) {
    if (isFuture) return 0;
    if (isDowntimeOccurBeforeBreak && isNowAfterBreak) {
      return Math.floor(diffTimeAsMinutes(startDate, endDate) - 60);
    } else return Math.floor(diffTimeAsMinutes(startDate, endDate) - 60);
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
    const downtimeDefect = downtimes.map(
      (d): DowntimeDefect => ({
        details: d.availabilityLose.details,
        downtime: d.duration.toNumber(),
        id: d.availabilityId,
        station: d.stationId,
      }),
    );
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
        startAt: { gte: startDate, lte: endDate },
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
