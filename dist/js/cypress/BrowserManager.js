"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable class-methods-use-this */
const Browser_1 = require("./Browser");
class BrowserManager {
    static setBrowserSettings(settings) {
        window.browser = new Browser_1.Browser(settings);
    }
    static setBrowser(browser) {
        window.browser = browser;
    }
    static getBrowser() {
        if (!window.browser) {
            window.browser = new Browser_1.Browser();
        }
        return window.browser;
    }
}
exports.default = BrowserManager;
