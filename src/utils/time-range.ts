export type TimeRangeType = {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
};
export const TIME_RANGE = {
  NIGHT_BREAK: {
    paint: [
      {
        start: {
          hour: 22,
          minute: 0,
        },
        end: {
          hour: 22,
          minute: 30,
        },
        addDays: 0,
      },
      {
        start: {
          hour: 2,
          minute: 40,
        },
        end: {
          hour: 3,
          minute: 20,
        },
        addDays: 1,
      },
      {
        start: {
          hour: 22,
          minute: 30,
        },
        end: {
          hour: 0,
          minute: 10,
        },
        addDays: 1,
        reduceStart: 1,
      },
      {
        start: {
          hour: 0,
          minute: 38,
        },
        end: {
          hour: 1,
          minute: 5,
        },
        addDays: 1,
      },
      {
        start: {
          hour: 3,
          minute: 38,
        },
        end: {
          hour: 4,
          minute: 30,
        },
        addDays: 1,
      },
      {
        start: {
          hour: 4,
          minute: 45,
        },
        end: {
          hour: 5,
          minute: 50,
        },
        addDays: 1,
      },
    ],
    normal: [
      {
        start: {
          hour: 3,
          minute: 0,
        },
        end: {
          hour: 3,
          minute: 40,
        },
        addDays: 1,
      },
      {
        start: {
          hour: 0,
          minute: 30,
        },
        end: {
          hour: 0,
          minute: 40,
        },
        addDays: 1,
      },
      {
        start: {
          hour: 5,
          minute: 30,
        },
        end: {
          hour: 5,
          minute: 40,
        },
        addDays: 1,
      },
    ],
  },
  DAY_BREAK: {
    paint: [
      {
        start: {
          hour: 11,
          minute: 40,
        },
        end: {
          hour: 12,
          minute: 20,
        },
        addDays: 0,
      },
      {
        start: {
          hour: 16,
          minute: 18,
        },
        end: {
          hour: 17,
          minute: 0,
        },
        addDays: 0,
      },
      {
        start: {
          hour: 9,
          minute: 38,
        },
        end: {
          hour: 10,
          minute: 50,
        },
        addDays: 0,
      },
      {
        start: {
          hour: 12,
          minute: 20,
        },
        end: {
          hour: 13,
          minute: 44,
        },
        addDays: 0,
      },
      {
        start: {
          hour: 14,
          minute: 45,
        },
        end: {
          hour: 15,
          minute: 40,
        },
        addDays: 0,
      },
      {
        start: {
          hour: 17,
          minute: 52,
        },
        end: {
          hour: 17,
          minute: 15,
        },
      },
    ],
    normal: [
      {
        start: {
          hour: 12,
          minute: 0,
        },
        end: {
          hour: 13,
          minute: 0,
        },
      },
      {
        start: {
          hour: 16,
          minute: 30,
        },
        end: {
          hour: 17,
          minute: 0,
        },
      },
    ],
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
    paint: {
      start: {
        hour: 9,
        minute: 4,
      },
      end: {
        hour: 19,
        minute: 40,
      },
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
    paint: {
      start: {
        hour: 9,
        minute: 4,
      },
      end: {
        hour: 16,
        minute: 18,
      },
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
    paint: {
      start: {
        hour: 0,
        minute: 10,
      },
      end: {
        hour: 7,
        minute: 30,
      },
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
    paint: {
      start: {
        hour: 20,
        minute: 35,
      },
      end: {
        hour: 7,
        minute: 30,
      },
    },
  },
};
