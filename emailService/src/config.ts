import {deepFreeze, envBoolVal, envIntVal, envIntValMin} from "./lib/basics";

const env = process.env;
const WORKER_ID = process.env.WORKER_ID;
const defaultIgnored = 'jpg,png,ico,css,bmp,js,svg,mp4,mp3,mov,mkv,ogg,json';

let APP_SHOW_SQL = envBoolVal(env.APP_SHOW_SQL);
if (process.env.JEST_WORKER_ID !== undefined) {
    APP_SHOW_SQL = false;
}
export interface MysqlConfig {
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
    poolSize?: number,
}

const config = {
    APP_TIMEZONE: 'Asia/Ho_Chi_Minh',
    QUEUE_BATCH_SIZE_MASTER_ACCOUNTING: envIntValMin(env.QUEUE_BATCH_SIZE_MASTER_ACCOUNTING, 5),
    QUEUE_BATCH_SIZE_TRANSFER: envIntValMin(env.QUEUE_BATCH_SIZE_TRANSFER, 5),
    QUEUE_WAIT_TIMEOUT: envIntValMin(env.QUEUE_WAIT_TIMEOUT, 30),
    MASTER_ACCOUNTING_ASYNC_CALLBACK: env.MASTER_ACCOUNTING_ASYNC_CALLBACK,
    APP_TEST_URL_AUTH: env.APP_TEST_URL_AUTH,
    SWAGGER_ENDPOINT: env.SWAGGER_ENDPOINT || 'localhost:14009',
    PERSONAL_WALLET_URL: env.PERSONAL_WALLET_URL,
    PERSONAL_WALLET_REQUEST_TIMEOUT: envIntValMin(env.PERSONAL_WALLET_REQUEST_TIMEOUT, 60),
    DB_MIGRATE_RUN: envBoolVal(env.DB_MIGRATE_RUN),
    WORKER_ID: WORKER_ID || 'Master',
    HTTP_WORKER_ENABLED: envBoolVal(env.HTTP_WORKER_ENABLED),
    QUEUE_WORKER_ENABLED: envBoolVal(env.QUEUE_WORKER_ENABLED),
    SCHEDULE_WORKER_ENABLED: envBoolVal(env.SCHEDULE_WORKER_ENABLED),
    HTTP_WORKER_COUNT: envIntValMin(env.HTTP_WORKER_COUNT, 0),
    QUEUE_WORKER_COUNT: envIntValMin(env.QUEUE_WORKER_COUNT, 0),
    QUEUE_WORKER_ID_FROM: envIntValMin(env.QUEUE_WORKER_ID_FROM, 0),
    QUEUE_WORKER_ID_TO: envIntValMin(env.QUEUE_WORKER_ID_TO, 0),
    APP_SHOW_CACHE_QUERY: envBoolVal(env.APP_SHOW_CACHE_QUERY),
    RABBITMQ_ENABLED: envBoolVal(env.RABBITMQ_ENABLED),
    SAVE_REQUEST_LOG: envBoolVal(env.SAVE_REQUEST_LOG),
    IGNORED_URI_EXT: env.IGNORED_URI_EXT ? env.IGNORED_URI_EXT.split(','): defaultIgnored.split(','),
    TAG: WORKER_ID ? `[${WORKER_ID}]` : '[Master]',
    ApiDocSecret: env.API_DOC_SECRET,
    ApiDocEnabled: envBoolVal(env.API_DOC_ENABLED),
    AccessLogEnabled: envBoolVal(env.ACCESS_LOG_ENABLED),
    UNIT_TEST_CLIENT_ID: env.UNIT_TEST_CLIENT_ID,
    UNIT_TEST_CLIENT_SECRET: env.UNIT_TEST_CLIENT_SECRET,
    App: {
        showSql: APP_SHOW_SQL,
        showSqlBindings: envBoolVal(env.APP_SHOW_SQL_BINDINGS),
        debug: envBoolVal(env.APP_DEBUG),
        env: env.APP_ENV,
        url: env.APP_URL,
        swaggerEndpoint: env.APP_URL,
        assetUrl: env.ASSET_URL || env.APP_URL,
        test_url: env.APP_TEST_URL,
        port: envIntVal(env.APP_PORT, 14001),
    },
    RabbitMQ: {
        default: {
            enabled: env.RABBITMQ_ENABLED,
            workerCount: env.QUEUE_WORKER_COUNT,
            host: env.RABBITMQ_HOST,
            username: env.RABBITMQ_USERNAME,
            password: env.RABBITMQ_PASSWORD,
        }
    },
    JWT: {
        secret: env.JWT_SECRET,
        client_secret: env.JWT_CLIENT_SECRET, //JWT SECRET share với client
    },
    Redis: {

        default: {
            prefix: 'ekids_api.',
            host: env.REDIS_HOST || '127.0.0.1',
            port: envIntVal(env.REDIS_PORT, 6379) ,
            password: env.REDIS_PASSWORD || undefined
        }
    },
    Kafka: {
        topicId: 'Broker',
        clientId: 'Api',
        enabled: envBoolVal(env.KAFKA_ENABLED),
        default: {
            brokers: env.KAFKA_BROKERS ? env.KAFKA_BROKERS.split(',') : []
        }
    },
    Postgresql: {
        default: {
            host: env.DB_HOST || '127.0.0.1',
            port: envIntVal(env.DB_PORT, 5432),
            database: env.DB_DATABASE || '',
            user: env.DB_USERNAME || 'root',
            password: env.DB_PASSWORD || undefined,
            poolSize: envIntVal(env.DB_POOL_SIZE, 10),
        },
        log: {
            host: env.DB_LOG_HOST || '127.0.0.1',
            port: envIntVal(env.DB_LOG_PORT, 5432),
            database: env.DB_LOG_DATABASE || '',
            user: env.DB_LOG_USERNAME || 'root',
            password: env.DB_LOG_PASSWORD || undefined,
            poolSize: envIntVal(env.DB_LOG_POOL_SIZE, 10),
        },
        sandbox: {
            host: env.DB_SANDBOX_HOST || '127.0.0.1',
            port: envIntVal(env.DB_SANDBOX_PORT, 5432 ) ,
            database: env.DB_SANDBOX_DATABASE || '',
            user: env.DB_SANDBOX_USERNAME || 'root',
            password: env.DB_SANDBOX_PASSWORD || undefined,
            poolSize: envIntVal(env.DB_SANDBOX_POOL_SIZE, 10),
        }
    },
    MySQL: {
        default: {
            host: env.DB_HOST || '127.0.0.1',
            port: env.DB_PORT|| 3306,
            database: env.DB_DATABASE || '',
            user: env.DB_USERNAME || 'root',
            password: env.DB_PASSWORD || undefined,
            poolSize: 10,
        } as MysqlConfig,
    }
}

deepFreeze(config);

export default config;
