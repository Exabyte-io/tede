/* eslint-disable class-methods-use-this */
import { Browser, BrowserSettings } from "./Browser";

declare global {
    interface Window {
        browser: Browser;
    }
}

export default class BrowserManager {
    static setBrowserSettings(settings: BrowserSettings) {
        window.browser = new Browser(settings);
    }

    static setBrowser(browser: Browser) {
        window.browser = browser;
    }

    static getBrowser(): Browser {
        if (!window.browser) {
            window.browser = new Browser();
        }
        return window.browser as Browser;
    }
}
