/// <reference types="cypress" />
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
export default class RestAPI {
    private getHeaders;
    private getParams;
    private getBody;
    sendRequest(request: Request): Cypress.Chainable<Cypress.Response<any>>;
}
