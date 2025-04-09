/// <reference types="cypress" />
type HeaderKey = `header.${number}.key`;
type HeaderValue = `header.${number}.value`;
type ParamKey = `param.${number}.key`;
type ParamValue = `param.${number}.value`;
export interface Request {
    path: string;
    body: string;
    method: "POST" | "GET" | "PATCH" | "PUT" | "DELETE";
    cacheKey?: string;
    timeout?: `${number}` | number;
    [key: HeaderKey]: string | undefined;
    [key: HeaderValue]: string | undefined;
    [key: ParamKey]: string | undefined;
    [key: ParamValue]: string | undefined;
}
export interface Headers {
    [key: string]: string;
}
export type Body = object | undefined;
export default class RestAPI {
    private getHeaders;
    private getParams;
    private getBody;
    sendRequest(request: Request): Cypress.Chainable<Cypress.Response<any>>;
}
export {};
