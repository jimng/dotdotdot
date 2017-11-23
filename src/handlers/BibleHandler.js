import AbstractHandler from './AbstractHandler';

import Quotes from '../constants/Quotes';

const bibleQuotes = Quotes.Bible;
const numBibleQuotes = bibleQuotes.length;

export default class BibleHandler extends AbstractHandler {

    async getReply(msg, match) {
        const index = Math.floor(Math.random() * numBibleQuotes);

        return bibleQuotes[index];
    }
}
