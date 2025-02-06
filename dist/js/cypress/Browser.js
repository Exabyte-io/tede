"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IframeBrowser = exports.Browser = exports.TimeoutType = void 0;
/* eslint-disable class-methods-use-this */
require("@cypress/xpath");
var TimeoutType;
(function (TimeoutType) {
    TimeoutType["zero"] = "zero";
    TimeoutType["xxs"] = "xxs";
    TimeoutType["xs"] = "xs";
    TimeoutType["sm"] = "sm";
    TimeoutType["md"] = "md";
    TimeoutType["lg"] = "lg";
    TimeoutType["xl"] = "xl";
    TimeoutType["xxl"] = "xxl";
    TimeoutType["xxxl"] = "xxxl";
})(TimeoutType || (exports.TimeoutType = TimeoutType = {}));
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
class BaseBrowser {
    constructor(settings = defaultSettings) {
        this.settings = settings;
    }
    getTimeoutTime(timeout) {
        return this.settings.timeouts[timeout];
    }
    get(selector, options) {
        return cy.get(selector, options);
    }
    getWithTimeout(selector, timeout = TimeoutType.sm) {
        return this.get(selector, { timeout: this.getTimeoutTime(timeout) });
    }
    xpath(selector, params) {
        return cy.xpath(selector, params);
    }
    xpathWithTimeout(selector, timeout = TimeoutType.sm) {
        return cy.xpath(selector, { timeout: this.getTimeoutTime(timeout) });
    }
    find(selector, params) {
        return cy.find(selector, params);
    }
    findWithTimeout(selector, timeout = TimeoutType.sm) {
        return cy.find(selector, { timeout: this.getTimeoutTime(timeout) });
    }
    document() {
        return cy.document();
    }
    window() {
        return cy.window();
    }
    go(path) {
        return cy.visit(path);
    }
}
class Browser extends BaseBrowser {
    waitForVisible(selector, timeout) {
        this.getWithTimeout(selector, timeout).should("be.visible");
    }
    waitForDisappear(selector, timeout) {
        this.getWithTimeout(selector, timeout).should("not.exist");
    }
    waitForHide(selector, timeout) {
        this.getWithTimeout(selector, timeout).should("be.hidden");
    }
    waitForExist(selector, timeout) {
        this.getWithTimeout(selector, timeout).should("exist");
    }
    waitForValue(selector, timeout) {
        this.getWithTimeout(selector, timeout).should("exist");
    }
    clearInputValue(selector) {
        this.get(selector).clear();
    }
    /**
     * @summary Clear the field, and then set its value
     * @param selector {String} CSS selector for the field in question
     * @param value {String} The final value to be left in the field
     */
    setInputValue(selector, value, clear = true, options = {}) {
        const input = this.get(selector);
        if (clear) {
            return input.clear().type(value.toString(), options);
        }
        return input.type(value.toString(), options);
    }
    setInputNumberValue(selector, value, clear = true, options = {}) {
        const input = this.get(selector);
        if (clear) {
            return input.focus().type("{selectall}").type(value.toString(), options);
        }
        return input.type(value.toString(), options);
    }
    setInputValueByXpath(selector, value, clear = true, options = {}) {
        const input = this.xpath(selector);
        if (clear) {
            return input.clear().type(value.toString(), options);
        }
        return input.type(value.toString(), options);
    }
    select(selector, value) {
        return this.get(selector).select(value);
    }
    click(selector, options) {
        return this.get(selector).click(options);
    }
    clickIfExists(selector) {
        this.document().then(($document) => {
            const documentResult = $document.querySelectorAll(selector);
            if (documentResult.length) {
                documentResult.forEach((item) => item.click());
            }
        });
    }
    getInputValue(selector) {
        return this.get(selector).invoke("val");
    }
    getInputValueByXpath(path) {
        return this.xpath(path).invoke("val");
    }
    clickByXpath(path) {
        return this.xpath(path).click();
    }
    clickOnText(text, selector = "body") {
        return this.get(selector).contains(text, { matchCase: false }).click();
    }
    doubleClickOnText(text, selector = "body", options = {}) {
        return this.get(selector).contains(text, { matchCase: false }).dblclick(options);
    }
    clickOutside(x = 0, y = 0) {
        return this.get("body").click(x, y);
    }
    execute(cb) {
        return this.window().thenWithNull(cb);
    }
    isVisible(selector) {
        return this.get(selector).then(($el) => Cypress.dom.isVisible($el));
    }
    isSelected(selector) {
        return this.get(selector).then((elem) => elem.is(":selected"));
    }
    isChecked(selector) {
        return this.get(selector).then((elem) => elem.is(":checked"));
    }
    isExisting(selector) {
        return this.get("body").then((body) => body.find(selector).length > 0);
    }
    getElement(selector, timeout = TimeoutType.sm) {
        return this.get(selector, { timeout: this.getTimeoutTime(timeout) });
    }
    uploadFileFromFilePath(selector, filePath) {
        return this.get(selector).selectFile(filePath, { force: true });
    }
    getElementText(selector) {
        return this.get(selector).invoke("text");
    }
    getEachElementTexts(selector) {
        const results = [];
        this.get(selector).each((item) => {
            results.push(item.text());
        });
        return cy.wrap(results);
    }
    dispatchEvent(selector, event) {
        return this.get(selector).then(($el) => {
            // setting the value onto element and dispatching input
            // event should trigger React's change event
            $el[0].dispatchEvent(event);
        });
    }
    check(selector) {
        this.get(selector).check();
    }
    uncheck(selector) {
        this.get(selector).uncheck();
    }
    getAttribute(selector, attribute) {
        return this.get(selector).invoke("attr", attribute);
    }
    getCssProperty(selector, property) {
        return this.get(selector)
            .invoke("css", property)
            .then(({ value }) => value);
    }
    retry(cb, become, delay = TimeoutType.zero, timeout = TimeoutType.md) {
        const timeoutMilliseconds = typeof timeout === "number" ? timeout : defaultSettings.timeouts[timeout];
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
    iframe(selector, defaultTimeout = TimeoutType.sm) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new IframeBrowser(selector, this.settings, defaultTimeout);
    }
    waitForVisibleByXpath(selector) {
        return this.xpath(selector).should("be.visible");
    }
    wait(timeout) {
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
    replaceElementAttribute(selector, attribute, value) {
        this.get(selector).invoke("attr", attribute, value);
    }
    // ======= Assertions ========
    assertWithRetry(cb, options) {
        this.retry(() => cb(), true, options === null || options === void 0 ? void 0 : options.delay, options === null || options === void 0 ? void 0 : options.timeout);
    }
    assertTextWithRetry(selector, textOrCallback, include = true) {
        if (typeof textOrCallback === "string") {
            this.get(selector).should(include ? "include.text" : "not.include.text", textOrCallback);
        }
        else {
            this.getElementText(selector).should(textOrCallback);
        }
    }
    assertNotEmptyTextWithRetry(selector) {
        this.get(selector).invoke("val").should("not.be.empty");
    }
    assertNumberWithRetry(selector, value) {
        this.get(selector).should((element) => {
            assert.equal(parseFloat(element.text()), typeof value === "string" ? parseFloat(value) : value);
        });
    }
    assertInputValueWithRetry(selector, text, comparison = "have") {
        this.get(selector).should(`${comparison}.value`, text);
    }
    assertTextByRegExpWithRetry(selector, regExp) {
        this.get(selector).should((element) => {
            assert(regExp.test(element.text()));
        });
    }
    assertVisibleWithRetry(selector) {
        this.get(selector).should("be.visible");
    }
    assertExistWithRetry(selector) {
        this.get(selector).should("exist");
    }
    assertNotExistWithRetry(selector) {
        this.get(selector).should("not.exist");
    }
    assertCssPropertyWithRetry(selector, property, value) {
        this.get(selector).should("have.css", property, value);
    }
    assertCheckedWithRetry(selector, checked = true) {
        this.get(selector).should(checked ? "be.checked" : "not.be.checked");
    }
    assertLengthWithRetry(selector, length) {
        this.get(selector).should("have.length", length);
    }
    assertElementHasClassWithRetry(selector, className) {
        this.get(selector).should("have.class", className);
    }
    assertInputValueNotEmptyWithRetry(selector) {
        this.getInputValue(selector).should("not.be.empty");
    }
    assertAttributeIncludeValueWithRetry(selector, attribute, value) {
        this.get(selector).invoke("attr", attribute).should("contain", value);
    }
    assertAttributeMatchWithRetry(selector, attribute, regexp, timeout = "md") {
        this.getWithTimeout(selector, timeout)
            .invoke({ timeout: this.getTimeoutTime(timeout) }, "attr", attribute)
            .should("match", regexp);
    }
    assertDisabledWithRetry(selector, disabled = true) {
        this.get(selector).should(disabled ? "be.disabled" : "not.be.disabled");
    }
    assertFileDownloadedWithRetry(fileName) {
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.readFile(`${downloadsFolder}/${fileName}`).should("exist");
    }
}
exports.Browser = Browser;
class IframeBrowser extends Browser {
    constructor(selector, settings, timeoutKey) {
        super(settings);
        this.selector = selector;
        this.timeout = this.getTimeoutTime(timeoutKey);
    }
    get(selector, options) {
        return this.getIframeBody().find(selector, options);
    }
    xpath(selector, params) {
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
exports.IframeBrowser = IframeBrowser;
