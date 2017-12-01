import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD_HH_MM_SS = 'YYYY-MM-DD hh:mm:ss';
const TRAVEL_TIME = '2017-12-17 06:10:00';

export default class TravelHandler extends AbstractHandler {
    async getReply(msg, match) {
        const currentTime = moment().tz(TIME_ZONE);
        const travelTime = moment(TRAVEL_TIME, YYYY_MM_DD_HH_MM_SS).tz(TIME_ZONE);
        const duration = moment.duration(travelTime.diff(currentTime));

        return ResponseText.Travel.TIME_FROM_TRAVEL
            .replace('{d}', duration.days())
            .replace('{h}', duration.hours())
            .replace('{m}', duration.minutes())
            .replace('{s}', duration.seconds());
    }
}
