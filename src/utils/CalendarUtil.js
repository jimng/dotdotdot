import moment from 'moment-timezone';
import { google } from 'googleapis';

const TIME_ZONE = 'Asia/Hong_Kong';
const HOLIDAY_CALENDER_ID = 'npsi097cth30gh8cone7u4e2b481i6cj@import.calendar.google.com';
const WEEKEND_CALENDER_ID = 'q680nit0a73v19qhq3lrj5o890@group.calendar.google.com';
const FIELDS = 'items/summary,items/start';
const ORDER_BY = 'startTime';
const YYYY_MM_DD = 'YYYY-MM-DD';
const LOOKUP_NUM_ITEMS = 10;

const calendar = google.calendar('v3');

async function getNextEvents(calendarId, numItems = 1) {
    const response = await calendar.events.list({
        auth: process.env.GOOGLE_API_KEY,
        calendarId: calendarId,
        fields: FIELDS,
        orderBy: ORDER_BY,
        singleEvents: true,
        timeMin: moment().tz(TIME_ZONE).format(),
        maxResults: numItems,
    });

    return response.data.items.map((item) => ({
        title: item.summary,
        date: item.start.date,
    }));
}

async function getNextRestDay() {
    const nextHoliday = (await getNextEvents(HOLIDAY_CALENDER_ID))[0];
    const nextWeekend = (await getNextEvents(WEEKEND_CALENDER_ID))[0];
    const nextHolidayMoment = moment.tz(nextHoliday.date, YYYY_MM_DD, TIME_ZONE);
    const nextWeekendMoment = moment.tz(nextWeekend.date, YYYY_MM_DD, TIME_ZONE);

    if (nextWeekendMoment.isBefore(nextHolidayMoment)) {
        return nextWeekend;
    } else {
        return nextHoliday;
    }
}

async function getRestDaysSet() {
    const holidays = await getNextEvents(HOLIDAY_CALENDER_ID, LOOKUP_NUM_ITEMS);
    const weekends = await getNextEvents(WEEKEND_CALENDER_ID, LOOKUP_NUM_ITEMS);
    const numHolidays = holidays.length;
    const numWeekends = weekends.length;
    let restDays = new Set();

    for (let i = 0; i < numHolidays; i++) {
        restDays.add(holidays[i].date);
    }

    for (let i = 0; i < numWeekends; i++) {
        restDays.add(weekends[i].date);
    }

    return restDays;
}

module.exports = {
    getNextRestDay,
    getRestDaysSet,
};
