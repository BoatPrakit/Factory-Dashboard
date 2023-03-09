import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as moment from 'moment';
import { TIME_RANGE } from './time-range';

export function getStartDateAndEndDate(start: string, end?: string) {
  return {
    startDate: moment(start).startOf('day').toDate(),
    endDate: moment(end ? end : start)
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

export function getShiftTimings(
  shift: SHIFT,
  workingTime: WORKING_TIME_TYPE,
  targetDate?: Date,
) {
  let startHour: number;
  let startMinute: number;
  let endHour: number;
  let endMinute: number;
  let addDays = 0;
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
  } else {
    endHour = NIGHT_NOT_OT.end.hour;
    endMinute = NIGHT_NOT_OT.end.minute;
    if (workingTime === 'OVERTIME') {
      startHour = NIGHT_OT.start.hour;
      startMinute = NIGHT_OT.start.minute;
      addDays = 1;
    } else {
      startHour = NIGHT_NOT_OT.start.hour;
      startMinute = NIGHT_NOT_OT.start.minute;
      addDays = 1;
    }
  }

  const startDate = moment(targetDate);
  startDate.hours(startHour);
  startDate.minutes(startMinute);
  startDate.seconds(0);
  startDate.milliseconds(0);

  const endDate = moment(targetDate);
  endDate.hours(endHour);
  endDate.minutes(endMinute - 1);
  endDate.seconds(59);
  endDate.milliseconds(0);

  if (shift === 'NIGHT' && addDays > 0) {
    endDate.add(addDays, 'day');
  }

  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}

export function getCurrentShift(currentTime: Date): SHIFT {
  const hour = moment(currentTime).hour();

  if (
    hour >= TIME_RANGE.DAY_OT.start.hour &&
    hour < TIME_RANGE.NIGHT_OT.start.hour
  ) {
    return 'DAY';
  } else {
    return 'NIGHT';
  }
}

export function isDateToday(targetDate: Date) {
  const isToday = moment(targetDate).isSame(new Date(), 'day');
  return isToday;
}

export function isNowInTimeShiftRange(startDate: Date, endDate: Date) {
  return moment().isBetween(startDate, endDate);
}

export function getStartEndDateCurrentShift(
  workingTimeType: WORKING_TIME_TYPE = 'OVERTIME',
) {
  const now = new Date();
  const currentShift = getCurrentShift(now);
  const timeShift = getShiftTimings(currentShift, workingTimeType);
  return timeShift;
}
