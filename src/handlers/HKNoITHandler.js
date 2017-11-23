import AbstractHandler from './AbstractHandler';

import Quotes from '../constants/Quotes';

const hkNoITQuotes = Quotes.HKNoIT;
const numHKNoITQuotes = hkNoITQuotes.length;

export default class HKNoITHandler extends AbstractHandler {

    async getReply(msg, match) {
        const index = Math.floor(Math.random() * numHKNoITQuotes);

        return hkNoITQuotes[index];
    }
}
