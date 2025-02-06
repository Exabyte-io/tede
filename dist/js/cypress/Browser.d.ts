/// <reference types="cypress" />
/// <reference types="cypress" />
/// <reference types="cypress" />
/// <reference types="cypress" />
import "@cypress/xpath";
export declare enum TimeoutType {
    zero = "zero",
    xxs = "xxs",
    xs = "xs",
    sm = "sm",
    md = "md",
    lg = "lg",
    xl = "xl",
    xxl = "xxl",
    xxxl = "xxxl"
}
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
declare class BaseBrowser {
    readonly settings: BrowserSettings;
    constructor(settings?: BrowserSettings);
    protected getTimeoutTime(timeout: BrowserTimeout): number;
    get(selector: GetParams[0], options?: GetParams[1]): Cypress.Chainable<JQuery<HTMLElement>>;
    getWithTimeout(selector: string, timeout?: BrowserTimeout): Cypress.Chainable<JQuery<HTMLElement>>;
    xpath(selector: XpathParams[0], params?: XpathParams[1]): Cypress.Chainable<JQuery<HTMLElement>>;
    xpathWithTimeout(selector: XpathParams[0], timeout?: BrowserTimeout): Cypress.Chainable<JQuery<HTMLElement>>;
    find(selector: string, params: FindParams[1]): Cypress.Chainable<JQuery<HTMLElement>>;
    findWithTimeout(selector: string, timeout?: BrowserTimeout): Cypress.Chainable<JQuery<HTMLElement>>;
    document(): Cypress.Chainable<Document>;
    window(): Cypress.Chainable<Cypress.AUTWindow>;
    go(path: string): Cypress.Chainable<Cypress.AUTWindow>;
}
export declare class Browser extends BaseBrowser {
    waitForVisible(selector: string, timeout?: BrowserTimeout): void;
    waitForDisappear(selector: string, timeout?: BrowserTimeout): void;
    waitForHide(selector: string, timeout?: BrowserTimeout): void;
    waitForExist(selector: string, timeout?: BrowserTimeout): void;
    waitForValue(selector: string, timeout?: BrowserTimeout): void;
    clearInputValue(selector: string): void;
    /**
     * @summary Clear the field, and then set its value
     * @param selector {String} CSS selector for the field in question
     * @param value {String} The final value to be left in the field
     */
    setInputValue(selector: string, value: string | number, clear?: boolean, options?: Partial<Cypress.TypeOptions>): Cypress.Chainable<JQuery<HTMLElement>>;
    setInputNumberValue(selector: string, value: string | number, clear?: boolean, options?: Partial<Cypress.TypeOptions>): Cypress.Chainable<JQuery<HTMLElement>>;
    setInputValueByXpath(selector: string, value: string | number, clear?: boolean, options?: Partial<Cypress.TypeOptions>): Cypress.Chainable<JQuery<HTMLElement>>;
    select(selector: string, value: string): Cypress.Chainable<JQuery<HTMLElement>>;
    click(selector: string, options?: Partial<Cypress.ClickOptions>): Cypress.Chainable<JQuery<HTMLElement>>;
    clickIfExists(selector: string): void;
    getInputValue(selector: string): Cypress.Chainable<string>;
    getInputValueByXpath(path: string): Cypress.Chainable<string | number | string[] | undefined>;
    clickByXpath(path: string): Cypress.Chainable<JQuery<HTMLElement>>;
    clickOnText(text: string, selector?: string): Cypress.Chainable<JQuery<HTMLElement>>;
    doubleClickOnText(text: string, selector?: string, options?: Partial<Cypress.ClickOptions>): Cypress.Chainable<JQuery<HTMLElement>>;
    clickOutside(x?: number, y?: number): Cypress.Chainable<JQuery<HTMLElement>>;
    execute<T = unknown>(cb: ((win: Cypress.AUTWindow) => T) | ((win: Cypress.AUTWindow) => Bluebird.Promise<T>) | ((win: Cypress.AUTWindow) => Cypress.Chainable<T>)): Cypress.Chainable<T>;
    isVisible(selector: string): Cypress.Chainable<boolean>;
    isSelected(selector: string): Cypress.Chainable<boolean>;
    isChecked(selector: string): Cypress.Chainable<boolean>;
    isExisting(selector: string): Cypress.Chainable<boolean>;
    getElement(selector: string, timeout?: BrowserTimeout): Cypress.Chainable<JQuery<HTMLElement>>;
    uploadFileFromFilePath(selector: string, filePath: string): Cypress.Chainable<JQuery<HTMLElement>>;
    getElementText(selector: string): Cypress.Chainable<string>;
    getEachElementTexts(selector: string): Cypress.Chainable<string[]>;
    dispatchEvent(selector: string, event: Event): Cypress.Chainable<JQuery<HTMLElement>>;
    check(selector: string): void;
    uncheck(selector: string): void;
    getAttribute(selector: string, attribute: string): Cypress.Chainable<string | undefined>;
    getCssProperty(selector: string, property: string): Cypress.Chainable<string>;
    retry(cb: () => Cypress.Chainable<boolean>, become?: boolean, delay?: BrowserTimeout | number, timeout?: BrowserTimeout | number): void;
    retry<T>(cb: () => Cypress.Chainable<T>, become: T, delay?: BrowserTimeout | number, timeout?: BrowserTimeout | number): void;
    iframe(selector: string, defaultTimeout?: BrowserTimeout): IframeBrowser;
    waitForVisibleByXpath(selector: string): Cypress.Chainable<JQuery<HTMLElement>>;
    wait(timeout: number): Cypress.Chainable<undefined>;
    back(): void;
    reload(force?: boolean): void;
    getUrl(): Cypress.Chainable<string>;
    replaceElementAttribute(selector: string, attribute: string, value: string): void;
    assertWithRetry(cb: () => Cypress.Chainable<boolean>, options?: RetryOptions): void;
    assertTextWithRetry(selector: string, textOrCallback: string | ((text: string) => void), include?: boolean): void;
    assertNotEmptyTextWithRetry(selector: string): void;
    assertNumberWithRetry(selector: string, value: number | string): void;
    assertInputValueWithRetry(selector: string, text: string, comparison?: "have" | "include"): void;
    assertTextByRegExpWithRetry(selector: string, regExp: RegExp): void;
    assertVisibleWithRetry(selector: string): void;
    assertExistWithRetry(selector: string): void;
    assertNotExistWithRetry(selector: string): void;
    assertCssPropertyWithRetry(selector: string, property: string, value: string): void;
    assertCheckedWithRetry(selector: string, checked?: boolean): void;
    assertLengthWithRetry(selector: string, length: number): void;
    assertElementHasClassWithRetry(selector: string, className: string): void;
    assertInputValueNotEmptyWithRetry(selector: string): void;
    assertAttributeIncludeValueWithRetry(selector: string, attribute: string, value: string): void;
    assertAttributeMatchWithRetry(selector: string, attribute: string, regexp: RegExp, timeout?: BrowserTimeout): void;
    assertDisabledWithRetry(selector: string, disabled?: boolean): void;
    assertFileDownloadedWithRetry(fileName: string): void;
}
export declare class IframeBrowser extends Browser {
    selector: string;
    timeout: number;
    iframeElement?: Cypress.Chainable<JQuery<HTMLElement>>;
    constructor(selector: string, settings: BrowserSettings, timeoutKey: BrowserTimeout);
    get(selector: GetParams[0], options?: GetParams[1]): Cypress.Chainable<JQuery<HTMLElement>>;
    xpath(selector: XpathParams[0], params?: XpathParams[1]): Cypress.Chainable<JQuery<HTMLElement>>;
    getIframeBody(): Cypress.Chainable<any>;
    assertIframeNotExistWithRetry(): void;
}
export {};
