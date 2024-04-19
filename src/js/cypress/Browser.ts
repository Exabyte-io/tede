/* eslint-disable class-methods-use-this */
import "@cypress/xpath";

export type BrowserTimeout = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";

export interface BrowserSettings {
    timeouts: {
        [key in BrowserTimeout]: number;
    };
}

const defaultSettings = {
    timeouts: {
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

export class IframeBrowser {
    #body: Cypress.Chainable;

    private getTimeoutTime(timeout: BrowserTimeout) {
        return this.settings.timeouts[timeout];
    }

    readonly settings: BrowserSettings;

    constructor(selector: string, settings: BrowserSettings, iframeTimeout: BrowserTimeout) {
        this.settings = settings;

        this.#body = cy
            .get(selector, { timeout: this.getTimeoutTime(iframeTimeout) })
            .its("0.contentDocument.body")
            .should("not.be.empty", {})
            // wraps "body" DOM element to allow
            // chaining more Cypress commands, like ".find(...)"
            // https://on.cypress.io/wrap
            .then(cy.wrap);
    }

    waitForExist(selector: string, timeout: BrowserTimeout = "sm") {
        return this.#body
            .find(selector, { timeout: this.getTimeoutTime(timeout) })
            .should("exist");
    }

    waitForVisible(selector: string, timeout: BrowserTimeout = "sm") {
        return this.#body
            .find(selector, { timeout: this.getTimeoutTime(timeout) })
            .should("be.visible");
    }

    waitForVisibleByXpath(selector: string, timeout: BrowserTimeout = "sm") {
        return this.#body
            .xpath(selector, { timeout: this.getTimeoutTime(timeout) })
            .should("be.visible");
    }

    setInputValue(
        selector: string,
        value: string | number,
        clear = true,
        options: Partial<Cypress.TypeOptions> = {},
    ) {
        const input = this.#body.find(selector);

        if (clear) {
            return input.clear().type(value.toString(), options);
        }

        return input.type(value.toString(), options);
    }

    select(selector: string, value: string) {
        return this.#body.find(selector).select(value);
    }

    getElement(selector: string, timeout: BrowserTimeout = "sm") {
        return cy.get(selector, { timeout: this.getTimeoutTime(timeout) });
    }

    getElementText(selector: string) {
        return this.#body.get(selector).invoke("text");
    }

    clickOnText(text: string, multiple = false) {
        return this.#body.contains(text).click({multiple});
    }

    clickFirst(selector: string, options={}) {
        return this.#body.find(selector).first().click(options);
    }

    getElementByXpath(selector: string, timeout: BrowserTimeout = "sm") {
        return this.#body.xpath(selector, { timeout: this.getTimeoutTime(timeout) });
    }

    getElementTextByXpath(selector: string, timeout: BrowserTimeout = "sm") {
        return this.#body.xpath(selector, { timeout: this.getTimeoutTime(timeout) }).invoke("text");
    }
}

export class Browser {
    readonly settings: BrowserSettings;

    constructor(settings: BrowserSettings = defaultSettings) {
        this.settings = settings;
    }

    private getTimeoutTime(timeout: BrowserTimeout) {
        return this.settings.timeouts[timeout];
    }

    go(path: string) {
        return cy.visit(path);
    }

    iframe(selector: string, defaultTimeout: BrowserTimeout = "sm") {
        return new IframeBrowser(selector, this.settings, defaultTimeout);
    }

    waitForVisible(selector: string, timeout: BrowserTimeout = "sm") {
        return cy.get(selector, { timeout: this.getTimeoutTime(timeout) }).should("be.visible");
    }

    waitForDisappear(selector: string, timeout: BrowserTimeout = "sm") {
        return cy.get(selector, { timeout: this.getTimeoutTime(timeout) }).should("not.exist");
    }

    waitForHide(selector: string, timeout: BrowserTimeout = "sm") {
        return cy.get(selector, { timeout: this.getTimeoutTime(timeout) }).should("be.hidden");
    }

    waitForExist(selector: string, timeout: BrowserTimeout = "sm") {
        return cy.get(selector, { timeout: this.getTimeoutTime(timeout) }).should("exist");
    }

    waitForValue(selector: string, timeout: BrowserTimeout = "sm") {
        return cy.get(selector, { timeout: this.getTimeoutTime(timeout) }).should("exist");
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
        const input = cy.get(selector);

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
        const input = cy.xpath(selector);

        if (clear) {
            return input.clear().type(value.toString(), options);
        }

        return input.type(value.toString(), options);
    }

    select(selector: string, value: string) {
        return cy.get(selector).select(value);
    }

    click(selector: string, options?: Partial<Cypress.ClickOptions>) {
        return cy.get(selector).click(options);
    }

    clickIfExists(selector: string) {
        cy.document().then(($document) => {
            const documentResult = $document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
            if (documentResult.length) {
                documentResult.forEach((item) => item.click());
            }
        });
    }

    getInputValue(selector: string): Cypress.Chainable<string> {
        return cy.get(selector).invoke("val");
    }

    getInputValueByXpath(path: string) {
        return cy.xpath(path).invoke("val");
    }

    clickByXpath(path: string) {
        return cy.xpath(path).click();
    }

    clickOnText(text: string, selector = "body") {
        return cy.get(selector).contains(text).click();
    }

    clickOutside(x = 0, y = 0) {
        return cy.get("body").click(x, y);
    }

    execute<T = unknown>(cb: (win: Cypress.AUTWindow) => T) {
        return cy.window().then((win) => cb(win));
    }

    isVisible(selector: string) {
        return cy.get(selector).then(($el): boolean => $el.is(":visible"));
    }

    isSelected(selector: string) {
        return cy.get(selector).then((elem) => elem.is(":selected"));
    }

    isChecked(selector: string) {
        return cy.get(selector).then((elem) => elem.is(":checked"));
    }

    isExisting(selector: string) {
        return cy.get("body").then((body) => body.find(selector).length > 0);
    }

    getElement(selector: string) {
        return cy.get(selector);
    }

    uploadFileFromFilePath(selector: string, filePath: string) {
        return cy.get(selector).selectFile(filePath, { force: true });
    }

    getElementText(selector: string) {
        return cy.get(selector).invoke("text");
    }

    getEachElementTexts(selector: string) {
        const results: string[] = [];

        cy.get(selector).each((item) => {
            results.push(item.text());
        });

        return cy.wrap(results);
    }

    dispatchEvent(selector: string, event: Event) {
        return cy.get(selector).then(($el) => {
            // setting the value onto element and dispatching input
            // event should trigger React's change event
            $el[0].dispatchEvent(event);
        });
    }

    check(selector: string) {
        cy.get(selector).check();
    }

    uncheck(selector: string) {
        cy.get(selector).uncheck();
    }

    getAttribute(selector: string, attribute: string) {
        return cy.get(selector).invoke("attr", attribute);
    }

    getCssProperty(selector: string, property: string) {
        return cy
            .get(selector)
            .invoke("css", property)
            .then(({ value }) => value);
    }

    retry(cb: () => Cypress.Chainable<boolean>, become?: boolean, timeout?: number): void;

    retry<T>(cb: () => Cypress.Chainable<T>, become: T, timeout?: number): void;

    retry<T = boolean>(cb: () => Cypress.Chainable<T>, become?: T, timeout?: number) {
        cy.until({
            it: cb,
            become,
            timeout,
        });
    }
}
