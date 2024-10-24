import {Router as ExpressRouter} from 'express';
import AppRequest from "../http/AppRequest";
import config from "../../config";
import {jsonStringify} from "../utils";

import DateTime from "./DateTime";
import {randomUUID} from "crypto";
import {ApiResponseCode} from "../../types/error_codes";
import {RequestLogEntry} from "../../types/define.type";
const { SAVE_REQUEST_LOG } = config;

interface RouteEntry {
    path: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    callback: RouteHandler,
    middleware?: Array<RouteMiddleware>
}

export type RouteMiddleware = (req: AppRequest, res, next) => void;
export type RouteHandler = (req: AppRequest) => Promise<any>


export default class MiniRouter {
    private readonly _prefix: string = '';
    private _routes: RouteEntry[] = [];
    private readonly _middleware: Array<RouteMiddleware> = [];

    constructor(prefix = '', middleware: Array<RouteMiddleware> = []) {
        this._prefix = prefix
        this._middleware = middleware;
    }

    public getPrefix(): string {
        return this._prefix;
    }

    public getMiddleware() {
        return this._middleware;
    }

    public addMiddleware(middleware) {
        this._middleware.push(middleware);
    }

    public getRoutes(): RouteEntry[] {
        return this._routes;
    }


    delete(path: string, cb: RouteHandler) {
        this._routes.push({
            path,
            method: 'delete',
            callback: cb,
            middleware: this._middleware,
        })
    }

    patch(path: string, cb: RouteHandler) {
        this._routes.push({
            path,
            method: 'patch',
            callback: cb,
            middleware: this._middleware,
        })
    }

    put(path: string, cb: RouteHandler) {
        this._routes.push({
            path,
            method: 'put',
            callback: cb,
            middleware: this._middleware,
        })
    }

    get(path: string, cb: RouteHandler) {
        this._routes.push({
            path,
            method: 'get',
            callback: cb,
            middleware: this._middleware,
        })
    }

    post(path: string, cb: RouteHandler) {
        this._routes.push({
            path,
            method: 'post',
            callback: cb,
            middleware: this._middleware,
        })
    }

    private merge(target: MiniRouter) {
        const targetPrefix = target.getPrefix();
        const subMiddleware = [...this._middleware, ...target.getMiddleware()];
        for (const route of target.getRoutes()) {
            this._routes.push({
                method: route.method,
                path: targetPrefix + route.path,
                callback: route.callback,
                middleware: subMiddleware
            })
        }
    }

    group(prefix: string, middleware: Array<RouteMiddleware>, callback: (MiniRouter) => void) {
        const router = new MiniRouter(prefix, middleware);
        callback(router);
        this.merge(router);
    }

    apply(router: ExpressRouter) {
        for (const route of this._routes) {
            router[route.method](route.path, routeAction(route.callback, route.method.toUpperCase(), route.middleware));
        }
    }
}



function pushAccessLog(req: AppRequest, response: any, timeExec = 0) {
    const log: RequestLogEntry = {
        id: randomUUID(),
        env: config.App.env,
        name: process.env.WORKER_NAME,
        status: 200,
        method: req.method,
        uri: req.uri.split('?')[0],
        payload: req.data(),
        response: jsonStringify(response),
        time: DateTime.now().toString(),
        request_headers: req.headers,
        response_headers: null,
        execution_time: timeExec,
        query: req.query,
        ip: req.ip
    };

    //enqueueRequestLog(log);
}

function middlewareCall(arr, index, reqObject, res, done) {
    if (index <= arr.length - 1) {
        if (typeof arr[index] !== 'function') {
            res.json({
                code: ApiResponseCode.SERVER_ERROR,
                error: 'Invalid Middleware',
                message: 'Middleware must be a function. Given value: ' + typeof arr[index]
            });
        } else {
            arr[index](reqObject, res, function () {
                index++;
                middlewareCall(arr, index, reqObject, res, done)
            });
        }
    } else {
        done();
    }
}

function routeAction(cb, method: string, middleware: RouteMiddleware | RouteMiddleware[] = null) {
    return async function (req, res) {

        const reqObject = new AppRequest(req);

        if (middleware) {
            if (!Array.isArray(middleware)) {
                middleware = [middleware];
            }

            middlewareCall(middleware, 0, reqObject, res, async () => {
                const timeStart = Date.now();

                try {
                    const result = await cb(reqObject);
                    if (SAVE_REQUEST_LOG) {
                        pushAccessLog(reqObject, result, Date.now() - timeStart);
                    }

                    res.setHeader('Content-Type', 'application/json');
                    return res.send(jsonStringify(result));
                } catch (err) {
                    //errorReport('MiniRouter', err);
                    const responseData = {
                        code: ApiResponseCode.UNKNOWN_ERROR,
                        message: err.message,
                        trace: err.stack.split("\n")
                    };

                    if (SAVE_REQUEST_LOG) {
                        pushAccessLog(reqObject, responseData, Date.now() - timeStart);
                    }

                    res.setHeader('Content-Type', 'application/json');
                    return res.send(jsonStringify(responseData));
                }

            });

        } else {
            const timeStart = Date.now();
            const result = await cb(reqObject);
            if (SAVE_REQUEST_LOG) {
                pushAccessLog(reqObject, result, Date.now() - timeStart);
            }

            res.setHeader('Content-Type', 'application/json');
            return res.send(jsonStringify(result));
        }
    }
}

