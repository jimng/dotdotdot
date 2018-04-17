import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

export default class AllHappyDetectHandler extends AbstractHandler {
    async _getStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.ALL_HAPPY);

        return collection.findOneAsync({
            '_id': chatId,
        });
    }

    async _updateStatus(connection, chatId, nextStatus) {
        const collection = connection.collection(DBSchema.Collections.ALL_HAPPY);

        await collection.update(
            { '_id': chatId },
            nextStatus,
            { upsert: true }
        );
    }

    async handle(msg, match, getConnectionDisposer) {
        return Promise.using((getConnectionDisposer()), async(connection) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            const userFirstName = msg.from.first_name;
            const status = await this._getStatus(connection, chatId);

            if (!status) {
                return;
            }

            if (!status[userId]) {
                const responseText = ResponseText.AllHappy.SOMEONE_NOT_HAPPY
                    .replace('{u}', userFirstName);

                status[userId] = false;
                await this._updateStatus(connection, chatId, status);
                await this._bot.sendMessage(chatId, responseText);
            }
        });
    }
}
