import { BrowserTimeout } from "./Browser";
import Widget from "./Widget";
export default class Page extends Widget {
    url: string;
    open(timeout?: BrowserTimeout): void;
}
