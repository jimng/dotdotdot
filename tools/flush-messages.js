const TelegramUtil = require('../build/utils/TelegramUtil');

const bot = TelegramUtil.getInstance();

function flushMessage() {
    bot.getUpdates()
        .then((data) => {
            if (data.length !== 0) {
                flushMessage();
            } else {
                console.log('Done');
                process.exit(0);
            }
        });
}

flushMessage();
