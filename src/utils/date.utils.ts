import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as moment from 'moment';
import { TIME_RANGE } from './time-range';
import { FullDate } from './types/date.type';

export function getStartDateAndEndDate(start: string, end?: string) {
  const startDate = moment(start);
  if (!isDayShift(startDate.toDate())) {
    startDate.subtract(1, 'day');
  }
  return {
    startDate: startDate.startOf('day').toDate(),
    endDate: moment(end ? end : startDate)
      .endOf('day')
      .toDate(),
  };
}

export function diffTimeAsMinutes(
  startDate: Date | string,
  endDate: Date | string,
) {
  const start = moment(startDate);
  const end = moment(endDate);
  const duration = moment.duration(end.diff(start)).asMinutes();
  return duration;
}

export function setTimeByMoment(
  date: Date | string,
  hour: number,
  minute: number,
) {
  return moment(date).set('hour', hour).set('minute', minute);
}

export function getShiftTimings(
  shift: SHIFT,
  workingTime: WORKING_TIME_TYPE,
  isPaint: boolean,
  targetDate?: Date,
) {
  let startHour: number;
  let startMinute: number;
  let endHour: number;
  let endMinute: number;
  let addDays = 0;
  let reduceDays = 0;
  const { DAY_NOT_OT, DAY_OT, NIGHT_NOT_OT, NIGHT_OT } = TIME_RANGE;

  if (shift === 'DAY') {
    startHour = DAY_NOT_OT.start.hour;
    startMinute = DAY_NOT_OT.start.minute;

    if (workingTime === 'OVERTIME') {
      endHour = DAY_OT.end.hour;
      endMinute = DAY_OT.end.minute;
    } else {
      endHour = DAY_NOT_OT.end.hour;
      endMinute = DAY_NOT_OT.end.minute;
    }

    if (isPaint) {
      startHour = DAY_NOT_OT.paint.start.hour;
      startMinute = DAY_NOT_OT.paint.start.minute;
      if (workingTime === 'OVERTIME') {
        endHour = DAY_OT.paint.end.hour;
        endMinute = DAY_OT.paint.end.minute;
      } else {
        endHour = DAY_NOT_OT.paint.end.hour;
        endMinute = DAY_NOT_OT.paint.end.minute;
      }
    }
  } else {
    endHour = NIGHT_NOT_OT.end.hour;
    endMinute = NIGHT_NOT_OT.end.minute;
    addDays = 1;
    const now = moment(targetDate);
    const dayShiftStart = moment(now).set('hour', 7).set('minute', 30);
    const midnight = moment(now).set('hour', 0).set('minute', 0);
    const hour = now.get('hour');
    if (hour >= 0 && hour < 8) {
      if (now.isBetween(midnight, dayShiftStart)) {
        reduceDays = 1;
        addDays = 0;
      }
    }
    if (workingTime === 'OVERTIME') {
      startHour = NIGHT_OT.start.hour;
      startMinute = NIGHT_OT.start.minute;
    } else {
      startHour = NIGHT_NOT_OT.start.hour;
      startMinute = NIGHT_NOT_OT.start.minute;
    }
    if (isPaint) {
      endHour = NIGHT_NOT_OT.paint.end.hour;
      endMinute = NIGHT_NOT_OT.paint.end.minute;
      if (workingTime === 'OVERTIME') {
        startHour = NIGHT_OT.paint.start.hour;
        startMinute = NIGHT_OT.paint.start.minute;
      } else {
        startHour = NIGHT_NOT_OT.paint.start.hour;
        startMinute = NIGHT_NOT_OT.paint.start.minute;
      }
    }
  }

  const startDate = moment(targetDate);
  // console.log('startDate', startDate);
  startDate.hours(startHour);
  startDate.minutes(startMinute);
  startDate.seconds(0);
  startDate.milliseconds(0);

  const endDate = moment(targetDate);
  endDate.hours(endHour);
  endDate.minutes(endMinute);
  endDate.seconds(0);
  endDate.milliseconds(0);

  if (shift === 'NIGHT' && addDays > 0) {
    endDate.add(addDays, 'day');
  }

  if (shift === 'NIGHT' && reduceDays > 0) {
    startDate.subtract(reduceDays, 'day');
  }

  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}

function isDayShift(targetDate: Date) {
  const date = moment(targetDate);
  const hour = date.hour();
  const dayShiftStart = moment(date).set('hour', 7).set('minute', 30);

  if (
    hour >= TIME_RANGE.DAY_OT.start.hour &&
    hour < TIME_RANGE.NIGHT_OT.start.hour &&
    date.isAfter(dayShiftStart)
  ) {
    return true;
  }
  return false;
}

export function getCurrentShift(currentTime: Date): SHIFT {
  const now = moment(currentTime);

  if (isDayShift(now.toDate())) {
    return 'DAY';
  } else {
    return 'NIGHT';
  }
}

export function getBreakTimeMinutes(
  shift: SHIFT,
  isPaint: boolean,
  dateNow: Date,
  timeShift: FullDate,
): number {
  const { DAY_BREAK, NIGHT_BREAK } = TIME_RANGE;
  let issueArray: any[] = DAY_BREAK.normal;
  let isNight = false;
  if (shift === 'DAY') {
    if (isPaint) issueArray = DAY_BREAK.paint;
  } else {
    isNight = true;
    issueArray = NIGHT_BREAK.normal;
    if (isPaint) issueArray = NIGHT_BREAK.paint;
  }
  const breakTimeMinutes = issueArray.reduce(
    calculateBreakTime(isNight, timeShift, dateNow),
    0,
  );
  return breakTimeMinutes;
}

function calculateBreakTime(isNight: boolean, date: FullDate, dateNow: Date) {
  return (total, p) => {
    const startAt = setTimeByMoment(
      date.startDate,
      p.start.hour,
      p.start.minute,
    );
    // if (isNight) {
    startAt.add(p.addDays, 'day');
    // }

    const endAt = setTimeByMoment(date.startDate, p.end.hour, p.end.minute);
    if (
      moment(dateNow).isBefore(startAt) ||
      moment(endAt).isAfter(date.endDate)
    )
      return total;
    // if (isNight)
    endAt.add(p.addDays, 'day');

    const isNowInBreakTime = moment(dateNow).isBetween(startAt, endAt);

    const diffTime = moment(isNowInBreakTime ? dateNow : endAt).diff(
      startAt,
      'minutes',
    );
    return total + Math.floor(diffTime);
  };
}

export function isDateToday(targetDate: Date) {
  const isToday = moment(targetDate).isSame(new Date(), 'day');
  return isToday;
}

export function isNowInTimeShiftRange(startDate: Date, endDate: Date) {
  return moment().isBetween(startDate, endDate);
}

export function getStartEndDateCurrentShift(
  targetDate: Date,
  isPaint: boolean,
  workingTimeType: WORKING_TIME_TYPE = 'OVERTIME',
) {
  const now = new Date(targetDate);
  const currentShift = getCurrentShift(now);
  const timeShift = getShiftTimings(
    currentShift,
    workingTimeType,
    isPaint,
    now,
  );
  return timeShift;
}
