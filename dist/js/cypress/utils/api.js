"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
class RestAPI {
    getHeaders(config) {
        return Object.keys(config)
            .filter((key) => key.match(/header\.\d\.key/))
            .reduce((acc, key) => {
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
    getParams(config) {
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
    getBody(config) {
        let body;
        if (config.body) {
            try {
                body = JSON.parse(config.body);
            }
            catch (e) {
                return cy.readFile(`cypress/fixtures/${config.body}`);
            }
        }
        return cy.wrap(body);
    }
    sendRequest(request) {
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
                (0, cache_1.setCacheValue)(request.cacheKey, response.body);
            }
        });
    }
}
exports.default = RestAPI;
