import AWS from 'aws-sdk';

const SAFE_SEARCH_FEATURE = 'SAFE_SEARCH_DETECTION';

const rekognition = new AWS.Rekognition({ region: 'ap-southeast-1' });

async function getSafeSearchResult(imageBase64Buffer) {
    const response = await rekognition.detectModerationLabels({
        Image: {
            Bytes: Buffer.from(imageBase64Buffer, 'base64')
        }
    }).promise();
    
    return response.ModerationLabels;
}

module.exports = {
    getSafeSearchResult,
};
