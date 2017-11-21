import TelegramBot from 'node-telegram-bot-api';
import config from 'config';

function getInstance() {
    const telegramConfig = config.get('telegram');
    const apiToken = telegramConfig.get('apiToken');

    return new TelegramBot(apiToken, { polling: true });
}

module.exports = {
    getInstance,
};
