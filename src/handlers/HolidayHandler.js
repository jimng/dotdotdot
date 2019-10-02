import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

import CalendarUtil from '../utils/CalendarUtil';
const TIME_ZONE = 'Asia/Hong_Kong';
const DATE_FORMAT = 'YYYY-MM-DD';
const HolidayResponseText = ResponseText.Holiday;

export default class HolidayHandler extends AbstractHandler {
    async getReply(msg, match) {
        const todayDate = moment().tz(TIME_ZONE).format(DATE_FORMAT);
        const holidays = await CalendarUtil.getHolidays(todayDate, 5);

        return HolidayResponseText.HOLIDAY_LIST
            + holidays.map((holiday) => HolidayResponseText.HOLIDAY_ITEM
                .replace('{d}', holiday.date)
                .replace('{n}', holiday.numDays)
                .replace('{t}', holiday.title)
            ).join('\n');
    }
}
