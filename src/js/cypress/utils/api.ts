import { setCacheValue } from "./cache";

/* eslint-disable class-methods-use-this */
export interface Request {
    path: string;
    body: string;
    method: "POST" | "GET" | "PATCH" | "PUT" | "DELETE";
    cacheKey?: string;
    [key: string]: string | undefined;
}

export interface Headers {
    [key: string]: string;
}

export type Body = object | undefined;

export default class RestApi {
    private getHeaders(config: Request): Headers {
        return Object.keys(config)
            .filter((key) => key.match(/header\.\d\.key/))
            .reduce<Headers>((acc, key) => {
                const headerKey = config[key];
                const headerValue = config[key.replace("key", "value")];

                if (typeof headerValue === "undefined" || typeof headerKey === "undefined") {
                    return acc;
                }

                return {
                    ...acc,
                    [headerKey]: headerValue,
                };
            }, {});
    }

    private getParams(config: Request) {
        return Object.keys(config)
            .filter((key) => key.match(/param\.\d\.key/))
            .reduce((acc, key) => {
                const value = config[key.replace("key", "value")];

                if (typeof value === "undefined") {
                    return acc;
                }

                return `${acc}&&${config[key]}=${encodeURIComponent(value)}`;
            }, "");
    }

    private getBody(config: Request) {
        let body: Body;

        if (config.body) {
            try {
                body = JSON.parse(config.body);
            } catch (e) {
                return cy.readFile<Body>(`cypress/fixtures/${config.body}`);
            }
        }

        return cy.wrap(body);
    }

    sendRequest(request: Request) {
        const headers = this.getHeaders(request);
        const params = this.getParams(request);

        return this.getBody(request)
            .then((body) => {
                return cy.request({
                    method: request.method,
                    url: `${request.path}/?${params}`,
                    body,
                    headers,
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                if (request.cacheKey) {
                    setCacheValue(request.cacheKey, response.body);
                }
            });
    }
}
