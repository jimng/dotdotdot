import Promise from 'bluebird';
import StackExchange from 'stackexchange-node';
import decodeHTML from 'unescape';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

const context = new StackExchange({ version: 2.2 });
const advancedSearch = Promise.promisify(context.search.advanced);

export default class StackOverflowHandler extends AbstractHandler {
    async getReply(msg, match) {
        const keyword = match[2];
        const filter = {
            pagesize: 10,
            sort: 'relevance',
            order: 'desc',
            q: keyword,
            accepted: 'True',
            answers: 1,
            site: 'stackoverflow',
        };

        const results = ((await advancedSearch(filter)).items || []);
        const numResults = results.length;

        if (numResults === 0) {
            return ResponseText.StackOverflow.NO_RESULT;
        }

        let reply = ResponseText.StackOverflow.NUM_OF_RESULTS.replace('{n}', numResults);

        for (let i = 0; i < numResults; i++) {
            const title = decodeHTML(results[i].title, 'all');
            const url = results[i].link;

            reply += `${title}\n${url}\n\n`;
        }

        return reply;
    }
}
