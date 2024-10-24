import {combineApi, createApi} from "../helpers";


export default combineApi([
    createApi({
        id: 'QrPaymentSends',
        method: 'post',
        summary: 'Send QR payment socket signal',
        uri: '/api/v1/qr-payments/send',
        tags: ['QrPayment'],
        parameters: [
            {
                name: 'orderId',
                description: 'OrderId',
                in: 'body',
                type: 'string',
                required: true,
                example: ''
            },
            {
                name: 'payload',
                description: 'payload',
                in: 'body',
                type: 'object',
                required: true,
                example: {}
            }
        ],
        responses: [
            {
                code: 'QRS-000',
                description: 'OK',
                sample: {
                    "code": 'QRS-000',
                    "message": "OK",
                }

            },
        ]
    }),
])
