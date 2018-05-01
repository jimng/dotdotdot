import AbstractHandler from './AbstractHandler';

import IQQuestions from '../constants/IQQuestions';
import ResponseText from '../constants/ResponseText';

export default class IQAnswerHandler extends AbstractHandler {
    async getReply(msg, match) {
        const index = parseInt(match[1]) - 1;

        if (!IQQuestions[index]) {
            return ResponseText.IQQuestion.INVALID_INDEX;
        }

        return IQQuestions[index].a;
    }
}
