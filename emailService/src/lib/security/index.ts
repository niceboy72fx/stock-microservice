import {promises as fs} from "node:fs";
import {createPrivateKey, createPublicKey, createSign, createVerify, generateKeyPairSync} from "node:crypto";
import {createHash} from "crypto";

const crypto = require('node:crypto');

export function generateEncryptKey(size = 32, maxLength = 32): Promise<string> {
    return new Promise((resolve) => {
        crypto.randomBytes(size, function (ex, buf) {
            const token = buf.toString('base64').replace(/\//g, '_')
                .replace(/\+/g, '-');
            resolve(token.substring(0, maxLength));
        });
    })
}

function fileExists(file) {
    return fs.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}


export async function generateGodKeyPair() {
    await fs.mkdir('./storage/private', { recursive: true });

    const privateKeyFile = './storage/private/god.pem';
    const publicKeyFile = './storage/private/god.pub';
    if (!await fileExists(privateKeyFile)) {
        const {privateKey, publicKey} = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "pkcs1",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs1",
                format: "pem",
            },
        });

        await Promise.all([
            fs.writeFile(privateKeyFile, privateKey),
            fs.writeFile(publicKeyFile, publicKey)
        ]);

        console.log('Save to', privateKeyFile);
        console.log('Save to', publicKeyFile)
    } else {
        console.log('File ', privateKeyFile, 'already exists')
    }
}


export async function createSignData(payload: any): Promise<string> {
    const prvKeyContents = await fs.readFile('./storage/private/god.pem', 'utf-8');

    const privateKey = createPrivateKey(prvKeyContents)

    const sign = createSign('SHA256');
    sign.write(payload);
    sign.end();
    return sign.sign(privateKey, 'hex').toString();
}

export async function verifySignData(data: string, signature: string): Promise<boolean> {
    const publicKeyContents = await fs.readFile('./storage/private/god.pub', 'utf-8');
    const publicKey = createPublicKey(publicKeyContents)


    const verify = createVerify('SHA256');
    verify.write(data);
    verify.end();

    return verify.verify(publicKey, signature, 'hex');
}

export function sha256(input): string { // <2>
    return createHash('sha256').update(input).digest('hex');
}