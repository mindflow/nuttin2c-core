'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var containerbridge_v1 = require('containerbridge_v1');
var coreutil_v1 = require('coreutil_v1');
var mindi_v1 = require('mindi_v1');
var xmlparser_v1 = require('xmlparser_v1');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

class ModuleRunner {

    /**
     * 
     * @param {Url} url 
     * @returns 
     */
     runModule(url) {
     }

}

class Url{

    /**
     * 
     * @param {String} protocol 
     * @param {String} host 
     * @param {String} port 
     * @param {Array<String>} pathValueArray 
     * @param {Map<String, Array<String>>} queryParamMap
     * @param {String} anchor 
     * @param {Map<String, String>} anchorParamMap
     */
    constructor(protocol, host, port = null, pathValueArray = null, queryParamMap = null, anchor = null, anchorParamMap = null) {

        /** @type {String} */
        this.protocolString = protocol;

        /** @type {String} */
        this.hostString = host;

        /** @type {String} */
        this.portString = port;

        /** @type {Array<String>} */
        this.pathValueArray = pathValueArray;

        /** @type {Map<String, Array<String>>} */
        this.queryParamMap = queryParamMap;

        /** @type {Map<String, String>} */
        this.anchorParamMap = anchorParamMap;

        /** @type {String} */
        this.anchorString = anchor;
        
        if (!this.pathValueArray) {
            this.pathValueArray = new Array();
        }

        if (!this.queryParamMap) {
            this.queryParamMap = new Map();
        }

        if (!this.anchorParamMap) {
            this.anchorParamMap = new Map();
        }
    }

    get protocol(){
        return this.protocolString;
    }

    get host(){
        return this.hostString;
    }

    get port(){
        return this.portString;
    }

    get pathsList(){
        return this.pathValueList;
    }

    get anchor(){
        return this.anchorString;
    }

    get parameterMap() {
        return this.parameterValueMap;
    }

    getPathPart(index){
        return this.pathValueList.get(index);
    }

    replacePathValue(from, to){
        let i = 0;
        while (i < this.pathValueArray.length) {
            if (coreutil_v1.StringUtils.nonNullEquals(from, this.pathValueArray[i])) {
                this.pathValueArray[i] = to;
                return this;
            }
            i ++;
        }
        return this;
    }

    get path(){
        let path = "/";
        let first = true;
        this.pathValueList.forEach((value => {
            if (!first) {
                path = path + "/";
            }
            path = path + value;
            first = false;
        }), this);
        return path;
    }

    toString(){
        var value = "";
        if(this.protocol !== null){
            value = value + this.protocol + "//";
        }
        if(this.host !== null){
            value = value + this.host;
        }
        if(this.port !== null){
            value = value + ":" + this.port;
        }

        this.pathValueArray.forEach((pathPart) => {
            value = value + "/" + pathPart;
        });

        if(this.queryParamMap.size > 0){
            const queryParamStrings = new Array();
            this.queryParamMap.forEach((valueArray, key) => {
                valueArray.forEach((value) => {
                    if (value !== null) {
                        queryParamStrings.push(key + "=" + value);
                    } else {
                        queryParamStrings.push(key);
                    }
                    return true;
                });
            });
            if (queryParamStrings.length > 0) {
                value = value + "?" + queryParamStrings.join("&");
            }
        }

        let hashAdded = false;
        if(this.anchor !== null) {
            hashAdded = true;
            value = value + "#" + this.anchor;
        }

        if (this.anchorParamMap.size > 0) {
            const anchorParamStrings = new Array();

            this.anchorParamMap.forEach((value, key) => {
                if (value !== null) {
                    anchorParamStrings.push(key + "=" + value);
                }
            });

            if (anchorParamStrings.length == 0) {
                return value;
            }
            
            if (!hashAdded) {
                value = value + "#";
            }
            value = value + "?" + anchorParamStrings.join("&");

        }
        return value;
    }

}

class UrlUtils {

    /**
     * Parse string to url
     * @param {string} urlString 
     * @returns {Url}
     */
    static parse(urlString) {

        if (urlString === null) { return null; }

        const protocol =     UrlUtils.parseProtocol(urlString);
        const host =         UrlUtils.parseHost(urlString);
        const port =         UrlUtils.parsePort(urlString);
        const pathsList =    UrlUtils.parsePathArray(urlString);
        const queryParam =   UrlUtils.parseQueryParam(urlString);
        const anchor =       UrlUtils.parseAnchor(urlString);
        const anchorParams = UrlUtils.parseAnchorParams(urlString);

        return new Url(protocol, host, port, pathsList, queryParam, anchor, anchorParams);
    }

    /**
     * @param {String} urlString 
     * @returns {String}
     */
    static parseProtocol(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("//") === -1) {
            return null;
        }

        const protocol = urlString.split("//")[0];
        if (protocol[protocol.length - 1] !== ":") {
            return null;
        }
        return protocol;
    }

    /**
     * 
     * @param {String} urlString 
     * @returns {String}
     */
    static parseHost(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("://") === -1) {
            return null;
        }
        let hostAndPort = urlString.split("://")[1];
        if (hostAndPort.indexOf("/") !== -1) {
            hostAndPort = hostAndPort.split("/")[0];
        }
        let host = hostAndPort;
        if (hostAndPort.indexOf(":") !== -1) {
            host = hostAndPort.split(":")[0];
        }
        return host;
    }

    /**
     * 
     * @param {String} urlString 
     * @returns {Number}
     */
    static parsePort(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("://") === -1) {
            return null;
        }
        let hostAndPort = urlString.split("://")[1];
        if (hostAndPort.indexOf("/") !== -1) {
            hostAndPort = hostAndPort.split("/")[0];
        }
        if (hostAndPort.indexOf(":") === -1) {
            return null;
        }
        return Number.parseInt(hostAndPort.split(":")[1]);
    }

    /**
     * 
     * @param {String} urlString 
     * @returns {Array<String>}
     */
    static parsePathArray(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("://") !== -1) {
            urlString = urlString.split("://")[1];
        }
        if (urlString.indexOf("/") !== -1) {
            urlString = urlString.substring(urlString.indexOf("/"));
        }
        if (urlString.indexOf("#") !== -1) {
            urlString = urlString.split("#")[0];
        }
        if (urlString.indexOf("?") !== -1) {
            urlString = urlString.split("?")[0];
        }
        if (urlString.startsWith("/")) {
            urlString = urlString.substring(1);
        }
        const rawPathPartList = urlString.split("/");

        const pathValueList = new Array();
        rawPathPartList.forEach((value) => {
            pathValueList.push(decodeURI(value));
        });
        return pathValueList;
    }

    /**
     * 
     * @param {String} urlString 
     * @returns {Map<String, List<String>>}
     */
    static parseQueryParam(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("://") !== -1) {
            urlString = urlString.split("://")[1];
        }
        if (urlString.indexOf("/") !== -1) {
            urlString = urlString.substring(urlString.indexOf("/"));
        }
        if (urlString.indexOf("#") !== -1) {
            urlString = urlString.split("#")[0];
        }
        if (urlString.indexOf("?") === -1) {
            return null;
        }
        if (urlString.indexOf("?") !== -1) {
            urlString = urlString.split("?")[1];
        }
        if (urlString === null || urlString.length === 0) {
            return null;
        }
        let queryParam = urlString;
        const paramMap = new Map();
        const paramPairs = queryParam.split("&");
        paramPairs.forEach((pair) => {
            let key = null;
            let value = null;
            if (pair.indexOf("=") !== -1) {
                key = pair.split("=")[0];
                value = pair.split("=")[1];
            } else {
                key = pair;
                value = null;
            }
            key = decodeURI(key);
            value = decodeURI(value);
            if (!paramMap.get(key)) {
                paramMap.set(key, new Array());
            }
            paramMap.get(key).push(value);
        });
        return paramMap;
    }

    static parseAnchor(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("://") !== -1) {
            urlString = urlString.split("://")[1];
        }
        if (urlString.indexOf("/") !== -1) {
            urlString = urlString.substring(urlString.indexOf("/"));
        }
        if (urlString.indexOf("#") === -1) {
            return null;
        }
        if (urlString.indexOf("#") !== -1) {
            urlString = urlString.split("#")[1];
        }        
        if (urlString.indexOf("?") !== -1) {
            urlString = urlString.split("?")[0];
        }
        let anchor = urlString;
        return anchor;
    }

    static parseAnchorParams(urlString) {
        if (urlString === null) { return null; }
        if (urlString.indexOf("://") !== -1) {
            urlString = urlString.split("://")[1];
        }
        if (urlString.indexOf("/") !== -1) {
            urlString = urlString.substring(urlString.indexOf("/"));
        }
        if (urlString.indexOf("#") === -1) {
            return null;
        }
        if (urlString.indexOf("#") !== -1) {
            urlString = urlString.split("#")[1];
        }
        if (urlString.indexOf("?") !== -1) {
            urlString = urlString.split("?")[1];
        } else {
            return null;
        }
        let anchorParamString = urlString;
        const paramMap = new Map();
        const paramPairs = anchorParamString.split("&");
        paramPairs.forEach((pair) => {
            let key = null;
            let value = null;
            if (pair.indexOf("=") !== -1) {
                key = pair.split("=")[0];
                value = pair.split("=")[1];
            } else {
                key = pair;
                value = null;
            }
            key = decodeURI(key);
            value = decodeURI(value);
            paramMap.set(key, value);
        });
        return paramMap;
    }


}

new coreutil_v1.Logger("History");

class History {

    static replaceUrl(url, title, stateObject) {
        containerbridge_v1.ContainerUrl.replaceUrl(url.toString(), title, stateObject);
    }

    static pushUrl(url, title, stateObject) {
        containerbridge_v1.ContainerUrl.pushUrl(url.toString(), title, stateObject);
    }

    static currentUrl() {
        return UrlUtils.parse(containerbridge_v1.ContainerUrl.currentUrl());
    }

}

class UrlBuilder {

    constructor() {

        /** @type {String} */
        this.protocol = null;

        /** @type {String} */
        this.host = null;
        
        /** @type {Number} */
        this.port = null;
        
        /** @type {Array<String>} */
        this.pathArray = new Array();
        
        /** @type {Map<String, Array<String>>} */
        this.queryParameterMap = null;

        /** @type {String} */
        this.anchor = null;

        /** @type {Map<String, Array<String>>} */
        this.anchorParameterMap = null;
    }

    /**
     * 
     * @returns {UrlBuilder}
     */
    static create() {
        return new UrlBuilder();
    }

    withCurrentUrl() {
        return this.withUrl(containerbridge_v1.ContainerUrl.currentUrl());
    }

    /**
     * 
     * @param {string} url 
     * @returns {UrlBuilder}
     */
     withUrl(url) {
        this.withAllOfUrl(UrlUtils.parse(url));
        return this;
    }

    /**
     * 
     * @param {Url} url 
     * @returns {UrlBuilder}
     */
     withRootOfUrl(url) {
        this.protocol = url.protocol;
        this.port = url.port;
        this.host = url.host;
        return this;
    }

    /**
     * @param {Url} url 
     * @returns {UrlBuilder}
     */
     withPathOfUrl(url) {
        this.withRootOfUrl(url);
        this.pathArray = url.pathValueArray;
        return this;
    }

    /**
     * @param {Url} url 
     * @returns {UrlBuilder}
     */
    withAllOfUrl(url) {
        this.withPathOfUrl(url);
        this.queryParameterMap = url.queryParamMap;
        this.anchor = url.anchor;
        this.anchorParameterMap = url.anchorParamMap;
        return this;
    }

    /**
     * @param {string} protocol 
     * @returns {UrlBuilder}
     */
    withProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }

    /**
     * 
     * @param {Number} port 
     * @returns {UrlBuilder}
     */
    withPort(port) {
        this.port = port;
        return this;
    }

    /**
     * @param {String} host 
     * @returns {UrlBuilder}
     */
    withHost(host) {
        this.host = host;
        return this;
    }

    /**
     * @param {String} path 
     * @returns {UrlBuilder}
     */
    withPath(path) {
        this.pathArray = UrlUtils.parsePathArray(path);
        return this;
    }

    /**
     * @param {String} anchor 
     * @returns {UrlBuilder}
     */
    withAnchor(anchor) {
        // Reset anchor parameters when setting anchor directly
        this.anchorParameterMap = null;
        this.anchor = anchor;
        return this;
    }

    withAnchorParamString(key, value) {
        if (this.anchorParameterMap == null) {
            this.anchorParameterMap = new Map();
        }
        this.anchorParameterMap.set(key, value);
        return this;
    }

    /**
     * @param {String} key 
     * @param {String} value 
     * @returns {UrlBuilder}
     */
    withQueryParamString(key, value) {
        if (this.queryParameterMap == null) {
            this.queryParameterMap = new Map();
        }
        this.queryParameterMap.set(key, [value]);
        return this;
    }

    /**
     * 
     * @param {String} key 
     * @param {Array<String>} valueArray 
     * @returns 
     */
    withQueryParamArray(key, valueArray) {
        if (this.queryParameterMap == null) {
            this.queryParameterMap = new Map();
        }
        this.queryParameterMap.set(key, valueArray);
        return this;
    }

    replacePathValue(from, to){
        let i = 0;
        while (i < this.pathArray.length) {
            if (coreutil_v1.StringUtils.contains(from, this.pathArray[i])) {
                this.pathArray[i] = this.pathArray[i].replace(from, to);
                return this;
            }
            i ++;
        }
        return this;
    }

    build() {
        return new Url(this.protocol, this.host, this.port, this.pathArray, this.queryParameterMap, this.anchor, this.anchorParameterMap);
    }
}

let navigatoion = null;

class Navigation {

    constructor() {

    }

    /**
     * 
     * @returns {Navigation}
     */
    static instance() {
        if (!navigatoion) {
            navigatoion = new Navigation();
        }
        return navigatoion;
    }

    /**
     * Navigate browser to new url
     * @param {Url} url 
     */
    go(url) {
        containerbridge_v1.ContainerUrl.go(url.toString());
    }

    /**
     * Navigate browser back
     */
    back() {
        containerbridge_v1.ContainerUrl.back();
    }

    /**
     * Load path without renavigating browser
     * @param {string} path
     * @returns {Url}
     */
    loadPath(path) {
        const url = History.currentUrl();
        const newUrl = UrlBuilder.create().withRootOfUrl(url).withPath(path).build();
        History.pushUrl(newUrl);
        return newUrl;
    }

    /**
     * Load anchor without renavigating browser
     * @param {string} anchor
     * @returns {Url}
     */
    loadAnchor(anchor) {
        const url = History.currentUrl();
        const newUrl = UrlBuilder.create().withRootOfUrl(url).withAnchor(anchor).build();
        History.pushUrl(newUrl);
        return newUrl;
    }

}

class TrailNode {

    constructor() {

        /** @type {boolean} */
        this.root = false;

        /** @type {string} */
        this.trail = null;

        /** @type {property} */
        this.property = null;

        /** @type {function} */
        this.waypoint = null;

        /** @type {function} */
        this.destination = null;

        /** @type {Array<TrailNode>} */
        this.next = null;
    }

}

let activeModuleRunner = null;

class ActiveModuleRunner {

    constructor() {

        /** @type {ModuleRunner} */
        this.moduleRunner = null;
    }

    /**
     * 
     * @returns {ActiveModuleRunner}
     */
    static instance() {
        if (!activeModuleRunner) {
            activeModuleRunner = new ActiveModuleRunner();
        }
        return activeModuleRunner;
    }

    /**
     * 
     * @param {ModuleRunner} newModuleRunner 
     */
    set(newModuleRunner) {
        this.moduleRunner = newModuleRunner;
    }

    /**
     * Load anchor without renavigating browser
     * @param {String} trail 
     */
     async load(trail) {
        const url = Navigation.instance().loadAnchor(trail);
        return await this.moduleRunner.runModule(url);
    }
}

class Client {

    /**
     * 
     * @param {String} url 
     * @param {String} authorization
     * @param {Number} timeout
     * @returns {Promise<ContainerHttpResponse>|Promise<ContainerDownload>}
     */
    static get(url, authorization = null, timeout = 1000, download = false) {
        const headers = Client.getHeader(authorization);
        const params =  {
            headers: headers,
            method: 'GET',
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow' // manual, *follow, error
        };
        if (download) {
            return containerbridge_v1.ContainerHttpClient.download(url.toString(), params, timeout);
        }
        return containerbridge_v1.ContainerHttpClient.fetch(url.toString(), params, timeout);
    }

    /**
     * 
     * @param {String} url 
     * @param {Object|ContainerUploadData} data
     * @param {String} authorization
     * @param {Method} progrecCallbackMethod
     * @param {Number} timeout
     * @returns {Promise<ContainerHttpResponse>}
     */
    static post(url, data, authorization = null, progrecCallbackMethod = null, timeout = 1000){
        if (data instanceof containerbridge_v1.ContainerUploadData) {
            return containerbridge_v1.ContainerHttpClient.upload("POST", url, data, authorization, progrecCallbackMethod, timeout);
        }
        const headers = Client.getHeader(authorization);
        const params =  {
            body: JSON.stringify(data), // must match 'Content-Type' header
            headers: headers,
            method: "POST",
            mode: "cors", // no-cors, cors, *same-origin
            redirect: "follow", // manual, *follow, error
        };
        return containerbridge_v1.ContainerHttpClient.fetch(url.toString(), params, timeout);
    }

    /**
     * 
     * @param {String} url 
     * @param {Object|ContainerUploadData} data
     * @param {String} authorization
     * @param {Method} progrecCallbackMethod
     * @param {Number} timeout
     * @returns {Promise<ContainerHttpResponse>}
     */
    static put(url, data, authorization = null, progrecCallbackMethod = null, timeout = 1000){
        if (data instanceof containerbridge_v1.ContainerUploadData) {
            return containerbridge_v1.ContainerHttpClient.upload("PUT", url, data, authorization, progrecCallbackMethod, timeout);
        }
        const headers = Client.getHeader(authorization);
        const params =  {
            body: JSON.stringify(data), // must match 'Content-Type' header
            method: 'PUT', 
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            headers: headers
        };
        return containerbridge_v1.ContainerHttpClient.fetch(url.toString(), params, timeout);
    }

    /**
     * 
     * @param {String} url 
     * @param {Object|ContainerUploadData} data
     * @param {String} authorization
     * @param {Method} progrecCallbackMethod
     * @param {Number} timeout
     * @returns {Promise<ContainerHttpResponse>}
     */
    static patch(url, data, authorization = null, progrecCallbackMethod = null, timeout = 1000) {
        const headers = Client.getHeader(authorization);
        const params =  {
            body: JSON.stringify(data), // must match 'Content-Type' header
            method: 'PATCH', 
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            headers: headers
        };
        return containerbridge_v1.ContainerHttpClient.fetch(url.toString(), params, timeout);
    }

    /**
     * 
     * @param {String} url
     * @param {Object|ContainerUploadData} data
     * @param {String} authorization
     * @param {Method} progrecCallbackMethod
     * @param {Number} timeout
     * @returns {Promise<ContainerHttpResponse>}
     */
    static delete(url, data, authorization = null, progrecCallbackMethod = null, timeout = 1000) {
        const headers = Client.getHeader(authorization);
        if (data) {
            const params =  {
                body: JSON.stringify(data), // must match 'Content-Type' header
                method: 'DELETE',
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                headers: headers
            };
            return containerbridge_v1.ContainerHttpClient.fetch(url.toString(), params, timeout);
        } else {
            const params =  {
                method: 'DELETE',
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                headers: headers
            };
            return containerbridge_v1.ContainerHttpClient.fetch(url.toString(), params, timeout);
        }
    }

    static getHeader(authorization = null) {
        if (authorization) {
            return {
                "user-agent": "Mozilla/4.0 MDN Example",
                "content-type": "application/json",
                "Authorization": authorization
            }
        }
        return {
            "user-agent": "Mozilla/4.0 MDN Example",
            "content-type": "application/json"
        };
    }
}

class Stylesheet {

    /**
     * 
     * @param {string} stylesSource 
     */
    constructor(stylesSource){

        /** @type {string} */
        this.stylesSource = stylesSource;
    }

    /**
     * @returns {string}
     */
    getStylesSource(){
        return this.stylesSource;
    }

}

/* jshint esversion: 6 */

const LOG$d = new coreutil_v1.Logger("StylesRegistry");

class StylesRegistry {

    constructor(){
        /** @type {Map} */
        this.stylesMap = new Map();

        /** @type {Map} */
        this.stylesUrlMap = new Map();

        /** @type {integer} */
        this.stylesQueueSize = 0;

        /** @type {Method} */
        this.callback = null;
    }

    /**
     * 
     * @param {string} name 
     * @param {Styles} styles 
     * @param {Url} url 
     */
    set(name, styles, url){
        if(url !== undefined && url !== null) {
            this.stylesUrlMap.set(name, url);
        }
        this.stylesMap.set(name, styles);
    }

    /**
     * 
     * @param {string} name 
     */
    get(name){
        return this.stylesMap.get(name);
    }

    /**
     * 
     * @param {string} name 
     */
    contains(name){
        if (this.stylesMap.get(name)) {
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {Method} callback 
     */
    done(callback){
        this.callback = callback;
        this.doCallback(this);
    }

    /**
     * 
     * @param {StylesRegistry} registry 
     */
    doCallback(registry){
        if(registry.callback !== null && registry.callback !== undefined  && registry.stylesQueueSize === registry.stylesMap.entries.length){
            var tempCallback = registry.callback;
            registry.callback = null;
            tempCallback.call();
        }
    }

    /**
     * 
     * @param {string} name 
     * @param {Url} url 
     */
     async load(name, url) {
        this.stylesQueueSize ++;
        const response = await Client.get(url);
        if(!response.ok){
            throw "Unable to load styles for " + name + " at " + url;
        }
        const text = await response.text();
        this.set(name, new Stylesheet(text), url);
        this.doCallback(this);
        return null;
    }

    /**
     * 
     * @param {Map<string, string>} nameUrlMap 
     * @returns 
     */
    async getStylesLoadedPromise(nameUrlMap) {
        
        if(!nameUrlMap || nameUrlMap.size == 0) {
            return null;
        }
        let loadPromises = [];
        const parent = this;
        nameUrlMap.forEach((value, key) => {
            if (parent.contains(key)){
                return true;
            }
            try {
                loadPromises.push(parent.privateLoad(key, UrlUtils.parse(value)));
            } catch(reason) {
                throw reason;
            }
        });
        return await Promise.all(loadPromises);
    }

    /**
     * 
     * @param {string} name 
     * @param {Url} url 
     */
    async privateLoad(name, url) {
        LOG$d.info("Loading styles " + name + " at " + url.toString());

        const response = await Client.get(url);
        if(!response.ok){
            throw "Unable to load styles for " + name + " at " + url;
        }
        const text = await response.text();
        const styles = new Stylesheet(text);
        this.set(name, styles, url);
        return styles;
    }
}

/* jshint esversion: 6 */

class Template{

    /**
     * 
     * @param {string} templateSource 
     */
    constructor(templateSource){

        /** @type {string} */
        this.templateSource = templateSource;
    }

    /**
     * @returns {string}
     */
    getTemplateSource(){
        return this.templateSource;
    }

}

/* jshint esversion: 6 */

const LOG$c = new coreutil_v1.Logger("TemplateRegistry");

class TemplateRegistry {

    constructor(){
        /** @type {Map} */
        this.templateMap = new Map();

        /** @type {Map} */
        this.templateUrlMap = new Map();

        /** @type {integer} */
        this.templateQueueSize = 0;

        /** @type {Method} */
        this.callback = null;

        /** @type {string} */
        this.languagePrefix = null;
    }

    /**
     * 
     * @param {string} languagePrefix 
     */
    setLanguagePrefix(languagePrefix) {
        this.languagePrefix = languagePrefix;
    }

    /**
     * 
     * @param {string} name 
     * @param {Template} template 
     * @param {Url} url 
     */
    set(name,template,url){
        if(url !== undefined && url !== null) {
            this.templateUrlMap.set(name, url);
        }
        this.templateMap.set(name, template);
    }

    /**
     * 
     * @param {string} name 
     */
    get(name){
        return this.templateMap.get(name);
    }

    /**
     * 
     * @param {string} name 
     */
    contains(name){
        if (this.templateMap.get(name)) {
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {Method} callback 
     */
    done(callback){
        this.callback = callback;
        this.doCallback(this);
    }

    /**
     * 
     * @param {TemplateRegistry} registry 
     */
    doCallback(registry){
        if(tmo.callback !== null && registry.callback !== undefined  && registry.templateQueueSize === registry.templateMap.size()){
            var tempCallback = registry.callback;
            registry.callback = null;
            tempCallback.call();
        }
    }

    /**
     * 
     * @param {string} name 
     * @param {Url} url 
     */
    async load(name, url) {
        if(this.languagePrefix !== null) {
            url.pathsList.setLast(
                this.languagePrefix + "." +
                url.pathsList.getLast()
            );
        }
        this.templateQueueSize ++;
        const response = await Client.get(url);
        if(!response.ok){
            throw "Unable to load template for " + name + " at " + url;
        }
        const text = await response.text();
        this.set(name,new Template(text),url);
        this.doCallback(this);
    }

    async getTemplatesLoadedPromise(nameUrlMap) {
        
        if(!nameUrlMap || nameUrlMap.length == 0) {
            return null;
        }
        let loadPromises = [];
        const parent = this;
        nameUrlMap.forEach((value, key) => {
            if (parent.contains(key)){
                return;
            }
            try {
                loadPromises.push(parent.privateLoad(key, UrlUtils.parse(value)));
            } catch(reason) {
                throw reason;
            }
        });
        return await Promise.all(loadPromises);
    }

    /**
     * 
     * @param {string} name 
     * @param {Url} url 
     */
    async privateLoad(name, url) {
        if (this.languagePrefix !== null) {
            url.pathsList.setLast(
                this.languagePrefix + "." +
                url.pathsList.getLast()
            );
        }
        LOG$c.info("Loading template " + name + " at " + url.toString());
        const response = await Client.get(url);
        if (!response.ok){
            throw "Unable to load template for " + name + " at " + url;
        }
        const text = await response.text();
        const template = new Template(text);
        this.set(name, template, url);
        return template;
    }
}

new coreutil_v1.Logger("TemplatePostConfig");

/**
 * To be added to mindi as a singleton. Will scan through all configured classes that have a TEMPLATE_URL
 * static getter and will asyncronously load them. Returns a promise which resolves when all templates are loaded
 */
class TemplatesLoader {


    /**
     * 
     * @param {TemplateRegistry} templateRegistry 
     */
    constructor(templateRegistry) {

        /** @type {TemplateRegistry} */
        this.templateRegistry = templateRegistry;
    }

    /**
     * 
     * @param {Map<String,TypeConfig>} configEntries
     * @returns {Promise}
     */
    load(configEntries) {
        let templateMap = new Map();
        configEntries.forEach((configEntry, key) => {
            if (configEntry.classReference.TEMPLATE_URL) {
                templateMap.set(configEntry.classReference.name, configEntry.classReference.TEMPLATE_URL);
            }
        }); 
        return this.templateRegistry.getTemplatesLoadedPromise(templateMap);
    }

}

new coreutil_v1.Logger("StylesLoader");

/**
 * To be added to mindi as a singleton. Will scan through all configured classes that have a STYLES_URL
 * static getter and will asyncronously load them. Returns a promise which resolves when all styles are loaded
 */
class StylesLoader {


    /**
     * 
     * @param {StylesRegistry} stylesRegistry 
     */
    constructor(stylesRegistry) {
        this.stylesRegistry = stylesRegistry;
    }

    /**
     * 
     * @param {Map<String, TypeConfig>} configEntries
     * @returns {Promise}
     */
    load(configEntries) {
        const stylesMap = new Map();
        configEntries.forEach((configEntry, key) => {
            if(configEntry.classReference.STYLES_URL) {
                stylesMap.set(configEntry.classReference.name, configEntry.classReference.STYLES_URL);
            }
            return true;
        }, this); 
        return this.stylesRegistry.getStylesLoadedPromise(stylesMap);
    }

}

new coreutil_v1.Logger("ComponentConfigProcessor");

/**
 * Mindi config processor which loads all templates and styles for all configured components
 * and then calls any existing componentLoaded function on each component
 */
class ComponentConfigProcessor {

    constructor() {

        /**
         * @type {TemplateRegistry}
         */
        this.templateRegistry = mindi_v1.InjectionPoint.instance(TemplateRegistry);

        /**
         * @type {StylesRegistry}
         */
        this.stylesRegistry = mindi_v1.InjectionPoint.instance(StylesRegistry);

    }

    /**
     * 
     */
    postConfig(){
        this.templatesLoader = new TemplatesLoader(this.templateRegistry);
        this.stylesLoader = new StylesLoader(this.stylesRegistry);
    }

    /**
     * 
     * @param {Config} config
     * @param {Map<string, TypeConfig>} unconfiguredConfigEntries
     * @returns {Promise}
     */
    processConfig(config, unconfiguredConfigEntries) {

        return Promise.all(
            [ 
                this.templatesLoader.load(unconfiguredConfigEntries), 
                this.stylesLoader.load(unconfiguredConfigEntries) 
            ]
        );
    }

}

const LOG$b = new coreutil_v1.Logger("LoaderInterceptor");

class LoaderInterceptor {

    /**
     * @returns {Boolean}
     */
    process() {
        LOG$b.info("Unimplemented Loader Interceptor breaks by default");
        return false;
    }

}

const LOG$a = new coreutil_v1.Logger("ModuleLoader");

class ModuleLoader {

    /**
     * 
     * @param {String} modulePath 
     * @param {String} trailStart 
     * @param {Array<LoaderInterceptor>} loaderInterceptors
     */
    constructor(modulePath, trailStart, loaderInterceptors = []) {
    
        /**
         * @type {string}
         */
        this.modulePath = modulePath;

        /**
         * @type {String}
         */
        this.trailStart = trailStart;

        /**
         * @type {Array<LoaderInterceptor>}
         */
        this.loaderInterceptors = loaderInterceptors;

    }

    /**
     * Matches if the configured matchUrl starts with the provided url or
     * if the configured matchUrl is null
     * 
     * @param {Url} url 
     * @returns 
     */
    matches(url){
        // No trailStart means default match
        if (!this.trailStart) {
            return true;
        }

        // No url and non null trailStart, means no match
        if (!url) {
            LOG$a.error("Url is null");
            return false;
        }

        // No anchor match only if trailStart is "/"
        if (!url.anchor) {
            if (coreutil_v1.StringUtils.equals(this.trailStart, "/")) {
                return true;
            }
            return false;
        }

        // Exact match for root trailStart
        if (coreutil_v1.StringUtils.equals(this.trailStart, "/")) {
            return coreutil_v1.StringUtils.equals(url.anchor, this.trailStart);
        }

        return coreutil_v1.StringUtils.startsWith(url.anchor, this.trailStart);
    }

    /**
     * 
     * @returns {Promise<Main>}
     */
    async load() {
        try {
            const module = await this.importModule();
            await this.interceptorsPass();
            return module;
        } catch(reason) {
            LOG$a.warn("Filter rejected " + reason);
            return null;
        }
    }

    /**
     * 
     * @returns {Promise}
     */
    interceptorsPass() {
        const interceptors = this.loaderInterceptors;
        if (interceptors && interceptors.length > 0) {
            let interceptorPromiseChain = interceptors[0].process();
            for (let i = 1; i < interceptors.length; i++) {
                interceptorPromiseChain = interceptorPromiseChain.then(interceptors[i]);
            }
            return interceptorPromiseChain;
        }
        return Promise.resolve();
    }

    async importModule() {
        try {
            const module = await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(this.modulePath);
            return new module.default();
        } catch(reason)  {
            throw reason;
        }
    }

}

class Module {

    constructor() {

        /** @type {Url} */
        this.url = null;

        /** @type {TrailNode} */
        this.trailMap = null;
    }

    async load() {
        throw "Module class must implement load()";
    }

}

const LOG$9 = new coreutil_v1.Logger("DiModuleLoader");

class DiModuleLoader extends ModuleLoader {

    /**
     * 
     * @param {String} modulePath 
     * @param {object} trailMap 
     * @param {MindiConfig} config
     * @param {Array<LoaderInterceptor>} loaderInterceptors
     */
    constructor(modulePath, trailMap, config, loaderInterceptors = []) {
        super(modulePath, trailMap, loaderInterceptors);

        /** @type {MindiConfig} */
        this.config = config;
    }

    /**
     * 
     * @returns {Promise<Module>}
     */
    async load() {
        try {
            const module = await this.importModule();
            await this.interceptorsPass();
            return await mindi_v1.MindiInjector.inject(module, this.config);
        } catch(reason) {
            LOG$9.warn("Module loader failed " + reason);
            throw reason;
        }
    }


    /**
     * 
     * @param {ModuleLoader} moduleLoader
     * @returns {Promise}
     */
    async importModule() {
        try {
            const module = await super.importModule();
            this.config.addAllTypeConfig(module.typeConfigArray);
            await this.config.finalize();
            const workingConfig = this.config;
            await coreutil_v1.ArrayUtils.promiseChain(this.loaderInterceptors, (loaderInterceptor) => {
                return mindi_v1.MindiInjector.inject(loaderInterceptor, workingConfig);
            });
            return module;
        } catch(error) {
            throw error;
        }
    }
}

/**
 * StateManager
 * 
 * @template T, T2
 */
class StateManager {

    constructor() {
        /** @type {Map<String, T>} */
        this.domainMap = new Map();

        /** @type {Map<String, T2>} */
        this.errorMap = new Map();

        /** @type {Map<String, Array<Method>} */
        this.domainListeners = new Map();

        /** @type {Map<String, Array<Method>} */
        this.errorListeners = new Map();

        /** @type {boolean} */
        this.initialized = false;
    }

    /**
     * @param {Method} domainListener
     * @param {Method} errorListener
     */
    react(domainListener, errorListener = null) {
        const anyKey = "__ANY__";
        if (!this.domainListeners.has(anyKey)) {
            this.domainListeners.set(anyKey, new Array());
        }
        this.domainListeners.get(anyKey).push(domainListener);

        if (errorListener != null) {
            if (!this.errorListeners.has(anyKey)) {
                this.errorListeners.set(anyKey, new Array());
            }
            this.errorListeners.get(anyKey).push(errorListener);
        }
    }

    /**
     * 
     * @param {string} key 
     * @param {Method} listener 
     */
    reactTo(key, domainListener, errorListener = null) {
        if (!this.domainListeners.has(key)) {
            this.domainListeners.set(key, new Array());
        }
        this.domainListeners.get(key).push(domainListener);

        if (errorListener != null) {
            if (!this.errorListeners.has(key)) {
                this.errorListeners.set(key, new Array());
            }
            this.errorListeners.get(key).push(errorListener);
        }
    }

    get objectArray() {
        return Array.from(this.domainMap.values());
    }

    /**
     * @param {Promise<T>} object
     */
    async handle(objectPromise, key = "__DEFAULT__") {
        try {
            const object = await objectPromise;
            return await this.updateDomain(object, key);
        } catch (error) {
            await this.updateError(error, key);
            return error;
        }
    }

    async updateError(error, key = "__DEFAULT__") {
        this.initialized = true;
        this.errorMap.set(key, error);
        this.signalErrorChange(error, key);
    }

    /**
     * Update the state
     * 
     * @param {any} object 
     * @param {string} key 
     * @param {T} object 
     */
    async updateDomain(object, key = "__DEFAULT__") {
        if (Array.isArray(object)) {
            for (let i = 0; i < object.length; i++) {
                object[i] = this.createProxy(object[i], key, this);
            }
        }
        object = this.createProxy(object, key, this);
        this.domainMap.set(key, object);
        
        this.initialized = true;
        if (this.errorMap.get(key) != null) {
            this.errorMap.delete(key);
            this.signalErrorChange(null, key);
        }
        this.signalDomainChange(object, key);
        return object;
    }

    async delete(key = "__DEFAULT__") {

        this.domainMap.delete(key);
        this.domainListeners.delete(key);

        this.errorMap.delete(key);
        this.errorListeners.delete(key);

        this.initialized = true;

        this.signalDomainChange(null, key);
    }

    async clear() {
        this.initialized = true;
        for (let key of this.domainMap.keys()) {
            this.signalDomainChange(null, key);
        }
        this.signalDomainChange(null, "__ANY__");

        this.domainMap.clear();
        this.domainListeners.clear();

        this.errorMap.clear();
        this.errorListeners.clear();

        this.initialized = false;
    }

    signalDomainChange(object, key) {
        if (this.domainListeners.has(key)) {
            for (let listener of this.domainListeners.get(key)) {
                listener.call([object, key]);
            }
        }

        const anyKey = "__ANY__";
        if (key != anyKey && this.domainListeners.has(anyKey)) {
            for (let listener of this.domainListeners.get(anyKey)) {
                listener.call([object, key]);
            }
        }
    }

    signalErrorChange(error, key) {
        if (this.errorListeners.has(key)) {
            for (let listener of this.errorListeners.get(key)) {
                listener.call([error, key]);
            }
        }

        const anyKey = "__ANY__";
        if (key != anyKey && this.errorListeners.has(anyKey)) {
            for (let listener of this.errorListeners.get(anyKey)) {
                listener.call([error, key]);
            }
        }
    }

    createProxy(object, key, stateManager) {
        return new Proxy(object, {
            set: (target, prop, value) => {
                if (target[prop] === value) {
                    return true;
                }
                const success = (target[prop] = value);
                stateManager.signalDomainChange(target, key);
                return success === value;
            }
        });
    }

}

class UniqueIdRegistry {

    idAttributeWithSuffix (id) {
        if(idNames.contains(id)) {
            var number = idNames.get(id);
            idNames.set(id,number+1);
            return id + "-" + number;
        }
        idNames.set(id,1);
        return id;
    }

}

var idNames = new coreutil_v1.Map();

class Attribute {

    constructor(attribute) {
        this.attribute = attribute;
    }

    get value() {
        return this.attribute.value;
    }

    get name() {
        return this.attribute.name;
    }

    get namespace() {
        return this.attribute.name;
    }
}

class MappedContainerElement {

    /**
     * 
     * @param {ContainerElement} element 
     */
    constructor(element) {

        if (!element) {
            throw new Error("ContainerElement must be provided");
        }

        /** @type {ContainerElement} */
        this.containerElement = element;
    }

}

const LOG$8 = new coreutil_v1.Logger("ElementUtils");

class ElementUtils {


    /**
     * 
     * @param {any} value 
     * @param {MappedContainerElement} parent 
     * @returns 
     */
    static createContainerElement(value, parent) {
        if (value instanceof xmlparser_v1.XmlElement) {
            return ElementUtils.createFromXmlElement(value, parent);
        }
        if (typeof value === "string") {
            return containerbridge_v1.ContainerElementUtils.createElement(value);
        }
        if (containerbridge_v1.ContainerElementUtils.isUIElement(value)) {
            return new containerbridge_v1.ContainerElement(value);
        }
        LOG$8.error("Unrecognized value for Element");
        LOG$8.error(value);
        return null;
    }

    /**
     * Creates a browser Element from the XmlElement
     *
     * @param {XmlElement} xmlElement
     * @param {MappedContainerElement} parentElement
     * @return {HTMLElement}
     */
    static createFromXmlElement(xmlElement, parentElement) {
        let element = null;
        if (xmlElement.namespace) {
            element = containerbridge_v1.ContainerElementUtils.createElementNS(xmlElement.namespaceUri, xmlElement.fullName);
        } else {
            element = containerbridge_v1.ContainerElementUtils.createElement(xmlElement.name);
        }
        if (parentElement && parentElement.containerElement !== null) {
            parentElement.containerElement.appendChild(element);
        }
        xmlElement.attributes.forEach((attributeKey, attribute) => {
            containerbridge_v1.ContainerElementUtils.setAttributeValue(element, attributeKey, attribute.value);
            return true;
        });
        return element;
    }

}

const LOG$7 = new coreutil_v1.Logger("BaseElement");

/**
 * A base class for enclosing an HTMLElement
 */
class BaseElement extends MappedContainerElement {

    /**
     * Constructor
     *
     * @param {XmlElement|string|any} value Value to be converted to Container UI Element (HTMLElement in the case of Web Browser)
     * @param {BaseElement} parent the parent BaseElement
     */
    constructor(value, parent) {
        super(ElementUtils.createContainerElement(value, parent));
        this.attributeMap = null;
        this.eventsAttached = new coreutil_v1.List();
    }

    loadAttributes() {
        if (this.containerElement.attributes === null || this.containerElement.attributes === undefined) {
            this.attributeMap = new coreutil_v1.Map();
            return;
        }
        if (this.attributeMap === null || this.attributeMap === undefined) {
            this.attributeMap = new coreutil_v1.Map();
            for (var i = 0; i < this.containerElement.attributes.length; i++) {
                this.attributeMap.set(this.containerElement.attributes[i].name,new Attribute(this.containerElement.attributes[i]));
            }
        }
    }

    /**
     * 
     * @param {string} eventType 
     * @param {Function} listenerFunction
     * @param {Object} contextObject
     * @param {boolean} capture
     * @returns {BaseElement}
     */
    listenTo(eventType, listenerFunction, contextObject, capture = false) {
        const listener = new coreutil_v1.Method(listenerFunction, contextObject);
        this.containerElement.addEventListener(eventType, listener, capture);
        return this;
    }

    get fullName() {
        return this.containerElement.tagName;
    }

    get top() {
        return this.containerElement.boundingClientRect.top;
    }

    get bottom() {
        return this.containerElement.boundingClientRect.bottom;
    }

    get left() {
        return this.containerElement.boundingClientRect.left;
    }

    get right() {
        return this.containerElement.boundingClientRect.right;
    }

    get width() {
        return this.containerElement.offsetWidth;
    }

    get height() {
        return this.containerElement.offsetHeight;
    }

    get attributes() {
        this.loadAttributes();
        return this.attributeMap;
    }

    setAttributeValue(key, value) {
        containerbridge_v1.ContainerElementUtils.setAttributeValue(this.containerElement, key,value);
    }

    getAttributeValue(key) {
        return containerbridge_v1.ContainerElementUtils.getAttributeValue(this.containerElement, key);
    }

    containsAttribute(key) {
        const containerElement = this.containerElement;
        return containerElement.hasAttribute(key);
    }

    removeAttribute(key) {
        this.containerElement.removeAttribute(key);
    }

    setStyle(key, value) {
        this.containerElement.style[key] = value;
    }

    getStyle(key) {
        return this.containerElement.style[key];
    }

    removeStyle(key) {
        this.containerElement.style[key] = null;
    }

    set(input) {
        if (null === input || undefined === input) {
            throw new Error("No input provided to set the element");
        }
        if(!this.containerElement.parentNode){
            console.error("The element has no parent, can not swap it for value");
            return;
        }
        /** @type {ContainerElement} */
        const parentNode = this.containerElement.parentNode;

        if(input.containerElement) {
            parentNode.replaceChild(input.containerElement);
            return;
        }
        if(input && input.rootElement) {
            parentNode.replaceChild(input.rootElement.containerElement, this.containerElement);
            this.containerElement = input.rootElement.containerElement;
            return;
        }
        if(typeof input == "string") {
            parentNode.replaceChild(containerbridge_v1.ContainerElementUtils.createTextNode(input), this.containerElement);
            return;
        }
        if(input instanceof Text) {
            parentNode.replaceChild(input, this.containerElement);
            return;
        }
        if(input instanceof Element) {
            parentNode.replaceChild(input, this.containerElement);
            return;
        }
        LOG$7.warn("No valid input to set the element");
        LOG$7.warn(input);
    }

    isMounted() {
        if(this.containerElement.parentNode) {
            return true;
        }
        return false;
    }

    remove() {
        if (this.containerElement.parentNode) {
            /** @type {ContainerElement} */
            const parentNode = this.containerElement.parentNode;
            parentNode.removeChild(this.containerElement);
        }
    }

    clear() {
        while (this.containerElement.firstChild) {
            this.containerElement.removeChild(this.containerElement.firstChild);
        }
    }

    setChild(input) {
        if (null === input || undefined === input) {
            throw new Error("No input provided to set the element");
        }
        this.clear();
        this.addChild(input);
    }

    addChild(input) {
        if (null === input || undefined === input) {
            throw new Error("No input provided to set the element");
        }
        if (input.containerElement !== undefined && input.containerElement !== null){
            this.containerElement.appendChild(input.containerElement);
            return;
        }
        if (input && input.rootElement) {
            this.containerElement.appendChild(input.rootElement.containerElement);
            return;
        }
        if (typeof input == "string") {
            this.containerElement.appendChild(containerbridge_v1.ContainerElementUtils.createTextNode(input));
            return;
        }
        if (input instanceof Text) {
            this.containerElement.appendChild(input);
            return;
        }
        if (input instanceof Element) {
            const containerElement = new containerbridge_v1.ContainerElement(input);
            this.containerElement.appendChild(containerElement);
            return;
        }
        LOG$7.warn("No valid input to add the element");
        LOG$7.warn(input);
    }

    prependChild(input) {
        if (null === input || undefined === input) {
            throw new Error("No input provided to set the element");
        }
        if(this.containerElement.firstChild === null) {
            this.addChild(input);
        }
        if (input.containerElement !== undefined && input.containerElement !== null) {
            this.containerElement.insertBefore(input.containerElement, this.containerElement.firstChild);
            return;
        }
        if (input && input.rootElement) {
            this.containerElement.insertBefore(input.rootElement.containerElement, this.containerElement.firstChild);
            return;
        }
        if (typeof input == "string") {
            this.containerElement.insertBefore(containerbridge_v1.ContainerElementUtils.createTextNode(input), this.containerElement.firstChild);
            return;
        }
        if (input instanceof containerbridge_v1.ContainerText) {
            this.containerElement.insertBefore(input, this.containerElement.firstChild);
            return;
        }
        if (input instanceof Element) {
            this.containerElement.insertBefore(input, this.containerElement.firstChild);
            return;
        }
        LOG$7.warn("No valid input to prepend the element");
        LOG$7.warn(input);
    }
}

/* jshint esversion: 6 */

class Component {

    /**
     * 
     * @param {number} componentIndex 
     * @param {BaseElement} rootElement 
     * @param {Map} elementMap 
     */
    constructor(componentIndex, rootElement, elementMap) {
        this.componentIndex = componentIndex;
        this.elementMap = elementMap;
        this.rootElement = rootElement;
    }

    remove() {
        this.rootElement.remove();
    }

    /**
     * 
     * @param {string} id 
     * @returns {BaseElement}
     */
    get(id) {
        return this.elementMap.get(id);
    }

    /**
     * 
     * @param {string} id 
     * @param {BaseElement}
     * @returns {BaseElement}
     */
    set (id, value) {
        this.elementMap.get(id).set(value);
        return this.elementMap.get(id);
    }

    /**
     * 
     * @param {string} id 
     * @returns {BaseElement}
     */
    clearChildren(id){
        this.elementMap.get(id).clear();
        return this.elementMap.get(id);
    }

    /**
     * 
     * @param {string} id 
     * @param {BaseElement}
     * @returns {BaseElement}
     */
    setChild (id, value) {
        this.elementMap.get(id).setChild(value);
        return this.elementMap.get(id);
    }

    /**
     * 
     * @param {string} id 
     * @param {BaseElement}
     * @returns {BaseElement}
     */
    addChild (id, value) {
        this.elementMap.get(id).addChild(value);
        return this.elementMap.get(id);
    }

    /**
     * 
     * @param {string} id 
     * @param {BaseElement}
     * @returns {BaseElement}
     */
    prependChild (id, value) {
        this.elementMap.get(id).prependChild(value);
        return this.elementMap.get(id);
    }

}

new coreutil_v1.Logger("AbstractInputElement");

/**
 * Shared properties of input elements
 */
class AbstractInputElement extends BaseElement{

    /**
     * Constructor
     *
     * @param {XmlElement} value
     * @param {BaseElement} parent
     */
    constructor(value, parent) {
        super(value, parent);
    }

    /**
     * Get the value of the inputs name
     *
     * @return {string}
     */
    get name() {
        return this.containerElement.name;
    }

    /**
     * Set the value of inputs name
     *
     * @param {string} value
     */
    set name(value) {
        this.containerElement.name = value;
    }

    /**
     * Returns the value given any processing rules
     */
    get value(){
        return this.backingValue;
    }

    set value(value){
        this.containerElement.value = value;
        this.containerElement.dispatchEvent('change');
    }

    /**
     * Returns the source value
     */
    get backingValue(){
        return this.containerElement.value;
    }

    focus() {
        this.containerElement.focus();
    }

    selectAll() {
        this.containerElement.select();
    }

    enable() {
        this.containerElement.disabled = false;
    }

    disable() {
        this.containerElement.disabled = true;
    }
}

/* jshint esversion: 6 */

class RadioInputElement extends AbstractInputElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    set checked(value){
        this.containerElement.checked = value;
    }

    isChecked(){
        return this.containerElement.checked;
    }

    get value() {
        return this.isChecked();
    }

    set value(value) {
        this.containerElement.checked = (value === true || value === "true");
    }
}

/* jshint esversion: 6 */

class CheckboxInputElement extends AbstractInputElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    set checked(value){
        this.containerElement.checked = value;
    }

    isChecked(){
        return this.containerElement.checked;
    }

    get value() {
        return this.isChecked();
    }

    set value(value) {
        this.containerElement.checked = (value === true || value === "true");
    }
}

/* jshint esversion: 6 */

class TextInputElement extends AbstractInputElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

}

/* jshint esversion: 6 */

class TextareaInputElement extends AbstractInputElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    get innerHTML(){
        return this.containerElement.innerHTML;
    }

    set innerHTML(value){
        this.containerElement.innerHTML = value;
    }

    addChild(input) {
        super.addChild(input);
        this.value = this.innerHTML;
    }

    prependChild(input) {
        super.prependChild(input);
        this.value = this.innerHTML;
    }

}

class TextnodeElement {

    /**
     * Constructor
     *
     * @param {XmlCdata} value 
     * @param {BaseElement} parent 
     */
    constructor(value, parent) {

        /** @type {ContainerElement} */
        this.containerElement = null;

        if(value instanceof xmlparser_v1.XmlCdata) {
            this.containerElement = this.createFromXmlCdata(value, parent);
        }
        if(typeof value === "string"){
            this.containerElement = containerbridge_v1.ContainerElementUtils.createTextNode(value);
        }
    }

    /**
     * 
     * @param {XmlCdata} cdataElement 
     * @param {BaseElement} parentElement 
     */
    createFromXmlCdata(cdataElement, parentElement) {
        const element = containerbridge_v1.ContainerElementUtils.createTextNode(cdataElement.value);
        if(parentElement !== null && parentElement.containerElement !== null) {
            parentElement.containerElement.appendChild(element);
        }
        return element;
    }

    set value(value) {
        this.element = value;
    }

    get value() {
        return this.element;
    }

}

/* jshint esversion: 6 */

class SimpleElement extends BaseElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    get innerHTML(){
        return this.containerElement.innerHTML;
    }

    set innerHTML(value){
        this.containerElement.innerHTML = value;
    }

    focus() {
        this.containerElement.focus();
    }

}

/* jshint esversion: 6 */

class FormElement extends BaseElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    /**
     * Get the value of the inputs name
     *
     * @return {string}
     */
    get name() {
        return this.containerElement.name;
    }

    /**
     * Set the value of inputs name
     *
     * @param {string} value
     */
    set name(value) {
        this.containerElement.name = value;
    }

    submit() {
        return this.containerElement.submit();
    }

}

class VideoElement extends BaseElement {

    /**
     * Constructor
     *
     * @param {XmlElement} value 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    get mappedElement() {
        return this.containerElement;
    }

    playMuted() {
        this.containerElement.playMuted();
    }

    play() {
        this.containerElement.play();
    }

    mute() {
        this.containerElement.muted = true;
    }

    unmute() {
        this.containerElement.muted = false;
    }

}

/* jshint esversion: 6 */

class OptionElement extends BaseElement {
	/**
	 * Constructor
	 *
	 * @param {XmlElement} element 
	 * @param {BaseElement} parent 
	 */
	constructor(element, parent) {
		super(element, parent);
        this.optionLabel = null;
	}

    get value(){
        return this.getAttributeValue("value");
    }

    set value(val){
        this.setAttributeValue("value", val);
    }

    get label(){
        return this.optionLabel;
    }

    set label(value){
        this.optionLabel = value;
        this.setChild(value);
    }
}

/* jshint esversion: 6 */

class SelectElement extends BaseElement {
	/**
	 * Constructor
	 *
	 * @param {XmlElement} element 
	 * @param {BaseElement} parent 
	 */
	constructor(element, parent) {
		super(element, parent);

        /** @type {Array<OptionElement>} */
        this.optionsArray = [];
	}

    /**
     * Get options as array of OptionElement
     * @return {Array<OptionElement>}
     */
    get options(){
        return this.optionsArray;
    }

    /**
     * Set options from array of OptionElement
     * @param {Array<OptionElement>} optionsArray
     */
    set options(optionsArray){
        this.optionsArray = optionsArray;
        this.renderOptions();
    }

    renderOptions(){
        while (this.containerElement.firstChild) {
            this.containerElement.removeChild(this.containerElement.firstChild);
        }
        for (const option of this.optionsArray){
            this.containerElement.appendChild(option.containerElement);
        }
    }

    /**
     * Get the value of the inputs name
     *
     * @return {string}
     */
    get name() {
        return this.containerElement.name;
    }

    /**
     * Set the value of inputs name
     *
     * @param {string} value
     */
    set name(value) {
        this.containerElement.name = value;
    }

    /**
     * Returns the value given any processing rules
     */
    get value(){
        return this.backingValue;
    }

    /**
     * Returns the source value
     */
    get backingValue(){
        return this.containerElement.value;
    }

    focus() {
        this.containerElement.focus();
    }

    selectAll() {
        this.containerElement.select();
    }

    enable() {
        this.containerElement.disabled = false;
    }

    disable() {
        this.containerElement.disabled = true;
    }
}

class FileInputElement extends AbstractInputElement{

    /**
     * Constructor
     *
     * @param {XmlElement} element 
     * @param {BaseElement} parent 
     */
    constructor(element, parent) {
        super(element, parent);
    }

    async focus() {
        LOG.WARN("File input elements cannot be focused directly due to browser security restrictions.");
        this.element.focus();
    }

}

/* jshint esversion: 6 */

class ElementMapper {

    /**
     * Constructor
     * 
     * @param {any} input 
     * @param {BaseElement} parent 
     */
    static map(input, parent) {
        if (ElementMapper.mapsToRadio(input)){     return new RadioInputElement(input, parent); }
        if (ElementMapper.mapsToCheckbox(input)){  return new CheckboxInputElement(input, parent); }
        if (ElementMapper.mapsToSubmit(input)){    return new TextInputElement(input, parent); }
        if (ElementMapper.mapsToForm(input)){      return new FormElement(input, parent); }
        if (ElementMapper.mapsToTextarea(input)){  return new TextareaInputElement(input, parent); }
        if (ElementMapper.mapsToFile(input)){      return new FileInputElement(input, parent); }
        if (ElementMapper.mapsToText(input)){      return new TextInputElement(input, parent); }
        if (ElementMapper.mapsToVideo(input)){     return new VideoElement(input, parent); }
        if (ElementMapper.mapsToTextnode(input)){  return new TextnodeElement(input, parent); }
        if (ElementMapper.mapsToOption(input)){    return new OptionElement(input, parent); }
        if (ElementMapper.mapsToSelect(input)){    return new SelectElement(input, parent); }
        if (ElementMapper.mapsToSimple(input)){    return new SimpleElement(input, parent); }
        console.log("Mapping to simple by default " + input);
        return new SimpleElement(input, parent);
    }

    static mapsToRadio(input){
        if (input instanceof HTMLInputElement && input.type === "radio") {
            return true;
        }
        if (input instanceof xmlparser_v1.XmlElement && input.name === "input" && input.getAttribute("type") &&
                input.getAttribute("type").value === "radio") {

            return true;
        }
        return false;
    }

    static mapsToCheckbox(input){
        if (input instanceof HTMLInputElement && input.type === "checkbox") {
            return true;
        }
        if (input instanceof xmlparser_v1.XmlElement && input.name === "input" && input.getAttribute("type") &&
                input.getAttribute("type").value === "checkbox") {

            return true;
        }
        return false;
    }

    static mapsToSubmit(input){
        if (input instanceof HTMLInputElement && input.type === "submit") {
            return true;
        }
        if (input instanceof xmlparser_v1.XmlElement && input.name === "input" && input.getAttribute("type") &&
                input.getAttribute("type").value === "submit") {

            return true;
        }
        return false;
    }

    static mapsToForm(input){
        return (input instanceof HTMLFormElement) ||
            (input instanceof xmlparser_v1.XmlElement && input.name === "form");
    }

    static mapsToFile(input){
        if (input instanceof HTMLInputElement) {
            if (input.type === "file") { return true; }
        }
        if(input instanceof xmlparser_v1.XmlElement && input.name === "input" && input.getAttribute("type") &&
                input.getAttribute("type").value === "file") { 
                    
            return true;
        }

        return false;
    }

    static mapsToText(input){
        if (input instanceof HTMLInputElement) {
            if (input.type === "text") { return true; }
            if (input.type === "hidden") { return true; }
            if (input.type === "number") { return true; }
            if (input.type === "password") { return true; }
            if (input.type === "email") { return true; }
            if (input.type === "date") { return true; }
            if (input.type === "time") { return true; }
        }
        if(input instanceof xmlparser_v1.XmlElement && input.name === "input") {
            if(!input.getAttribute("type")) { return true; }
            if(input.getAttribute("type").value === "text") { return true; }
            if(input.getAttribute("type").value === "hidden") { return true; }
            if(input.getAttribute("type").value === "number") { return true; }
            if(input.getAttribute("type").value === "password") { return true; }
            if(input.getAttribute("type").value === "email") { return true; }
            if(input.getAttribute("type").value === "date") { return true; }
            if(input.getAttribute("type").value === "time") { return true; }
        }
        return false;
    }

    static mapsToTextnode(input){
        return (input instanceof Node && input.nodeType === "TEXT_NODE") ||
            (input instanceof xmlparser_v1.XmlCdata);
    }

    static mapsToOption(input){
        return (input instanceof HTMLOptionElement) ||
            (input instanceof xmlparser_v1.XmlElement && input.name === "option");
    }
    
    static mapsToSelect(input){
        return (input instanceof HTMLSelectElement) ||
            (input instanceof xmlparser_v1.XmlElement && input.name === "select");
    }

    static mapsToVideo(input){
        return (input instanceof HTMLVideoElement) ||
            (input instanceof xmlparser_v1.XmlElement && input.name === "video");
    }

    static mapsToTextarea(input){
        return (input instanceof HTMLTextAreaElement) ||
            (input instanceof xmlparser_v1.XmlElement && input.name === "textarea");
    }

    static mapsToSimple(input){
        return (input instanceof HTMLElement) ||
            (input instanceof xmlparser_v1.XmlElement);
    }
}

/**
 * Collects information when elements are created and finds the root element, creates map of elements 
 */
class ElementRegistrator {

    /**
     * 
     * @param {UniqueIdRegistry} uniqueIdRegistry 
     * @param {Number} componentIndex 
     */
    constructor(uniqueIdRegistry, componentIndex) {

        /** @type {Number} */
        this.componentIndex = componentIndex;

        /** @type {UniqueIdRegistry} */
        this.uniqueIdRegistry = uniqueIdRegistry;

        /** @type {BaseElement} */
        this.rootElement = null;

        this.elementMap = new coreutil_v1.Map();
    }

    getElementMap() {
        return this.elementMap;
    }

    /**
     * Listens to elements being created, and takes inn the created XmlElement and its parent XmlElement
     * 
     * @param {XmlElement} xmlElement 
     * @param {BaseElement} parentWrapper 
     */
    elementCreated(xmlElement, parentWrapper) {
        const element = ElementMapper.map(xmlElement, parentWrapper);

        this.addToElementIdMap(element);

        if(this.rootElement === null && element !== null) {
            this.rootElement = element;
        }

        return element;
    }

    addToElementIdMap(element) {
        if(element === null || element === undefined || !(element instanceof BaseElement)) {
            return;
        }
        var id = null;
        if(element.containsAttribute("id")) {
            id = element.getAttributeValue("id");
            element.setAttributeValue("id",this.uniqueIdRegistry.idAttributeWithSuffix(id));
        }

        if(id !== null) {
            this.elementMap.set(id,element);
        }
    }
}

class CanvasRoot {

    static shouldSwallowNextFocusEscape = false;

    /** @type {ContainerElement} */
    static mouseDownElement = null;

    static focusEscapeEventRequested = false;

    /**
     * 
     * @param {String} id 
     * @param {Component} component 
     */
    static replaceComponent(id, component) {
        const bodyElement = containerbridge_v1.ContainerElementUtils.getElementById(id);
        bodyElement.parentNode.replaceChild(component.rootElement.containerElement, bodyElement);
    }

    /**
     * 
     * @param {String} id 
     * @param {Component} component 
     */
    static setComponent(id, component) {
        const bodyElement = containerbridge_v1.ContainerElementUtils.getElementById(id);
        bodyElement.innerHTML = '';
        bodyElement.appendChild(component.rootElement.containerElement, bodyElement);
    }

    /**
     * 
     * @param {String} id 
     * @param {Component} component 
     */
    static addChildComponent(id, component) {
        const bodyElement = containerbridge_v1.ContainerElementUtils.getElementById(id);
        bodyElement.appendChild(component.rootElement.containerElement);
    }

    /**
     * 
     * @param {String} id 
     * @param {Component} component 
     */
    static addChildElement(id, element) {
        const bodyElement = containerbridge_v1.ContainerElementUtils.getElementById(id);
        bodyElement.appendChild(element.containerElement);
    }

    /**
     * 
     * @param {String} id 
     */
    static removeElement(id) {
        containerbridge_v1.ContainerElementUtils.removeElement(id);
    }

    /** 
     * @param {BaseElement} element
     */
    static addHeaderElement(element) {
        containerbridge_v1.ContainerElementUtils.appendRootMetaChild(element.containerElement);
    }

    /** 
     * @param {BaseElement} element
     */
    static addBodyElement(element) {
        containerbridge_v1.ContainerElementUtils.appendRootUiChild(element.containerElement);
    }

    /** 
     * @param {BaseElement} element
     */
    static prependHeaderElement(element) {
        containerbridge_v1.ContainerElementUtils.prependElement("head", element.containerElement);
    }

    /** 
     * @param {BaseElement} element
     */
    static prependBodyElement(element) {
        containerbridge_v1.ContainerElementUtils.prependElement("body", element.containerElement);
    }

    /** 
     * Remember to swallowFocusEscape for initial triggering events
     * which are external to focusRoot
     * 
     * Also remember to keep the destroy function and call it
     * when the listener is no longer needed
     * 
     * @param {BaseElement} focusRoot
     * @param {Function} listenerFunction
     * @param {Object} contextObject
     * @returns {Function} destroy function to remove the listener from the container window
     */
    static listenToFocusEscape(focusRoot, listenerFunction, contextObject) {
        
        const listener = new coreutil_v1.Method(listenerFunction, contextObject);

        const destroyFunctions = [];

        /* Hack: Because we don't have a way of knowing in the click event which element was in focus when mousedown occured */
        if (!CanvasRoot.focusEscapeEventRequested) {
            const updateMouseDownElement = new coreutil_v1.Method((/** @type {ContainerEvent} */ event) => {
                CanvasRoot.mouseDownElement = event.target;
            });
            destroyFunctions.push(
                containerbridge_v1.ContainerWindow.addEventListener("mousedown", updateMouseDownElement)
            );
            CanvasRoot.focusEscapeEventRequested = true;
        }

        const callIfNotContains = new coreutil_v1.Method((/** @type {ContainerEvent} */ event) => {
            CanvasRoot.mouseDownElement = event.target;
            if (containerbridge_v1.ContainerElementUtils.contains(focusRoot.containerElement, CanvasRoot.mouseDownElement)) {
                return;
            }
            // If the element is not connected, then the element is not visible
            // and we should not trigger focus escape events
            if (!containerbridge_v1.ContainerElementUtils.isConnected(CanvasRoot.mouseDownElement)) {
                return;
            }
            if (CanvasRoot.shouldSwallowNextFocusEscape) {
                return;
            }
            listener.call(event);
        });
        destroyFunctions.push(
            containerbridge_v1.ContainerWindow.addEventListener("mousedown", callIfNotContains)
        );

        return () => {
            destroyFunctions.forEach(destroy => destroy());
        };
    }

    /**
     * When an element is congigured to be hidden by FocusEscape,
     * and was shown by an event triggered from an external element,
     * then FocusEscape gets triggered right after the element is
     * shown. Therefore this function allows this event to be 
     * swallowed to avoid this behavior
     * 
     * @param {number} forMilliseconds 
     */
    static swallowFocusEscape(forMilliseconds) {
        CanvasRoot.shouldSwallowNextFocusEscape = true;
        setTimeout(() => {
            CanvasRoot.shouldSwallowNextFocusEscape = false;
        }, forMilliseconds);
    }
}

/* jshint esversion: 6 */

class HTML{

    /**
     * 
     * @param {String} elementName 
     * @param {Map<String, String>} attributeMap 
     * @returns 
     */
    static custom(elementName, attributeMap = null){
        const xmlElement = new xmlparser_v1.XmlElement(elementName);
        if (attributeMap) {
            attributeMap.forEach((value, key) => {
                xmlElement.setAttribute(key, new xmlparser_v1.XmlAttribute(key, null, value));
            });
        }
        return ElementMapper.map(xmlElement);
    }

    static applyStyles(element, classValue, styleValue){
        if(classValue){
            element.setAttributeValue("class", classValue);
        }
        if(styleValue){
            element.setAttributeValue("style", styleValue);
        }
    }

    static a(value, href, classValue, styleValue){
        const element = HTML.custom("a");
        element.addChild(value);
        element.setAttributeValue("href",href);
        HTML.applyStyles(element, classValue, styleValue);
        return element;
    }

    static i(value, classValue, styleValue){
        const element = HTML.custom("i");
        element.addChild(value);
        HTML.applyStyles(element, classValue, styleValue);
        return element;
    }
}

const LOG$6 = new coreutil_v1.Logger("CanvasStyles");

const styles = new coreutil_v1.Map();
const styleOwners = new coreutil_v1.Map();
const enabledStyles = new coreutil_v1.List();

class CanvasStyles {

    static setStyle(name, source) {
        if(styles.contains(name)) {
            styles.get(name).setChild(new TextnodeElement(source.getStylesSource()));
        } else {
            /** @type {BaseElement} */
            let styleElement = HTML.custom("style");
            styleElement.setAttributeValue("id",name);
            styleElement.setChild(new TextnodeElement(source.getStylesSource()));
            styles.set(name, styleElement);
        }
    }

    static removeStyle(name) {
        if(enabledStyles.contains(name)) {
            enabledStyles.remove(name);
            CanvasRoot.removeElement(name);
        }
        if(styles.contains(name)) {
            styles.remove(name);
        }
    }

    static disableStyle(name, ownerId = 0) {
        CanvasStyles.removeStyleOwner(name, ownerId);
        if(CanvasStyles.hasStyleOwner(name)) {
            return;
        }
        if(!styles.contains(name)) {
            LOG$6.error("Style does not exist: " + name);
            return;
        }
        if(enabledStyles.contains(name)) {
            enabledStyles.remove(name);
            CanvasRoot.removeElement(name);
        }
    }

    static enableStyle(name, ownerId = 0) {
        CanvasStyles.addStyleOwner(name, ownerId);
        if(!styles.contains(name)) {
            LOG$6.error("Style does not exist: " + name);
            return;
        }
        if(!enabledStyles.contains(name)) {
            enabledStyles.add(name);
            CanvasRoot.addHeaderElement(styles.get(name));
        }
    }

    static addStyleOwner(name, ownerId) {
        if(!styleOwners.contains(name)) {
            styleOwners.set(name, new coreutil_v1.List());
        }
        if(!styleOwners.get(name).contains(ownerId)) {
            styleOwners.get(name).add(ownerId);
        }
    }

    static removeStyleOwner(name, ownerId) {
        if(!styleOwners.contains(name)) {
            return;
        }
        styleOwners.get(name).remove(ownerId);
    }

    static hasStyleOwner(name) {
        if(!styleOwners.contains(name)) {
            return false;
        }
        return styleOwners.get(name).size() > 0;
    }
}

class ComponentFactory {

    constructor() {

    }

    /**
     * 
     * @param {string} componentName 
     * @returns {Component}
     */
    create(componentName) {
        throw "Not implemented";
    }

}

const LOG$5 = new coreutil_v1.Logger("TemplateComponentFactory");

class TemplateComponentFactory extends ComponentFactory{

    constructor() {

        super();

        /** @type {StylesRegistry} */
        this.stylesRegistry = mindi_v1.InjectionPoint.instance(StylesRegistry);

        /** @type {TemplateRegistry} */
        this.templateRegistry = mindi_v1.InjectionPoint.instance(TemplateRegistry);

        /** @type {UniqueIdRegistry} */
        this.uniqueIdRegistry = mindi_v1.InjectionPoint.instance(UniqueIdRegistry);
    }

    /**
     * 
     * @param {function} classType represents the template and the styles name if the style for that name is available
     */
    create(classType){
        if (!classType.TEMPLATE_URL) {
            throw new Error("Template component class must implement static member TEMPLATE_URL");
        }
        const template = this.templateRegistry.get(classType.name);
        if(!template) {
            LOG$5.error(this.templateRegistry);
            console.trace();
            throw new Error("No template was found with name " + classType.name);

        }
        const elementRegistrator = new ElementRegistrator(this.uniqueIdRegistry, templateComponentCounter++);
        new xmlparser_v1.DomTree(template.getTemplateSource(), elementRegistrator).load();

        if (classType.STYLES_URL) {
            this.mountStyles(classType.name);
        }

        return new Component(elementRegistrator.componentIndex, elementRegistrator.rootElement, elementRegistrator.getElementMap());
    }

    mountStyles(name) {
        if (this.stylesRegistry.contains(name)) {
            CanvasStyles.setStyle(name, this.stylesRegistry.get(name));
        }
    }

}

let templateComponentCounter = 0;

class TrailIteration {

    /**
     * @param {TrailNode} trailNode 
     * @param {TrailNode[]} trailNodePath 
     */
    constructor(trailNode = null, trailNodePath = []) {
        /** @type {TrailNode} */
        this.trailNode = trailNode;

        /** @type {TrailNode[]} */
        this.trailNodePath = trailNodePath;
    }

}

new coreutil_v1.Logger("TrailProcessor");

class TrailProcessor {

    /**
     * UI refers to the web application. UI navigation means any operation
     * performed within the web app which should trigger a navigation change.
     * 
     * A UI navigation change will update the browser history (push a new url state)
     * as this does not happen through browser controls (back/forward buttons/url bar).
     * 
     * @param {function} fun 
     * @param {any} currentObject
     * @param {TrailNode} trailNode 
     * @param {boolean} replaceCurrentUrl
     * @param {boolean} includeWaypoints
     * @returns {any}
     */
    static uiNavigate(fun, currentObject, trailNode, replaceCurrentUrl = false, includeWaypoints = false) {
        const trailNodesPath = TrailProcessor.nodesPathByFunction(fun, trailNode);

        let response = null;

        if (!trailNodesPath) {
            return response;
        }

        let currentTrail = "";
        for (const trailNode of trailNodesPath) {

            if (!trailNode.trail) {
                throw new Error("TrailProcessor.uiNavigate: TrailNode in path has no trail defined");
            }

            currentTrail += trailNode.trail;

            if (trailNode.property && currentObject[trailNode.property]) {
                currentObject = currentObject[trailNode.property];
            }
            if (trailNode.waypoint) {
                response = trailNode.waypoint.call(currentObject);
            }
            if (includeWaypoints) {
                const url = UrlBuilder.create().withUrl(containerbridge_v1.ContainerUrl.currentUrl()).withAnchor(currentTrail).build();
                History.pushUrl(url, url.toString(), null);
            }
        }

        if (!includeWaypoints) {
            const url = UrlBuilder.create().withUrl(containerbridge_v1.ContainerUrl.currentUrl()).withAnchor(currentTrail).build();
            if (replaceCurrentUrl) {
                History.replaceUrl(url, url.toString(), null);
            } else {    
                History.pushUrl(url, url.toString(), null);
            }
            
        }

        return response;
    }

    /**
     * Client refers to the browser or container hosting the web application.
     * A client navigation means the user has performed a navigation action from
     * the browser controls (back/forward buttons/url bar).
     * 
     * The necessary functions along the trail are triggered to bring the application
     * to the correct state. But the browser history is not updated as this navigation
     * originates from the browser controls.
     * 
     * @param {Url} url 
     * @param {any} currentObject
     * @param {TrailNode} trailNode
     * @returns {any}
     */
    static clientNavigate(url, currentObject, trailNode) {
        const trailNodesPath = TrailProcessor.nodesPathByTrail(url.anchor, trailNode);

        let response = null;

        if (!trailNodesPath) {
            return response;
        }

        for (const trailNode of trailNodesPath) {

            if (trailNode.property) {
                currentObject = currentObject[trailNode.property];
            }
            if (trailNode.waypoint) {
                response = trailNode.waypoint.call(currentObject);
            }
        }

        return response;
    }

    /**
     * @param {function} theFunction 
     * @param {TrailNode} root 
     * @returns {TrailNode[]}
     */
    static nodesPathByFunction(theFunction, root) {

        if (!root) return null;
        
        const iteration = new TrailIteration(root, [root]);
        const stack = [iteration];

        while (stack.length > 0) {
            const currentIteration = stack.pop();

            if (currentIteration.trailNode.destination === theFunction) {
                return currentIteration.trailNodePath;
            }

            if (currentIteration.trailNode.next && currentIteration.trailNode.next.length > 0) {
                for (let i = currentIteration.trailNode.next.length - 1; i >= 0; i--) {
                    const child = currentIteration.trailNode.next[i];
                    stack.push(new TrailIteration(child, [...currentIteration.trailNodePath, child]));
                }
            }
        }
        return null;
    }

    /**
     * @param {function} trail 
     * @param {TrailNode} root 
     * @returns {TrailNode[]}
     */
    static nodesPathByTrail(trail, root) {

        if (!root) return null;
        
        const iteration = new TrailIteration(root, [root]);
        const stack = [iteration];

        while (stack.length > 0) {
            const currentIteration = stack.pop();

            let currentTrail = "";
            currentIteration.trailNodePath.forEach((node) => {
                currentTrail += node.trail;
            });

            if (currentTrail === trail) {
                return currentIteration.trailNodePath;
            }

            if (currentIteration.trailNode.next && currentIteration.trailNode.next.length > 0) {
                for (let i = currentIteration.trailNode.next.length - 1; i >= 0; i--) {
                    const child = currentIteration.trailNode.next[i];
                    stack.push(new TrailIteration(child, [...currentIteration.trailNodePath, child]));
                }
            }
        }
        return null;
    }

}

class StyleSelector {
    /**
     * 
     * @param {String} className 
     */
    constructor(className) {

        /** @type {String} */
        this.className = className;

        /** @type {Map<String, String>} */
        this.attributes = new Map();
    }

    /**
     * 
     * @param {String} key
     * @param {String} value
     */
    withAttribute(key, value) {
        this.attributes.set(key, value);
        return this;
    }

    /**
     * 
     * @returns {String}
     */
    toString() {
        let attrString = "";
        this.attributes.forEach((value, key) => {
            attrString += `\t${key}: ${value};\n`;
        });
        return `${this.className} {\n${attrString}}`;
    }

}

class StyleMedia {

    /**
     * 
     * @param {String} media 
     */
    constructor(media) {

        /** @type {String} */
        this.media = media;

        /** @type {Array<StyleSelector>} */
        this.styleSelectorArray = [];
    }

    /**
     * 
     * @param {StyleSelector} styleSelector
     * @returns {StyleMedia}
     */
    withSelector(styleSelector) {
        this.styleSelectorArray.set(styleSelector);
        return this;
    }

    /**
     * 
     * @returns {String}
     */
    toString() {
        let mediaString = "";
        this.styleSelectorArray.forEach((value) => {
            mediaString += `${value.toString()}\n`;
        });
        return `${this.media} {\n${mediaString}\n}\n`;
    }

}

class StylesheetBuilder {

    /**
     * 
     * @returns {StylesheetBuilder}
     */
    static create() {
        return new StylesheetBuilder();
    }

    constructor() {

        /** @type {StyleSelector[]} */
        this.styleSelectorArray = [];

        /** @type {StyleMedia[]} */
        this.mediaArray = [];

        /** @type {StyleSelector|StyleMedia} */
        this.lastAdded = null;

        /** @type {StyleSelector|StyleMedia} */
        this.context = null;

        /** @type {StyleSelector|StyleMedia} */
        this.parentContext = null;

    }

    open() {
        if (!this.lastAdded) {
            throw new Error("No context to open");
        }
        if (this.lastAdded) {
            if (this.context !== null) {
                this.parentContext = this.context;
            }
            this.context = this.lastAdded;
        }
        return this;
    }

    close() {
        if (this.context === null) {
            throw new Error("No context to close");
        }
        this.context = this.parentContext;
        this.parentContext = null;
        return this;
    }

    /**
     * 
     * @param {String} styleSelectorName 
     * @returns {StylesheetBuilder}
     */
    selector(styleSelectorName) {
        const element = new StyleSelector(styleSelectorName);
        if (this.context === null) {
            this.styleSelectorArray.push(element);
        } else if(this.context instanceof StyleMedia) {
            this.context.styleSelectorArray.push(element);
        } else {
            throw new Error(`Open context must be a media context when adding ${styleSelectorName}`);
        }
        this.lastAdded = element;
        return this;
    }

    media(mediaSelector) {
        if (this.context !== null) {
            throw new Error(`Cannot add media ${mediaSelector} inside open context`);
        }
        const element = new StyleMedia(mediaSelector);
        this.mediaArray.push(element);
        this.lastAdded = element;
        return this;
    }

    /**
     * 
     * @param {String} property 
     * @param {String|Number} value 
     * @returns {StylesheetBuilder}
     */
    style(property, value) {
        if (!(this.context instanceof StyleSelector)) {
            throw new Error(`No open selector context when adding style ${property}`);
        }
        this.context.withAttribute(property, value);
        return this;
    }

    /**
     * 
     * @returns {Stylesheet}
     */
    build() {
        let stylesString = "";
        this.styleSelectorArray.forEach((styleSelector) => {
            stylesString += styleSelector.toString() + "\n";
        });
        this.mediaArray.forEach((styleMedia) => {
            stylesString += styleMedia.toString() + "\n";
        });
        return new Stylesheet(stylesString);
    }

}

class ComponentBuilder {

    /**
     * 
     * @param {UniqueIdRegistry} idRegistry
     * @returns {ComponentBuilder}
     */
    static create(idRegistry) {
        return new ComponentBuilder(idRegistry);
    }

    /**
     * @param {UniqueIdRegistry} idRegistry
     */
    constructor(idRegistry) {

        /** @type {UniqueIdRegistry} */
        this.idRegistry = idRegistry;

        /** @type {Map<String, BaseElement>} */
        this.elementMap = new Map();

        /** @type {BaseElement} */
        this.rootElement = null;

        /** @type {BaseElement} */
        this.lastAddedElement = null;

        /** @type {BaseElement} */
        this.contextElement = null;

        /** @type {BaseElement[]} */
        this.trail = [];

    }

    /**
     * 
     * @param {UniqueIdRegistry} idRegistry
     * @param {Map<String, BaseElement>} elementMap
     * @param {String} tag 
     * @param {String[]} attributeArray 
     * @returns {BaseElement}
     */
    static tag(idRegistry, elementMap, tag, ...attributeArray) {

        const attributeMap = new Map();
        attributeArray.forEach(attr => {
           const [key, value] = attr.split("=");
           attributeMap.set(key, value);
        });

        /** @type {BaseElement} */
        const element = HTML.custom(tag, attributeMap);

        attributeMap.forEach((value, key) => {
            if ("id" === key) {
                elementMap.set(value, element);
                value = idRegistry.idAttributeWithSuffix(value);
            }
            element.setAttributeValue(key, value);
        });

        return element;
    }

    /**
     * 
     * @param {String} tag 
     * @param  {String[]} attributeArray 
     * @returns 
     */
    root(tag, ...attributeArray) {
        if (this.rootElement) {
            throw new Error("ComponentBuilder: Root element is already defined.");
        }
        this.rootElement = ComponentBuilder.tag(this.idRegistry, this.elementMap, tag, ...attributeArray);
        this.lastAddedElement = this.rootElement;
        this.contextElement = this.rootElement;
        return this;
    }

    /**
     * 
     * @param {String} tagName 
     * @param  {String[]} attributeArray
     * @returns {ComponentBuilder}
     */
    node(tagName, ...attributeArray) {
        if (!this.rootElement) {
            throw new Error("ComponentBuilder: Root element is not defined. Call root() before adding child elements.");
        }
        if (this.trail.length === 0) {
            throw new Error("ComponentBuilder: No open element context to add child elements, call open() before adding.");
        }
        const element = ComponentBuilder.tag(this.idRegistry, this.elementMap, tagName, ...attributeArray);
        this.contextElement.addChild(element);
        this.lastAddedElement = element;
        return this;
    }

    /**
     * 
     * @param {String} text 
     * @returns {ComponentBuilder}
     */
    text(text) {
        if (!this.rootElement) {
            throw new Error("ComponentBuilder: Root element is not defined. Call root() before adding child elements.");
        }
        if (this.trail.length === 0) {
            throw new Error("ComponentBuilder: No open element context to add child elements, call open() before adding.");
        }
        this.contextElement.addChild(text);
        this.lastAddedElement = null;
        return this;
    }

    open() {
        if (!this.rootElement) {
            throw new Error("ComponentBuilder: Root element is not defined. Call root() before adding child elements.");
        }
        if (this.lastAddedElement === null) {
            throw new Error("ComponentBuilder: Unable to open last element.");
        }
        this.trail.push(this.contextElement);
        this.contextElement = this.lastAddedElement;
        return this;
    }

    close() {
        if (this.trail.length === 0) {
            throw new Error("ComponentBuilder: No open element context to close.");
        }
        this.contextElement = this.trail.pop();
        this.lastAddedElement = this.contextElement;
        return this;
    }

    build() {
        return new Component(componentBuilderCounter++, this.rootElement, this.elementMap);
    }
}

let componentBuilderCounter = 0;

class InlineComponentFactory extends ComponentFactory {

    constructor() {
        super();

        /** @type {StylesRegistry} */
        this.stylesRegistry = mindi_v1.InjectionPoint.instance(StylesRegistry);

        /** @type {UniqueIdRegistry} */
        this.uniqueIdRegistry = mindi_v1.InjectionPoint.instance(UniqueIdRegistry);
    }

    /**
     * 
     * @param {function} classType represents the inline component class
     */
    create(classType){
        if (!classType.buildComponent) {
            throw new Error("Inline component class must implement static method buildComponent()");
        }

        /** @type {Component} */
        const component = classType.buildComponent(ComponentBuilder.create(this.uniqueIdRegistry));

        if (classType.buildStylesheet) {
            /** @type {String} */
            const stylesheet = classType.buildStylesheet(StylesheetBuilder.create());

            CanvasStyles.setStyle(classType.name, stylesheet);
        }
        return component;
    }

}

const LOG$4 = new coreutil_v1.Logger("Application");

class Application extends ModuleRunner {

    /**
     * 
     * @param {Array<ModuleLoader>} moduleLoaderArray 
     * @param {Config} config 
     * @param {Array} workerArray 
     */
    constructor(moduleLoaderArray, config = new mindi_v1.MindiConfig(), workerArray = new Array()) {

        super();

        /** @type {Array<ModuleLoader>} */
        this.moduleLoaderArray = moduleLoaderArray;

        /** @type {MindiConfig} */
        this.config = config;

        /** @type {Array} */
        this.workerArray = workerArray;

        /** @type {Array} */
        this.runningWorkers = new Array();

        /** @type {Module} */
        this.activeModule = null;

        this.defaultConfig = [
            mindi_v1.SingletonConfig.unnamed(TemplateRegistry),
            mindi_v1.SingletonConfig.unnamed(StylesRegistry),
            mindi_v1.SingletonConfig.unnamed(UniqueIdRegistry),
            mindi_v1.SingletonConfig.unnamed(TemplateComponentFactory),
            mindi_v1.SingletonConfig.unnamed(InlineComponentFactory),
            mindi_v1.PrototypeConfig.unnamed(StateManager)
        ];

        this.defaultConfigProcessors = [ ComponentConfigProcessor ];

        this.defaultInstanceProcessors = [ mindi_v1.InstancePostConfigTrigger ];

    }

    async run() {
        LOG$4.info("Running Application");
        this.config
            .addAllTypeConfig(this.defaultConfig)
            .addAllConfigProcessor(this.defaultConfigProcessors)
            .addAllInstanceProcessor(this.defaultInstanceProcessors);
        ActiveModuleRunner.instance().set(this);
        containerbridge_v1.ContainerUrl.addUserNavigateListener(new coreutil_v1.Method(this.update, this));
        const module = await this.runModule(History.currentUrl());
        this.startWorkers();
        return module;
    }

    /**
     * 
     * @param {ContainerEvent} event
     */
    update(event) {
        const url = History.currentUrl();
        LOG$4.info("Application: update to " + url.toString());
        if (this.activeModule && this.activeModule.trailMap && coreutil_v1.StringUtils.startsWith(url.anchor, this.activeModule.trailMap.trail)) {
            TrailProcessor.clientNavigate(url, this.activeModule, this.activeModule.trailMap);
            return;
        }
        this.runModule(url);
    }

    /**
     * 
     * @param {Url} url 
     * @returns 
     */
    async runModule(url) {
        try {
            const moduleLoader = this.getMatchingModuleLoader(url);
            this.activeModule = await moduleLoader.load();
            this.activeModule.url = url;
            this.activeModule.load();
            if (this.activeModule.trailMap) {
                TrailProcessor.clientNavigate(url, this.activeModule, this.activeModule.trailMap);
            }
            return this.activeModule;
        } catch(error) {
            LOG$4.error(error);
            return null;
        }
    }

    startWorkers() {
        if (this.runningWorkers.length > 0) {
            return;
        }
        const config = this.config;
        const runningWorkers = this.runningWorkers;
        this.workerArray.forEach((value) => {
            const instance = new value();
            mindi_v1.MindiInjector.inject(instance, config);
            coreutil_v1.ArrayUtils.add(runningWorkers, instance);
        });
    }

    /**
     * @param {Url} url
     * @returns {DiModuleLoader}
     */
    getMatchingModuleLoader(url) {
        let foundModuleLoader = null;
        this.moduleLoaderArray.forEach((value) => {
            if (!foundModuleLoader && value.matches(url)) {
                foundModuleLoader = value;
            }
        });
        return foundModuleLoader;
    }

    /**
     * Enable global access to dependency injection config
     */
    windowDiConfig() {
        window.diConfig = () => {
            LOG$4.info(this.config.configEntries);
        };
    }

    /**
     * Enable global access to template registry
     */
    windowTemplateRegistry() {
        window.templateRegistry = () => {
            const typeConfig = mindi_v1.ConfigAccessor.typeConfigByName(TemplateRegistry.name, this.config);
            LOG$4.info(typeConfig.instanceHolder().instance);
        };
    }

    /**
     * Enable global access to style registry
     */
    windowStyleRegistry() {
        window.styleRegistry = () => {
            const typeConfig = mindi_v1.ConfigAccessor.typeConfigByName(StylesRegistry.name, this.config);
            LOG$4.info(typeConfig.instanceHolder().instance);
        };
    }

}

/** @type {Map} */
let configuredFunctionMap = new coreutil_v1.Map();

class ConfiguredFunction {

    /**
     * @param {function} theFunction
     */
    static configure(name, theFunction) {
        configuredFunctionMap.set(name, theFunction);
    }

    static execute(name, parameter) {
        return configuredFunctionMap.get(name).call(null, parameter);
    }

}

new coreutil_v1.Logger("InputElementDataBinding");

class InputElementDataBinding {

    constructor(model, validator) {
        this.model = model;
        this.validator = validator;
        this.pullers = new coreutil_v1.List();
        this.pushers = new coreutil_v1.List();
    }

    static link(model, validator) {
        return new InputElementDataBinding(model, validator);
    }

    /**
     * 
     * @param {AbstractInputElement} field 
     */
    to(field) {
        const puller = () => {
            const modelValue = coreutil_v1.PropertyAccessor.getValue(this.model, field.name);
            if (modelValue !== field.value) {
                coreutil_v1.PropertyAccessor.setValue(this.model, field.name, field.value);
            }
            if (this.validator && this.validator.validate){
                this.validator.validate(field.value);
            }
        };
        field.listenTo("change", puller, this);
        field.listenTo("keyup", puller, this);

        const pusher = () => {
            const modelValue = coreutil_v1.PropertyAccessor.getValue(this.model, field.name);
            if (modelValue !== field.value) {
                field.value = modelValue;
            }
            if (this.validator && this.validator.validateSilent && field.value){
                this.validator.validateSilent(field.value);
            }
        };

        let changedFunctionName = "__changed_" + field.name.replace(".","_");
        if (!this.model[changedFunctionName]) {
            this.model[changedFunctionName] = () => {
                this.push();
            };
        }

        this.pullers.add(puller);
        this.pushers.add(pusher);

        let modelValue = coreutil_v1.PropertyAccessor.getValue(this.model, field.name);

        if (modelValue) {
            pusher.call();
        } else if (field.value) {
            puller.call();
        }

        return this;
    }

    /**
     * 
     * @param {AbstractInputElement} field 
     */
    and(field) {
        return this.to(field);
    }

    pull() {
        this.pullers.forEach((value, parent) => {
            value.call(parent);
            return true;
        }, this);
    }

    push() {
        this.pushers.forEach((value, parent) => {
            value.call(parent);
            return true;
        }, this);
    }
}

class Event {

    /**
     * 
     * @param {Event} event 
     */
    constructor(event) {

        /** @type {Event} */
        this.event = event;
        if (this.event.type.toLowerCase() == "dragstart"){
            this.event.dataTransfer.setData('text/plain', null);
        }
    }

    stopPropagation() {
        this.event.stopPropagation();
    }

    preventDefault() {
        this.event.preventDefault();
    }

    get files() {
        if (this.event.target && this.event.target.files) {
            return this.event.target.files;
        }
        if (this.event.dataTransfer) {
            /** @type {DataTransfer} */
            const dataTransfer = this.event.dataTransfer;
            if (dataTransfer.files) {
                return dataTransfer.files;
            }
        }
        return [];
    }

    /**
     * The distance between the event and the edge x coordinate of the containing object
     */
    get offsetX() {
        return this.event.offsetX;
    }

    /**
     * The distance between the event and the edge y coordinate of the containing object
     */
    get offsetY(){
        return this.event.offsetY;
    }

    /**
     * The mouse x coordinate of the event relative to the client window view
     */
    get clientX() {
        return this.event.clientX;
    }

    /**
     * The mouse y coordinate of the event relative to the client window view
     */
    get clientY() {
        return this.event.clientY;
    }

    /**
     * 
     * @returns {SimpleElement}
     */
    get target() {
        if (this.event && this.event.target) {
            return ConfiguredFunction.execute("mapElement", this.event.target);
        }
    }

    /**
     * 
     * @returns {SimpleElement}
     */
    get relatedTarget() {
        if (this.event && this.event.relatedTarget) {
            return ConfiguredFunction.execute("mapElement", this.event.relatedTarget);
        }
        return null;
    }

    /**
     * 
     * @returns {string}
     */
     getRelatedTargetAttribute(attributeName) {
        if (this.event.relatedTarget) {
            return ConfiguredFunction.execute("mapElement", this.event.relatedTarget).getAttributeValue(attributeName);
        }
        return null;
    }

    get targetValue() {
        if(this.target) { 
            return this.target.value;
        }
        return null;
    }

    get keyCode() {
        return this.event.keyCode;
    }

    isKeyCode(code) {
        return this.event.keyCode === code;
    }

}

/**
 * Object Function which is called if the filter function returns true
 */
class EventFilteredMethod extends coreutil_v1.Method {

    /**
     * Contructor
     * @param {Method} method 
     * @param {function} theFilter 
     */
    constructor(method, filter){
        this.method = method;
        this.filter = filter;
    }

    call(params){
        if(this.filter && this.filter.call(this,params)) {
            this.method.call(params);
        }
    }

}

const LOG$3 = new coreutil_v1.Logger("EventManager");

/**
 * EventManager
 */
class EventManager {


    /**
     * 
     */
    constructor() {
        /** @type Map<List<Method>> */
        this.listenerMap = new coreutil_v1.Map();
    }

    /**
     * 
     * @param {string} eventType 
     * @param {Function} listenerFunction
     * @param {Object} contextObject
     * @returns {EventManager}
     */
    listenTo(eventType, listenerFunction, contextObject) {
        const listener = new coreutil_v1.Method(listenerFunction, contextObject);
        if (!this.listenerMap.contains(eventType)) {
            this.listenerMap.set(eventType, new coreutil_v1.List());
        }
        this.listenerMap.get(eventType).add(listener);
        return this;
    }

    /**
     * 
     * @param {string} eventType 
     * @param {Array|any} parameter 
     */
    async trigger(eventType, parameter) {
        if (!eventType) {
            LOG$3.error("Event type is undefined");
            return;
        }
        if (!this.listenerMap.contains(eventType)) {
            return;
        }
        let resultArray = [];
        this.listenerMap.get(eventType).forEach((listener, parent) => {
            resultArray.push(listener.call(parameter));
            return true;
        });
        if (resultArray.length === 1) {
            return resultArray[0];
        }
        return Promise.all(resultArray);
    }

}

class Css3StylesheetBuilder {

    /**
     * 
     * @returns {Css3StylesheetBuilder}
     */
    static create() {
        return new Css3StylesheetBuilder();
    }

    constructor() {

        /** @type {StylesheetBuilder} */
        this.stylesheetBuilder = StylesheetBuilder.create();

    }

    /**
     * @param {String} selector 
     * @returns {Css3StylesheetBuilder}
     */
    selector(selector) {
        if (this.stylesheetBuilder.context instanceof StyleSelector) {
            this.stylesheetBuilder.close();
        }
        this.stylesheetBuilder.selector(selector);
        this.stylesheetBuilder.open();
        return this;
    }

    /**
     * @param {String} minWidth 
     * @param {String} maxWidth 
     * @returns {Css3StylesheetBuilder}
     */
    media(minWidth, maxWidth) {
        if (this.stylesheetBuilder.context instanceof StyleSelector) {
            this.stylesheetBuilder.close();
        }
        if (this.stylesheetBuilder.context instanceof StyleMedia) {
            this.stylesheetBuilder.close();
        }
        const mediaQuery = `@media${minWidth ? ` (min-width: ${minWidth})` : ""}${minWidth && maxWidth ? " and" : ""}${maxWidth ? ` (max-width: ${maxWidth})` : ""}`;
        this.stylesheetBuilder.media(mediaQuery);
        this.stylesheetBuilder.open();
        return this;
    }

    /**
     * @param {String} width 
     * @returns {Css3StylesheetBuilder}
     */
    width(width) {
        this.stylesheetBuilder.style("width", width);
        return this;
    }

    /**
     * @param {String} minWidth 
     * @returns {Css3StylesheetBuilder}
     */
    minWidth(minWidth) {
        this.stylesheetBuilder.style("min-width", minWidth);
        return this;
    }

    /**
     * @param {String} maxWidth 
     * @returns {Css3StylesheetBuilder}
     */
    maxWidth(maxWidth) {
        this.stylesheetBuilder.style("max-width", maxWidth);
        return this;
    }

    /**
     * @param {String} height 
     * @returns {Css3StylesheetBuilder}
     */
    height(height) {
        this.stylesheetBuilder.style("height", height);
        return this;
    }

    /**
     * @param {String} minHeight 
     * @returns {Css3StylesheetBuilder}
     */
    minHeight(minHeight) {
        this.stylesheetBuilder.style("min-height", minHeight);
        return this;
    }
    
    /**
     * @param {String} maxHeight 
     * @returns {Css3StylesheetBuilder}
     */
    maxHeight(maxHeight) {
        this.stylesheetBuilder.style("max-height", maxHeight);
        return this;
    }

    /**
     * @param {String} lineHeight
     * @returns {Css3StylesheetBuilder}
     */

    lineHeight(lineHeight) {
        this.stylesheetBuilder.style("line-height", lineHeight);
        return this;
    }

    /**
     * @param {String} fontSize
     * @returns {Css3StylesheetBuilder}
     */
    fontSize(fontSize) {
        this.stylesheetBuilder.style("font-size", fontSize);
        return this;
    }

    /**
     * @param {String} grow Grows relative to the other flex items in the container when there is extra space. E.g. grow of 1 vs grow of 2, the second item will grow twice as much.
     * @param {String} shrink Shrinks relative to the other flex items in the container when not enough space. E.g. shrink of 1 vs shrink of 2, the second item will shrink twice as much.
     * @param {String} basis Initial main size. E.g "100px", "20%", "auto". Default value is "auto", sized according to its content. If "0", sized based on grow and shrink.
     * @returns {Css3StylesheetBuilder}
     */
    flex(grow, shrink, basis) {
        const value = `${grow} ${shrink} ${basis}`;
        this.stylesheetBuilder.style("flex", value);
        return this;
    }

    /**
     * @param {String} direction E.g "row", "column", "row-reverse", "column-reverse"
     * @returns {Css3StylesheetBuilder}
     */
    flexDirection(direction) {
        this.stylesheetBuilder.style("flex-direction", direction);
        return this;
    }

    /**
     * @param {String} alignItems E.g. "stretch", "center", "flex-start", "flex-end", "baseline"
     * @returns {Css3StylesheetBuilder}
     */
    alignItems(alignItems) {
        this.stylesheetBuilder.style("align-items", alignItems);
        return this;
    }

    /**
     * @param {String} position E.g. "static", "relative", "absolute", "fixed", "sticky"
     * @returns {Css3StylesheetBuilder}
     */
    position(position) {
        this.stylesheetBuilder.style("position", position);
        return this;
    }

    /**
     * 
     * @param {String} bottom 
     * @returns {Css3StylesheetBuilder}
     */
    bottom(bottom) {
        this.stylesheetBuilder.style("bottom", bottom);
        return this;
    }
    
    /**
     * 
     * @param {String} right 
     * @returns {Css3StylesheetBuilder}
     */
    right(right) {
        this.stylesheetBuilder.style("right", right);
        return this;
    }

    /**
     * 
     * @param {String} top 
     * @returns {Css3StylesheetBuilder}
     */
    top(top) {
        this.stylesheetBuilder.style("top", top);
        return this;
    }

    /**
     * 
     * @param {String} left 
     * @returns {Css3StylesheetBuilder}
     */
    left(left) {
        this.stylesheetBuilder.style("left", left);
        return this;
    }

    /**
     * @param {String} display E.g. "block", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "none"
     * @returns {Css3StylesheetBuilder}
     */
    display(display) {
        this.stylesheetBuilder.style("display", display);
        return this;
    }

    /**
     * @param {String} top 
     * @param {String} right 
     * @param {String} bottom 
     * @param {String} left 
     * @returns {Css3StylesheetBuilder}
     */
    padding(top, right, bottom, left) {
        if (top && !right && !bottom && !left) {
            const value = `${top} ${right} ${bottom} ${left}`;
            this.stylesheetBuilder.style("padding", value);
            return this;
        }
        if (top) {
            this.stylesheetBuilder.style("padding-top", top);
        }
        if (right) {
            this.stylesheetBuilder.style("padding-right", right);
        }
        if (bottom) {
            this.stylesheetBuilder.style("padding-bottom", bottom);
        }
        if (left) {
            this.stylesheetBuilder.style("padding-left", left);
        }
        return this;
    }

    /**
     * 
     * @param {String} top 
     * @param {String} right 
     * @param {String} bottom 
     * @param {String} left 
     * @returns {Css3StylesheetBuilder}
     */
    margin(top, right, bottom, left) {
        if (top && !right && !bottom && !left) {
            const value = `${top} ${right} ${bottom} ${left}`;
            this.stylesheetBuilder.style("margin", value);
            return this;
        }
        if (top) {
            this.stylesheetBuilder.style("margin-top", top);
        }
        if (right) {
            this.stylesheetBuilder.style("margin-right", right);
        }
        if (bottom) {
            this.stylesheetBuilder.style("margin-bottom", bottom);
        }
        if (left) {
            this.stylesheetBuilder.style("margin-left", left);
        }
        return this;
    }

    /**
     * @param {String} color 
     * @returns {Css3StylesheetBuilder}
     */
    backgroundColor(color) {
        this.stylesheetBuilder.style("background-color", color);
        return this;
    }

    /**
     * @param {String} background
     * @returns {Css3StylesheetBuilder}
     */
    background(background) {
        this.stylesheetBuilder.style("background", background);
        return this;
    }

    /**
     * @param {String} backgroundPosition
     * @returns {Css3StylesheetBuilder}
     */
    backgroundPosition(backgroundPosition) {
        this.stylesheetBuilder.style("background-position", backgroundPosition);
        return this;
    }

    /**
     * @param {String} overflowX E.g. "visible", "hidden", "scroll", "auto"
     * @param {String} overflowY E.g. "visible", "hidden", "scroll", "auto"
     * @returns {Css3StylesheetBuilder}
     */
    overflow(overflowX, overflowY) {
        if (overflowX) {
            this.stylesheetBuilder.style("overflow-x", overflowX);
        }
        if (overflowY) {
            this.stylesheetBuilder.style("overflow-y", overflowY);
        }
        return this;
    }

    /**
     * @param {String} boxSizing E.g. "content-box", "border-box"
     * @returns {Css3StylesheetBuilder}
     */
    boxSizing(boxSizing) {
        this.stylesheetBuilder.style("box-sizing", boxSizing);
        return this;
    }

    /**
     * @param {String} property
     * @param {String} duration
     * @param {String} timingFunction
     * @returns {Css3StylesheetBuilder}
     */

    transition(property, duration, timingFunction) {
        const value = `${property} ${duration} ${timingFunction}`;
        this.stylesheetBuilder.style("transition", value);
        return this;
    }

    build() {
        if (this.stylesheetBuilder.context !== null) {
            this.stylesheetBuilder.close(); 
        }
        return this.stylesheetBuilder.build();
    }

}

class StyleAccessor {
    
    /**
     * @type {BaseElement}
     * @return {StyleAccessor}
     */
    static from(baseElement) {
        return new StyleAccessor(baseElement);
    }

    /**
     * 
     * @param {BaseElement} baseElement 
     */
    constructor(baseElement) {
        /** @type {BaseElement} */
        this.baseElement = baseElement;
    }

    clear() {
        this.baseElement.setAttributeValue("style", "");
        return this;
    }

    /**
     * 
     * @param {String} styleName 
     */
    remove(styleName) {
        const currentStyleMap = this.stylesAsMap(this.baseElement.getAttributeValue("style"));
        if (currentStyleMap.contains(styleName)) {
            currentStyleMap.remove(styleName);
        }
        this.baseElement.setAttributeValue("style", coreutil_v1.MapUtils.toString(currentStyleMap, ":", ";"));
        return this;
    }

    /**
     * 
     * @param {String} styleName 
     * @param {String} styleValue 
     */
    set(styleName, styleValue) {
        const currentStyleMap = this.stylesAsMap(this.baseElement.getAttributeValue("style"));
        currentStyleMap.set(styleName, styleValue);
        this.baseElement.setAttributeValue("style", coreutil_v1.MapUtils.toString(currentStyleMap, ":", ";"));
        return this;
    }

    /**
     * 
     * @param {String} styleName 
     * @param {String} styleValue 
     */
    is(styleName, styleValue) {
        const currentStyleMap = this.stylesAsMap(this.baseElement.getAttributeValue("style"));
        return coreutil_v1.StringUtils.nonNullEquals(currentStyleMap.get(styleName), styleValue);
    }
    
    /**
     * 
     * @param {String} styleName 
     */
    exists(styleName) {
        const currentStyleMap = this.stylesAsMap(this.baseElement.getAttributeValue("style"));
        return currentStyleMap.contains(styleName);
    }

    stylesAsMap(styles) {
        if (!styles || styles.indexOf(":") === -1) {
            return new coreutil_v1.Map();
        }

        const currentStyleMap = new coreutil_v1.Map();

        const currentStylePairList = new coreutil_v1.List(coreutil_v1.StringUtils.toArray(styles, ";"));
        currentStylePairList.forEach((value, parent) => {
            if (!value || value.indexOf(":") === -1) {
                return;
            }
            const resolvedKey = value.split(":")[0].trim();
            const resolvedValue = value.split(":")[1].trim();
            currentStyleMap.set(resolvedKey, resolvedValue);
            return true;
        }, this);
        return currentStyleMap;
    }

}

class StyleSelectorAccessor {
    
    /**
     * @type {BaseElement}
     * @return {StyleSelectorAccessor}
     */
    static from(baseElement) {
        return new StyleSelectorAccessor(baseElement);
    }

    /**
     * 
     * @param {BaseElement} baseElement 
     */
    constructor(baseElement) {
        /** @type {BaseElement} */
        this.baseElement = baseElement;
    }

    clear() {
        this.baseElement.setAttributeValue("class", "");
        return this;
    }

    /**
     * 
     * @param {String} cssClass 
     */
    toggle(cssClass) {
        let currentClass = this.baseElement.getAttributeValue("class");
        let currentClassArray = coreutil_v1.StringUtils.toArray(currentClass, " ");
        let currentClassList = new coreutil_v1.List(currentClassArray);
        
        if (currentClassList.contains(cssClass)) {
            currentClassList.remove(cssClass);
        } else {
            currentClassList.add(cssClass);
        }
        
        this.baseElement.setAttributeValue("class", coreutil_v1.ArrayUtils.toString(currentClassList.getArray(), " "));
        return this;
    }

    /**
     * 
     * @param {String} cssClass 
     */
    enable(cssClass) {
        let currentClass = this.baseElement.getAttributeValue("class");
        let currentClassArray = coreutil_v1.StringUtils.toArray(currentClass, " ");
        let currentClassList = new coreutil_v1.List(currentClassArray);
        
        if (!currentClassList.contains(cssClass)) {
            currentClassList.add(cssClass);
        }
        
        this.baseElement.setAttributeValue("class", coreutil_v1.ArrayUtils.toString(currentClassList.getArray(), " "));
        return this;
    }

    /**
     * 
     * @param {String} cssClass 
     */
    disable(cssClass) {
        let currentClass = this.baseElement.getAttributeValue("class");
        let currentClassArray = coreutil_v1.StringUtils.toArray(currentClass, " ");
        let currentClassList = new coreutil_v1.List(currentClassArray);
        
        if (currentClassList.contains(cssClass)) {
            currentClassList.remove(cssClass);
        }

        this.baseElement.setAttributeValue("class", coreutil_v1.ArrayUtils.toString(currentClassList.getArray(), " "));
        return this;
    }

    /**
     * 
     * @param {String} cssClassRemovalPrefix 
     * @param {String} cssClass
     */
    replace(cssClassRemovalPrefix, cssClass) {
        let currentClass = this.baseElement.getAttributeValue("class");
        let currentClassArray = coreutil_v1.StringUtils.toArray(currentClass, " ");
        let currentClassList = new coreutil_v1.List(currentClassArray);
        let toRemoveArray = [];

        if (!coreutil_v1.StringUtils.isBlank(cssClassRemovalPrefix)) {
            currentClassList.forEach((value) => {
                if (value.startsWith(cssClassRemovalPrefix)) {
                    toRemoveArray.push(value);
                }
                return true;
            }, this);
        }

        toRemoveArray.forEach((toRemoveValue) => {
            currentClassList.remove(toRemoveValue);
        });

        currentClassList.add(cssClass);
        this.baseElement.setAttributeValue("class", coreutil_v1.ArrayUtils.toString(currentClassList.getArray(), " "));
        return this;
    }

    

}

new coreutil_v1.Logger("HttpCallBuilder");

/**
 * @template T
 */
class HttpCallBuilder {

    /**
     * 
     * @param {string} url 
     */
    constructor(url) {

        /** @type {String} */
        this.url = url;

        /** @type {String} */
        this.authorization = null;

        /** @type {Map} */
        this.successMappingMap = new coreutil_v1.Map();

        /** @type {Map} */
        this.failMappingMap = new coreutil_v1.Map();

        /** @type {function} */
        this.errorMappingFunction = (error) => { return error; };

        /** @type {number} */
        this.connectionTimeoutValue = 4000;

        /** @type {number} */
        this.responseTimeoutValue = 4000;

        /** @type {Method} */
        this.progressCallbackMethod = null;

        /** @type {boolean} */
        this.downloadResponse = false;

    }

    /**
     * 
     * @param {string} url 
     * @returns {HttpCallBuilder}
     */
    static newInstance(url) {
        return new HttpCallBuilder(url);
    }

    /**
     * 
     * @param {Number} code 
     * @param {function} mapperFunction mapper function to pass the result object to
     * @return {HttpCallBuilder}
     */
    successMapping(code, mapperFunction = () => { return null; }) {
        this.successMappingMap.set(code, mapperFunction);
        return this;
    }

    /**
     * 
     * @returns {HttpCallBuilder<ContainerDownload>}
     */
    asDownload() {
        this.downloadResponse = true;
        return this;
    }

    /**
     * 
     * @param {Number} code 
     * @param {function} mapperFunction mapper function to pass the result object to
     * @return {HttpCallBuilder}
     */
    failMapping(code, mapperFunction = () => { return null; }) {
        this.failMappingMap.set(code, mapperFunction);
        return this;
    }

    /**
     * 
     * @param {function} mapperFunction mapper function to pass the result object to
     * @return {HttpCallBuilder}
     */
    errorMapping(mapperFunction) {
        this.errorMappingFunction = mapperFunction;
        return this;
    }

    /**
     * 
     * @param {string} authorization 
     * @return {HttpCallBuilder}
     */
    authorizationHeader(authorization) {
        if (!coreutil_v1.StringUtils.isBlank(authorization)) {
            this.authorization = "Bearer " + authorization;
        }
        return this;
    }

    /**
     * 
     * @param {Method} progressCallbackMethod 
     * @returns {HttpCallBuilder}
     */
    progressCallback(progressCallbackMethod) {
        this.progressCallbackMethod = progressCallbackMethod;
        return this;
    }

    /**
     * 
     * @param {Number} connectionTimeoutValue 
     * @returns {HttpCallBuilder}
     */
    connectionTimeout(connectionTimeoutValue) {
        this.connectionTimeoutValue = connectionTimeoutValue;
        return this;
    }

    /**
     * 
     * @param {Number} responseTimeoutValue 
     * @returns {HttpCallBuilder}
     */
    responseTimeout(responseTimeoutValue) {
        this.responseTimeoutValue = responseTimeoutValue;
        return this;
    }

    /**
     * @returns {Promise<T>}
     */
    async get() {
        const response = Client.get(this.url, this.authorization, this.connectionTimeoutValue, this.downloadResponse);
        return this.asTypeMappedPromise(response);
    }

    /**
     * @param {Object|ContainerUploadData} payload
     * @returns {Promise<T>}
     */
    async post(payload) {
        const response = await Client.post(this.url, payload, this.authorization, this.progressCallbackMethod, this.connectionTimeoutValue);
        return this.asTypeMappedPromise(response);
    }

    /**
     * @param {Object|ContainerUploadData} payload
     * @returns {Promise<T>}
     */
    async put(payload) {
        const response = await Client.put(this.url, payload, this.authorization, this.progressCallbackMethod, this.connectionTimeoutValue);
        return this.asTypeMappedPromise(response);
    }

    /**
     * @param {Object|ContainerUploadData} payload
     * @returns {Promise<T>}
     */
    async patch(payload) {
        const response = await Client.patch(this.url, payload, this.authorization, this.progressCallbackMethod, this.connectionTimeoutValue);
        return this.asTypeMappedPromise(response);
    }

    /**
     * @param {Object|ContainerUploadData} payload
     * @returns {Promise<T>}
     */
    async delete(payload = null) {
        const response = await Client.delete(this.url, payload, this.authorization, this.progressCallbackMethod, this.connectionTimeoutValue);
        return this.asTypeMappedPromise(response);
    }

    /**
     * 
     * @param {Promise<ContainerHttpResponse} fetchPromise 
     */
    async asTypeMappedPromise(fetchPromise) {
        try {
            const fetchResponse = await fetchPromise;
            if (fetchResponse instanceof containerbridge_v1.ContainerDownload) {
                return fetchResponse;
            }
            return await this.handleFetchResponse(fetchResponse);
        } catch(error) {
            // API did not execute
            throw this.errorMappingFunction(error);
        }
    }

    /**
     * 
     * @param {ContainerHttpResponse} fetchResponse 
     * @param {function} resolve 
     * @param {function} reject 
     */
    async handleFetchResponse(fetchResponse) {
        const successResponseMapper = this.successMappingMap.get(fetchResponse.status);
        const failResponseMapper = this.failMappingMap.get(fetchResponse.status);

        // Empty response
        if (204 === fetchResponse.status || fetchResponse.headers.get("Content-Length") === "0") {
            if (successResponseMapper) {
                return successResponseMapper(null); 
            }
            if (failResponseMapper) {
                throw failResponseMapper(null);
            }
            throw new Error("Missing mapper for return status: " + fetchResponse.status);
        }

        // Assuming json response      
        try {  
            const responseJson = await fetchResponse.json();
            if (successResponseMapper) { 
                return successResponseMapper(responseJson);
            }
            if (failResponseMapper) {
                throw failResponseMapper(responseJson);
            }
            throw this.errorMappingFunction(responseJson);
        } catch(error) {
            // Response did not provide json
            throw this.errorMappingFunction(error);
        }
    }

}

class QueryParamBuilder {

    constructor() {
        this.params = new Map();
    }

    /**
     * 
     * @returns {QueryParamBuilder}
     */
    static create() {
        return new QueryParamBuilder();
    }

    /**
     * 
     * @param {string} key 
     * @param {string} value 
     * @returns {QueryParamBuilder}
     */
    withString(key, value) {
        this.params.set(key, value);
        return this;
    }

    /**
     * 
     * @param {string} key 
     * @param {Array} valueArray 
     * @returns {QueryParamBuilder}
     */
    withArray(key, valueArray) {
        this.params.set(key, valueArray);
        return this;
    }

    /**
     * 
     * @returns {String}
     */
    build() {
        let queryParam = "";
        let firstParam = true;
        this.params.forEach((value, key) => {
            
            if (Array.isArray(value)) {
                
                value.forEach((item) => {

                    if (!firstParam) {
                        queryParam += "&";
                    } else {
                        firstParam = false;
                    }

                    queryParam += encodeURIComponent(key) + "=" + encodeURIComponent(item);
                });
            } else {

                if (!firstParam) {
                    queryParam += "&";
                } else {
                    firstParam = false;
                }

                queryParam += encodeURIComponent(key) + "=" + encodeURIComponent(value);
            }
        });
        return queryParam;
    }
}

class ShaUtils {

    static async sha256B64(message) {
      const msgBuffer = new TextEncoder().encode(message); // Encode the string as UTF-8
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // Hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
      const base64Hash = btoa(String.fromCharCode(...hashArray)); // Convert bytes to base64 string
      return base64Hash;
    }

}

class ProxyObjectFactory {

    /**
     * Creates a proxy for an object which allows databinding from the object to the form element
     * 
     * @template T
     * @param {T} object 
     * @returns {T}
     */
    static createProxyObject(object) {
        return new Proxy(object, {
            set: (target, prop, value) => {
                let success = (target[prop] = value);

                let changedFunctionName = "__changed_" + prop;
                let changedFunction = target[changedFunctionName];
                if(changedFunction && typeof changedFunction === "function") {
                    let boundChangedFunction = changedFunction.bind(target);
                    boundChangedFunction();
                }
                return success === value;
            }
        });
    }
}

const LOG$2 = new coreutil_v1.Logger("AbstractValidator");

class AbstractValidator {

    /**
     * @param {boolean} isCurrentlyValid
     */
    constructor(currentlyValid = false, enabled = true) {
        this.validListenerList = new coreutil_v1.List();
        this.invalidListenerList = new coreutil_v1.List();
        this.currentlyValid = currentlyValid;
        this.enabled = enabled;
    }

    enable() {
        this.enabled = true;
        if (this.isValid()) {
            this.valid();
        } else {
            this.invalid();
        }
    }

    disable() {
        let wasValid = this.currentlyValid;
        // Fake valid
        this.valid();
        this.enabled = false;
        this.currentlyValid = wasValid;
    }

    isValid() {
        if (!this.enabled) {
            return true;
        }
        return this.currentlyValid;
    }

	valid() {
        if (!this.enabled) {
            return;
        }
        this.currentlyValid = true;
        if(!this.validListenerList) {
            LOG$2.warn("No validation listeners");
            return;
        }
        this.validListenerList.forEach((value, parent) => {
            value.call();
            return true;
        }, this);
	}

	invalid() {
        if (!this.enabled) {
            return;
        }
        this.currentlyValid = false;
        if(!this.invalidListenerList) {
            LOG$2.warn("No invalidation listeners");
            return;
        }
        this.invalidListenerList.forEach((value, parent) => {
            value.call();
            return true;
        }, this);
	}

	validSilent() {
        this.currentlyValid = true;
	}

	invalidSilent() {
        this.currentlyValid = false;
	}

	/**
	 * 
	 * @param {Method} validListener 
	 */
	withValidListener(validListener) {
		this.validListenerList.add(validListener);
		return this;
	}

	/**
	 * 
	 * @param {Method} invalidListener 
	 */
	withInvalidListener(invalidListener) {
		this.invalidListenerList.add(invalidListener);
		return this;
	}

}

class RegexValidator extends AbstractValidator {

    constructor(mandatory = false, iscurrentlyValid = false, regex = "(.*)") {
		super(iscurrentlyValid);
		this.mandatory = mandatory;
        this.regex = regex;
    }

	validate(value){
		if (value && typeof value === "string" && value.match(this.regex)){
	    	this.valid();
		} else {
			if(!value && !this.mandatory) {
				this.valid();
			} else {
				this.invalid();
			}
		}
	}

	validateSilent(value){
		if (value && typeof value === "string" && value.match(this.regex)){
	    	this.validSilent();
		} else {
			if(!value && !this.mandatory) {
				this.validSilent();
			} else {
				this.invalidSilent();
			}
		}
	}

}

class EmailValidator extends RegexValidator {

    static EMAIL_FORMAT = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    constructor(mandatory = false, iscurrentlyValid = false) {
        super(mandatory, iscurrentlyValid, EmailValidator.EMAIL_FORMAT);
    }

}

class EqualsFunctionResultValidator extends AbstractValidator {

	/**
	 * 
	 * @param {boolean} mandatory 
	 * @param {boolean} iscurrentlyValid 
	 * @param {Method} comparedValueFunction 
	 */
    constructor(mandatory = false, iscurrentlyValid = false, comparedValueFunction = null) {
		super(iscurrentlyValid);

		/** @type {boolean} */
		this.mandatory = mandatory;

		/** @type {Method} */
		this.comparedValueFunction = comparedValueFunction;
	}

	validate(value){
		if (!value && this.mandatory) {
			this.invalid();
		} else if(value === this.comparedValueFunction.call()){
	    	this.valid();
		} else {
			this.invalid();
		}
	}

	validateSilent(value){
		if (!value && this.mandatory) {
			this.invalidSilent();
		} else if(value === this.comparedValueFunction.call()){
	    	this.validSilent();
		} else {
			this.invalidSilent();
		}
	}

}

class EqualsPropertyValidator extends AbstractValidator {

	/**
	 * 
	 * @param {boolean} mandatory 
	 * @param {boolean} iscurrentlyValid 
	 * @param {Method} comparedValueFunction 
	 */
    constructor(mandatory = false, iscurrentlyValid = false, model = null, attributeName = null) {
		super(iscurrentlyValid);

		/** @type {boolean} */
		this.mandatory = mandatory;

		/** @type {object} */
        this.model = model;
        
        /** @type {string} */
        this.attributeName = attributeName;
	}

	validate(value){
		if (!value && this.mandatory) {
			this.invalid();
		} else if(value === coreutil_v1.PropertyAccessor.getValue(this.model, this.attributeName)){
	    	this.valid();
		} else {
			this.invalid();
		}
	}

	validateSilent(value){
		if (!value && this.mandatory) {
			this.invalidSilent();
		} else if(value === coreutil_v1.PropertyAccessor.getValue(this.model, this.attributeName)){
	    	this.validSilent();
		} else {
			this.invalidSilent();
		}
	}

}

class EqualsStringValidator extends AbstractValidator {

	/**
	 * 
	 * @param {boolean} mandatory 
	 * @param {boolean} iscurrentlyValid 
	 * @param {Method} comparedValueFunction 
	 */
    constructor(mandatory = false, iscurrentlyValid = false, controlValue = null) {
		super(iscurrentlyValid);

		/** @type {boolean} */
		this.mandatory = mandatory;

        /** @type {string} */
        this.controlValue = controlValue;
	}

	validate(value){
		if (!value && this.mandatory) {
			this.invalid();
		} else if(value === controlValue){
	    	this.valid();
		} else {
			this.invalid();
		}
	}

	validateSilent(value){
		if (!value && this.mandatory) {
			this.invalidSilent();
		} else if(value === controlValue){
	    	this.validSilent();
		} else {
			this.invalidSilent();
		}
	}

}

class NumberValidator extends RegexValidator {

    static PHONE_FORMAT = /^\d*$/;

    constructor(mandatory = false, iscurrentlyValid = false) {
        super(mandatory, iscurrentlyValid, NumberValidator.PHONE_FORMAT);
    }

}

class OrValidatorSet extends AbstractValidator {
    
    constructor(isValidFromStart = false) {
        super(isValidFromStart);
        this.validatorList = new coreutil_v1.List();
    }

    /**
     * @param {AbstractValidator} validator
     */
    withValidator(validator) {
        validator.withValidListener(new coreutil_v1.Method(this.oneValid, this));
        validator.withInvalidListener(new coreutil_v1.Method(this.oneInvalid, this));
        this.validatorList.add(validator);
        return this;
    }

    /**
     * One validator said it was valid
     */
    oneValid() {
        super.valid();
    }

    /**
     * One validator said it was invalid
     */
    oneInvalid() {
        let foundValid = false;
        this.validatorList.forEach((value,parent) => {
            if(value.isValid()) {
                foundValid = true;
                return false;
            }
            return true;
        }, this);
        if(foundValid) {
            super.valid();
        } else {
            super.invalid();
        }
    }

}

const PASSWORD_FORMAT = /^(?=.*[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

class PasswordValidator extends RegexValidator {

    constructor(mandatory = false, iscurrentlyValid = false) {
        super(mandatory, iscurrentlyValid, PASSWORD_FORMAT);
    }

}

class PhoneValidator extends RegexValidator {

    static PHONE_FORMAT = /^\+[0-9]{2}\s?([0-9]\s?)*$/;

    constructor(mandatory = false, iscurrentlyValid = false) {
        super(mandatory, iscurrentlyValid, PhoneValidator.PHONE_FORMAT);
    }

}

class RequiredValidator extends AbstractValidator {

	constructor(currentlyValid = false, enabled = true) {
		super(currentlyValid, enabled);
	}

	validate(value){
		if(value === ""){
	    	this.invalid();
		} else {
			this.valid();
		}
	}

	validateSilent(value){
		if(value === ""){
	    	this.invalidSilent();
		} else {
			this.validSilent();
		}
	}

}

class AndValidatorSet extends AbstractValidator {

    constructor(isValidFromStart = false) {
        super(isValidFromStart);
        this.validatorList = new coreutil_v1.List();
    }

    /**
     * @param {AbstractValidator} validator
     */
    withValidator(validator) {
        validator.withValidListener(new coreutil_v1.Method(this.oneValid, this));
        validator.withInvalidListener(new coreutil_v1.Method(this.oneInvalid, this));
        this.validatorList.add(validator);
        return this;
    }

    /**
     * One validator said it was valid
     */
    oneValid() {
        let foundInvalid = false;
        this.validatorList.forEach((value,parent) => {
            if(!value.isValid()) {
                foundInvalid = true;
                return false;
            }
            return true;
        }, this);
        if(!foundInvalid) {
            super.valid();
        } else {
            super.invalid();
        }
    }

    /**
     * One validator said it was invalid
     */
    oneInvalid() {
        super.invalid();
    }
}

class IdSpace {

    static ID_SPACE_STRING_WIDTH = 17;

    static HW_STRING_PART_WIDTH = 9;
    static EPOCH_SECONDS_STRING_PART_WIDTH = 6;
    static COUNT_STRING_PART_WIDTH = 2;

    constructor(mac = null, epochSeconds = null, counter = null) {
        this.mac = mac;
        this.epochSeconds = epochSeconds;
        this.counter = counter;
    }

    /**
     * 
     * @param {String} idSpaceString 
     * @returns {IdSpace}
     */
    static parse(idSpaceString) {
        if (idSpaceString == null || idSpaceString.length < IdSpace.ID_SPACE_STRING_WIDTH || !coreutil_v1.RadixUtils.isValidRadixString(idSpaceString)) {
            throw Error("ID Space must be at least " + IdSpace.ID_SPACE_STRING_WIDTH + " characters long and contain valid characters.");
        }
        const macString = idSpaceString.substring(0, IdSpace.HW_STRING_PART_WIDTH);
        const epochSecondsString = idSpaceString.substring(
            IdSpace.HW_STRING_PART_WIDTH, 
            IdSpace.HW_STRING_PART_WIDTH + IdSpace.EPOCH_SECONDS_STRING_PART_WIDTH);

        const counterString = idSpaceString.substring(
            IdSpace.HW_STRING_PART_WIDTH + IdSpace.EPOCH_SECONDS_STRING_PART_WIDTH,
            IdSpace.HW_STRING_PART_WIDTH + IdSpace.EPOCH_SECONDS_STRING_PART_WIDTH + IdSpace.COUNT_STRING_PART_WIDTH);

        const mac = coreutil_v1.RadixUtils.fromRadixString(macString);
        const epochSeconds = coreutil_v1.RadixUtils.fromRadixString(epochSecondsString);
        const counter = coreutil_v1.RadixUtils.fromRadixString(counterString);

        return new IdSpace(mac, epochSeconds, counter);
    }

    /**
     * 
     * @returns {String}
     */
    toString() {
        const macString = coreutil_v1.StringUtils.leftPad(coreutil_v1.RadixUtils.toRadixString(this.mac), IdSpace.HW_STRING_PART_WIDTH, '0');
        const epochSecondsString = coreutil_v1.StringUtils.leftPad(coreutil_v1.RadixUtils.toRadixString(this.epochSeconds), IdSpace.EPOCH_SECONDS_STRING_PART_WIDTH, '0');
        const counterString = coreutil_v1.StringUtils.leftPad(coreutil_v1.RadixUtils.toRadixString(this.counter), IdSpace.COUNT_STRING_PART_WIDTH, '0');
        return macString + epochSecondsString + counterString;
    }

    report() {
        const report = new Map();
        report.set("IdSpace [MAC]", coreutil_v1.MacUtils.toMacAddress(this.mac));
        report.set("IdSpace [Epoch]", this.epochSeconds * 1000);
        report.set("IdSpace [Date]", new Date(this.epochSeconds * 1000).toISOString());
        report.set("IdSpace [Counter]", this.counter);
        return report;
    }
}

class UserId {

    static USER_ID_STRING_WIDTH = 9;

    static EPOCH_CENTIS_STRING_PART_WIDTH = 7;
    static COUNT_STRING_PART_WIDTH = 2;

    constructor(epochCentis = null, counter = null) {
        this.epochCentis = epochCentis;
        this.counter = counter;
    }

    /**
     * 
     * @param {String} userIdString 
     * @returns 
     */
    static parse(userIdString) {
        if (userIdString == null || userIdString.length !== UserId.USER_ID_STRING_WIDTH || !coreutil_v1.RadixUtils.isValidRadixString(userIdString)) {
            throw new Error("User ID must be at least " + UserId.USER_ID_STRING_WIDTH + " characters long and contain valid characters.");
        }
        const epochCentis = coreutil_v1.RadixUtils.fromRadixString(userIdString.substring(0, UserId.EPOCH_CENTIS_STRING_PART_WIDTH));
        const counter = coreutil_v1.RadixUtils.fromRadixString(userIdString.substring(UserId.EPOCH_CENTIS_STRING_PART_WIDTH, UserId.USER_ID_STRING_WIDTH));
        return new UserId(epochCentis, counter);
    }

    /**
     * 
     * @returns {String}
     */
    toString() {
        const epochMillisString = coreutil_v1.StringUtils.leftPad(coreutil_v1.RadixUtils.toRadixString(this.epochCentis), UserId.EPOCH_CENTIS_STRING_PART_WIDTH, '0');
        const counterString = coreutil_v1.StringUtils.leftPad(coreutil_v1.RadixUtils.toRadixString(this.counter), UserId.COUNT_STRING_PART_WIDTH, '0');
        return epochMillisString + counterString;
    }

    report() {
        const report = new Map();
        report.set("UserId [Epoch]", this.epochCentis * 10);
        report.set("UserId [Date]", new Date(this.epochCentis * 10).toISOString());
        report.set("UserId [Counter]", this.counter);
        return report;
    }
}

const LOG$1 = new coreutil_v1.Logger("Id");

class Id {

    constructor(idSpace = null, userId = null) {
        this.idSpace = idSpace;
        this.userId = userId;
    }

    /**
     * 
     * @param {String} idString 
     * @returns {Id}
     */
    static parse(idString) {
        const idSpaceString = idString.substring(0, IdSpace.ID_SPACE_STRING_WIDTH);
        const userIdString = idString.substring(IdSpace.ID_SPACE_STRING_WIDTH);

        const idSpace = IdSpace.parse(idSpaceString);
        const userId = UserId.parse(userIdString);

        return new Id(idSpace, userId);
    }

    report() {
        const report = new Map();
        const idSpaceReport = this.idSpace.report();
        for (const [key, value] of idSpaceReport.entries()) {
            report.set(key, value);
        }
        const userIdReport = this.userId.report();
        for (const [key, value] of userIdReport.entries()) {
            report.set(key, value);
        }
        return report;
    }

    reportString() {
        const report = this.report();
        let reportString = "";
        let first = true;
        for (const [key, value] of report.entries()) {
            if (first) {
                reportString += key + ": " + value;
            } else {
                reportString += "\n" + key + ": " + value;
            }
            first = false;
        }
        return reportString;
    }

    print (){
        LOG$1.info(this.reportString());
    }

    toString() {
        return idSpace.toString() + userId.toString();
    }

    userId() {
        return userId.toString();
    }

}

exports.AbstractInputElement = AbstractInputElement;
exports.AbstractValidator = AbstractValidator;
exports.ActiveModuleRunner = ActiveModuleRunner;
exports.AndValidatorSet = AndValidatorSet;
exports.Application = Application;
exports.Attribute = Attribute;
exports.BaseElement = BaseElement;
exports.CanvasRoot = CanvasRoot;
exports.CanvasStyles = CanvasStyles;
exports.CheckboxInputElement = CheckboxInputElement;
exports.Client = Client;
exports.Component = Component;
exports.ComponentBuilder = ComponentBuilder;
exports.ComponentConfigProcessor = ComponentConfigProcessor;
exports.ComponentFactory = ComponentFactory;
exports.ConfiguredFunction = ConfiguredFunction;
exports.Css3StylesheetBuilder = Css3StylesheetBuilder;
exports.DiModuleLoader = DiModuleLoader;
exports.ElementMapper = ElementMapper;
exports.ElementRegistrator = ElementRegistrator;
exports.ElementUtils = ElementUtils;
exports.EmailValidator = EmailValidator;
exports.EqualsFunctionResultValidator = EqualsFunctionResultValidator;
exports.EqualsPropertyValidator = EqualsPropertyValidator;
exports.EqualsStringValidator = EqualsStringValidator;
exports.Event = Event;
exports.EventFilteredMethod = EventFilteredMethod;
exports.EventManager = EventManager;
exports.FileInputElement = FileInputElement;
exports.FormElement = FormElement;
exports.HTML = HTML;
exports.History = History;
exports.HttpCallBuilder = HttpCallBuilder;
exports.Id = Id;
exports.IdSpace = IdSpace;
exports.InlineComponentFactory = InlineComponentFactory;
exports.InputElementDataBinding = InputElementDataBinding;
exports.LoaderInterceptor = LoaderInterceptor;
exports.MappedContainerElement = MappedContainerElement;
exports.Module = Module;
exports.ModuleLoader = ModuleLoader;
exports.ModuleRunner = ModuleRunner;
exports.Navigation = Navigation;
exports.NumberValidator = NumberValidator;
exports.OptionElement = OptionElement;
exports.OrValidatorSet = OrValidatorSet;
exports.PasswordValidator = PasswordValidator;
exports.PhoneValidator = PhoneValidator;
exports.ProxyObjectFactory = ProxyObjectFactory;
exports.QueryParamBuilder = QueryParamBuilder;
exports.RadioInputElement = RadioInputElement;
exports.RegexValidator = RegexValidator;
exports.RequiredValidator = RequiredValidator;
exports.SelectElement = SelectElement;
exports.ShaUtils = ShaUtils;
exports.SimpleElement = SimpleElement;
exports.StateManager = StateManager;
exports.StyleAccessor = StyleAccessor;
exports.StyleMedia = StyleMedia;
exports.StyleSelector = StyleSelector;
exports.StyleSelectorAccessor = StyleSelectorAccessor;
exports.StylesLoader = StylesLoader;
exports.StylesRegistry = StylesRegistry;
exports.Stylesheet = Stylesheet;
exports.StylesheetBuilder = StylesheetBuilder;
exports.Template = Template;
exports.TemplateComponentFactory = TemplateComponentFactory;
exports.TemplateRegistry = TemplateRegistry;
exports.TemplatesLoader = TemplatesLoader;
exports.TextInputElement = TextInputElement;
exports.TextareaInputElement = TextareaInputElement;
exports.TextnodeElement = TextnodeElement;
exports.TrailIteration = TrailIteration;
exports.TrailNode = TrailNode;
exports.TrailProcessor = TrailProcessor;
exports.UniqueIdRegistry = UniqueIdRegistry;
exports.Url = Url;
exports.UrlBuilder = UrlBuilder;
exports.UrlUtils = UrlUtils;
exports.UserId = UserId;
exports.VideoElement = VideoElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnV0dGluMmMtY29yZV92MS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL251dHRpbjJjL21vZHVsZVJ1bm5lci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybFV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vaGlzdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi9uYXZpZ2F0aW9uLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vdHJhaWxOb2RlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2FjdGl2ZU1vZHVsZVJ1bm5lci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jbGllbnQvY2xpZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZXNoZWV0LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZXNSZWdpc3RyeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy90ZW1wbGF0ZS90ZW1wbGF0ZS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy90ZW1wbGF0ZS90ZW1wbGF0ZVJlZ2lzdHJ5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3RlbXBsYXRlL3RlbXBsYXRlc0xvYWRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVzTG9hZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2NvbXBvbmVudC9jb21wb25lbnRDb25maWdQcm9jZXNzb3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbG9hZGVyL2xvYWRlckludGVyY2VwdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2xvYWRlci9tb2R1bGVMb2FkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbW9kdWxlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2xvYWRlci9kaU1vZHVsZUxvYWRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdGF0ZS9zdGF0ZU1hbmFnZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L3VuaXF1ZUlkUmVnaXN0cnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9hdHRyaWJ1dGUuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9tYXBwZWRDb250YWluZXJFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvZWxlbWVudFV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvYmFzZUVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2NvbXBvbmVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvcmFkaW9JbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9jaGVja2JveElucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3RleHRJbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC90ZXh0YXJlYUlucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3RleHRub2RlRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3NpbXBsZUVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9mb3JtRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3ZpZGVvRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L29wdGlvbkVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9zZWxlY3RFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvZmlsZUlucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L2VsZW1lbnRNYXBwZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2VsZW1lbnRSZWdpc3RyYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jYW52YXMvY2FudmFzUm9vdC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9odG1sL2h0bWwuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY2FudmFzL2NhbnZhc1N0eWxlcy5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jb21wb25lbnQvY29tcG9uZW50RmFjdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jb21wb25lbnQvdGVtcGxhdGVDb21wb25lbnRGYWN0b3J5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vdHJhaWxJdGVyYXRpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi90cmFpbFByb2Nlc3Nvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVTZWxlY3Rvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVNZWRpYS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVzaGVldEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2NvbXBvbmVudEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2lubGluZUNvbXBvbmVudEZhY3RvcnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvYXBwbGljYXRpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29uZmlnL2NvbmZpZ3VyZWRGdW5jdGlvbi5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9kYXRhQmluZC9pbnB1dEVsZW1lbnREYXRhQmluZGluZy5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9ldmVudC9ldmVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9ldmVudC9ldmVudEZpbHRlcmVkTWV0aG9kLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2V2ZW50L2V2ZW50TWFuYWdlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvY3NzM1N0eWxlc2hlZXRCdWlsZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZUFjY2Vzc29yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZUNsYXNzQWNjZXNzb3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9odHRwQ2FsbEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9xdWVyeVBhcmFtQnVpbGRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3NoYVV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2RhdGFCaW5kL3Byb3h5T2JqZWN0RmFjdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvYWJzdHJhY3RWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL3JlZ2V4VmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9lbWFpbFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvZXF1YWxzRnVuY3Rpb25SZXN1bHRWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL2VxdWFsc1Byb3BlcnR5VmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9lcXVhbHNTdHJpbmdWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL251bWJlclZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3Ivb3JWYWxpZGF0b3JTZXQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL3Bhc3N3b3JkVmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9waG9uZWxWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL3JlcXVpcmVkVmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9hbmRWYWxpZGF0b3JTZXQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9pZC9pZFNwYWNlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvaWQvdXNlcklkLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvaWQvaWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE1vZHVsZVJ1bm5lciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgICBydW5Nb2R1bGUodXJsKSB7XG4gICAgIH1cblxufSIsImltcG9ydCB7IFN0cmluZ1V0aWxzIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBVcmx7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvdG9jb2wgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGhvc3QgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBvcnQgXG4gICAgICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBwYXRoVmFsdWVBcnJheSBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsIEFycmF5PFN0cmluZz4+fSBxdWVyeVBhcmFtTWFwXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFuY2hvciBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsIFN0cmluZz59IGFuY2hvclBhcmFtTWFwXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJvdG9jb2wsIGhvc3QsIHBvcnQgPSBudWxsLCBwYXRoVmFsdWVBcnJheSA9IG51bGwsIHF1ZXJ5UGFyYW1NYXAgPSBudWxsLCBhbmNob3IgPSBudWxsLCBhbmNob3JQYXJhbU1hcCA9IG51bGwpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5wcm90b2NvbFN0cmluZyA9IHByb3RvY29sO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLmhvc3RTdHJpbmcgPSBob3N0O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnBvcnRTdHJpbmcgPSBwb3J0O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8U3RyaW5nPn0gKi9cbiAgICAgICAgdGhpcy5wYXRoVmFsdWVBcnJheSA9IHBhdGhWYWx1ZUFycmF5O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgQXJyYXk8U3RyaW5nPj59ICovXG4gICAgICAgIHRoaXMucXVlcnlQYXJhbU1hcCA9IHF1ZXJ5UGFyYW1NYXA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBTdHJpbmc+fSAqL1xuICAgICAgICB0aGlzLmFuY2hvclBhcmFtTWFwID0gYW5jaG9yUGFyYW1NYXA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYW5jaG9yU3RyaW5nID0gYW5jaG9yO1xuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLnBhdGhWYWx1ZUFycmF5KSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhWYWx1ZUFycmF5ID0gbmV3IEFycmF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucXVlcnlQYXJhbU1hcCkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmFuY2hvclBhcmFtTWFwKSB7XG4gICAgICAgICAgICB0aGlzLmFuY2hvclBhcmFtTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHByb3RvY29sKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3RvY29sU3RyaW5nO1xuICAgIH1cblxuICAgIGdldCBob3N0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmhvc3RTdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0IHBvcnQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9ydFN0cmluZztcbiAgICB9XG5cbiAgICBnZXQgcGF0aHNMaXN0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGhWYWx1ZUxpc3Q7XG4gICAgfVxuXG4gICAgZ2V0IGFuY2hvcigpe1xuICAgICAgICByZXR1cm4gdGhpcy5hbmNob3JTdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0IHBhcmFtZXRlck1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1ldGVyVmFsdWVNYXA7XG4gICAgfVxuXG4gICAgZ2V0UGF0aFBhcnQoaW5kZXgpe1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoVmFsdWVMaXN0LmdldChpbmRleCk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVBhdGhWYWx1ZShmcm9tLCB0byl7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnBhdGhWYWx1ZUFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKFN0cmluZ1V0aWxzLm5vbk51bGxFcXVhbHMoZnJvbSwgdGhpcy5wYXRoVmFsdWVBcnJheVtpXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhWYWx1ZUFycmF5W2ldID0gdG87XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCBwYXRoKCl7XG4gICAgICAgIGxldCBwYXRoID0gXCIvXCI7XG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIHRoaXMucGF0aFZhbHVlTGlzdC5mb3JFYWNoKCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpcnN0KSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGggKyBcIi9cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGggPSBwYXRoICsgdmFsdWU7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9KSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCl7XG4gICAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XG4gICAgICAgIGlmKHRoaXMucHJvdG9jb2wgIT09IG51bGwpe1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIHRoaXMucHJvdG9jb2wgKyBcIi8vXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5ob3N0ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyB0aGlzLmhvc3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5wb3J0ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIjpcIiArIHRoaXMucG9ydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGF0aFZhbHVlQXJyYXkuZm9yRWFjaCgocGF0aFBhcnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIi9cIiArIHBhdGhQYXJ0O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZih0aGlzLnF1ZXJ5UGFyYW1NYXAuc2l6ZSA+IDApe1xuICAgICAgICAgICAgY29uc3QgcXVlcnlQYXJhbVN0cmluZ3MgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMucXVlcnlQYXJhbU1hcC5mb3JFYWNoKCh2YWx1ZUFycmF5LCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB2YWx1ZUFycmF5LmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbVN0cmluZ3MucHVzaChrZXkgKyBcIj1cIiArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1TdHJpbmdzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHF1ZXJ5UGFyYW1TdHJpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlICsgXCI/XCIgKyBxdWVyeVBhcmFtU3RyaW5ncy5qb2luKFwiJlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoYXNoQWRkZWQgPSBmYWxzZTtcbiAgICAgICAgaWYodGhpcy5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGhhc2hBZGRlZCA9IHRydWU7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlICsgXCIjXCIgKyB0aGlzLmFuY2hvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFuY2hvclBhcmFtTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBhbmNob3JQYXJhbVN0cmluZ3MgPSBuZXcgQXJyYXkoKTtcblxuICAgICAgICAgICAgdGhpcy5hbmNob3JQYXJhbU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuY2hvclBhcmFtU3RyaW5ncy5wdXNoKGtleSArIFwiPVwiICsgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoYW5jaG9yUGFyYW1TdHJpbmdzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWhhc2hBZGRlZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIiNcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIj9cIiArIGFuY2hvclBhcmFtU3RyaW5ncy5qb2luKFwiJlwiKTtcblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IExpc3QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuL3VybC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVXJsVXRpbHMge1xuXG4gICAgLyoqXG4gICAgICogUGFyc2Ugc3RyaW5nIHRvIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxTdHJpbmcgXG4gICAgICogQHJldHVybnMge1VybH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UodXJsU3RyaW5nKSB7XG5cbiAgICAgICAgaWYgKHVybFN0cmluZyA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvY29sID0gICAgIFVybFV0aWxzLnBhcnNlUHJvdG9jb2wodXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgaG9zdCA9ICAgICAgICAgVXJsVXRpbHMucGFyc2VIb3N0KHVybFN0cmluZyk7XG4gICAgICAgIGNvbnN0IHBvcnQgPSAgICAgICAgIFVybFV0aWxzLnBhcnNlUG9ydCh1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBwYXRoc0xpc3QgPSAgICBVcmxVdGlscy5wYXJzZVBhdGhBcnJheSh1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBxdWVyeVBhcmFtID0gICBVcmxVdGlscy5wYXJzZVF1ZXJ5UGFyYW0odXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gICAgICAgVXJsVXRpbHMucGFyc2VBbmNob3IodXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgYW5jaG9yUGFyYW1zID0gVXJsVXRpbHMucGFyc2VBbmNob3JQYXJhbXModXJsU3RyaW5nKTtcblxuICAgICAgICByZXR1cm4gbmV3IFVybChwcm90b2NvbCwgaG9zdCwgcG9ydCwgcGF0aHNMaXN0LCBxdWVyeVBhcmFtLCBhbmNob3IsIGFuY2hvclBhcmFtcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZVByb3RvY29sKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIi8vXCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHVybFN0cmluZy5zcGxpdChcIi8vXCIpWzBdO1xuICAgICAgICBpZiAocHJvdG9jb2xbcHJvdG9jb2wubGVuZ3RoIC0gMV0gIT09IFwiOlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvdG9jb2w7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUhvc3QodXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGhvc3RBbmRQb3J0ID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICBpZiAoaG9zdEFuZFBvcnQuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICBob3N0QW5kUG9ydCA9IGhvc3RBbmRQb3J0LnNwbGl0KFwiL1wiKVswXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaG9zdCA9IGhvc3RBbmRQb3J0O1xuICAgICAgICBpZiAoaG9zdEFuZFBvcnQuaW5kZXhPZihcIjpcIikgIT09IC0xKSB7XG4gICAgICAgICAgICBob3N0ID0gaG9zdEFuZFBvcnQuc3BsaXQoXCI6XCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxTdHJpbmcgXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VQb3J0KHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBob3N0QW5kUG9ydCA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgaWYgKGhvc3RBbmRQb3J0LmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgaG9zdEFuZFBvcnQgPSBob3N0QW5kUG9ydC5zcGxpdChcIi9cIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhvc3RBbmRQb3J0LmluZGV4T2YoXCI6XCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlci5wYXJzZUludChob3N0QW5kUG9ydC5zcGxpdChcIjpcIilbMV0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxTdHJpbmcgXG4gICAgICogQHJldHVybnMge0FycmF5PFN0cmluZz59XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlUGF0aEFycmF5KHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCIjXCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCI/XCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuc3RhcnRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmF3UGF0aFBhcnRMaXN0ID0gdXJsU3RyaW5nLnNwbGl0KFwiL1wiKTtcblxuICAgICAgICBjb25zdCBwYXRoVmFsdWVMaXN0ID0gbmV3IEFycmF5KCk7XG4gICAgICAgIHJhd1BhdGhQYXJ0TGlzdC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgcGF0aFZhbHVlTGlzdC5wdXNoKGRlY29kZVVSSSh2YWx1ZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBhdGhWYWx1ZUxpc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7TWFwPFN0cmluZywgTGlzdDxTdHJpbmc+Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VRdWVyeVBhcmFtKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCIjXCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiP1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsIHx8IHVybFN0cmluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBxdWVyeVBhcmFtID0gdXJsU3RyaW5nO1xuICAgICAgICBjb25zdCBwYXJhbU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgcGFyYW1QYWlycyA9IHF1ZXJ5UGFyYW0uc3BsaXQoXCImXCIpO1xuICAgICAgICBwYXJhbVBhaXJzLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChwYWlyLmluZGV4T2YoXCI9XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhaXIuc3BsaXQoXCI9XCIpWzBdO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFpci5zcGxpdChcIj1cIilbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhaXI7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5ID0gZGVjb2RlVVJJKGtleSk7XG4gICAgICAgICAgICB2YWx1ZSA9IGRlY29kZVVSSSh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIXBhcmFtTWFwLmdldChrZXkpKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1NYXAuc2V0KGtleSwgbmV3IEFycmF5KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyYW1NYXAuZ2V0KGtleSkucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGFyYW1NYXA7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQW5jaG9yKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIjXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiI1wiKVsxXTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCI/XCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBhbmNob3IgPSB1cmxTdHJpbmc7XG4gICAgICAgIHJldHVybiBhbmNob3I7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQW5jaG9yUGFyYW1zKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIjXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiI1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiP1wiKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBhbmNob3JQYXJhbVN0cmluZyA9IHVybFN0cmluZztcbiAgICAgICAgY29uc3QgcGFyYW1NYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbnN0IHBhcmFtUGFpcnMgPSBhbmNob3JQYXJhbVN0cmluZy5zcGxpdChcIiZcIik7XG4gICAgICAgIHBhcmFtUGFpcnMuZm9yRWFjaCgocGFpcikgPT4ge1xuICAgICAgICAgICAgbGV0IGtleSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHBhaXIuaW5kZXhPZihcIj1cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGFpci5zcGxpdChcIj1cIilbMF07XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYWlyLnNwbGl0KFwiPVwiKVsxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGFpcjtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXkgPSBkZWNvZGVVUkkoa2V5KTtcbiAgICAgICAgICAgIHZhbHVlID0gZGVjb2RlVVJJKHZhbHVlKTtcbiAgICAgICAgICAgIHBhcmFtTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXJhbU1hcDtcbiAgICB9XG5cblxufSIsImltcG9ydCB7IENvbnRhaW5lclVybCB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IFVybFV0aWxzIH0gZnJvbSBcIi4uL3V0aWwvdXJsVXRpbHMuanNcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiSGlzdG9yeVwiKTtcblxuZXhwb3J0IGNsYXNzIEhpc3Rvcnkge1xuXG4gICAgc3RhdGljIHJlcGxhY2VVcmwodXJsLCB0aXRsZSwgc3RhdGVPYmplY3QpIHtcbiAgICAgICAgQ29udGFpbmVyVXJsLnJlcGxhY2VVcmwodXJsLnRvU3RyaW5nKCksIHRpdGxlLCBzdGF0ZU9iamVjdCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHB1c2hVcmwodXJsLCB0aXRsZSwgc3RhdGVPYmplY3QpIHtcbiAgICAgICAgQ29udGFpbmVyVXJsLnB1c2hVcmwodXJsLnRvU3RyaW5nKCksIHRpdGxlLCBzdGF0ZU9iamVjdCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGN1cnJlbnRVcmwoKSB7XG4gICAgICAgIHJldHVybiBVcmxVdGlscy5wYXJzZShDb250YWluZXJVcmwuY3VycmVudFVybCgpKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4vdXJsLmpzXCI7XG5pbXBvcnQgeyBVcmxVdGlscyB9IGZyb20gXCIuL3VybFV0aWxzLmpzXCI7XG5pbXBvcnQgeyBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBVcmxCdWlsZGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnByb3RvY29sID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8qKiBAdHlwZSB7TnVtYmVyfSAqL1xuICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxTdHJpbmc+fSAqL1xuICAgICAgICB0aGlzLnBhdGhBcnJheSA9IG5ldyBBcnJheSgpO1xuICAgICAgICBcbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBBcnJheTxTdHJpbmc+Pn0gKi9cbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYW5jaG9yID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIEFycmF5PFN0cmluZz4+fSAqL1xuICAgICAgICB0aGlzLmFuY2hvclBhcmFtZXRlck1hcCA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVcmxCdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgd2l0aEN1cnJlbnRVcmwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpdGhVcmwoQ29udGFpbmVyVXJsLmN1cnJlbnRVcmwoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICAgd2l0aFVybCh1cmwpIHtcbiAgICAgICAgdGhpcy53aXRoQWxsT2ZVcmwoVXJsVXRpbHMucGFyc2UodXJsKSlcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICAgd2l0aFJvb3RPZlVybCh1cmwpIHtcbiAgICAgICAgdGhpcy5wcm90b2NvbCA9IHVybC5wcm90b2NvbDtcbiAgICAgICAgdGhpcy5wb3J0ID0gdXJsLnBvcnQ7XG4gICAgICAgIHRoaXMuaG9zdCA9IHVybC5ob3N0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgICB3aXRoUGF0aE9mVXJsKHVybCkge1xuICAgICAgICB0aGlzLndpdGhSb290T2ZVcmwodXJsKTtcbiAgICAgICAgdGhpcy5wYXRoQXJyYXkgPSB1cmwucGF0aFZhbHVlQXJyYXk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aEFsbE9mVXJsKHVybCkge1xuICAgICAgICB0aGlzLndpdGhQYXRoT2ZVcmwodXJsKTtcbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9IHVybC5xdWVyeVBhcmFtTWFwO1xuICAgICAgICB0aGlzLmFuY2hvciA9IHVybC5hbmNob3I7XG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID0gdXJsLmFuY2hvclBhcmFtTWFwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvdG9jb2wgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFByb3RvY29sKHByb3RvY29sKSB7XG4gICAgICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBvcnQgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFBvcnQocG9ydCkge1xuICAgICAgICB0aGlzLnBvcnQgPSBwb3J0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaG9zdCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoSG9zdChob3N0KSB7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhQYXRoKHBhdGgpIHtcbiAgICAgICAgdGhpcy5wYXRoQXJyYXkgPSBVcmxVdGlscy5wYXJzZVBhdGhBcnJheShwYXRoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFuY2hvciBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoQW5jaG9yKGFuY2hvcikge1xuICAgICAgICAvLyBSZXNldCBhbmNob3IgcGFyYW1ldGVycyB3aGVuIHNldHRpbmcgYW5jaG9yIGRpcmVjdGx5XG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5hbmNob3IgPSBhbmNob3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdpdGhBbmNob3JQYXJhbVN0cmluZyhrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLmFuY2hvclBhcmFtZXRlck1hcCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmFuY2hvclBhcmFtZXRlck1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuY2hvclBhcmFtZXRlck1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhRdWVyeVBhcmFtU3RyaW5nKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMucXVlcnlQYXJhbWV0ZXJNYXAgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwLnNldChrZXksIFt2YWx1ZV0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IFxuICAgICAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gdmFsdWVBcnJheSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICB3aXRoUXVlcnlQYXJhbUFycmF5KGtleSwgdmFsdWVBcnJheSkge1xuICAgICAgICBpZiAodGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJNYXAuc2V0KGtleSwgdmFsdWVBcnJheSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlcGxhY2VQYXRoVmFsdWUoZnJvbSwgdG8pe1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgdGhpcy5wYXRoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMuY29udGFpbnMoZnJvbSwgdGhpcy5wYXRoQXJyYXlbaV0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXRoQXJyYXlbaV0gPSB0aGlzLnBhdGhBcnJheVtpXS5yZXBsYWNlKGZyb20sIHRvKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVXJsKHRoaXMucHJvdG9jb2wsIHRoaXMuaG9zdCwgdGhpcy5wb3J0LCB0aGlzLnBhdGhBcnJheSwgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCwgdGhpcy5hbmNob3IsIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgSGlzdG9yeSB9IGZyb20gXCIuL2hpc3RvcnkuanNcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyVXJsIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgVXJsQnVpbGRlciB9IGZyb20gXCIuLi91dGlsL3VybEJ1aWxkZXIuanNcIjtcblxubGV0IG5hdmlnYXRvaW9uID0gbnVsbDtcblxuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb24ge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7TmF2aWdhdGlvbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgaW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICghbmF2aWdhdG9pb24pIHtcbiAgICAgICAgICAgIG5hdmlnYXRvaW9uID0gbmV3IE5hdmlnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmF2aWdhdG9pb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTmF2aWdhdGUgYnJvd3NlciB0byBuZXcgdXJsXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBnbyh1cmwpIHtcbiAgICAgICAgQ29udGFpbmVyVXJsLmdvKHVybC50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZSBicm93c2VyIGJhY2tcbiAgICAgKi9cbiAgICBiYWNrKCkge1xuICAgICAgICBDb250YWluZXJVcmwuYmFjaygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgcGF0aCB3aXRob3V0IHJlbmF2aWdhdGluZyBicm93c2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICAgKiBAcmV0dXJucyB7VXJsfVxuICAgICAqL1xuICAgIGxvYWRQYXRoKHBhdGgpIHtcbiAgICAgICAgY29uc3QgdXJsID0gSGlzdG9yeS5jdXJyZW50VXJsKCk7XG4gICAgICAgIGNvbnN0IG5ld1VybCA9IFVybEJ1aWxkZXIuY3JlYXRlKCkud2l0aFJvb3RPZlVybCh1cmwpLndpdGhQYXRoKHBhdGgpLmJ1aWxkKCk7XG4gICAgICAgIEhpc3RvcnkucHVzaFVybChuZXdVcmwpO1xuICAgICAgICByZXR1cm4gbmV3VXJsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgYW5jaG9yIHdpdGhvdXQgcmVuYXZpZ2F0aW5nIGJyb3dzZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYW5jaG9yXG4gICAgICogQHJldHVybnMge1VybH1cbiAgICAgKi9cbiAgICBsb2FkQW5jaG9yKGFuY2hvcikge1xuICAgICAgICBjb25zdCB1cmwgPSBIaXN0b3J5LmN1cnJlbnRVcmwoKTtcbiAgICAgICAgY29uc3QgbmV3VXJsID0gVXJsQnVpbGRlci5jcmVhdGUoKS53aXRoUm9vdE9mVXJsKHVybCkud2l0aEFuY2hvcihhbmNob3IpLmJ1aWxkKCk7XG4gICAgICAgIEhpc3RvcnkucHVzaFVybChuZXdVcmwpO1xuICAgICAgICByZXR1cm4gbmV3VXJsO1xuICAgIH1cblxufSIsImV4cG9ydCBjbGFzcyBUcmFpbE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICAgICAgICB0aGlzLnJvb3QgPSBmYWxzZTtcblxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy50cmFpbCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtwcm9wZXJ0eX0gKi9cbiAgICAgICAgdGhpcy5wcm9wZXJ0eSA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy53YXlwb2ludCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxUcmFpbE5vZGU+fSAqL1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIH1cblxufSIsImltcG9ydCB7IE1vZHVsZVJ1bm5lciB9IGZyb20gXCIuL21vZHVsZVJ1bm5lci5qc1wiO1xuaW1wb3J0IHsgTmF2aWdhdGlvbiB9IGZyb20gXCIuL25hdmlnYXRpb24vbmF2aWdhdGlvbi5qc1wiO1xuaW1wb3J0IHsgVHJhaWxOb2RlIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi90cmFpbE5vZGUuanNcIjtcblxubGV0IGFjdGl2ZU1vZHVsZVJ1bm5lciA9IG51bGw7XG5cbmV4cG9ydCBjbGFzcyBBY3RpdmVNb2R1bGVSdW5uZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNb2R1bGVSdW5uZXJ9ICovXG4gICAgICAgIHRoaXMubW9kdWxlUnVubmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7QWN0aXZlTW9kdWxlUnVubmVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBpbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVNb2R1bGVSdW5uZXIpIHtcbiAgICAgICAgICAgIGFjdGl2ZU1vZHVsZVJ1bm5lciA9IG5ldyBBY3RpdmVNb2R1bGVSdW5uZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aXZlTW9kdWxlUnVubmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TW9kdWxlUnVubmVyfSBuZXdNb2R1bGVSdW5uZXIgXG4gICAgICovXG4gICAgc2V0KG5ld01vZHVsZVJ1bm5lcikge1xuICAgICAgICB0aGlzLm1vZHVsZVJ1bm5lciA9IG5ld01vZHVsZVJ1bm5lcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGFuY2hvciB3aXRob3V0IHJlbmF2aWdhdGluZyBicm93c2VyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRyYWlsIFxuICAgICAqL1xuICAgICBhc3luYyBsb2FkKHRyYWlsKSB7XG4gICAgICAgIGNvbnN0IHVybCA9IE5hdmlnYXRpb24uaW5zdGFuY2UoKS5sb2FkQW5jaG9yKHRyYWlsKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubW9kdWxlUnVubmVyLnJ1bk1vZHVsZSh1cmwpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb250YWluZXJIdHRwQ2xpZW50LCBDb250YWluZXJIdHRwUmVzcG9uc2UsIENvbnRhaW5lclVwbG9hZERhdGEgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIENsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fFByb21pc2U8Q29udGFpbmVyRG93bmxvYWQ+fVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQodXJsLCBhdXRob3JpemF0aW9uID0gbnVsbCwgdGltZW91dCA9IDEwMDAsIGRvd25sb2FkID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IENsaWVudC5nZXRIZWFkZXIoYXV0aG9yaXphdGlvbik7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJywgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICB9XG4gICAgICAgIGlmIChkb3dubG9hZCkge1xuICAgICAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZG93bmxvYWQodXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZmV0Y2godXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBkYXRhXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gcHJvZ3JlY0NhbGxiYWNrTWV0aG9kXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fVxuICAgICAqL1xuICAgIHN0YXRpYyBwb3N0KHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiA9IG51bGwsIHByb2dyZWNDYWxsYmFja01ldGhvZCA9IG51bGwsIHRpbWVvdXQgPSAxMDAwKXtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBDb250YWluZXJVcGxvYWREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC51cGxvYWQoXCJQT1NUXCIsIHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJzID0gQ2xpZW50LmdldEhlYWRlcihhdXRob3JpemF0aW9uKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gIHtcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLCAvLyBtdXN0IG1hdGNoICdDb250ZW50LVR5cGUnIGhlYWRlclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBtb2RlOiBcImNvcnNcIiwgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIiwgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gZGF0YVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtNZXRob2R9IHByb2dyZWNDYWxsYmFja01ldGhvZFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0XG4gICAgICogQHJldHVybnMge1Byb21pc2U8Q29udGFpbmVySHR0cFJlc3BvbnNlPn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcHV0KHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiA9IG51bGwsIHByb2dyZWNDYWxsYmFja01ldGhvZCA9IG51bGwsIHRpbWVvdXQgPSAxMDAwKXtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBDb250YWluZXJVcGxvYWREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC51cGxvYWQoXCJQVVRcIiwgdXJsLCBkYXRhLCBhdXRob3JpemF0aW9uLCBwcm9ncmVjQ2FsbGJhY2tNZXRob2QsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBDbGllbnQuZ2V0SGVhZGVyKGF1dGhvcml6YXRpb24pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksIC8vIG11c3QgbWF0Y2ggJ0NvbnRlbnQtVHlwZScgaGVhZGVyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLCBcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJywgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsIC8vIG1hbnVhbCwgKmZvbGxvdywgZXJyb3JcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC5mZXRjaCh1cmwudG9TdHJpbmcoKSwgcGFyYW1zLCB0aW1lb3V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fENvbnRhaW5lclVwbG9hZERhdGF9IGRhdGFcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBwcm9ncmVjQ2FsbGJhY2tNZXRob2RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENvbnRhaW5lckh0dHBSZXNwb25zZT59XG4gICAgICovXG4gICAgc3RhdGljIHBhdGNoKHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiA9IG51bGwsIHByb2dyZWNDYWxsYmFja01ldGhvZCA9IG51bGwsIHRpbWVvdXQgPSAxMDAwKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBDbGllbnQuZ2V0SGVhZGVyKGF1dGhvcml6YXRpb24pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksIC8vIG11c3QgbWF0Y2ggJ0NvbnRlbnQtVHlwZScgaGVhZGVyXG4gICAgICAgICAgICBtZXRob2Q6ICdQQVRDSCcsIFxuICAgICAgICAgICAgbW9kZTogJ2NvcnMnLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JywgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBkYXRhXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gcHJvZ3JlY0NhbGxiYWNrTWV0aG9kXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fVxuICAgICAqL1xuICAgIHN0YXRpYyBkZWxldGUodXJsLCBkYXRhLCBhdXRob3JpemF0aW9uID0gbnVsbCwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kID0gbnVsbCwgdGltZW91dCA9IDEwMDApIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IENsaWVudC5nZXRIZWFkZXIoYXV0aG9yaXphdGlvbik7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLCAvLyBtdXN0IG1hdGNoICdDb250ZW50LVR5cGUnIGhlYWRlclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NvcnMnLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsIC8vIG1hbnVhbCwgKmZvbGxvdywgZXJyb3JcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC5mZXRjaCh1cmwudG9TdHJpbmcoKSwgcGFyYW1zLCB0aW1lb3V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBtb2RlOiAnY29ycycsIC8vIG5vLWNvcnMsIGNvcnMsICpzYW1lLW9yaWdpblxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JywgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldEhlYWRlcihhdXRob3JpemF0aW9uID0gbnVsbCkge1xuICAgICAgICBpZiAoYXV0aG9yaXphdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcInVzZXItYWdlbnRcIjogXCJNb3ppbGxhLzQuMCBNRE4gRXhhbXBsZVwiLFxuICAgICAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBhdXRob3JpemF0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidXNlci1hZ2VudFwiOiBcIk1vemlsbGEvNC4wIE1ETiBFeGFtcGxlXCIsXG4gICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICB9O1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU3R5bGVzaGVldCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3R5bGVzU291cmNlIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0eWxlc1NvdXJjZSl7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzU291cmNlID0gc3R5bGVzU291cmNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0U3R5bGVzU291cmNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnN0eWxlc1NvdXJjZTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgTG9nZ2VyLCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENsaWVudCB9IGZyb20gXCIuLi9jbGllbnQvY2xpZW50LmpzXCI7XG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi4vdXRpbC91cmwuanNcIjtcbmltcG9ydCB7IFVybFV0aWxzIH0gZnJvbSBcIi4uL3V0aWwvdXJsVXRpbHMuanNcIjtcbmltcG9ydCB7IFN0eWxlc2hlZXQgfSBmcm9tIFwiLi9zdHlsZXNoZWV0LmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJTdHlsZXNSZWdpc3RyeVwiKTtcblxuZXhwb3J0IGNsYXNzIFN0eWxlc1JlZ2lzdHJ5IHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIC8qKiBAdHlwZSB7TWFwfSAqL1xuICAgICAgICB0aGlzLnN0eWxlc01hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcH0gKi9cbiAgICAgICAgdGhpcy5zdHlsZXNVcmxNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtpbnRlZ2VyfSAqL1xuICAgICAgICB0aGlzLnN0eWxlc1F1ZXVlU2l6ZSA9IDA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNZXRob2R9ICovXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqIEBwYXJhbSB7U3R5bGVzfSBzdHlsZXMgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBzZXQobmFtZSwgc3R5bGVzLCB1cmwpe1xuICAgICAgICBpZih1cmwgIT09IHVuZGVmaW5lZCAmJiB1cmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzVXJsTWFwLnNldChuYW1lLCB1cmwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3R5bGVzTWFwLnNldChuYW1lLCBzdHlsZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGdldChuYW1lKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3R5bGVzTWFwLmdldChuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKi9cbiAgICBjb250YWlucyhuYW1lKXtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzTWFwLmdldChuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBjYWxsYmFjayBcbiAgICAgKi9cbiAgICBkb25lKGNhbGxiYWNrKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmRvQ2FsbGJhY2sodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHlsZXNSZWdpc3RyeX0gcmVnaXN0cnkgXG4gICAgICovXG4gICAgZG9DYWxsYmFjayhyZWdpc3RyeSl7XG4gICAgICAgIGlmKHJlZ2lzdHJ5LmNhbGxiYWNrICE9PSBudWxsICYmIHJlZ2lzdHJ5LmNhbGxiYWNrICE9PSB1bmRlZmluZWQgICYmIHJlZ2lzdHJ5LnN0eWxlc1F1ZXVlU2l6ZSA9PT0gcmVnaXN0cnkuc3R5bGVzTWFwLmVudHJpZXMubGVuZ3RoKXtcbiAgICAgICAgICAgIHZhciB0ZW1wQ2FsbGJhY2sgPSByZWdpc3RyeS5jYWxsYmFjaztcbiAgICAgICAgICAgIHJlZ2lzdHJ5LmNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgIHRlbXBDYWxsYmFjay5jYWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgICBhc3luYyBsb2FkKG5hbWUsIHVybCkge1xuICAgICAgICB0aGlzLnN0eWxlc1F1ZXVlU2l6ZSArKztcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQuZ2V0KHVybCk7XG4gICAgICAgIGlmKCFyZXNwb25zZS5vayl7XG4gICAgICAgICAgICB0aHJvdyBcIlVuYWJsZSB0byBsb2FkIHN0eWxlcyBmb3IgXCIgKyBuYW1lICsgXCIgYXQgXCIgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSwgbmV3IFN0eWxlc2hlZXQodGV4dCksIHVybCk7XG4gICAgICAgIHRoaXMuZG9DYWxsYmFjayh0aGlzKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNYXA8c3RyaW5nLCBzdHJpbmc+fSBuYW1lVXJsTWFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFzeW5jIGdldFN0eWxlc0xvYWRlZFByb21pc2UobmFtZVVybE1hcCkge1xuICAgICAgICBcbiAgICAgICAgaWYoIW5hbWVVcmxNYXAgfHwgbmFtZVVybE1hcC5zaXplID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsb2FkUHJvbWlzZXMgPSBbXTtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcztcbiAgICAgICAgbmFtZVVybE1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAocGFyZW50LmNvbnRhaW5zKGtleSkpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsb2FkUHJvbWlzZXMucHVzaChwYXJlbnQucHJpdmF0ZUxvYWQoa2V5LCBVcmxVdGlscy5wYXJzZSh2YWx1ZSkpKTtcbiAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGxvYWRQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBhc3luYyBwcml2YXRlTG9hZChuYW1lLCB1cmwpIHtcbiAgICAgICAgTE9HLmluZm8oXCJMb2FkaW5nIHN0eWxlcyBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybC50b1N0cmluZygpKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5nZXQodXJsKTtcbiAgICAgICAgaWYoIXJlc3BvbnNlLm9rKXtcbiAgICAgICAgICAgIHRocm93IFwiVW5hYmxlIHRvIGxvYWQgc3R5bGVzIGZvciBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBuZXcgU3R5bGVzaGVldCh0ZXh0KTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSwgc3R5bGVzLCB1cmwpO1xuICAgICAgICByZXR1cm4gc3R5bGVzO1xuICAgIH1cbn0iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZXtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wbGF0ZVNvdXJjZSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVNvdXJjZSl7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVTb3VyY2UgPSB0ZW1wbGF0ZVNvdXJjZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRlbXBsYXRlU291cmNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlU291cmNlO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBMb2dnZXIsIE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tIFwiLi90ZW1wbGF0ZS5qc1wiO1xuaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSBcIi4uL2NsaWVudC9jbGllbnQuanNcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgVXJsVXRpbHMgfSBmcm9tIFwiLi4vdXRpbC91cmxVdGlscy5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiVGVtcGxhdGVSZWdpc3RyeVwiKTtcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVnaXN0cnkge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVVcmxNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtpbnRlZ2VyfSAqL1xuICAgICAgICB0aGlzLnRlbXBsYXRlUXVldWVTaXplID0gMDtcblxuICAgICAgICAvKiogQHR5cGUge01ldGhvZH0gKi9cbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMubGFuZ3VhZ2VQcmVmaXggPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZVByZWZpeCBcbiAgICAgKi9cbiAgICBzZXRMYW5ndWFnZVByZWZpeChsYW5ndWFnZVByZWZpeCkge1xuICAgICAgICB0aGlzLmxhbmd1YWdlUHJlZml4ID0gbGFuZ3VhZ2VQcmVmaXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtUZW1wbGF0ZX0gdGVtcGxhdGUgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBzZXQobmFtZSx0ZW1wbGF0ZSx1cmwpe1xuICAgICAgICBpZih1cmwgIT09IHVuZGVmaW5lZCAmJiB1cmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVVcmxNYXAuc2V0KG5hbWUsIHVybCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZW1wbGF0ZU1hcC5zZXQobmFtZSwgdGVtcGxhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGdldChuYW1lKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVNYXAuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGNvbnRhaW5zKG5hbWUpe1xuICAgICAgICBpZiAodGhpcy50ZW1wbGF0ZU1hcC5nZXQobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gY2FsbGJhY2sgXG4gICAgICovXG4gICAgZG9uZShjYWxsYmFjayl7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kb0NhbGxiYWNrKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VGVtcGxhdGVSZWdpc3RyeX0gcmVnaXN0cnkgXG4gICAgICovXG4gICAgZG9DYWxsYmFjayhyZWdpc3RyeSl7XG4gICAgICAgIGlmKHRtby5jYWxsYmFjayAhPT0gbnVsbCAmJiByZWdpc3RyeS5jYWxsYmFjayAhPT0gdW5kZWZpbmVkICAmJiByZWdpc3RyeS50ZW1wbGF0ZVF1ZXVlU2l6ZSA9PT0gcmVnaXN0cnkudGVtcGxhdGVNYXAuc2l6ZSgpKXtcbiAgICAgICAgICAgIHZhciB0ZW1wQ2FsbGJhY2sgPSByZWdpc3RyeS5jYWxsYmFjaztcbiAgICAgICAgICAgIHJlZ2lzdHJ5LmNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgIHRlbXBDYWxsYmFjay5jYWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIGFzeW5jIGxvYWQobmFtZSwgdXJsKSB7XG4gICAgICAgIGlmKHRoaXMubGFuZ3VhZ2VQcmVmaXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHVybC5wYXRoc0xpc3Quc2V0TGFzdChcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmd1YWdlUHJlZml4ICsgXCIuXCIgK1xuICAgICAgICAgICAgICAgIHVybC5wYXRoc0xpc3QuZ2V0TGFzdCgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGVtcGxhdGVRdWV1ZVNpemUgKys7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LmdldCh1cmwpO1xuICAgICAgICBpZighcmVzcG9uc2Uub2spe1xuICAgICAgICAgICAgdGhyb3cgXCJVbmFibGUgdG8gbG9hZCB0ZW1wbGF0ZSBmb3IgXCIgKyBuYW1lICsgXCIgYXQgXCIgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSxuZXcgVGVtcGxhdGUodGV4dCksdXJsKTtcbiAgICAgICAgdGhpcy5kb0NhbGxiYWNrKHRoaXMpO1xuICAgIH1cblxuICAgIGFzeW5jIGdldFRlbXBsYXRlc0xvYWRlZFByb21pc2UobmFtZVVybE1hcCkge1xuICAgICAgICBcbiAgICAgICAgaWYoIW5hbWVVcmxNYXAgfHwgbmFtZVVybE1hcC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxvYWRQcm9taXNlcyA9IFtdO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzO1xuICAgICAgICBuYW1lVXJsTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQuY29udGFpbnMoa2V5KSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsb2FkUHJvbWlzZXMucHVzaChwYXJlbnQucHJpdmF0ZUxvYWQoa2V5LCBVcmxVdGlscy5wYXJzZSh2YWx1ZSkpKTtcbiAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGxvYWRQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBhc3luYyBwcml2YXRlTG9hZChuYW1lLCB1cmwpIHtcbiAgICAgICAgaWYgKHRoaXMubGFuZ3VhZ2VQcmVmaXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHVybC5wYXRoc0xpc3Quc2V0TGFzdChcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmd1YWdlUHJlZml4ICsgXCIuXCIgK1xuICAgICAgICAgICAgICAgIHVybC5wYXRoc0xpc3QuZ2V0TGFzdCgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIExPRy5pbmZvKFwiTG9hZGluZyB0ZW1wbGF0ZSBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybC50b1N0cmluZygpKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQuZ2V0KHVybCk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spe1xuICAgICAgICAgICAgdGhyb3cgXCJVbmFibGUgdG8gbG9hZCB0ZW1wbGF0ZSBmb3IgXCIgKyBuYW1lICsgXCIgYXQgXCIgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUodGV4dCk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWUsIHRlbXBsYXRlLCB1cmwpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufSIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gXCIuL3RlbXBsYXRlUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFR5cGVDb25maWcgfSBmcm9tIFwibWluZGlfdjFcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIlRlbXBsYXRlUG9zdENvbmZpZ1wiKTtcblxuLyoqXG4gKiBUbyBiZSBhZGRlZCB0byBtaW5kaSBhcyBhIHNpbmdsZXRvbi4gV2lsbCBzY2FuIHRocm91Z2ggYWxsIGNvbmZpZ3VyZWQgY2xhc3NlcyB0aGF0IGhhdmUgYSBURU1QTEFURV9VUkxcbiAqIHN0YXRpYyBnZXR0ZXIgYW5kIHdpbGwgYXN5bmNyb25vdXNseSBsb2FkIHRoZW0uIFJldHVybnMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gYWxsIHRlbXBsYXRlcyBhcmUgbG9hZGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZXNMb2FkZXIge1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1RlbXBsYXRlUmVnaXN0cnl9IHRlbXBsYXRlUmVnaXN0cnkgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodGVtcGxhdGVSZWdpc3RyeSkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VGVtcGxhdGVSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5ID0gdGVtcGxhdGVSZWdpc3RyeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsVHlwZUNvbmZpZz59IGNvbmZpZ0VudHJpZXNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBsb2FkKGNvbmZpZ0VudHJpZXMpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBjb25maWdFbnRyaWVzLmZvckVhY2goKGNvbmZpZ0VudHJ5LCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5URU1QTEFURV9VUkwpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU1hcC5zZXQoY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UubmFtZSwgY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UuVEVNUExBVEVfVVJMKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7IFxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5LmdldFRlbXBsYXRlc0xvYWRlZFByb21pc2UodGVtcGxhdGVNYXApO1xuICAgIH1cblxufSIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi9zdHlsZXNSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgVHlwZUNvbmZpZyB9IGZyb20gXCJtaW5kaV92MVwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiU3R5bGVzTG9hZGVyXCIpO1xuXG4vKipcbiAqIFRvIGJlIGFkZGVkIHRvIG1pbmRpIGFzIGEgc2luZ2xldG9uLiBXaWxsIHNjYW4gdGhyb3VnaCBhbGwgY29uZmlndXJlZCBjbGFzc2VzIHRoYXQgaGF2ZSBhIFNUWUxFU19VUkxcbiAqIHN0YXRpYyBnZXR0ZXIgYW5kIHdpbGwgYXN5bmNyb25vdXNseSBsb2FkIHRoZW0uIFJldHVybnMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gYWxsIHN0eWxlcyBhcmUgbG9hZGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHlsZXNMb2FkZXIge1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0eWxlc1JlZ2lzdHJ5fSBzdHlsZXNSZWdpc3RyeSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdHlsZXNSZWdpc3RyeSkge1xuICAgICAgICB0aGlzLnN0eWxlc1JlZ2lzdHJ5ID0gc3R5bGVzUmVnaXN0cnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNYXA8U3RyaW5nLCBUeXBlQ29uZmlnPn0gY29uZmlnRW50cmllc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGxvYWQoY29uZmlnRW50cmllcykge1xuICAgICAgICBjb25zdCBzdHlsZXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbmZpZ0VudHJpZXMuZm9yRWFjaCgoY29uZmlnRW50cnksIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYoY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UuU1RZTEVTX1VSTCkge1xuICAgICAgICAgICAgICAgIHN0eWxlc01hcC5zZXQoY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UubmFtZSwgY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UuU1RZTEVTX1VSTCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7IFxuICAgICAgICByZXR1cm4gdGhpcy5zdHlsZXNSZWdpc3RyeS5nZXRTdHlsZXNMb2FkZWRQcm9taXNlKHN0eWxlc01hcCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb25maWcsIEluamVjdGlvblBvaW50LCBUeXBlQ29uZmlnIH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBTdHlsZXNSZWdpc3RyeSB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFRlbXBsYXRlUmVnaXN0cnkgfSBmcm9tIFwiLi4vdGVtcGxhdGUvdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVzTG9hZGVyIH0gZnJvbSBcIi4uL3RlbXBsYXRlL3RlbXBsYXRlc0xvYWRlci5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzTG9hZGVyIH0gZnJvbSBcIi4uL3N0eWxlcy9zdHlsZXNMb2FkZXIuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkNvbXBvbmVudENvbmZpZ1Byb2Nlc3NvclwiKVxuXG4vKipcbiAqIE1pbmRpIGNvbmZpZyBwcm9jZXNzb3Igd2hpY2ggbG9hZHMgYWxsIHRlbXBsYXRlcyBhbmQgc3R5bGVzIGZvciBhbGwgY29uZmlndXJlZCBjb21wb25lbnRzXG4gKiBhbmQgdGhlbiBjYWxscyBhbnkgZXhpc3RpbmcgY29tcG9uZW50TG9hZGVkIGZ1bmN0aW9uIG9uIGVhY2ggY29tcG9uZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRDb25maWdQcm9jZXNzb3Ige1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtUZW1wbGF0ZVJlZ2lzdHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5ID0gSW5qZWN0aW9uUG9pbnQuaW5zdGFuY2UoVGVtcGxhdGVSZWdpc3RyeSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTdHlsZXNSZWdpc3RyeX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShTdHlsZXNSZWdpc3RyeSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBwb3N0Q29uZmlnKCl7XG4gICAgICAgIHRoaXMudGVtcGxhdGVzTG9hZGVyID0gbmV3IFRlbXBsYXRlc0xvYWRlcih0aGlzLnRlbXBsYXRlUmVnaXN0cnkpO1xuICAgICAgICB0aGlzLnN0eWxlc0xvYWRlciA9IG5ldyBTdHlsZXNMb2FkZXIodGhpcy5zdHlsZXNSZWdpc3RyeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtDb25maWd9IGNvbmZpZ1xuICAgICAqIEBwYXJhbSB7TWFwPHN0cmluZywgVHlwZUNvbmZpZz59IHVuY29uZmlndXJlZENvbmZpZ0VudHJpZXNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBwcm9jZXNzQ29uZmlnKGNvbmZpZywgdW5jb25maWd1cmVkQ29uZmlnRW50cmllcykge1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIFsgXG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZXNMb2FkZXIubG9hZCh1bmNvbmZpZ3VyZWRDb25maWdFbnRyaWVzKSwgXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZXNMb2FkZXIubG9hZCh1bmNvbmZpZ3VyZWRDb25maWdFbnRyaWVzKSBcbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIlxuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiTG9hZGVySW50ZXJjZXB0b3JcIik7XG5cbmV4cG9ydCBjbGFzcyBMb2FkZXJJbnRlcmNlcHRvciB7XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBwcm9jZXNzKCkge1xuICAgICAgICBMT0cuaW5mbyhcIlVuaW1wbGVtZW50ZWQgTG9hZGVyIEludGVyY2VwdG9yIGJyZWFrcyBieSBkZWZhdWx0XCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiXG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi4vdXRpbC91cmwuanNcIjtcbmltcG9ydCB7IExvYWRlckludGVyY2VwdG9yIH0gZnJvbSBcIi4vbG9hZGVySW50ZXJjZXB0b3IuanNcIlxuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiTW9kdWxlTG9hZGVyXCIpO1xuXG5leHBvcnQgY2xhc3MgTW9kdWxlTG9hZGVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtb2R1bGVQYXRoIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0cmFpbFN0YXJ0IFxuICAgICAqIEBwYXJhbSB7QXJyYXk8TG9hZGVySW50ZXJjZXB0b3I+fSBsb2FkZXJJbnRlcmNlcHRvcnNcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVQYXRoLCB0cmFpbFN0YXJ0LCBsb2FkZXJJbnRlcmNlcHRvcnMgPSBbXSkge1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubW9kdWxlUGF0aCA9IG1vZHVsZVBhdGg7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRyYWlsU3RhcnQgPSB0cmFpbFN0YXJ0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXk8TG9hZGVySW50ZXJjZXB0b3I+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2FkZXJJbnRlcmNlcHRvcnMgPSBsb2FkZXJJbnRlcmNlcHRvcnM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIGlmIHRoZSBjb25maWd1cmVkIG1hdGNoVXJsIHN0YXJ0cyB3aXRoIHRoZSBwcm92aWRlZCB1cmwgb3JcbiAgICAgKiBpZiB0aGUgY29uZmlndXJlZCBtYXRjaFVybCBpcyBudWxsXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBtYXRjaGVzKHVybCl7XG4gICAgICAgIC8vIE5vIHRyYWlsU3RhcnQgbWVhbnMgZGVmYXVsdCBtYXRjaFxuICAgICAgICBpZiAoIXRoaXMudHJhaWxTdGFydCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyB1cmwgYW5kIG5vbiBudWxsIHRyYWlsU3RhcnQsIG1lYW5zIG5vIG1hdGNoXG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICBMT0cuZXJyb3IoXCJVcmwgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIGFuY2hvciBtYXRjaCBvbmx5IGlmIHRyYWlsU3RhcnQgaXMgXCIvXCJcbiAgICAgICAgaWYgKCF1cmwuYW5jaG9yKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMuZXF1YWxzKHRoaXMudHJhaWxTdGFydCwgXCIvXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeGFjdCBtYXRjaCBmb3Igcm9vdCB0cmFpbFN0YXJ0XG4gICAgICAgIGlmIChTdHJpbmdVdGlscy5lcXVhbHModGhpcy50cmFpbFN0YXJ0LCBcIi9cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5lcXVhbHModXJsLmFuY2hvciwgdGhpcy50cmFpbFN0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5zdGFydHNXaXRoKHVybC5hbmNob3IsIHRoaXMudHJhaWxTdGFydCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1Byb21pc2U8TWFpbj59XG4gICAgICovXG4gICAgYXN5bmMgbG9hZCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGF3YWl0IHRoaXMuaW1wb3J0TW9kdWxlKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmludGVyY2VwdG9yc1Bhc3MoKTtcbiAgICAgICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICBMT0cud2FybihcIkZpbHRlciByZWplY3RlZCBcIiArIHJlYXNvbik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGludGVyY2VwdG9yc1Bhc3MoKSB7XG4gICAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IHRoaXMubG9hZGVySW50ZXJjZXB0b3JzO1xuICAgICAgICBpZiAoaW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW50ZXJjZXB0b3JQcm9taXNlQ2hhaW4gPSBpbnRlcmNlcHRvcnNbMF0ucHJvY2VzcygpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBpbnRlcmNlcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbnRlcmNlcHRvclByb21pc2VDaGFpbiA9IGludGVyY2VwdG9yUHJvbWlzZUNoYWluLnRoZW4oaW50ZXJjZXB0b3JzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnRlcmNlcHRvclByb21pc2VDaGFpbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW1wb3J0TW9kdWxlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgaW1wb3J0KHRoaXMubW9kdWxlUGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IG1vZHVsZS5kZWZhdWx0KCk7XG4gICAgICAgIH0gY2F0Y2gocmVhc29uKSAge1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVHJhaWxOb2RlIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi90cmFpbE5vZGVcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5cbmV4cG9ydCBjbGFzcyBNb2R1bGUge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtVcmx9ICovXG4gICAgICAgIHRoaXMudXJsID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1RyYWlsTm9kZX0gKi9cbiAgICAgICAgdGhpcy50cmFpbE1hcCA9IG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgbG9hZCgpIHtcbiAgICAgICAgdGhyb3cgXCJNb2R1bGUgY2xhc3MgbXVzdCBpbXBsZW1lbnQgbG9hZCgpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQXJyYXlVdGlscywgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCJcbmltcG9ydCB7IE1pbmRpQ29uZmlnLCBNaW5kaUluamVjdG9yIH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBNb2R1bGVMb2FkZXIgfSBmcm9tIFwiLi9tb2R1bGVMb2FkZXIuanNcIjtcbmltcG9ydCB7IExvYWRlckludGVyY2VwdG9yIH0gZnJvbSBcIi4vbG9hZGVySW50ZXJjZXB0b3IuanNcIlxuaW1wb3J0IHsgTW9kdWxlIH0gZnJvbSBcIi4uL21vZHVsZS5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiRGlNb2R1bGVMb2FkZXJcIik7XG5cbmV4cG9ydCBjbGFzcyBEaU1vZHVsZUxvYWRlciBleHRlbmRzIE1vZHVsZUxvYWRlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbW9kdWxlUGF0aCBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdHJhaWxNYXAgXG4gICAgICogQHBhcmFtIHtNaW5kaUNvbmZpZ30gY29uZmlnXG4gICAgICogQHBhcmFtIHtBcnJheTxMb2FkZXJJbnRlcmNlcHRvcj59IGxvYWRlckludGVyY2VwdG9yc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1vZHVsZVBhdGgsIHRyYWlsTWFwLCBjb25maWcsIGxvYWRlckludGVyY2VwdG9ycyA9IFtdKSB7XG4gICAgICAgIHN1cGVyKG1vZHVsZVBhdGgsIHRyYWlsTWFwLCBsb2FkZXJJbnRlcmNlcHRvcnMpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWluZGlDb25maWd9ICovXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPE1vZHVsZT59XG4gICAgICovXG4gICAgYXN5bmMgbG9hZCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGF3YWl0IHRoaXMuaW1wb3J0TW9kdWxlKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmludGVyY2VwdG9yc1Bhc3MoKTtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBNaW5kaUluamVjdG9yLmluamVjdChtb2R1bGUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgIExPRy53YXJuKFwiTW9kdWxlIGxvYWRlciBmYWlsZWQgXCIgKyByZWFzb24pO1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01vZHVsZUxvYWRlcn0gbW9kdWxlTG9hZGVyXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYXN5bmMgaW1wb3J0TW9kdWxlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgc3VwZXIuaW1wb3J0TW9kdWxlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5hZGRBbGxUeXBlQ29uZmlnKG1vZHVsZS50eXBlQ29uZmlnQXJyYXkpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb25maWcuZmluYWxpemUoKTtcbiAgICAgICAgICAgIGNvbnN0IHdvcmtpbmdDb25maWcgPSB0aGlzLmNvbmZpZztcbiAgICAgICAgICAgIGF3YWl0IEFycmF5VXRpbHMucHJvbWlzZUNoYWluKHRoaXMubG9hZGVySW50ZXJjZXB0b3JzLCAobG9hZGVySW50ZXJjZXB0b3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWluZGlJbmplY3Rvci5pbmplY3QobG9hZGVySW50ZXJjZXB0b3IsIHdvcmtpbmdDb25maWcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuLyoqXG4gKiBTdGF0ZU1hbmFnZXJcbiAqIFxuICogQHRlbXBsYXRlIFQsIFQyXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hbmFnZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgVD59ICovXG4gICAgICAgIHRoaXMuZG9tYWluTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgVDI+fSAqL1xuICAgICAgICB0aGlzLmVycm9yTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgQXJyYXk8TWV0aG9kPn0gKi9cbiAgICAgICAgdGhpcy5kb21haW5MaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBBcnJheTxNZXRob2Q+fSAqL1xuICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBkb21haW5MaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBlcnJvckxpc3RlbmVyXG4gICAgICovXG4gICAgcmVhY3QoZG9tYWluTGlzdGVuZXIsIGVycm9yTGlzdGVuZXIgPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGFueUtleSA9IFwiX19BTllfX1wiO1xuICAgICAgICBpZiAoIXRoaXMuZG9tYWluTGlzdGVuZXJzLmhhcyhhbnlLZXkpKSB7XG4gICAgICAgICAgICB0aGlzLmRvbWFpbkxpc3RlbmVycy5zZXQoYW55S2V5LCBuZXcgQXJyYXkoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb21haW5MaXN0ZW5lcnMuZ2V0KGFueUtleSkucHVzaChkb21haW5MaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKGVycm9yTGlzdGVuZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmVycm9yTGlzdGVuZXJzLmhhcyhhbnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycy5zZXQoYW55S2V5LCBuZXcgQXJyYXkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLmdldChhbnlLZXkpLnB1c2goZXJyb3JMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBsaXN0ZW5lciBcbiAgICAgKi9cbiAgICByZWFjdFRvKGtleSwgZG9tYWluTGlzdGVuZXIsIGVycm9yTGlzdGVuZXIgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5kb21haW5MaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLnNldChrZXksIG5ldyBBcnJheSgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRvbWFpbkxpc3RlbmVycy5nZXQoa2V5KS5wdXNoKGRvbWFpbkxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoZXJyb3JMaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZXJyb3JMaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLnNldChrZXksIG5ldyBBcnJheSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMuZ2V0KGtleSkucHVzaChlcnJvckxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBvYmplY3RBcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5kb21haW5NYXAudmFsdWVzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7UHJvbWlzZTxUPn0gb2JqZWN0XG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlKG9iamVjdFByb21pc2UsIGtleSA9IFwiX19ERUZBVUxUX19cIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0ID0gYXdhaXQgb2JqZWN0UHJvbWlzZTtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZURvbWFpbihvYmplY3QsIGtleSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZUVycm9yKGVycm9yLCBrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlRXJyb3IoZXJyb3IsIGtleSA9IFwiX19ERUZBVUxUX19cIikge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lcnJvck1hcC5zZXQoa2V5LCBlcnJvcik7XG4gICAgICAgIHRoaXMuc2lnbmFsRXJyb3JDaGFuZ2UoZXJyb3IsIGtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBzdGF0ZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7YW55fSBvYmplY3QgXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBcbiAgICAgKiBAcGFyYW0ge1R9IG9iamVjdCBcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVEb21haW4ob2JqZWN0LCBrZXkgPSBcIl9fREVGQVVMVF9fXCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvYmplY3RbaV0gPSB0aGlzLmNyZWF0ZVByb3h5KG9iamVjdFtpXSwga2V5LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvYmplY3QgPSB0aGlzLmNyZWF0ZVByb3h5KG9iamVjdCwga2V5LCB0aGlzKTtcbiAgICAgICAgdGhpcy5kb21haW5NYXAuc2V0KGtleSwgb2JqZWN0KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5lcnJvck1hcC5nZXQoa2V5KSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yTWFwLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxFcnJvckNoYW5nZShudWxsLCBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2lnbmFsRG9tYWluQ2hhbmdlKG9iamVjdCwga2V5KTtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICBhc3luYyBkZWxldGUoa2V5ID0gXCJfX0RFRkFVTFRfX1wiKSB7XG5cbiAgICAgICAgdGhpcy5kb21haW5NYXAuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLmRlbGV0ZShrZXkpO1xuXG4gICAgICAgIHRoaXMuZXJyb3JNYXAuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMuZGVsZXRlKGtleSk7XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5zaWduYWxEb21haW5DaGFuZ2UobnVsbCwga2V5KTtcbiAgICB9XG5cbiAgICBhc3luYyBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGtleSBvZiB0aGlzLmRvbWFpbk1hcC5rZXlzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsRG9tYWluQ2hhbmdlKG51bGwsIGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaWduYWxEb21haW5DaGFuZ2UobnVsbCwgXCJfX0FOWV9fXCIpO1xuXG4gICAgICAgIHRoaXMuZG9tYWluTWFwLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLmNsZWFyKCk7XG5cbiAgICAgICAgdGhpcy5lcnJvck1hcC5jbGVhcigpO1xuICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLmNsZWFyKCk7XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNpZ25hbERvbWFpbkNoYW5nZShvYmplY3QsIGtleSkge1xuICAgICAgICBpZiAodGhpcy5kb21haW5MaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZG9tYWluTGlzdGVuZXJzLmdldChrZXkpKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChbb2JqZWN0LCBrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFueUtleSA9IFwiX19BTllfX1wiO1xuICAgICAgICBpZiAoa2V5ICE9IGFueUtleSAmJiB0aGlzLmRvbWFpbkxpc3RlbmVycy5oYXMoYW55S2V5KSkge1xuICAgICAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5kb21haW5MaXN0ZW5lcnMuZ2V0KGFueUtleSkpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKFtvYmplY3QsIGtleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2lnbmFsRXJyb3JDaGFuZ2UoZXJyb3IsIGtleSkge1xuICAgICAgICBpZiAodGhpcy5lcnJvckxpc3RlbmVycy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5lcnJvckxpc3RlbmVycy5nZXQoa2V5KSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwoW2Vycm9yLCBrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFueUtleSA9IFwiX19BTllfX1wiO1xuICAgICAgICBpZiAoa2V5ICE9IGFueUtleSAmJiB0aGlzLmVycm9yTGlzdGVuZXJzLmhhcyhhbnlLZXkpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmVycm9yTGlzdGVuZXJzLmdldChhbnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChbZXJyb3IsIGtleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlUHJveHkob2JqZWN0LCBrZXksIHN0YXRlTWFuYWdlcikge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iamVjdCwge1xuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRbcHJvcF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBzdWNjZXNzID0gKHRhcmdldFtwcm9wXSA9IHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzdGF0ZU1hbmFnZXIuc2lnbmFsRG9tYWluQ2hhbmdlKHRhcmdldCwga2V5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyA9PT0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxufSIsImltcG9ydCB7IE1hcCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgVW5pcXVlSWRSZWdpc3RyeSB7XG5cbiAgICBpZEF0dHJpYnV0ZVdpdGhTdWZmaXggKGlkKSB7XG4gICAgICAgIGlmKGlkTmFtZXMuY29udGFpbnMoaWQpKSB7XG4gICAgICAgICAgICB2YXIgbnVtYmVyID0gaWROYW1lcy5nZXQoaWQpO1xuICAgICAgICAgICAgaWROYW1lcy5zZXQoaWQsbnVtYmVyKzEpO1xuICAgICAgICAgICAgcmV0dXJuIGlkICsgXCItXCIgKyBudW1iZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWROYW1lcy5zZXQoaWQsMSk7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICB9XG5cbn1cblxudmFyIGlkTmFtZXMgPSBuZXcgTWFwKCk7IiwiZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGUpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUgPSBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUudmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZS5uYW1lO1xuICAgIH1cblxuICAgIGdldCBuYW1lc3BhY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZS5uYW1lO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb250YWluZXJFbGVtZW50IH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuXG5leHBvcnQgY2xhc3MgTWFwcGVkQ29udGFpbmVyRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0NvbnRhaW5lckVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuXG4gICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29udGFpbmVyRWxlbWVudCBtdXN0IGJlIHByb3ZpZGVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEB0eXBlIHtDb250YWluZXJFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxufSIsImltcG9ydCB7IENvbnRhaW5lckVsZW1lbnQsIENvbnRhaW5lckVsZW1lbnRVdGlscyB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IE1hcHBlZENvbnRhaW5lckVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9tYXBwZWRDb250YWluZXJFbGVtZW50XCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJFbGVtZW50VXRpbHNcIik7XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50VXRpbHMge1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgXG4gICAgICogQHBhcmFtIHtNYXBwZWRDb250YWluZXJFbGVtZW50fSBwYXJlbnQgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUNvbnRhaW5lckVsZW1lbnQodmFsdWUsIHBhcmVudCkge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBYbWxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gRWxlbWVudFV0aWxzLmNyZWF0ZUZyb21YbWxFbGVtZW50KHZhbHVlLCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlRWxlbWVudCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKENvbnRhaW5lckVsZW1lbnRVdGlscy5pc1VJRWxlbWVudCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29udGFpbmVyRWxlbWVudCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgTE9HLmVycm9yKFwiVW5yZWNvZ25pemVkIHZhbHVlIGZvciBFbGVtZW50XCIpO1xuICAgICAgICBMT0cuZXJyb3IodmFsdWUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgYnJvd3NlciBFbGVtZW50IGZyb20gdGhlIFhtbEVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudH0geG1sRWxlbWVudFxuICAgICAqIEBwYXJhbSB7TWFwcGVkQ29udGFpbmVyRWxlbWVudH0gcGFyZW50RWxlbWVudFxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tWG1sRWxlbWVudCh4bWxFbGVtZW50LCBwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgIGxldCBlbGVtZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHhtbEVsZW1lbnQubmFtZXNwYWNlKSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZUVsZW1lbnROUyh4bWxFbGVtZW50Lm5hbWVzcGFjZVVyaSwgeG1sRWxlbWVudC5mdWxsTmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZUVsZW1lbnQoeG1sRWxlbWVudC5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyZW50RWxlbWVudCAmJiBwYXJlbnRFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHBhcmVudEVsZW1lbnQuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICB4bWxFbGVtZW50LmF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlS2V5LCBhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICAgIENvbnRhaW5lckVsZW1lbnRVdGlscy5zZXRBdHRyaWJ1dGVWYWx1ZShlbGVtZW50LCBhdHRyaWJ1dGVLZXksIGF0dHJpYnV0ZS52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxufSIsImltcG9ydCB7IFhtbEVsZW1lbnQgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBNYXAsIExvZ2dlciwgTGlzdCwgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb250YWluZXJFbGVtZW50LCBDb250YWluZXJFbGVtZW50VXRpbHMsIENvbnRhaW5lclRleHQgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGUgfSBmcm9tIFwiLi9hdHRyaWJ1dGUuanNcIjtcbmltcG9ydCB7IEVsZW1lbnRVdGlscyB9IGZyb20gXCIuLi91dGlsL2VsZW1lbnRVdGlscy5qc1wiO1xuaW1wb3J0IHsgTWFwcGVkQ29udGFpbmVyRWxlbWVudCB9IGZyb20gXCIuL21hcHBlZENvbnRhaW5lckVsZW1lbnQuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkJhc2VFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgYmFzZSBjbGFzcyBmb3IgZW5jbG9zaW5nIGFuIEhUTUxFbGVtZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBCYXNlRWxlbWVudCBleHRlbmRzIE1hcHBlZENvbnRhaW5lckVsZW1lbnQge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudHxzdHJpbmd8YW55fSB2YWx1ZSBWYWx1ZSB0byBiZSBjb252ZXJ0ZWQgdG8gQ29udGFpbmVyIFVJIEVsZW1lbnQgKEhUTUxFbGVtZW50IGluIHRoZSBjYXNlIG9mIFdlYiBCcm93c2VyKVxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCB0aGUgcGFyZW50IEJhc2VFbGVtZW50XG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmFsdWUsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihFbGVtZW50VXRpbHMuY3JlYXRlQ29udGFpbmVyRWxlbWVudCh2YWx1ZSwgcGFyZW50KSk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlTWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5ldmVudHNBdHRhY2hlZCA9IG5ldyBMaXN0KCk7XG4gICAgfVxuXG4gICAgbG9hZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXR0cmlidXRlcyA9PT0gbnVsbCB8fCB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXR0cmlidXRlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVNYXAgPT09IG51bGwgfHwgdGhpcy5hdHRyaWJ1dGVNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGFpbmVyRWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAuc2V0KHRoaXMuY29udGFpbmVyRWxlbWVudC5hdHRyaWJ1dGVzW2ldLm5hbWUsbmV3IEF0dHJpYnV0ZSh0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXR0cmlidXRlc1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lckZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRPYmplY3RcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNhcHR1cmVcbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgbGlzdGVuVG8oZXZlbnRUeXBlLCBsaXN0ZW5lckZ1bmN0aW9uLCBjb250ZXh0T2JqZWN0LCBjYXB0dXJlID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgTWV0aG9kKGxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHRPYmplY3QpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IGZ1bGxOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LnRhZ05hbWU7XG4gICAgfVxuXG4gICAgZ2V0IHRvcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5ib3VuZGluZ0NsaWVudFJlY3QudG9wO1xuICAgIH1cblxuICAgIGdldCBib3R0b20oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYm91bmRpbmdDbGllbnRSZWN0LmJvdHRvbTtcbiAgICB9XG5cbiAgICBnZXQgbGVmdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICB9XG5cbiAgICBnZXQgcmlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYm91bmRpbmdDbGllbnRSZWN0LnJpZ2h0O1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICB9XG5cbiAgICBnZXQgaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICB9XG5cbiAgICBnZXQgYXR0cmlidXRlcygpIHtcbiAgICAgICAgdGhpcy5sb2FkQXR0cmlidXRlcygpO1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVNYXA7XG4gICAgfVxuXG4gICAgc2V0QXR0cmlidXRlVmFsdWUoa2V5LCB2YWx1ZSkge1xuICAgICAgICBDb250YWluZXJFbGVtZW50VXRpbHMuc2V0QXR0cmlidXRlVmFsdWUodGhpcy5jb250YWluZXJFbGVtZW50LCBrZXksdmFsdWUpO1xuICAgIH1cblxuICAgIGdldEF0dHJpYnV0ZVZhbHVlKGtleSkge1xuICAgICAgICByZXR1cm4gQ29udGFpbmVyRWxlbWVudFV0aWxzLmdldEF0dHJpYnV0ZVZhbHVlKHRoaXMuY29udGFpbmVyRWxlbWVudCwga2V5KTtcbiAgICB9XG5cbiAgICBjb250YWluc0F0dHJpYnV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyRWxlbWVudCA9IHRoaXMuY29udGFpbmVyRWxlbWVudDtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lckVsZW1lbnQuaGFzQXR0cmlidXRlKGtleSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQXR0cmlidXRlKGtleSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgfVxuXG4gICAgc2V0U3R5bGUoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuc3R5bGVba2V5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldFN0eWxlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LnN0eWxlW2tleV07XG4gICAgfVxuXG4gICAgcmVtb3ZlU3R5bGUoa2V5KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5zdHlsZVtrZXldID0gbnVsbDtcbiAgICB9XG5cbiAgICBzZXQoaW5wdXQpIHtcbiAgICAgICAgaWYgKG51bGwgPT09IGlucHV0IHx8IHVuZGVmaW5lZCA9PT0gaW5wdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGlucHV0IHByb3ZpZGVkIHRvIHNldCB0aGUgZWxlbWVudFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZighdGhpcy5jb250YWluZXJFbGVtZW50LnBhcmVudE5vZGUpe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50IGhhcyBubyBwYXJlbnQsIGNhbiBub3Qgc3dhcCBpdCBmb3IgdmFsdWVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLyoqIEB0eXBlIHtDb250YWluZXJFbGVtZW50fSAqL1xuICAgICAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5jb250YWluZXJFbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgICAgICAgaWYoaW5wdXQuY29udGFpbmVyRWxlbWVudCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaW5wdXQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoaW5wdXQgJiYgaW5wdXQucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGlucHV0LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQsIHRoaXMuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSBpbnB1dC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50O1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBpbnB1dCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlVGV4dE5vZGUoaW5wdXQpLCB0aGlzLmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKGlucHV0IGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaW5wdXQsIHRoaXMuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbnB1dCwgdGhpcy5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBMT0cud2FybihcIk5vIHZhbGlkIGlucHV0IHRvIHNldCB0aGUgZWxlbWVudFwiKTtcbiAgICAgICAgTE9HLndhcm4oaW5wdXQpO1xuICAgIH1cblxuICAgIGlzTW91bnRlZCgpIHtcbiAgICAgICAgaWYodGhpcy5jb250YWluZXJFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgLyoqIEB0eXBlIHtDb250YWluZXJFbGVtZW50fSAqL1xuICAgICAgICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRoaXMuY29udGFpbmVyRWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldENoaWxkKGlucHV0KSB7XG4gICAgICAgIGlmIChudWxsID09PSBpbnB1dCB8fCB1bmRlZmluZWQgPT09IGlucHV0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBpbnB1dCBwcm92aWRlZCB0byBzZXQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGlucHV0KTtcbiAgICB9XG5cbiAgICBhZGRDaGlsZChpbnB1dCkge1xuICAgICAgICBpZiAobnVsbCA9PT0gaW5wdXQgfHwgdW5kZWZpbmVkID09PSBpbnB1dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gaW5wdXQgcHJvdmlkZWQgdG8gc2V0IHRoZSBlbGVtZW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dC5jb250YWluZXJFbGVtZW50ICE9PSB1bmRlZmluZWQgJiYgaW5wdXQuY29udGFpbmVyRWxlbWVudCAhPT0gbnVsbCl7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXQucm9vdEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZVRleHROb2RlKGlucHV0KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXJFbGVtZW50ID0gbmV3IENvbnRhaW5lckVsZW1lbnQoaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIExPRy53YXJuKFwiTm8gdmFsaWQgaW5wdXQgdG8gYWRkIHRoZSBlbGVtZW50XCIpO1xuICAgICAgICBMT0cud2FybihpbnB1dCk7XG4gICAgfVxuXG4gICAgcHJlcGVuZENoaWxkKGlucHV0KSB7XG4gICAgICAgIGlmIChudWxsID09PSBpbnB1dCB8fCB1bmRlZmluZWQgPT09IGlucHV0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBpbnB1dCBwcm92aWRlZCB0byBzZXQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dC5jb250YWluZXJFbGVtZW50ICE9PSB1bmRlZmluZWQgJiYgaW5wdXQuY29udGFpbmVyRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50Lmluc2VydEJlZm9yZShpbnB1dC5jb250YWluZXJFbGVtZW50LCB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5zZXJ0QmVmb3JlKGlucHV0LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQsIHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbnNlcnRCZWZvcmUoQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZVRleHROb2RlKGlucHV0KSwgdGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIENvbnRhaW5lclRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbnNlcnRCZWZvcmUoaW5wdXQsIHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5zZXJ0QmVmb3JlKGlucHV0LCB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgTE9HLndhcm4oXCJObyB2YWxpZCBpbnB1dCB0byBwcmVwZW5kIHRoZSBlbGVtZW50XCIpO1xuICAgICAgICBMT0cud2FybihpbnB1dCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgTWFwIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Jhc2VFbGVtZW50XCI7XG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29tcG9uZW50SW5kZXggXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcm9vdEVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtNYXB9IGVsZW1lbnRNYXAgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29tcG9uZW50SW5kZXgsIHJvb3RFbGVtZW50LCBlbGVtZW50TWFwKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50SW5kZXggPSBjb21wb25lbnRJbmRleDtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwID0gZWxlbWVudE1hcDtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IHJvb3RFbGVtZW50O1xuICAgIH1cblxuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIGdldChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50TWFwLmdldChpZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIHNldCAoaWQsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpLnNldCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIGNsZWFyQ2hpbGRyZW4oaWQpe1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKS5jbGVhcigpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50TWFwLmdldChpZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIHNldENoaWxkIChpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwLmdldChpZCkuc2V0Q2hpbGQodmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50TWFwLmdldChpZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIGFkZENoaWxkIChpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwLmdldChpZCkuYWRkQ2hpbGQodmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50TWFwLmdldChpZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIHByZXBlbmRDaGlsZCAoaWQsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpLnByZXBlbmRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkFic3RyYWN0SW5wdXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIFNoYXJlZCBwcm9wZXJ0aWVzIG9mIGlucHV0IGVsZW1lbnRzXG4gKi9cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdElucHV0RWxlbWVudCBleHRlbmRzIEJhc2VFbGVtZW50e1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudH0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKHZhbHVlLCBwYXJlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgdGhlIGlucHV0cyBuYW1lXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGlucHV0cyBuYW1lXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQgbmFtZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQubmFtZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIGdpdmVuIGFueSBwcm9jZXNzaW5nIHJ1bGVzXG4gICAgICovXG4gICAgZ2V0IHZhbHVlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmJhY2tpbmdWYWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUodmFsdWUpe1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmRpc3BhdGNoRXZlbnQoJ2NoYW5nZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHNvdXJjZSB2YWx1ZVxuICAgICAqL1xuICAgIGdldCBiYWNraW5nVmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC52YWx1ZTtcbiAgICB9XG5cbiAgICBmb2N1cygpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgc2VsZWN0QWxsKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuc2VsZWN0KCk7XG4gICAgfVxuXG4gICAgZW5hYmxlKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkaXNhYmxlKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0SW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vYWJzdHJhY3RJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIFJhZGlvSW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgaXNDaGVja2VkKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuY2hlY2tlZDtcbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQ2hlY2tlZCgpO1xuICAgIH1cblxuICAgIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuY2hlY2tlZCA9ICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gXCJ0cnVlXCIpO1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0SW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vYWJzdHJhY3RJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIENoZWNrYm94SW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgaXNDaGVja2VkKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuY2hlY2tlZDtcbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQ2hlY2tlZCgpO1xuICAgIH1cblxuICAgIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuY2hlY2tlZCA9ICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gXCJ0cnVlXCIpO1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHtYbWxFbGVtZW50fSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQge0Fic3RyYWN0SW5wdXRFbGVtZW50fSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVGV4dElucHV0RWxlbWVudCBleHRlbmRzIEFic3RyYWN0SW5wdXRFbGVtZW50e1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudH0gZWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgfVxuXG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmltcG9ydCB7WG1sRWxlbWVudH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHtBYnN0cmFjdElucHV0RWxlbWVudH0gZnJvbSBcIi4vYWJzdHJhY3RJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIFRleHRhcmVhSW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBnZXQgaW5uZXJIVE1MKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIH1cblxuICAgIHNldCBpbm5lckhUTUwodmFsdWUpe1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoaW5wdXQpIHtcbiAgICAgICAgc3VwZXIuYWRkQ2hpbGQoaW5wdXQpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5pbm5lckhUTUw7XG4gICAgfVxuXG4gICAgcHJlcGVuZENoaWxkKGlucHV0KSB7XG4gICAgICAgIHN1cGVyLnByZXBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmlubmVySFRNTDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBYbWxDZGF0YSB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IENvbnRhaW5lckVsZW1lbnQsIENvbnRhaW5lckVsZW1lbnRVdGlscyB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIFRleHRub2RlRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxDZGF0YX0gdmFsdWUgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCBwYXJlbnQpIHtcblxuICAgICAgICAvKiogQHR5cGUge0NvbnRhaW5lckVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgaWYodmFsdWUgaW5zdGFuY2VvZiBYbWxDZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gdGhpcy5jcmVhdGVGcm9tWG1sQ2RhdGEodmFsdWUsIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1htbENkYXRhfSBjZGF0YUVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50RWxlbWVudCBcbiAgICAgKi9cbiAgICBjcmVhdGVGcm9tWG1sQ2RhdGEoY2RhdGFFbGVtZW50LCBwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlVGV4dE5vZGUoY2RhdGFFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgaWYocGFyZW50RWxlbWVudCAhPT0gbnVsbCAmJiBwYXJlbnRFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHBhcmVudEVsZW1lbnQuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU2ltcGxlRWxlbWVudCBleHRlbmRzIEJhc2VFbGVtZW50e1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudH0gZWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgZ2V0IGlubmVySFRNTCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LmlubmVySFRNTDtcbiAgICB9XG5cbiAgICBzZXQgaW5uZXJIVE1MKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmlubmVySFRNTCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIEZvcm1FbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBpbnB1dHMgbmFtZVxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50Lm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBpbnB1dHMgbmFtZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgc2V0IG5hbWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50Lm5hbWUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBzdWJtaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuc3VibWl0KCk7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWRlb0VsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSB2YWx1ZSBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgZ2V0IG1hcHBlZEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcGxheU11dGVkKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucGxheU11dGVkKCk7XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnBsYXkoKTtcbiAgICB9XG5cbiAgICBtdXRlKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQubXV0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHVubXV0ZSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50Lm11dGVkID0gZmFsc2U7XG4gICAgfVxuXG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmltcG9ydCB7IFhtbEVsZW1lbnQgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBPcHRpb25FbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnQge1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuXHQgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcblx0XHRzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgICAgICB0aGlzLm9wdGlvbkxhYmVsID0gbnVsbDtcblx0fVxuXG4gICAgZ2V0IHZhbHVlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZVZhbHVlKFwidmFsdWVcIik7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKHZhbCl7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlVmFsdWUoXCJ2YWx1ZVwiLCB2YWwpO1xuICAgIH1cblxuICAgIGdldCBsYWJlbCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25MYWJlbDtcbiAgICB9XG5cbiAgICBzZXQgbGFiZWwodmFsdWUpe1xuICAgICAgICB0aGlzLm9wdGlvbkxhYmVsID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2V0Q2hpbGQodmFsdWUpO1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IE9wdGlvbkVsZW1lbnQgfSBmcm9tIFwiLi9vcHRpb25FbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBTZWxlY3RFbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnQge1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuXHQgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcblx0XHRzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8T3B0aW9uRWxlbWVudD59ICovXG4gICAgICAgIHRoaXMub3B0aW9uc0FycmF5ID0gW107XG5cdH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvcHRpb25zIGFzIGFycmF5IG9mIE9wdGlvbkVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtBcnJheTxPcHRpb25FbGVtZW50Pn1cbiAgICAgKi9cbiAgICBnZXQgb3B0aW9ucygpe1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zQXJyYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IG9wdGlvbnMgZnJvbSBhcnJheSBvZiBPcHRpb25FbGVtZW50XG4gICAgICogQHBhcmFtIHtBcnJheTxPcHRpb25FbGVtZW50Pn0gb3B0aW9uc0FycmF5XG4gICAgICovXG4gICAgc2V0IG9wdGlvbnMob3B0aW9uc0FycmF5KXtcbiAgICAgICAgdGhpcy5vcHRpb25zQXJyYXkgPSBvcHRpb25zQXJyYXk7XG4gICAgICAgIHRoaXMucmVuZGVyT3B0aW9ucygpO1xuICAgIH1cblxuICAgIHJlbmRlck9wdGlvbnMoKXtcbiAgICAgICAgd2hpbGUgKHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHRoaXMub3B0aW9uc0FycmF5KXtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb24uY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBpbnB1dHMgbmFtZVxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50Lm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBpbnB1dHMgbmFtZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgc2V0IG5hbWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50Lm5hbWUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBnaXZlbiBhbnkgcHJvY2Vzc2luZyBydWxlc1xuICAgICAqL1xuICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5iYWNraW5nVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc291cmNlIHZhbHVlXG4gICAgICovXG4gICAgZ2V0IGJhY2tpbmdWYWx1ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LnZhbHVlO1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBzZWxlY3RBbGwoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5zZWxlY3QoKTtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRpc2FibGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtYbWxFbGVtZW50fSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQge0Fic3RyYWN0SW5wdXRFbGVtZW50fSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRmlsZUlucHV0RWxlbWVudCBleHRlbmRzIEFic3RyYWN0SW5wdXRFbGVtZW50e1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudH0gZWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZm9jdXMoKSB7XG4gICAgICAgIExPRy5XQVJOKFwiRmlsZSBpbnB1dCBlbGVtZW50cyBjYW5ub3QgYmUgZm9jdXNlZCBkaXJlY3RseSBkdWUgdG8gYnJvd3NlciBzZWN1cml0eSByZXN0cmljdGlvbnMuXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sQ2RhdGEsWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IFJhZGlvSW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vcmFkaW9JbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IENoZWNrYm94SW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vY2hlY2tib3hJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi90ZXh0SW5wdXRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBUZXh0YXJlYUlucHV0RWxlbWVudCB9IGZyb20gXCIuL3RleHRhcmVhSW5wdXRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBUZXh0bm9kZUVsZW1lbnQgfSBmcm9tIFwiLi90ZXh0bm9kZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQgfSBmcm9tIFwiLi9zaW1wbGVFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBGb3JtRWxlbWVudCB9IGZyb20gXCIuL2Zvcm1FbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBWaWRlb0VsZW1lbnQgfSBmcm9tIFwiLi92aWRlb0VsZW1lbnQuanNcIjtcbmltcG9ydCB7IE9wdGlvbkVsZW1lbnQgfSBmcm9tIFwiLi9vcHRpb25FbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBTZWxlY3RFbGVtZW50IH0gZnJvbSBcIi4vc2VsZWN0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgRmlsZUlucHV0RWxlbWVudCB9IGZyb20gXCIuL2ZpbGVJbnB1dEVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRNYXBwZXIge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge2FueX0gaW5wdXQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIHN0YXRpYyBtYXAoaW5wdXQsIHBhcmVudCkge1xuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9SYWRpbyhpbnB1dCkpeyAgICAgcmV0dXJuIG5ldyBSYWRpb0lucHV0RWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9DaGVja2JveChpbnB1dCkpeyAgcmV0dXJuIG5ldyBDaGVja2JveElucHV0RWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9TdWJtaXQoaW5wdXQpKXsgICAgcmV0dXJuIG5ldyBUZXh0SW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb0Zvcm0oaW5wdXQpKXsgICAgICByZXR1cm4gbmV3IEZvcm1FbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1RleHRhcmVhKGlucHV0KSl7ICByZXR1cm4gbmV3IFRleHRhcmVhSW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb0ZpbGUoaW5wdXQpKXsgICAgICByZXR1cm4gbmV3IEZpbGVJbnB1dEVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvVGV4dChpbnB1dCkpeyAgICAgIHJldHVybiBuZXcgVGV4dElucHV0RWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9WaWRlbyhpbnB1dCkpeyAgICAgcmV0dXJuIG5ldyBWaWRlb0VsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvVGV4dG5vZGUoaW5wdXQpKXsgIHJldHVybiBuZXcgVGV4dG5vZGVFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb09wdGlvbihpbnB1dCkpeyAgICByZXR1cm4gbmV3IE9wdGlvbkVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvU2VsZWN0KGlucHV0KSl7ICAgIHJldHVybiBuZXcgU2VsZWN0RWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9TaW1wbGUoaW5wdXQpKXsgICAgcmV0dXJuIG5ldyBTaW1wbGVFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWFwcGluZyB0byBzaW1wbGUgYnkgZGVmYXVsdCBcIiArIGlucHV0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBTaW1wbGVFbGVtZW50KGlucHV0LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9SYWRpbyhpbnB1dCl7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgaW5wdXQudHlwZSA9PT0gXCJyYWRpb1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwiaW5wdXRcIiAmJiBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICYmXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJyYWRpb1wiKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvQ2hlY2tib3goaW5wdXQpe1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmIGlucHV0LnR5cGUgPT09IFwiY2hlY2tib3hcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcImlucHV0XCIgJiYgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSAmJlxuICAgICAgICAgICAgICAgIGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwiY2hlY2tib3hcIikge1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1N1Ym1pdChpbnB1dCl7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgaW5wdXQudHlwZSA9PT0gXCJzdWJtaXRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcImlucHV0XCIgJiYgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSAmJlxuICAgICAgICAgICAgICAgIGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwic3VibWl0XCIpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9Gb3JtKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCkgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJmb3JtXCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9GaWxlKGlucHV0KXtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IFwiZmlsZVwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwiaW5wdXRcIiAmJiBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICYmXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJmaWxlXCIpIHsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1RleHQoaW5wdXQpe1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJ0ZXh0XCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcImhpZGRlblwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJudW1iZXJcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IFwicGFzc3dvcmRcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IFwiZW1haWxcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IFwiZGF0ZVwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJ0aW1lXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJpbnB1dFwiKSB7XG4gICAgICAgICAgICBpZighaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJ0ZXh0XCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmKGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwiaGlkZGVuXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmKGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwibnVtYmVyXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmKGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwicGFzc3dvcmRcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJlbWFpbFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcImRhdGVcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJ0aW1lXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1RleHRub2RlKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIE5vZGUgJiYgaW5wdXQubm9kZVR5cGUgPT09IFwiVEVYVF9OT0RFXCIpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxDZGF0YSk7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb09wdGlvbihpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MT3B0aW9uRWxlbWVudCkgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJvcHRpb25cIik7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBtYXBzVG9TZWxlY3QoaW5wdXQpe1xuICAgICAgICByZXR1cm4gKGlucHV0IGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnQpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwic2VsZWN0XCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9WaWRlbyhpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50KSB8fFxuICAgICAgICAgICAgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcInZpZGVvXCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9UZXh0YXJlYShpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB8fFxuICAgICAgICAgICAgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcInRleHRhcmVhXCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9TaW1wbGUoaW5wdXQpe1xuICAgICAgICByZXR1cm4gKGlucHV0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBNYXAgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IFhtbEVsZW1lbnQgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBFbGVtZW50TWFwcGVyIH0gZnJvbSBcIi4uL2VsZW1lbnQvZWxlbWVudE1hcHBlci5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgVW5pcXVlSWRSZWdpc3RyeSB9IGZyb20gXCIuL3VuaXF1ZUlkUmVnaXN0cnkuanNcIjtcblxuLyoqXG4gKiBDb2xsZWN0cyBpbmZvcm1hdGlvbiB3aGVuIGVsZW1lbnRzIGFyZSBjcmVhdGVkIGFuZCBmaW5kcyB0aGUgcm9vdCBlbGVtZW50LCBjcmVhdGVzIG1hcCBvZiBlbGVtZW50cyBcbiAqL1xuZXhwb3J0IGNsYXNzIEVsZW1lbnRSZWdpc3RyYXRvciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VuaXF1ZUlkUmVnaXN0cnl9IHVuaXF1ZUlkUmVnaXN0cnkgXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbXBvbmVudEluZGV4IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHVuaXF1ZUlkUmVnaXN0cnksIGNvbXBvbmVudEluZGV4KSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtOdW1iZXJ9ICovXG4gICAgICAgIHRoaXMuY29tcG9uZW50SW5kZXggPSBjb21wb25lbnRJbmRleDtcblxuICAgICAgICAvKiogQHR5cGUge1VuaXF1ZUlkUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMudW5pcXVlSWRSZWdpc3RyeSA9IHVuaXF1ZUlkUmVnaXN0cnk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50TWFwID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGdldEVsZW1lbnRNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGlzdGVucyB0byBlbGVtZW50cyBiZWluZyBjcmVhdGVkLCBhbmQgdGFrZXMgaW5uIHRoZSBjcmVhdGVkIFhtbEVsZW1lbnQgYW5kIGl0cyBwYXJlbnQgWG1sRWxlbWVudFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7WG1sRWxlbWVudH0geG1sRWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnRXcmFwcGVyIFxuICAgICAqL1xuICAgIGVsZW1lbnRDcmVhdGVkKHhtbEVsZW1lbnQsIHBhcmVudFdyYXBwZXIpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEVsZW1lbnRNYXBwZXIubWFwKHhtbEVsZW1lbnQsIHBhcmVudFdyYXBwZXIpO1xuXG4gICAgICAgIHRoaXMuYWRkVG9FbGVtZW50SWRNYXAoZWxlbWVudCk7XG5cbiAgICAgICAgaWYodGhpcy5yb290RWxlbWVudCA9PT0gbnVsbCAmJiBlbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIGFkZFRvRWxlbWVudElkTWFwKGVsZW1lbnQpIHtcbiAgICAgICAgaWYoZWxlbWVudCA9PT0gbnVsbCB8fCBlbGVtZW50ID09PSB1bmRlZmluZWQgfHwgIShlbGVtZW50IGluc3RhbmNlb2YgQmFzZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGlkID0gbnVsbDtcbiAgICAgICAgaWYoZWxlbWVudC5jb250YWluc0F0dHJpYnV0ZShcImlkXCIpKSB7XG4gICAgICAgICAgICBpZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJpZFwiKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJpZFwiLHRoaXMudW5pcXVlSWRSZWdpc3RyeS5pZEF0dHJpYnV0ZVdpdGhTdWZmaXgoaWQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGlkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRNYXAuc2V0KGlkLGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7IENvbnRhaW5lckVsZW1lbnQsIENvbnRhaW5lckVsZW1lbnRVdGlscywgQ29udGFpbmVyRXZlbnQsIENvbnRhaW5lcldpbmRvdyB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIi4uL2NvbXBvbmVudC9jb21wb25lbnQuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIENhbnZhc1Jvb3Qge1xuXG4gICAgc3RhdGljIHNob3VsZFN3YWxsb3dOZXh0Rm9jdXNFc2NhcGUgPSBmYWxzZTtcblxuICAgIC8qKiBAdHlwZSB7Q29udGFpbmVyRWxlbWVudH0gKi9cbiAgICBzdGF0aWMgbW91c2VEb3duRWxlbWVudCA9IG51bGw7XG5cbiAgICBzdGF0aWMgZm9jdXNFc2NhcGVFdmVudFJlcXVlc3RlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgXG4gICAgICovXG4gICAgc3RhdGljIHJlcGxhY2VDb21wb25lbnQoaWQsIGNvbXBvbmVudCkge1xuICAgICAgICBjb25zdCBib2R5RWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGJvZHlFbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGNvbXBvbmVudC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50LCBib2R5RWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgXG4gICAgICovXG4gICAgc3RhdGljIHNldENvbXBvbmVudChpZCwgY29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgYm9keUVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKGNvbXBvbmVudC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50LCBib2R5RWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgXG4gICAgICovXG4gICAgc3RhdGljIGFkZENoaWxkQ29tcG9uZW50KGlkLCBjb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgYm9keUVsZW1lbnQgPSBDb250YWluZXJFbGVtZW50VXRpbHMuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBib2R5RWxlbWVudC5hcHBlbmRDaGlsZChjb21wb25lbnQucm9vdEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgXG4gICAgICovXG4gICAgc3RhdGljIGFkZENoaWxkRWxlbWVudChpZCwgZWxlbWVudCkge1xuICAgICAgICBjb25zdCBib2R5RWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVFbGVtZW50KGlkKSB7XG4gICAgICAgIENvbnRhaW5lckVsZW1lbnRVdGlscy5yZW1vdmVFbGVtZW50KGlkKTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRIZWFkZXJFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLmFwcGVuZFJvb3RNZXRhQ2hpbGQoZWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRCb2R5RWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIENvbnRhaW5lckVsZW1lbnRVdGlscy5hcHBlbmRSb290VWlDaGlsZChlbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgc3RhdGljIHByZXBlbmRIZWFkZXJFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnByZXBlbmRFbGVtZW50KFwiaGVhZFwiLCBlbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgc3RhdGljIHByZXBlbmRCb2R5RWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIENvbnRhaW5lckVsZW1lbnRVdGlscy5wcmVwZW5kRWxlbWVudChcImJvZHlcIiwgZWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogUmVtZW1iZXIgdG8gc3dhbGxvd0ZvY3VzRXNjYXBlIGZvciBpbml0aWFsIHRyaWdnZXJpbmcgZXZlbnRzXG4gICAgICogd2hpY2ggYXJlIGV4dGVybmFsIHRvIGZvY3VzUm9vdFxuICAgICAqIFxuICAgICAqIEFsc28gcmVtZW1iZXIgdG8ga2VlcCB0aGUgZGVzdHJveSBmdW5jdGlvbiBhbmQgY2FsbCBpdFxuICAgICAqIHdoZW4gdGhlIGxpc3RlbmVyIGlzIG5vIGxvbmdlciBuZWVkZWRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBmb2N1c1Jvb3RcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lckZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRPYmplY3RcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IGRlc3Ryb3kgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tIHRoZSBjb250YWluZXIgd2luZG93XG4gICAgICovXG4gICAgc3RhdGljIGxpc3RlblRvRm9jdXNFc2NhcGUoZm9jdXNSb290LCBsaXN0ZW5lckZ1bmN0aW9uLCBjb250ZXh0T2JqZWN0KSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBNZXRob2QobGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCk7XG5cbiAgICAgICAgY29uc3QgZGVzdHJveUZ1bmN0aW9ucyA9IFtdO1xuXG4gICAgICAgIC8qIEhhY2s6IEJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBhIHdheSBvZiBrbm93aW5nIGluIHRoZSBjbGljayBldmVudCB3aGljaCBlbGVtZW50IHdhcyBpbiBmb2N1cyB3aGVuIG1vdXNlZG93biBvY2N1cmVkICovXG4gICAgICAgIGlmICghQ2FudmFzUm9vdC5mb2N1c0VzY2FwZUV2ZW50UmVxdWVzdGVkKSB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVNb3VzZURvd25FbGVtZW50ID0gbmV3IE1ldGhvZCgoLyoqIEB0eXBlIHtDb250YWluZXJFdmVudH0gKi8gZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBDYW52YXNSb290Lm1vdXNlRG93bkVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRlc3Ryb3lGdW5jdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICBDb250YWluZXJXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB1cGRhdGVNb3VzZURvd25FbGVtZW50KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIENhbnZhc1Jvb3QuZm9jdXNFc2NhcGVFdmVudFJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjYWxsSWZOb3RDb250YWlucyA9IG5ldyBNZXRob2QoKC8qKiBAdHlwZSB7Q29udGFpbmVyRXZlbnR9ICovIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBDYW52YXNSb290Lm1vdXNlRG93bkVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBpZiAoQ29udGFpbmVyRWxlbWVudFV0aWxzLmNvbnRhaW5zKGZvY3VzUm9vdC5jb250YWluZXJFbGVtZW50LCBDYW52YXNSb290Lm1vdXNlRG93bkVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgbm90IGNvbm5lY3RlZCwgdGhlbiB0aGUgZWxlbWVudCBpcyBub3QgdmlzaWJsZVxuICAgICAgICAgICAgLy8gYW5kIHdlIHNob3VsZCBub3QgdHJpZ2dlciBmb2N1cyBlc2NhcGUgZXZlbnRzXG4gICAgICAgICAgICBpZiAoIUNvbnRhaW5lckVsZW1lbnRVdGlscy5pc0Nvbm5lY3RlZChDYW52YXNSb290Lm1vdXNlRG93bkVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKENhbnZhc1Jvb3Quc2hvdWxkU3dhbGxvd05leHRGb2N1c0VzY2FwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzdHJveUZ1bmN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgQ29udGFpbmVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgY2FsbElmTm90Q29udGFpbnMpXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGRlc3Ryb3lGdW5jdGlvbnMuZm9yRWFjaChkZXN0cm95ID0+IGRlc3Ryb3koKSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hlbiBhbiBlbGVtZW50IGlzIGNvbmdpZ3VyZWQgdG8gYmUgaGlkZGVuIGJ5IEZvY3VzRXNjYXBlLFxuICAgICAqIGFuZCB3YXMgc2hvd24gYnkgYW4gZXZlbnQgdHJpZ2dlcmVkIGZyb20gYW4gZXh0ZXJuYWwgZWxlbWVudCxcbiAgICAgKiB0aGVuIEZvY3VzRXNjYXBlIGdldHMgdHJpZ2dlcmVkIHJpZ2h0IGFmdGVyIHRoZSBlbGVtZW50IGlzXG4gICAgICogc2hvd24uIFRoZXJlZm9yZSB0aGlzIGZ1bmN0aW9uIGFsbG93cyB0aGlzIGV2ZW50IHRvIGJlIFxuICAgICAqIHN3YWxsb3dlZCB0byBhdm9pZCB0aGlzIGJlaGF2aW9yXG4gICAgICogXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZvck1pbGxpc2Vjb25kcyBcbiAgICAgKi9cbiAgICBzdGF0aWMgc3dhbGxvd0ZvY3VzRXNjYXBlKGZvck1pbGxpc2Vjb25kcykge1xuICAgICAgICBDYW52YXNSb290LnNob3VsZFN3YWxsb3dOZXh0Rm9jdXNFc2NhcGUgPSB0cnVlO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIENhbnZhc1Jvb3Quc2hvdWxkU3dhbGxvd05leHRGb2N1c0VzY2FwZSA9IGZhbHNlO1xuICAgICAgICB9LCBmb3JNaWxsaXNlY29uZHMpO1xuICAgIH1cbn0iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmltcG9ydCB7WG1sQXR0cmlidXRlLCBYbWxFbGVtZW50fSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQge0VsZW1lbnRNYXBwZXJ9IGZyb20gXCIuLi9lbGVtZW50L2VsZW1lbnRNYXBwZXIuanNcIjtcblxuZXhwb3J0IGNsYXNzIEhUTUx7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZWxlbWVudE5hbWUgXG4gICAgICogQHBhcmFtIHtNYXA8U3RyaW5nLCBTdHJpbmc+fSBhdHRyaWJ1dGVNYXAgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGN1c3RvbShlbGVtZW50TmFtZSwgYXR0cmlidXRlTWFwID0gbnVsbCl7XG4gICAgICAgIGNvbnN0IHhtbEVsZW1lbnQgPSBuZXcgWG1sRWxlbWVudChlbGVtZW50TmFtZSk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVNYXApIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgeG1sRWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBuZXcgWG1sQXR0cmlidXRlKGtleSwgbnVsbCwgdmFsdWUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBFbGVtZW50TWFwcGVyLm1hcCh4bWxFbGVtZW50KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXBwbHlTdHlsZXMoZWxlbWVudCwgY2xhc3NWYWx1ZSwgc3R5bGVWYWx1ZSl7XG4gICAgICAgIGlmKGNsYXNzVmFsdWUpe1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIsIGNsYXNzVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHN0eWxlVmFsdWUpe1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIsIHN0eWxlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGEodmFsdWUsIGhyZWYsIGNsYXNzVmFsdWUsIHN0eWxlVmFsdWUpe1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gSFRNTC5jdXN0b20oXCJhXCIpO1xuICAgICAgICBlbGVtZW50LmFkZENoaWxkKHZhbHVlKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImhyZWZcIixocmVmKTtcbiAgICAgICAgSFRNTC5hcHBseVN0eWxlcyhlbGVtZW50LCBjbGFzc1ZhbHVlLCBzdHlsZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGkodmFsdWUsIGNsYXNzVmFsdWUsIHN0eWxlVmFsdWUpe1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gSFRNTC5jdXN0b20oXCJpXCIpO1xuICAgICAgICBlbGVtZW50LmFkZENoaWxkKHZhbHVlKTtcbiAgICAgICAgSFRNTC5hcHBseVN0eWxlcyhlbGVtZW50LCBjbGFzc1ZhbHVlLCBzdHlsZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgTWFwLCBMaXN0LCBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENhbnZhc1Jvb3QgfSBmcm9tIFwiLi9jYW52YXNSb290LmpzXCI7XG5pbXBvcnQgeyBIVE1MIH0gZnJvbSBcIi4uL2h0bWwvaHRtbC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgVGV4dG5vZGVFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvdGV4dG5vZGVFbGVtZW50LmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJDYW52YXNTdHlsZXNcIik7XG5cbmNvbnN0IHN0eWxlcyA9IG5ldyBNYXAoKTtcbmNvbnN0IHN0eWxlT3duZXJzID0gbmV3IE1hcCgpO1xuY29uc3QgZW5hYmxlZFN0eWxlcyA9IG5ldyBMaXN0KCk7XG5cbmV4cG9ydCBjbGFzcyBDYW52YXNTdHlsZXMge1xuXG4gICAgc3RhdGljIHNldFN0eWxlKG5hbWUsIHNvdXJjZSkge1xuICAgICAgICBpZihzdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIHN0eWxlcy5nZXQobmFtZSkuc2V0Q2hpbGQobmV3IFRleHRub2RlRWxlbWVudChzb3VyY2UuZ2V0U3R5bGVzU291cmNlKCkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgICAgICBsZXQgc3R5bGVFbGVtZW50ID0gSFRNTC5jdXN0b20oXCJzdHlsZVwiKTtcbiAgICAgICAgICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImlkXCIsbmFtZSk7XG4gICAgICAgICAgICBzdHlsZUVsZW1lbnQuc2V0Q2hpbGQobmV3IFRleHRub2RlRWxlbWVudChzb3VyY2UuZ2V0U3R5bGVzU291cmNlKCkpKTtcbiAgICAgICAgICAgIHN0eWxlcy5zZXQobmFtZSwgc3R5bGVFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyByZW1vdmVTdHlsZShuYW1lKSB7XG4gICAgICAgIGlmKGVuYWJsZWRTdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIGVuYWJsZWRTdHlsZXMucmVtb3ZlKG5hbWUpO1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5yZW1vdmVFbGVtZW50KG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHN0eWxlcy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgc3R5bGVzLnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBkaXNhYmxlU3R5bGUobmFtZSwgb3duZXJJZCA9IDApIHtcbiAgICAgICAgQ2FudmFzU3R5bGVzLnJlbW92ZVN0eWxlT3duZXIobmFtZSwgb3duZXJJZCk7XG4gICAgICAgIGlmKENhbnZhc1N0eWxlcy5oYXNTdHlsZU93bmVyKG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoIXN0eWxlcy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgTE9HLmVycm9yKFwiU3R5bGUgZG9lcyBub3QgZXhpc3Q6IFwiICsgbmFtZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoZW5hYmxlZFN0eWxlcy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgZW5hYmxlZFN0eWxlcy5yZW1vdmUobmFtZSk7XG4gICAgICAgICAgICBDYW52YXNSb290LnJlbW92ZUVsZW1lbnQobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZW5hYmxlU3R5bGUobmFtZSwgb3duZXJJZCA9IDApIHtcbiAgICAgICAgQ2FudmFzU3R5bGVzLmFkZFN0eWxlT3duZXIobmFtZSwgb3duZXJJZCk7XG4gICAgICAgIGlmKCFzdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcihcIlN0eWxlIGRvZXMgbm90IGV4aXN0OiBcIiArIG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFlbmFibGVkU3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBlbmFibGVkU3R5bGVzLmFkZChuYW1lKTtcbiAgICAgICAgICAgIENhbnZhc1Jvb3QuYWRkSGVhZGVyRWxlbWVudChzdHlsZXMuZ2V0KG5hbWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBhZGRTdHlsZU93bmVyKG5hbWUsIG93bmVySWQpIHtcbiAgICAgICAgaWYoIXN0eWxlT3duZXJzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBzdHlsZU93bmVycy5zZXQobmFtZSwgbmV3IExpc3QoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoIXN0eWxlT3duZXJzLmdldChuYW1lKS5jb250YWlucyhvd25lcklkKSkge1xuICAgICAgICAgICAgc3R5bGVPd25lcnMuZ2V0KG5hbWUpLmFkZChvd25lcklkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyByZW1vdmVTdHlsZU93bmVyKG5hbWUsIG93bmVySWQpIHtcbiAgICAgICAgaWYoIXN0eWxlT3duZXJzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3R5bGVPd25lcnMuZ2V0KG5hbWUpLnJlbW92ZShvd25lcklkKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaGFzU3R5bGVPd25lcihuYW1lKSB7XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHlsZU93bmVycy5nZXQobmFtZSkuc2l6ZSgpID4gMDtcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIENvbXBvbmVudEZhY3Rvcnkge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29tcG9uZW50TmFtZSBcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGNyZWF0ZShjb21wb25lbnROYW1lKSB7XG4gICAgICAgIHRocm93IFwiTm90IGltcGxlbWVudGVkXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgSW5qZWN0aW9uUG9pbnQgfSBmcm9tIFwibWluZGlfdjFcIjtcbmltcG9ydCB7IERvbVRyZWUgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuL2NvbXBvbmVudC5qc1wiO1xuaW1wb3J0IHsgVW5pcXVlSWRSZWdpc3RyeSB9IGZyb20gXCIuL3VuaXF1ZUlkUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IEVsZW1lbnRSZWdpc3RyYXRvciB9IGZyb20gXCIuL2VsZW1lbnRSZWdpc3RyYXRvci5qc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gXCIuLi90ZW1wbGF0ZS90ZW1wbGF0ZVJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBTdHlsZXNSZWdpc3RyeSB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IENhbnZhc1N0eWxlcyB9IGZyb20gXCIuLi9jYW52YXMvY2FudmFzU3R5bGVzLmpzXCI7XG5pbXBvcnQgeyBDb21wb25lbnRGYWN0b3J5IH0gZnJvbSBcIi4vY29tcG9uZW50RmFjdG9yeS5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiVGVtcGxhdGVDb21wb25lbnRGYWN0b3J5XCIpO1xuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVDb21wb25lbnRGYWN0b3J5IGV4dGVuZHMgQ29tcG9uZW50RmFjdG9yeXtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZXNSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy5zdHlsZXNSZWdpc3RyeSA9IEluamVjdGlvblBvaW50Lmluc3RhbmNlKFN0eWxlc1JlZ2lzdHJ5KTtcblxuICAgICAgICAvKiogQHR5cGUge1RlbXBsYXRlUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVSZWdpc3RyeSA9IEluamVjdGlvblBvaW50Lmluc3RhbmNlKFRlbXBsYXRlUmVnaXN0cnkpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VW5pcXVlSWRSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy51bmlxdWVJZFJlZ2lzdHJ5ID0gSW5qZWN0aW9uUG9pbnQuaW5zdGFuY2UoVW5pcXVlSWRSZWdpc3RyeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2xhc3NUeXBlIHJlcHJlc2VudHMgdGhlIHRlbXBsYXRlIGFuZCB0aGUgc3R5bGVzIG5hbWUgaWYgdGhlIHN0eWxlIGZvciB0aGF0IG5hbWUgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgY3JlYXRlKGNsYXNzVHlwZSl7XG4gICAgICAgIGlmICghY2xhc3NUeXBlLlRFTVBMQVRFX1VSTCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgY29tcG9uZW50IGNsYXNzIG11c3QgaW1wbGVtZW50IHN0YXRpYyBtZW1iZXIgVEVNUExBVEVfVVJMXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5LmdldChjbGFzc1R5cGUubmFtZSk7XG4gICAgICAgIGlmKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgTE9HLmVycm9yKHRoaXMudGVtcGxhdGVSZWdpc3RyeSk7XG4gICAgICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyB0ZW1wbGF0ZSB3YXMgZm91bmQgd2l0aCBuYW1lIFwiICsgY2xhc3NUeXBlLm5hbWUpO1xuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWxlbWVudFJlZ2lzdHJhdG9yID0gbmV3IEVsZW1lbnRSZWdpc3RyYXRvcih0aGlzLnVuaXF1ZUlkUmVnaXN0cnksIHRlbXBsYXRlQ29tcG9uZW50Q291bnRlcisrKTtcbiAgICAgICAgbmV3IERvbVRyZWUodGVtcGxhdGUuZ2V0VGVtcGxhdGVTb3VyY2UoKSwgZWxlbWVudFJlZ2lzdHJhdG9yKS5sb2FkKCk7XG5cbiAgICAgICAgaWYgKGNsYXNzVHlwZS5TVFlMRVNfVVJMKSB7XG4gICAgICAgICAgICB0aGlzLm1vdW50U3R5bGVzKGNsYXNzVHlwZS5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50KGVsZW1lbnRSZWdpc3RyYXRvci5jb21wb25lbnRJbmRleCwgZWxlbWVudFJlZ2lzdHJhdG9yLnJvb3RFbGVtZW50LCBlbGVtZW50UmVnaXN0cmF0b3IuZ2V0RWxlbWVudE1hcCgpKTtcbiAgICB9XG5cbiAgICBtb3VudFN0eWxlcyhuYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlc1JlZ2lzdHJ5LmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBDYW52YXNTdHlsZXMuc2V0U3R5bGUobmFtZSwgdGhpcy5zdHlsZXNSZWdpc3RyeS5nZXQobmFtZSkpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbmxldCB0ZW1wbGF0ZUNvbXBvbmVudENvdW50ZXIgPSAwOyIsImltcG9ydCB7IFRyYWlsTm9kZSB9IGZyb20gXCIuL3RyYWlsTm9kZS5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVHJhaWxJdGVyYXRpb24ge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGV9IHRyYWlsTm9kZSBcbiAgICAgKiBAcGFyYW0ge1RyYWlsTm9kZVtdfSB0cmFpbE5vZGVQYXRoIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRyYWlsTm9kZSA9IG51bGwsIHRyYWlsTm9kZVBhdGggPSBbXSkge1xuICAgICAgICAvKiogQHR5cGUge1RyYWlsTm9kZX0gKi9cbiAgICAgICAgdGhpcy50cmFpbE5vZGUgPSB0cmFpbE5vZGU7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtUcmFpbE5vZGVbXX0gKi9cbiAgICAgICAgdGhpcy50cmFpbE5vZGVQYXRoID0gdHJhaWxOb2RlUGF0aDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IFRyYWlsTm9kZSB9IGZyb20gXCIuL3RyYWlsTm9kZS5qc1wiO1xuaW1wb3J0IHsgSGlzdG9yeSB9IGZyb20gXCIuL2hpc3RvcnkuanNcIjtcbmltcG9ydCB7IFVybEJ1aWxkZXIgfSBmcm9tIFwiLi4vdXRpbC91cmxCdWlsZGVyLmpzXCI7XG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi4vdXRpbC91cmwuanNcIjtcbmltcG9ydCB7IFRyYWlsSXRlcmF0aW9uIH0gZnJvbSBcIi4vdHJhaWxJdGVyYXRpb24uanNcIjtcbmltcG9ydCB7IENvbnRhaW5lclVybCB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIlRyYWlsUHJvY2Vzc29yXCIpO1xuXG5leHBvcnQgY2xhc3MgVHJhaWxQcm9jZXNzb3Ige1xuXG4gICAgLyoqXG4gICAgICogVUkgcmVmZXJzIHRvIHRoZSB3ZWIgYXBwbGljYXRpb24uIFVJIG5hdmlnYXRpb24gbWVhbnMgYW55IG9wZXJhdGlvblxuICAgICAqIHBlcmZvcm1lZCB3aXRoaW4gdGhlIHdlYiBhcHAgd2hpY2ggc2hvdWxkIHRyaWdnZXIgYSBuYXZpZ2F0aW9uIGNoYW5nZS5cbiAgICAgKiBcbiAgICAgKiBBIFVJIG5hdmlnYXRpb24gY2hhbmdlIHdpbGwgdXBkYXRlIHRoZSBicm93c2VyIGhpc3RvcnkgKHB1c2ggYSBuZXcgdXJsIHN0YXRlKVxuICAgICAqIGFzIHRoaXMgZG9lcyBub3QgaGFwcGVuIHRocm91Z2ggYnJvd3NlciBjb250cm9scyAoYmFjay9mb3J3YXJkIGJ1dHRvbnMvdXJsIGJhcikuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuIFxuICAgICAqIEBwYXJhbSB7YW55fSBjdXJyZW50T2JqZWN0XG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGV9IHRyYWlsTm9kZSBcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJlcGxhY2VDdXJyZW50VXJsXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlV2F5cG9pbnRzXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBzdGF0aWMgdWlOYXZpZ2F0ZShmdW4sIGN1cnJlbnRPYmplY3QsIHRyYWlsTm9kZSwgcmVwbGFjZUN1cnJlbnRVcmwgPSBmYWxzZSwgaW5jbHVkZVdheXBvaW50cyA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IHRyYWlsTm9kZXNQYXRoID0gVHJhaWxQcm9jZXNzb3Iubm9kZXNQYXRoQnlGdW5jdGlvbihmdW4sIHRyYWlsTm9kZSk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gbnVsbDtcblxuICAgICAgICBpZiAoIXRyYWlsTm9kZXNQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VycmVudFRyYWlsID0gXCJcIjtcbiAgICAgICAgZm9yIChjb25zdCB0cmFpbE5vZGUgb2YgdHJhaWxOb2Rlc1BhdGgpIHtcblxuICAgICAgICAgICAgaWYgKCF0cmFpbE5vZGUudHJhaWwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUcmFpbFByb2Nlc3Nvci51aU5hdmlnYXRlOiBUcmFpbE5vZGUgaW4gcGF0aCBoYXMgbm8gdHJhaWwgZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFRyYWlsICs9IHRyYWlsTm9kZS50cmFpbDtcblxuICAgICAgICAgICAgaWYgKHRyYWlsTm9kZS5wcm9wZXJ0eSAmJiBjdXJyZW50T2JqZWN0W3RyYWlsTm9kZS5wcm9wZXJ0eV0pIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gY3VycmVudE9iamVjdFt0cmFpbE5vZGUucHJvcGVydHldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYWlsTm9kZS53YXlwb2ludCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdHJhaWxOb2RlLndheXBvaW50LmNhbGwoY3VycmVudE9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5jbHVkZVdheXBvaW50cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFVybEJ1aWxkZXIuY3JlYXRlKCkud2l0aFVybChDb250YWluZXJVcmwuY3VycmVudFVybCgpKS53aXRoQW5jaG9yKGN1cnJlbnRUcmFpbCkuYnVpbGQoKTtcbiAgICAgICAgICAgICAgICBIaXN0b3J5LnB1c2hVcmwodXJsLCB1cmwudG9TdHJpbmcoKSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWluY2x1ZGVXYXlwb2ludHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IFVybEJ1aWxkZXIuY3JlYXRlKCkud2l0aFVybChDb250YWluZXJVcmwuY3VycmVudFVybCgpKS53aXRoQW5jaG9yKGN1cnJlbnRUcmFpbCkuYnVpbGQoKTtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlQ3VycmVudFVybCkge1xuICAgICAgICAgICAgICAgIEhpc3RvcnkucmVwbGFjZVVybCh1cmwsIHVybC50b1N0cmluZygpLCBudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgIFxuICAgICAgICAgICAgICAgIEhpc3RvcnkucHVzaFVybCh1cmwsIHVybC50b1N0cmluZygpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsaWVudCByZWZlcnMgdG8gdGhlIGJyb3dzZXIgb3IgY29udGFpbmVyIGhvc3RpbmcgdGhlIHdlYiBhcHBsaWNhdGlvbi5cbiAgICAgKiBBIGNsaWVudCBuYXZpZ2F0aW9uIG1lYW5zIHRoZSB1c2VyIGhhcyBwZXJmb3JtZWQgYSBuYXZpZ2F0aW9uIGFjdGlvbiBmcm9tXG4gICAgICogdGhlIGJyb3dzZXIgY29udHJvbHMgKGJhY2svZm9yd2FyZCBidXR0b25zL3VybCBiYXIpLlxuICAgICAqIFxuICAgICAqIFRoZSBuZWNlc3NhcnkgZnVuY3Rpb25zIGFsb25nIHRoZSB0cmFpbCBhcmUgdHJpZ2dlcmVkIHRvIGJyaW5nIHRoZSBhcHBsaWNhdGlvblxuICAgICAqIHRvIHRoZSBjb3JyZWN0IHN0YXRlLiBCdXQgdGhlIGJyb3dzZXIgaGlzdG9yeSBpcyBub3QgdXBkYXRlZCBhcyB0aGlzIG5hdmlnYXRpb25cbiAgICAgKiBvcmlnaW5hdGVzIGZyb20gdGhlIGJyb3dzZXIgY29udHJvbHMuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcGFyYW0ge2FueX0gY3VycmVudE9iamVjdFxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSB0cmFpbE5vZGVcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHN0YXRpYyBjbGllbnROYXZpZ2F0ZSh1cmwsIGN1cnJlbnRPYmplY3QsIHRyYWlsTm9kZSkge1xuICAgICAgICBjb25zdCB0cmFpbE5vZGVzUGF0aCA9IFRyYWlsUHJvY2Vzc29yLm5vZGVzUGF0aEJ5VHJhaWwodXJsLmFuY2hvciwgdHJhaWxOb2RlKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBudWxsO1xuXG4gICAgICAgIGlmICghdHJhaWxOb2Rlc1BhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgdHJhaWxOb2RlIG9mIHRyYWlsTm9kZXNQYXRoKSB7XG5cbiAgICAgICAgICAgIGlmICh0cmFpbE5vZGUucHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gY3VycmVudE9iamVjdFt0cmFpbE5vZGUucHJvcGVydHldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYWlsTm9kZS53YXlwb2ludCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdHJhaWxOb2RlLndheXBvaW50LmNhbGwoY3VycmVudE9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdGhlRnVuY3Rpb24gXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGV9IHJvb3QgXG4gICAgICogQHJldHVybnMge1RyYWlsTm9kZVtdfVxuICAgICAqL1xuICAgIHN0YXRpYyBub2Rlc1BhdGhCeUZ1bmN0aW9uKHRoZUZ1bmN0aW9uLCByb290KSB7XG5cbiAgICAgICAgaWYgKCFyb290KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGl0ZXJhdGlvbiA9IG5ldyBUcmFpbEl0ZXJhdGlvbihyb290LCBbcm9vdF0pO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtpdGVyYXRpb25dO1xuXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SXRlcmF0aW9uID0gc3RhY2sucG9wKCk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5kZXN0aW5hdGlvbiA9PT0gdGhlRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dCAmJiBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3IFRyYWlsSXRlcmF0aW9uKGNoaWxkLCBbLi4uY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoLCBjaGlsZF0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdHJhaWwgXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGV9IHJvb3QgXG4gICAgICogQHJldHVybnMge1RyYWlsTm9kZVtdfVxuICAgICAqL1xuICAgIHN0YXRpYyBub2Rlc1BhdGhCeVRyYWlsKHRyYWlsLCByb290KSB7XG5cbiAgICAgICAgaWYgKCFyb290KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGl0ZXJhdGlvbiA9IG5ldyBUcmFpbEl0ZXJhdGlvbihyb290LCBbcm9vdF0pO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtpdGVyYXRpb25dO1xuXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SXRlcmF0aW9uID0gc3RhY2sucG9wKCk7XG5cbiAgICAgICAgICAgIGxldCBjdXJyZW50VHJhaWwgPSBcIlwiO1xuICAgICAgICAgICAgY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhaWwgKz0gbm9kZS50cmFpbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudFRyYWlsID09PSB0cmFpbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZVBhdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0ICYmIGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dFtpXTtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChuZXcgVHJhaWxJdGVyYXRpb24oY2hpbGQsIFsuLi5jdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZVBhdGgsIGNoaWxkXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbn0iLCJleHBvcnQgY2xhc3MgU3R5bGVTZWxlY3RvciB7XG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihjbGFzc05hbWUpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBTdHJpbmc+fSAqL1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgICAqL1xuICAgIHdpdGhBdHRyaWJ1dGUoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgYXR0clN0cmluZyA9IFwiXCI7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBhdHRyU3RyaW5nICs9IGBcXHQke2tleX06ICR7dmFsdWV9O1xcbmA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5jbGFzc05hbWV9IHtcXG4ke2F0dHJTdHJpbmd9fWA7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgU3R5bGVTZWxlY3RvciB9IGZyb20gXCIuL3N0eWxlU2VsZWN0b3JcIjtcblxuZXhwb3J0IGNsYXNzIFN0eWxlTWVkaWEge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1lZGlhIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lZGlhKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMubWVkaWEgPSBtZWRpYTtcblxuICAgICAgICAvKiogQHR5cGUge0FycmF5PFN0eWxlU2VsZWN0b3I+fSAqL1xuICAgICAgICB0aGlzLnN0eWxlU2VsZWN0b3JBcnJheSA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3R5bGVTZWxlY3Rvcn0gc3R5bGVTZWxlY3RvclxuICAgICAqIEByZXR1cm5zIHtTdHlsZU1lZGlhfVxuICAgICAqL1xuICAgIHdpdGhTZWxlY3RvcihzdHlsZVNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuc3R5bGVTZWxlY3RvckFycmF5LnNldChzdHlsZVNlbGVjdG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IG1lZGlhU3RyaW5nID0gXCJcIjtcbiAgICAgICAgdGhpcy5zdHlsZVNlbGVjdG9yQXJyYXkuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIG1lZGlhU3RyaW5nICs9IGAke3ZhbHVlLnRvU3RyaW5nKCl9XFxuYDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLm1lZGlhfSB7XFxuJHttZWRpYVN0cmluZ31cXG59XFxuYDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBTdHlsZU1lZGlhIH0gZnJvbSBcIi4vc3R5bGVNZWRpYVwiO1xuaW1wb3J0IHsgU3R5bGVTZWxlY3RvciB9IGZyb20gXCIuL3N0eWxlU2VsZWN0b3JcIjtcbmltcG9ydCB7IFN0eWxlc2hlZXQgfSBmcm9tIFwiLi9zdHlsZXNoZWV0XCI7XG5cbmV4cG9ydCBjbGFzcyBTdHlsZXNoZWV0QnVpbGRlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHlsZXNoZWV0QnVpbGRlcigpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVTZWxlY3RvcltdfSAqL1xuICAgICAgICB0aGlzLnN0eWxlU2VsZWN0b3JBcnJheSA9IFtdO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVNZWRpYVtdfSAqL1xuICAgICAgICB0aGlzLm1lZGlhQXJyYXkgPSBbXTtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlU2VsZWN0b3J8U3R5bGVNZWRpYX0gKi9cbiAgICAgICAgdGhpcy5sYXN0QWRkZWQgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVTZWxlY3RvcnxTdHlsZU1lZGlhfSAqL1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVTZWxlY3RvcnxTdHlsZU1lZGlhfSAqL1xuICAgICAgICB0aGlzLnBhcmVudENvbnRleHQgPSBudWxsO1xuXG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxhc3RBZGRlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY29udGV4dCB0byBvcGVuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhc3RBZGRlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Q29udGV4dCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMubGFzdEFkZGVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBjb250ZXh0IHRvIGNsb3NlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMucGFyZW50Q29udGV4dDtcbiAgICAgICAgdGhpcy5wYXJlbnRDb250ZXh0ID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlU2VsZWN0b3JOYW1lIFxuICAgICAqIEByZXR1cm5zIHtTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBzZWxlY3RvcihzdHlsZVNlbGVjdG9yTmFtZSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gbmV3IFN0eWxlU2VsZWN0b3Ioc3R5bGVTZWxlY3Rvck5hbWUpO1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlU2VsZWN0b3JBcnJheS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2UgaWYodGhpcy5jb250ZXh0IGluc3RhbmNlb2YgU3R5bGVNZWRpYSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0eWxlU2VsZWN0b3JBcnJheS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBPcGVuIGNvbnRleHQgbXVzdCBiZSBhIG1lZGlhIGNvbnRleHQgd2hlbiBhZGRpbmcgJHtzdHlsZVNlbGVjdG9yTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RBZGRlZCA9IGVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1lZGlhKG1lZGlhU2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgYWRkIG1lZGlhICR7bWVkaWFTZWxlY3Rvcn0gaW5zaWRlIG9wZW4gY29udGV4dGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBuZXcgU3R5bGVNZWRpYShtZWRpYVNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5tZWRpYUFycmF5LnB1c2goZWxlbWVudCk7XG4gICAgICAgIHRoaXMubGFzdEFkZGVkID0gZWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5IFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsdWUgXG4gICAgICogQHJldHVybnMge1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHN0eWxlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoISh0aGlzLmNvbnRleHQgaW5zdGFuY2VvZiBTdHlsZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBvcGVuIHNlbGVjdG9yIGNvbnRleHQgd2hlbiBhZGRpbmcgc3R5bGUgJHtwcm9wZXJ0eX1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQud2l0aEF0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3R5bGVzaGVldH1cbiAgICAgKi9cbiAgICBidWlsZCgpIHtcbiAgICAgICAgbGV0IHN0eWxlc1N0cmluZyA9IFwiXCI7XG4gICAgICAgIHRoaXMuc3R5bGVTZWxlY3RvckFycmF5LmZvckVhY2goKHN0eWxlU2VsZWN0b3IpID0+IHtcbiAgICAgICAgICAgIHN0eWxlc1N0cmluZyArPSBzdHlsZVNlbGVjdG9yLnRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5tZWRpYUFycmF5LmZvckVhY2goKHN0eWxlTWVkaWEpID0+IHtcbiAgICAgICAgICAgIHN0eWxlc1N0cmluZyArPSBzdHlsZU1lZGlhLnRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHlsZXNoZWV0KHN0eWxlc1N0cmluZyk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vdW5pcXVlSWRSZWdpc3RyeVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudFwiO1xuaW1wb3J0IHsgSFRNTCB9IGZyb20gXCIuLi9odG1sL2h0bWxcIjtcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEJ1aWxkZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVbmlxdWVJZFJlZ2lzdHJ5fSBpZFJlZ2lzdHJ5XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZShpZFJlZ2lzdHJ5KSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50QnVpbGRlcihpZFJlZ2lzdHJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1VuaXF1ZUlkUmVnaXN0cnl9IGlkUmVnaXN0cnlcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpZFJlZ2lzdHJ5KSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtVbmlxdWVJZFJlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLmlkUmVnaXN0cnkgPSBpZFJlZ2lzdHJ5O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgQmFzZUVsZW1lbnQ+fSAqL1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5sYXN0QWRkZWRFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50W119ICovXG4gICAgICAgIHRoaXMudHJhaWwgPSBbXTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VW5pcXVlSWRSZWdpc3RyeX0gaWRSZWdpc3RyeVxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgQmFzZUVsZW1lbnQ+fSBlbGVtZW50TWFwXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZyBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBhdHRyaWJ1dGVBcnJheSBcbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHRhZyhpZFJlZ2lzdHJ5LCBlbGVtZW50TWFwLCB0YWcsIC4uLmF0dHJpYnV0ZUFycmF5KSB7XG5cbiAgICAgICAgY29uc3QgYXR0cmlidXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBhdHRyaWJ1dGVBcnJheS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBhdHRyLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgYXR0cmlidXRlTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudH0gKi9cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEhUTUwuY3VzdG9tKHRhZywgYXR0cmlidXRlTWFwKTtcblxuICAgICAgICBhdHRyaWJ1dGVNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKFwiaWRcIiA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudE1hcC5zZXQodmFsdWUsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gaWRSZWdpc3RyeS5pZEF0dHJpYnV0ZVdpdGhTdWZmaXgodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZyBcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmdbXX0gYXR0cmlidXRlQXJyYXkgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcm9vdCh0YWcsIC4uLmF0dHJpYnV0ZUFycmF5KSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBSb290IGVsZW1lbnQgaXMgYWxyZWFkeSBkZWZpbmVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gQ29tcG9uZW50QnVpbGRlci50YWcodGhpcy5pZFJlZ2lzdHJ5LCB0aGlzLmVsZW1lbnRNYXAsIHRhZywgLi4uYXR0cmlidXRlQXJyYXkpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSB0aGlzLnJvb3RFbGVtZW50O1xuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50ID0gdGhpcy5yb290RWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWUgXG4gICAgICogQHBhcmFtICB7U3RyaW5nW119IGF0dHJpYnV0ZUFycmF5XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbm9kZSh0YWdOYW1lLCAuLi5hdHRyaWJ1dGVBcnJheSkge1xuICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IFJvb3QgZWxlbWVudCBpcyBub3QgZGVmaW5lZC4gQ2FsbCByb290KCkgYmVmb3JlIGFkZGluZyBjaGlsZCBlbGVtZW50cy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudHJhaWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBObyBvcGVuIGVsZW1lbnQgY29udGV4dCB0byBhZGQgY2hpbGQgZWxlbWVudHMsIGNhbGwgb3BlbigpIGJlZm9yZSBhZGRpbmcuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBDb21wb25lbnRCdWlsZGVyLnRhZyh0aGlzLmlkUmVnaXN0cnksIHRoaXMuZWxlbWVudE1hcCwgdGFnTmFtZSwgLi4uYXR0cmlidXRlQXJyYXkpO1xuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50LmFkZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50QnVpbGRlcn1cbiAgICAgKi9cbiAgICB0ZXh0KHRleHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBSb290IGVsZW1lbnQgaXMgbm90IGRlZmluZWQuIENhbGwgcm9vdCgpIGJlZm9yZSBhZGRpbmcgY2hpbGQgZWxlbWVudHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRyYWlsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogTm8gb3BlbiBlbGVtZW50IGNvbnRleHQgdG8gYWRkIGNoaWxkIGVsZW1lbnRzLCBjYWxsIG9wZW4oKSBiZWZvcmUgYWRkaW5nLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50LmFkZENoaWxkKHRleHQpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBvcGVuKCkge1xuICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IFJvb3QgZWxlbWVudCBpcyBub3QgZGVmaW5lZC4gQ2FsbCByb290KCkgYmVmb3JlIGFkZGluZyBjaGlsZCBlbGVtZW50cy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFzdEFkZGVkRWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogVW5hYmxlIHRvIG9wZW4gbGFzdCBlbGVtZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyYWlsLnB1c2godGhpcy5jb250ZXh0RWxlbWVudCk7XG4gICAgICAgIHRoaXMuY29udGV4dEVsZW1lbnQgPSB0aGlzLmxhc3RBZGRlZEVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICBpZiAodGhpcy50cmFpbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IE5vIG9wZW4gZWxlbWVudCBjb250ZXh0IHRvIGNsb3NlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50ID0gdGhpcy50cmFpbC5wb3AoKTtcbiAgICAgICAgdGhpcy5sYXN0QWRkZWRFbGVtZW50ID0gdGhpcy5jb250ZXh0RWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50KGNvbXBvbmVudEJ1aWxkZXJDb3VudGVyKyssIHRoaXMucm9vdEVsZW1lbnQsIHRoaXMuZWxlbWVudE1hcCk7XG4gICAgfVxufVxuXG5sZXQgY29tcG9uZW50QnVpbGRlckNvdW50ZXIgPSAwOyIsImltcG9ydCB7IEluamVjdGlvblBvaW50IH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBTdHlsZXNSZWdpc3RyeSB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnlcIjtcbmltcG9ydCB7IENvbXBvbmVudEZhY3RvcnkgfSBmcm9tIFwiLi9jb21wb25lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vdW5pcXVlSWRSZWdpc3RyeVwiO1xuaW1wb3J0IHsgQ2FudmFzU3R5bGVzIH0gZnJvbSBcIi4uL2NhbnZhcy9jYW52YXNTdHlsZXNcIjtcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuLi9jb21wb25lbnQvY29tcG9uZW50XCI7XG5pbXBvcnQgeyBTdHlsZXNoZWV0QnVpbGRlciB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzaGVldEJ1aWxkZXJcIjtcbmltcG9ydCB7IENvbXBvbmVudEJ1aWxkZXIgfSBmcm9tIFwiLi4vY29tcG9uZW50L2NvbXBvbmVudEJ1aWxkZXJcIjtcblxuZXhwb3J0IGNsYXNzIElubGluZUNvbXBvbmVudEZhY3RvcnkgZXh0ZW5kcyBDb21wb25lbnRGYWN0b3J5IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVzUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShTdHlsZXNSZWdpc3RyeSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtVbmlxdWVJZFJlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLnVuaXF1ZUlkUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShVbmlxdWVJZFJlZ2lzdHJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbGFzc1R5cGUgcmVwcmVzZW50cyB0aGUgaW5saW5lIGNvbXBvbmVudCBjbGFzc1xuICAgICAqL1xuICAgIGNyZWF0ZShjbGFzc1R5cGUpe1xuICAgICAgICBpZiAoIWNsYXNzVHlwZS5idWlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5saW5lIGNvbXBvbmVudCBjbGFzcyBtdXN0IGltcGxlbWVudCBzdGF0aWMgbWV0aG9kIGJ1aWxkQ29tcG9uZW50KClcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHR5cGUge0NvbXBvbmVudH0gKi9cbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY2xhc3NUeXBlLmJ1aWxkQ29tcG9uZW50KENvbXBvbmVudEJ1aWxkZXIuY3JlYXRlKHRoaXMudW5pcXVlSWRSZWdpc3RyeSkpO1xuXG4gICAgICAgIGlmIChjbGFzc1R5cGUuYnVpbGRTdHlsZXNoZWV0KSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBjbGFzc1R5cGUuYnVpbGRTdHlsZXNoZWV0KFN0eWxlc2hlZXRCdWlsZGVyLmNyZWF0ZSgpKTtcblxuICAgICAgICAgICAgQ2FudmFzU3R5bGVzLnNldFN0eWxlKGNsYXNzVHlwZS5uYW1lLCBzdHlsZXNoZWV0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cblxufSIsImltcG9ydCB7IE1pbmRpSW5qZWN0b3IsXG4gICAgTWluZGlDb25maWcsXG4gICAgSW5zdGFuY2VQb3N0Q29uZmlnVHJpZ2dlcixcbiAgICBDb25maWdBY2Nlc3NvcixcbiAgICBTaW5nbGV0b25Db25maWcsXG4gICAgUHJvdG90eXBlQ29uZmlnLCBcbiAgICBDb25maWcgfSBmcm9tIFwibWluZGlfdjFcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMsIExvZ2dlciwgTWV0aG9kLCBTdHJpbmdVdGlscyB9IGZyb20gIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENvbnRhaW5lckV2ZW50LCBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBDb21wb25lbnRDb25maWdQcm9jZXNzb3IgfSBmcm9tIFwiLi9jb21wb25lbnQvY29tcG9uZW50Q29uZmlnUHJvY2Vzc29yLmpzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSBcIi4vdGVtcGxhdGUvdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IEhpc3RvcnkgfSBmcm9tIFwiLi9uYXZpZ2F0aW9uL2hpc3RvcnkuanNcIjtcbmltcG9ydCB7IERpTW9kdWxlTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyL2RpTW9kdWxlTG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgTW9kdWxlUnVubmVyIH0gZnJvbSBcIi4vbW9kdWxlUnVubmVyLmpzXCI7XG5pbXBvcnQgeyBNb2R1bGUgfSBmcm9tIFwiLi9tb2R1bGUuanNcIjtcbmltcG9ydCB7IEFjdGl2ZU1vZHVsZVJ1bm5lciB9IGZyb20gXCIuL2FjdGl2ZU1vZHVsZVJ1bm5lci5qc1wiO1xuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSBcIi4vc3RhdGUvc3RhdGVNYW5hZ2VyLmpzXCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vY29tcG9uZW50L3VuaXF1ZUlkUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeSB9IGZyb20gXCIuL2NvbXBvbmVudC90ZW1wbGF0ZUNvbXBvbmVudEZhY3RvcnkuanNcIjtcbmltcG9ydCB7IE1vZHVsZUxvYWRlciB9IGZyb20gXCIuL2xvYWRlci9tb2R1bGVMb2FkZXIuanNcIjtcbmltcG9ydCB7IFRyYWlsUHJvY2Vzc29yIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi90cmFpbFByb2Nlc3Nvci5qc1wiO1xuaW1wb3J0IHsgSW5saW5lQ29tcG9uZW50RmFjdG9yeSB9IGZyb20gXCIuL2NvbXBvbmVudC9pbmxpbmVDb21wb25lbnRGYWN0b3J5LmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJBcHBsaWNhdGlvblwiKTtcblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgTW9kdWxlUnVubmVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QXJyYXk8TW9kdWxlTG9hZGVyPn0gbW9kdWxlTG9hZGVyQXJyYXkgXG4gICAgICogQHBhcmFtIHtDb25maWd9IGNvbmZpZyBcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB3b3JrZXJBcnJheSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVMb2FkZXJBcnJheSwgY29uZmlnID0gbmV3IE1pbmRpQ29uZmlnKCksIHdvcmtlckFycmF5ID0gbmV3IEFycmF5KCkpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8TW9kdWxlTG9hZGVyPn0gKi9cbiAgICAgICAgdGhpcy5tb2R1bGVMb2FkZXJBcnJheSA9IG1vZHVsZUxvYWRlckFycmF5O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWluZGlDb25maWd9ICovXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gICAgICAgIHRoaXMud29ya2VyQXJyYXkgPSB3b3JrZXJBcnJheTtcblxuICAgICAgICAvKiogQHR5cGUge0FycmF5fSAqL1xuICAgICAgICB0aGlzLnJ1bm5pbmdXb3JrZXJzID0gbmV3IEFycmF5KCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNb2R1bGV9ICovXG4gICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlID0gbnVsbDtcblxuICAgICAgICB0aGlzLmRlZmF1bHRDb25maWcgPSBbXG4gICAgICAgICAgICBTaW5nbGV0b25Db25maWcudW5uYW1lZChUZW1wbGF0ZVJlZ2lzdHJ5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKFN0eWxlc1JlZ2lzdHJ5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKFVuaXF1ZUlkUmVnaXN0cnkpLFxuICAgICAgICAgICAgU2luZ2xldG9uQ29uZmlnLnVubmFtZWQoVGVtcGxhdGVDb21wb25lbnRGYWN0b3J5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKElubGluZUNvbXBvbmVudEZhY3RvcnkpLFxuICAgICAgICAgICAgUHJvdG90eXBlQ29uZmlnLnVubmFtZWQoU3RhdGVNYW5hZ2VyKVxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbmZpZ1Byb2Nlc3NvcnMgPSBbIENvbXBvbmVudENvbmZpZ1Byb2Nlc3NvciBdO1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdEluc3RhbmNlUHJvY2Vzc29ycyA9IFsgSW5zdGFuY2VQb3N0Q29uZmlnVHJpZ2dlciBdO1xuXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBMT0cuaW5mbyhcIlJ1bm5pbmcgQXBwbGljYXRpb25cIik7XG4gICAgICAgIHRoaXMuY29uZmlnXG4gICAgICAgICAgICAuYWRkQWxsVHlwZUNvbmZpZyh0aGlzLmRlZmF1bHRDb25maWcpXG4gICAgICAgICAgICAuYWRkQWxsQ29uZmlnUHJvY2Vzc29yKHRoaXMuZGVmYXVsdENvbmZpZ1Byb2Nlc3NvcnMpXG4gICAgICAgICAgICAuYWRkQWxsSW5zdGFuY2VQcm9jZXNzb3IodGhpcy5kZWZhdWx0SW5zdGFuY2VQcm9jZXNzb3JzKTtcbiAgICAgICAgQWN0aXZlTW9kdWxlUnVubmVyLmluc3RhbmNlKCkuc2V0KHRoaXMpO1xuICAgICAgICBDb250YWluZXJVcmwuYWRkVXNlck5hdmlnYXRlTGlzdGVuZXIobmV3IE1ldGhvZCh0aGlzLnVwZGF0ZSwgdGhpcykpO1xuICAgICAgICBjb25zdCBtb2R1bGUgPSBhd2FpdCB0aGlzLnJ1bk1vZHVsZShIaXN0b3J5LmN1cnJlbnRVcmwoKSk7XG4gICAgICAgIHRoaXMuc3RhcnRXb3JrZXJzKCk7XG4gICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtDb250YWluZXJFdmVudH0gZXZlbnRcbiAgICAgKi9cbiAgICB1cGRhdGUoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgdXJsID0gSGlzdG9yeS5jdXJyZW50VXJsKCk7XG4gICAgICAgIExPRy5pbmZvKFwiQXBwbGljYXRpb246IHVwZGF0ZSB0byBcIiArIHVybC50b1N0cmluZygpKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlTW9kdWxlICYmIHRoaXMuYWN0aXZlTW9kdWxlLnRyYWlsTWFwICYmIFN0cmluZ1V0aWxzLnN0YXJ0c1dpdGgodXJsLmFuY2hvciwgdGhpcy5hY3RpdmVNb2R1bGUudHJhaWxNYXAudHJhaWwpKSB7XG4gICAgICAgICAgICBUcmFpbFByb2Nlc3Nvci5jbGllbnROYXZpZ2F0ZSh1cmwsIHRoaXMuYWN0aXZlTW9kdWxlLCB0aGlzLmFjdGl2ZU1vZHVsZS50cmFpbE1hcCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5Nb2R1bGUodXJsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFzeW5jIHJ1bk1vZHVsZSh1cmwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZUxvYWRlciA9IHRoaXMuZ2V0TWF0Y2hpbmdNb2R1bGVMb2FkZXIodXJsKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlID0gYXdhaXQgbW9kdWxlTG9hZGVyLmxvYWQoKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlLnVybCA9IHVybDtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlLmxvYWQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZU1vZHVsZS50cmFpbE1hcCkge1xuICAgICAgICAgICAgICAgIFRyYWlsUHJvY2Vzc29yLmNsaWVudE5hdmlnYXRlKHVybCwgdGhpcy5hY3RpdmVNb2R1bGUsIHRoaXMuYWN0aXZlTW9kdWxlLnRyYWlsTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU1vZHVsZTtcbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgTE9HLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnRXb3JrZXJzKCkge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nV29ya2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWc7XG4gICAgICAgIGNvbnN0IHJ1bm5pbmdXb3JrZXJzID0gdGhpcy5ydW5uaW5nV29ya2VycztcbiAgICAgICAgdGhpcy53b3JrZXJBcnJheS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgdmFsdWUoKTtcbiAgICAgICAgICAgIE1pbmRpSW5qZWN0b3IuaW5qZWN0KGluc3RhbmNlLCBjb25maWcpO1xuICAgICAgICAgICAgQXJyYXlVdGlscy5hZGQocnVubmluZ1dvcmtlcnMsIGluc3RhbmNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtVcmx9IHVybFxuICAgICAqIEByZXR1cm5zIHtEaU1vZHVsZUxvYWRlcn1cbiAgICAgKi9cbiAgICBnZXRNYXRjaGluZ01vZHVsZUxvYWRlcih1cmwpIHtcbiAgICAgICAgbGV0IGZvdW5kTW9kdWxlTG9hZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tb2R1bGVMb2FkZXJBcnJheS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFmb3VuZE1vZHVsZUxvYWRlciAmJiB2YWx1ZS5tYXRjaGVzKHVybCkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZE1vZHVsZUxvYWRlciA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZvdW5kTW9kdWxlTG9hZGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSBnbG9iYWwgYWNjZXNzIHRvIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGNvbmZpZ1xuICAgICAqL1xuICAgIHdpbmRvd0RpQ29uZmlnKCkge1xuICAgICAgICB3aW5kb3cuZGlDb25maWcgPSAoKSA9PiB7XG4gICAgICAgICAgICBMT0cuaW5mbyh0aGlzLmNvbmZpZy5jb25maWdFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSBnbG9iYWwgYWNjZXNzIHRvIHRlbXBsYXRlIHJlZ2lzdHJ5XG4gICAgICovXG4gICAgd2luZG93VGVtcGxhdGVSZWdpc3RyeSgpIHtcbiAgICAgICAgd2luZG93LnRlbXBsYXRlUmVnaXN0cnkgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0eXBlQ29uZmlnID0gQ29uZmlnQWNjZXNzb3IudHlwZUNvbmZpZ0J5TmFtZShUZW1wbGF0ZVJlZ2lzdHJ5Lm5hbWUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIExPRy5pbmZvKHR5cGVDb25maWcuaW5zdGFuY2VIb2xkZXIoKS5pbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgZ2xvYmFsIGFjY2VzcyB0byBzdHlsZSByZWdpc3RyeVxuICAgICAqL1xuICAgIHdpbmRvd1N0eWxlUmVnaXN0cnkoKSB7XG4gICAgICAgIHdpbmRvdy5zdHlsZVJlZ2lzdHJ5ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZUNvbmZpZyA9IENvbmZpZ0FjY2Vzc29yLnR5cGVDb25maWdCeU5hbWUoU3R5bGVzUmVnaXN0cnkubmFtZSwgdGhpcy5jb25maWcpO1xuICAgICAgICAgICAgTE9HLmluZm8odHlwZUNvbmZpZy5pbnN0YW5jZUhvbGRlcigpLmluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IE1hcCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG4vKiogQHR5cGUge01hcH0gKi9cbmxldCBjb25maWd1cmVkRnVuY3Rpb25NYXAgPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBjbGFzcyBDb25maWd1cmVkRnVuY3Rpb24ge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdGhlRnVuY3Rpb25cbiAgICAgKi9cbiAgICBzdGF0aWMgY29uZmlndXJlKG5hbWUsIHRoZUZ1bmN0aW9uKSB7XG4gICAgICAgIGNvbmZpZ3VyZWRGdW5jdGlvbk1hcC5zZXQobmFtZSwgdGhlRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIHN0YXRpYyBleGVjdXRlKG5hbWUsIHBhcmFtZXRlcikge1xuICAgICAgICByZXR1cm4gY29uZmlndXJlZEZ1bmN0aW9uTWFwLmdldChuYW1lKS5jYWxsKG51bGwsIHBhcmFtZXRlcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUHJvcGVydHlBY2Nlc3NvciwgTGlzdCwgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBBYnN0cmFjdElucHV0RWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Fic3RyYWN0SW5wdXRFbGVtZW50XCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJbnB1dEVsZW1lbnREYXRhQmluZGluZ1wiKTtcblxuZXhwb3J0IGNsYXNzIElucHV0RWxlbWVudERhdGFCaW5kaW5nIHtcblxuICAgIGNvbnN0cnVjdG9yKG1vZGVsLCB2YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICB0aGlzLnZhbGlkYXRvciA9IHZhbGlkYXRvcjtcbiAgICAgICAgdGhpcy5wdWxsZXJzID0gbmV3IExpc3QoKTtcbiAgICAgICAgdGhpcy5wdXNoZXJzID0gbmV3IExpc3QoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbGluayhtb2RlbCwgdmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW5wdXRFbGVtZW50RGF0YUJpbmRpbmcobW9kZWwsIHZhbGlkYXRvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdElucHV0RWxlbWVudH0gZmllbGQgXG4gICAgICovXG4gICAgdG8oZmllbGQpIHtcbiAgICAgICAgY29uc3QgcHVsbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbW9kZWxWYWx1ZSA9IFByb3BlcnR5QWNjZXNzb3IuZ2V0VmFsdWUodGhpcy5tb2RlbCwgZmllbGQubmFtZSk7XG4gICAgICAgICAgICBpZiAobW9kZWxWYWx1ZSAhPT0gZmllbGQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBQcm9wZXJ0eUFjY2Vzc29yLnNldFZhbHVlKHRoaXMubW9kZWwsIGZpZWxkLm5hbWUsIGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRvciAmJiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZSl7XG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0b3IudmFsaWRhdGUoZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmaWVsZC5saXN0ZW5UbyhcImNoYW5nZVwiLCBwdWxsZXIsIHRoaXMpO1xuICAgICAgICBmaWVsZC5saXN0ZW5UbyhcImtleXVwXCIsIHB1bGxlciwgdGhpcyk7XG5cbiAgICAgICAgY29uc3QgcHVzaGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbW9kZWxWYWx1ZSA9IFByb3BlcnR5QWNjZXNzb3IuZ2V0VmFsdWUodGhpcy5tb2RlbCwgZmllbGQubmFtZSk7XG4gICAgICAgICAgICBpZiAobW9kZWxWYWx1ZSAhPT0gZmllbGQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmaWVsZC52YWx1ZSA9IG1vZGVsVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0b3IgJiYgdGhpcy52YWxpZGF0b3IudmFsaWRhdGVTaWxlbnQgJiYgZmllbGQudmFsdWUpe1xuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlU2lsZW50KGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgY2hhbmdlZEZ1bmN0aW9uTmFtZSA9IFwiX19jaGFuZ2VkX1wiICsgZmllbGQubmFtZS5yZXBsYWNlKFwiLlwiLFwiX1wiKTtcbiAgICAgICAgaWYgKCF0aGlzLm1vZGVsW2NoYW5nZWRGdW5jdGlvbk5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsW2NoYW5nZWRGdW5jdGlvbk5hbWVdID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wdWxsZXJzLmFkZChwdWxsZXIpO1xuICAgICAgICB0aGlzLnB1c2hlcnMuYWRkKHB1c2hlcik7XG5cbiAgICAgICAgbGV0IG1vZGVsVmFsdWUgPSBQcm9wZXJ0eUFjY2Vzc29yLmdldFZhbHVlKHRoaXMubW9kZWwsIGZpZWxkLm5hbWUpO1xuXG4gICAgICAgIGlmIChtb2RlbFZhbHVlKSB7XG4gICAgICAgICAgICBwdXNoZXIuY2FsbCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGZpZWxkLnZhbHVlKSB7XG4gICAgICAgICAgICBwdWxsZXIuY2FsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdElucHV0RWxlbWVudH0gZmllbGQgXG4gICAgICovXG4gICAgYW5kKGZpZWxkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvKGZpZWxkKTtcbiAgICB9XG5cbiAgICBwdWxsKCkge1xuICAgICAgICB0aGlzLnB1bGxlcnMuZm9yRWFjaCgodmFsdWUsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuY2FsbChwYXJlbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxuICAgIHB1c2goKSB7XG4gICAgICAgIHRoaXMucHVzaGVycy5mb3JFYWNoKCh2YWx1ZSwgcGFyZW50KSA9PiB7XG4gICAgICAgICAgICB2YWx1ZS5jYWxsKHBhcmVudCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufSIsImltcG9ydCB7IENvbmZpZ3VyZWRGdW5jdGlvbiB9IGZyb20gXCIuLi9jb25maWcvY29uZmlndXJlZEZ1bmN0aW9uLmpzXCI7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvc2ltcGxlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRXZlbnQge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZXZlbnQpIHtcblxuICAgICAgICAvKiogQHR5cGUge0V2ZW50fSAqL1xuICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50LnR5cGUudG9Mb3dlckNhc2UoKSA9PSBcImRyYWdzdGFydFwiKXtcbiAgICAgICAgICAgIHRoaXMuZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHtcbiAgICAgICAgdGhpcy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICBwcmV2ZW50RGVmYXVsdCgpIHtcbiAgICAgICAgdGhpcy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGdldCBmaWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQudGFyZ2V0ICYmIHRoaXMuZXZlbnQudGFyZ2V0LmZpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ldmVudC50YXJnZXQuZmlsZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZXZlbnQuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge0RhdGFUcmFuc2Zlcn0gKi9cbiAgICAgICAgICAgIGNvbnN0IGRhdGFUcmFuc2ZlciA9IHRoaXMuZXZlbnQuZGF0YVRyYW5zZmVyO1xuICAgICAgICAgICAgaWYgKGRhdGFUcmFuc2Zlci5maWxlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBldmVudCBhbmQgdGhlIGVkZ2UgeCBjb29yZGluYXRlIG9mIHRoZSBjb250YWluaW5nIG9iamVjdFxuICAgICAqL1xuICAgIGdldCBvZmZzZXRYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5vZmZzZXRYO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBldmVudCBhbmQgdGhlIGVkZ2UgeSBjb29yZGluYXRlIG9mIHRoZSBjb250YWluaW5nIG9iamVjdFxuICAgICAqL1xuICAgIGdldCBvZmZzZXRZKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50Lm9mZnNldFk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG1vdXNlIHggY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnQgcmVsYXRpdmUgdG8gdGhlIGNsaWVudCB3aW5kb3cgdmlld1xuICAgICAqL1xuICAgIGdldCBjbGllbnRYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5jbGllbnRYO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBtb3VzZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50IHJlbGF0aXZlIHRvIHRoZSBjbGllbnQgd2luZG93IHZpZXdcbiAgICAgKi9cbiAgICBnZXQgY2xpZW50WSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnQuY2xpZW50WTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U2ltcGxlRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXQgdGFyZ2V0KCkge1xuICAgICAgICBpZiAodGhpcy5ldmVudCAmJiB0aGlzLmV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIENvbmZpZ3VyZWRGdW5jdGlvbi5leGVjdXRlKFwibWFwRWxlbWVudFwiLCB0aGlzLmV2ZW50LnRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U2ltcGxlRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXQgcmVsYXRlZFRhcmdldCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQgJiYgdGhpcy5ldmVudC5yZWxhdGVkVGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlndXJlZEZ1bmN0aW9uLmV4ZWN1dGUoXCJtYXBFbGVtZW50XCIsIHRoaXMuZXZlbnQucmVsYXRlZFRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICAgZ2V0UmVsYXRlZFRhcmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50LnJlbGF0ZWRUYXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBDb25maWd1cmVkRnVuY3Rpb24uZXhlY3V0ZShcIm1hcEVsZW1lbnRcIiwgdGhpcy5ldmVudC5yZWxhdGVkVGFyZ2V0KS5nZXRBdHRyaWJ1dGVWYWx1ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgdGFyZ2V0VmFsdWUoKSB7XG4gICAgICAgIGlmKHRoaXMudGFyZ2V0KSB7IFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldCBrZXlDb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5rZXlDb2RlO1xuICAgIH1cblxuICAgIGlzS2V5Q29kZShjb2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50LmtleUNvZGUgPT09IGNvZGU7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuLyoqXG4gKiBPYmplY3QgRnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGlmIHRoZSBmaWx0ZXIgZnVuY3Rpb24gcmV0dXJucyB0cnVlXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEZpbHRlcmVkTWV0aG9kIGV4dGVuZHMgTWV0aG9kIHtcblxuICAgIC8qKlxuICAgICAqIENvbnRydWN0b3JcbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gbWV0aG9kIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRoZUZpbHRlciBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXRob2QsIGZpbHRlcil7XG4gICAgICAgIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICB9XG5cbiAgICBjYWxsKHBhcmFtcyl7XG4gICAgICAgIGlmKHRoaXMuZmlsdGVyICYmIHRoaXMuZmlsdGVyLmNhbGwodGhpcyxwYXJhbXMpKSB7XG4gICAgICAgICAgICB0aGlzLm1ldGhvZC5jYWxsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBNZXRob2QsIE1hcCwgTGlzdCwgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJFdmVudE1hbmFnZXJcIik7XG5cbi8qKlxuICogRXZlbnRNYW5hZ2VyXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqIEB0eXBlIE1hcDxMaXN0PE1ldGhvZD4+ICovXG4gICAgICAgIHRoaXMubGlzdGVuZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lckZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRPYmplY3RcbiAgICAgKiBAcmV0dXJucyB7RXZlbnRNYW5hZ2VyfVxuICAgICAqL1xuICAgIGxpc3RlblRvKGV2ZW50VHlwZSwgbGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBNZXRob2QobGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCk7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lck1hcC5jb250YWlucyhldmVudFR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyTWFwLnNldChldmVudFR5cGUsIG5ldyBMaXN0KCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJNYXAuZ2V0KGV2ZW50VHlwZSkuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBcbiAgICAgKiBAcGFyYW0ge0FycmF5fGFueX0gcGFyYW1ldGVyIFxuICAgICAqL1xuICAgIGFzeW5jIHRyaWdnZXIoZXZlbnRUeXBlLCBwYXJhbWV0ZXIpIHtcbiAgICAgICAgaWYgKCFldmVudFR5cGUpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcihcIkV2ZW50IHR5cGUgaXMgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lck1hcC5jb250YWlucyhldmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdEFycmF5ID0gW107XG4gICAgICAgIHRoaXMubGlzdGVuZXJNYXAuZ2V0KGV2ZW50VHlwZSkuZm9yRWFjaCgobGlzdGVuZXIsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0QXJyYXkucHVzaChsaXN0ZW5lci5jYWxsKHBhcmFtZXRlcikpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0QXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0QXJyYXlbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdEFycmF5KTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBTdHlsZU1lZGlhIH0gZnJvbSBcIi4vc3R5bGVNZWRpYS5qc1wiO1xuaW1wb3J0IHsgU3R5bGVTZWxlY3RvciB9IGZyb20gXCIuL3N0eWxlU2VsZWN0b3IuanNcIjtcbmltcG9ydCB7IFN0eWxlc2hlZXRCdWlsZGVyIH0gZnJvbSBcIi4vc3R5bGVzaGVldEJ1aWxkZXIuanNcIjtcblxuZXhwb3J0IGNsYXNzIENzczNTdHlsZXNoZWV0QnVpbGRlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzM1N0eWxlc2hlZXRCdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZXNoZWV0QnVpbGRlcn0gKi9cbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlciA9IFN0eWxlc2hlZXRCdWlsZGVyLmNyZWF0ZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY29udGV4dCBpbnN0YW5jZW9mIFN0eWxlU2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5vcGVuKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtaW5XaWR0aCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWF4V2lkdGggXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBtZWRpYShtaW5XaWR0aCwgbWF4V2lkdGgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY29udGV4dCBpbnN0YW5jZW9mIFN0eWxlU2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jb250ZXh0IGluc3RhbmNlb2YgU3R5bGVNZWRpYSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lZGlhUXVlcnkgPSBgQG1lZGlhJHttaW5XaWR0aCA/IGAgKG1pbi13aWR0aDogJHttaW5XaWR0aH0pYCA6IFwiXCJ9JHttaW5XaWR0aCAmJiBtYXhXaWR0aCA/IFwiIGFuZFwiIDogXCJcIn0ke21heFdpZHRoID8gYCAobWF4LXdpZHRoOiAke21heFdpZHRofSlgIDogXCJcIn1gO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLm1lZGlhKG1lZGlhUXVlcnkpO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLm9wZW4oKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHdpZHRoIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2lkdGgod2lkdGgpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIndpZHRoXCIsIHdpZHRoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1pbldpZHRoIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbWluV2lkdGgobWluV2lkdGgpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1pbi13aWR0aFwiLCBtaW5XaWR0aCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtYXhXaWR0aCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1heFdpZHRoKG1heFdpZHRoKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXgtd2lkdGhcIiwgbWF4V2lkdGgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaGVpZ2h0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgaGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtaW5IZWlnaHQgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBtaW5IZWlnaHQobWluSGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtaW4taGVpZ2h0XCIsIG1pbkhlaWdodCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWF4SGVpZ2h0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbWF4SGVpZ2h0KG1heEhlaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwibWF4LWhlaWdodFwiLCBtYXhIZWlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbGluZUhlaWdodFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG5cbiAgICBsaW5lSGVpZ2h0KGxpbmVIZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImxpbmUtaGVpZ2h0XCIsIGxpbmVIZWlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZm9udFNpemVcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGZvbnRTaXplKGZvbnRTaXplKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJmb250LXNpemVcIiwgZm9udFNpemUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdyBHcm93cyByZWxhdGl2ZSB0byB0aGUgb3RoZXIgZmxleCBpdGVtcyBpbiB0aGUgY29udGFpbmVyIHdoZW4gdGhlcmUgaXMgZXh0cmEgc3BhY2UuIEUuZy4gZ3JvdyBvZiAxIHZzIGdyb3cgb2YgMiwgdGhlIHNlY29uZCBpdGVtIHdpbGwgZ3JvdyB0d2ljZSBhcyBtdWNoLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzaHJpbmsgU2hyaW5rcyByZWxhdGl2ZSB0byB0aGUgb3RoZXIgZmxleCBpdGVtcyBpbiB0aGUgY29udGFpbmVyIHdoZW4gbm90IGVub3VnaCBzcGFjZS4gRS5nLiBzaHJpbmsgb2YgMSB2cyBzaHJpbmsgb2YgMiwgdGhlIHNlY29uZCBpdGVtIHdpbGwgc2hyaW5rIHR3aWNlIGFzIG11Y2guXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJhc2lzIEluaXRpYWwgbWFpbiBzaXplLiBFLmcgXCIxMDBweFwiLCBcIjIwJVwiLCBcImF1dG9cIi4gRGVmYXVsdCB2YWx1ZSBpcyBcImF1dG9cIiwgc2l6ZWQgYWNjb3JkaW5nIHRvIGl0cyBjb250ZW50LiBJZiBcIjBcIiwgc2l6ZWQgYmFzZWQgb24gZ3JvdyBhbmQgc2hyaW5rLlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZmxleChncm93LCBzaHJpbmssIGJhc2lzKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYCR7Z3Jvd30gJHtzaHJpbmt9ICR7YmFzaXN9YDtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImZsZXhcIiwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIEUuZyBcInJvd1wiLCBcImNvbHVtblwiLCBcInJvdy1yZXZlcnNlXCIsIFwiY29sdW1uLXJldmVyc2VcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZmxleERpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImZsZXgtZGlyZWN0aW9uXCIsIGRpcmVjdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhbGlnbkl0ZW1zIEUuZy4gXCJzdHJldGNoXCIsIFwiY2VudGVyXCIsIFwiZmxleC1zdGFydFwiLCBcImZsZXgtZW5kXCIsIFwiYmFzZWxpbmVcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYWxpZ25JdGVtcyhhbGlnbkl0ZW1zKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJhbGlnbi1pdGVtc1wiLCBhbGlnbkl0ZW1zKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIEUuZy4gXCJzdGF0aWNcIiwgXCJyZWxhdGl2ZVwiLCBcImFic29sdXRlXCIsIFwiZml4ZWRcIiwgXCJzdGlja3lcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgcG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBvc2l0aW9uXCIsIHBvc2l0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJvdHRvbSBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJvdHRvbShib3R0b20pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJvdHRvbVwiLCBib3R0b20pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJpZ2h0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgcmlnaHQocmlnaHQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInJpZ2h0XCIsIHJpZ2h0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRvcCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHRvcCh0b3ApIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInRvcFwiLCB0b3ApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbGVmdCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGxlZnQobGVmdCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwibGVmdFwiLCBsZWZ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRpc3BsYXkgRS5nLiBcImJsb2NrXCIsIFwiaW5saW5lLWJsb2NrXCIsIFwiZmxleFwiLCBcImlubGluZS1mbGV4XCIsIFwiZ3JpZFwiLCBcImlubGluZS1ncmlkXCIsIFwibm9uZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBkaXNwbGF5KGRpc3BsYXkpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImRpc3BsYXlcIiwgZGlzcGxheSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0b3AgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJpZ2h0IFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBib3R0b20gXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGxlZnQgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBwYWRkaW5nKHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xuICAgICAgICBpZiAodG9wICYmICFyaWdodCAmJiAhYm90dG9tICYmICFsZWZ0KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGAke3RvcH0gJHtyaWdodH0gJHtib3R0b219ICR7bGVmdH1gO1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmdcIiwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmctdG9wXCIsIHRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicGFkZGluZy1yaWdodFwiLCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvdHRvbSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmctYm90dG9tXCIsIGJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlZnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJwYWRkaW5nLWxlZnRcIiwgbGVmdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRvcCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmlnaHQgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJvdHRvbSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbGVmdCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1hcmdpbih0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQpIHtcbiAgICAgICAgaWYgKHRvcCAmJiAhcmlnaHQgJiYgIWJvdHRvbSAmJiAhbGVmdCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBgJHt0b3B9ICR7cmlnaHR9ICR7Ym90dG9tfSAke2xlZnR9YDtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW5cIiwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1hcmdpbi10b3BcIiwgdG9wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW4tcmlnaHRcIiwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib3R0b20pIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW4tYm90dG9tXCIsIGJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlZnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW4tbGVmdFwiLCBsZWZ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kQ29sb3IoY29sb3IpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgY29sb3IpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZChiYWNrZ3JvdW5kKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kXCIsIGJhY2tncm91bmQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZFBvc2l0aW9uXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kUG9zaXRpb24oYmFja2dyb3VuZFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLXBvc2l0aW9uXCIsIGJhY2tncm91bmRQb3NpdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvdmVyZmxvd1ggRS5nLiBcInZpc2libGVcIiwgXCJoaWRkZW5cIiwgXCJzY3JvbGxcIiwgXCJhdXRvXCJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3ZlcmZsb3dZIEUuZy4gXCJ2aXNpYmxlXCIsIFwiaGlkZGVuXCIsIFwic2Nyb2xsXCIsIFwiYXV0b1wiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBvdmVyZmxvdyhvdmVyZmxvd1gsIG92ZXJmbG93WSkge1xuICAgICAgICBpZiAob3ZlcmZsb3dYKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwib3ZlcmZsb3cteFwiLCBvdmVyZmxvd1gpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdmVyZmxvd1kpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJvdmVyZmxvdy15XCIsIG92ZXJmbG93WSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJveFNpemluZyBFLmcuIFwiY29udGVudC1ib3hcIiwgXCJib3JkZXItYm94XCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJveFNpemluZyhib3hTaXppbmcpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJveC1zaXppbmdcIiwgYm94U2l6aW5nKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGR1cmF0aW9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRpbWluZ0Z1bmN0aW9uXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cblxuICAgIHRyYW5zaXRpb24ocHJvcGVydHksIGR1cmF0aW9uLCB0aW1pbmdGdW5jdGlvbikge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGAke3Byb3BlcnR5fSAke2R1cmF0aW9ufSAke3RpbWluZ0Z1bmN0aW9ufWA7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJ0cmFuc2l0aW9uXCIsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLmNvbnRleHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY2xvc2UoKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuYnVpbGQoKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMaXN0LCBNYXAsIE1hcFV0aWxzLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudFwiO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVBY2Nlc3NvciB7XG4gICAgXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Jhc2VFbGVtZW50fVxuICAgICAqIEByZXR1cm4ge1N0eWxlQWNjZXNzb3J9XG4gICAgICovXG4gICAgc3RhdGljIGZyb20oYmFzZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHlsZUFjY2Vzc29yKGJhc2VFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBiYXNlRWxlbWVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihiYXNlRWxlbWVudCkge1xuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmJhc2VFbGVtZW50ID0gYmFzZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJzdHlsZVwiLCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlTmFtZSBcbiAgICAgKi9cbiAgICByZW1vdmUoc3R5bGVOYW1lKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgaWYgKGN1cnJlbnRTdHlsZU1hcC5jb250YWlucyhzdHlsZU5hbWUpKSB7XG4gICAgICAgICAgICBjdXJyZW50U3R5bGVNYXAucmVtb3ZlKHN0eWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIsIE1hcFV0aWxzLnRvU3RyaW5nKGN1cnJlbnRTdHlsZU1hcCwgXCI6XCIsIFwiO1wiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZU5hbWUgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlVmFsdWUgXG4gICAgICovXG4gICAgc2V0KHN0eWxlTmFtZSwgc3R5bGVWYWx1ZSkge1xuICAgICAgICBjb25zdCBjdXJyZW50U3R5bGVNYXAgPSB0aGlzLnN0eWxlc0FzTWFwKHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJzdHlsZVwiKSk7XG4gICAgICAgIGN1cnJlbnRTdHlsZU1hcC5zZXQoc3R5bGVOYW1lLCBzdHlsZVZhbHVlKTtcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIsIE1hcFV0aWxzLnRvU3RyaW5nKGN1cnJlbnRTdHlsZU1hcCwgXCI6XCIsIFwiO1wiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZU5hbWUgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlVmFsdWUgXG4gICAgICovXG4gICAgaXMoc3R5bGVOYW1lLCBzdHlsZVZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLm5vbk51bGxFcXVhbHMoY3VycmVudFN0eWxlTWFwLmdldChzdHlsZU5hbWUpLCBzdHlsZVZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlTmFtZSBcbiAgICAgKi9cbiAgICBleGlzdHMoc3R5bGVOYW1lKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdHlsZU1hcC5jb250YWlucyhzdHlsZU5hbWUpO1xuICAgIH1cblxuICAgIHN0eWxlc0FzTWFwKHN0eWxlcykge1xuICAgICAgICBpZiAoIXN0eWxlcyB8fCBzdHlsZXMuaW5kZXhPZihcIjpcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZVBhaXJMaXN0ID0gbmV3IExpc3QoU3RyaW5nVXRpbHMudG9BcnJheShzdHlsZXMsIFwiO1wiKSk7XG4gICAgICAgIGN1cnJlbnRTdHlsZVBhaXJMaXN0LmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUuaW5kZXhPZihcIjpcIikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRLZXkgPSB2YWx1ZS5zcGxpdChcIjpcIilbMF0udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRWYWx1ZSA9IHZhbHVlLnNwbGl0KFwiOlwiKVsxXS50cmltKCk7XG4gICAgICAgICAgICBjdXJyZW50U3R5bGVNYXAuc2V0KHJlc29sdmVkS2V5LCByZXNvbHZlZFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdHlsZU1hcDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBBcnJheVV0aWxzLCBMaXN0LCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudFwiO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVTZWxlY3RvckFjY2Vzc29yIHtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybiB7U3R5bGVTZWxlY3RvckFjY2Vzc29yfVxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tKGJhc2VFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgU3R5bGVTZWxlY3RvckFjY2Vzc29yKGJhc2VFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBiYXNlRWxlbWVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihiYXNlRWxlbWVudCkge1xuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmJhc2VFbGVtZW50ID0gYmFzZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIFxuICAgICAqL1xuICAgIHRvZ2dsZShjc3NDbGFzcykge1xuICAgICAgICBsZXQgY3VycmVudENsYXNzID0gdGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzQXJyYXkgPSBTdHJpbmdVdGlscy50b0FycmF5KGN1cnJlbnRDbGFzcywgXCIgXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzTGlzdCA9IG5ldyBMaXN0KGN1cnJlbnRDbGFzc0FycmF5KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjdXJyZW50Q2xhc3NMaXN0LmNvbnRhaW5zKGNzc0NsYXNzKSkge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJhc2VFbGVtZW50LnNldEF0dHJpYnV0ZVZhbHVlKFwiY2xhc3NcIiwgQXJyYXlVdGlscy50b1N0cmluZyhjdXJyZW50Q2xhc3NMaXN0LmdldEFycmF5KCksIFwiIFwiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjc3NDbGFzcyBcbiAgICAgKi9cbiAgICBlbmFibGUoY3NzQ2xhc3MpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzcyA9IHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0FycmF5ID0gU3RyaW5nVXRpbHMudG9BcnJheShjdXJyZW50Q2xhc3MsIFwiIFwiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0xpc3QgPSBuZXcgTGlzdChjdXJyZW50Q2xhc3NBcnJheSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWN1cnJlbnRDbGFzc0xpc3QuY29udGFpbnMoY3NzQ2xhc3MpKSB7XG4gICAgICAgICAgICBjdXJyZW50Q2xhc3NMaXN0LmFkZChjc3NDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBBcnJheVV0aWxzLnRvU3RyaW5nKGN1cnJlbnRDbGFzc0xpc3QuZ2V0QXJyYXkoKSwgXCIgXCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIFxuICAgICAqL1xuICAgIGRpc2FibGUoY3NzQ2xhc3MpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzcyA9IHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0FycmF5ID0gU3RyaW5nVXRpbHMudG9BcnJheShjdXJyZW50Q2xhc3MsIFwiIFwiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0xpc3QgPSBuZXcgTGlzdChjdXJyZW50Q2xhc3NBcnJheSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoY3VycmVudENsYXNzTGlzdC5jb250YWlucyhjc3NDbGFzcykpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QucmVtb3ZlKGNzc0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBBcnJheVV0aWxzLnRvU3RyaW5nKGN1cnJlbnRDbGFzc0xpc3QuZ2V0QXJyYXkoKSwgXCIgXCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzUmVtb3ZhbFByZWZpeCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzQ2xhc3NcbiAgICAgKi9cbiAgICByZXBsYWNlKGNzc0NsYXNzUmVtb3ZhbFByZWZpeCwgY3NzQ2xhc3MpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzcyA9IHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0FycmF5ID0gU3RyaW5nVXRpbHMudG9BcnJheShjdXJyZW50Q2xhc3MsIFwiIFwiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0xpc3QgPSBuZXcgTGlzdChjdXJyZW50Q2xhc3NBcnJheSk7XG4gICAgICAgIGxldCB0b1JlbW92ZUFycmF5ID0gW107XG5cbiAgICAgICAgaWYgKCFTdHJpbmdVdGlscy5pc0JsYW5rKGNzc0NsYXNzUmVtb3ZhbFByZWZpeCkpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUuc3RhcnRzV2l0aChjc3NDbGFzc1JlbW92YWxQcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvUmVtb3ZlQXJyYXkucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0b1JlbW92ZUFycmF5LmZvckVhY2goKHRvUmVtb3ZlVmFsdWUpID0+IHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QucmVtb3ZlKHRvUmVtb3ZlVmFsdWUpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGN1cnJlbnRDbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIsIEFycmF5VXRpbHMudG9TdHJpbmcoY3VycmVudENsYXNzTGlzdC5nZXRBcnJheSgpLCBcIiBcIikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBcblxufSIsImltcG9ydCB7IE1hcCwgTG9nZ2VyLCBTdHJpbmdVdGlscywgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDbGllbnQgfSBmcm9tIFwiLi4vY2xpZW50L2NsaWVudC5qc1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyRG93bmxvYWQsIENvbnRhaW5lckh0dHBSZXNwb25zZSwgQ29udGFpbmVyVXBsb2FkRGF0YSB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcblxuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiSHR0cENhbGxCdWlsZGVyXCIpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwQ2FsbEJ1aWxkZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih1cmwpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYXV0aG9yaXphdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMuc3VjY2Vzc01hcHBpbmdNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMuZmFpbE1hcHBpbmdNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5lcnJvck1hcHBpbmdGdW5jdGlvbiA9IChlcnJvcikgPT4geyByZXR1cm4gZXJyb3I7IH07XG5cbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSA9IDQwMDA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIHRoaXMucmVzcG9uc2VUaW1lb3V0VmFsdWUgPSA0MDAwO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWV0aG9kfSAqL1xuICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tNZXRob2QgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgICAgICAgdGhpcy5kb3dubG9hZFJlc3BvbnNlID0gZmFsc2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFxuICAgICAqIEByZXR1cm5zIHtIdHRwQ2FsbEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIG5ld0luc3RhbmNlKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IEh0dHBDYWxsQnVpbGRlcih1cmwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcHBlckZ1bmN0aW9uIG1hcHBlciBmdW5jdGlvbiB0byBwYXNzIHRoZSByZXN1bHQgb2JqZWN0IHRvXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIHN1Y2Nlc3NNYXBwaW5nKGNvZGUsIG1hcHBlckZ1bmN0aW9uID0gKCkgPT4geyByZXR1cm4gbnVsbDsgfSkge1xuICAgICAgICB0aGlzLnN1Y2Nlc3NNYXBwaW5nTWFwLnNldChjb2RlLCBtYXBwZXJGdW5jdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtIdHRwQ2FsbEJ1aWxkZXI8Q29udGFpbmVyRG93bmxvYWQ+fVxuICAgICAqL1xuICAgIGFzRG93bmxvYWQoKSB7XG4gICAgICAgIHRoaXMuZG93bmxvYWRSZXNwb25zZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcHBlckZ1bmN0aW9uIG1hcHBlciBmdW5jdGlvbiB0byBwYXNzIHRoZSByZXN1bHQgb2JqZWN0IHRvXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIGZhaWxNYXBwaW5nKGNvZGUsIG1hcHBlckZ1bmN0aW9uID0gKCkgPT4geyByZXR1cm4gbnVsbDsgfSkge1xuICAgICAgICB0aGlzLmZhaWxNYXBwaW5nTWFwLnNldChjb2RlLCBtYXBwZXJGdW5jdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcHBlckZ1bmN0aW9uIG1hcHBlciBmdW5jdGlvbiB0byBwYXNzIHRoZSByZXN1bHQgb2JqZWN0IHRvXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIGVycm9yTWFwcGluZyhtYXBwZXJGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmVycm9yTWFwcGluZ0Z1bmN0aW9uID0gbWFwcGVyRnVuY3Rpb247XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdXRob3JpemF0aW9uIFxuICAgICAqIEByZXR1cm4ge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBhdXRob3JpemF0aW9uSGVhZGVyKGF1dGhvcml6YXRpb24pIHtcbiAgICAgICAgaWYgKCFTdHJpbmdVdGlscy5pc0JsYW5rKGF1dGhvcml6YXRpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhvcml6YXRpb24gPSBcIkJlYXJlciBcIiArIGF1dGhvcml6YXRpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNZXRob2R9IHByb2dyZXNzQ2FsbGJhY2tNZXRob2QgXG4gICAgICogQHJldHVybnMge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBwcm9ncmVzc0NhbGxiYWNrKHByb2dyZXNzQ2FsbGJhY2tNZXRob2QpIHtcbiAgICAgICAgdGhpcy5wcm9ncmVzc0NhbGxiYWNrTWV0aG9kID0gcHJvZ3Jlc3NDYWxsYmFja01ldGhvZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbm5lY3Rpb25UaW1lb3V0VmFsdWUgXG4gICAgICogQHJldHVybnMge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBjb25uZWN0aW9uVGltZW91dChjb25uZWN0aW9uVGltZW91dFZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSA9IGNvbm5lY3Rpb25UaW1lb3V0VmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByZXNwb25zZVRpbWVvdXRWYWx1ZSBcbiAgICAgKiBAcmV0dXJucyB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIHJlc3BvbnNlVGltZW91dChyZXNwb25zZVRpbWVvdXRWYWx1ZSkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlVGltZW91dFZhbHVlID0gcmVzcG9uc2VUaW1lb3V0VmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIGdldCgpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBDbGllbnQuZ2V0KHRoaXMudXJsLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSwgdGhpcy5kb3dubG9hZFJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIHBvc3QocGF5bG9hZCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5wb3N0KHRoaXMudXJsLCBwYXlsb2FkLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMucHJvZ3Jlc3NDYWxsYmFja01ldGhvZCwgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIHB1dChwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LnB1dCh0aGlzLnVybCwgcGF5bG9hZCwgdGhpcy5hdXRob3JpemF0aW9uLCB0aGlzLnByb2dyZXNzQ2FsbGJhY2tNZXRob2QsIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFzVHlwZU1hcHBlZFByb21pc2UocmVzcG9uc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fENvbnRhaW5lclVwbG9hZERhdGF9IHBheWxvYWRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAgICAgKi9cbiAgICBhc3luYyBwYXRjaChwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LnBhdGNoKHRoaXMudXJsLCBwYXlsb2FkLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMucHJvZ3Jlc3NDYWxsYmFja01ldGhvZCwgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIGRlbGV0ZShwYXlsb2FkID0gbnVsbCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5kZWxldGUodGhpcy51cmwsIHBheWxvYWQsIHRoaXMuYXV0aG9yaXphdGlvbiwgdGhpcy5wcm9ncmVzc0NhbGxiYWNrTWV0aG9kLCB0aGlzLmNvbm5lY3Rpb25UaW1lb3V0VmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5hc1R5cGVNYXBwZWRQcm9taXNlKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1Byb21pc2U8Q29udGFpbmVySHR0cFJlc3BvbnNlfSBmZXRjaFByb21pc2UgXG4gICAgICovXG4gICAgYXN5bmMgYXNUeXBlTWFwcGVkUHJvbWlzZShmZXRjaFByb21pc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZldGNoUmVzcG9uc2UgPSBhd2FpdCBmZXRjaFByb21pc2U7XG4gICAgICAgICAgICBpZiAoZmV0Y2hSZXNwb25zZSBpbnN0YW5jZW9mIENvbnRhaW5lckRvd25sb2FkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZldGNoUmVzcG9uc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5oYW5kbGVGZXRjaFJlc3BvbnNlKGZldGNoUmVzcG9uc2UpO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBBUEkgZGlkIG5vdCBleGVjdXRlXG4gICAgICAgICAgICB0aHJvdyB0aGlzLmVycm9yTWFwcGluZ0Z1bmN0aW9uKGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7Q29udGFpbmVySHR0cFJlc3BvbnNlfSBmZXRjaFJlc3BvbnNlIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmUgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcmVqZWN0IFxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZUZldGNoUmVzcG9uc2UoZmV0Y2hSZXNwb25zZSkge1xuICAgICAgICBjb25zdCBzdWNjZXNzUmVzcG9uc2VNYXBwZXIgPSB0aGlzLnN1Y2Nlc3NNYXBwaW5nTWFwLmdldChmZXRjaFJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgIGNvbnN0IGZhaWxSZXNwb25zZU1hcHBlciA9IHRoaXMuZmFpbE1hcHBpbmdNYXAuZ2V0KGZldGNoUmVzcG9uc2Uuc3RhdHVzKTtcblxuICAgICAgICAvLyBFbXB0eSByZXNwb25zZVxuICAgICAgICBpZiAoMjA0ID09PSBmZXRjaFJlc3BvbnNlLnN0YXR1cyB8fCBmZXRjaFJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1MZW5ndGhcIikgPT09IFwiMFwiKSB7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzc1Jlc3BvbnNlTWFwcGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZU1hcHBlcihudWxsKTsgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmFpbFJlc3BvbnNlTWFwcGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZmFpbFJlc3BvbnNlTWFwcGVyKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBtYXBwZXIgZm9yIHJldHVybiBzdGF0dXM6IFwiICsgZmV0Y2hSZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXNzdW1pbmcganNvbiByZXNwb25zZSAgICAgIFxuICAgICAgICB0cnkgeyAgXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUpzb24gPSBhd2FpdCBmZXRjaFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzUmVzcG9uc2VNYXBwZXIpIHsgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZU1hcHBlcihyZXNwb25zZUpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZhaWxSZXNwb25zZU1hcHBlcikge1xuICAgICAgICAgICAgICAgIHRocm93IGZhaWxSZXNwb25zZU1hcHBlcihyZXNwb25zZUpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgdGhpcy5lcnJvck1hcHBpbmdGdW5jdGlvbihyZXNwb25zZUpzb24pO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXNwb25zZSBkaWQgbm90IHByb3ZpZGUganNvblxuICAgICAgICAgICAgdGhyb3cgdGhpcy5lcnJvck1hcHBpbmdGdW5jdGlvbihlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJleHBvcnQgY2xhc3MgUXVlcnlQYXJhbUJ1aWxkZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtRdWVyeVBhcmFtQnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFF1ZXJ5UGFyYW1CdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgXG4gICAgICogQHJldHVybnMge1F1ZXJ5UGFyYW1CdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhTdHJpbmcoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgXG4gICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWVBcnJheSBcbiAgICAgKiBAcmV0dXJucyB7UXVlcnlQYXJhbUJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aEFycmF5KGtleSwgdmFsdWVBcnJheSkge1xuICAgICAgICB0aGlzLnBhcmFtcy5zZXQoa2V5LCB2YWx1ZUFycmF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBidWlsZCgpIHtcbiAgICAgICAgbGV0IHF1ZXJ5UGFyYW0gPSBcIlwiO1xuICAgICAgICBsZXQgZmlyc3RQYXJhbSA9IHRydWU7XG4gICAgICAgIHRoaXMucGFyYW1zLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlyc3RQYXJhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBcIiZcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0UGFyYW0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW0gKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZpcnN0UGFyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBcIiZcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdFBhcmFtID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBxdWVyeVBhcmFtO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU2hhVXRpbHMge1xuXG4gICAgc3RhdGljIGFzeW5jIHNoYTI1NkI2NChtZXNzYWdlKSB7XG4gICAgICBjb25zdCBtc2dCdWZmZXIgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7IC8vIEVuY29kZSB0aGUgc3RyaW5nIGFzIFVURi04XG4gICAgICBjb25zdCBoYXNoQnVmZmVyID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0yNTYnLCBtc2dCdWZmZXIpOyAvLyBIYXNoIHRoZSBtZXNzYWdlXG4gICAgICBjb25zdCBoYXNoQXJyYXkgPSBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGhhc2hCdWZmZXIpKTsgLy8gQ29udmVydCBidWZmZXIgdG8gYnl0ZSBhcnJheVxuICAgICAgY29uc3QgYmFzZTY0SGFzaCA9IGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5oYXNoQXJyYXkpKTsgLy8gQ29udmVydCBieXRlcyB0byBiYXNlNjQgc3RyaW5nXG4gICAgICByZXR1cm4gYmFzZTY0SGFzaDtcbiAgICB9XG5cbn0iLCJleHBvcnQgY2xhc3MgUHJveHlPYmplY3RGYWN0b3J5IHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBwcm94eSBmb3IgYW4gb2JqZWN0IHdoaWNoIGFsbG93cyBkYXRhYmluZGluZyBmcm9tIHRoZSBvYmplY3QgdG8gdGhlIGZvcm0gZWxlbWVudFxuICAgICAqIFxuICAgICAqIEB0ZW1wbGF0ZSBUXG4gICAgICogQHBhcmFtIHtUfSBvYmplY3QgXG4gICAgICogQHJldHVybnMge1R9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVByb3h5T2JqZWN0KG9iamVjdCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iamVjdCwge1xuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzdWNjZXNzID0gKHRhcmdldFtwcm9wXSA9IHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGxldCBjaGFuZ2VkRnVuY3Rpb25OYW1lID0gXCJfX2NoYW5nZWRfXCIgKyBwcm9wO1xuICAgICAgICAgICAgICAgIGxldCBjaGFuZ2VkRnVuY3Rpb24gPSB0YXJnZXRbY2hhbmdlZEZ1bmN0aW9uTmFtZV07XG4gICAgICAgICAgICAgICAgaWYoY2hhbmdlZEZ1bmN0aW9uICYmIHR5cGVvZiBjaGFuZ2VkRnVuY3Rpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYm91bmRDaGFuZ2VkRnVuY3Rpb24gPSBjaGFuZ2VkRnVuY3Rpb24uYmluZCh0YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICBib3VuZENoYW5nZWRGdW5jdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyA9PT0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBMaXN0LCBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkFic3RyYWN0VmFsaWRhdG9yXCIpO1xuXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0N1cnJlbnRseVZhbGlkXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgZW5hYmxlZCA9IHRydWUpIHtcbiAgICAgICAgdGhpcy52YWxpZExpc3RlbmVyTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgICAgIHRoaXMuaW52YWxpZExpc3RlbmVyTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSBjdXJyZW50bHlWYWxpZDtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZW5hYmxlZDtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgdGhpcy52YWxpZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlKCkge1xuICAgICAgICBsZXQgd2FzVmFsaWQgPSB0aGlzLmN1cnJlbnRseVZhbGlkO1xuICAgICAgICAvLyBGYWtlIHZhbGlkXG4gICAgICAgIHRoaXMudmFsaWQoKTtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSB3YXNWYWxpZDtcbiAgICB9XG5cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudGx5VmFsaWQ7XG4gICAgfVxuXG5cdHZhbGlkKCkge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSB0cnVlO1xuICAgICAgICBpZighdGhpcy52YWxpZExpc3RlbmVyTGlzdCkge1xuICAgICAgICAgICAgTE9HLndhcm4oXCJObyB2YWxpZGF0aW9uIGxpc3RlbmVyc1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbGlkTGlzdGVuZXJMaXN0LmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmNhbGwoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcblx0fVxuXG5cdGludmFsaWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJyZW50bHlWYWxpZCA9IGZhbHNlO1xuICAgICAgICBpZighdGhpcy5pbnZhbGlkTGlzdGVuZXJMaXN0KSB7XG4gICAgICAgICAgICBMT0cud2FybihcIk5vIGludmFsaWRhdGlvbiBsaXN0ZW5lcnNcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZhbGlkTGlzdGVuZXJMaXN0LmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmNhbGwoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcblx0fVxuXG5cdHZhbGlkU2lsZW50KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRseVZhbGlkID0gdHJ1ZTtcblx0fVxuXG5cdGludmFsaWRTaWxlbnQoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHtNZXRob2R9IHZhbGlkTGlzdGVuZXIgXG5cdCAqL1xuXHR3aXRoVmFsaWRMaXN0ZW5lcih2YWxpZExpc3RlbmVyKSB7XG5cdFx0dGhpcy52YWxpZExpc3RlbmVyTGlzdC5hZGQodmFsaWRMaXN0ZW5lcik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7TWV0aG9kfSBpbnZhbGlkTGlzdGVuZXIgXG5cdCAqL1xuXHR3aXRoSW52YWxpZExpc3RlbmVyKGludmFsaWRMaXN0ZW5lcikge1xuXHRcdHRoaXMuaW52YWxpZExpc3RlbmVyTGlzdC5hZGQoaW52YWxpZExpc3RlbmVyKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBBYnN0cmFjdFZhbGlkYXRvciB9IGZyb20gXCIuL2Fic3RyYWN0VmFsaWRhdG9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBSZWdleFZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yIHtcblxuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UsIHJlZ2V4ID0gXCIoLiopXCIpIHtcblx0XHRzdXBlcihpc2N1cnJlbnRseVZhbGlkKTtcblx0XHR0aGlzLm1hbmRhdG9yeSA9IG1hbmRhdG9yeTtcbiAgICAgICAgdGhpcy5yZWdleCA9IHJlZ2V4O1xuICAgIH1cblxuXHR2YWxpZGF0ZSh2YWx1ZSl7XG5cdFx0aWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZS5tYXRjaCh0aGlzLnJlZ2V4KSl7XG5cdCAgICBcdHRoaXMudmFsaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoIXZhbHVlICYmICF0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0XHR0aGlzLnZhbGlkKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YWxpZGF0ZVNpbGVudCh2YWx1ZSl7XG5cdFx0aWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZS5tYXRjaCh0aGlzLnJlZ2V4KSl7XG5cdCAgICBcdHRoaXMudmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoIXZhbHVlICYmICF0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0XHR0aGlzLnZhbGlkU2lsZW50KCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufVxuIiwiaW1wb3J0IHsgUmVnZXhWYWxpZGF0b3IgfSBmcm9tIFwiLi9yZWdleFZhbGlkYXRvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRW1haWxWYWxpZGF0b3IgZXh0ZW5kcyBSZWdleFZhbGlkYXRvciB7XG5cbiAgICBzdGF0aWMgRU1BSUxfRk9STUFUID0gL15cXHcrKFtcXC4tXT9cXHcrKSpAXFx3KyhbXFwuLV0/XFx3KykqKFxcLlxcd3syLDN9KSskLztcblxuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIobWFuZGF0b3J5LCBpc2N1cnJlbnRseVZhbGlkLCBFbWFpbFZhbGlkYXRvci5FTUFJTF9GT1JNQVQpO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgQWJzdHJhY3RWYWxpZGF0b3IgfSBmcm9tIFwiLi9hYnN0cmFjdFZhbGlkYXRvci5qc1wiO1xuaW1wb3J0IHsgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBFcXVhbHNGdW5jdGlvblJlc3VsdFZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yIHtcblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gbWFuZGF0b3J5IFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGlzY3VycmVudGx5VmFsaWQgXG5cdCAqIEBwYXJhbSB7TWV0aG9kfSBjb21wYXJlZFZhbHVlRnVuY3Rpb24gXG5cdCAqL1xuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UsIGNvbXBhcmVkVmFsdWVGdW5jdGlvbiA9IG51bGwpIHtcblx0XHRzdXBlcihpc2N1cnJlbnRseVZhbGlkKTtcblxuXHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHR0aGlzLm1hbmRhdG9yeSA9IG1hbmRhdG9yeTtcblxuXHRcdC8qKiBAdHlwZSB7TWV0aG9kfSAqL1xuXHRcdHRoaXMuY29tcGFyZWRWYWx1ZUZ1bmN0aW9uID0gY29tcGFyZWRWYWx1ZUZ1bmN0aW9uO1xuXHR9XG5cblx0dmFsaWRhdGUodmFsdWUpe1xuXHRcdGlmICghdmFsdWUgJiYgdGhpcy5tYW5kYXRvcnkpIHtcblx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZSA9PT0gdGhpcy5jb21wYXJlZFZhbHVlRnVuY3Rpb24uY2FsbCgpKXtcblx0ICAgIFx0dGhpcy52YWxpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHR9XG5cdH1cblxuXHR2YWxpZGF0ZVNpbGVudCh2YWx1ZSl7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkU2lsZW50KCk7XG5cdFx0fSBlbHNlIGlmKHZhbHVlID09PSB0aGlzLmNvbXBhcmVkVmFsdWVGdW5jdGlvbi5jYWxsKCkpe1xuXHQgICAgXHR0aGlzLnZhbGlkU2lsZW50KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgQWJzdHJhY3RWYWxpZGF0b3IgfSBmcm9tIFwiLi9hYnN0cmFjdFZhbGlkYXRvci5qc1wiO1xuaW1wb3J0IHsgTWV0aG9kLCBQcm9wZXJ0eUFjY2Vzc29yIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBFcXVhbHNQcm9wZXJ0eVZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yIHtcblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gbWFuZGF0b3J5IFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGlzY3VycmVudGx5VmFsaWQgXG5cdCAqIEBwYXJhbSB7TWV0aG9kfSBjb21wYXJlZFZhbHVlRnVuY3Rpb24gXG5cdCAqL1xuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UsIG1vZGVsID0gbnVsbCwgYXR0cmlidXRlTmFtZSA9IG51bGwpIHtcblx0XHRzdXBlcihpc2N1cnJlbnRseVZhbGlkKTtcblxuXHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHR0aGlzLm1hbmRhdG9yeSA9IG1hbmRhdG9yeTtcblxuXHRcdC8qKiBAdHlwZSB7b2JqZWN0fSAqL1xuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICAgIFxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVOYW1lID0gYXR0cmlidXRlTmFtZTtcblx0fVxuXG5cdHZhbGlkYXRlKHZhbHVlKXtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHR9IGVsc2UgaWYodmFsdWUgPT09IFByb3BlcnR5QWNjZXNzb3IuZ2V0VmFsdWUodGhpcy5tb2RlbCwgdGhpcy5hdHRyaWJ1dGVOYW1lKSl7XG5cdCAgICBcdHRoaXMudmFsaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fVxuXHR9XG5cblx0dmFsaWRhdGVTaWxlbnQodmFsdWUpe1xuXHRcdGlmICghdmFsdWUgJiYgdGhpcy5tYW5kYXRvcnkpIHtcblx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZSA9PT0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCB0aGlzLmF0dHJpYnV0ZU5hbWUpKXtcblx0ICAgIFx0dGhpcy52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9XG5cdH1cblxufSIsImltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSBcIi4vYWJzdHJhY3RWYWxpZGF0b3IuanNcIjtcbmltcG9ydCB7IE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgRXF1YWxzU3RyaW5nVmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHtib29sZWFufSBtYW5kYXRvcnkgXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNjdXJyZW50bHlWYWxpZCBcblx0ICogQHBhcmFtIHtNZXRob2R9IGNvbXBhcmVkVmFsdWVGdW5jdGlvbiBcblx0ICovXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgY29udHJvbFZhbHVlID0gbnVsbCkge1xuXHRcdHN1cGVyKGlzY3VycmVudGx5VmFsaWQpO1xuXG5cdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdHRoaXMubWFuZGF0b3J5ID0gbWFuZGF0b3J5O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgICAgICB0aGlzLmNvbnRyb2xWYWx1ZSA9IGNvbnRyb2xWYWx1ZTtcblx0fVxuXG5cdHZhbGlkYXRlKHZhbHVlKXtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHR9IGVsc2UgaWYodmFsdWUgPT09IGNvbnRyb2xWYWx1ZSl7XG5cdCAgICBcdHRoaXMudmFsaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fVxuXHR9XG5cblx0dmFsaWRhdGVTaWxlbnQodmFsdWUpe1xuXHRcdGlmICghdmFsdWUgJiYgdGhpcy5tYW5kYXRvcnkpIHtcblx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZSA9PT0gY29udHJvbFZhbHVlKXtcblx0ICAgIFx0dGhpcy52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9XG5cdH1cblxufSIsImltcG9ydCB7IFJlZ2V4VmFsaWRhdG9yIH0gZnJvbSBcIi4vcmVnZXhWYWxpZGF0b3IuanNcIjtcblxuXG5leHBvcnQgY2xhc3MgTnVtYmVyVmFsaWRhdG9yIGV4dGVuZHMgUmVnZXhWYWxpZGF0b3Ige1xuXG4gICAgc3RhdGljIFBIT05FX0ZPUk1BVCA9IC9eXFxkKiQvO1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihtYW5kYXRvcnksIGlzY3VycmVudGx5VmFsaWQsIE51bWJlclZhbGlkYXRvci5QSE9ORV9GT1JNQVQpO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgTGlzdCwgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBBYnN0cmFjdFZhbGlkYXRvciB9IGZyb20gJy4vYWJzdHJhY3RWYWxpZGF0b3IuanMnXG5cbmV4cG9ydCBjbGFzcyBPclZhbGlkYXRvclNldCBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yIHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihpc1ZhbGlkRnJvbVN0YXJ0ID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoaXNWYWxpZEZyb21TdGFydCk7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdFZhbGlkYXRvcn0gdmFsaWRhdG9yXG4gICAgICovXG4gICAgd2l0aFZhbGlkYXRvcih2YWxpZGF0b3IpIHtcbiAgICAgICAgdmFsaWRhdG9yLndpdGhWYWxpZExpc3RlbmVyKG5ldyBNZXRob2QodGhpcy5vbmVWYWxpZCwgdGhpcykpO1xuICAgICAgICB2YWxpZGF0b3Iud2l0aEludmFsaWRMaXN0ZW5lcihuZXcgTWV0aG9kKHRoaXMub25lSW52YWxpZCwgdGhpcykpO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuYWRkKHZhbGlkYXRvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uZSB2YWxpZGF0b3Igc2FpZCBpdCB3YXMgdmFsaWRcbiAgICAgKi9cbiAgICBvbmVWYWxpZCgpIHtcbiAgICAgICAgc3VwZXIudmFsaWQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbmUgdmFsaWRhdG9yIHNhaWQgaXQgd2FzIGludmFsaWRcbiAgICAgKi9cbiAgICBvbmVJbnZhbGlkKCkge1xuICAgICAgICBsZXQgZm91bmRWYWxpZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuZm9yRWFjaCgodmFsdWUscGFyZW50KSA9PiB7XG4gICAgICAgICAgICBpZih2YWx1ZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZFZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGlmKGZvdW5kVmFsaWQpIHtcbiAgICAgICAgICAgIHN1cGVyLnZhbGlkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBSZWdleFZhbGlkYXRvciB9IGZyb20gXCIuL3JlZ2V4VmFsaWRhdG9yLmpzXCI7XG5cbmNvbnN0IFBBU1NXT1JEX0ZPUk1BVCA9IC9eKD89LipbQS1aYS16XSkoPz0uKj9bMC05XSkoPz0uKj9bIz8hQCQlXiYqLV0pLns4LH0kLztcblxuZXhwb3J0IGNsYXNzIFBhc3N3b3JkVmFsaWRhdG9yIGV4dGVuZHMgUmVnZXhWYWxpZGF0b3Ige1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihtYW5kYXRvcnksIGlzY3VycmVudGx5VmFsaWQsIFBBU1NXT1JEX0ZPUk1BVCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUmVnZXhWYWxpZGF0b3IgfSBmcm9tIFwiLi9yZWdleFZhbGlkYXRvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgUGhvbmVWYWxpZGF0b3IgZXh0ZW5kcyBSZWdleFZhbGlkYXRvciB7XG5cbiAgICBzdGF0aWMgUEhPTkVfRk9STUFUID0gL15cXCtbMC05XXsyfVxccz8oWzAtOV1cXHM/KSokLztcblxuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIobWFuZGF0b3J5LCBpc2N1cnJlbnRseVZhbGlkLCBQaG9uZVZhbGlkYXRvci5QSE9ORV9GT1JNQVQpO1xuICAgIH1cblxufSIsImltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSBcIi4vYWJzdHJhY3RWYWxpZGF0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIFJlcXVpcmVkVmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG5cdGNvbnN0cnVjdG9yKGN1cnJlbnRseVZhbGlkID0gZmFsc2UsIGVuYWJsZWQgPSB0cnVlKSB7XG5cdFx0c3VwZXIoY3VycmVudGx5VmFsaWQsIGVuYWJsZWQpO1xuXHR9XG5cblx0dmFsaWRhdGUodmFsdWUpe1xuXHRcdGlmKHZhbHVlID09PSBcIlwiKXtcblx0ICAgIFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudmFsaWQoKTtcblx0XHR9XG5cdH1cblxuXHR2YWxpZGF0ZVNpbGVudCh2YWx1ZSl7XG5cdFx0aWYodmFsdWUgPT09IFwiXCIpe1xuXHQgICAgXHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy52YWxpZFNpbGVudCgpO1xuXHRcdH1cblx0fVxuXG59XG4iLCJpbXBvcnQgeyBMaXN0LCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSAnLi9hYnN0cmFjdFZhbGlkYXRvci5qcyc7XG5cbmV4cG9ydCBjbGFzcyBBbmRWYWxpZGF0b3JTZXQgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cbiAgICBjb25zdHJ1Y3Rvcihpc1ZhbGlkRnJvbVN0YXJ0ID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoaXNWYWxpZEZyb21TdGFydCk7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdFZhbGlkYXRvcn0gdmFsaWRhdG9yXG4gICAgICovXG4gICAgd2l0aFZhbGlkYXRvcih2YWxpZGF0b3IpIHtcbiAgICAgICAgdmFsaWRhdG9yLndpdGhWYWxpZExpc3RlbmVyKG5ldyBNZXRob2QodGhpcy5vbmVWYWxpZCwgdGhpcykpO1xuICAgICAgICB2YWxpZGF0b3Iud2l0aEludmFsaWRMaXN0ZW5lcihuZXcgTWV0aG9kKHRoaXMub25lSW52YWxpZCwgdGhpcykpO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuYWRkKHZhbGlkYXRvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uZSB2YWxpZGF0b3Igc2FpZCBpdCB3YXMgdmFsaWRcbiAgICAgKi9cbiAgICBvbmVWYWxpZCgpIHtcbiAgICAgICAgbGV0IGZvdW5kSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuZm9yRWFjaCgodmFsdWUscGFyZW50KSA9PiB7XG4gICAgICAgICAgICBpZighdmFsdWUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgZm91bmRJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGlmKCFmb3VuZEludmFsaWQpIHtcbiAgICAgICAgICAgIHN1cGVyLnZhbGlkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbmUgdmFsaWRhdG9yIHNhaWQgaXQgd2FzIGludmFsaWRcbiAgICAgKi9cbiAgICBvbmVJbnZhbGlkKCkge1xuICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgfVxufSIsImltcG9ydCB7IE1hY1V0aWxzLCBSYWRpeFV0aWxzLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgSWRTcGFjZSB7XG5cbiAgICBzdGF0aWMgSURfU1BBQ0VfU1RSSU5HX1dJRFRIID0gMTc7XG5cbiAgICBzdGF0aWMgSFdfU1RSSU5HX1BBUlRfV0lEVEggPSA5O1xuICAgIHN0YXRpYyBFUE9DSF9TRUNPTkRTX1NUUklOR19QQVJUX1dJRFRIID0gNjtcbiAgICBzdGF0aWMgQ09VTlRfU1RSSU5HX1BBUlRfV0lEVEggPSAyO1xuXG4gICAgY29uc3RydWN0b3IobWFjID0gbnVsbCwgZXBvY2hTZWNvbmRzID0gbnVsbCwgY291bnRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5tYWMgPSBtYWM7XG4gICAgICAgIHRoaXMuZXBvY2hTZWNvbmRzID0gZXBvY2hTZWNvbmRzO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZFNwYWNlU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtJZFNwYWNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShpZFNwYWNlU3RyaW5nKSB7XG4gICAgICAgIGlmIChpZFNwYWNlU3RyaW5nID09IG51bGwgfHwgaWRTcGFjZVN0cmluZy5sZW5ndGggPCBJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCB8fCAhUmFkaXhVdGlscy5pc1ZhbGlkUmFkaXhTdHJpbmcoaWRTcGFjZVN0cmluZykpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiSUQgU3BhY2UgbXVzdCBiZSBhdCBsZWFzdCBcIiArIElkU3BhY2UuSURfU1BBQ0VfU1RSSU5HX1dJRFRIICsgXCIgY2hhcmFjdGVycyBsb25nIGFuZCBjb250YWluIHZhbGlkIGNoYXJhY3RlcnMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hY1N0cmluZyA9IGlkU3BhY2VTdHJpbmcuc3Vic3RyaW5nKDAsIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgpO1xuICAgICAgICBjb25zdCBlcG9jaFNlY29uZHNTdHJpbmcgPSBpZFNwYWNlU3RyaW5nLnN1YnN0cmluZyhcbiAgICAgICAgICAgIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgsIFxuICAgICAgICAgICAgSWRTcGFjZS5IV19TVFJJTkdfUEFSVF9XSURUSCArIElkU3BhY2UuRVBPQ0hfU0VDT05EU19TVFJJTkdfUEFSVF9XSURUSCk7XG5cbiAgICAgICAgY29uc3QgY291bnRlclN0cmluZyA9IGlkU3BhY2VTdHJpbmcuc3Vic3RyaW5nKFxuICAgICAgICAgICAgSWRTcGFjZS5IV19TVFJJTkdfUEFSVF9XSURUSCArIElkU3BhY2UuRVBPQ0hfU0VDT05EU19TVFJJTkdfUEFSVF9XSURUSCxcbiAgICAgICAgICAgIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEggKyBJZFNwYWNlLkVQT0NIX1NFQ09ORFNfU1RSSU5HX1BBUlRfV0lEVEggKyBJZFNwYWNlLkNPVU5UX1NUUklOR19QQVJUX1dJRFRIKTtcblxuICAgICAgICBjb25zdCBtYWMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyhtYWNTdHJpbmcpO1xuICAgICAgICBjb25zdCBlcG9jaFNlY29uZHMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyhlcG9jaFNlY29uZHNTdHJpbmcpO1xuICAgICAgICBjb25zdCBjb3VudGVyID0gUmFkaXhVdGlscy5mcm9tUmFkaXhTdHJpbmcoY291bnRlclN0cmluZyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBJZFNwYWNlKG1hYywgZXBvY2hTZWNvbmRzLCBjb3VudGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBtYWNTdHJpbmcgPSBTdHJpbmdVdGlscy5sZWZ0UGFkKFJhZGl4VXRpbHMudG9SYWRpeFN0cmluZyh0aGlzLm1hYyksIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgsICcwJyk7XG4gICAgICAgIGNvbnN0IGVwb2NoU2Vjb25kc1N0cmluZyA9IFN0cmluZ1V0aWxzLmxlZnRQYWQoUmFkaXhVdGlscy50b1JhZGl4U3RyaW5nKHRoaXMuZXBvY2hTZWNvbmRzKSwgSWRTcGFjZS5FUE9DSF9TRUNPTkRTX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICBjb25zdCBjb3VudGVyU3RyaW5nID0gU3RyaW5nVXRpbHMubGVmdFBhZChSYWRpeFV0aWxzLnRvUmFkaXhTdHJpbmcodGhpcy5jb3VudGVyKSwgSWRTcGFjZS5DT1VOVF9TVFJJTkdfUEFSVF9XSURUSCwgJzAnKTtcbiAgICAgICAgcmV0dXJuIG1hY1N0cmluZyArIGVwb2NoU2Vjb25kc1N0cmluZyArIGNvdW50ZXJTdHJpbmc7XG4gICAgfVxuXG4gICAgcmVwb3J0KCkge1xuICAgICAgICBjb25zdCByZXBvcnQgPSBuZXcgTWFwKCk7XG4gICAgICAgIHJlcG9ydC5zZXQoXCJJZFNwYWNlIFtNQUNdXCIsIE1hY1V0aWxzLnRvTWFjQWRkcmVzcyh0aGlzLm1hYykpO1xuICAgICAgICByZXBvcnQuc2V0KFwiSWRTcGFjZSBbRXBvY2hdXCIsIHRoaXMuZXBvY2hTZWNvbmRzICogMTAwMCk7XG4gICAgICAgIHJlcG9ydC5zZXQoXCJJZFNwYWNlIFtEYXRlXVwiLCBuZXcgRGF0ZSh0aGlzLmVwb2NoU2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICByZXBvcnQuc2V0KFwiSWRTcGFjZSBbQ291bnRlcl1cIiwgdGhpcy5jb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG59IiwiaW1wb3J0IHsgUmFkaXhVdGlscywgU3RyaW5nVXRpbHMgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIFVzZXJJZCB7XG5cbiAgICBzdGF0aWMgVVNFUl9JRF9TVFJJTkdfV0lEVEggPSA5O1xuXG4gICAgc3RhdGljIEVQT0NIX0NFTlRJU19TVFJJTkdfUEFSVF9XSURUSCA9IDc7XG4gICAgc3RhdGljIENPVU5UX1NUUklOR19QQVJUX1dJRFRIID0gMjtcblxuICAgIGNvbnN0cnVjdG9yKGVwb2NoQ2VudGlzID0gbnVsbCwgY291bnRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lcG9jaENlbnRpcyA9IGVwb2NoQ2VudGlzO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWRTdHJpbmcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHVzZXJJZFN0cmluZykge1xuICAgICAgICBpZiAodXNlcklkU3RyaW5nID09IG51bGwgfHwgdXNlcklkU3RyaW5nLmxlbmd0aCAhPT0gVXNlcklkLlVTRVJfSURfU1RSSU5HX1dJRFRIIHx8ICFSYWRpeFV0aWxzLmlzVmFsaWRSYWRpeFN0cmluZyh1c2VySWRTdHJpbmcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2VyIElEIG11c3QgYmUgYXQgbGVhc3QgXCIgKyBVc2VySWQuVVNFUl9JRF9TVFJJTkdfV0lEVEggKyBcIiBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNvbnRhaW4gdmFsaWQgY2hhcmFjdGVycy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXBvY2hDZW50aXMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyh1c2VySWRTdHJpbmcuc3Vic3RyaW5nKDAsIFVzZXJJZC5FUE9DSF9DRU5USVNfU1RSSU5HX1BBUlRfV0lEVEgpKTtcbiAgICAgICAgY29uc3QgY291bnRlciA9IFJhZGl4VXRpbHMuZnJvbVJhZGl4U3RyaW5nKHVzZXJJZFN0cmluZy5zdWJzdHJpbmcoVXNlcklkLkVQT0NIX0NFTlRJU19TVFJJTkdfUEFSVF9XSURUSCwgVXNlcklkLlVTRVJfSURfU1RSSU5HX1dJRFRIKSk7XG4gICAgICAgIHJldHVybiBuZXcgVXNlcklkKGVwb2NoQ2VudGlzLCBjb3VudGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBlcG9jaE1pbGxpc1N0cmluZyA9IFN0cmluZ1V0aWxzLmxlZnRQYWQoUmFkaXhVdGlscy50b1JhZGl4U3RyaW5nKHRoaXMuZXBvY2hDZW50aXMpLCBVc2VySWQuRVBPQ0hfQ0VOVElTX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICBjb25zdCBjb3VudGVyU3RyaW5nID0gU3RyaW5nVXRpbHMubGVmdFBhZChSYWRpeFV0aWxzLnRvUmFkaXhTdHJpbmcodGhpcy5jb3VudGVyKSwgVXNlcklkLkNPVU5UX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICByZXR1cm4gZXBvY2hNaWxsaXNTdHJpbmcgKyBjb3VudGVyU3RyaW5nO1xuICAgIH1cblxuICAgIHJlcG9ydCgpIHtcbiAgICAgICAgY29uc3QgcmVwb3J0ID0gbmV3IE1hcCgpO1xuICAgICAgICByZXBvcnQuc2V0KFwiVXNlcklkIFtFcG9jaF1cIiwgdGhpcy5lcG9jaENlbnRpcyAqIDEwKTtcbiAgICAgICAgcmVwb3J0LnNldChcIlVzZXJJZCBbRGF0ZV1cIiwgbmV3IERhdGUodGhpcy5lcG9jaENlbnRpcyAqIDEwKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgcmVwb3J0LnNldChcIlVzZXJJZCBbQ291bnRlcl1cIiwgdGhpcy5jb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBJZFNwYWNlIH0gZnJvbSBcIi4vaWRTcGFjZVwiO1xuaW1wb3J0IHsgVXNlcklkIH0gZnJvbSBcIi4vdXNlcklkXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJZFwiKTtcblxuZXhwb3J0IGNsYXNzIElkIHtcblxuICAgIGNvbnN0cnVjdG9yKGlkU3BhY2UgPSBudWxsLCB1c2VySWQgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuaWRTcGFjZSA9IGlkU3BhY2VcbiAgICAgICAgdGhpcy51c2VySWQgPSB1c2VySWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtJZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UoaWRTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaWRTcGFjZVN0cmluZyA9IGlkU3RyaW5nLnN1YnN0cmluZygwLCBJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZFN0cmluZyA9IGlkU3RyaW5nLnN1YnN0cmluZyhJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCk7XG5cbiAgICAgICAgY29uc3QgaWRTcGFjZSA9IElkU3BhY2UucGFyc2UoaWRTcGFjZVN0cmluZyk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJJZC5wYXJzZSh1c2VySWRTdHJpbmcpO1xuXG4gICAgICAgIHJldHVybiBuZXcgSWQoaWRTcGFjZSwgdXNlcklkKTtcbiAgICB9XG5cbiAgICByZXBvcnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgaWRTcGFjZVJlcG9ydCA9IHRoaXMuaWRTcGFjZS5yZXBvcnQoKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaWRTcGFjZVJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHJlcG9ydC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlcklkUmVwb3J0ID0gdGhpcy51c2VySWQucmVwb3J0KCk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHVzZXJJZFJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHJlcG9ydC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG5cbiAgICByZXBvcnRTdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IHRoaXMucmVwb3J0KCk7XG4gICAgICAgIGxldCByZXBvcnRTdHJpbmcgPSBcIlwiXG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIHJlcG9ydFN0cmluZyArPSBrZXkgKyBcIjogXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwb3J0U3RyaW5nICs9IFwiXFxuXCIgKyBrZXkgKyBcIjogXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcG9ydFN0cmluZztcbiAgICB9XG5cbiAgICBwcmludCAoKXtcbiAgICAgICAgTE9HLmluZm8odGhpcy5yZXBvcnRTdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBpZFNwYWNlLnRvU3RyaW5nKCkgKyB1c2VySWQudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB1c2VySWQoKSB7XG4gICAgICAgIHJldHVybiB1c2VySWQudG9TdHJpbmcoKTtcbiAgICB9XG5cbn0iXSwibmFtZXMiOlsiU3RyaW5nVXRpbHMiLCJMb2dnZXIiLCJDb250YWluZXJVcmwiLCJDb250YWluZXJIdHRwQ2xpZW50IiwiQ29udGFpbmVyVXBsb2FkRGF0YSIsIkxPRyIsIkluamVjdGlvblBvaW50IiwiTWluZGlJbmplY3RvciIsIkFycmF5VXRpbHMiLCJNYXAiLCJYbWxFbGVtZW50IiwiQ29udGFpbmVyRWxlbWVudFV0aWxzIiwiQ29udGFpbmVyRWxlbWVudCIsIkxpc3QiLCJNZXRob2QiLCJDb250YWluZXJUZXh0IiwiWG1sQ2RhdGEiLCJDb250YWluZXJXaW5kb3ciLCJYbWxBdHRyaWJ1dGUiLCJEb21UcmVlIiwiTWluZGlDb25maWciLCJTaW5nbGV0b25Db25maWciLCJQcm90b3R5cGVDb25maWciLCJJbnN0YW5jZVBvc3RDb25maWdUcmlnZ2VyIiwiQ29uZmlnQWNjZXNzb3IiLCJQcm9wZXJ0eUFjY2Vzc29yIiwiTWFwVXRpbHMiLCJDb250YWluZXJEb3dubG9hZCIsIlJhZGl4VXRpbHMiLCJNYWNVdGlscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sTUFBTSxZQUFZLENBQUM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxTQUFTLENBQUMsR0FBRyxFQUFFO0FBQ3BCLE1BQU07QUFDTjtBQUNBOztBQ1JPLE1BQU0sR0FBRztBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFLGNBQWMsR0FBRyxJQUFJLEVBQUUsYUFBYSxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFFLGNBQWMsR0FBRyxJQUFJLEVBQUU7QUFDaEk7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDdkM7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDL0I7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDL0I7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7QUFDN0M7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDM0M7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7QUFDN0M7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RSxPQUFPLElBQUksQ0FBQyxFQUFFO0FBQ2hELFFBQVEsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzdDLFlBQVksU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsU0FBUztBQUNULFFBQVEsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzNDLFlBQVksU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMzQyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMzQyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN2QyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFNBQVM7QUFDVCxRQUFRLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckQ7QUFDQSxRQUFRLE1BQU0sYUFBYSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDMUMsUUFBUSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLO0FBQzND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
