import Widget from "./Widget";

export default class Page extends Widget {
    url = "/";

    open(timeout?: number) {
        this.browser.go(this.url);
        this.waitForVisible(timeout);
        this.waitForLoaderToDisappear();
    }
}
