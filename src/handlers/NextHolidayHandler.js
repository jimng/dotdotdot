import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

import CalendarUtil from '../utils/CalendarUtil';

const NextHolidayResponseText = ResponseText.NextHoliday;
const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD = 'YYYY-MM-DD';

export default class NextHolidayHandler extends AbstractHandler {
    async getReply(msg, match) {
        const nextRestDay = await CalendarUtil.getNextRestDay();
        const nextRestDayMoment = moment.tz(nextRestDay.date, YYYY_MM_DD, TIME_ZONE);
        const currentMoment = moment(TIME_ZONE).tz();

        const duration = moment.duration(nextRestDayMoment.diff(currentMoment));
        const numDays = Math.ceil(duration.asDays());

        if (numDays === 0) {
            return NextHolidayResponseText.ALREADY_HOLIDAY
                .replace('{title}', nextRestDay.title);
        } else {
            return NextHolidayResponseText.DAYS_FROM_HOLIDAY
                .replace('{title}', nextRestDay.title)
                .replace('{d}', numDays);
        }
    }
}
