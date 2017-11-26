import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

const LeaveResponseText = ResponseText.Leave;

const TIME_ZONE = 'Asia/Hong_Kong';
const HH_MM_SS = 'hh:mm:ss';
const WORK_START_TIME = '01:30:00';
const WORK_END_TIME = '10:30:00';
const SAT_INDEX = 6;
const SUN_INDEX = 0;

export default class LeaveHandler extends AbstractHandler {

    async getReply(msg, match) {
        const currentTime = moment().tz(TIME_ZONE);
        const workStartTime = moment(WORK_START_TIME, HH_MM_SS).tz(TIME_ZONE);
        const workEndTime = moment(WORK_END_TIME, HH_MM_SS).tz(TIME_ZONE);
        const weekDayIndex = currentTime.weekday();

        if ((weekDayIndex === SAT_INDEX) || (weekDayIndex === SUN_INDEX)) {
            return LeaveResponseText.WORK_ON_WEEKEND;
        }

        if (currentTime.isBefore(workStartTime) || currentTime.isAfter(workEndTime)) {
            return LeaveResponseText.NEED_OT;
        }

        const duration = moment.duration(workEndTime.diff(currentTime));

        return LeaveResponseText.TIME_FROM_OFF
            .replace('{h}', duration.hours())
            .replace('{m}', duration.minutes())
            .replace('{s}', duration.seconds());

    }
}
