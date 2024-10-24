
export interface RequestLogEntry {
    id: string,
    name: string,
    env: string,
    time: Date | string,
    status: number,
    method: string,
    uri: string,
    payload: string,
    response: string,
    query: string,
    request_headers: string,
    response_headers: string,
    execution_time: number,
    ip: string,
}
