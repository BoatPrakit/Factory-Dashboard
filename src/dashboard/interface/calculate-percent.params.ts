import {
  Downtime,
  ExtendedFailureDetail,
  Failure,
  FailureDetail,
  Product,
  ProductHaveFailure,
  SHIFT,
  Station,
  WORKING_TIME_TYPE,
} from '@prisma/client';
import { FullDate } from 'src/utils/types/date.type';
import { FailureDefect } from './dashboard.interface';

export type FullFailure = ProductHaveFailure & {
  product: Product;
  failure: Failure & {
    station: Station;
    failureDetail: FailureDetail;
    extendedFailureDetail: ExtendedFailureDetail;
  };
};

export interface CalculatePercentParams {
  lineId: number;
  workingMin: number;
  actualFinishGood: number;
  timeShift: FullDate;
  shift: SHIFT;
  failureDefect: FullFailure[];
  isNowInTimeShiftRange: boolean;
  dateNow: Date;
  workingTimeType: WORKING_TIME_TYPE;
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
  workingTimeType: WORKING_TIME_TYPE;
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
  failureDefect: FullFailure[];
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
  workingTimeType: WORKING_TIME_TYPE;
}
