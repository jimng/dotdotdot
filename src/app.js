import 'babel-polyfill';

import Commands from './constants/Commands';

import TelegramUtil from './utils/TelegramUtil';
import MongoDBUtil from './utils/MongoDBUtil';

import UserRegisterHandler from './handlers/UserRegisterHandler';
import ConfigToggleHandler from './handlers/ConfigToggleHandler';
import LeaveHandler from './handlers/LeaveHandler';
import WorkHandler from './handlers/WorkHandler';
import HolidayHandler from './handlers/HolidayHandler';
import JobsDBHandler from './handlers/JobsDBHandler';
import NewsHandler from './handlers/NewsHandler';
import HKGoldenHandler from './handlers/HKGoldenHandler';
import QuoteHandler from './handlers/QuoteHandler';
import AllHappyStartHandler from './handlers/AllHappyStartHandler';
import AllHappyDetectHandler from './handlers/AllHappyDetectHandler';
import CGSTDetectHandler from './handlers/CGSTDetectHandler';
import DailyCountHandler from './handlers/DailyCountHandler';

async function start() {
    const bot = TelegramUtil.getInstance();
    const botInfo = await bot.getMe();
    const atBot = `@${botInfo.username}`;
    const commands = [
        {
            regex: new RegExp(`^/(${Commands.CGST_DETECT}|${Commands.DAILY_COUNT})(${atBot})?\\s*$`, 'i'),
            Class: ConfigToggleHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
        {
            regex: new RegExp(`^/${Commands.LEAVE}(${atBot})?\\s*$`, 'i'),
            Class: LeaveHandler
        },
        {
            regex: new RegExp(`^/${Commands.WORK}(${atBot})?\\s*$`, 'i'),
            Class: WorkHandler
        },
        {
            regex: new RegExp(`^/${Commands.HOLIDAY}(${atBot})?\\s*$`, 'i'),
            Class: HolidayHandler
        },
        {
            regex: new RegExp(`^/${Commands.JOBSDB}(${atBot})?\\s+(.+)$`, 'i'),
            Class: JobsDBHandler
        },
        {
            regex: new RegExp(`^/${Commands.HKNEWS}(${atBot})?\\s*$`, 'i'),
            Class: NewsHandler
        },
        {
            regex: new RegExp(`^/${Commands.HKGOLDEN}(${atBot})?\\s*$`, 'i'),
            Class: HKGoldenHandler
        },
        {
            regex: new RegExp(`^/(${Commands.BUDDHA}|${Commands.BIBLE}|${Commands.HKNOIT}|${Commands.NOJ1314})(${atBot})?\\s*$`, 'i'),
            Class: QuoteHandler
        },
        {
            regex: new RegExp(`^/${Commands.ALL_HAPPY}(${atBot})?\\s*$`, 'i'),
            Class: AllHappyStartHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
        {
            regex: new RegExp('(.+)', 'i'),
            Class: UserRegisterHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
        {
            regex: new RegExp('(.+)', 'i'),
            Class: CGSTDetectHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
        {
            regex: new RegExp('(.+)', 'i'),
            Class: DailyCountHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
        {
            regex: new RegExp('(.+)', 'i'),
            Class: AllHappyDetectHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
    ];
    const numCommands = commands.length;

    for (let i = 0; i < numCommands; i++) {
        const command = commands[i];
        const handler = new command.Class(bot);

        bot.onText(command.regex, async(msg, match) => {
            try {
                const params = (command.params && command.params()) || [];

                await handler.handle(msg, match, ...params);
            } catch (err) {
                console.error(err);
            }
        });
    }
}

start();
