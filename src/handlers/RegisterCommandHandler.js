import R from 'ramda';
import Promise from 'bluebird';

import AbstractHandler from './AbstractHandler';

import Commands from '../constants/Commands';
import DBSchema from '../constants/DBSchema';
import ResponseText from '../constants/ResponseText';

const builtInCommands = R.values(Commands);

export default class RegisterCommandHandler extends AbstractHandler {
    async getReply(msg, match, getConnectionDisposer) {
        const userId = msg.from.id;
        const name = match[2].toLowerCase();
        const content = match[3];

        if (R.find((builtInCommand) => name.includes(builtInCommand), builtInCommands) !== undefined) {
            return ResponseText.RegisterCommand.COMMAND_EXISTS;
        }

        return Promise.using((getConnectionDisposer()), async(connection) => {
            const collection = connection.collection(DBSchema.Collections.CUSTOM_COMMAND);
            const command = await collection.findOneAsync({
                '_id': name,
            });

            if (command !== null && command.userId !== userId) {
                return ResponseText.RegisterCommand.NO_RIGHT;
            }

            await collection.update({
                '_id': name,
            }, {
                userId,
                content,
            }, { upsert: true });

            return ResponseText.RegisterCommand.SUCCESS;
        });
    }
}
