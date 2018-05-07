import Callbacks from '../constants/Callbacks';

function _getExamInlineKeyboardItem(letter, answer) {
    return {
        text: `${letter}: ${answer}`,
        'callback_data': JSON.stringify({
            type: Callbacks.EXAM,
            data: letter,
        }),
    };
}

function getExamInlineKeyboard(answers) {
    return [
        [
            _getExamInlineKeyboardItem('A', answers[0]),
            _getExamInlineKeyboardItem('B', answers[1]),
        ],
        [
            _getExamInlineKeyboardItem('C', answers[2]),
            _getExamInlineKeyboardItem('D', answers[3]),
        ],
    ];
}

module.exports = {
    getExamInlineKeyboard,
};
