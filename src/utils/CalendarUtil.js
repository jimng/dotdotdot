import axios from 'axios';
import moment from 'moment';

async function getHolidays(todayDate, numItems = 1) {
    const response = (await axios('http://www.1823.gov.hk/common/ical/tc.json')).data.trim();
    const allEvents = JSON.parse(response).vcalendar[0].vevent;
    const futureEvents = allEvents.filter((event) =>
        moment(event.dtstart[0]).isSameOrAfter(todayDate)
    ).slice(0, numItems);
    
    return futureEvents.map((event) => ({
        title: event.summary,
        date: moment(event.dtstart[0]).format('YYYY-MM-DD'),
        numDays: Math.ceil(
            moment.duration(
                moment(event.dtstart[0]).diff(moment(todayDate))
            ).asDays()
        ),
    }));
}

module.exports = {
    getHolidays,
};
