import AbstractHandler from './AbstractHandler';

import IQQuestions from '../constants/IQQuestions';
import ResponseText from '../constants/ResponseText';

const numIQQuestions = IQQuestions.length;

export default class IQQuestionHandler extends AbstractHandler {
    async getReply(msg, match) {
        const index = Math.floor(Math.random() * numIQQuestions);

        return ResponseText.IQQuestion.QUESTION
            .replace('{q}', IQQuestions[index].q)
            .replace('{a}', index + 1);
    }
}
