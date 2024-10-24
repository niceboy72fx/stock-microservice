import AppRequest from "../../lib/http/AppRequest";
import {ApiResponseCode} from "../../types/error_codes";
import {isStringNullOrWhiteSpace} from "../../lib/utils";
import {socketManager} from "../../services/socket";

interface QrPaymentSendPayload {
    orderId: string,
    payload: any
}
export default class QrPaymentController {

    static async send(req: AppRequest) {
        const payload = req.data<QrPaymentSendPayload>();
        if (isStringNullOrWhiteSpace(payload.orderId)) {
            return {
                code: ApiResponseCode.VALIDATION_ERROR,
                message: 'Missing orderId',
            }
        }

        socketManager.sendOrderResult(payload.orderId, payload);

        return {
            code: ApiResponseCode.OK,
            message: 'OK'
        }
    }
}
