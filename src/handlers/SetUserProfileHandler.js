import Promise from 'bluebird';
import moment from 'moment';

import AbstractHandler from './AbstractHandler';

import Commands from '../constants/Commands';
import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const DATE_PREFIX = '1970-01-01';
const INVALID_DATE = 'Invalid date';

export default class ConfigToggleHandler extends AbstractHandler {
    async getReply(msg, match, getConnectionDisposer) {
        const userId = msg.from.id;
        let settingKey;
        let settingValue;

        switch (match[1]) {
            case Commands.SET_WORK_START_TIME:
                settingKey = DBSchema.UserProfiles.WORK_START_TIME;
                settingValue = moment(`${DATE_PREFIX}T${match[3]}`).format('HH:mm:ss');
                if (settingValue === INVALID_DATE) {
                    return ResponseText.UserProfile.INVALID_WORK_START_TIME;
                }
                break;

            case Commands.SET_WORK_END_TIME:
                settingKey = DBSchema.UserProfiles.WORK_END_TIME;
                settingValue = moment(`${DATE_PREFIX}T${match[3]}`).format('HH:mm:ss');
                if (settingValue === INVALID_DATE) {
                    return ResponseText.UserProfile.INVALID_WORK_END_TIME;
                }
                break;

            default:
                throw new Error('Unknown setting type');
        }

        return Promise.using((getConnectionDisposer()), async(connection) => {
            await connection.collection(DBSchema.Collections.USER_PROFILE).update({
                '_id': userId,
            }, {
                $set: {
                    [settingKey]: settingValue,
                }
            }, { upsert: true });

            return ResponseText.UserProfile.SETTING_DONE;
        });
    }
}
