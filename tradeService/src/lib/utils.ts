import * as path from "path";
import AppRequest from "./http/AppRequest";
import {Buffer} from "buffer";
import config from "../config";
const fs = require('node:fs');
import {spawn} from "child_process";
import {sha256} from "./security";
import {randomUUID} from "crypto";

export function info(v: string) {
    console.info(v);
}

let terminateTimeoutId;
export function autoTerminateProcess() {
   // clearTimeout(terminateTimeoutId);
    terminateTimeoutId = setTimeout(() => process.exit(0), 30000);
}

export function clone(item: any) {
    if (!item) { return item; } // null, undefined values check

    let types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function (child, index, array) {
                result[index] = clone(child);
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (typeof item.clone === 'function') {
                result = item.clone();
            } else {
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        // it is an object literal
                        result = {};
                        for (const i in item) {
                            result[i] = clone(item[i]);
                        }
                    }
                } else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            }

        } else {
            result = item;
        }
    }

    return result;
}

interface PagingInfo {
    offset: number,
    limit: number
}

export function getPagingInfo(req: AppRequest): PagingInfo {

    const params = req.data<any>();

    let page = Math.max(params.page, 1);

    if (!page) { // Trường hợp NaN
        page = 1
    }

    let limit = Math.min(100, params.limit || 25);
    if (!limit || limit <= 0) {
        limit = 25
    }

    const offset = (page - 1) * limit;

    return {
        limit,
        offset
    }
}

export function getCurrentMysqlTime(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function getMysqlTimestamp(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function isEmpty(value: any) {
    if (value == null) {
        return true;
    }

    if (!value) {
        return true;
    }

    if (typeof value === 'string') {
        return isStringNullOrWhiteSpace(value);
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    if (isPlainObject(value)) {
        return Object.keys(value).length === 0;
    }

    return false;
}

export function isBlank(value: any): boolean {
    if (!value) {
        return true;
    }

    if (typeof value !== 'string') {
        value = value.toString();
    }

    return value.replace(/\s/g, '').length == 0;
}

export function isStringNullOrWhiteSpace(value: any): boolean {
    if (!value) {
        return true;
    }

    if (typeof value !== 'string') {
        value = value.toString();
    }

    return value.replace(/\s/g, '').length == 0;
}


export function hasOwnProperty(object, key: string): boolean {
    if (object == null) {
        return false;
    }

    return Object.hasOwn(object, key);
}


export function strFormat( str: string, data: any): string {
    if (typeof str !== 'string') {
        throw new Error('strFormat: str is not a string')
    }

    return str.replace(
            /{(\w*)}/g, // or /{(\w*)}/g for "{this} instead of %this%"
            function( m, key ){
                return data.hasOwnProperty( key ) ? data[ key ] : "";
            }
        );
}


export function renameFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, function(err) {
            if ( err ) {
                return reject(err);
            } else {
                resolve(newPath);
            }
        });
    })
}

export function fileWrite(newFile, buffer) {
    return new Promise((resolve, reject) => {
        fs.writeFile(newFile, buffer, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    })
}

export function mkdir(dirname) {
    return new Promise((resolve, reject) => {
        const absPath = path.resolve(dirname);
        if (fs.existsSync(absPath)) {
            // Do something
            console.log(`Directory ${absPath} already eists.`);
            resolve(true);
            return;
        }

        fs.mkdir(absPath, (err) => {
            if (err) {
                return reject(err);
            }

            resolve(true);
            console.log(`Directory ${absPath} created.`);
        });
    })
}

export function sleep(timeout, resolveValue: any = true) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(resolveValue)
        }, timeout);
    })
}

