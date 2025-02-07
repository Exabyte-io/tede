import { Browser, BrowserSettings } from "./Browser";
declare global {
    interface Window {
        browser: Browser;
    }
}
export default class BrowserManager {
    static setBrowserSettings(settings: BrowserSettings): void;
    static setBrowser(browser: Browser): void;
    static getBrowser(): Browser;
}
