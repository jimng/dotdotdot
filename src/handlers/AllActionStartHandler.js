import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const DEFAULT_DETECT_DURATION_IN_SECOND = 60;
const MIN_DETECT_DURATION_IN_SECOND = 3;
const MAX_DETECT_DURATION_IN_SECOND = 300;

export default class AllActionStartHandler extends AbstractHandler {
    async _getStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.ALL_ACTION);

        return collection.findOneAsync({
            '_id': chatId,
        });
    }

    async _getChatUsers(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.CHAT_USERS);
        const chatUsersMap = (await collection.findOneAsync({
            '_id': chatId,
        })).users;

        return Object.values(chatUsersMap);
    }

    async _insertStatus(connection, chatId, userId, durationInSecond) {
        const collection = connection.collection(DBSchema.Collections.ALL_ACTION);
        const chatUserIds = (await this._getChatUsers(connection, chatId)).map(chatUser => chatUser.id);
        let usersStatus = {};

        chatUserIds.forEach((chatUserId) => {
            usersStatus[chatUserId] = false;
        });
        usersStatus[userId] = true;

        await collection.update(
            { '_id': chatId },
            {
                usersStatus,
                timestamp: Date.now(),
                durationInSecond,
            },
            { upsert: true }
        );
    }

    async handle(msg, match, getConnectionDisposer) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const actionName = match[1].toLowerCase();
        const durationInSecond = match[2] !== undefined ? parseInt(match[2], 10) : DEFAULT_DETECT_DURATION_IN_SECOND;

        if (durationInSecond > MAX_DETECT_DURATION_IN_SECOND) {
            const message = ResponseText.AllAction.EXCEED_MAX
                .replace(/{max}/g, MAX_DETECT_DURATION_IN_SECOND)
                .replace(/{min}/g, MIN_DETECT_DURATION_IN_SECOND);

            await this._bot.sendMessage(chatId, message);

            throw new Error('Invalid duration');
        }

        if (durationInSecond < MIN_DETECT_DURATION_IN_SECOND) {
            const message = ResponseText.AllAction.EXCEED_MIN
                .replace(/{max}/g, MAX_DETECT_DURATION_IN_SECOND)
                .replace(/{min}/g, MIN_DETECT_DURATION_IN_SECOND);

            await this._bot.sendMessage(chatId, message);

            throw new Error('Invalid duration');
        }

        await Promise.using(getConnectionDisposer(), async(connection) => {
            const status = await this._getStatus(connection, chatId, userId);

            if ((status !== null) && ((Date.now() - status.timestamp) < status.durationInSecond * 1000)) {
                const message = ResponseText.AllAction.ALREADY_STARTED
                    .replace(/{a}/g, actionName);

                await this._bot.sendMessage(chatId, message);

                throw new Error('Already Started');
            }

            const startMessage = ResponseText.AllAction.START
                .replace(/{a}/g, actionName)
                .replace(/{d}/g, durationInSecond);

            await this._bot.sendMessage(chatId, startMessage);
            await this._insertStatus(connection, chatId, userId, durationInSecond);
        });

        await new Promise.delay(durationInSecond * 1000);
        await Promise.using(getConnectionDisposer(), async(connection) => {
            const { usersStatus } = await this._getStatus(connection, chatId, userId);
            const chatUsers = await this._getChatUsers(connection, chatId);
            const reportedResult = ResponseText.AllAction.RESULT_REPORTED;
            const notReportedResult = ResponseText.AllAction.RESULT_NOT_REPORTED;
            const result = ResponseText.AllAction.RESULT_PREFIX
                .replace(/{a}/g, actionName) +
                chatUsers.map((chatUser) => (
                    `${chatUser.first_name}: ${usersStatus[chatUser.id] ? reportedResult : notReportedResult}`
                )).join('\n');

            await this._bot.sendMessage(chatId, result);
        });
    }
}
