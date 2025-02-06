"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = __importDefault(require("./Widget"));
class Page extends Widget_1.default {
    constructor() {
        super(...arguments);
        this.url = "/";
    }
    open(timeout) {
        this.browser.go(this.url);
        this.waitForVisible(timeout);
        this.waitForLoaderToDisappear();
    }
}
exports.default = Page;
