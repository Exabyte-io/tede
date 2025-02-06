import { Browser, BrowserTimeout } from "./Browser";
export default class Widget {
    selector: string;
    browser: Browser;
    constructor(selector: string);
    waitForVisible(timeout?: BrowserTimeout): void;
    waitForDisappear(timeout?: BrowserTimeout): void;
    waitForLoaderToDisappear(): void;
    getWrappedSelector(selector: string, separator?: string): string;
    /**
     * @summary Wraps the selectors, including functions, passed at the top level of config object
     */
    getWrappedSelectors<T extends object>(config: T): T;
    waitForModalBackdropDisappear(): void;
    isVisible(): Cypress.Chainable<boolean>;
}
