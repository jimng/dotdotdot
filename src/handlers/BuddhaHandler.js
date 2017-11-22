import AbstractHandler from './AbstractHandler';

import Quotes from '../constants/Quotes';

const buddhaQuotes = Quotes.Buddha;
const numBuddhaQuotes = buddhaQuotes.length;

export default class BuddhaHandler extends AbstractHandler {

    async getReply(msg, match) {
        const index = Math.floor(Math.random() * numBuddhaQuotes);

        return buddhaQuotes[index];
    }
}
