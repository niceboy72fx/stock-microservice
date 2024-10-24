import {ApiResponseCode} from "../../types/error_codes";
import {autoTerminateProcess, sleep} from "../../lib/utils";
import {getTestHttpClient} from "../utils";

import {randomUUID} from "crypto";
import config from "../../config";
import {io, Socket} from "socket.io-client";
import {SocketEvent} from "../../services/socket";

const http = getTestHttpClient();
jest.setTimeout(120000);
afterAll(autoTerminateProcess);

function socketConnect(): Promise<Socket> {
    const CHAT_SERVER_URL = 'http://127.0.0.1:' + config.App.port;
    return new Promise((resolve, reject) => {
        const socket = io(CHAT_SERVER_URL, {
            autoConnect: false,
            transports: [ 'websocket' ],
            auth: {
                token: 'Bearer ' + '123',
            }
        });
        socket.on('connect', () => {
            console.log('Client connected')
            resolve(socket);
        });

        socket.connect();
    })

}


const listener: any = {};
function waitForOrderResult(socket, orderId: string) {
    return new Promise((resolve, reject) => {
        socket.emit(SocketEvent.QR_PAYMENT_TRANSACTION, {orderId});
        listener[orderId] = (payload) => {
            resolve(payload)
        }
    })
}

test('TestQrSocket', async () => {
  /*  const socket = await socketConnect();
    socket.on('message', (message) => {
        console.log('TestQrSocket:message', message);
        if (message.orderId &&  listener[orderId]) {
            listener[orderId](message);
        }
    });
*/
    const orderId = '1';

    const res = await http.post<any>('/api/v1/qr-payments/send', {orderId, payload: {hello: 'world'}});

    console.log(res);
    expect(res.code).toBe(ApiResponseCode.OK);
    await sleep(5000);
});


