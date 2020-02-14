import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

const TimeResponseText = ResponseText.Time;

const HK_TIME_ZONE = 'Asia/Hong_Kong';
const LUX_TIME_ZONE = 'Europe/Luxembourg';

export default class LeaveHandler extends AbstractHandler {
    async getReply(msg, match) {
        const now = moment();
        const currentHkTime = now.tz(HK_TIME_ZONE).format('h:mm:ssa');
        const currentLuxTime = now.tz(LUX_TIME_ZONE).format('h:mm:ssa');

        return TimeResponseText.TIME
            .replace('{hk}', currentHkTime)
            .replace('{lux}', currentLuxTime);
    }
}
