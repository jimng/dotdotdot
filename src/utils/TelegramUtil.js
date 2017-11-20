import TelegramBotClient from 'telegram-bot-client';
import config from 'config';

function getClient() {
    const telegramConfig = config.get('telegram');
    const apiToken = telegramConfig.get('apiToken');

    return new TelegramBotClient(apiToken);
}

module.exports = {
    getClient,
};
