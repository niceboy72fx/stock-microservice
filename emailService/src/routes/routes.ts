import Route from '../lib/router';
import PingController from "../controllers/v1/PingController";
import {Router as ExpressRouter} from "express";
import MiniRouter from "../lib/core/MiniRouter";
import QrPaymentController from "../controllers/v1/QrPaymentController";

const expressRouter = ExpressRouter();



Route.group('/api/v1', [], (router: MiniRouter) => {
    router.post('/qr-payments/send', QrPaymentController.send);
});


Route.get('/api/ping', PingController.ping);
Route.get('/', async (req) => {
    return 'OK'
});


Route.apply(expressRouter);

export default expressRouter;
