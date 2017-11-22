import TelegramBot from 'node-telegram-bot-api';

function getInstance() {
    const apiToken = process.env.TELEGRAM_API_TOKEN;

    return new TelegramBot(apiToken, { polling: true });
}

module.exports = {
    getInstance,
};
