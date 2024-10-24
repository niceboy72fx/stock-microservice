import {combineApi, createApi} from "../helpers";


export default combineApi([
    createApi({
        id: 'SampleAPIGet',
        method: 'get',
        summary: 'This is a sample API',
        uri: '/v2/get-sample',
        tags: ['Sample'],
        parameters: [
            {
                name: 'encrypted',
                description: 'Encrypted',
                in: 'body',
                type: 'string',
                required: true,
                example: 'cwNDB9.WVHTWXJMPptM-euLHmqUofvBithm6k_EMATSz0fbP2c...'
            }
        ],
        responses: [
            {
                code: '000',
                description: 'OK',
                sample: {
                    "code": 0,
                    "message": "OK",
                }

            },
        ]
    }),
    createApi({
        id: 'SampleAPIPost',
        method: 'post',
        summary: 'This is a sample API',
        uri: '/v2/post-sample',
        tags: ['Sample'],
        parameters: [
            {
                name: 'encrypted',
                description: 'Encrypted',
                in: 'query',
                type: 'string',
                required: true,
                example: 'cwNDB9.WVHTWXJMPptM-euLHmqUofvBithm6k_EMATSz0fbP2c...'
            }
        ],
        responses: [
            {
                code: '000',
                description: 'OK',
                sample: {
                    "code": 0,
                    "message": "OK",
                }

            },
        ]
    }),
])
