export default class AbstractHandler {

    constructor(bot) {
        this._bot = bot;
    }

    async getReply(msg, match) {
        // To be implemented by real classes
    }

    async handle(msg, match) {
        const chatId = msg.chat.id;
        const message = await this.getReply(msg, match);

        this._bot.sendMessage(chatId, message, {
            'disable_web_page_preview': true
        });
    }
}
