/* eslint-disable class-methods-use-this */
import "@cypress/xpath";

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

export interface RetryOptions {
    timeout?: BrowserTimeout | number;
    delay?: BrowserTimeout | number;
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
    waitForVisible(selector: string, timeout?: BrowserTimeout) {
        this.getWithTimeout(selector, timeout).should("be.visible");
    }

    waitForDisappear(selector: string, timeout?: BrowserTimeout) {
        this.getWithTimeout(selector, timeout).should("not.exist");
    }

    waitForHide(selector: string, timeout?: BrowserTimeout) {
        this.getWithTimeout(selector, timeout).should("be.hidden");
    }

    waitForExist(selector: string, timeout?: BrowserTimeout) {
        this.getWithTimeout(selector, timeout).should("exist");
    }

    waitForValue(selector: string, timeout?: BrowserTimeout) {
        this.getWithTimeout(selector, timeout).should("exist");
    }

    clearInputValue(selector: string) {
        this.get(selector).clear();
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

    setInputNumberValue(
        selector: string,
        value: string | number,
        clear = true,
        options: Partial<Cypress.TypeOptions> = {},
    ) {
        const input = this.get(selector);

        if (clear) {
            return input.focus().type("{selectall}").type(value.toString(), options);
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
        return this.get(selector).contains(text, { matchCase: false }).click();
    }

    doubleClickOnText(
        text: string,
        selector = "body",
        options: Partial<Cypress.ClickOptions> = {},
    ) {
        return this.get(selector).contains(text, { matchCase: false }).dblclick(options);
    }

    clickOutside(x = 0, y = 0) {
        return this.get("body").click(x, y);
    }

    execute<T = unknown>(
        cb:
            | ((win: Cypress.AUTWindow) => T)
            | ((win: Cypress.AUTWindow) => Bluebird.Promise<T>)
            | ((win: Cypress.AUTWindow) => Cypress.Chainable<T>),
    ) {
        return this.window().thenWithNull<T>(cb);
    }

    isVisible(selector: string) {
        return this.get(selector).then(($el) => Cypress.dom.isVisible($el));
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
        cb: () => Cypress.Chainable<boolean>,
        become?: boolean,
        delay?: BrowserTimeout | number,
        timeout?: BrowserTimeout | number,
    ): void;

    retry<T>(
        cb: () => Cypress.Chainable<T>,
        become: T,
        delay?: BrowserTimeout | number,
        timeout?: BrowserTimeout | number,
    ): void;

    retry<T = boolean>(
        cb: () => Cypress.Chainable<T>,
        become?: T,
        delay: BrowserTimeout | number = TimeoutType.zero,
        timeout: BrowserTimeout | number = TimeoutType.md,
    ) {
        const timeoutMilliseconds =
            typeof timeout === "number" ? timeout : defaultSettings.timeouts[timeout];
        let delayMilliseconds = typeof delay === "number" ? delay : defaultSettings.timeouts[delay];

        const DEFAULT_RETRY_COUNT = 30;

        // Reduce amount of logs for long actions (30 seconds or more):
        // retry 30 times by default, unless "delay" passed directly
        if (timeoutMilliseconds >= DEFAULT_RETRY_COUNT * 1000 && delayMilliseconds === 0) {
            delayMilliseconds = timeoutMilliseconds / DEFAULT_RETRY_COUNT;
        }

        cy.until({
            it: cb,
            become,
            delay: delayMilliseconds,
            timeout: timeoutMilliseconds,
        });
    }

    iframe(selector: string, defaultTimeout: BrowserTimeout = TimeoutType.sm) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new IframeBrowser(selector, this.settings, defaultTimeout);
    }

    waitForVisibleByXpath(selector: string) {
        return this.xpath(selector).should("be.visible");
    }

    wait(timeout: number) {
        return cy.wait(timeout);
    }

    back() {
        cy.go("back");
    }

    reload(force = false) {
        cy.reload(force);
    }

    getUrl() {
        return cy.url();
    }

    replaceElementAttribute(selector: string, attribute: string, value: string) {
        this.get(selector).invoke("attr", attribute, value);
    }

    // ======= Assertions ========

    assertWithRetry(cb: () => Cypress.Chainable<boolean>, options?: RetryOptions) {
        this.retry(() => cb(), true, options?.delay, options?.timeout);
    }

    assertTextWithRetry(
        selector: string,
        textOrCallback: string | ((text: string) => void),
        include = true,
    ) {
        if (typeof textOrCallback === "string") {
            this.get(selector).should(
                include ? "include.text" : "not.include.text",
                textOrCallback,
            );
        } else {
            this.getElementText(selector).should(textOrCallback);
        }
    }

    assertNotEmptyTextWithRetry(selector: string) {
        this.get(selector).invoke("val").should("not.be.empty");
    }

    assertNumberWithRetry(selector: string, value: number | string) {
        this.get(selector).should((element) => {
            assert.equal(
                parseFloat(element.text()),
                typeof value === "string" ? parseFloat(value) : value,
            );
        });
    }

    assertInputValueWithRetry(
        selector: string,
        text: string,
        comparison: "have" | "include" = "have",
    ) {
        this.get(selector).should(`${comparison}.value`, text);
    }

    assertTextByRegExpWithRetry(selector: string, regExp: RegExp) {
        this.get(selector).should((element) => {
            assert(regExp.test(element.text()));
        });
    }

    assertVisibleWithRetry(selector: string) {
        this.get(selector).should("be.visible");
    }

    assertExistWithRetry(selector: string) {
        this.get(selector).should("exist");
    }

    assertNotExistWithRetry(selector: string) {
        this.get(selector).should("not.exist");
    }

    assertCssPropertyWithRetry(selector: string, property: string, value: string) {
        this.get(selector).should("have.css", property, value);
    }

    assertCheckedWithRetry(selector: string, checked = true) {
        this.get(selector).should(checked ? "be.checked" : "not.be.checked");
    }

    assertLengthWithRetry(selector: string, length: number) {
        this.get(selector).should("have.length", length);
    }

    assertElementHasClassWithRetry(selector: string, className: string) {
        this.get(selector).should("have.class", className);
    }

    assertInputValueNotEmptyWithRetry(selector: string) {
        this.getInputValue(selector).should("not.be.empty");
    }

    assertAttributeIncludeValueWithRetry(selector: string, attribute: string, value: string) {
        this.get(selector).invoke("attr", attribute).should("contain", value);
    }

    assertAttributeMatchWithRetry(
        selector: string,
        attribute: string,
        regexp: RegExp,
        timeout: BrowserTimeout = "md",
    ) {
        this.getWithTimeout(selector, timeout)
            .invoke({ timeout: this.getTimeoutTime(timeout) }, "attr", attribute)
            .should("match", regexp);
    }

    assertDisabledWithRetry(selector: string, disabled = true) {
        this.get(selector).should(disabled ? "be.disabled" : "not.be.disabled");
    }

    assertFileDownloadedWithRetry(fileName: string) {
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.readFile(`${downloadsFolder}/${fileName}`).should("exist");
    }

    // ======= End assertions ========

    // ======= Getters ========
}

export class IframeBrowser extends Browser {
    selector: string;

    timeout: number;

    iframeElement?: Cypress.Chainable<JQuery<HTMLElement>>;

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
        // Storing iframeElement is required for correct iframe unmount action tracking
        this.iframeElement = cy.get(this.selector, { timeout: this.timeout });

        return this.iframeElement.its("0.contentDocument.body", {}).should("not.be.empty");
    }

    assertIframeNotExistWithRetry() {
        if (this.iframeElement) {
            this.iframeElement.should("not.exist");
        }
    }
}
