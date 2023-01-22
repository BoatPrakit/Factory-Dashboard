type WorkingTime = {
  time: string;
  min: number;
};

type DowntimeDefect = {
  id: string;
  details: string;
  station: string;
  downtime: number;
};

type FailureDefect = {
  type: string;
  details: string;
  station: string;
  sum: number;
};

export interface DashboardResponse {
  actual: number;
  //   oee: number;
  //   availability: number;
  //   performace: number;
  //   target: number;
  //   plan: number;
  //   workingTime: WorkingTime[];
  //   bottleNeck: string;
  //   downtimeDefect: DowntimeDefect[];
  //   downtimeTotal: number;
  //   failureDefect: FailureDefect[];
  //   failureTotal: number;
}
