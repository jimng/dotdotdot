import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

export default class AllActionDetectHandler extends AbstractHandler {
    async _getStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.ALL_ACTION);

        return collection.findOneAsync({
            '_id': chatId,
        });
    }

    async _updateStatus(connection, chatId, userId) {
        const collection = connection.collection(DBSchema.Collections.ALL_ACTION);

        await collection.update(
            { '_id': chatId },
            {
                $set: {
                    [`usersStatus.${userId}`]: true,
                }
            },
            { upsert: true }
        );
    }

    async handle(msg, match, getConnectionDisposer) {
        return Promise.using((getConnectionDisposer()), async(connection) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            const userFirstName = msg.from.first_name;
            const status = await this._getStatus(connection, chatId);

            if (
                (status === null) ||
                (status.durationInSecond === undefined) ||
                (status.timestamp === undefined) ||
                ((Date.now() - status.timestamp) >= status.durationInSecond * 1000)) {
                return;
            }

            if (!status.usersStatus[userId]) {
                const responseText = ResponseText.AllAction.SOMEONE_REPORTED
                    .replace('{u}', userFirstName);

                await this._updateStatus(connection, chatId, userId);
                await this._bot.sendMessage(chatId, responseText);
            }
        });
    }
}
