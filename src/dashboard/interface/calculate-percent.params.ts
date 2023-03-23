import { Downtime, SHIFT, Station } from '@prisma/client';
import { FullDate } from 'src/utils/types/date.type';
import { FailureDefect } from './dashboard.interface';

export interface CalculatePercentParams {
  lineId: number;
  workingMin: number;
  actualFinishGood: number;
  timeShift: FullDate;
  shift: SHIFT;
  failureDefect: FailureDefect[];
  isNowInTimeShiftRange: boolean;
  dateNow: Date;
  // isNowAfterBreak: boolean;
  isFuture: boolean;
  isPaint: boolean;
}

export interface QualityParams {
  actualFinishGood: number;
  totalFailure: number;
  timeShift: FullDate;
}
export interface PerformanceParams {
  shift: SHIFT;
  dateNow: Date;
  // isDowntimeOccurBeforeBreak: boolean;
  downtimes: Downtime[];
  totalDowntimeBottleNeck: number;
  bottleNeckDowntimes: Downtime[];
  stationBottleNeck: Station;
  timeShift: FullDate;
  totalFailure: number;
  actualFinishGood: number;
  isNowInTimeShiftRange: boolean;
  // isNowAfterBreak: boolean;
  isFuture: boolean;
  isPaint: boolean;
}

export interface AvailabilityParams {
  isPaint: boolean;
  downtimes: Downtime[];
  dateNow: Date;
  shift: SHIFT;
  isNowInTimeShiftRange: boolean;
  // isDowntimeOccurBeforeBreak: boolean;
  bottleNeckDowntimes: Downtime[];
  timeShift: FullDate;
  // isNowAfterBreak: boolean;
  isFuture: boolean;
}
