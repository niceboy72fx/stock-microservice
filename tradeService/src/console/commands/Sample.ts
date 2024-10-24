import DateTime from "../../lib/core/DateTime";
import config from "../../config";
import {io} from "socket.io-client";

export default async function Sample() {

    const CHAT_SERVER_URL = 'http://127.0.0.1:' + config.App.port;
    const socket = io(CHAT_SERVER_URL, {
        autoConnect: false,
        transports: [ 'websocket' ],
        auth: {
            token: 'Bearer ' + '123',
        }
    });
    socket.on('connect', () => {
        console.log('Client connected')
    })
    socket.connect();
    socket.on('message', (data) => {
        console.log('Message from server', data);
    })

    return 111;

}

