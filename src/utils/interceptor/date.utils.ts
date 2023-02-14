import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as moment from 'moment';

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

  if (shift === 'DAY') {
    startHour = 7;
    startMinute = 30;

    if (workingTime === WORKING_TIME_TYPE.OVERTIME) {
      endHour = 20;
      endMinute = 0;
    } else {
      endHour = 16;
      endMinute = 30;
    }
  } else {
    endHour = 7;
    endMinute = 30;
    if (workingTime === WORKING_TIME_TYPE.OVERTIME) {
      startHour = 20;
      startMinute = 0;
    } else {
      startHour = 22;
      startMinute = 0;
    }
  }

  const startDate = moment(targetDate);
  startDate.hours(startHour);
  startDate.minutes(startMinute);
  startDate.seconds(0);
  startDate.milliseconds(0);

  const endDate = moment(targetDate);
  endDate.hours(endHour);
  endDate.minutes(endMinute);
  endDate.seconds(0);
  endDate.milliseconds(0);

  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}
