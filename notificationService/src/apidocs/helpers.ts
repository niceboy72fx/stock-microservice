interface SwaggerApiParameter {
    name: string,
    description?: string,
    example?: any,
    required?: boolean,
    type: 'string' | 'integer' | 'file' | 'array' | 'object',
    in: 'body' | 'path' | 'query' | 'formData' | 'header',
}

interface SwaggerApiResponse {
    code: string,
    description: string,
    sample: any
}

interface SwaggerApi {
    id: string,
    tags: string[],
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    uri: string,
    summary?: string,
    parameters: Array<SwaggerApiParameter | string>,
    responses: SwaggerApiResponse[]
}


export function createApi(api: SwaggerApi) {
    const responses = {};
    api.responses.forEach(r => {
        responses[r.code] = {
            "description": r.description,
            "examples": {
                "application/json": r.sample,

            },
        }
    });

    let parameters;

    const properties = {};
    api.parameters.forEach(param => {
        if (typeof param === 'string') {
            let required = false;
            let type = 'string';
            let body = 'body';
            let format;
            if (param[0] === '*') {
                required = true;
                param = param.replace(/^\*/, '')
            }

            const t = param.split(':');
            if (t.length > 1) {
                type = t[1]
                param = t[0]
            }

            let items;

            properties[param] = {
                'type': type,
                "description": param,
                "required": required,
                "in": body,

            }
        } else {
            properties[param.name] = {
                'type': param.type,
                "description": param.description,
                "required": param.required,
                "example": param.example,
                "in": param.in,
            }
        }
    })

    if (api.method === 'get') {
        parameters = [];
        for (const prop in properties) {
            parameters.push({
                'name': prop,
                'in': 'query',
                'type': properties[prop]['type'],
                'description': properties[prop]['description'],
            })
        }
    } else {
        parameters = [
            {
                "in": "body",
                "name": "body",
                "schema": {
                    "properties": properties
                },
            }
        ]
        let headers = Object.keys(properties).map(prop => (
            {
                'name': prop,
                'in': properties[prop]['in'],
                'type': properties[prop]['type'],
                'description': properties[prop]['description'],
            }
        )).filter((item: any,) => item['in'] == 'header')
        parameters = parameters.concat(headers)
    }

    return {
        [api.uri]: {
            [api.method]: {
                tags: api.tags,
                "description": api.summary,
                "operationId": api.id,
                "consumes": [
                    "application/json"
                ],
                parameters: parameters,
                "produces": [
                    "application/json"
                ],
                "responses": responses
            }
        }
    }
}

export function combineApi(apiObjects: Array<any>) {
    const all = {};
    apiObjects.forEach(apiObject => {
        Object.keys(apiObject).forEach(uri => {
            all[uri] = apiObject[uri]
        })
    })

    return all
}



