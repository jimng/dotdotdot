import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

const LeaveResponseText = ResponseText.Leave;

const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD = 'YYYY-MM-DD';
const HH_MM_SS = 'HH:mm:ss';
const WORK_START_TIME = '12:00:00'; // In HK time
const WORK_END_TIME = '18:30:00'; // In HK time
const SAT_INDEX = 6;
const SUN_INDEX = 0;

export default class LeaveHandler extends AbstractHandler {
    async getReply(msg, match) {
        const currentMoment = moment().tz(TIME_ZONE);
        const currentDate = currentMoment.format(YYYY_MM_DD);
        const workStartMoment = moment.tz(`${currentDate}${WORK_START_TIME}`, `${YYYY_MM_DD}${HH_MM_SS}`, TIME_ZONE);
        const workEndMoment = moment.tz(`${currentDate}${WORK_END_TIME}`, `${YYYY_MM_DD}${HH_MM_SS}`, TIME_ZONE);
        const weekDayIndex = currentMoment.weekday();

        if ((weekDayIndex === SAT_INDEX) || (weekDayIndex === SUN_INDEX)) {
            return LeaveResponseText.WORK_ON_WEEKEND;
        }

        if (currentMoment.isBefore(workStartMoment) || currentMoment.isAfter(workEndMoment)) {
            return LeaveResponseText.NEED_OT;
        }

        const duration = moment.duration(workEndMoment.diff(currentMoment));

        return LeaveResponseText.TIME_FROM_OFF
            .replace('{h}', duration.hours())
            .replace('{m}', duration.minutes())
            .replace('{s}', duration.seconds());
    }
}
