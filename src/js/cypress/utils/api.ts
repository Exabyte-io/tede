import { setCacheValue } from "./cache";

type HeaderKey = `header.${number}.key`;
type HeaderValue = `header.${number}.value`;
type ParamKey = `param.${number}.key`;
type ParamValue = `param.${number}.value`;

/* eslint-disable class-methods-use-this */
export interface Request {
    path: string;
    body: string;
    method: "POST" | "GET" | "PATCH" | "PUT" | "DELETE";
    cacheKey?: string;
    timeout?: `${number}` | number;
    formUrlEncoded?: boolean;
    [key: HeaderKey]: string | undefined;
    [key: HeaderValue]: string | undefined;
    [key: ParamKey]: string | undefined;
    [key: ParamValue]: string | undefined;
}

function isHeaderKey(key: string): key is HeaderKey {
    return Boolean(key.match(/header\.\d\.key/));
}

function isParamKey(key: string): key is ParamKey {
    return Boolean(key.match(/param\.\d\.key/));
}

function headerKeyToHeaderValue(key: HeaderKey): HeaderValue {
    return key.replace("key", "value") as HeaderValue;
}

function paramKeyToParamValue(key: ParamKey): ParamValue {
    return key.replace("key", "value") as ParamValue;
}

export interface Headers {
    [key: string]: string;
}

export type Body = object | string | undefined;

export default class RestAPI {
    private getHeaders(config: Request): Headers {
        return Object.keys(config)
            .filter(isHeaderKey)
            .reduce<Headers>((acc, key) => {
                const headerKey = config[key];
                const headerValue = config[headerKeyToHeaderValue(key)];

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
            .filter(isParamKey)
            .reduce((acc, key) => {
                const value = config[paramKeyToParamValue(key)];

                if (typeof value === "undefined") {
                    return acc;
                }

                return `${acc}&&${config[key]}=${encodeURIComponent(value)}`;
            }, "");
    }

    private getBody(config: Request): Cypress.Chainable<Body> {
        let body: Body;

        if (config.body) {
            if (config.formUrlEncoded) {
                // For form-urlencoded, parse JSON and convert to URL-encoded string
                try {
                    const bodyObj = JSON.parse(config.body);
                    const pairs = Object.entries(bodyObj).map(
                        ([key, value]) =>
                            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
                    );
                    body = pairs.join("&");
                } catch (e) {
                    // If not valid JSON, treat as already formatted URL-encoded string
                    body = config.body;
                }

                return cy.wrap(body as Body);
            }

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

        // Set Content-Type header for form-urlencoded if not already set
        if (request.formUrlEncoded && !headers["Content-Type"] && !headers["content-type"]) {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        return this.getBody(request)
            .then((body) => {
                return cy.request({
                    method: request.method,
                    url: `${request.path}/?${params}`,
                    body,
                    headers,
                    failOnStatusCode: false,
                    timeout: request.timeout ? Number(request.timeout) : undefined,
                });
            })
            .then((response) => {
                if (request.cacheKey) {
                    setCacheValue(request.cacheKey, response.body);
                    setCacheValue(`${request.cacheKey}.status`, response.status);
                }
                return response;
            });
    }
}
