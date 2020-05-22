import safeEval from 'safe-eval';

import AbstractHandler from './AbstractHandler';

export default class EvalHandler extends AbstractHandler {
    async getReply(msg, match) {
        const command = match[2];
        
        try {
            return safeEval(command, {}, { timeout: 1000 }).toString();
        } catch (err) {
            return 'Error';
        }
    }
}
