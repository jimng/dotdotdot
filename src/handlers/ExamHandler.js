import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import DBSchema from '../constants/DBSchema';
import ExamQuestions from '../constants/ExamQuestions';
import ResponseText from '../constants/ResponseText';

import KeyboardUtil from '../utils/KeyboardUtil';

const EXAM_DURATION_SEC = 20; // 20s
const numExamQuestions = ExamQuestions.length;

export default class ExamHandler extends AbstractHandler {
    async _getStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.EXAM);

        return collection.findOneAsync({
            '_id': chatId,
        });
    }

    async _getChatUsers(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.CHAT_USERS);
        const chatUsersMap = (await collection.findOneAsync({
            '_id': chatId,
        })).users;

        return Object.values(chatUsersMap);
    }

    async _updateStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.EXAM);
        const chatUserIds = (await this._getChatUsers(connection, chatId)).map(chatUser => chatUser.id);
        let status = {};

        chatUserIds.forEach((chatUserId) => {
            status[chatUserId] = null;
        });

        await collection.update(
            { '_id': chatId },
            status,
            { upsert: true }
        );
    }

    async _removeStatus(connection, chatId) {
        const collection = connection.collection(DBSchema.Collections.EXAM);

        await collection.deleteOneAsync({ '_id': chatId });
    }

    async handle(msg, match, getConnectionDisposer) {
        const chatId = msg.chat.id;
        const index = Math.floor(Math.random() * numExamQuestions);
        const question = ExamQuestions[index].q;
        const answers = ExamQuestions[index].c;
        const options = `A: ${answers[0]}\nB: ${answers[1]}\nC: ${answers[2]}\nD: ${answers[3]}`;
        const correctAnswer = ExamQuestions[index].a;
        let questionMessage;

        await Promise.using((getConnectionDisposer()), async(connection) => {
            const status = await this._getStatus(connection, chatId);
            const questionText = ResponseText.Exam.QUESTION
                .replace('{s}', EXAM_DURATION_SEC)
                .replace('{q}', question);

            if (status) {
                await this._bot.sendMessage(chatId, ResponseText.Exam.ALREADY_STARTED);

                throw new Error('Already Started');
            }

            await this._updateStatus(connection, chatId);

            questionMessage = await this._bot.sendMessage(chatId, questionText, {
                'reply_markup': {
                    'inline_keyboard': KeyboardUtil.getExamInlineKeyboard(answers),
                },
            });
        });

        await new Promise((resolve, reject) => {
            setTimeout(resolve, EXAM_DURATION_SEC * 1000);
        });

        await Promise.using((getConnectionDisposer()), async(connection) => {
            const status = await this._getStatus(connection, chatId);
            const chatUsers = await this._getChatUsers(connection, chatId);
            const answerText = ResponseText.Exam.RESULT_PREFIX
                .replace(/{q}/g, question)
                .replace(/{o}/g, options)
                .replace(/{a}/g, correctAnswer) +
                chatUsers.map((chatUser) => {
                    const userAnswer = (status[chatUser.id] ? status[chatUser.id] : ResponseText.Exam.RESULT_ABANDONED);
                    const correctness = ((status[chatUser.id] === correctAnswer) ? ResponseText.Exam.RESULT_CORRECT : ResponseText.Exam.RESULT_WRONG);

                    return `${chatUser.first_name}: ${userAnswer} ${correctness}`;
                }).join('\n');

            await this._removeStatus(connection, chatId);
            await this._bot.editMessageText(answerText, {
                'chat_id': chatId,
                'message_id': questionMessage['message_id']
            });
        });
    }
}
