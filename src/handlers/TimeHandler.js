import moment from 'moment-timezone';

import AbstractHandler from './AbstractHandler';

const timeZone = 'Asia/Hong_Kong';

export default class TimeHandler extends AbstractHandler {

    async getReply(msg, match) {
        const currentTime = moment().tz(timeZone).format('MM/DD/YYYY h:mm:ss a');

        return `The current time is ${currentTime}`;
    }
}
