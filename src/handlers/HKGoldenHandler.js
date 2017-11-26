import Promise from 'bluebird';
import request from 'request';
import cheerio from 'cheerio';

import AbstractHandler from './AbstractHandler';

const requestPromise = Promise.promisify(request);

export default class HKGoldenHandler extends AbstractHandler {
    async getReply(msg, match) {
        const options = {
            method: 'GET',
            url: 'http://forum4.hkgolden.com/topics.aspx',
            qs: {
                type: 'BW',
                page: '1'
            },
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
            }
        };
        const result = await requestPromise(options);
        const $ = cheerio.load(result.body);
        let mainTopicTable = $('#mainTopicTable');
        let topics = mainTopicTable.find('tr');
        let reply = '';

        for (let i = 3; i < 8; i++) {
            let topicTitle = topics.eq(i)
                .find('td')
                .eq(1)
                .find('a')
                .eq(0)
                .text()
                .trim();
            let topicLink = topics.eq(i)
                .find('td')
                .eq(1)
                .find('a')
                .eq(0)
                .attr('href');

            reply += `${topicTitle} \nhttp://forum7.hkgolden.com/${topicLink}\n\n`;
        }

        return reply;
    }
}
