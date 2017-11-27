import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';

export default class UserRegisterHandler extends AbstractHandler {
    async handle(msg, match, connectionDisposer) {
        let userData = msg.from;

        if (userData['is_bot']) {
            return;
        }

        const chatId = msg.chat.id;
        const userId = userData.id;

        return Promise.using((connectionDisposer), async(connection) => {
            const collection = connection.collection(DBSchema.Collections.CHAT_USERS);

            return collection.update({
                '_id': chatId,
            }, {
                $set: {
                    [`users.${userId}`]: userData
                }
            }, { upsert: true });
        });
    }
}
