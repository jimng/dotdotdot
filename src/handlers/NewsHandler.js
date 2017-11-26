import Promise from 'bluebird';
import request from 'request';
import cheerio from 'cheerio';

import AbstractHandler from './AbstractHandler';

const requestPromise = Promise.promisify(request);

export default class NewsHandler extends AbstractHandler {
    async getReply(msg, match) {
        const options = {
            method: 'GET',
            url: 'http://hk.apple.nextmedia.com/',
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
            }
        };
        const result = await requestPromise(options);
        const $ = cheerio.load(result.body);
        let reply = '';

        for (let i = 0; i < 10; i++) {
            reply += $('.item a').eq(i).text().trim() + '\n';
            reply += $('.item a').eq(i).attr('href') + '\n';
        }

        return reply;
    }
}
