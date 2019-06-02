import R from 'ramda';
import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

export default class MarkSixHandler extends AbstractHandler {
    async getReply(msg, match) {
        let arr;
        
        do {
            arr = R.uniq(
                Array(6)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 49) + 1)
                    .sort((a, b) => a - b)
            );
        } while (arr.length < 6);
        
        return `${ResponseText.MarkSix.TEXT}\n${arr.join(', ')}`;
    }
}
