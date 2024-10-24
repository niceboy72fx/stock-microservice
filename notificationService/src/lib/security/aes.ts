import {createCipheriv, createDecipheriv, randomBytes} from 'crypto';
import config from "../../config";
//const ENC_KEY = config.AES_ENCRYPT_KEY; // set random encryption key
//const IV = "5183666c72eec9e4"; // set random initialisation vector
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');
const IV = Buffer.alloc(16);
for (let i = 0; i < 16; i++) {
    IV[i] = 0x00;
}

export function aesRandomKey() {
    return randomBytes(16).toString('hex')
}

export function aesEncrypt(val, secret) {
    let cipher = createCipheriv('aes-256-cbc', secret, IV);
    let encrypted = cipher.update(val, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export function aesDecrypt(encrypted, secret) {
    let decipher = createDecipheriv('aes-256-cbc', secret, IV);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
}
