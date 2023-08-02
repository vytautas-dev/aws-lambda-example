const AWS = require('aws-sdk');
const axios = require('axios');

exports.lambdaHandler = async (event, context) => {
    try {

        const params = {
            username: 'Wojciech',
            bucket: '00vytautas',
            key: '/tmp/input.docx'
        }

        const apiUrl = 'http://192.168.100.45:3001'

        const response = await axios.post(apiUrl, params);

        console.log('response', response.data);

        return {
            statusCode: 200,
                body: JSON.stringify({
                message: 'Lambda 1 successfully invoked Lambda 2!',
            }),
        };

    } catch (err) {
        console.error('Error invoking Lambda 2:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error',
            }),
        };
    }
};
