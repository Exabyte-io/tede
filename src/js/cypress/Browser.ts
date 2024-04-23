/* eslint-disable class-methods-use-this */
import "@cypress/xpath";

import * as Cypress from "cypress";

export enum TimeoutType {
    zero = "zero",
    xxs = "xxs",
    xs = "xs",
    sm = "sm",
    md = "md",
    lg = "lg",
    xl = "xl",
    xxl = "xxl",
    xxxl = "xxxl",
}

const defaultSettings = {
    timeouts: {
        zero: 0,
        xxs: 1 * 1000,
        xs: 3 * 1000,
        sm: 10 * 1000,
        md: 30 * 1000,
        lg: 60 * 1000,
        xl: 180 * 1000,
        xxl: 600 * 1000,
        xxxl: 1800 * 1000,
    },
};

export type BrowserTimeout = keyof typeof TimeoutType;

export interface BrowserSettings {
    timeouts: {
        [key in BrowserTimeout]: number;
    };
}

type GetParams = Parameters<Cypress.Chainable["get"]>;
type XpathParams = Parameters<Cypress.Chainable["xpath"]>;
type FindParams = Parameters<Cypress.Chainable["find"]>;

class BaseBrowser {
    readonly settings: BrowserSettings;

    constructor(settings: BrowserSettings = defaultSettings) {
        this.settings = settings;
    }

    protected getTimeoutTime(timeout: BrowserTimeout) {
        return this.settings.timeouts[timeout];
    }

    get(selector: GetParams[0], options?: GetParams[1]) {
        return cy.get(selector, options);
    }

    getWithTimeout(selector: string, timeout: BrowserTimeout = TimeoutType.sm) {
        return this.get(selector, { timeout: this.getTimeoutTime(timeout) });
    }

    xpath(selector: XpathParams[0], params?: XpathParams[1]) {
        return cy.xpath(selector, params);
    }

    xpathWithTimeout(selector: XpathParams[0], timeout: BrowserTimeout = TimeoutType.sm) {
        return cy.xpath(selector, { timeout: this.getTimeoutTime(timeout) });
    }

    find(selector: string, params: FindParams[1]) {
        return cy.find(selector, params);
    }

    findWithTimeout(selector: string, timeout: BrowserTimeout = TimeoutType.sm) {
        return cy.find(selector, { timeout: this.getTimeoutTime(timeout) });
    }

    document() {
        return cy.document();
    }

    window() {
        return cy.window();
    }

    go(path: string) {
        return cy.visit(path);
    }
}

export class Browser extends BaseBrowser {
    waitForVisible(selector: string, timeout: BrowserTimeout) {
        return this.getWithTimeout(selector, timeout).should("be.visible");
    }

    waitForDisappear(selector: string, timeout: BrowserTimeout) {
        return this.getWithTimeout(selector, timeout).should("not.exist");
    }

    waitForHide(selector: string, timeout: BrowserTimeout) {
        return this.getWithTimeout(selector, timeout).should("be.hidden");
    }

    waitForExist(selector: string, timeout: BrowserTimeout) {
        return this.getWithTimeout(selector, timeout).should("exist");
    }

    waitForValue(selector: string, timeout: BrowserTimeout) {
        return this.getWithTimeout(selector, timeout).should("exist");
    }

    /**
     * @summary Clear the field, and then set its value
     * @param selector {String} CSS selector for the field in question
     * @param value {String} The final value to be left in the field
     */
    setInputValue(
        selector: string,
        value: string | number,
        clear = true,
        options: Partial<Cypress.TypeOptions> = {},
    ) {
        const input = this.get(selector);

        if (clear) {
            return input.clear().type(value.toString(), options);
        }

        return input.type(value.toString(), options);
    }

    setInputValueByXpath(
        selector: string,
        value: string | number,
        clear = true,
        options: Partial<Cypress.TypeOptions> = {},
    ) {
        const input = this.xpath(selector);

        if (clear) {
            return input.clear().type(value.toString(), options);
        }

        return input.type(value.toString(), options);
    }

    select(selector: string, value: string) {
        return this.get(selector).select(value);
    }

    click(selector: string, options?: Partial<Cypress.ClickOptions>) {
        return this.get(selector).click(options);
    }

