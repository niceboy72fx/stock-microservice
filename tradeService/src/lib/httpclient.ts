import fetch from 'node-fetch';

import {randomUUID} from "crypto";
import {jsonStringify} from "./utils";
const FormData = require('form-data');
const fs = require('fs');
const DEFAULT_REQUEST_TIMEOUT = 60000;
export class HttpRequestTimeout extends Error {

}

export class HttpRequestMockTimeout extends Error {

}


export default class HttpClient {
    private name: string;
    private readonly baseUri: string;
    private defaultHeaders: any = {};
    private timeout = DEFAULT_REQUEST_TIMEOUT;
    private verbose = false;
    #saveRequest = true;

    constructor(uri, name: string = '[Default]', verbose: boolean = false) {
        this.baseUri = uri;
        this.name = name;
        this.verbose = verbose;
    }

    setSaveRequest(value: boolean) {
        this.#saveRequest = value;
    }

    setVerbose(value: boolean) {
        this.verbose = value;
    }

    setRequestTimeout(ms) {
        this.timeout = ms;
    }

    clone(): HttpClient {
        const http = new HttpClient(this.baseUri, this.name);
        http.defaultHeaders = Object.assign({}, this.defaultHeaders);
        return http;
    }

    setAccessToken(token: string, tokenType: string = 'Bearer') {
        this.defaultHeaders['Authorization'] = tokenType + ' ' + token
    }

    setAuthorization(authorization: string) {
        this.defaultHeaders['Authorization'] = authorization;
    }


    post<T>(uri: string, params = {}): Promise<T> {
        return this._request('POST', uri, params)
    }


    get<T>(uri: string, params = {}): Promise<T> {
        return this._request('GET', uri, params)
    }

    _request<T>(method: 'POST' | 'GET', uri: string, params = {}): Promise<T> {
        const start = Date.now();

        if (this.verbose) {
            console.log(this.name, `[${method}]`, uri);
        }

        const _method = '_' + method;
        let timeoutId;
        return new Promise((resolve, reject) => {
            if (this.timeout < 0) {

                reject(new HttpRequestTimeout('Request timeout immediate : ' + this.timeout));
                return;
            }

            let saveStateLock = false;
            if (this.timeout > 0) {
                timeoutId =  setTimeout(() => {
                    if (saveStateLock) {
                        return;
                    }
                    saveStateLock = true;
                    reject(new HttpRequestTimeout('Request timeout: ' + this.timeout));
                }, this.timeout)
            }

            this[_method](uri, params).then((resData: T) => {
                if (saveStateLock) {
                    return;
                }
                saveStateLock = true;
                clearTimeout(timeoutId);
                resolve(resData);

            }).catch(err => {
                console.error(err);
                if (saveStateLock) {
                    return;
                }
                saveStateLock = true;
                clearTimeout(timeoutId);

                reject(err);
            })
        });
    }

    _GET<T>(uri: string, params = {}): Promise<T> {
        let url;
        if (Object.keys(params).length > 0) {
            url =  this.baseUri + uri + '?' + buildQuery(params);
        } else {
            url = this.baseUri + uri;
        }

        return fetch(url, {
            headers: {...this.defaultHeaders}
        }).then(response => {

            if (response.status !== 200) {
                response.text().then(v => {
                    console.error(v);
                })
                return Promise.reject('Error from server. HTTP code: ' + response.status)
            }

            return response.json();
        });
    }

    postForm<T>(uri: string, params = {}): Promise<T> {
        const formData = new FormData();
        for (const k of Object.keys(params)) {
            formData.append(k, params[k]);
        }

        return fetch(this.baseUri + uri, {
            method: 'POST',
            headers: {
                ...this.defaultHeaders
            },
            body: formData
        })
            .then((response) => {


                if (response.status !== 200) {
                    response.text().then(v => {
                        console.error(v);
                    })
                    return Promise.reject('Error from server. HTTP code: ' + response.status)
                }

                return response.json();
            })
    }


    _POST<T>(uri: string, params = {}): Promise<T> {
        //console.log('[POST]' + uri);
        return fetch(this.baseUri + uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.defaultHeaders
            },
            body: jsonStringify(params),
        })
            .then((response) => {


                if (response.status !== 200) {
                    response.text().then(v => {
                        console.error(v);
                    })
                    return Promise.reject('Error from server. HTTP code: ' + response.status)
                }

                return response.json();
            })
    }

    upload(uri: string, fileParams, normalParams = {}) {
        const formData = new FormData();

        for (const k in fileParams) {
            if (fileParams.hasOwnProperty(k)) {
                formData.append(k, fs.createReadStream(fileParams[k]));
            }
        }

        for (const k in normalParams) {
            if (normalParams.hasOwnProperty(k)) {
                formData.append(k, normalParams[k]);
            }
        }


        return fetch(this.baseUri + uri, {
            method: 'POST',
            body: formData as any,
            headers: {...this.defaultHeaders}
        }) .then((response) => {


            if (response.status !== 200) {
                response.text().then(v => {
                    console.error(v);
                })
                return Promise.reject('Error from server. HTTP code: ' + response.status)
            }

            return response.json();
        })

    }
}


export function buildQuery(data: any) {
    if (typeof data !== 'object') {
        return '';
    }

    let queries = [];
    for ( let k in data) {
        if (data.hasOwnProperty(k)) {
            queries.push( k + '=' +encodeURIComponent(data[k]));
        }
    }
    return queries.join('&');
}
