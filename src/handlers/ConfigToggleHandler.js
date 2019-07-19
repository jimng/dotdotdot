import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import Commands from '../constants/Commands';
import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

export default class ConfigToggleHandler extends AbstractHandler {
    async getReply(msg, match, getConnectionDisposer) {
        return Promise.using((getConnectionDisposer()), async(connection) => {
            let configKey;
            let reply;

            switch (match[1]) {
                case Commands.CGST_DETECT:
                    configKey = DBSchema.ChatConfigs.CGST_DETECT;
                    reply = ResponseText.Config.CGST_DETECT;
                    break;

                case Commands.DAILY_COUNT:
                    configKey = DBSchema.ChatConfigs.DAILY_COUNT;
                    reply = ResponseText.Config.DAILY_COUNT;
                    break;

                case Commands.NSFW_DETECT:
                    configKey = DBSchema.ChatConfigs.NSFW_DETECT;
                    reply = ResponseText.Config.NSFW_DETECT;
                    break;

                default:
                    throw new Error('Unknown config type');
            }

            const collection = connection.collection(DBSchema.Collections.CHAT_CONFIG);
            const chatConfig = await collection.findOneAsync({
                '_id': msg.chat.id,
            });
            const newConfigValue = !(chatConfig && chatConfig[configKey]);
            const newConfigText = (newConfigValue ? ResponseText.Config.TURNED_ON : ResponseText.Config.TURNED_OFF);

            await connection.collection(DBSchema.Collections.CHAT_CONFIG).update({
                '_id': msg.chat.id,
            }, {
                ...chatConfig,
                [configKey]: newConfigValue,
            }, { upsert: true });

            return reply.replace('{v}', newConfigText);
        });
    }
}