export function isNumeric(str: any) {
    if (typeof str != "string") return false // we only process strings!

    return !isNaN(Number(str)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


export function randomInteger(min: number, max: number): number { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}


export function printConfigStatus(name: string, value: any) {
    if (typeof value === 'boolean') {
        value = value ? 'ON' : 'OFF';
    }

    const maxLength = 50;

    if (name.length < maxLength) {
        for (let i = name.length; i < maxLength; i++) {
            name += ".";
        }
    }

    console.log(`Config: ${name}${value}`);
}

export function printSchemaStatus(name: string, exists: boolean) {
    let value = exists ? 'EXISTS': 'AUTO CREATED';


    const maxLength = 50;

    if (name.length < maxLength) {
        for (let i = name.length; i < maxLength; i++) {
            name += ".";
        }
    }

    console.log(`Table: ${name}${value}`);
}


export function tryParseJSON(str, defaultValue = null) {
    try {
        if (typeof str !== 'string') {
            return str;
        }

        return JSON.parse(str);
    } catch (err) {
        return defaultValue;
    }
}

export function getUriExtension(uri) {
    if (!uri) {
        return '';
    }
    try {
        const tmp = uri.split('.')
        if (tmp.length > 1) {
            return tmp[tmp.length - 1].toLowerCase();
        }

        return '';
    } catch (err) {

    }

    return '';
}


/**
 *
 * @param {Buffer} buffer
 * @return {string}
 */
export function prettyResponse(buffer) {
    if (!buffer) {
        return '';
    }


    if (buffer instanceof Buffer) {
        let content = buffer.toString('utf8');
        try {
            return jsonStringify(JSON.parse(content), 4);
        } catch (err) {
            return content;
        }
    } else if (typeof buffer === 'string') {
        try {
            return jsonStringify(JSON.parse(buffer), 4);
        } catch (err) {
            return buffer;
        }
    } else if (typeof buffer === 'object') {
        return jsonStringify(buffer, 4);
    }

    return buffer.toString();
}



export function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function appUrl(path: string) {
    if (!path) {
        return '';
    }

    if (typeof path !== 'string') {
        return config.App.url;
    }

    if (path.charAt(0) !== '/') {
        path = '/' + path;
    }

    return config.App.url + path;
}

export function bigint2Int(value: bigint): number {
    const v = parseInt(value.toString());
    const a = v.toString(), b = value.toString();
    if (v.toString() !== value.toString()) {
        throw new Error(`Convert from bigint to int failed ${a} != ${b}`)
    }

    return v;
}

export function intVal(value: number | string | null) {
    if (value == null) {
        return 0;
    }

    if (typeof value === 'string') {
        return parseInt(value) || 0;
    }

    if (isNaN(value)) {
        return 0;
    }

    return value;
}

export function isPlainObject(value): boolean {
    return value?.constructor === Object;
}

export interface TapResult<T> {
    $tag?: string,
    $time: number,
    $result: T,
    $sql: any
}

export async function tap<T>(callback: () => Promise<any>, tag: string = 'node'): Promise<TapResult<T>> {
    const start = Date.now();
    const res = await callback();
    return {
        $tag: tag,
        $time: Date.now() - start,
        $result: res,
        $sql: []
    }
}

export function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}

export function isTranslateLikeString(input: string) {
    if (!input) {
        return false;
    }

    try {
        const obj = JSON.parse(input);
        if (isPlainObject(obj)) {
            if (obj.hasOwnProperty('vi') || obj.hasOwnProperty('en')) {
                return true;
            }

        }

        return false;

    } catch (err) {
        console.error(err);
        return false;
    }

}

export function isJSONLikeString(input: string) {
    if (!input) {
        return false;
    }

    try {
        const obj = JSON.parse(input);
        if (isPlainObject(obj) || Array.isArray(obj)) {
            return true;
        }

        return false;

    } catch (err) {
        return false;
    }

}

export function getTypesFromObject(input: any): string {
    if (!isPlainObject(input)) {
        throw new Error('Only plain object supported')
    }

    const types = [];
    for (const k in input) {
        const v = input[k];
        const typeofV = typeof v;

        if (typeofV === 'string') {
            types.push(`${k}: string`);
        } else if (typeofV === 'number') {
            types.push(`${k}: number`);
        } else if (typeofV === 'boolean') {
            types.push(`${k}: boolean`);
        } else if(Array.isArray(v)) {
            types.push(`${k}: Array<any>`);
        } else {
            types.push(`${k}: any`);
        }
    }
    const codes = types.join(',\n');

    return `export interface ShadowRoot {
        ${codes}
    }`
}


export function childProcessSpawn(command: string, args: Array<string>, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const ls = spawn(command, args, {
            cwd: cwd
        });

        let output = '';
        ls.stdout.on('data', (data) => {
            output += data;
        });

        ls.stderr.on('data', (data) => {
            reject(data);
        });

        ls.on('close', (code) => {
            resolve(output);
        });
    })
}

export function validatePhone(phone: any): boolean {
    if (typeof phone !== 'string') {
        return false;
    }

    return /^[0-9]{10}$/.test(phone);
}


export function numberFormat(number: any) {
    if (number == null) {
        return  '0';
    }

    if (typeof number !== 'number') {
        return number.toString();
    }

    if (isNaN(number)) {
        return  '0';
    }


    return new Intl.NumberFormat().format(number)
}

export function isPersonalWallet(accountNumber: string): boolean {
    if (typeof accountNumber !== 'string') {
        return false;
    }

    return accountNumber[0] === '0';
}

export function randomReferenceId(): string {
    return sha256(randomUUID()).substring(0, 12);
}

export function jsonStringify(value: any, space?) {
    return JSON.stringify(value, (key, value) => {
            return typeof value === 'bigint'
                ? value.toString()
                : value
        }, space
    );
}

export function createQueueBuffer(obj: any): Buffer {
    return Buffer.from(jsonStringify(obj))
}