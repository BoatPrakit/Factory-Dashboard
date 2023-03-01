export type TimeRangeType = {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
};
export const TIME_RANGE = {
  DAY_OT: {
    start: {
      hour: 7,
      minute: 30,
    },
    end: {
      hour: 16,
      minute: 30,
    },
  },
  DAY_NOT_OT: {
    start: {
      hour: 7,
      minute: 30,
    },
    end: {
      hour: 20,
      minute: 0,
    },
  },
  NIGHT_NOT_OT: {
    start: {
      hour: 22,
      minute: 0,
    },
    end: {
      hour: 7,
      minute: 30,
    },
  },
  NIGHT_OT: {
    start: {
      hour: 20,
      minute: 0,
    },
    end: {
      hour: 7,
      minute: 30,
    },
  },
};
