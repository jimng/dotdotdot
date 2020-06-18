import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';

export default class ExamAnswerHandler extends AbstractHandler {
    async _getStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.EXAM);

        return collection.findOneAsync({
            '_id': chatId,
        });
    }

    async _updateStatus(connection, chatId, userId, answer) {
        const collection = connection.collection(DBSchema.Collections.EXAM);
        let status = (await this._getStatus(connection, chatId));

        status[userId] = answer;

        await collection.update(
            { '_id': chatId },
            status,
            { upsert: true }
        );
    }

    async handle(callbackMsg, getConnectionDisposer) {
        const chatId = callbackMsg.message.chat.id;
        const userId = callbackMsg.from.id;
        const answer = callbackMsg.data.data;
        
        console.log('answer', answer);

        if (
            (answer !== 'A') &&
            (answer !== 'B') &&
            (answer !== 'C') &&
            (answer !== 'D')
        ) {
            throw new Error('Invalid Answer');
        }

        await Promise.using((getConnectionDisposer()), async(connection) => {
            await this._updateStatus(connection, chatId, userId, answer);
        });
    }
}
