import { Downtime, SHIFT, Station } from '@prisma/client';
import { FullDate } from 'src/utils/types/date.type';

export interface CalculatePercentParams {
  lineId: number;
  workingMin: number;
  actualFinishGood: number;
  timeShift: FullDate;
  shift: SHIFT;
}

export interface PerformanceParams {
  shift: SHIFT;
  isDowntimeOccurBeforeBreak: boolean;
  downtimes: Downtime[];
  bottleNeckDowntimes: Downtime[];
}

export interface AvailabilityParams {
  shift: SHIFT;
  isDowntimeOccurBeforeBreak: boolean;
  bottleNeckDowntimes: Downtime[];
  timeShift: FullDate;
}
