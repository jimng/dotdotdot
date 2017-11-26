import Promise from 'bluebird';
import MongoDBUtil from '../src/utils/MongoDBUtil';

async function testConnection() {
    await Promise.using(MongoDBUtil.getConnection(), (connection) => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Connect to MongoDB failed:', err);
    });
}

testConnection();
