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
  // oee: number;
  availability: number;
  availabilityIssue: AvailabilityResult;
  // performance: number;
  quality: number;
  qualityIssue: QualityResult;
  target: number;
  downtimeDefect: DowntimeDefect[];
  downtimeTotal: number;
  failureDefect: FailureDefect[];
  workingTime: WorkingTime;
  failureTotal: number;
  actual: number;
}

export interface DashboardDateResponse extends DashboardBase {
  plan: number;
  bottleNeck: string;
  group: string;
  startAt: Date;
  endAt: Date;
}

export interface QualityResult {
  result: number;
  productAmountAtFirstOp: number;
  failureDefectAmount: number;
}
export interface AvailabilityResult {
  result: number;
  diffMins: number;
  downtimeBottleNeck: number;
}
