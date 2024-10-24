import {Socket} from "socket.io";

export enum SocketEvent {
    MESSAGE = 'message',
    DISCONNECT = 'disconnect',
    QR_PAYMENT_TRANSACTION = 'QR_PAYMENT_TRANSACTION',
}

export class SocketClient {
    #socket: Socket;

    constructor(raw: Socket) {
        this.#socket = raw;
    }

    get id() {
        return this.#socket.id;
    }

    emit(event: SocketEvent, data: any) {
        this.#socket.emit(event, data);
    }

    on(event: SocketEvent, callback: (data: any) => void) {
        this.#socket.on(event, callback);
    }
}

export class SocketManager {
    #sockets: {[key: string]: SocketClient} = {};
    #socketOrderIdMap: {[key: string]: SocketClient} = {};

    constructor() {

    }

    sendOrderResult(orderId: string, payload: any) {
        if (orderId in this.#socketOrderIdMap) {
            const socket = this.#socketOrderIdMap[orderId];
            socket.emit(SocketEvent.MESSAGE, {
                orderId: orderId,
                payload
            })
        } else {
            console.warn(`No socket map for order ${orderId}`);
        }
    }

    handle(socket: SocketClient) {
        this.#sockets[socket.id] = socket;
        socket.on(SocketEvent.DISCONNECT, () => {
            console.log(`Socket ${socket.id} disconnected`);
            delete this.#sockets[socket.id];
            for (const orderId in this.#socketOrderIdMap) {
                const sk = this.#socketOrderIdMap[orderId];
                if (sk.id === socket.id) {
                    delete  this.#socketOrderIdMap[orderId];
                }
            }
        });

        socket.on(SocketEvent.QR_PAYMENT_TRANSACTION, (data) => {
            const orderId = data.orderId;
            if (orderId) {
                this.#socketOrderIdMap[orderId] = socket;
            }
        });
    }
}

export const socketManager = new SocketManager();
