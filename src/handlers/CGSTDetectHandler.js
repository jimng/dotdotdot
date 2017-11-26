import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

// TODO: Improve CGST matching quality
const CGST_REGEX = /^\w+:.+$/;

export default class CGSTDetectHandler extends AbstractHandler {
    async _isCheckingOn(connectionDisposer, chatId) {
        return Promise.using((connectionDisposer), async(connection) => {
            const collection = connection.collection(DBSchema.Collections.CHAT_CONFIG);
            const chatConfig = await collection.findOneAsync({
                '_id': chatId,
            });

            return (chatConfig && chatConfig[DBSchema.ChatConfigs.CGST_DETECT]) || false;
        });
    }

    async _isCGST(msgText) {
        return Boolean(CGST_REGEX.test(msgText));
    }

    async handle(msg, match, connectionDisposer) {
        const chatId = msg.chat.id;
        const isCheckingOn = await this._isCheckingOn(connectionDisposer, chatId);

        if (!isCheckingOn) {
            return;
        }

        const isCGST = await this._isCGST(match[1]);

        if (isCGST) {
            const replyMsgId = msg['message_id'];

            this._bot.sendMessage(chatId, ResponseText.CGSTDetect.WARNING, {
                'reply_to_message_id': replyMsgId,
            });
        }
    }
}
