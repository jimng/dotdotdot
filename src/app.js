import 'babel-polyfill';

import Commands from './constants/Commands';
import Callbacks from './constants/Callbacks';

import TelegramUtil from './utils/TelegramUtil';
import MongoDBUtil from './utils/MongoDBUtil';

import UserRegisterHandler from './handlers/UserRegisterHandler';
import ConfigToggleHandler from './handlers/ConfigToggleHandler';
import LeaveHandler from './handlers/LeaveHandler';
import WorkHandler from './handlers/WorkHandler';
import HolidayHandler from './handlers/HolidayHandler';
import StackOverflowHandler from './handlers/StackOverflowHandler';
import JobsDBHandler from './handlers/JobsDBHandler';
import NewsHandler from './handlers/NewsHandler';
import HKGoldenHandler from './handlers/HKGoldenHandler';
import QuoteHandler from './handlers/QuoteHandler';
import MarkSixHandler from './handlers/MarkSixHandler';
import AllActionStartHandler from './handlers/AllActionStartHandler';
import AllActionDetectHandler from './handlers/AllActionDetectHandler';
import CGSTDetectHandler from './handlers/CGSTDetectHandler';
import DailyCountHandler from './handlers/DailyCountHandler';
import IQQuestionHandler from './handlers/IQQuestionHandler';
import IQAnswerHandler from './handlers/IQAnswerHandler';
import ExamHandler from './handlers/ExamHandler';
import ExamAnswerHandler from './handlers/ExamAnswerHandler';
import NSFWDetectHandler from './handlers/NSFWDetectHandler';

async function start() {
    const bot = TelegramUtil.getInstance();
    const botInfo = await bot.getMe();
    const atBot = `@${botInfo.username}`;
    const textCommands = [
        {
            regex: new RegExp(`^/(${Commands.CGST_DETECT}|${Commands.DAILY_COUNT}|${Commands.NSFW_DETECT})(${atBot})?\\s*$`, 'i'),
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
            regex: new RegExp(`^/${Commands.STACK_OVERFLOW}(${atBot})?\\s+(.+)$`, 'i'),
            Class: StackOverflowHandler
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
            regex: new RegExp(`^/${Commands.MARKSIX}(${atBot})?\\s*$`, 'i'),
            Class: MarkSixHandler
        },
        {
            regex: new RegExp(`^/${Commands.IQ_QUESTION}(${atBot})?\\s*$`, 'i'),
            Class: IQQuestionHandler
        },
        {
            regex: new RegExp(`^/${Commands.IQ_ANSWER}_(\\d+)(${atBot})?$`, 'i'),
            Class: IQAnswerHandler
        },
        {
            regex: new RegExp(`^/${Commands.EXAM}(${atBot})?\\s*$`, 'i'),
            Class: ExamHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
        {
            regex: new RegExp(`^/${Commands.ALL_ACTION}(\\w+)(${atBot})?\\s*$`, 'i'),
            Class: AllActionStartHandler,
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
            Class: AllActionDetectHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
    ];
    const generalCommands = [
        {
            Class: NSFWDetectHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
    ];
    const callbackQueries = {
        [Callbacks.EXAM]: {
            Class: ExamAnswerHandler,
            params: () => [ MongoDBUtil.getConnectionDisposer ],
        },
    };

    textCommands.forEach((command) => {
        const handler = new command.Class(bot);

        bot.onText(command.regex, async(msg, match) => {
            try {
                const params = (command.params && command.params()) || [];

                await handler.handle(msg, match, ...params);
            } catch (err) {
                console.error('Error received from text commmand', err);
            }
        });
    });

    generalCommands.forEach((command) => {
        const handler = new command.Class(bot);

        bot.on('message', async(msg) => {
            try {
                const params = (command.params && command.params()) || [];

                await handler.handle(msg, ...params);
            } catch (err) {
                console.error('Error received from photo commmand', err);
            }
        });
    });

    bot.on('callback_query', async(callbackMsg) => {
        try {
            callbackMsg = {
                ...callbackMsg,
                data: JSON.parse(callbackMsg.data)
            };

            const callbackData = callbackMsg.data;

            if (!callbackData || !callbackData.type) {
                throw new Error('Invalid callback data');
            }

            if (!callbackQueries[callbackData.type]) {
                throw new Error('Unknown callback data type');
            }

            const callbackQuery = callbackQueries[callbackData.type];
            const handler = new callbackQuery.Class(bot);
            const params = (callbackQuery.params && callbackQuery.params()) || [];

            await handler.handle(callbackMsg, ...params);
        } catch (err) {
            console.error('Error received from callback query', err);
        }
    });
}

start();
