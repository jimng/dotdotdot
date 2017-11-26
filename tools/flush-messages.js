import TelegramUtil from '../build/utils/TelegramUtil';

const bot = TelegramUtil.getInstance();

async function flushMessage() {
    const data = await bot.getUpdates();

    if (data.length !== 0) {
        await flushMessage();
    } else {
        console.log('Done');
        process.exit(0);
    }
}

flushMessage();
