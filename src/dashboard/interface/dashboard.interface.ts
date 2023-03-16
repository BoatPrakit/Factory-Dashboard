import { Station } from '@prisma/client';

export type WorkingTime = {
  time: string;
  min: number;
};

export type DowntimeDefect = {
  id: string;
  details: string;
  station: string;
  downtime: number;
};

export type FailureDefect = {
  type: string;
  details: string;
  station: string;
  sum: number;
};

export interface DashboardBase {
  bottleNeck: string;
  oee: number;
  availability: number;
  availabilityIssue: AvailabilityResult;
  performanceIssue: PerformanceResult;
  performance: number;
  quality: number;
  qualityIssue: QualityResult;
  target: number;
  downtimeDefect: DowntimeDefect[];
  downtimeTotal: number;
  failureDefect: FailureDefect[];
  workingTime: WorkingTime;
  failureTotal: number;
  actual: number;
  startAt: Date;
  endAt: Date;
  plan: number;
}

export interface DashboardInner extends DashboardBase {
  isDowntimeOccurBeforeBreak: boolean;
}

export interface DashboardDateResponse extends DashboardBase {
  group: string;
}

export interface QualityResult {
  result: number;
  actualFinishGood: number;
  failureDefectAmount: number;
}
export interface AvailabilityResult {
  result: number;
  diffMins: number;
  downtimeBottleNeck: number;
}

export interface PerformanceResult {
  diffTime: number;
  actual: number;
  totalDowntimeBottleNeck: number;
  result: number;
  bottleNeckCycleTime: number;
}
