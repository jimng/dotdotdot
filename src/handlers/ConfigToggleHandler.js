import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import Commands from '../constants/Commands';
import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

export default class ConfigToggleHandler extends AbstractHandler {
    async getReply(msg, match, connectionDisposer) {
        return Promise.using((connectionDisposer), async(connection) => {
            let configKey;
            let reply;

            switch (match[1]) {
                case Commands.CGST_DETECT:
                    configKey = DBSchema.ChatConfigs.CGST_DETECT;
                    reply = ResponseText.Config.CGST_DETECT;
                    break;

                default:
                    throw new Error('Unknown config type');
            }

            const collection = connection.collection(DBSchema.Collections.CHAT_CONFIG);
            const chatConfig = await collection.findOneAsync({
                '_id': msg.chat.id,
            });
            const newConfigValue = ((chatConfig[configKey] !== null) ? !chatConfig[configKey] : true);
            const newConfigText = (newConfigValue ? ResponseText.Config.TURNED_ON : ResponseText.Config.TURNED_OFF);

            await connection.collection(DBSchema.Collections.CHAT_CONFIG).update({
                '_id': msg.chat.id,
            }, {
                [configKey]: newConfigValue,
            }, { upsert: true });

            return reply.replace('{v}', newConfigText);
        });
    }
}
