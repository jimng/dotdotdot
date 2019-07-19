import Promise from 'bluebird';
import axios from 'axios';
import R from 'ramda';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

import ImageDetectionUtil from '../utils/ImageDetectionUtil';

export default class NSFWDetectHandler extends AbstractHandler {
    async _isCheckingOn(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.CHAT_CONFIG);
        const chatConfig = await collection.findOneAsync({
            '_id': chatId,
        });

        return (chatConfig && chatConfig[DBSchema.ChatConfigs.NSFW_DETECT]) || false;
    }
    
    async handle(msg, getConnectionDisposer) {
        const chatId = msg.chat.id;
        let isCheckingOn = false;

        await Promise.using((getConnectionDisposer()), async(connection) => {
            isCheckingOn = await this._isCheckingOn(connection, chatId);
        });
        
        if (!isCheckingOn) {
            return;
        }

        const photos = msg.photo;
        const bestPhotoMeta = R.reduce(R.maxBy(R.prop('file_size')), { 'file_size': 0 }, photos);
        const bestPhotoId = bestPhotoMeta['file_id'];

        const photoUri = await this._bot.getFileLink(bestPhotoId);
        const dataResponse = await axios.get(photoUri, { responseType: 'arraybuffer' });
        const base64Buffer = new Buffer(dataResponse.data, 'binary').toString('base64');
        const safeSearchResult = await ImageDetectionUtil.getSafeSearchResult(base64Buffer);

        if (safeSearchResult.adult === 'VERY_LIKELY' || safeSearchResult.racy === 'VERY_LIKELY') {
            await this._bot.sendMessage(chatId, ResponseText.NSFWDetect.PROTECT);
        }
    }
}
