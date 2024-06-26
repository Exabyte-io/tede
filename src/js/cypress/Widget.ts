import { Browser, BrowserTimeout } from "./Browser";
import BrowserManager from "./BrowserManager";

const modalBackdrop = ".modal-backdrop.fade";

export default class Widget {
    selector: string;

    browser: Browser;

    constructor(selector: string) {
        this.selector = selector;
        this.browser = BrowserManager.getBrowser();
    }

    waitForVisible(timeout?: BrowserTimeout) {
        this.browser.waitForVisible(this.selector, timeout);
    }

    waitForDisappear(timeout?: BrowserTimeout) {
        this.browser.waitForDisappear(this.selector, timeout);
    }

    waitForLoaderToDisappear() {
        this.browser.waitForDisappear(this.getWrappedSelector("div.spinner"));
    }

    getWrappedSelector(selector: string, separator = " ") {
        return `${this.selector}${separator}${selector}`;
    }

    /**
     * @summary Wraps the selectors, including functions, passed at the top level of config object
     */
    getWrappedSelectors<T extends object>(config: T): T {
        const entries = Object.keys(config).map((key) => {
            // @ts-ignore
            const value = config[key];
            let newValue;
            switch (typeof value) {
                case "string":
                    newValue = this.getWrappedSelector(value);
                    break;
                case "function":
                    newValue = (...args: unknown[]) => this.getWrappedSelector(value(...args));
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
