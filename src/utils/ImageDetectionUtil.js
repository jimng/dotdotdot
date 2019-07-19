import { google } from 'googleapis';

const SAFE_SEARCH_FEATURE = 'SAFE_SEARCH_DETECTION';

const vision = google.vision('v1');

async function getSafeSearchResult(imageBase64Buffer) {
    const response = await vision.images.annotate({
        auth: process.env.GOOGLE_API_KEY,
        requestBody: {
            requests: [{
                image: {
                    content: imageBase64Buffer,
                },
                features: [
                    { type: SAFE_SEARCH_FEATURE }
                ]
            }],
        }
    });
    
    return response.data.responses[0].safeSearchAnnotation;
}

module.exports = {
    getSafeSearchResult,
};
