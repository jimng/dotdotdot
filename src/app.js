import 'babel-polyfill';

import TelegramUtil from './utils/TelegramUtil';

import LeaveHandler from './handlers/LeaveHandler';
import JobsDBHandler from './handlers/JobsDBHandler';
import NewsHandler from './handlers/NewsHandler';
import HKGoldenHandler from './handlers/HKGoldenHandler';
import BuddhaHandler from './handlers/BuddhaHandler';
import BibleHandler from './handlers/BibleHandler';
import HKNoITHandler from './handlers/HKNoITHandler';
import NoJHandler from './handlers/NoJHandler';

async function start() {
    const bot = TelegramUtil.getInstance();
    const botInfo = await bot.getMe();
    const atBot = `@${botInfo.username}`;
    const commands = [
        {
            regex: new RegExp(`^/leave(${atBot})?\\s*$`, 'i'),
            class: LeaveHandler
        },
        {
            regex: new RegExp(`^/jobsdb(${atBot})?\\s+(.+)$`, 'i'),
            class: JobsDBHandler
        },
        {
            regex: new RegExp(`^/hknews(${atBot})?\\s*$`, 'i'),
            class: NewsHandler
        },
        {
            regex: new RegExp(`^/hkgolden(${atBot})?\\s*$`, 'i'),
            class: HKGoldenHandler
        },
        {
            regex: new RegExp(`^/buddha(${atBot})?\\s*$`, 'i'),
            class: BuddhaHandler
        },
        {
            regex: new RegExp(`^/bible(${atBot})?\\s*$`, 'i'),
            class: BibleHandler
        },
        {
            regex: new RegExp(`^/hknoit(${atBot})?\\s*$`, 'i'),
            class: HKNoITHandler
        },
        {
            regex: new RegExp(`^/noj1314(${atBot})?\\s*$`, 'i'),
            class: NoJHandler
        },
    ];
    const numCommands = commands.length;

    for (let i = 0; i < numCommands; i++) {
        const command = commands[i];
        const handler = new command.class(bot);

        bot.onText(command.regex, async (msg, match) => {
            try {
                await handler.handle(msg, match);
            } catch (err) {
                console.error(err);
            }
        });
    }
}

start();
