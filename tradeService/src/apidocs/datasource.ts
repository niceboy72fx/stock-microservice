import config from "../config";
import QrPaymentApi from "./docs/qrpayment.api";
let schema = [
    "https",
];

if (config.App.env === 'local') {
    schema = ['http']
}

export default {
    "swagger": "2.0",
    "info": {
        "description": "QrPayment Socket API",
        "version": "1.0.0",
        "title": "CoreEnterpriseWallet API",
        "termsOfService": "https://api-ewallet-merchant-dev.postpay.vn/terms/",
        "contact": {
            "email": "contact@vietnampost.vn"
        },
        "license": {
            "name": "VietnamPost commercial license",
            "url": "https://api-ewallet-merchant-dev.postpay.vn/"
        }
    },
    "host": config.SWAGGER_ENDPOINT,
    "basePath": "/",
    "tags": [

    ],
    "schemes": schema,
    "paths": {
        ...QrPaymentApi,
    },
}
