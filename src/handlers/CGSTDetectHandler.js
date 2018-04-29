import Promise from 'bluebird';
import escapeStringRegexp from 'escape-string-regexp';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

export default class CGSTDetectHandler extends AbstractHandler {
    async _isCheckingOn(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.CHAT_CONFIG);
        const chatConfig = await collection.findOneAsync({
            '_id': chatId,
        });

        return (chatConfig && chatConfig[DBSchema.ChatConfigs.CGST_DETECT]) || false;
    }

    async _isCGST(connection, chatId, msgText) {
        const collection = connection.collection(DBSchema.Collections.CHAT_USERS);
        const chatUsersMap = (await collection.findOneAsync({
            '_id': chatId,
        })).users;
        const chatUsers = Object.values(chatUsersMap);
        const escapedChatUserNames = chatUsers.map(
            (chatUser) => escapeStringRegexp(chatUser['first_name'])
        );
        const namesRegex = escapedChatUserNames.join('|');
        const regex = new RegExp(`^\\s*(${namesRegex})\\s*:.*$`, 'i');

        return Boolean(regex.test(msgText));
    }

    async handle(msg, match, getConnectionDisposer) {
        return Promise.using((getConnectionDisposer()), async(connection) => {
            const chatId = msg.chat.id;
            const isCheckingOn = await this._isCheckingOn(connection, chatId);

            if (!isCheckingOn) {
                return;
            }

            const isCGST = await this._isCGST(connection, chatId, match[1]);

            if (isCGST) {
                const replyMsgId = msg['message_id'];

                await this._bot.sendMessage(chatId, ResponseText.CGSTDetect.WARNING, {
                    'reply_to_message_id': replyMsgId,
                });
            }
        });
    }
}
