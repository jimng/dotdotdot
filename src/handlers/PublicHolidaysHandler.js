import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

import CalendarUtil from '../utils/CalendarUtil';

const PublicHolidaysResponseText = ResponseText.PublicHolidays;

export default class PublicHolidaysHandler extends AbstractHandler {
    async getReply(msg, match) {
        const holidays = await CalendarUtil.getPublicHolidays(5);
        
        return PublicHolidaysResponseText.HOLIDAY_LIST
            + holidays.map((holiday) => PublicHolidaysResponseText.HOLIDAY_ITEM
                .replace('{d}', holiday.date)
                .replace('{n}', holiday.numDays)
                .replace('{t}', holiday.title)
            ).join('\n');
    }
}
