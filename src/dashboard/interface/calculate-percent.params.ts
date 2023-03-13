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
  isNowAfterBreak: boolean;
}

export interface QualityParams {
  failureDefect: FailureDefect[];
  timeShift: FullDate;
}
export interface PerformanceParams {
  shift: SHIFT;
  dateNow: Date;
  isDowntimeOccurBeforeBreak: boolean;
  downtimes: Downtime[];
  totalDowntimeBottleNeck: number;
  bottleNeckDowntimes: Downtime[];
  stationBottleNeck: Station;
  timeShift: FullDate;
  actualFinishGood: number;
  isNowInTimeShiftRange: boolean;
  isNowAfterBreak: boolean;
}

export interface AvailabilityParams {
  dateNow: Date;
  shift: SHIFT;
  isNowInTimeShiftRange: boolean;
  isDowntimeOccurBeforeBreak: boolean;
  bottleNeckDowntimes: Downtime[];
  timeShift: FullDate;
  isNowAfterBreak: boolean;
}
