import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const HAPPY_DETECT_DURATION = 5 * 60 * 1000; // 5mins

export default class AllHappyStartHandler extends AbstractHandler {
    async _getStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.ALL_HAPPY);

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
        const collection = connection.collection(DBSchema.Collections.ALL_HAPPY);
        const chatUserIds = (await this._getChatUsers(connection, chatId)).map(chatUser => chatUser.id);
        let status = {};

        chatUserIds.forEach((chatUserId) => {
            status[chatUserId] = true;
        });
        status[userId] = false;

        await collection.update(
            { '_id': chatId },
            status,
            { upsert: true }
        );
    }

    async _removeStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.ALL_HAPPY);

        await collection.deleteOneAsync({ '_id': chatId });
    }

    async handle(msg, match, getConnectionDisposer) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        await Promise.using(getConnectionDisposer(), async(connection) => {
            const status = await this._getStatus(connection, chatId, userId);

            if (status !== null) {
                this._bot.sendMessage(chatId, ResponseText.AllHappy.ALREADY_STARTED);

                throw new Error('Already Started');
            }

            await this._bot.sendMessage(chatId, ResponseText.AllHappy.START);
            await this._insertStatus(connection, chatId, userId);
            await new Promise((resolve, reject) => {
                setTimeout(resolve, HAPPY_DETECT_DURATION);
            });
        });

        await Promise.using(getConnectionDisposer(), async(connection) => {
            const finalStatus = await this._getStatus(connection, chatId, userId);
            const chatUsers = await this._getChatUsers(connection, chatId);
            const result = ResponseText.AllHappy.RESULT_PREFIX + chatUsers.map((chatUser) => (
                `${chatUser.first_name}: ${finalStatus[chatUser.id] ? '😞' : '😀'}`
            )).join('\n');

            await this._removeStatus(connection, chatId);
            await this._bot.sendMessage(chatId, result);
        });
    }
}
