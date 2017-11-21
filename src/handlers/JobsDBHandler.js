import Promise from 'bluebird';
import request from 'request';
import cheerio from 'cheerio';
import co from 'co';

import AbstractHandler from './AbstractHandler';

const requestPromise = Promise.promisify(request);

export default class JobsDBHandler extends AbstractHandler {

    async getReply(msg, match) {
        const keyword = match[1];
        const options = {
            method: 'GET',
            url: 'http://m.jobsdb.com/en-hk/search.do',
            qs: {
                AD: '30',
                Blind: '1',
                JSRV: '1',
                Key: keyword,
                KeyOpt: 'EXACT',
                SearchFields: 'JobDetails'
            },
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
            }
        };
        const result = await requestPromise(options);
        const $ = cheerio.load(result.body);
        let reply = '';

        for (let i = 0; i < $('.searchResults_area').length; i++) {
            let row = $('.searchResults_area').eq(i);
            let position = row.find('.searchResults_content h3').text().trim();
            let industry = row.find('.ico_industry').text().trim();
            let location = row.find('.ico_name').text().trim();
            let link = row.find('a').eq(1).attr('href');
            if (location === 'Not Specified') {
                location = '';
            } else {
                location = `in ${location}`;
            }
            reply += `${position} of ${industry} ${location}\n${link}\n\n`;
        }

        return reply;
    }
}
