import HttpClient from "../../lib/httpclient";
import config from "../../config";

const http = new HttpClient(config.App.url);

export function getTestHttpClient(): HttpClient {
    return http;
}

export async function initialTestAccessToken(client: HttpClient) {

}
