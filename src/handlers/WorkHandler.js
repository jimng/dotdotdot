import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

import CalendarUtil from '../utils/CalendarUtil';

const WorkResponseText = ResponseText.Work;

const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD = 'YYYY-MM-DD';
const HH_MM_SS = 'HH:mm:ss';
const WORK_START_TIME = '09:30:00'; // In HK time
const WORK_END_TIME = '18:30:00'; // In HK time

export default class WorkHandler extends AbstractHandler {
    async getReply(msg, match) {
        const restDaysSet = await CalendarUtil.getRestDaysSet();
        const currentMoment = moment().tz(TIME_ZONE);
        const currentDate = currentMoment.format(YYYY_MM_DD);
        const workStartMoment = moment.tz(`${currentDate}${WORK_START_TIME}`, `${YYYY_MM_DD}${HH_MM_SS}`, TIME_ZONE);
        const workEndMoment = moment.tz(`${currentDate}${WORK_END_TIME}`, `${YYYY_MM_DD}${HH_MM_SS}`, TIME_ZONE);

        if (!restDaysSet.has(currentDate)) {
            if (currentMoment.isBefore(workStartMoment)) {
                const duration = moment.duration(workStartMoment.diff(currentMoment));

                return WorkResponseText.SHORT_TIME_FROM_WORK
                    .replace('{d}', duration.days())
                    .replace('{h}', duration.hours())
                    .replace('{m}', duration.minutes())
                    .replace('{s}', duration.seconds());
            } else if (currentMoment.isAfter(workStartMoment) && currentMoment.isBefore(workEndMoment)) {
                return WorkResponseText.CONCENTRATE_WORK;
            }
        }

        let nextWorkStartMoment = workStartMoment.add(1, 'days');

        while (restDaysSet.has(nextWorkStartMoment.format(YYYY_MM_DD))) {
            nextWorkStartMoment = nextWorkStartMoment.add(1, 'days');
        }

        const duration = moment.duration(nextWorkStartMoment.diff(currentMoment));

        return WorkResponseText.TIME_FROM_WORK
            .replace('{d}', duration.days())
            .replace('{h}', duration.hours())
            .replace('{m}', duration.minutes())
            .replace('{s}', duration.seconds());
    }
}
