import express from 'express';
import config from 'config';
import randomstring from 'randomstring';

import TelegramUtil from './utils/TelegramUtil';

import TimeRoute from './routes/TimeRoute';

const app = express();
const appURL = config.get('app').get('url');
const webhookToken = randomstring.generate(16);
const telegramClient = TelegramUtil.getClient();

telegramClient.setWebhook(`${appURL}/${webhookToken}`)

app.use(`${webhookToken}/time`, TimeRoute);

app.use((req, res) => {
    if (req.reply !== undefined) {
        const chatId = req.body.message.chat.id;
        telegramClient.sendMessage(chatId, req.reply);
    }
});

app.use((req, res) => {
    res.status(404);
})

app.listen(process.env.PORT || 3000, () => console.log('dotdotdot started'));
