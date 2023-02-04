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
