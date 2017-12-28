import moment from 'moment-timezone';
import Promise from 'bluebird';
import google from 'googleapis';

const HOLIDAY_CALENDER_ID = 'zh-tw.hong_kong%23holiday%40group.v.calendar.google.com';
const WEEKEND_CALENDER_ID = 'q680nit0a73v19qhq3lrj5o890@group.calendar.google.com';
const FIELDS = 'items/summary,items/start';
const ORDER_BY = 'startTime';
const YYYY_MM_DD = 'YYYY-MM-DD';

const calendar = google.calendar('v3');
const calendarEventsList = Promise.promisify(calendar.events.list);

async function getNextEvent(calendarId) {
    const response = await calendarEventsList({
        auth: process.env.GOOGLE_API_KEY,
        calendarId: calendarId,
        fields: FIELDS,
        orderBy: ORDER_BY,
        singleEvents: true,
        timeMin: moment().format(),
        maxResults: 1,
    });

    return {
        title: response.items[0].summary,
        date: response.items[0].start.date,
    };
}

async function getNextRestDay() {
    const nextHoliday = await getNextEvent(HOLIDAY_CALENDER_ID);
    const nextWeekend = await getNextEvent(WEEKEND_CALENDER_ID);
    const nextHolidayMoment = moment(nextHoliday.date, YYYY_MM_DD);
    const nextWeekendMoment = moment(nextWeekend.date, YYYY_MM_DD);

    if (nextWeekendMoment.isBefore(nextHolidayMoment)) {
        return nextWeekend;
    } else {
        return nextHoliday;
    }
}

module.exports = {
    getNextRestDay,
};
