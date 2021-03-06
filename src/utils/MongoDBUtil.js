import Promise from 'bluebird';
import MongoDB from 'mongodb';

const MongoDBPromise = Promise.promisifyAll(MongoDB);
const MongoClient = MongoDBPromise.MongoClient;

async function getConnectionDisposer() {
    return MongoClient.connectAsync(process.env.MONGODB_URI).disposer((connection) => {
        connection.close();
    });
}

module.exports = {
    getConnectionDisposer,
};
