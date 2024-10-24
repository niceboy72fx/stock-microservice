
import {Request} from 'express';


export default class AppRequest {
    private _request: Request | any;
    private _data: any = undefined;
    public query: any;
    public ip: string;
    public method: string;
    public uri: string;
    public headers: any;
    public files?: Array<any>;
    public file?: any;

    public User?: {
        id: number,
    }


    public data<T>(): T {
        if (this._data !== undefined) {
            return this._data;
        }

        if (this.method === 'GET') {
            this._data = this.query;
        } else {
            this._data = this._request.body;
        }

        return this._data || {};
    }

    public dataAsIntMap<T>(fields: Array<string>) {
        const data = this.data<any>();
        fields.forEach(field => {
            if (data[field]) {
                data[field] = parseInt(data[field]) ?? 0;
            } else {
                data[field] = 0;
            }
        });

        return data;
    }

    public dataAsMap<T>(map: (v: any, k: string) => any) {
        const data = this.data<any>();
        for (const k in data) {
            data[k] = map(data[k], k);
        }

        return data;
    }

    public get(key: string, defaultValue: any = null) {
        const data = this.data<any>();
        return data[key]?? defaultValue;
    }

    public queryJson<T>(): T | null {
        return this.query;
    }

    public toJSON() {
        return {
            method: this.method,
            uri: this.uri,
            query: this.query,
            headers: this.headers,
            files: this.files,
            file: this.file,
            ip: this.ip,
            body: this._request.body,
        }
    }

    constructor(req: Request | any) {
        this._request = req;

        this.method = req.method;
        this.uri = req.url;
        this.query = req.query;
        this.headers = req.headers;
        this.files = req.files;
        this.file = req.file;
        this.ip =  req.headers['x-forwarded-for'] || req.connection.remoteAddress
    }
}