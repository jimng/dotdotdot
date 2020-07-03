import Promise from 'bluebird';
import safeEval from 'safe-eval';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';

export default class CustomCommandHandler extends AbstractHandler {
    async handle(msg, match, getConnectionDisposer) {
        const chatId = msg.chat.id;
        const name = match[1].toLowerCase();
        const argv = match[4].split(/\s+/);

        return Promise.using((getConnectionDisposer()), async(connection) => {
            const collection = connection.collection(DBSchema.Collections.CUSTOM_COMMAND);
            const command = await collection.findOneAsync({
                '_id': name,
            });

            if (command === null) {
                return;
            }

            try {
                await this._bot.sendMessage(chatId, safeEval(command.content, { argv }, { timeout: 1000 }).toString());
            } catch (err) {
                await this._bot.sendMessage(chatId, 'Error');
            }
        });
    }
}
