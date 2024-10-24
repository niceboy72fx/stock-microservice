import {randomUUID} from "crypto";

const swaggerUi = require('swagger-ui-express');
import config from "../config";
import datasource from './datasource'
const options = {
    explorer: true,
    customSiteTitle: "CoreEnterpriseWallet API documentations",
    customJs: '/js/swagger-custom.js',
    swaggerOptions: {
        urls: [
            {
                url: '/api-docs/datasources?v=1',
                name: 'MainAPI'
            }
        ]
    }
}


export  function useSwagger(app) {


    let apiDocPath;
    if (config.App.env === 'local') {
        apiDocPath = '/api-docs';
    } else {
        apiDocPath = '/api-docs-' + config.ApiDocSecret;
    }

    app.get('/api-docs/datasources', (req, res) => {

        res.json(datasource)
    })


    app.use(apiDocPath, swaggerUi.serve, swaggerUi.setup(null, options));

    return apiDocPath;
}

