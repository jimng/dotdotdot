import R from 'ramda';
import Promise from 'bluebird';
import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const LeaveResponseText = ResponseText.Leave;

const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD = 'YYYY-MM-DD';
const HH_MM_SS = 'HH:mm:ss';
const DEFAULT_WORK_START_TIME = '01:30:00'; // In UTC time
const DEFAULT_WORK_END_TIME = '10:30:00'; // In UTC time
const SAT_INDEX = 6;
const SUN_INDEX = 0;

export default class LeaveHandler extends AbstractHandler {
    async getReply(msg, match, getConnectionDisposer) {
        const userId = msg.from.id;
        const currentMoment = moment().tz(TIME_ZONE);
        const currentDate = currentMoment.format(YYYY_MM_DD);
        const weekDayIndex = currentMoment.weekday();

        if ((weekDayIndex === SAT_INDEX) || (weekDayIndex === SUN_INDEX)) {
            return LeaveResponseText.WORK_ON_WEEKEND;
        }

        let workStartMoment;
        let workEndMoment;

        await Promise.using((getConnectionDisposer()), async(connection) => {
            const collection = connection.collection(DBSchema.Collections.USER_PROFILE);
            const userProfile = await collection.findOneAsync({
                '_id': userId,
            });
            const workStartTime = R.propOr(DEFAULT_WORK_START_TIME, DBSchema.UserProfiles.WORK_START_TIME, userProfile);
            const workEndTime = R.propOr(DEFAULT_WORK_END_TIME, DBSchema.UserProfiles.WORK_END_TIME, userProfile);

            workStartMoment = moment(`${currentDate}${workStartTime}`, `${YYYY_MM_DD}${HH_MM_SS}`).tz(TIME_ZONE);
            workEndMoment = moment(`${currentDate}${workEndTime}`, `${YYYY_MM_DD}${HH_MM_SS}`).tz(TIME_ZONE);
        });

        if (workStartMoment.isSame(workEndMoment)) {
            return LeaveResponseText.UNEMPLOYED;
        }

        if (workStartMoment.isBefore(workEndMoment)) {
            if (currentMoment.isBefore(workStartMoment) || currentMoment.isAfter(workEndMoment)) {
                return LeaveResponseText.NEED_OT;
            }

            const duration = moment.duration(workEndMoment.diff(currentMoment));

            return LeaveResponseText.TIME_FROM_OFF
                .replace('{h}', duration.hours())
                .replace('{m}', duration.minutes())
                .replace('{s}', duration.seconds());
        } else {
            if (currentMoment.isBefore(workStartMoment) && currentMoment.isAfter(workEndMoment)) {
                return LeaveResponseText.NEED_OT;
            }

            const duration = moment.duration(workEndMoment.add(1, 'day').diff(currentMoment));

            return LeaveResponseText.TIME_FROM_OFF
                .replace('{h}', duration.hours())
                .replace('{m}', duration.minutes())
                .replace('{s}', duration.seconds());
        }

    }
}
