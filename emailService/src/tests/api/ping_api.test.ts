import {ApiResponseCode} from "../../types/error_codes";
import {autoTerminateProcess} from "../../lib/utils";
import {getTestHttpClient} from "../utils";

import {randomUUID} from "crypto";

const http = getTestHttpClient();
jest.setTimeout(120000);
afterAll(autoTerminateProcess);

test('TestApiPing', async () => {
    const res = await http.get<any>('/api/ping', {ref: randomUUID()});
    expect(res.message).toBe('PONG');
    expect(res.code).toBe(ApiResponseCode.OK)
});


