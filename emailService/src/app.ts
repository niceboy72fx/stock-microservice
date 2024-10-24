import {printConfigStatus} from "./lib/utils";
import {parseArgvOptions} from "./lib/basics";
import * as process from "node:process";
const cluster = require('node:cluster')
import config from "./config";

let HTTP_WORKER_COUNT = config.HTTP_WORKER_COUNT;
let QUEUE_WORKER_COUNT = config.QUEUE_WORKER_COUNT;
if (HTTP_WORKER_COUNT < 1) {
    HTTP_WORKER_COUNT = 1;
}
enum WorkerType {
    HTTP = 'HttpWorker',
    QUEUE = 'QueueWorker',
    SCHEDULE = 'ScheduleWorker'
}


function folk(env) {
    const worker: any = cluster.fork(env);
    worker.process.env = env;
    return worker
}

export async function mainApp() {
    if (cluster.isPrimary) {

        const options = parseArgvOptions(process.argv);

        //await autoDbInit();
        console.log(`Primary ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < HTTP_WORKER_COUNT; i++) {
            const envProxy = {
                WORKER_ID: 'HttpWorker-' + i,
                WORKER_TYPE: WorkerType.HTTP
            };

            folk(envProxy);
        }


        cluster.on('exit', (deadWorker, code, signal) => {
            console.log(`Worker ${deadWorker.process.env.WORKER_ID} died. Respawn after 3 seconds`);
            setTimeout(() => {
                folk(deadWorker.process.env);
                console.log(`Worker ${deadWorker.process.env.WORKER_ID} respawn`);
            }, 3000)

        });
    } else {
        const workerType = process.env.WORKER_TYPE;
        switch (workerType) {
            case WorkerType.HTTP:
                await require('./workers/http').startHttpWorker();
                break;
            case WorkerType.QUEUE:
                await require('./workers/queue').startQueueWorker();
                break;
            case WorkerType.SCHEDULE:
                await require('./workers/schedule').startScheduleWorker();
                break;
        }

    }
}

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });
