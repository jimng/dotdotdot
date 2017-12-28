import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

import CalendarUtil from '../utils/CalendarUtil';

const HolidayResponseText = ResponseText.Holiday;
const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD = 'YYYY-MM-DD';

export default class HolidayHandler extends AbstractHandler {
    async getReply(msg, match) {
        const nextRestDay = await CalendarUtil.getNextRestDay();
        const nextRestDayMoment = moment(nextRestDay.date, YYYY_MM_DD).tz(TIME_ZONE);
        const currentMoment = moment().tz(TIME_ZONE);

        const duration = moment.duration(nextRestDayMoment.diff(currentMoment));
        const numDays = Math.ceil(duration.asDays());

        if (numDays === 0) {
            return HolidayResponseText.ALREADY_HOLIDAY
                .replace('{title}', nextRestDay.title);
        } else {
            return HolidayResponseText.DAYS_FROM_HOLIDAY
                .replace('{title}', nextRestDay.title)
                .replace('{d}', numDays);
        }
    }
}
