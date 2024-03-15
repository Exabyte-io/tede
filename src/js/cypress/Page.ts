import { BrowserTimeout } from "./Browser";
import Widget from "./Widget";

export default class Page extends Widget {
    url = "/";

    open(timeout?: BrowserTimeout) {
        this.browser.go(this.url);
        this.waitForVisible(timeout);
        this.waitForLoaderToDisappear();
    }
}
