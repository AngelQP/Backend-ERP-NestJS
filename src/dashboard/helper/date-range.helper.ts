import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Lima';

export const getTodayRange = () => {

  const start = dayjs().tz(TZ).startOf('day').utc().toDate();
  const end = dayjs().tz(TZ).endOf('day').utc().toDate();

  return { start, end };
};

export const getMonthRange = () => {

  const start = dayjs().tz(TZ).startOf('month').utc().toDate();
  const end = dayjs().tz(TZ).endOf('month').utc().toDate();

  return { start, end };
};

export const getWeekRange = () => {

  const start = dayjs().tz(TZ).startOf('week').add(1, 'day').utc().toDate();
  const end = dayjs().tz(TZ).endOf('week').add(1, 'day').utc().toDate();

  return { start, end };
};