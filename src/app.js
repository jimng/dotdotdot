import 'babel-polyfill';

import TelegramUtil from './utils/TelegramUtil';

import TimeHandler from './handlers/TimeHandler';
import JobsDBHandler from './handlers/JobsDBHandler';
import BuddhaHandler from './handlers/BuddhaHandler';
import BibleHandler from './handlers/BibleHandler';
import HKNoITHandler from './handlers/HKNoITHandler';

async function start() {
    const bot = TelegramUtil.getInstance();
    const botInfo = await bot.getMe();
    const atBot = `@${botInfo.username}`;
    const commands = [
        {
            regex: new RegExp(`^/time(${atBot})?\\s*$`, 'i'),
            class: TimeHandler
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
            regex: new RegExp(`^/jobsdb(${atBot})?\\s+(\\w+)\\s*$`, 'i'),
            class: JobsDBHandler
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
