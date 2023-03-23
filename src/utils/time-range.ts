export type TimeRangeType = {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
};
export const TIME_RANGE = {
  NIGHT_BREAK: {
    paint: {
      start: {
        hour: 2,
        minute: 40,
      },
      end: {
        hour: 3,
        minute: 20,
      },
    },
    normal: {
      start: {
        hour: 0,
        minute: 0,
      },
      end: {
        hour: 1,
        minute: 0,
      },
    },
  },
  DAY_BREAK: {
    paint: {
      start: {
        hour: 11,
        minute: 40,
      },
      end: {
        hour: 12,
        minute: 20,
      },
    },
    normal: {
      start: {
        hour: 12,
        minute: 0,
      },
      end: {
        hour: 13,
        minute: 0,
      },
    },
  },
  DAY_OT: {
    start: {
      hour: 7,
      minute: 30,
    },
    end: {
      hour: 20,
      minute: 0,
    },
  },
  DAY_NOT_OT: {
    start: {
      hour: 7,
      minute: 30,
    },
    end: {
      hour: 16,
      minute: 30,
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
