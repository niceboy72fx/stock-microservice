import * as express from 'express';
import {createServer} from 'http';
import router from "../routes/routes";
import config from "../config";
import {isStringNullOrWhiteSpace} from "../lib/utils";
import {jsonBodyParser} from "./middleware/jsonBody";
import {useSwagger} from "../apidocs/swagger";
import { Server } from "socket.io";
import {SocketClient, socketManager} from "../services/socket";
const port = config.App.port;

export async function startHttpWorker() {

    const app = express();
    const http = createServer(app);
    app.disable( 'x-powered-by' );
    app.use(express.static('public'));
    app.use(jsonBodyParser);
    app.use(router);

    let apiDocPath;
    if (config.ApiDocEnabled) {
        apiDocPath = useSwagger(app);
    }

    const io = new Server(http, {
        // options
    });

    io.on("connection", (socket) => {
        // ...
        console.log(`Socket ${socket.id} connected`);
        socketManager.handle(new SocketClient(socket));
    });


    /*if (config.SAVE_REQUEST_LOG) {
        processSaveRequestLogs(5000);
    }*/


    http.listen(port, '0.0.0.0',function(){
        if (config.WORKER_ID === 'HttpWorker-0') {
            console.log('Listening on http://localhost:' + port);
            if (apiDocPath) {
                console.log('Swagger URL at http://localhost:' + port + apiDocPath);
            } else {
                console.warn('Swagger URL is disabled')
            }
        }
    });
}

