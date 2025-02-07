"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCacheValue = exports.getCacheValue = void 0;
function getCacheValue(key) {
    if (!window.__CACHE__) {
        return undefined;
    }
    return window.__CACHE__[key];
}
exports.getCacheValue = getCacheValue;
function setCacheValue(key, value) {
    window.__CACHE__ = window.__CACHE__ || {};
    window.__CACHE__[key] = value;
}
exports.setCacheValue = setCacheValue;
