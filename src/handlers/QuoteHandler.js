import AbstractHandler from './AbstractHandler';

import Commands from '../constants/Commands';
import AllQuotes from '../constants/AllQuotes';

export default class QuoteHandler extends AbstractHandler {
    async getReply(msg, match) {
        let quotes;

        switch (match[1]) {
            case Commands.BUDDHA:
                quotes = AllQuotes.Buddha;
                break;

            case Commands.BIBLE:
                quotes = AllQuotes.Bible;
                break;

            case Commands.HKNOIT:
                quotes = AllQuotes.HKNoIT;
                break;

            case Commands.NOJ1314:
                quotes = AllQuotes.NoJ1314;
                break;

            default:
                throw new Error('Unknown quote type');
        }
        const numQuotes = quotes.length;
        const index = Math.floor(Math.random() * numQuotes);

        return quotes[index];
    }
}
