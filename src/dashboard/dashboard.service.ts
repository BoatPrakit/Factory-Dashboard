import { BadRequestException, Injectable } from '@nestjs/common';
import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaintProductQuery,
  ProductQuery,
} from 'src/product/interface/product-query.interface';
import { ProductionPlanService } from 'src/production-plan/production-plan.service';
import {
  diffTimeAsMinutes,
  getBreakTimeMinutes,
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
  FullFailure,
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
    const startDate = moment([year, month - 1]).startOf('month');
    const endDate = moment(startDate).endOf('month');
    // const date = getStartDateAndEndDate(startDate, endDate);
    const dashboardWeekDto = new DashboardWeekDto();
    dashboardWeekDto.endDate = endDate.toISOString();
    dashboardWeekDto.startDate = startDate.toISOString();
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
    const defaultDashboard: DashboardInner = {
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
        actualFinishGood: 0,
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
      bottleNeck: '',
      plan: 0,
      isPaint: false,
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
      dashboardWeek.qualityIssue.actualFinishGood,
      dashboardWeek.qualityIssue.failureDefectAmount,
    );
    const performance = this.performanceFormula({
      actual: dashboardWeek.performanceIssue.actual,
      cycleTime: dashboardWeek.performanceIssue.bottleNeckCycleTime,
      diffTime: dashboardWeek.performanceIssue.diffTime,
      totalDowntimeBottleNeck:
        dashboardWeek.performanceIssue.totalDowntimeBottleNeck,
      isPaint: dashboardWeek.isPaint,
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
    prev: DashboardInner,
    date: DashboardDateResponse,
  ): DashboardInner {
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
        actualFinishGood:
          date.qualityIssue.actualFinishGood +
          prev.qualityIssue.actualFinishGood,
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
      bottleNeck: date.bottleNeck,
      plan: date.plan + prev.plan,
      isPaint: date.isPaint,
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

    const line = await this.prisma.line.findUnique({
      where: { lineId: dashboardDate.lineId },
    });
    const isPaint = line.lineName.toLowerCase().includes('paint');
    const timeShift = getShiftTimings(
      dashboardDate.shift,
      targetPlan.workingTime.type,
      isPaint,
      date.startDate,
    );
    const stationBottleNeck = await this.prisma.station.findFirst({
      where: { lineId: dashboardDate.lineId },
      orderBy: { cycleTime: 'desc' },
    });
    if (!stationBottleNeck)
      throw new BadRequestException('station bottle neck is not exist');
    // const dateNow = moment('2023-03-27T03:30:24.406Z')
    //   .set('h', 11)
    //   .set('m', 50)
    //   .toDate();
    // console.log(dateNow);

    const dateNow = moment().toDate();
    const isFuture = moment(dateNow).isBefore(timeShift.startDate);
    const isNowInTimeShiftRange = moment(dateNow).isBetween(
      timeShift.startDate,
      timeShift.endDate,
    );
    const baseDashboard = await this.mappingDashboard(
      dashboardDate.lineId,
      timeShift,
      dashboardDate.shift,
      isNowInTimeShiftRange,
      isPaint,
      isFuture,
      dateNow,
      date,
      targetPlan.workingTime.type,
    );

    return {
      ...baseDashboard,
      bottleNeck: stationBottleNeck?.stationId || '',
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
    isPaint: boolean,
    isFuture: boolean,
    dateNow: Date,
    baseDate?: { startDate: Date; endDate: Date },
    workingTimeType?: WORKING_TIME_TYPE,
  ): Promise<DashboardInner> {
    const { failureDefect, failureTotal, failures } = await this.mappingFailure(
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
    let goods;
    if (isPaint) {
      goods = await this.findAllPaintProductBetween(
        {
          isPaintFinish: true,
          lineId,
        },
        date.startDate,
        date.endDate,
      );
    } else {
      goods = await this.findAllProductBetween(
        { isGoods: true, lineId: lineId },
        date.startDate,
        date.endDate,
      );
    }
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
      stationBottleNeck,
    } = await this.calculatePercent({
      actualFinishGood: actual,
      lineId,
      shift,
      timeShift: date,
      workingMin: workingTime.min,
      failureDefect: failures,
      isNowInTimeShiftRange,
      dateNow,
      isFuture,
      isPaint,
      workingTimeType,
    });

    const diffTime = this.diffDowntimeStartAndEnd(
      date,
      shift,
      workingTimeType,
      dateNow,
      isPaint,
      isFuture,
      isNowInTimeShiftRange,
    );
    let plan;
    if (isPaint) {
      plan = Math.floor(diffTime / 2.33);
    } else {
      const diffMinutes = diffTime - availabilityIssue.downtimeBottleNeck;
      plan = Math.floor(
        Math.floor(diffMinutes) / stationBottleNeck.cycleTime.toNumber(),
      );
    }
    if (isNowInTimeShiftRange) {
      if (plan < 0) plan = 0;
    } else {
      if (isFuture) plan = 0;
    }

    const availability = availabilityIssue.result;
    const quality = qualityIssue.result;
    const performance = performanceIssue.result;
    return {
      failureDefect,
      failureTotal,
      downtimeDefect,
      downtimeTotal,
      target,
      availability,
      availabilityIssue,
      qualityIssue,
      quality,
      performance,
      performanceIssue,
      oee: Number(oee.toFixed(2)),
      workingTime,
      actual,
      startAt: date.startDate,
      endAt: date.endDate,
      bottleNeck: stationBottleNeck.stationId,
      plan,
      isPaint,
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

  async findAllPaintProductBetween(
    query: PaintProductQuery,
    start: Date,
    end: Date,
  ) {
    return await this.prisma.product.findMany({
      where: {
        paintAt: { gte: start, lte: end },
        isPaintFinish: query.isPaintFinish,
        paintLine: { lineId: query.lineId },
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
    const availabilityIssue = await this.calculateAvailability({
      downtimes,
      bottleNeckDowntimes,
      timeShift: params.timeShift,
      shift: params.shift,
      dateNow: params.dateNow,
      isFuture: params.isFuture,
      isPaint: params.isPaint,
      isNowInTimeShiftRange: params.isNowInTimeShiftRange,
      workingTimeType: params.workingTimeType,
    });
    const qualityIssue = await this.calculateQuality({
      actualFinishGood: params.actualFinishGood,
      totalFailure: params.failureDefect.length,
      timeShift: params.timeShift,
    });
    const performanceIssue = await this.calculatePerformance({
      actualFinishGood: params.actualFinishGood,
      bottleNeckDowntimes: bottleNeckDowntimes,
      downtimes: downtimes,
      shift: params.shift,
      stationBottleNeck: stationBottleNeck,
      timeShift: params.timeShift,
      totalDowntimeBottleNeck: availabilityIssue.downtimeBottleNeck,
      dateNow: params.dateNow,
      isFuture: params.isFuture,
      totalFailure: params.failureDefect.length,
      isPaint: params.isPaint,
      isNowInTimeShiftRange: params.isNowInTimeShiftRange,
      failureDefect: params.failureDefect,
      workingTimeType: params.workingTimeType,
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
      stationBottleNeck,
    };
  }

  async calculateQuality(params: QualityParams): Promise<QualityResult> {
    const result = this.qualityFormula(
      params.actualFinishGood,
      params.totalFailure,
    );
    return {
      result: result,
      failureDefectAmount: params.totalFailure,
      actualFinishGood: params.actualFinishGood,
    };
  }

  qualityFormula(actualFinishGood: number, defectAmount: number) {
    if (!actualFinishGood || _.isNil(defectAmount)) return 0;
    const quality =
      (actualFinishGood * 100) / (actualFinishGood + defectAmount);
    return Number(quality.toFixed(2)) || 0;
  }

  async calculateAvailability(params: AvailabilityParams) {
    const issueArray = params.isPaint
      ? params.downtimes
      : params.bottleNeckDowntimes;

    const sumDowntime = issueArray.reduce(
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
      params.shift,
      params.workingTimeType,
      params.dateNow,
      params.isPaint,
      params.isFuture,
      params.isNowInTimeShiftRange,
    );
    const availability = this.availabilityFormula(
      diffMinuteBetweenStartAndIssueDate,
      sumDowntime,
    );
    return {
      result: availability,
      diffMins: diffMinuteBetweenStartAndIssueDate,
      downtimeBottleNeck: sumDowntime,
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
    const diffTime = this.diffDowntimeStartAndEnd(
      params.timeShift,
      params.shift,
      params.workingTimeType,
      params.dateNow,
      params.isPaint,
      params.isFuture,
      params.isNowInTimeShiftRange,
    );

    if (params.isPaint) {
      // const failureWithoutRT = params.failureDefect.filter(
      //   (f) => f.failure.failureDetail.type !== 'RT',
      // );
      const allProduct = params.actualFinishGood + params.failureDefect.length;
      const performance = this.performanceFormula({
        actual: allProduct,
        cycleTime: 0,
        diffTime,
        isPaint: params.isPaint,
        totalDowntimeBottleNeck: 0,
      });
      return {
        actual: allProduct,
        bottleNeckCycleTime: 0,
        diffTime: diffTime,
        result: performance,
        totalDowntimeBottleNeck: 0,
      };
    }
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
    let actual: number;
    if (
      (stationThatDowntimeAfterBottleNeck.length &&
        params.bottleNeckDowntimes.length) ||
      stationThatDowntimeAfterBottleNeck.length ||
      !params.isNowInTimeShiftRange
    ) {
      // If sequence after bottle neck station has any downtime
      actual = params.actualFinishGood + params.totalFailure;
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
      isPaint: params.isPaint,
    });
    return {
      diffTime,
      actual: actual,
      totalDowntimeBottleNeck: params.totalDowntimeBottleNeck,
      result: performance,
      bottleNeckCycleTime: params.stationBottleNeck.cycleTime.toNumber(),
    };
  }

  performanceFormula({
    actual,
    cycleTime,
    diffTime,
    totalDowntimeBottleNeck,
    isPaint,
  }) {
    if (isPaint) {
      const paintPerformance = (actual * 100) / Math.floor(diffTime / 2.33);
      return Number(paintPerformance.toFixed(2));
    }
    const actualOfBottleNeckPlan = Math.floor(
      (diffTime - totalDowntimeBottleNeck) / cycleTime,
    );

    const performance = (actual * 100) / actualOfBottleNeckPlan;
    return Number(performance.toFixed(2)) || 0;
  }

  diffDowntimeStartAndEnd(
    { startDate, endDate }: FullDate,
    shift: SHIFT,
    workingType: WORKING_TIME_TYPE,
    dateNow: Date,
    isPaint: boolean,
    isFuture: boolean,
    isNowInTimeShiftRange: boolean,
  ) {
    if (isFuture) return 0;
    const breakTimeMinutes = getBreakTimeMinutes(shift, isPaint, dateNow, {
      startDate,
      endDate,
    });
    if (isNowInTimeShiftRange) {
      endDate = dateNow;
    }
    let diffMinutes = Math.floor(
      diffTimeAsMinutes(startDate, endDate) - breakTimeMinutes,
    );
    if (isPaint) {
      if (shift === 'DAY') {
        if (workingType === 'OVERTIME')
          diffMinutes = diffMinutes > 254 ? 254 : diffMinutes;
        else diffMinutes = diffMinutes > 179 ? 179 : diffMinutes;
      } else {
        if (workingType === 'OVERTIME')
          diffMinutes = diffMinutes > 333 ? 333 : diffMinutes;
        else diffMinutes = diffMinutes > 249 ? 249 : diffMinutes;
      }
    }
    return diffMinutes;
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
        extendedCauseDetails: d.extendedCause?.details,
        extendedCauseDigit: d.extendedCause?.digit,
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
  ): Promise<{
    failures: FullFailure[];
    failureDefect: FailureDefect[];
    failureTotal: number;
  }> {
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
        extendedDetails: defect.failure?.extendedFailureDetail?.details,
        extendedDetailId: defect.failure?.extendedFailureId,
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
      failures,
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
      include: { availabilityLose: true, extendedCause: true },
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
        failure: {
          include: {
            failureDetail: true,
            station: true,
            extendedFailureDetail: true,
          },
        },
        product: true,
      },
    });
  }
}
