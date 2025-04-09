"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
function isHeaderKey(key) {
    return Boolean(key.match(/header\.\d\.key/));
}
function isParamKey(key) {
    return Boolean(key.match(/param\.\d\.key/));
}
function headerKeyToHeaderValue(key) {
    return key.replace("key", "value");
}
function paramKeyToParamValue(key) {
    return key.replace("key", "value");
}
class RestAPI {
    getHeaders(config) {
        return Object.keys(config)
            .filter(isHeaderKey)
            .reduce((acc, key) => {
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
    getParams(config) {
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
                timeout: request.timeout ? Number(request.timeout) : undefined,
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
