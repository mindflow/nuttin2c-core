import { ContainerUrl } from "containerbridge_v1";
import { UrlUtils } from "../util/urlUtils.js";
import { Logger } from "coreutil_v1";

const LOG = new Logger("History");

export class History {

    static replaceUrl(url, title, stateObject) {
        ContainerUrl.replaceUrl(url.toString(), title, stateObject);
    }

    static pushUrl(url, title, stateObject) {
        ContainerUrl.pushUrl(url.toString(), title, stateObject);
    }

    static currentUrl() {
        return UrlUtils.parse(ContainerUrl.currentUrl());
    }

}