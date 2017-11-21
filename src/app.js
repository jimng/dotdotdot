import config from 'config';

import TelegramUtil from './utils/TelegramUtil';

import TimeHandler from './handlers/TimeHandler';
import JobsDBHandler from './handlers/JobsDBHandler';

const bot = TelegramUtil.getInstance();
const timeHandler = new TimeHandler(bot);
const jobsDBHandler = new JobsDBHandler(bot);

bot.onText(/^\/time/, async (msg, match) => {
    try {
        await timeHandler.handle(msg, match);
    } catch (err) {
        console.error(err);
    }
});
bot.onText(/^\/jobsdb (.+)/, async (msg, match) => {
    try {
        await jobsDBHandler.handle(msg, match);
    } catch (err) {
        console.error(err);
    }
});
