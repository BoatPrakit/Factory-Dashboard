import * as moment from 'moment';

export function getStartDateAndEndDate(start: string, end?: string) {
  return {
    startDate: moment(new Date(start)).startOf('day').toDate(),
    endDate: moment(end ? new Date(end) : new Date(start))
      .endOf('day')
      .toDate(),
  };
}
