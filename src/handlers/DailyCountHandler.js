import Promise from 'bluebird';
import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const TIME_ZONE = 'Asia/Hong_Kong';
const YYYY_MM_DD = 'YYYY-MM-DD';
const HH_MM_SS = 'HH:mm:ss';
const DAILY_CLEANUP_TIME = '08:00:00'; // In HK time

export default class DailyCountHandler extends AbstractHandler {
    async _isCheckingOn(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.CHAT_CONFIG);
        const chatConfig = await collection.findOneAsync({
            '_id': chatId,
        });

        return (chatConfig && chatConfig[DBSchema.ChatConfigs.DAILY_COUNT]) || false;
    }

    async _getNumChatUsers(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.CHAT_USERS);
        const chatUsersMap = (await collection.findOneAsync({
            '_id': chatId,
        })).users;

        return Object.keys(chatUsersMap).length;
    }

    _generateNewTimestamp() {
        return moment().tz(TIME_ZONE).format();
    }

    _isTimestampExpired(timestamp) {
        const currentMoment = moment().tz(TIME_ZONE);
        const currentDate = currentMoment.format(YYYY_MM_DD);
        const timestampMoment = moment.tz(timestamp, TIME_ZONE);
        const dailyCleanUpMoment = moment.tz(`${currentDate}${DAILY_CLEANUP_TIME}`, `${YYYY_MM_DD}${HH_MM_SS}`, TIME_ZONE);

        return (timestampMoment.isBefore(dailyCleanUpMoment) && currentMoment.isAfter(dailyCleanUpMoment));
    }

    async _updateDailyCount(connection, chatId, userId) {
        const collection = connection.collection(DBSchema.Collections.DAILY_COUNT);
        const numMembers = await this._getNumChatUsers(connection, chatId);

        let dailyCountObject = await collection.findOneAsync({
            '_id': chatId,
        });
        let isUpdated = false;

        if (!dailyCountObject || this._isTimestampExpired(dailyCountObject.timestamp)) {
            dailyCountObject = {
                timestamp: this._generateNewTimestamp(),
                members: {},
            };
            isUpdated = true;
        }

        if (!dailyCountObject.members[userId]) {
            dailyCountObject.members[userId] = true;
            isUpdated = true;
        }

        await collection.update(
            { '_id': chatId },
            dailyCountObject,
            { upsert: true }
        );

        return {
            isUpdated,
            numReportedMembers: Object.keys(dailyCountObject.members).length,
            numMembers,
        };
    }

    async handle(msg, match, getConnectionDisposer) {
        return Promise.using((getConnectionDisposer()), async(connection) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            const isCheckingOn = await this._isCheckingOn(connection, chatId);

            if (!isCheckingOn) {
                return;
            }

            const newStatus = await this._updateDailyCount(connection, chatId, userId);

            if (newStatus.isUpdated) {
                const replyMsgId = msg['message_id'];
                const responseText = ResponseText.DailyCount.REPORT
                    .replace('{c}', newStatus.numReportedMembers)
                    .replace('{t}', newStatus.numMembers);

                await this._bot.sendMessage(chatId, responseText, {
                    'reply_to_message_id': replyMsgId,
                });
            }
        });
    }
}
