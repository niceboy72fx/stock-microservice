import AppRequest from "../../lib/http/AppRequest";
import {ApiResponseCode} from "../../types/error_codes";


export default class PingController {

    static async ping(req: AppRequest) {



        return {
            code: ApiResponseCode.OK,
            message: 'PONG',
        }
    }


}
