import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const DETECT_DURATION = 5 * 60 * 1000; // 5mins

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

    async _insertStatus(connection, chatId, userId) {
        const collection = connection.collection(DBSchema.Collections.ALL_ACTION);
        const chatUserIds = (await this._getChatUsers(connection, chatId)).map(chatUser => chatUser.id);
        let status = {};

        chatUserIds.forEach((chatUserId) => {
            status[chatUserId] = false;
        });
        status[userId] = true;

        await collection.update(
            { '_id': chatId },
            status,
            { upsert: true }
        );
    }

    async _removeStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.ALL_ACTION);

        await collection.deleteOneAsync({ '_id': chatId });
    }

    async handle(msg, match, getConnectionDisposer) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const actionName = match[1].toLowerCase();

        await Promise.using(getConnectionDisposer(), async(connection) => {
            const status = await this._getStatus(connection, chatId, userId);

            if (status !== null) {
                const message = ResponseText.AllAction.ALREADY_STARTED
                    .replace(/{a}/g, actionName);

                await this._bot.sendMessage(chatId, message);

                throw new Error('Already Started');
            }

            const startMessage = ResponseText.AllAction.START
                .replace(/{a}/g, actionName);

            await this._bot.sendMessage(chatId, startMessage);
            await this._insertStatus(connection, chatId, userId);
            await new Promise((resolve, reject) => {
                setTimeout(resolve, DETECT_DURATION);
            });
        });

        await Promise.using(getConnectionDisposer(), async(connection) => {
            const finalStatus = await this._getStatus(connection, chatId, userId);
            const chatUsers = await this._getChatUsers(connection, chatId);
            const reportedResult = ResponseText.AllAction.RESULT_REPORTED.replace(/{a}/g, actionName);
            const notReportedResult = ResponseText.AllAction.RESULT_NOT_REPORTED.replace(/{a}/g, actionName);
            const result = ResponseText.AllAction.RESULT_PREFIX
                .replace(/{a}/g, actionName) +
                chatUsers.map((chatUser) => (
                    `${chatUser.first_name}: ${finalStatus[chatUser.id] ? reportedResult : notReportedResult}`
                )).join('\n');

            await this._removeStatus(connection, chatId);
            await this._bot.sendMessage(chatId, result);
        });
    }
}
