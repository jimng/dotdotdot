import AbstractHandler from './AbstractHandler';

import Quotes from '../constants/Quotes';

const noJQuotes = Quotes.NoJ;
const numNoJQuotes = noJQuotes.length;

export default class NoJHandler extends AbstractHandler {

    async getReply(msg, match) {
        const index = Math.floor(Math.random() * numNoJQuotes);

        return noJQuotes[index];
    }
}
