import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as moment from 'moment';
import { TIME_RANGE } from './time-range';
import { FullDate } from './types/date.type';

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

export function getBreakTime(shift: SHIFT, date?: Date): FullDate {
  const { DAY_BREAK, NIGHT_BREAK } = TIME_RANGE;
  let startHour = DAY_BREAK.start.hour;
  let startMinute = DAY_BREAK.start.minute;
  let endHour = DAY_BREAK.end.hour;
  let endMinute = DAY_BREAK.end.minute;
  if (shift === 'NIGHT') {
    startHour = NIGHT_BREAK.start.hour;
    startMinute = NIGHT_BREAK.start.minute;
    endHour = NIGHT_BREAK.end.hour;
    endMinute = NIGHT_BREAK.end.minute;
  }
  const startAt = setTimeByMoment(date, startHour, startMinute).toDate();
  const endAt = setTimeByMoment(date, endHour, endMinute).toDate();
  return { startDate: startAt, endDate: endAt };
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
  workingTimeType: WORKING_TIME_TYPE = 'OVERTIME',
) {
  const now = new Date(targetDate);
  const currentShift = getCurrentShift(now);
  const timeShift = getShiftTimings(currentShift, workingTimeType, now);
  return timeShift;
}
