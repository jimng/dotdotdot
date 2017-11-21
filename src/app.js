import config from 'config';

import TelegramUtil from './utils/TelegramUtil';

import TimeHandler from './handlers/TimeHandler';

const bot = TelegramUtil.getInstance();
const timeHandler = new TimeHandler(bot);

bot.onText(/^\/time/, async (msg, match) => timeHandler.handle(msg, match));
