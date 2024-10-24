import * as jwt from 'jsonwebtoken'
import config from "../../config";
import * as fs from 'node:fs';
const crypto = require('crypto');


interface JwtSignResult {
    jti: string,
    token: string,
    expiresIn: number
}

export function signUserId(userId: number, type: string): string {
    return jwt.sign({
        data: {
            type,
            id: userId
        }
    }, config.JWT.secret, {expiresIn: 60 * 60});
}

export function sign(aud: string): JwtSignResult {
    try {
        const res: JwtSignResult = {
            jti: crypto.randomBytes(40).toString('hex'),
            token: null,
            expiresIn: 1292400
        }

        const now = Math.ceil(Date.now()/1000);

        const iat = now - 3600;
        const nbf = iat;

        const payload = {
            "aud": aud,
            "jti": res.jti,
            "iat": iat,
            "nbf": nbf ,
            "exp": iat + res.expiresIn,
            "sub": "",
            "scopes": []
        }

        res.token =  jwt.sign(payload, config.JWT.secret, { algorithm: 'RS256' });

        return res;
    } catch (err) {
        console.error(err)
        return null;
    }
}

export function decodeUserId(token: string) {
    try {
        const decoded: any = jwt.verify(token, config.JWT.secret, { algorithms: ['RS256']});
        return decoded.aud;
    } catch (err) {
        console.error(err)
        return null;
    }
}

export function encryptBodyForClient(body: any): string {
    return jwt.sign({
        data: body
    }, config.JWT.client_secret, {expiresIn: 60 * 60});
}

export function decodeBodyForClient(encrypted: string) {
    try {
        const decoded: any = jwt.verify(encrypted, config.JWT.client_secret);
        return decoded.data;
    } catch (err) {
        return null;
    }
}

/**
 * @deprecated see decodeBodyForClient
 * @param encrypted
 */
export function decodeBody(encrypted: string) {
    try {
        const decoded: any = jwt.verify(encrypted, config.JWT.client_secret);
        return decoded.data;
    } catch (err) {
        return null;
    }
}
