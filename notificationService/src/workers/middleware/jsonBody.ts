import {ApiResponseCode} from "../../types/error_codes";

export function jsonBodyParser(req, res, next) {
    if (req.method === 'GET') {
        next();
        return;
    }

    let data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });

    req.on('end', function() {
        if (data) {
            try {
                req.body = JSON.parse(data);
                next();
            } catch (err) {
                console.error(req.method, req.url, 'Error when parse json body', err);
                res.send({
                    code: ApiResponseCode.SERVER_ERROR,
                    message: 'Invalid json body'
                })
            }
        } else {
            next();
        }
    });
}

export function fixRawRequestBody(proxyReq, req) {
    const rawBody = req.rawBody;

    if (!rawBody) {
        return;
    }

    proxyReq.setHeader('Content-Length', Buffer.byteLength(rawBody));
    proxyReq.write(rawBody);
}


