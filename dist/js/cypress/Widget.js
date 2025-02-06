"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BrowserManager_1 = __importDefault(require("./BrowserManager"));
const modalBackdrop = ".modal-backdrop.fade";
class Widget {
    constructor(selector) {
        this.selector = selector;
        this.browser = BrowserManager_1.default.getBrowser();
    }
    waitForVisible(timeout) {
        this.browser.waitForVisible(this.selector, timeout);
    }
    waitForDisappear(timeout) {
        this.browser.waitForDisappear(this.selector, timeout);
    }
    waitForLoaderToDisappear() {
        this.browser.waitForDisappear(this.getWrappedSelector("div.spinner"));
    }
    getWrappedSelector(selector, separator = " ") {
        return `${this.selector}${separator}${selector}`;
    }
    /**
     * @summary Wraps the selectors, including functions, passed at the top level of config object
     */
    getWrappedSelectors(config) {
        const entries = Object.keys(config).map((key) => {
            // @ts-ignore
            const value = config[key];
            let newValue;
            switch (typeof value) {
                case "string":
                    newValue = this.getWrappedSelector(value);
                    break;
                case "function":
                    newValue = (...args) => this.getWrappedSelector(value(...args));
                    break;
                default:
                    newValue = value;
            }
            return [key, newValue];
        });
        return Object.fromEntries(entries);
    }
    waitForModalBackdropDisappear() {
        this.browser.waitForDisappear(modalBackdrop);
    }
    isVisible() {
        return this.browser.isVisible(this.selector);
    }
}
exports.default = Widget;
