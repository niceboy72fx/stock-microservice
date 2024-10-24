import config from "../config";
import {jsonStringify} from "./utils";
import DateTime from "./core/DateTime";

const methods = ['log', 'info', 'warn', 'debug'];
const LOG_PRINT_INTERVAL = 2000;
const logBuffer: Array<any> = [];
const $console: any = {};

/**
 * @description Thay thế hàm chuẩn của nodejs bằng cách push và buffer chứ ko call stdout or stderr
 */
function replaceNativeLogger() {
    methods.forEach(method => {
        $console[method] = console[method];


        console[method] = function () {
            const len = arguments.length;
            const timestamp = '[' + getTimestamp() + ']';
            const args = [config.TAG, timestamp];

            for (let i = 0; i < len; i++) {
                args.push(arguments[i]);
            }

            // console.log,warn,..  là hàm đòng bộ nên ko gọi nhiều sẽ giảm hiệu năng
            // Push vào buffer để xử lý sau
            //logBuffer.push(args);
            $console[method](...args);
        }
    });
}

function toString(obj) {
    const typeOf = typeof obj;

    if (typeOf === 'string' || typeOf === 'number') {
        return obj;
    }

    if (obj instanceof Date) {
        return obj.toISOString().slice(0, 19).replace('T', ' ');
    }

    if (obj instanceof Error) {
        return obj.stack;
    }

    if (Array.isArray(obj) || typeof obj === 'object') {
        return jsonStringify(obj);
    }

    if (obj === null) {
        return '(null)'
    }

    if (obj === undefined) {
        return '(undefined)'
    }

    return obj.toString();
}

function logPrintProcess() {
    const toPrintLogBuffer = [];
    toPrintLogBuffer.push.apply(toPrintLogBuffer, logBuffer);
    logBuffer.length = 0;

    if (toPrintLogBuffer.length > 0) {
        if (config.App.debug) {
            toPrintLogBuffer.forEach(args => {
                $console.log.apply($console, args);
            })
        } else {
            let output = toPrintLogBuffer.map(args => {
                return args.map(e => toString(e)).join(" ");
            }).join("\n")

            process.stdout.write(output + "\n");
        }


    }

    setTimeout(logPrintProcess, LOG_PRINT_INTERVAL);
}

function getTimestamp() {
    return DateTime.now().toString()
}

replaceNativeLogger();