    clickIfExists(selector: string) {
        this.document().then(($document) => {
            const documentResult = $document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
            if (documentResult.length) {
                documentResult.forEach((item) => item.click());
            }
        });
    }

    getInputValue(selector: string): Cypress.Chainable<string> {
        return this.get(selector).invoke("val");
    }

    getInputValueByXpath(path: string) {
        return this.xpath(path).invoke("val");
    }

    clickByXpath(path: string) {
        return this.xpath(path).click();
    }

    clickOnText(text: string, selector = "body") {
        return this.get(selector).contains(text).click();
    }

    clickOutside(x = 0, y = 0) {
        return this.get("body").click(x, y);
    }

    execute<T = unknown>(cb: (win: Cypress.AUTWindow) => T) {
        return this.window().then((win) => cb(win));
    }

    isVisible(selector: string) {
        return this.get(selector).then(($el): boolean => $el.is(":visible"));
    }

    isSelected(selector: string) {
        return this.get(selector).then((elem) => elem.is(":selected"));
    }

    isChecked(selector: string) {
        return this.get(selector).then((elem) => elem.is(":checked"));
    }

    isExisting(selector: string) {
        return this.get("body").then((body) => body.find(selector).length > 0);
    }

    getElement(selector: string, timeout: BrowserTimeout = TimeoutType.sm) {
        return this.get(selector, { timeout: this.getTimeoutTime(timeout) });
    }

    uploadFileFromFilePath(selector: string, filePath: string) {
        return this.get(selector).selectFile(filePath, { force: true });
    }

    getElementText(selector: string) {
        return this.get(selector).invoke("text");
    }

    getEachElementTexts(selector: string) {
        const results: string[] = [];

        this.get(selector).each((item) => {
            results.push(item.text());
        });

        return cy.wrap(results);
    }

    dispatchEvent(selector: string, event: Event) {
        return this.get(selector).then(($el) => {
            // setting the value onto element and dispatching input
            // event should trigger React's change event
            $el[0].dispatchEvent(event);
        });
    }

    check(selector: string) {
        this.get(selector).check();
    }

    uncheck(selector: string) {
        this.get(selector).uncheck();
    }

    getAttribute(selector: string, attribute: string) {
        return this.get(selector).invoke("attr", attribute);
    }

    getCssProperty(selector: string, property: string) {
        return this.get(selector)
            .invoke("css", property)
            .then(({ value }) => value);
    }

    retry(
        cb: () => boolean,
        become?: boolean,
        delay?: BrowserTimeout,
        timeout?: BrowserTimeout,
    ): void;

    retry<T>(cb: () => T, become: T, delay?: BrowserTimeout, timeout?: BrowserTimeout): void;

    retry<T = boolean>(
        cb: () => T,
        become?: T,
        delay: BrowserTimeout = "zero",
        timeout: BrowserTimeout = TimeoutType.md,
    ) {
        cy.until({
            it: () => cy.wrap(null).then(cb),
            become,
            delay: defaultSettings.timeouts[delay],
            timeout: defaultSettings.timeouts[timeout],
        });
    }

    iframe(selector: string, defaultTimeout: BrowserTimeout = TimeoutType.sm) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new IframeBrowser(selector, this.settings, defaultTimeout);
    }

    waitForVisibleByXpath(selector: string) {
        return this.xpath(selector).should("be.visible");
    }

    clickFirst(selector: string, options = {}) {
        return this.get(selector).first().click(options);
    }

    getElementByXpath(selector: string) {
        return this.xpath(selector);
    }

    getElementTextByXpath(selector: string) {
        return this.getElementByXpath(selector).invoke("text");
    }
}

export class IframeBrowser extends Browser {
    selector: string;

    timeout: number;

    constructor(selector: string, settings: BrowserSettings, timeoutKey: BrowserTimeout) {
        super(settings);
        this.selector = selector;
        this.timeout = this.getTimeoutTime(timeoutKey);
    }

    get(selector: GetParams[0], options?: GetParams[1]) {
        return this.getIframeBody().find(selector, options);
    }

    xpath(selector: XpathParams[0], params?: XpathParams[1]) {
        return this.getIframeBody().xpath(selector, params);
    }

    getIframeBody() {
        return cy
            .get(this.selector, { timeout: this.timeout })
            .its("0.contentDocument.body", {})
            .should("not.be.empty")
            .then(cy.wrap);
    }
}
