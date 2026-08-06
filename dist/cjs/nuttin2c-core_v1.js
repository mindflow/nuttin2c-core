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

const LOG$f = new coreutil_v1.Logger("StylesRegistry");

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
        LOG$f.info("Loading styles " + name + " at " + url.toString());

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

const LOG$e = new coreutil_v1.Logger("TemplateRegistry");

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
        LOG$e.info("Loading template " + name + " at " + url.toString());
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

const LOG$d = new coreutil_v1.Logger("LoaderInterceptor");

class LoaderInterceptor {

    /**
     * @returns {Boolean}
     */
    process() {
        LOG$d.info("Unimplemented Loader Interceptor breaks by default");
        return false;
    }

}

const LOG$c = new coreutil_v1.Logger("ModuleLoader");

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
            LOG$c.error("Url is null");
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
            LOG$c.warn("Filter rejected " + reason);
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

const LOG$b = new coreutil_v1.Logger("DiModuleLoader");

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
            LOG$b.warn("Module loader failed " + reason);
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

    static NEW = "__NEW__";
    static UPDATE = "__UPDATE__";
    static DELETE = "__DELETE__";

    static ANY = "__ANY__";
    static DEFAULT = "__DEFAULT__";

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
        if (!this.domainListeners.has(StateManager.ANY)) {
            this.domainListeners.set(StateManager.ANY, new Array());
        }
        this.domainListeners.get(StateManager.ANY).push(domainListener);

        if (errorListener != null) {
            if (!this.errorListeners.has(StateManager.ANY)) {
                this.errorListeners.set(StateManager.ANY, new Array());
            }
            this.errorListeners.get(StateManager.ANY).push(errorListener);
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
    async handle(objectPromise, key = StateManager.DEFAULT) {
        try {
            const object = await objectPromise;
            return await this.updateDomain(object, key);
        } catch (error) {
            await this.updateError(error, key);
            return error;
        }
    }

    async updateError(error, key = StateManager.DEFAULT) {
        this.initialized = true;
        this.errorMap.set(key, error);
        this.signalErrorChange(error, key);
    }

    async updateDomain(object, key = StateManager.DEFAULT) {
        if (Array.isArray(object)) {
            for (let i = 0; i < object.length; i++) {
                object[i] = this.createProxy(object[i], key, this);
            }
        }
        object = this.createProxy(object, key, this);

        let change = this.domainMap.has(key) ? StateManager.UPDATE : StateManager.NEW;

        this.domainMap.set(key, object);
        
        this.initialized = true;
        if (this.errorMap.get(key) != null) {
            this.errorMap.delete(key);
            this.signalErrorChange(null, key);
        }
        this.signalDomainChange(object, key, change);
        return object;
    }

    async delete(key = StateManager.DEFAULT) {

        this.domainMap.delete(key);
        this.domainListeners.delete(key);

        this.errorMap.delete(key);
        this.errorListeners.delete(key);

        this.initialized = true;

        this.signalDomainChange(null, key, StateManager.DELETE);
    }

    async clear() {
        this.initialized = true;
        for (let key of this.domainMap.keys()) {
            this.signalDomainChange(null, key, StateManager.DELETE);
        }
        this.signalDomainChange(null, StateManager.ANY, StateManager.DELETE);

        this.domainMap.clear();
        this.domainListeners.clear();

        this.errorMap.clear();
        this.errorListeners.clear();

        this.initialized = false;
    }

    /**
     * Signals a domain change to all listeners for a specific key.
     * @param {any} object - The object that has changed.
     * @param {string} key - The key associated with the object.
     * @param {string} change - The type of change (new, updated, deleted).
     */
    signalDomainChange(object, key, change) {
        if (this.domainListeners.has(key)) {
            for (let listener of this.domainListeners.get(key)) {
                listener.call([object, key, change]);
            }
        }

        if (key != StateManager.ANY && this.domainListeners.has(StateManager.ANY)) {
            for (let listener of this.domainListeners.get(StateManager.ANY)) {
                listener.call([object, key, change]);
            }
        }
    }

    /**
     * Signals an error change to all listeners for a specific key.
     * @param {any} error - The error that has occurred.
     * @param {string} key - The key associated with the error.
     */
    signalErrorChange(error, key) {
        if (this.errorListeners.has(key)) {
            for (let listener of this.errorListeners.get(key)) {
                listener.call([error, key]);
            }
        }

        if (key != StateManager.ANY && this.errorListeners.has(StateManager.ANY)) {
            for (let listener of this.errorListeners.get(StateManager.ANY)) {
                listener.call([error, key]);
            }
        }
    }

    createProxy(object, key, stateManager) {
        return new Proxy(object, {
            /**
             * Signals a domain change when a property is set on the state managed object.
             * @param {any} target 
             * @param {string} prop 
             * @param {any} value 
             * @returns 
             */
            set: (target, prop, value) => {
                if (target[prop] === value) {
                    return true;
                }
                const success = (target[prop] = value);
                stateManager.signalDomainChange(target, key, StateManager.UPDATE);
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

const LOG$a = new coreutil_v1.Logger("ElementUtils");

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
        LOG$a.error("Unrecognized value for Element");
        LOG$a.error(value);
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

const LOG$9 = new coreutil_v1.Logger("BaseElement");

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
        LOG$9.warn("No valid input to set the element");
        LOG$9.warn(input);
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
        LOG$9.warn("No valid input to add the element");
        LOG$9.warn(input);
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
        LOG$9.warn("No valid input to prepend the element");
        LOG$9.warn(input);
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

    /**
     * 
     * @param {String} elementName 
     * @param {Map<String, String>} attributeMap 
     * @returns 
     */
    static customChild(elementName, parent, attributeMap = null){
        const xmlElement = new xmlparser_v1.XmlElement(elementName);
        if (attributeMap) {
            attributeMap.forEach((value, key) => {
                xmlElement.setAttribute(key, new xmlparser_v1.XmlAttribute(key, null, value));
            });
        }
        return ElementMapper.map(xmlElement, parent);
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

/* jshint esversion: 6 */

const LOG$8 = new coreutil_v1.Logger("InputElementDataBinding");

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
            // Replace with containerbridge
            const optionElement = HTML.customChild("option", this);
            optionElement.value = option.value;
            optionElement.label = option.label;
            this.containerElement.appendChild(optionElement.containerElement);
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
     * Returns the value given any processing rules
     */
    set value(value){
        this.containerElement.value = value;
        if (this.containerElement.value === value) {
            this.containerElement.dispatchEvent('change');
        } else if (value !== null && value !== undefined) {
            LOG$8.warn("Value '" + value + "' not found in options for select element with name '" + this.name + "'.");
        }
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

const LOG$7 = new coreutil_v1.Logger("CanvasStyles");

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
            LOG$7.error("Style does not exist: " + name);
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
            LOG$7.error("Style does not exist: " + name);
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

const LOG$6 = new coreutil_v1.Logger("TemplateComponentFactory");

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
            LOG$6.error(this.templateRegistry);
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

const LOG$5 = new coreutil_v1.Logger("Application");

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
        LOG$5.info("Running Application");
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
        LOG$5.info("Application: update to " + url.toString());
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
            LOG$5.error(error);
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
            LOG$5.info(this.config.configEntries);
        };
    }

    /**
     * Enable global access to template registry
     */
    windowTemplateRegistry() {
        window.templateRegistry = () => {
            const typeConfig = mindi_v1.ConfigAccessor.typeConfigByName(TemplateRegistry.name, this.config);
            LOG$5.info(typeConfig.instanceHolder().instance);
        };
    }

    /**
     * Enable global access to style registry
     */
    windowStyleRegistry() {
        window.styleRegistry = () => {
            const typeConfig = mindi_v1.ConfigAccessor.typeConfigByName(StylesRegistry.name, this.config);
            LOG$5.info(typeConfig.instanceHolder().instance);
        };
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
                field.value = modelValue ? modelValue : "";
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

const LOG$4 = new coreutil_v1.Logger("EventManager");

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
    listenTo(eventType, listenerFunction, contextObject, explodeArrayParams = true) {
        const listener = new coreutil_v1.Method(listenerFunction, contextObject, explodeArrayParams);
        if (!this.listenerMap.contains(eventType)) {
            this.listenerMap.set(eventType, new coreutil_v1.List());
        }
        this.listenerMap.get(eventType).add(listener);
        return this;
    }

    /**
     * 
     * @param {string} sourceEventType 
     * @param {EventManager} destinationEventManager 
     * @param {string} destinationEventType 
     * @param {any} customParameter
     * @returns {EventManager}
     */
    route(sourceEventType, destinationEventManager, destinationEventType, customParameter = null) {
        this.listenTo(sourceEventType, (defaultParameter) => {
            const allParameters = Array.isArray(defaultParameter) ? defaultParameter : [defaultParameter];
            if (customParameter !== null) {
                allParameters.push(customParameter);
            }
            return destinationEventManager.trigger(destinationEventType, allParameters);
        }, this, false);
        return this;
    }

    /**
     * @param {string} eventType 
     * @param {Array|any} parameter 
     * @returns {Promise<Array>}
     */
    async trigger(eventType, parameter) {
        if (!eventType) {
            LOG$4.error("Event type is undefined");
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
    static create(stylesheetBuilder = StylesheetBuilder.create()) {
        return new Css3StylesheetBuilder(stylesheetBuilder);
    }

    constructor(stylesheetBuilder = StylesheetBuilder.create()) {

        /** @type {StylesheetBuilder} */
        this.stylesheetBuilder = stylesheetBuilder;

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
    media(minWidth, maxWidth, pointer = null, hover = null) {
        if (this.stylesheetBuilder.context instanceof StyleSelector) {
            this.stylesheetBuilder.close();
        }
        if (this.stylesheetBuilder.context instanceof StyleMedia) {
            this.stylesheetBuilder.close();
        }
        
        let mediaQuery = "@media ";
        let hasCondition = false;

        if (minWidth) {
            mediaQuery += `(min-width: ${minWidth})`;
            hasCondition = true;
        }

        if (maxWidth) {
            if (hasCondition) { mediaQuery += " and "; }
            mediaQuery += `(max-width: ${maxWidth})`;
            hasCondition = true;
        }

        if (pointer) {
            if (hasCondition) { mediaQuery += " and "; }
            mediaQuery += `(pointer: ${pointer})`;
            hasCondition = true;
        }

        if (hover) {
            if (hasCondition) { mediaQuery += " and "; }
            mediaQuery += `(hover: ${hover})`;
            hasCondition = true;
        }

        this.stylesheetBuilder.media(mediaQuery);
        this.stylesheetBuilder.open();
        return this;
    }

    /**
     * @param {String} cursor E.g. "pointer", "default", "text", "move", "not-allowed"
     * @returns {Css3StylesheetBuilder}
     */
    cursor(cursor) {
        this.stylesheetBuilder.style("cursor", cursor);
        return this;
    }

    /**
     * @param {String} content E.g. "''", "'Hello'", "url(image.png)"
     * @returns {Css3StylesheetBuilder}
     */  
    content(content) {
        this.stylesheetBuilder.style("content", content);
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
     * @param {String} zIndex 
     * @returns {Css3StylesheetBuilder}
     */
    zIndex(zIndex) {
        this.stylesheetBuilder.style("z-index", zIndex);
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
     * @param {String} fontWeight
     * @returns {Css3StylesheetBuilder}
     */
    fontWeight(fontWeight) {
        this.stylesheetBuilder.style("font-weight", fontWeight);
        return this;
    }

    /**
     * @param {String} fontFamily
     * @returns {Css3StylesheetBuilder}
     */
    fontFamily(fontFamily) {
        this.stylesheetBuilder.style("font-family", fontFamily);
        return this;
    }

    /**
     * @param {String} color
     * @returns {Css3StylesheetBuilder}
     */
    color(color) {
        this.stylesheetBuilder.style("color", color);
        return this;
    }

    /**
     * @param {String} textAlign E.g. "left", "right", "center", "justify"
     * @returns {Css3StylesheetBuilder}
     */
    textAlign(textAlign) {
        this.stylesheetBuilder.style("text-align", textAlign);
        return this;
    }

    verticalAlign(verticalAlign) {
        this.stylesheetBuilder.style("vertical-align", verticalAlign);
        return this;
    }

    userSelect(userSelect) {
        this.stylesheetBuilder.style("user-select", userSelect);
        return this;
    }

    /**
     * @param {String} grow 
     * Grows relative to the other flex items in the container when there is extra space.
     * E.g. grow of 1 vs grow of 2, the second item will grow twice as much.
     * 
     * @param {String} shrink 
     * Shrinks relative to the other flex items in the container when not enough space.
     * E.g. shrink of 1 vs shrink of 2, the second item will shrink twice as much.
     * 
     * @param {String} basis 
     * Initial main size. E.g "100px", "20%", "auto". Default value is "auto",
     * sized according to its content. If "0", sized based on grow and shrink.
     * 
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
     * @param {String} flow E.g. "row nowrap", "column wrap", "row-reverse wrap-reverse"
     * @returns {Css3StylesheetBuilder}
     */
    flexFlow(flow) {
        this.stylesheetBuilder.style("flex-flow", flow);
        return this;
    }

    gap(gap) {
        this.stylesheetBuilder.style("gap", gap);
        return this;
    }

    /**
     * @param {String} columns
     * @returns {Css3StylesheetBuilder}
     */
    gridTemplateColumns(columns) {
        this.stylesheetBuilder.style("grid-template-columns", columns);
        return this;
    }

    /**
     * @param {String} rows
     * @returns {Css3StylesheetBuilder}
     */
    gridTemplateRows(rows) {
        this.stylesheetBuilder.style("grid-template-rows", rows);
        return this;
    }

    /**
     * @param {String} column
     * @returns {Css3StylesheetBuilder}
     */
    gridColumn(column) {
        this.stylesheetBuilder.style("grid-column", column);
        return this;
    }

    /**
     * @param {String} row
     * @returns {Css3StylesheetBuilder}
     */
    gridRow(row) {
        this.stylesheetBuilder.style("grid-row", row);
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
     * @param {String} visibility E.g. "visible", "hidden", "collapse"
     * @returns {Css3StylesheetBuilder}
     */
    visibility(visibility) {
        this.stylesheetBuilder.style("visibility", visibility);
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
        if (top && right && bottom && left) {
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
     * @param {String} top 
     * @param {String} right 
     * @param {String} bottom 
     * @param {String} left 
     * @returns {Css3StylesheetBuilder}
     */
    margin(top, right, bottom, left) {
        if (top && right && bottom && left) {
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
     * @param {String} width
     * @param {String} style
     * @param {String} color
     * @returns {Css3StylesheetBuilder}
     */
    border(width, style, color) {
        const value = `${width} ${style} ${color}`;
        this.stylesheetBuilder.style("border", value);
        return this;
    }

    /**
     * @param {String} radius
     * @returns {Css3StylesheetBuilder}
     */
    borderRadius(radius) {
        this.stylesheetBuilder.style("border-radius", radius);
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
     * @param {String} backgroundSize
     * @returns {Css3StylesheetBuilder}
     */
    backgroundSize(backgroundSize) {
        this.stylesheetBuilder.style("background-size", backgroundSize);
        return this;
    }

    /**
     * @param {String} backgroundClip E.g. "border-box", "padding-box", "content-box"
     * @returns {Css3StylesheetBuilder}
     */
    backgroundClip(backgroundClip) {
        this.stylesheetBuilder.style("background-clip", backgroundClip);
        return this;
    }

    /**
     * @param {String} backgroundImage E.g. "url(image.png)", "none"
     * @returns {Css3StylesheetBuilder}
     */
    backgroundImage(backgroundImage) {
        this.stylesheetBuilder.style("background-image", backgroundImage);
        return this;
    }

    /**
     * @param {String} backgroundRepeat E.g. "repeat", "no-repeat", "repeat-x", "repeat-y", "space", "round"
     * @returns {Css3StylesheetBuilder}
     */
    backgroundRepeat(backgroundRepeat) {
        this.stylesheetBuilder.style("background-repeat", backgroundRepeat);
        return this;
    }

    /**
     * @param {String} appearance E.g. "none", "auto", "button", "textfield", "menulist", "searchfield"
     * @returns {Css3StylesheetBuilder}
     */
    appearance(appearance) {
        this.stylesheetBuilder.style("appearance", appearance);
        return this;
    }

    /**
     * @param {String} opacity E.g. "0", "0.5", "1"
     * @returns {Css3StylesheetBuilder}
     */
    opacity(opacity) {
        this.stylesheetBuilder.style("opacity", opacity);
        return this;
    }

    /**
     * @param {String} justifyContent E.g. "flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"
     * @returns {Css3StylesheetBuilder}
     */
    justifyContent(justifyContent) {
        this.stylesheetBuilder.style("justify-content", justifyContent);
        return this;
    }

    /**
     * @param {String} alignSelf E.g. "auto", "stretch", "center", "flex-start", "flex-end", "baseline"
     * @returns {Css3StylesheetBuilder}
     */
    alignSelf(alignSelf) {
        this.stylesheetBuilder.style("align-self", alignSelf);
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
     * @param {String} offsetX 
     * @param {String} offsetY 
     * @param {String} blurRadius
     * @param {String} spreadRadius
     * @param {String} color
     * @returns {Css3StylesheetBuilder}
     */
    boxShadow(offsetX, offsetY, blurRadius, spreadRadius, color) {
        if (blurRadius && spreadRadius) {
            const value = `${offsetX} ${offsetY} ${blurRadius} ${spreadRadius} ${color}`;
            this.stylesheetBuilder.style("box-shadow", value);
        } else if (blurRadius) {
            const value = `${offsetX} ${offsetY} ${blurRadius} ${color}`;
            this.stylesheetBuilder.style("box-shadow", value);
        } else {
            const value = `${offsetX} ${offsetY} ${color}`;
            this.stylesheetBuilder.style("box-shadow", value);
        }
        return this;
    }

    /**
     * @param {...String[]} transitions E.g. ["transform", ".3s", null, "ease-in-out"], ["opacity", ".2s"]
     * @returns {Css3StylesheetBuilder}
     */
    transition(...transitions) {
        const transitionValues = transitions.map(transition => {
            const [property, duration, delay, timingFunction] = transition;
            let value = `${property} ${duration}`;
            if (timingFunction) {
                value += ` ${timingFunction}`;
            }
            if (delay) {
                value += ` ${delay}`;
            }
            return value;
        });
        this.stylesheetBuilder.style("transition", transitionValues.join(", "));
        return this;
    }

    /**
     * @param {String} transform 
     * @returns {Css3StylesheetBuilder}
     */
    transform(transform) {
        this.stylesheetBuilder.style("transform", transform);
        return this;
    }

    transformOrigin(transformOrigin) {
        this.stylesheetBuilder.style("transform-origin", transformOrigin);
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

const LOG$3 = new coreutil_v1.Logger("HttpCallBuilder");

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
        let successResponse = null;
        let failResponse = null;      
        try {  
            const responseJson = await fetchResponse.json();
            if (successResponseMapper) { 
                successResponse = successResponseMapper(responseJson);
            }
            if (null == successResponse && failResponseMapper) {
                failResponse = failResponseMapper(responseJson);
            }
            if (null == successResponse && null == failResponse) {
                failResponse = this.errorMappingFunction(responseJson);
            }
        } catch(error) {
            // Response did not provide json
            LOG$3.error("Error parsing response json", error);
            throw this.errorMappingFunction(error);
        }

        if (successResponse) {
            return successResponse;
        }
        if (failResponse) {
            throw failResponse;
        }
        throw new Error("Missing mapper for return status: " + fetchResponse.status);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnV0dGluMmMtY29yZV92MS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL251dHRpbjJjL21vZHVsZVJ1bm5lci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybFV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vaGlzdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi9uYXZpZ2F0aW9uLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vdHJhaWxOb2RlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2FjdGl2ZU1vZHVsZVJ1bm5lci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jbGllbnQvY2xpZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZXNoZWV0LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZXNSZWdpc3RyeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy90ZW1wbGF0ZS90ZW1wbGF0ZS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy90ZW1wbGF0ZS90ZW1wbGF0ZVJlZ2lzdHJ5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3RlbXBsYXRlL3RlbXBsYXRlc0xvYWRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVzTG9hZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2NvbXBvbmVudC9jb21wb25lbnRDb25maWdQcm9jZXNzb3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbG9hZGVyL2xvYWRlckludGVyY2VwdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2xvYWRlci9tb2R1bGVMb2FkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbW9kdWxlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2xvYWRlci9kaU1vZHVsZUxvYWRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdGF0ZS9zdGF0ZU1hbmFnZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L3VuaXF1ZUlkUmVnaXN0cnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9hdHRyaWJ1dGUuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9tYXBwZWRDb250YWluZXJFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvZWxlbWVudFV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvYmFzZUVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2NvbXBvbmVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvcmFkaW9JbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9jaGVja2JveElucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3RleHRJbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC90ZXh0YXJlYUlucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3RleHRub2RlRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3NpbXBsZUVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9mb3JtRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3ZpZGVvRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L29wdGlvbkVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvaHRtbC9odG1sLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvc2VsZWN0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L2ZpbGVJbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9lbGVtZW50TWFwcGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2NvbXBvbmVudC9lbGVtZW50UmVnaXN0cmF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY2FudmFzL2NhbnZhc1Jvb3QuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY2FudmFzL2NhbnZhc1N0eWxlcy5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jb21wb25lbnQvY29tcG9uZW50RmFjdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jb21wb25lbnQvdGVtcGxhdGVDb21wb25lbnRGYWN0b3J5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vdHJhaWxJdGVyYXRpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi90cmFpbFByb2Nlc3Nvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVTZWxlY3Rvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVNZWRpYS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVzaGVldEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2NvbXBvbmVudEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2lubGluZUNvbXBvbmVudEZhY3RvcnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvYXBwbGljYXRpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZGF0YUJpbmQvaW5wdXRFbGVtZW50RGF0YUJpbmRpbmcuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZGF0YUJpbmQvcHJveHlPYmplY3RGYWN0b3J5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2NvbmZpZy9jb25maWd1cmVkRnVuY3Rpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZXZlbnQvZXZlbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZXZlbnQvZXZlbnRGaWx0ZXJlZE1ldGhvZC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9ldmVudC9ldmVudE1hbmFnZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvc3R5bGVzL2NzczNTdHlsZXNoZWV0QnVpbGRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVBY2Nlc3Nvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVDbGFzc0FjY2Vzc29yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvaHR0cENhbGxCdWlsZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvcXVlcnlQYXJhbUJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9zaGFVdGlscy5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvYWJzdHJhY3RWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL2FuZFZhbGlkYXRvclNldC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvcmVnZXhWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL2VtYWlsVmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9lcXVhbHNGdW5jdGlvblJlc3VsdFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvZXF1YWxzUHJvcGVydHlWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL2VxdWFsc1N0cmluZ1ZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvbnVtYmVyVmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9vclZhbGlkYXRvclNldC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvcGFzc3dvcmRWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL3Bob25lbFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvcmVxdWlyZWRWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9pZC9pZFNwYWNlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvaWQvdXNlcklkLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvaWQvaWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE1vZHVsZVJ1bm5lciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgICBydW5Nb2R1bGUodXJsKSB7XG4gICAgIH1cblxufSIsImltcG9ydCB7IFN0cmluZ1V0aWxzIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBVcmx7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvdG9jb2wgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGhvc3QgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBvcnQgXG4gICAgICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBwYXRoVmFsdWVBcnJheSBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsIEFycmF5PFN0cmluZz4+fSBxdWVyeVBhcmFtTWFwXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFuY2hvciBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsIFN0cmluZz59IGFuY2hvclBhcmFtTWFwXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJvdG9jb2wsIGhvc3QsIHBvcnQgPSBudWxsLCBwYXRoVmFsdWVBcnJheSA9IG51bGwsIHF1ZXJ5UGFyYW1NYXAgPSBudWxsLCBhbmNob3IgPSBudWxsLCBhbmNob3JQYXJhbU1hcCA9IG51bGwpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5wcm90b2NvbFN0cmluZyA9IHByb3RvY29sO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLmhvc3RTdHJpbmcgPSBob3N0O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnBvcnRTdHJpbmcgPSBwb3J0O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8U3RyaW5nPn0gKi9cbiAgICAgICAgdGhpcy5wYXRoVmFsdWVBcnJheSA9IHBhdGhWYWx1ZUFycmF5O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgQXJyYXk8U3RyaW5nPj59ICovXG4gICAgICAgIHRoaXMucXVlcnlQYXJhbU1hcCA9IHF1ZXJ5UGFyYW1NYXA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBTdHJpbmc+fSAqL1xuICAgICAgICB0aGlzLmFuY2hvclBhcmFtTWFwID0gYW5jaG9yUGFyYW1NYXA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYW5jaG9yU3RyaW5nID0gYW5jaG9yO1xuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLnBhdGhWYWx1ZUFycmF5KSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhWYWx1ZUFycmF5ID0gbmV3IEFycmF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucXVlcnlQYXJhbU1hcCkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmFuY2hvclBhcmFtTWFwKSB7XG4gICAgICAgICAgICB0aGlzLmFuY2hvclBhcmFtTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHByb3RvY29sKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3RvY29sU3RyaW5nO1xuICAgIH1cblxuICAgIGdldCBob3N0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmhvc3RTdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0IHBvcnQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9ydFN0cmluZztcbiAgICB9XG5cbiAgICBnZXQgcGF0aHNMaXN0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGhWYWx1ZUxpc3Q7XG4gICAgfVxuXG4gICAgZ2V0IGFuY2hvcigpe1xuICAgICAgICByZXR1cm4gdGhpcy5hbmNob3JTdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0IHBhcmFtZXRlck1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1ldGVyVmFsdWVNYXA7XG4gICAgfVxuXG4gICAgZ2V0UGF0aFBhcnQoaW5kZXgpe1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoVmFsdWVMaXN0LmdldChpbmRleCk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVBhdGhWYWx1ZShmcm9tLCB0byl7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnBhdGhWYWx1ZUFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKFN0cmluZ1V0aWxzLm5vbk51bGxFcXVhbHMoZnJvbSwgdGhpcy5wYXRoVmFsdWVBcnJheVtpXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhWYWx1ZUFycmF5W2ldID0gdG87XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCBwYXRoKCl7XG4gICAgICAgIGxldCBwYXRoID0gXCIvXCI7XG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIHRoaXMucGF0aFZhbHVlTGlzdC5mb3JFYWNoKCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpcnN0KSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGggKyBcIi9cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGggPSBwYXRoICsgdmFsdWU7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9KSwgdGhpcyk7XG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCl7XG4gICAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XG4gICAgICAgIGlmKHRoaXMucHJvdG9jb2wgIT09IG51bGwpe1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIHRoaXMucHJvdG9jb2wgKyBcIi8vXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5ob3N0ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyB0aGlzLmhvc3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5wb3J0ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIjpcIiArIHRoaXMucG9ydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGF0aFZhbHVlQXJyYXkuZm9yRWFjaCgocGF0aFBhcnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIi9cIiArIHBhdGhQYXJ0O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZih0aGlzLnF1ZXJ5UGFyYW1NYXAuc2l6ZSA+IDApe1xuICAgICAgICAgICAgY29uc3QgcXVlcnlQYXJhbVN0cmluZ3MgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMucXVlcnlQYXJhbU1hcC5mb3JFYWNoKCh2YWx1ZUFycmF5LCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB2YWx1ZUFycmF5LmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbVN0cmluZ3MucHVzaChrZXkgKyBcIj1cIiArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1TdHJpbmdzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHF1ZXJ5UGFyYW1TdHJpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlICsgXCI/XCIgKyBxdWVyeVBhcmFtU3RyaW5ncy5qb2luKFwiJlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoYXNoQWRkZWQgPSBmYWxzZTtcbiAgICAgICAgaWYodGhpcy5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGhhc2hBZGRlZCA9IHRydWU7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlICsgXCIjXCIgKyB0aGlzLmFuY2hvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFuY2hvclBhcmFtTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBhbmNob3JQYXJhbVN0cmluZ3MgPSBuZXcgQXJyYXkoKTtcblxuICAgICAgICAgICAgdGhpcy5hbmNob3JQYXJhbU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuY2hvclBhcmFtU3RyaW5ncy5wdXNoKGtleSArIFwiPVwiICsgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoYW5jaG9yUGFyYW1TdHJpbmdzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWhhc2hBZGRlZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIiNcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIj9cIiArIGFuY2hvclBhcmFtU3RyaW5ncy5qb2luKFwiJlwiKTtcblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IExpc3QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuL3VybC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVXJsVXRpbHMge1xuXG4gICAgLyoqXG4gICAgICogUGFyc2Ugc3RyaW5nIHRvIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxTdHJpbmcgXG4gICAgICogQHJldHVybnMge1VybH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UodXJsU3RyaW5nKSB7XG5cbiAgICAgICAgaWYgKHVybFN0cmluZyA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvY29sID0gICAgIFVybFV0aWxzLnBhcnNlUHJvdG9jb2wodXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgaG9zdCA9ICAgICAgICAgVXJsVXRpbHMucGFyc2VIb3N0KHVybFN0cmluZyk7XG4gICAgICAgIGNvbnN0IHBvcnQgPSAgICAgICAgIFVybFV0aWxzLnBhcnNlUG9ydCh1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBwYXRoc0xpc3QgPSAgICBVcmxVdGlscy5wYXJzZVBhdGhBcnJheSh1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBxdWVyeVBhcmFtID0gICBVcmxVdGlscy5wYXJzZVF1ZXJ5UGFyYW0odXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gICAgICAgVXJsVXRpbHMucGFyc2VBbmNob3IodXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgYW5jaG9yUGFyYW1zID0gVXJsVXRpbHMucGFyc2VBbmNob3JQYXJhbXModXJsU3RyaW5nKTtcblxuICAgICAgICByZXR1cm4gbmV3IFVybChwcm90b2NvbCwgaG9zdCwgcG9ydCwgcGF0aHNMaXN0LCBxdWVyeVBhcmFtLCBhbmNob3IsIGFuY2hvclBhcmFtcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZVByb3RvY29sKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIi8vXCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHVybFN0cmluZy5zcGxpdChcIi8vXCIpWzBdO1xuICAgICAgICBpZiAocHJvdG9jb2xbcHJvdG9jb2wubGVuZ3RoIC0gMV0gIT09IFwiOlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvdG9jb2w7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUhvc3QodXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGhvc3RBbmRQb3J0ID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICBpZiAoaG9zdEFuZFBvcnQuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICBob3N0QW5kUG9ydCA9IGhvc3RBbmRQb3J0LnNwbGl0KFwiL1wiKVswXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaG9zdCA9IGhvc3RBbmRQb3J0O1xuICAgICAgICBpZiAoaG9zdEFuZFBvcnQuaW5kZXhPZihcIjpcIikgIT09IC0xKSB7XG4gICAgICAgICAgICBob3N0ID0gaG9zdEFuZFBvcnQuc3BsaXQoXCI6XCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxTdHJpbmcgXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VQb3J0KHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBob3N0QW5kUG9ydCA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgaWYgKGhvc3RBbmRQb3J0LmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgaG9zdEFuZFBvcnQgPSBob3N0QW5kUG9ydC5zcGxpdChcIi9cIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhvc3RBbmRQb3J0LmluZGV4T2YoXCI6XCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlci5wYXJzZUludChob3N0QW5kUG9ydC5zcGxpdChcIjpcIilbMV0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxTdHJpbmcgXG4gICAgICogQHJldHVybnMge0FycmF5PFN0cmluZz59XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlUGF0aEFycmF5KHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCIjXCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCI/XCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuc3RhcnRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmF3UGF0aFBhcnRMaXN0ID0gdXJsU3RyaW5nLnNwbGl0KFwiL1wiKTtcblxuICAgICAgICBjb25zdCBwYXRoVmFsdWVMaXN0ID0gbmV3IEFycmF5KCk7XG4gICAgICAgIHJhd1BhdGhQYXJ0TGlzdC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgcGF0aFZhbHVlTGlzdC5wdXNoKGRlY29kZVVSSSh2YWx1ZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBhdGhWYWx1ZUxpc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7TWFwPFN0cmluZywgTGlzdDxTdHJpbmc+Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VRdWVyeVBhcmFtKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCIjXCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiP1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsIHx8IHVybFN0cmluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBxdWVyeVBhcmFtID0gdXJsU3RyaW5nO1xuICAgICAgICBjb25zdCBwYXJhbU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgcGFyYW1QYWlycyA9IHF1ZXJ5UGFyYW0uc3BsaXQoXCImXCIpO1xuICAgICAgICBwYXJhbVBhaXJzLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChwYWlyLmluZGV4T2YoXCI9XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhaXIuc3BsaXQoXCI9XCIpWzBdO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFpci5zcGxpdChcIj1cIilbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhaXI7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5ID0gZGVjb2RlVVJJKGtleSk7XG4gICAgICAgICAgICB2YWx1ZSA9IGRlY29kZVVSSSh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIXBhcmFtTWFwLmdldChrZXkpKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1NYXAuc2V0KGtleSwgbmV3IEFycmF5KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyYW1NYXAuZ2V0KGtleSkucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGFyYW1NYXA7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQW5jaG9yKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIjXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiI1wiKVsxXTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCI/XCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBhbmNob3IgPSB1cmxTdHJpbmc7XG4gICAgICAgIHJldHVybiBhbmNob3I7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQW5jaG9yUGFyYW1zKHVybFN0cmluZykge1xuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIjovL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIjovL1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZyh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCIjXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiI1wiKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiP1wiKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBhbmNob3JQYXJhbVN0cmluZyA9IHVybFN0cmluZztcbiAgICAgICAgY29uc3QgcGFyYW1NYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbnN0IHBhcmFtUGFpcnMgPSBhbmNob3JQYXJhbVN0cmluZy5zcGxpdChcIiZcIik7XG4gICAgICAgIHBhcmFtUGFpcnMuZm9yRWFjaCgocGFpcikgPT4ge1xuICAgICAgICAgICAgbGV0IGtleSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHBhaXIuaW5kZXhPZihcIj1cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGFpci5zcGxpdChcIj1cIilbMF07XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYWlyLnNwbGl0KFwiPVwiKVsxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGFpcjtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXkgPSBkZWNvZGVVUkkoa2V5KTtcbiAgICAgICAgICAgIHZhbHVlID0gZGVjb2RlVVJJKHZhbHVlKTtcbiAgICAgICAgICAgIHBhcmFtTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXJhbU1hcDtcbiAgICB9XG5cblxufSIsImltcG9ydCB7IENvbnRhaW5lclVybCB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IFVybFV0aWxzIH0gZnJvbSBcIi4uL3V0aWwvdXJsVXRpbHMuanNcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiSGlzdG9yeVwiKTtcblxuZXhwb3J0IGNsYXNzIEhpc3Rvcnkge1xuXG4gICAgc3RhdGljIHJlcGxhY2VVcmwodXJsLCB0aXRsZSwgc3RhdGVPYmplY3QpIHtcbiAgICAgICAgQ29udGFpbmVyVXJsLnJlcGxhY2VVcmwodXJsLnRvU3RyaW5nKCksIHRpdGxlLCBzdGF0ZU9iamVjdCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHB1c2hVcmwodXJsLCB0aXRsZSwgc3RhdGVPYmplY3QpIHtcbiAgICAgICAgQ29udGFpbmVyVXJsLnB1c2hVcmwodXJsLnRvU3RyaW5nKCksIHRpdGxlLCBzdGF0ZU9iamVjdCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGN1cnJlbnRVcmwoKSB7XG4gICAgICAgIHJldHVybiBVcmxVdGlscy5wYXJzZShDb250YWluZXJVcmwuY3VycmVudFVybCgpKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4vdXJsLmpzXCI7XG5pbXBvcnQgeyBVcmxVdGlscyB9IGZyb20gXCIuL3VybFV0aWxzLmpzXCI7XG5pbXBvcnQgeyBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBVcmxCdWlsZGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnByb3RvY29sID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8qKiBAdHlwZSB7TnVtYmVyfSAqL1xuICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxTdHJpbmc+fSAqL1xuICAgICAgICB0aGlzLnBhdGhBcnJheSA9IG5ldyBBcnJheSgpO1xuICAgICAgICBcbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBBcnJheTxTdHJpbmc+Pn0gKi9cbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYW5jaG9yID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIEFycmF5PFN0cmluZz4+fSAqL1xuICAgICAgICB0aGlzLmFuY2hvclBhcmFtZXRlck1hcCA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVcmxCdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgd2l0aEN1cnJlbnRVcmwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpdGhVcmwoQ29udGFpbmVyVXJsLmN1cnJlbnRVcmwoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICAgd2l0aFVybCh1cmwpIHtcbiAgICAgICAgdGhpcy53aXRoQWxsT2ZVcmwoVXJsVXRpbHMucGFyc2UodXJsKSlcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICAgd2l0aFJvb3RPZlVybCh1cmwpIHtcbiAgICAgICAgdGhpcy5wcm90b2NvbCA9IHVybC5wcm90b2NvbDtcbiAgICAgICAgdGhpcy5wb3J0ID0gdXJsLnBvcnQ7XG4gICAgICAgIHRoaXMuaG9zdCA9IHVybC5ob3N0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgICB3aXRoUGF0aE9mVXJsKHVybCkge1xuICAgICAgICB0aGlzLndpdGhSb290T2ZVcmwodXJsKTtcbiAgICAgICAgdGhpcy5wYXRoQXJyYXkgPSB1cmwucGF0aFZhbHVlQXJyYXk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aEFsbE9mVXJsKHVybCkge1xuICAgICAgICB0aGlzLndpdGhQYXRoT2ZVcmwodXJsKTtcbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9IHVybC5xdWVyeVBhcmFtTWFwO1xuICAgICAgICB0aGlzLmFuY2hvciA9IHVybC5hbmNob3I7XG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID0gdXJsLmFuY2hvclBhcmFtTWFwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvdG9jb2wgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFByb3RvY29sKHByb3RvY29sKSB7XG4gICAgICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBvcnQgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFBvcnQocG9ydCkge1xuICAgICAgICB0aGlzLnBvcnQgPSBwb3J0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaG9zdCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoSG9zdChob3N0KSB7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhQYXRoKHBhdGgpIHtcbiAgICAgICAgdGhpcy5wYXRoQXJyYXkgPSBVcmxVdGlscy5wYXJzZVBhdGhBcnJheShwYXRoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFuY2hvciBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoQW5jaG9yKGFuY2hvcikge1xuICAgICAgICAvLyBSZXNldCBhbmNob3IgcGFyYW1ldGVycyB3aGVuIHNldHRpbmcgYW5jaG9yIGRpcmVjdGx5XG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5hbmNob3IgPSBhbmNob3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdpdGhBbmNob3JQYXJhbVN0cmluZyhrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLmFuY2hvclBhcmFtZXRlck1hcCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmFuY2hvclBhcmFtZXRlck1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuY2hvclBhcmFtZXRlck1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhRdWVyeVBhcmFtU3RyaW5nKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMucXVlcnlQYXJhbWV0ZXJNYXAgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwLnNldChrZXksIFt2YWx1ZV0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IFxuICAgICAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gdmFsdWVBcnJheSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICB3aXRoUXVlcnlQYXJhbUFycmF5KGtleSwgdmFsdWVBcnJheSkge1xuICAgICAgICBpZiAodGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJNYXAuc2V0KGtleSwgdmFsdWVBcnJheSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlcGxhY2VQYXRoVmFsdWUoZnJvbSwgdG8pe1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgdGhpcy5wYXRoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMuY29udGFpbnMoZnJvbSwgdGhpcy5wYXRoQXJyYXlbaV0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXRoQXJyYXlbaV0gPSB0aGlzLnBhdGhBcnJheVtpXS5yZXBsYWNlKGZyb20sIHRvKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVXJsKHRoaXMucHJvdG9jb2wsIHRoaXMuaG9zdCwgdGhpcy5wb3J0LCB0aGlzLnBhdGhBcnJheSwgdGhpcy5xdWVyeVBhcmFtZXRlck1hcCwgdGhpcy5hbmNob3IsIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgSGlzdG9yeSB9IGZyb20gXCIuL2hpc3RvcnkuanNcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyVXJsIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgVXJsQnVpbGRlciB9IGZyb20gXCIuLi91dGlsL3VybEJ1aWxkZXIuanNcIjtcblxubGV0IG5hdmlnYXRvaW9uID0gbnVsbDtcblxuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb24ge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7TmF2aWdhdGlvbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgaW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICghbmF2aWdhdG9pb24pIHtcbiAgICAgICAgICAgIG5hdmlnYXRvaW9uID0gbmV3IE5hdmlnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmF2aWdhdG9pb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTmF2aWdhdGUgYnJvd3NlciB0byBuZXcgdXJsXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBnbyh1cmwpIHtcbiAgICAgICAgQ29udGFpbmVyVXJsLmdvKHVybC50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZSBicm93c2VyIGJhY2tcbiAgICAgKi9cbiAgICBiYWNrKCkge1xuICAgICAgICBDb250YWluZXJVcmwuYmFjaygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgcGF0aCB3aXRob3V0IHJlbmF2aWdhdGluZyBicm93c2VyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICAgKiBAcmV0dXJucyB7VXJsfVxuICAgICAqL1xuICAgIGxvYWRQYXRoKHBhdGgpIHtcbiAgICAgICAgY29uc3QgdXJsID0gSGlzdG9yeS5jdXJyZW50VXJsKCk7XG4gICAgICAgIGNvbnN0IG5ld1VybCA9IFVybEJ1aWxkZXIuY3JlYXRlKCkud2l0aFJvb3RPZlVybCh1cmwpLndpdGhQYXRoKHBhdGgpLmJ1aWxkKCk7XG4gICAgICAgIEhpc3RvcnkucHVzaFVybChuZXdVcmwpO1xuICAgICAgICByZXR1cm4gbmV3VXJsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgYW5jaG9yIHdpdGhvdXQgcmVuYXZpZ2F0aW5nIGJyb3dzZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYW5jaG9yXG4gICAgICogQHJldHVybnMge1VybH1cbiAgICAgKi9cbiAgICBsb2FkQW5jaG9yKGFuY2hvcikge1xuICAgICAgICBjb25zdCB1cmwgPSBIaXN0b3J5LmN1cnJlbnRVcmwoKTtcbiAgICAgICAgY29uc3QgbmV3VXJsID0gVXJsQnVpbGRlci5jcmVhdGUoKS53aXRoUm9vdE9mVXJsKHVybCkud2l0aEFuY2hvcihhbmNob3IpLmJ1aWxkKCk7XG4gICAgICAgIEhpc3RvcnkucHVzaFVybChuZXdVcmwpO1xuICAgICAgICByZXR1cm4gbmV3VXJsO1xuICAgIH1cblxufSIsImV4cG9ydCBjbGFzcyBUcmFpbE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICAgICAgICB0aGlzLnJvb3QgPSBmYWxzZTtcblxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy50cmFpbCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtwcm9wZXJ0eX0gKi9cbiAgICAgICAgdGhpcy5wcm9wZXJ0eSA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy53YXlwb2ludCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxUcmFpbE5vZGU+fSAqL1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIH1cblxufSIsImltcG9ydCB7IE1vZHVsZVJ1bm5lciB9IGZyb20gXCIuL21vZHVsZVJ1bm5lci5qc1wiO1xuaW1wb3J0IHsgTmF2aWdhdGlvbiB9IGZyb20gXCIuL25hdmlnYXRpb24vbmF2aWdhdGlvbi5qc1wiO1xuaW1wb3J0IHsgVHJhaWxOb2RlIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi90cmFpbE5vZGUuanNcIjtcblxubGV0IGFjdGl2ZU1vZHVsZVJ1bm5lciA9IG51bGw7XG5cbmV4cG9ydCBjbGFzcyBBY3RpdmVNb2R1bGVSdW5uZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNb2R1bGVSdW5uZXJ9ICovXG4gICAgICAgIHRoaXMubW9kdWxlUnVubmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7QWN0aXZlTW9kdWxlUnVubmVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBpbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVNb2R1bGVSdW5uZXIpIHtcbiAgICAgICAgICAgIGFjdGl2ZU1vZHVsZVJ1bm5lciA9IG5ldyBBY3RpdmVNb2R1bGVSdW5uZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aXZlTW9kdWxlUnVubmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TW9kdWxlUnVubmVyfSBuZXdNb2R1bGVSdW5uZXIgXG4gICAgICovXG4gICAgc2V0KG5ld01vZHVsZVJ1bm5lcikge1xuICAgICAgICB0aGlzLm1vZHVsZVJ1bm5lciA9IG5ld01vZHVsZVJ1bm5lcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGFuY2hvciB3aXRob3V0IHJlbmF2aWdhdGluZyBicm93c2VyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRyYWlsIFxuICAgICAqL1xuICAgICBhc3luYyBsb2FkKHRyYWlsKSB7XG4gICAgICAgIGNvbnN0IHVybCA9IE5hdmlnYXRpb24uaW5zdGFuY2UoKS5sb2FkQW5jaG9yKHRyYWlsKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubW9kdWxlUnVubmVyLnJ1bk1vZHVsZSh1cmwpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb250YWluZXJIdHRwQ2xpZW50LCBDb250YWluZXJIdHRwUmVzcG9uc2UsIENvbnRhaW5lclVwbG9hZERhdGEgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIENsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fFByb21pc2U8Q29udGFpbmVyRG93bmxvYWQ+fVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQodXJsLCBhdXRob3JpemF0aW9uID0gbnVsbCwgdGltZW91dCA9IDEwMDAsIGRvd25sb2FkID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IENsaWVudC5nZXRIZWFkZXIoYXV0aG9yaXphdGlvbik7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJywgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICB9XG4gICAgICAgIGlmIChkb3dubG9hZCkge1xuICAgICAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZG93bmxvYWQodXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZmV0Y2godXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBkYXRhXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gcHJvZ3JlY0NhbGxiYWNrTWV0aG9kXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fVxuICAgICAqL1xuICAgIHN0YXRpYyBwb3N0KHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiA9IG51bGwsIHByb2dyZWNDYWxsYmFja01ldGhvZCA9IG51bGwsIHRpbWVvdXQgPSAxMDAwKXtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBDb250YWluZXJVcGxvYWREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC51cGxvYWQoXCJQT1NUXCIsIHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJzID0gQ2xpZW50LmdldEhlYWRlcihhdXRob3JpemF0aW9uKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gIHtcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLCAvLyBtdXN0IG1hdGNoICdDb250ZW50LVR5cGUnIGhlYWRlclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBtb2RlOiBcImNvcnNcIiwgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIiwgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gZGF0YVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtNZXRob2R9IHByb2dyZWNDYWxsYmFja01ldGhvZFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0XG4gICAgICogQHJldHVybnMge1Byb21pc2U8Q29udGFpbmVySHR0cFJlc3BvbnNlPn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcHV0KHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiA9IG51bGwsIHByb2dyZWNDYWxsYmFja01ldGhvZCA9IG51bGwsIHRpbWVvdXQgPSAxMDAwKXtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBDb250YWluZXJVcGxvYWREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC51cGxvYWQoXCJQVVRcIiwgdXJsLCBkYXRhLCBhdXRob3JpemF0aW9uLCBwcm9ncmVjQ2FsbGJhY2tNZXRob2QsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBDbGllbnQuZ2V0SGVhZGVyKGF1dGhvcml6YXRpb24pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksIC8vIG11c3QgbWF0Y2ggJ0NvbnRlbnQtVHlwZScgaGVhZGVyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLCBcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJywgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsIC8vIG1hbnVhbCwgKmZvbGxvdywgZXJyb3JcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC5mZXRjaCh1cmwudG9TdHJpbmcoKSwgcGFyYW1zLCB0aW1lb3V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fENvbnRhaW5lclVwbG9hZERhdGF9IGRhdGFcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBwcm9ncmVjQ2FsbGJhY2tNZXRob2RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENvbnRhaW5lckh0dHBSZXNwb25zZT59XG4gICAgICovXG4gICAgc3RhdGljIHBhdGNoKHVybCwgZGF0YSwgYXV0aG9yaXphdGlvbiA9IG51bGwsIHByb2dyZWNDYWxsYmFja01ldGhvZCA9IG51bGwsIHRpbWVvdXQgPSAxMDAwKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBDbGllbnQuZ2V0SGVhZGVyKGF1dGhvcml6YXRpb24pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksIC8vIG11c3QgbWF0Y2ggJ0NvbnRlbnQtVHlwZScgaGVhZGVyXG4gICAgICAgICAgICBtZXRob2Q6ICdQQVRDSCcsIFxuICAgICAgICAgICAgbW9kZTogJ2NvcnMnLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JywgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBkYXRhXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gcHJvZ3JlY0NhbGxiYWNrTWV0aG9kXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fVxuICAgICAqL1xuICAgIHN0YXRpYyBkZWxldGUodXJsLCBkYXRhLCBhdXRob3JpemF0aW9uID0gbnVsbCwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kID0gbnVsbCwgdGltZW91dCA9IDEwMDApIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IENsaWVudC5nZXRIZWFkZXIoYXV0aG9yaXphdGlvbik7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLCAvLyBtdXN0IG1hdGNoICdDb250ZW50LVR5cGUnIGhlYWRlclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NvcnMnLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsIC8vIG1hbnVhbCwgKmZvbGxvdywgZXJyb3JcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC5mZXRjaCh1cmwudG9TdHJpbmcoKSwgcGFyYW1zLCB0aW1lb3V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBtb2RlOiAnY29ycycsIC8vIG5vLWNvcnMsIGNvcnMsICpzYW1lLW9yaWdpblxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JywgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldEhlYWRlcihhdXRob3JpemF0aW9uID0gbnVsbCkge1xuICAgICAgICBpZiAoYXV0aG9yaXphdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcInVzZXItYWdlbnRcIjogXCJNb3ppbGxhLzQuMCBNRE4gRXhhbXBsZVwiLFxuICAgICAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBhdXRob3JpemF0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidXNlci1hZ2VudFwiOiBcIk1vemlsbGEvNC4wIE1ETiBFeGFtcGxlXCIsXG4gICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICB9O1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU3R5bGVzaGVldCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3R5bGVzU291cmNlIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0eWxlc1NvdXJjZSl7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzU291cmNlID0gc3R5bGVzU291cmNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0U3R5bGVzU291cmNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnN0eWxlc1NvdXJjZTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgTG9nZ2VyLCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENsaWVudCB9IGZyb20gXCIuLi9jbGllbnQvY2xpZW50LmpzXCI7XG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi4vdXRpbC91cmwuanNcIjtcbmltcG9ydCB7IFVybFV0aWxzIH0gZnJvbSBcIi4uL3V0aWwvdXJsVXRpbHMuanNcIjtcbmltcG9ydCB7IFN0eWxlc2hlZXQgfSBmcm9tIFwiLi9zdHlsZXNoZWV0LmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJTdHlsZXNSZWdpc3RyeVwiKTtcblxuZXhwb3J0IGNsYXNzIFN0eWxlc1JlZ2lzdHJ5IHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIC8qKiBAdHlwZSB7TWFwfSAqL1xuICAgICAgICB0aGlzLnN0eWxlc01hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcH0gKi9cbiAgICAgICAgdGhpcy5zdHlsZXNVcmxNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtpbnRlZ2VyfSAqL1xuICAgICAgICB0aGlzLnN0eWxlc1F1ZXVlU2l6ZSA9IDA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNZXRob2R9ICovXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqIEBwYXJhbSB7U3R5bGVzfSBzdHlsZXMgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBzZXQobmFtZSwgc3R5bGVzLCB1cmwpe1xuICAgICAgICBpZih1cmwgIT09IHVuZGVmaW5lZCAmJiB1cmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzVXJsTWFwLnNldChuYW1lLCB1cmwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3R5bGVzTWFwLnNldChuYW1lLCBzdHlsZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGdldChuYW1lKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3R5bGVzTWFwLmdldChuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKi9cbiAgICBjb250YWlucyhuYW1lKXtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzTWFwLmdldChuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBjYWxsYmFjayBcbiAgICAgKi9cbiAgICBkb25lKGNhbGxiYWNrKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmRvQ2FsbGJhY2sodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHlsZXNSZWdpc3RyeX0gcmVnaXN0cnkgXG4gICAgICovXG4gICAgZG9DYWxsYmFjayhyZWdpc3RyeSl7XG4gICAgICAgIGlmKHJlZ2lzdHJ5LmNhbGxiYWNrICE9PSBudWxsICYmIHJlZ2lzdHJ5LmNhbGxiYWNrICE9PSB1bmRlZmluZWQgICYmIHJlZ2lzdHJ5LnN0eWxlc1F1ZXVlU2l6ZSA9PT0gcmVnaXN0cnkuc3R5bGVzTWFwLmVudHJpZXMubGVuZ3RoKXtcbiAgICAgICAgICAgIHZhciB0ZW1wQ2FsbGJhY2sgPSByZWdpc3RyeS5jYWxsYmFjaztcbiAgICAgICAgICAgIHJlZ2lzdHJ5LmNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgIHRlbXBDYWxsYmFjay5jYWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgICBhc3luYyBsb2FkKG5hbWUsIHVybCkge1xuICAgICAgICB0aGlzLnN0eWxlc1F1ZXVlU2l6ZSArKztcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQuZ2V0KHVybCk7XG4gICAgICAgIGlmKCFyZXNwb25zZS5vayl7XG4gICAgICAgICAgICB0aHJvdyBcIlVuYWJsZSB0byBsb2FkIHN0eWxlcyBmb3IgXCIgKyBuYW1lICsgXCIgYXQgXCIgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSwgbmV3IFN0eWxlc2hlZXQodGV4dCksIHVybCk7XG4gICAgICAgIHRoaXMuZG9DYWxsYmFjayh0aGlzKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNYXA8c3RyaW5nLCBzdHJpbmc+fSBuYW1lVXJsTWFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFzeW5jIGdldFN0eWxlc0xvYWRlZFByb21pc2UobmFtZVVybE1hcCkge1xuICAgICAgICBcbiAgICAgICAgaWYoIW5hbWVVcmxNYXAgfHwgbmFtZVVybE1hcC5zaXplID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsb2FkUHJvbWlzZXMgPSBbXTtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcztcbiAgICAgICAgbmFtZVVybE1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAocGFyZW50LmNvbnRhaW5zKGtleSkpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsb2FkUHJvbWlzZXMucHVzaChwYXJlbnQucHJpdmF0ZUxvYWQoa2V5LCBVcmxVdGlscy5wYXJzZSh2YWx1ZSkpKTtcbiAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGxvYWRQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBhc3luYyBwcml2YXRlTG9hZChuYW1lLCB1cmwpIHtcbiAgICAgICAgTE9HLmluZm8oXCJMb2FkaW5nIHN0eWxlcyBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybC50b1N0cmluZygpKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5nZXQodXJsKTtcbiAgICAgICAgaWYoIXJlc3BvbnNlLm9rKXtcbiAgICAgICAgICAgIHRocm93IFwiVW5hYmxlIHRvIGxvYWQgc3R5bGVzIGZvciBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBuZXcgU3R5bGVzaGVldCh0ZXh0KTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSwgc3R5bGVzLCB1cmwpO1xuICAgICAgICByZXR1cm4gc3R5bGVzO1xuICAgIH1cbn0iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZXtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wbGF0ZVNvdXJjZSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVNvdXJjZSl7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVTb3VyY2UgPSB0ZW1wbGF0ZVNvdXJjZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRlbXBsYXRlU291cmNlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlU291cmNlO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBMb2dnZXIsIE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tIFwiLi90ZW1wbGF0ZS5qc1wiO1xuaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSBcIi4uL2NsaWVudC9jbGllbnQuanNcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgVXJsVXRpbHMgfSBmcm9tIFwiLi4vdXRpbC91cmxVdGlscy5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiVGVtcGxhdGVSZWdpc3RyeVwiKTtcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVnaXN0cnkge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVVcmxNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtpbnRlZ2VyfSAqL1xuICAgICAgICB0aGlzLnRlbXBsYXRlUXVldWVTaXplID0gMDtcblxuICAgICAgICAvKiogQHR5cGUge01ldGhvZH0gKi9cbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMubGFuZ3VhZ2VQcmVmaXggPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZVByZWZpeCBcbiAgICAgKi9cbiAgICBzZXRMYW5ndWFnZVByZWZpeChsYW5ndWFnZVByZWZpeCkge1xuICAgICAgICB0aGlzLmxhbmd1YWdlUHJlZml4ID0gbGFuZ3VhZ2VQcmVmaXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtUZW1wbGF0ZX0gdGVtcGxhdGUgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBzZXQobmFtZSx0ZW1wbGF0ZSx1cmwpe1xuICAgICAgICBpZih1cmwgIT09IHVuZGVmaW5lZCAmJiB1cmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVVcmxNYXAuc2V0KG5hbWUsIHVybCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZW1wbGF0ZU1hcC5zZXQobmFtZSwgdGVtcGxhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGdldChuYW1lKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVNYXAuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGNvbnRhaW5zKG5hbWUpe1xuICAgICAgICBpZiAodGhpcy50ZW1wbGF0ZU1hcC5nZXQobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gY2FsbGJhY2sgXG4gICAgICovXG4gICAgZG9uZShjYWxsYmFjayl7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kb0NhbGxiYWNrKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VGVtcGxhdGVSZWdpc3RyeX0gcmVnaXN0cnkgXG4gICAgICovXG4gICAgZG9DYWxsYmFjayhyZWdpc3RyeSl7XG4gICAgICAgIGlmKHRtby5jYWxsYmFjayAhPT0gbnVsbCAmJiByZWdpc3RyeS5jYWxsYmFjayAhPT0gdW5kZWZpbmVkICAmJiByZWdpc3RyeS50ZW1wbGF0ZVF1ZXVlU2l6ZSA9PT0gcmVnaXN0cnkudGVtcGxhdGVNYXAuc2l6ZSgpKXtcbiAgICAgICAgICAgIHZhciB0ZW1wQ2FsbGJhY2sgPSByZWdpc3RyeS5jYWxsYmFjaztcbiAgICAgICAgICAgIHJlZ2lzdHJ5LmNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgIHRlbXBDYWxsYmFjay5jYWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIGFzeW5jIGxvYWQobmFtZSwgdXJsKSB7XG4gICAgICAgIGlmKHRoaXMubGFuZ3VhZ2VQcmVmaXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHVybC5wYXRoc0xpc3Quc2V0TGFzdChcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmd1YWdlUHJlZml4ICsgXCIuXCIgK1xuICAgICAgICAgICAgICAgIHVybC5wYXRoc0xpc3QuZ2V0TGFzdCgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGVtcGxhdGVRdWV1ZVNpemUgKys7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LmdldCh1cmwpO1xuICAgICAgICBpZighcmVzcG9uc2Uub2spe1xuICAgICAgICAgICAgdGhyb3cgXCJVbmFibGUgdG8gbG9hZCB0ZW1wbGF0ZSBmb3IgXCIgKyBuYW1lICsgXCIgYXQgXCIgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSxuZXcgVGVtcGxhdGUodGV4dCksdXJsKTtcbiAgICAgICAgdGhpcy5kb0NhbGxiYWNrKHRoaXMpO1xuICAgIH1cblxuICAgIGFzeW5jIGdldFRlbXBsYXRlc0xvYWRlZFByb21pc2UobmFtZVVybE1hcCkge1xuICAgICAgICBcbiAgICAgICAgaWYoIW5hbWVVcmxNYXAgfHwgbmFtZVVybE1hcC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxvYWRQcm9taXNlcyA9IFtdO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzO1xuICAgICAgICBuYW1lVXJsTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQuY29udGFpbnMoa2V5KSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsb2FkUHJvbWlzZXMucHVzaChwYXJlbnQucHJpdmF0ZUxvYWQoa2V5LCBVcmxVdGlscy5wYXJzZSh2YWx1ZSkpKTtcbiAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGxvYWRQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKi9cbiAgICBhc3luYyBwcml2YXRlTG9hZChuYW1lLCB1cmwpIHtcbiAgICAgICAgaWYgKHRoaXMubGFuZ3VhZ2VQcmVmaXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHVybC5wYXRoc0xpc3Quc2V0TGFzdChcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmd1YWdlUHJlZml4ICsgXCIuXCIgK1xuICAgICAgICAgICAgICAgIHVybC5wYXRoc0xpc3QuZ2V0TGFzdCgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIExPRy5pbmZvKFwiTG9hZGluZyB0ZW1wbGF0ZSBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybC50b1N0cmluZygpKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQuZ2V0KHVybCk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spe1xuICAgICAgICAgICAgdGhyb3cgXCJVbmFibGUgdG8gbG9hZCB0ZW1wbGF0ZSBmb3IgXCIgKyBuYW1lICsgXCIgYXQgXCIgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUodGV4dCk7XG4gICAgICAgIHRoaXMuc2V0KG5hbWUsIHRlbXBsYXRlLCB1cmwpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufSIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gXCIuL3RlbXBsYXRlUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFR5cGVDb25maWcgfSBmcm9tIFwibWluZGlfdjFcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIlRlbXBsYXRlUG9zdENvbmZpZ1wiKTtcblxuLyoqXG4gKiBUbyBiZSBhZGRlZCB0byBtaW5kaSBhcyBhIHNpbmdsZXRvbi4gV2lsbCBzY2FuIHRocm91Z2ggYWxsIGNvbmZpZ3VyZWQgY2xhc3NlcyB0aGF0IGhhdmUgYSBURU1QTEFURV9VUkxcbiAqIHN0YXRpYyBnZXR0ZXIgYW5kIHdpbGwgYXN5bmNyb25vdXNseSBsb2FkIHRoZW0uIFJldHVybnMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gYWxsIHRlbXBsYXRlcyBhcmUgbG9hZGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZXNMb2FkZXIge1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1RlbXBsYXRlUmVnaXN0cnl9IHRlbXBsYXRlUmVnaXN0cnkgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodGVtcGxhdGVSZWdpc3RyeSkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VGVtcGxhdGVSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5ID0gdGVtcGxhdGVSZWdpc3RyeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsVHlwZUNvbmZpZz59IGNvbmZpZ0VudHJpZXNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBsb2FkKGNvbmZpZ0VudHJpZXMpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBjb25maWdFbnRyaWVzLmZvckVhY2goKGNvbmZpZ0VudHJ5LCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5URU1QTEFURV9VUkwpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU1hcC5zZXQoY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UubmFtZSwgY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UuVEVNUExBVEVfVVJMKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7IFxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5LmdldFRlbXBsYXRlc0xvYWRlZFByb21pc2UodGVtcGxhdGVNYXApO1xuICAgIH1cblxufSIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi9zdHlsZXNSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgVHlwZUNvbmZpZyB9IGZyb20gXCJtaW5kaV92MVwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiU3R5bGVzTG9hZGVyXCIpO1xuXG4vKipcbiAqIFRvIGJlIGFkZGVkIHRvIG1pbmRpIGFzIGEgc2luZ2xldG9uLiBXaWxsIHNjYW4gdGhyb3VnaCBhbGwgY29uZmlndXJlZCBjbGFzc2VzIHRoYXQgaGF2ZSBhIFNUWUxFU19VUkxcbiAqIHN0YXRpYyBnZXR0ZXIgYW5kIHdpbGwgYXN5bmNyb25vdXNseSBsb2FkIHRoZW0uIFJldHVybnMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gYWxsIHN0eWxlcyBhcmUgbG9hZGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHlsZXNMb2FkZXIge1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0eWxlc1JlZ2lzdHJ5fSBzdHlsZXNSZWdpc3RyeSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdHlsZXNSZWdpc3RyeSkge1xuICAgICAgICB0aGlzLnN0eWxlc1JlZ2lzdHJ5ID0gc3R5bGVzUmVnaXN0cnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNYXA8U3RyaW5nLCBUeXBlQ29uZmlnPn0gY29uZmlnRW50cmllc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGxvYWQoY29uZmlnRW50cmllcykge1xuICAgICAgICBjb25zdCBzdHlsZXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbmZpZ0VudHJpZXMuZm9yRWFjaCgoY29uZmlnRW50cnksIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYoY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UuU1RZTEVTX1VSTCkge1xuICAgICAgICAgICAgICAgIHN0eWxlc01hcC5zZXQoY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UubmFtZSwgY29uZmlnRW50cnkuY2xhc3NSZWZlcmVuY2UuU1RZTEVTX1VSTCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7IFxuICAgICAgICByZXR1cm4gdGhpcy5zdHlsZXNSZWdpc3RyeS5nZXRTdHlsZXNMb2FkZWRQcm9taXNlKHN0eWxlc01hcCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb25maWcsIEluamVjdGlvblBvaW50LCBUeXBlQ29uZmlnIH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBTdHlsZXNSZWdpc3RyeSB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFRlbXBsYXRlUmVnaXN0cnkgfSBmcm9tIFwiLi4vdGVtcGxhdGUvdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVzTG9hZGVyIH0gZnJvbSBcIi4uL3RlbXBsYXRlL3RlbXBsYXRlc0xvYWRlci5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzTG9hZGVyIH0gZnJvbSBcIi4uL3N0eWxlcy9zdHlsZXNMb2FkZXIuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkNvbXBvbmVudENvbmZpZ1Byb2Nlc3NvclwiKVxuXG4vKipcbiAqIE1pbmRpIGNvbmZpZyBwcm9jZXNzb3Igd2hpY2ggbG9hZHMgYWxsIHRlbXBsYXRlcyBhbmQgc3R5bGVzIGZvciBhbGwgY29uZmlndXJlZCBjb21wb25lbnRzXG4gKiBhbmQgdGhlbiBjYWxscyBhbnkgZXhpc3RpbmcgY29tcG9uZW50TG9hZGVkIGZ1bmN0aW9uIG9uIGVhY2ggY29tcG9uZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRDb25maWdQcm9jZXNzb3Ige1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtUZW1wbGF0ZVJlZ2lzdHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVJlZ2lzdHJ5ID0gSW5qZWN0aW9uUG9pbnQuaW5zdGFuY2UoVGVtcGxhdGVSZWdpc3RyeSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTdHlsZXNSZWdpc3RyeX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShTdHlsZXNSZWdpc3RyeSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBwb3N0Q29uZmlnKCl7XG4gICAgICAgIHRoaXMudGVtcGxhdGVzTG9hZGVyID0gbmV3IFRlbXBsYXRlc0xvYWRlcih0aGlzLnRlbXBsYXRlUmVnaXN0cnkpO1xuICAgICAgICB0aGlzLnN0eWxlc0xvYWRlciA9IG5ldyBTdHlsZXNMb2FkZXIodGhpcy5zdHlsZXNSZWdpc3RyeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtDb25maWd9IGNvbmZpZ1xuICAgICAqIEBwYXJhbSB7TWFwPHN0cmluZywgVHlwZUNvbmZpZz59IHVuY29uZmlndXJlZENvbmZpZ0VudHJpZXNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBwcm9jZXNzQ29uZmlnKGNvbmZpZywgdW5jb25maWd1cmVkQ29uZmlnRW50cmllcykge1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIFsgXG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZXNMb2FkZXIubG9hZCh1bmNvbmZpZ3VyZWRDb25maWdFbnRyaWVzKSwgXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZXNMb2FkZXIubG9hZCh1bmNvbmZpZ3VyZWRDb25maWdFbnRyaWVzKSBcbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIlxuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiTG9hZGVySW50ZXJjZXB0b3JcIik7XG5cbmV4cG9ydCBjbGFzcyBMb2FkZXJJbnRlcmNlcHRvciB7XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBwcm9jZXNzKCkge1xuICAgICAgICBMT0cuaW5mbyhcIlVuaW1wbGVtZW50ZWQgTG9hZGVyIEludGVyY2VwdG9yIGJyZWFrcyBieSBkZWZhdWx0XCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiXG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi4vdXRpbC91cmwuanNcIjtcbmltcG9ydCB7IExvYWRlckludGVyY2VwdG9yIH0gZnJvbSBcIi4vbG9hZGVySW50ZXJjZXB0b3IuanNcIlxuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiTW9kdWxlTG9hZGVyXCIpO1xuXG5leHBvcnQgY2xhc3MgTW9kdWxlTG9hZGVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtb2R1bGVQYXRoIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0cmFpbFN0YXJ0IFxuICAgICAqIEBwYXJhbSB7QXJyYXk8TG9hZGVySW50ZXJjZXB0b3I+fSBsb2FkZXJJbnRlcmNlcHRvcnNcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVQYXRoLCB0cmFpbFN0YXJ0LCBsb2FkZXJJbnRlcmNlcHRvcnMgPSBbXSkge1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubW9kdWxlUGF0aCA9IG1vZHVsZVBhdGg7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRyYWlsU3RhcnQgPSB0cmFpbFN0YXJ0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXk8TG9hZGVySW50ZXJjZXB0b3I+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2FkZXJJbnRlcmNlcHRvcnMgPSBsb2FkZXJJbnRlcmNlcHRvcnM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIGlmIHRoZSBjb25maWd1cmVkIG1hdGNoVXJsIHN0YXJ0cyB3aXRoIHRoZSBwcm92aWRlZCB1cmwgb3JcbiAgICAgKiBpZiB0aGUgY29uZmlndXJlZCBtYXRjaFVybCBpcyBudWxsXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBtYXRjaGVzKHVybCl7XG4gICAgICAgIC8vIE5vIHRyYWlsU3RhcnQgbWVhbnMgZGVmYXVsdCBtYXRjaFxuICAgICAgICBpZiAoIXRoaXMudHJhaWxTdGFydCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyB1cmwgYW5kIG5vbiBudWxsIHRyYWlsU3RhcnQsIG1lYW5zIG5vIG1hdGNoXG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICBMT0cuZXJyb3IoXCJVcmwgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIGFuY2hvciBtYXRjaCBvbmx5IGlmIHRyYWlsU3RhcnQgaXMgXCIvXCJcbiAgICAgICAgaWYgKCF1cmwuYW5jaG9yKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMuZXF1YWxzKHRoaXMudHJhaWxTdGFydCwgXCIvXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeGFjdCBtYXRjaCBmb3Igcm9vdCB0cmFpbFN0YXJ0XG4gICAgICAgIGlmIChTdHJpbmdVdGlscy5lcXVhbHModGhpcy50cmFpbFN0YXJ0LCBcIi9cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5lcXVhbHModXJsLmFuY2hvciwgdGhpcy50cmFpbFN0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5zdGFydHNXaXRoKHVybC5hbmNob3IsIHRoaXMudHJhaWxTdGFydCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1Byb21pc2U8TWFpbj59XG4gICAgICovXG4gICAgYXN5bmMgbG9hZCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGF3YWl0IHRoaXMuaW1wb3J0TW9kdWxlKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmludGVyY2VwdG9yc1Bhc3MoKTtcbiAgICAgICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICBMT0cud2FybihcIkZpbHRlciByZWplY3RlZCBcIiArIHJlYXNvbik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGludGVyY2VwdG9yc1Bhc3MoKSB7XG4gICAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IHRoaXMubG9hZGVySW50ZXJjZXB0b3JzO1xuICAgICAgICBpZiAoaW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW50ZXJjZXB0b3JQcm9taXNlQ2hhaW4gPSBpbnRlcmNlcHRvcnNbMF0ucHJvY2VzcygpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBpbnRlcmNlcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbnRlcmNlcHRvclByb21pc2VDaGFpbiA9IGludGVyY2VwdG9yUHJvbWlzZUNoYWluLnRoZW4oaW50ZXJjZXB0b3JzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnRlcmNlcHRvclByb21pc2VDaGFpbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW1wb3J0TW9kdWxlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgaW1wb3J0KHRoaXMubW9kdWxlUGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IG1vZHVsZS5kZWZhdWx0KCk7XG4gICAgICAgIH0gY2F0Y2gocmVhc29uKSAge1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVHJhaWxOb2RlIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi90cmFpbE5vZGVcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5cbmV4cG9ydCBjbGFzcyBNb2R1bGUge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtVcmx9ICovXG4gICAgICAgIHRoaXMudXJsID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1RyYWlsTm9kZX0gKi9cbiAgICAgICAgdGhpcy50cmFpbE1hcCA9IG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgbG9hZCgpIHtcbiAgICAgICAgdGhyb3cgXCJNb2R1bGUgY2xhc3MgbXVzdCBpbXBsZW1lbnQgbG9hZCgpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQXJyYXlVdGlscywgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCJcbmltcG9ydCB7IE1pbmRpQ29uZmlnLCBNaW5kaUluamVjdG9yIH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBNb2R1bGVMb2FkZXIgfSBmcm9tIFwiLi9tb2R1bGVMb2FkZXIuanNcIjtcbmltcG9ydCB7IExvYWRlckludGVyY2VwdG9yIH0gZnJvbSBcIi4vbG9hZGVySW50ZXJjZXB0b3IuanNcIlxuaW1wb3J0IHsgTW9kdWxlIH0gZnJvbSBcIi4uL21vZHVsZS5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiRGlNb2R1bGVMb2FkZXJcIik7XG5cbmV4cG9ydCBjbGFzcyBEaU1vZHVsZUxvYWRlciBleHRlbmRzIE1vZHVsZUxvYWRlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbW9kdWxlUGF0aCBcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdHJhaWxNYXAgXG4gICAgICogQHBhcmFtIHtNaW5kaUNvbmZpZ30gY29uZmlnXG4gICAgICogQHBhcmFtIHtBcnJheTxMb2FkZXJJbnRlcmNlcHRvcj59IGxvYWRlckludGVyY2VwdG9yc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1vZHVsZVBhdGgsIHRyYWlsTWFwLCBjb25maWcsIGxvYWRlckludGVyY2VwdG9ycyA9IFtdKSB7XG4gICAgICAgIHN1cGVyKG1vZHVsZVBhdGgsIHRyYWlsTWFwLCBsb2FkZXJJbnRlcmNlcHRvcnMpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWluZGlDb25maWd9ICovXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPE1vZHVsZT59XG4gICAgICovXG4gICAgYXN5bmMgbG9hZCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGF3YWl0IHRoaXMuaW1wb3J0TW9kdWxlKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmludGVyY2VwdG9yc1Bhc3MoKTtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBNaW5kaUluamVjdG9yLmluamVjdChtb2R1bGUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgIExPRy53YXJuKFwiTW9kdWxlIGxvYWRlciBmYWlsZWQgXCIgKyByZWFzb24pO1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01vZHVsZUxvYWRlcn0gbW9kdWxlTG9hZGVyXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYXN5bmMgaW1wb3J0TW9kdWxlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgc3VwZXIuaW1wb3J0TW9kdWxlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5hZGRBbGxUeXBlQ29uZmlnKG1vZHVsZS50eXBlQ29uZmlnQXJyYXkpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb25maWcuZmluYWxpemUoKTtcbiAgICAgICAgICAgIGNvbnN0IHdvcmtpbmdDb25maWcgPSB0aGlzLmNvbmZpZztcbiAgICAgICAgICAgIGF3YWl0IEFycmF5VXRpbHMucHJvbWlzZUNoYWluKHRoaXMubG9hZGVySW50ZXJjZXB0b3JzLCAobG9hZGVySW50ZXJjZXB0b3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWluZGlJbmplY3Rvci5pbmplY3QobG9hZGVySW50ZXJjZXB0b3IsIHdvcmtpbmdDb25maWcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuLyoqXG4gKiBTdGF0ZU1hbmFnZXJcbiAqIFxuICogQHRlbXBsYXRlIFQsIFQyXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hbmFnZXIge1xuXG4gICAgc3RhdGljIE5FVyA9IFwiX19ORVdfX1wiO1xuICAgIHN0YXRpYyBVUERBVEUgPSBcIl9fVVBEQVRFX19cIjtcbiAgICBzdGF0aWMgREVMRVRFID0gXCJfX0RFTEVURV9fXCI7XG5cbiAgICBzdGF0aWMgQU5ZID0gXCJfX0FOWV9fXCI7XG4gICAgc3RhdGljIERFRkFVTFQgPSBcIl9fREVGQVVMVF9fXCI7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBUPn0gKi9cbiAgICAgICAgdGhpcy5kb21haW5NYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBUMj59ICovXG4gICAgICAgIHRoaXMuZXJyb3JNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBBcnJheTxNZXRob2Q+fSAqL1xuICAgICAgICB0aGlzLmRvbWFpbkxpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIEFycmF5PE1ldGhvZD59ICovXG4gICAgICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtNZXRob2R9IGRvbWFpbkxpc3RlbmVyXG4gICAgICogQHBhcmFtIHtNZXRob2R9IGVycm9yTGlzdGVuZXJcbiAgICAgKi9cbiAgICByZWFjdChkb21haW5MaXN0ZW5lciwgZXJyb3JMaXN0ZW5lciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRvbWFpbkxpc3RlbmVycy5oYXMoU3RhdGVNYW5hZ2VyLkFOWSkpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLnNldChTdGF0ZU1hbmFnZXIuQU5ZLCBuZXcgQXJyYXkoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb21haW5MaXN0ZW5lcnMuZ2V0KFN0YXRlTWFuYWdlci5BTlkpLnB1c2goZG9tYWluTGlzdGVuZXIpO1xuXG4gICAgICAgIGlmIChlcnJvckxpc3RlbmVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5lcnJvckxpc3RlbmVycy5oYXMoU3RhdGVNYW5hZ2VyLkFOWSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLnNldChTdGF0ZU1hbmFnZXIuQU5ZLCBuZXcgQXJyYXkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLmdldChTdGF0ZU1hbmFnZXIuQU5ZKS5wdXNoKGVycm9yTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBcbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gbGlzdGVuZXIgXG4gICAgICovXG4gICAgcmVhY3RUbyhrZXksIGRvbWFpbkxpc3RlbmVyLCBlcnJvckxpc3RlbmVyID0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuZG9tYWluTGlzdGVuZXJzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLmRvbWFpbkxpc3RlbmVycy5zZXQoa2V5LCBuZXcgQXJyYXkoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb21haW5MaXN0ZW5lcnMuZ2V0KGtleSkucHVzaChkb21haW5MaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKGVycm9yTGlzdGVuZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmVycm9yTGlzdGVuZXJzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycy5zZXQoa2V5LCBuZXcgQXJyYXkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLmdldChrZXkpLnB1c2goZXJyb3JMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgb2JqZWN0QXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZG9tYWluTWFwLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1Byb21pc2U8VD59IG9iamVjdFxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZShvYmplY3RQcm9taXNlLCBrZXkgPSBTdGF0ZU1hbmFnZXIuREVGQVVMVCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0ID0gYXdhaXQgb2JqZWN0UHJvbWlzZTtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZURvbWFpbihvYmplY3QsIGtleSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZUVycm9yKGVycm9yLCBrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlRXJyb3IoZXJyb3IsIGtleSA9IFN0YXRlTWFuYWdlci5ERUZBVUxUKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVycm9yTWFwLnNldChrZXksIGVycm9yKTtcbiAgICAgICAgdGhpcy5zaWduYWxFcnJvckNoYW5nZShlcnJvciwga2V5KTtcbiAgICB9XG5cbiAgICBhc3luYyB1cGRhdGVEb21haW4ob2JqZWN0LCBrZXkgPSBTdGF0ZU1hbmFnZXIuREVGQVVMVCkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9iamVjdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG9iamVjdFtpXSA9IHRoaXMuY3JlYXRlUHJveHkob2JqZWN0W2ldLCBrZXksIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9iamVjdCA9IHRoaXMuY3JlYXRlUHJveHkob2JqZWN0LCBrZXksIHRoaXMpO1xuXG4gICAgICAgIGxldCBjaGFuZ2UgPSB0aGlzLmRvbWFpbk1hcC5oYXMoa2V5KSA/IFN0YXRlTWFuYWdlci5VUERBVEUgOiBTdGF0ZU1hbmFnZXIuTkVXO1xuXG4gICAgICAgIHRoaXMuZG9tYWluTWFwLnNldChrZXksIG9iamVjdCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JNYXAuZ2V0KGtleSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5lcnJvck1hcC5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsRXJyb3JDaGFuZ2UobnVsbCwga2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNpZ25hbERvbWFpbkNoYW5nZShvYmplY3QsIGtleSwgY2hhbmdlKTtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICBhc3luYyBkZWxldGUoa2V5ID0gU3RhdGVNYW5hZ2VyLkRFRkFVTFQpIHtcblxuICAgICAgICB0aGlzLmRvbWFpbk1hcC5kZWxldGUoa2V5KTtcbiAgICAgICAgdGhpcy5kb21haW5MaXN0ZW5lcnMuZGVsZXRlKGtleSk7XG5cbiAgICAgICAgdGhpcy5lcnJvck1hcC5kZWxldGUoa2V5KTtcbiAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycy5kZWxldGUoa2V5KTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnNpZ25hbERvbWFpbkNoYW5nZShudWxsLCBrZXksIFN0YXRlTWFuYWdlci5ERUxFVEUpO1xuICAgIH1cblxuICAgIGFzeW5jIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHRoaXMuZG9tYWluTWFwLmtleXMoKSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxEb21haW5DaGFuZ2UobnVsbCwga2V5LCBTdGF0ZU1hbmFnZXIuREVMRVRFKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNpZ25hbERvbWFpbkNoYW5nZShudWxsLCBTdGF0ZU1hbmFnZXIuQU5ZLCBTdGF0ZU1hbmFnZXIuREVMRVRFKTtcblxuICAgICAgICB0aGlzLmRvbWFpbk1hcC5jbGVhcigpO1xuICAgICAgICB0aGlzLmRvbWFpbkxpc3RlbmVycy5jbGVhcigpO1xuXG4gICAgICAgIHRoaXMuZXJyb3JNYXAuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycy5jbGVhcigpO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaWduYWxzIGEgZG9tYWluIGNoYW5nZSB0byBhbGwgbGlzdGVuZXJzIGZvciBhIHNwZWNpZmljIGtleS5cbiAgICAgKiBAcGFyYW0ge2FueX0gb2JqZWN0IC0gVGhlIG9iamVjdCB0aGF0IGhhcyBjaGFuZ2VkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSBUaGUga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFuZ2UgLSBUaGUgdHlwZSBvZiBjaGFuZ2UgKG5ldywgdXBkYXRlZCwgZGVsZXRlZCkuXG4gICAgICovXG4gICAgc2lnbmFsRG9tYWluQ2hhbmdlKG9iamVjdCwga2V5LCBjaGFuZ2UpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9tYWluTGlzdGVuZXJzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmRvbWFpbkxpc3RlbmVycy5nZXQoa2V5KSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwoW29iamVjdCwga2V5LCBjaGFuZ2VdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgIT0gU3RhdGVNYW5hZ2VyLkFOWSAmJiB0aGlzLmRvbWFpbkxpc3RlbmVycy5oYXMoU3RhdGVNYW5hZ2VyLkFOWSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZG9tYWluTGlzdGVuZXJzLmdldChTdGF0ZU1hbmFnZXIuQU5ZKSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwoW29iamVjdCwga2V5LCBjaGFuZ2VdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNpZ25hbHMgYW4gZXJyb3IgY2hhbmdlIHRvIGFsbCBsaXN0ZW5lcnMgZm9yIGEgc3BlY2lmaWMga2V5LlxuICAgICAqIEBwYXJhbSB7YW55fSBlcnJvciAtIFRoZSBlcnJvciB0aGF0IGhhcyBvY2N1cnJlZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gVGhlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIGVycm9yLlxuICAgICAqL1xuICAgIHNpZ25hbEVycm9yQ2hhbmdlKGVycm9yLCBrZXkpIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JMaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZXJyb3JMaXN0ZW5lcnMuZ2V0KGtleSkpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKFtlcnJvciwga2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5ICE9IFN0YXRlTWFuYWdlci5BTlkgJiYgdGhpcy5lcnJvckxpc3RlbmVycy5oYXMoU3RhdGVNYW5hZ2VyLkFOWSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZXJyb3JMaXN0ZW5lcnMuZ2V0KFN0YXRlTWFuYWdlci5BTlkpKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChbZXJyb3IsIGtleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlUHJveHkob2JqZWN0LCBrZXksIHN0YXRlTWFuYWdlcikge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iamVjdCwge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTaWduYWxzIGEgZG9tYWluIGNoYW5nZSB3aGVuIGEgcHJvcGVydHkgaXMgc2V0IG9uIHRoZSBzdGF0ZSBtYW5hZ2VkIG9iamVjdC5cbiAgICAgICAgICAgICAqIEBwYXJhbSB7YW55fSB0YXJnZXQgXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCBcbiAgICAgICAgICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZSBcbiAgICAgICAgICAgICAqIEByZXR1cm5zIFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFtwcm9wXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSAodGFyZ2V0W3Byb3BdID0gdmFsdWUpO1xuICAgICAgICAgICAgICAgIHN0YXRlTWFuYWdlci5zaWduYWxEb21haW5DaGFuZ2UodGFyZ2V0LCBrZXksIFN0YXRlTWFuYWdlci5VUERBVEUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzID09PSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTWFwIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBVbmlxdWVJZFJlZ2lzdHJ5IHtcblxuICAgIGlkQXR0cmlidXRlV2l0aFN1ZmZpeCAoaWQpIHtcbiAgICAgICAgaWYoaWROYW1lcy5jb250YWlucyhpZCkpIHtcbiAgICAgICAgICAgIHZhciBudW1iZXIgPSBpZE5hbWVzLmdldChpZCk7XG4gICAgICAgICAgICBpZE5hbWVzLnNldChpZCxudW1iZXIrMSk7XG4gICAgICAgICAgICByZXR1cm4gaWQgKyBcIi1cIiArIG51bWJlcjtcbiAgICAgICAgfVxuICAgICAgICBpZE5hbWVzLnNldChpZCwxKTtcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH1cblxufVxuXG52YXIgaWROYW1lcyA9IG5ldyBNYXAoKTsiLCJleHBvcnQgY2xhc3MgQXR0cmlidXRlIHtcblxuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZSkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSA9IGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZS52YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlLm5hbWU7XG4gICAgfVxuXG4gICAgZ2V0IG5hbWVzcGFjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlLm5hbWU7XG4gICAgfVxufSIsImltcG9ydCB7IENvbnRhaW5lckVsZW1lbnQgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXBwZWRDb250YWluZXJFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7Q29udGFpbmVyRWxlbWVudH0gZWxlbWVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG5cbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb250YWluZXJFbGVtZW50IG11c3QgYmUgcHJvdmlkZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHR5cGUge0NvbnRhaW5lckVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCwgQ29udGFpbmVyRWxlbWVudFV0aWxzIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgTWFwcGVkQ29udGFpbmVyRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L21hcHBlZENvbnRhaW5lckVsZW1lbnRcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkVsZW1lbnRVdGlsc1wiKTtcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRVdGlscyB7XG5cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZSBcbiAgICAgKiBAcGFyYW0ge01hcHBlZENvbnRhaW5lckVsZW1lbnR9IHBhcmVudCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlQ29udGFpbmVyRWxlbWVudCh2YWx1ZSwgcGFyZW50KSB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFhtbEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBFbGVtZW50VXRpbHMuY3JlYXRlRnJvbVhtbEVsZW1lbnQodmFsdWUsIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVFbGVtZW50KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQ29udGFpbmVyRWxlbWVudFV0aWxzLmlzVUlFbGVtZW50KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb250YWluZXJFbGVtZW50KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBMT0cuZXJyb3IoXCJVbnJlY29nbml6ZWQgdmFsdWUgZm9yIEVsZW1lbnRcIik7XG4gICAgICAgIExPRy5lcnJvcih2YWx1ZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBicm93c2VyIEVsZW1lbnQgZnJvbSB0aGUgWG1sRWxlbWVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSB4bWxFbGVtZW50XG4gICAgICogQHBhcmFtIHtNYXBwZWRDb250YWluZXJFbGVtZW50fSBwYXJlbnRFbGVtZW50XG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb21YbWxFbGVtZW50KHhtbEVsZW1lbnQsIHBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoeG1sRWxlbWVudC5uYW1lc3BhY2UpIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlRWxlbWVudE5TKHhtbEVsZW1lbnQubmFtZXNwYWNlVXJpLCB4bWxFbGVtZW50LmZ1bGxOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlRWxlbWVudCh4bWxFbGVtZW50Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJlbnRFbGVtZW50ICYmIHBhcmVudEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcGFyZW50RWxlbWVudC5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHhtbEVsZW1lbnQuYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGVLZXksIGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnNldEF0dHJpYnV0ZVZhbHVlKGVsZW1lbnQsIGF0dHJpYnV0ZUtleSwgYXR0cmlidXRlLnZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IE1hcCwgTG9nZ2VyLCBMaXN0LCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENvbnRhaW5lckVsZW1lbnQsIENvbnRhaW5lckVsZW1lbnRVdGlscywgQ29udGFpbmVyVGV4dCB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZSB9IGZyb20gXCIuL2F0dHJpYnV0ZS5qc1wiO1xuaW1wb3J0IHsgRWxlbWVudFV0aWxzIH0gZnJvbSBcIi4uL3V0aWwvZWxlbWVudFV0aWxzLmpzXCI7XG5pbXBvcnQgeyBNYXBwZWRDb250YWluZXJFbGVtZW50IH0gZnJvbSBcIi4vbWFwcGVkQ29udGFpbmVyRWxlbWVudC5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQmFzZUVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBiYXNlIGNsYXNzIGZvciBlbmNsb3NpbmcgYW4gSFRNTEVsZW1lbnRcbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2VFbGVtZW50IGV4dGVuZHMgTWFwcGVkQ29udGFpbmVyRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fHN0cmluZ3xhbnl9IHZhbHVlIFZhbHVlIHRvIGJlIGNvbnZlcnRlZCB0byBDb250YWluZXIgVUkgRWxlbWVudCAoSFRNTEVsZW1lbnQgaW4gdGhlIGNhc2Ugb2YgV2ViIEJyb3dzZXIpXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IHRoZSBwYXJlbnQgQmFzZUVsZW1lbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKEVsZW1lbnRVdGlscy5jcmVhdGVDb250YWluZXJFbGVtZW50KHZhbHVlLCBwYXJlbnQpKTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSBudWxsO1xuICAgICAgICB0aGlzLmV2ZW50c0F0dGFjaGVkID0gbmV3IExpc3QoKTtcbiAgICB9XG5cbiAgICBsb2FkQXR0cmlidXRlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyRWxlbWVudC5hdHRyaWJ1dGVzID09PSBudWxsIHx8IHRoaXMuY29udGFpbmVyRWxlbWVudC5hdHRyaWJ1dGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZU1hcCA9PT0gbnVsbCB8fCB0aGlzLmF0dHJpYnV0ZU1hcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXJFbGVtZW50LmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZU1hcC5zZXQodGhpcy5jb250YWluZXJFbGVtZW50LmF0dHJpYnV0ZXNbaV0ubmFtZSxuZXcgQXR0cmlidXRlKHRoaXMuY29udGFpbmVyRWxlbWVudC5hdHRyaWJ1dGVzW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyRnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dE9iamVjdFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2FwdHVyZVxuICAgICAqIEByZXR1cm5zIHtCYXNlRWxlbWVudH1cbiAgICAgKi9cbiAgICBsaXN0ZW5UbyhldmVudFR5cGUsIGxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHRPYmplY3QsIGNhcHR1cmUgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBNZXRob2QobGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgZnVsbE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQudGFnTmFtZTtcbiAgICB9XG5cbiAgICBnZXQgdG9wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LmJvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG4gICAgfVxuXG4gICAgZ2V0IGJvdHRvbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5ib3VuZGluZ0NsaWVudFJlY3QuYm90dG9tO1xuICAgIH1cblxuICAgIGdldCBsZWZ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LmJvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgIH1cblxuICAgIGdldCByaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5ib3VuZGluZ0NsaWVudFJlY3QucmlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIH1cblxuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgIH1cblxuICAgIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgICAgICB0aGlzLmxvYWRBdHRyaWJ1dGVzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcDtcbiAgICB9XG5cbiAgICBzZXRBdHRyaWJ1dGVWYWx1ZShrZXksIHZhbHVlKSB7XG4gICAgICAgIENvbnRhaW5lckVsZW1lbnRVdGlscy5zZXRBdHRyaWJ1dGVWYWx1ZSh0aGlzLmNvbnRhaW5lckVsZW1lbnQsIGtleSx2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0QXR0cmlidXRlVmFsdWUoa2V5KSB7XG4gICAgICAgIHJldHVybiBDb250YWluZXJFbGVtZW50VXRpbHMuZ2V0QXR0cmlidXRlVmFsdWUodGhpcy5jb250YWluZXJFbGVtZW50LCBrZXkpO1xuICAgIH1cblxuICAgIGNvbnRhaW5zQXR0cmlidXRlKGtleSkge1xuICAgICAgICBjb25zdCBjb250YWluZXJFbGVtZW50ID0gdGhpcy5jb250YWluZXJFbGVtZW50O1xuICAgICAgICByZXR1cm4gY29udGFpbmVyRWxlbWVudC5oYXNBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG5cbiAgICByZW1vdmVBdHRyaWJ1dGUoa2V5KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG5cbiAgICBzZXRTdHlsZShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5zdHlsZVtrZXldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0U3R5bGUoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuc3R5bGVba2V5XTtcbiAgICB9XG5cbiAgICByZW1vdmVTdHlsZShrZXkpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnN0eWxlW2tleV0gPSBudWxsO1xuICAgIH1cblxuICAgIHNldChpbnB1dCkge1xuICAgICAgICBpZiAobnVsbCA9PT0gaW5wdXQgfHwgdW5kZWZpbmVkID09PSBpbnB1dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gaW5wdXQgcHJvdmlkZWQgdG8gc2V0IHRoZSBlbGVtZW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCF0aGlzLmNvbnRhaW5lckVsZW1lbnQucGFyZW50Tm9kZSl7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGhlIGVsZW1lbnQgaGFzIG5vIHBhcmVudCwgY2FuIG5vdCBzd2FwIGl0IGZvciB2YWx1ZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvKiogQHR5cGUge0NvbnRhaW5lckVsZW1lbnR9ICovXG4gICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLmNvbnRhaW5lckVsZW1lbnQucGFyZW50Tm9kZTtcblxuICAgICAgICBpZihpbnB1dC5jb250YWluZXJFbGVtZW50KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbnB1dC5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZihpbnB1dCAmJiBpbnB1dC5yb290RWxlbWVudCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaW5wdXQucm9vdEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCwgdGhpcy5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudCA9IGlucHV0LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIGlucHV0ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVUZXh0Tm9kZShpbnB1dCksIHRoaXMuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbnB1dCwgdGhpcy5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGlucHV0LCB0aGlzLmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIExPRy53YXJuKFwiTm8gdmFsaWQgaW5wdXQgdG8gc2V0IHRoZSBlbGVtZW50XCIpO1xuICAgICAgICBMT0cud2FybihpbnB1dCk7XG4gICAgfVxuXG4gICAgaXNNb3VudGVkKCkge1xuICAgICAgICBpZih0aGlzLmNvbnRhaW5lckVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyRWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge0NvbnRhaW5lckVsZW1lbnR9ICovXG4gICAgICAgICAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5jb250YWluZXJFbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0Q2hpbGQoaW5wdXQpIHtcbiAgICAgICAgaWYgKG51bGwgPT09IGlucHV0IHx8IHVuZGVmaW5lZCA9PT0gaW5wdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGlucHV0IHByb3ZpZGVkIHRvIHNldCB0aGUgZWxlbWVudFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoaW5wdXQpO1xuICAgIH1cblxuICAgIGFkZENoaWxkKGlucHV0KSB7XG4gICAgICAgIGlmIChudWxsID09PSBpbnB1dCB8fCB1bmRlZmluZWQgPT09IGlucHV0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBpbnB1dCBwcm92aWRlZCB0byBzZXQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0LmNvbnRhaW5lckVsZW1lbnQgIT09IHVuZGVmaW5lZCAmJiBpbnB1dC5jb250YWluZXJFbGVtZW50ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChpbnB1dC5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChpbnB1dC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlVGV4dE5vZGUoaW5wdXQpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lckVsZW1lbnQgPSBuZXcgQ29udGFpbmVyRWxlbWVudChpbnB1dCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgTE9HLndhcm4oXCJObyB2YWxpZCBpbnB1dCB0byBhZGQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIExPRy53YXJuKGlucHV0KTtcbiAgICB9XG5cbiAgICBwcmVwZW5kQ2hpbGQoaW5wdXQpIHtcbiAgICAgICAgaWYgKG51bGwgPT09IGlucHV0IHx8IHVuZGVmaW5lZCA9PT0gaW5wdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGlucHV0IHByb3ZpZGVkIHRvIHNldCB0aGUgZWxlbWVudFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0LmNvbnRhaW5lckVsZW1lbnQgIT09IHVuZGVmaW5lZCAmJiBpbnB1dC5jb250YWluZXJFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5zZXJ0QmVmb3JlKGlucHV0LmNvbnRhaW5lckVsZW1lbnQsIHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbnNlcnRCZWZvcmUoaW5wdXQucm9vdEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCwgdGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50Lmluc2VydEJlZm9yZShDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlVGV4dE5vZGUoaW5wdXQpLCB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgQ29udGFpbmVyVGV4dCkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50Lmluc2VydEJlZm9yZShpbnB1dCwgdGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbnNlcnRCZWZvcmUoaW5wdXQsIHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBMT0cud2FybihcIk5vIHZhbGlkIGlucHV0IHRvIHByZXBlbmQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIExPRy53YXJuKGlucHV0KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBNYXAgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYmFzZUVsZW1lbnRcIjtcblxuLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb21wb25lbnRJbmRleCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSByb290RWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge01hcH0gZWxlbWVudE1hcCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb21wb25lbnRJbmRleCwgcm9vdEVsZW1lbnQsIGVsZW1lbnRNYXApIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRJbmRleCA9IGNvbXBvbmVudEluZGV4O1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAgPSBlbGVtZW50TWFwO1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gcm9vdEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBcbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgZ2V0KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgc2V0IChpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwLmdldChpZCkuc2V0KHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBcbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgY2xlYXJDaGlsZHJlbihpZCl7XG4gICAgICAgIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpLmNsZWFyKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgc2V0Q2hpbGQgKGlkLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKS5zZXRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgYWRkQ2hpbGQgKGlkLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKS5hZGRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgcHJlcGVuZENoaWxkIChpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwLmdldChpZCkucHJlcGVuZENoaWxkKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQWJzdHJhY3RJbnB1dEVsZW1lbnRcIik7XG5cbi8qKlxuICogU2hhcmVkIHByb3BlcnRpZXMgb2YgaW5wdXQgZWxlbWVudHNcbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0SW5wdXRFbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIodmFsdWUsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgICAqL1xuICAgIHNldCBuYW1lKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgZ2l2ZW4gYW55IHByb2Nlc3NpbmcgcnVsZXNcbiAgICAgKi9cbiAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2luZ1ZhbHVlO1xuICAgIH1cblxuICAgIHNldCB2YWx1ZSh2YWx1ZSl7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZGlzcGF0Y2hFdmVudCgnY2hhbmdlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc291cmNlIHZhbHVlXG4gICAgICovXG4gICAgZ2V0IGJhY2tpbmdWYWx1ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LnZhbHVlO1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBzZWxlY3RBbGwoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5zZWxlY3QoKTtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRpc2FibGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQWJzdHJhY3RJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgUmFkaW9JbnB1dEVsZW1lbnQgZXh0ZW5kcyBBYnN0cmFjdElucHV0RWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHNldCBjaGVja2VkKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpc0NoZWNrZWQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkO1xuICAgIH1cblxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNDaGVja2VkKCk7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkID0gKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBcInRydWVcIik7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQWJzdHJhY3RJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hJbnB1dEVsZW1lbnQgZXh0ZW5kcyBBYnN0cmFjdElucHV0RWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHNldCBjaGVja2VkKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpc0NoZWNrZWQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkO1xuICAgIH1cblxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNDaGVja2VkKCk7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkID0gKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBcInRydWVcIik7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQge1htbEVsZW1lbnR9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7QWJzdHJhY3RJbnB1dEVsZW1lbnR9IGZyb20gXCIuL2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBUZXh0SW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHtYbWxFbGVtZW50fSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQge0Fic3RyYWN0SW5wdXRFbGVtZW50fSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVGV4dGFyZWFJbnB1dEVsZW1lbnQgZXh0ZW5kcyBBYnN0cmFjdElucHV0RWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIGdldCBpbm5lckhUTUwoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbm5lckhUTUw7XG4gICAgfVxuXG4gICAgc2V0IGlubmVySFRNTCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBhZGRDaGlsZChpbnB1dCkge1xuICAgICAgICBzdXBlci5hZGRDaGlsZChpbnB1dCk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmlubmVySFRNTDtcbiAgICB9XG5cbiAgICBwcmVwZW5kQ2hpbGQoaW5wdXQpIHtcbiAgICAgICAgc3VwZXIucHJlcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5uZXJIVE1MO1xuICAgIH1cblxufSIsImltcG9ydCB7IFhtbENkYXRhIH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCwgQ29udGFpbmVyRWxlbWVudFV0aWxzIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVGV4dG5vZGVFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbENkYXRhfSB2YWx1ZSBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmFsdWUsIHBhcmVudCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7Q29udGFpbmVyRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICBpZih2YWx1ZSBpbnN0YW5jZW9mIFhtbENkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSB0aGlzLmNyZWF0ZUZyb21YbWxDZGF0YSh2YWx1ZSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZVRleHROb2RlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7WG1sQ2RhdGF9IGNkYXRhRWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnRFbGVtZW50IFxuICAgICAqL1xuICAgIGNyZWF0ZUZyb21YbWxDZGF0YShjZGF0YUVsZW1lbnQsIHBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVUZXh0Tm9kZShjZGF0YUVsZW1lbnQudmFsdWUpO1xuICAgICAgICBpZihwYXJlbnRFbGVtZW50ICE9PSBudWxsICYmIHBhcmVudEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcGFyZW50RWxlbWVudC5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gICAgfVxuXG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmltcG9ydCB7IFhtbEVsZW1lbnQgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVFbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBnZXQgaW5uZXJIVE1MKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIH1cblxuICAgIHNldCBpbm5lckhUTUwodmFsdWUpe1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRm9ybUVsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgdGhlIGlucHV0cyBuYW1lXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGlucHV0cyBuYW1lXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQgbmFtZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQubmFtZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHN1Ym1pdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5zdWJtaXQoKTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIFZpZGVvRWxlbWVudCBleHRlbmRzIEJhc2VFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IHZhbHVlIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBnZXQgbWFwcGVkRWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudDtcbiAgICB9XG5cbiAgICBwbGF5TXV0ZWQoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5wbGF5TXV0ZWQoKTtcbiAgICB9XG5cbiAgICBwbGF5KCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucGxheSgpO1xuICAgIH1cblxuICAgIG11dGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5tdXRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdW5tdXRlKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQubXV0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIE9wdGlvbkVsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudCB7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG5cdCAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcblx0ICovXG5cdGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuXHRcdHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgICAgIHRoaXMub3B0aW9uTGFiZWwgPSBudWxsO1xuXHR9XG5cbiAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlVmFsdWUoXCJ2YWx1ZVwiKTtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUodmFsKXtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVWYWx1ZShcInZhbHVlXCIsIHZhbCk7XG4gICAgfVxuXG4gICAgZ2V0IGxhYmVsKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbkxhYmVsO1xuICAgIH1cblxuICAgIHNldCBsYWJlbCh2YWx1ZSl7XG4gICAgICAgIHRoaXMub3B0aW9uTGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRDaGlsZCh2YWx1ZSk7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQge1htbEF0dHJpYnV0ZSwgWG1sRWxlbWVudH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHtFbGVtZW50TWFwcGVyfSBmcm9tIFwiLi4vZWxlbWVudC9lbGVtZW50TWFwcGVyLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBIVE1Me1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVsZW1lbnROYW1lIFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgU3RyaW5nPn0gYXR0cmlidXRlTWFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjdXN0b20oZWxlbWVudE5hbWUsIGF0dHJpYnV0ZU1hcCA9IG51bGwpe1xuICAgICAgICBjb25zdCB4bWxFbGVtZW50ID0gbmV3IFhtbEVsZW1lbnQoZWxlbWVudE5hbWUpO1xuICAgICAgICBpZiAoYXR0cmlidXRlTWFwKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHhtbEVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgbmV3IFhtbEF0dHJpYnV0ZShrZXksIG51bGwsIHZhbHVlKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRWxlbWVudE1hcHBlci5tYXAoeG1sRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVsZW1lbnROYW1lIFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgU3RyaW5nPn0gYXR0cmlidXRlTWFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjdXN0b21DaGlsZChlbGVtZW50TmFtZSwgcGFyZW50LCBhdHRyaWJ1dGVNYXAgPSBudWxsKXtcbiAgICAgICAgY29uc3QgeG1sRWxlbWVudCA9IG5ldyBYbWxFbGVtZW50KGVsZW1lbnROYW1lKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZU1hcCkge1xuICAgICAgICAgICAgYXR0cmlidXRlTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB4bWxFbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIG5ldyBYbWxBdHRyaWJ1dGUoa2V5LCBudWxsLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEVsZW1lbnRNYXBwZXIubWFwKHhtbEVsZW1lbnQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFwcGx5U3R5bGVzKGVsZW1lbnQsIGNsYXNzVmFsdWUsIHN0eWxlVmFsdWUpe1xuICAgICAgICBpZihjbGFzc1ZhbHVlKXtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBjbGFzc1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZihzdHlsZVZhbHVlKXtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJzdHlsZVwiLCBzdHlsZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBhKHZhbHVlLCBocmVmLCBjbGFzc1ZhbHVlLCBzdHlsZVZhbHVlKXtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEhUTUwuY3VzdG9tKFwiYVwiKTtcbiAgICAgICAgZWxlbWVudC5hZGRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJocmVmXCIsaHJlZik7XG4gICAgICAgIEhUTUwuYXBwbHlTdHlsZXMoZWxlbWVudCwgY2xhc3NWYWx1ZSwgc3R5bGVWYWx1ZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBpKHZhbHVlLCBjbGFzc1ZhbHVlLCBzdHlsZVZhbHVlKXtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEhUTUwuY3VzdG9tKFwiaVwiKTtcbiAgICAgICAgZWxlbWVudC5hZGRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIEhUTUwuYXBwbHlTdHlsZXMoZWxlbWVudCwgY2xhc3NWYWx1ZSwgc3R5bGVWYWx1ZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IE9wdGlvbkVsZW1lbnQgfSBmcm9tIFwiLi9vcHRpb25FbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEhUTUwgfSBmcm9tIFwiLi4vaHRtbC9odG1sLmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJbnB1dEVsZW1lbnREYXRhQmluZGluZ1wiKTtcblxuZXhwb3J0IGNsYXNzIFNlbGVjdEVsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudCB7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG5cdCAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcblx0ICovXG5cdGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuXHRcdHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxPcHRpb25FbGVtZW50Pn0gKi9cbiAgICAgICAgdGhpcy5vcHRpb25zQXJyYXkgPSBbXTtcblx0fVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9wdGlvbnMgYXMgYXJyYXkgb2YgT3B0aW9uRWxlbWVudFxuICAgICAqIEByZXR1cm4ge0FycmF5PE9wdGlvbkVsZW1lbnQ+fVxuICAgICAqL1xuICAgIGdldCBvcHRpb25zKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNBcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3B0aW9ucyBmcm9tIGFycmF5IG9mIE9wdGlvbkVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5PE9wdGlvbkVsZW1lbnQ+fSBvcHRpb25zQXJyYXlcbiAgICAgKi9cbiAgICBzZXQgb3B0aW9ucyhvcHRpb25zQXJyYXkpe1xuICAgICAgICB0aGlzLm9wdGlvbnNBcnJheSA9IG9wdGlvbnNBcnJheTtcbiAgICAgICAgdGhpcy5yZW5kZXJPcHRpb25zKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyT3B0aW9ucygpe1xuICAgICAgICB3aGlsZSAodGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgdGhpcy5vcHRpb25zQXJyYXkpe1xuICAgICAgICAgICAgLy8gUmVwbGFjZSB3aXRoIGNvbnRhaW5lcmJyaWRnZVxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uRWxlbWVudCA9IEhUTUwuY3VzdG9tQ2hpbGQoXCJvcHRpb25cIiwgdGhpcyk7XG4gICAgICAgICAgICBvcHRpb25FbGVtZW50LnZhbHVlID0gb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgb3B0aW9uRWxlbWVudC5sYWJlbCA9IG9wdGlvbi5sYWJlbDtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb25FbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgICAqL1xuICAgIHNldCBuYW1lKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgZ2l2ZW4gYW55IHByb2Nlc3NpbmcgcnVsZXNcbiAgICAgKi9cbiAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2luZ1ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIGdpdmVuIGFueSBwcm9jZXNzaW5nIHJ1bGVzXG4gICAgICovXG4gICAgc2V0IHZhbHVlKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnQudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZGlzcGF0Y2hFdmVudCgnY2hhbmdlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTE9HLndhcm4oXCJWYWx1ZSAnXCIgKyB2YWx1ZSArIFwiJyBub3QgZm91bmQgaW4gb3B0aW9ucyBmb3Igc2VsZWN0IGVsZW1lbnQgd2l0aCBuYW1lICdcIiArIHRoaXMubmFtZSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzb3VyY2UgdmFsdWVcbiAgICAgKi9cbiAgICBnZXQgYmFja2luZ1ZhbHVlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQudmFsdWU7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxuICAgIHNlbGVjdEFsbCgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnNlbGVjdCgpO1xuICAgIH1cblxuICAgIGVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZGlzYWJsZSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1htbEVsZW1lbnR9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7QWJzdHJhY3RJbnB1dEVsZW1lbnR9IGZyb20gXCIuL2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBGaWxlSW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBmb2N1cygpIHtcbiAgICAgICAgTE9HLldBUk4oXCJGaWxlIGlucHV0IGVsZW1lbnRzIGNhbm5vdCBiZSBmb2N1c2VkIGRpcmVjdGx5IGR1ZSB0byBicm93c2VyIHNlY3VyaXR5IHJlc3RyaWN0aW9ucy5cIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxDZGF0YSxYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgUmFkaW9JbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9yYWRpb0lucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQ2hlY2tib3hJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9jaGVja2JveElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgVGV4dElucHV0RWxlbWVudCB9IGZyb20gXCIuL3RleHRJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRhcmVhSW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vdGV4dGFyZWFJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRub2RlRWxlbWVudCB9IGZyb20gXCIuL3RleHRub2RlRWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCB9IGZyb20gXCIuL3NpbXBsZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEZvcm1FbGVtZW50IH0gZnJvbSBcIi4vZm9ybUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFZpZGVvRWxlbWVudCB9IGZyb20gXCIuL3ZpZGVvRWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgT3B0aW9uRWxlbWVudCB9IGZyb20gXCIuL29wdGlvbkVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFNlbGVjdEVsZW1lbnQgfSBmcm9tIFwiLi9zZWxlY3RFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBGaWxlSW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vZmlsZUlucHV0RWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudE1hcHBlciB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7YW55fSBpbnB1dCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgc3RhdGljIG1hcChpbnB1dCwgcGFyZW50KSB7XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1JhZGlvKGlucHV0KSl7ICAgICByZXR1cm4gbmV3IFJhZGlvSW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb0NoZWNrYm94KGlucHV0KSl7ICByZXR1cm4gbmV3IENoZWNrYm94SW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1N1Ym1pdChpbnB1dCkpeyAgICByZXR1cm4gbmV3IFRleHRJbnB1dEVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvRm9ybShpbnB1dCkpeyAgICAgIHJldHVybiBuZXcgRm9ybUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvVGV4dGFyZWEoaW5wdXQpKXsgIHJldHVybiBuZXcgVGV4dGFyZWFJbnB1dEVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvRmlsZShpbnB1dCkpeyAgICAgIHJldHVybiBuZXcgRmlsZUlucHV0RWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9UZXh0KGlucHV0KSl7ICAgICAgcmV0dXJuIG5ldyBUZXh0SW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1ZpZGVvKGlucHV0KSl7ICAgICByZXR1cm4gbmV3IFZpZGVvRWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9UZXh0bm9kZShpbnB1dCkpeyAgcmV0dXJuIG5ldyBUZXh0bm9kZUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvT3B0aW9uKGlucHV0KSl7ICAgIHJldHVybiBuZXcgT3B0aW9uRWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9TZWxlY3QoaW5wdXQpKXsgICAgcmV0dXJuIG5ldyBTZWxlY3RFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1NpbXBsZShpbnB1dCkpeyAgICByZXR1cm4gbmV3IFNpbXBsZUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgY29uc29sZS5sb2coXCJNYXBwaW5nIHRvIHNpbXBsZSBieSBkZWZhdWx0IFwiICsgaW5wdXQpO1xuICAgICAgICByZXR1cm4gbmV3IFNpbXBsZUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1JhZGlvKGlucHV0KXtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBpbnB1dC50eXBlID09PSBcInJhZGlvXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJpbnB1dFwiICYmIGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikgJiZcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcInJhZGlvXCIpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9DaGVja2JveChpbnB1dCl7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgaW5wdXQudHlwZSA9PT0gXCJjaGVja2JveFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwiaW5wdXRcIiAmJiBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICYmXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJjaGVja2JveFwiKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvU3VibWl0KGlucHV0KXtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBpbnB1dC50eXBlID09PSBcInN1Ym1pdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwiaW5wdXRcIiAmJiBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICYmXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJzdWJtaXRcIikge1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb0Zvcm0oaW5wdXQpe1xuICAgICAgICByZXR1cm4gKGlucHV0IGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50KSB8fFxuICAgICAgICAgICAgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcImZvcm1cIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb0ZpbGUoaW5wdXQpe1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJmaWxlXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJpbnB1dFwiICYmIGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikgJiZcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcImZpbGVcIikgeyBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvVGV4dChpbnB1dCl7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcInRleHRcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IFwiaGlkZGVuXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcIm51bWJlclwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJwYXNzd29yZFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJlbWFpbFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJkYXRlXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcInRpbWVcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcImlucHV0XCIpIHtcbiAgICAgICAgICAgIGlmKCFpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcInRleHRcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJoaWRkZW5cIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJudW1iZXJcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJwYXNzd29yZFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcImVtYWlsXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmKGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwiZGF0ZVwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcInRpbWVcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvVGV4dG5vZGUoaW5wdXQpe1xuICAgICAgICByZXR1cm4gKGlucHV0IGluc3RhbmNlb2YgTm9kZSAmJiBpbnB1dC5ub2RlVHlwZSA9PT0gXCJURVhUX05PREVcIikgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbENkYXRhKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvT3B0aW9uKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxPcHRpb25FbGVtZW50KSB8fFxuICAgICAgICAgICAgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcIm9wdGlvblwiKTtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIG1hcHNUb1NlbGVjdChpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJzZWxlY3RcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1ZpZGVvKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwidmlkZW9cIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1RleHRhcmVhKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwidGV4dGFyZWFcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1NpbXBsZShpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IE1hcCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEVsZW1lbnRNYXBwZXIgfSBmcm9tIFwiLi4vZWxlbWVudC9lbGVtZW50TWFwcGVyLmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Jhc2VFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vdW5pcXVlSWRSZWdpc3RyeS5qc1wiO1xuXG4vKipcbiAqIENvbGxlY3RzIGluZm9ybWF0aW9uIHdoZW4gZWxlbWVudHMgYXJlIGNyZWF0ZWQgYW5kIGZpbmRzIHRoZSByb290IGVsZW1lbnQsIGNyZWF0ZXMgbWFwIG9mIGVsZW1lbnRzIFxuICovXG5leHBvcnQgY2xhc3MgRWxlbWVudFJlZ2lzdHJhdG9yIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VW5pcXVlSWRSZWdpc3RyeX0gdW5pcXVlSWRSZWdpc3RyeSBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29tcG9uZW50SW5kZXggXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodW5pcXVlSWRSZWdpc3RyeSwgY29tcG9uZW50SW5kZXgpIHtcblxuICAgICAgICAvKiogQHR5cGUge051bWJlcn0gKi9cbiAgICAgICAgdGhpcy5jb21wb25lbnRJbmRleCA9IGNvbXBvbmVudEluZGV4O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VW5pcXVlSWRSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy51bmlxdWVJZFJlZ2lzdHJ5ID0gdW5pcXVlSWRSZWdpc3RyeTtcblxuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICB0aGlzLmVsZW1lbnRNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgZ2V0RWxlbWVudE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudE1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0ZW5zIHRvIGVsZW1lbnRzIGJlaW5nIGNyZWF0ZWQsIGFuZCB0YWtlcyBpbm4gdGhlIGNyZWF0ZWQgWG1sRWxlbWVudCBhbmQgaXRzIHBhcmVudCBYbWxFbGVtZW50XG4gICAgICogXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSB4bWxFbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudFdyYXBwZXIgXG4gICAgICovXG4gICAgZWxlbWVudENyZWF0ZWQoeG1sRWxlbWVudCwgcGFyZW50V3JhcHBlcikge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gRWxlbWVudE1hcHBlci5tYXAoeG1sRWxlbWVudCwgcGFyZW50V3JhcHBlcik7XG5cbiAgICAgICAgdGhpcy5hZGRUb0VsZW1lbnRJZE1hcChlbGVtZW50KTtcblxuICAgICAgICBpZih0aGlzLnJvb3RFbGVtZW50ID09PSBudWxsICYmIGVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgYWRkVG9FbGVtZW50SWRNYXAoZWxlbWVudCkge1xuICAgICAgICBpZihlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCB8fCAhKGVsZW1lbnQgaW5zdGFuY2VvZiBCYXNlRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaWQgPSBudWxsO1xuICAgICAgICBpZihlbGVtZW50LmNvbnRhaW5zQXR0cmlidXRlKFwiaWRcIikpIHtcbiAgICAgICAgICAgIGlkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImlkXCIpO1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImlkXCIsdGhpcy51bmlxdWVJZFJlZ2lzdHJ5LmlkQXR0cmlidXRlV2l0aFN1ZmZpeChpZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoaWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudE1hcC5zZXQoaWQsZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCwgQ29udGFpbmVyRWxlbWVudFV0aWxzLCBDb250YWluZXJFdmVudCwgQ29udGFpbmVyV2luZG93IH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi4vY29tcG9uZW50L2NvbXBvbmVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQ2FudmFzUm9vdCB7XG5cbiAgICBzdGF0aWMgc2hvdWxkU3dhbGxvd05leHRGb2N1c0VzY2FwZSA9IGZhbHNlO1xuXG4gICAgLyoqIEB0eXBlIHtDb250YWluZXJFbGVtZW50fSAqL1xuICAgIHN0YXRpYyBtb3VzZURvd25FbGVtZW50ID0gbnVsbDtcblxuICAgIHN0YXRpYyBmb2N1c0VzY2FwZUV2ZW50UmVxdWVzdGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVwbGFjZUNvbXBvbmVudChpZCwgY29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgYm9keUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoY29tcG9uZW50LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQsIGJvZHlFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0Q29tcG9uZW50KGlkLCBjb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgYm9keUVsZW1lbnQgPSBDb250YWluZXJFbGVtZW50VXRpbHMuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBib2R5RWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQoY29tcG9uZW50LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQsIGJvZHlFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkQ2hpbGRDb21wb25lbnQoaWQsIGNvbXBvbmVudCkge1xuICAgICAgICBjb25zdCBib2R5RWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKGNvbXBvbmVudC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkQ2hpbGRFbGVtZW50KGlkLCBlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZUVsZW1lbnQoaWQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnJlbW92ZUVsZW1lbnQoaWQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgc3RhdGljIGFkZEhlYWRlckVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICBDb250YWluZXJFbGVtZW50VXRpbHMuYXBwZW5kUm9vdE1ldGFDaGlsZChlbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgc3RhdGljIGFkZEJvZHlFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLmFwcGVuZFJvb3RVaUNoaWxkKGVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJlcGVuZEhlYWRlckVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICBDb250YWluZXJFbGVtZW50VXRpbHMucHJlcGVuZEVsZW1lbnQoXCJoZWFkXCIsIGVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJlcGVuZEJvZHlFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnByZXBlbmRFbGVtZW50KFwiYm9keVwiLCBlbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBSZW1lbWJlciB0byBzd2FsbG93Rm9jdXNFc2NhcGUgZm9yIGluaXRpYWwgdHJpZ2dlcmluZyBldmVudHNcbiAgICAgKiB3aGljaCBhcmUgZXh0ZXJuYWwgdG8gZm9jdXNSb290XG4gICAgICogXG4gICAgICogQWxzbyByZW1lbWJlciB0byBrZWVwIHRoZSBkZXN0cm95IGZ1bmN0aW9uIGFuZCBjYWxsIGl0XG4gICAgICogd2hlbiB0aGUgbGlzdGVuZXIgaXMgbm8gbG9uZ2VyIG5lZWRlZFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGZvY3VzUm9vdFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyRnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dE9iamVjdFxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gZGVzdHJveSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGNvbnRhaW5lciB3aW5kb3dcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuVG9Gb2N1c0VzY2FwZShmb2N1c1Jvb3QsIGxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHRPYmplY3QpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IE1ldGhvZChsaXN0ZW5lckZ1bmN0aW9uLCBjb250ZXh0T2JqZWN0KTtcblxuICAgICAgICBjb25zdCBkZXN0cm95RnVuY3Rpb25zID0gW107XG5cbiAgICAgICAgLyogSGFjazogQmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgd2F5IG9mIGtub3dpbmcgaW4gdGhlIGNsaWNrIGV2ZW50IHdoaWNoIGVsZW1lbnQgd2FzIGluIGZvY3VzIHdoZW4gbW91c2Vkb3duIG9jY3VyZWQgKi9cbiAgICAgICAgaWYgKCFDYW52YXNSb290LmZvY3VzRXNjYXBlRXZlbnRSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU1vdXNlRG93bkVsZW1lbnQgPSBuZXcgTWV0aG9kKCgvKiogQHR5cGUge0NvbnRhaW5lckV2ZW50fSAqLyBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVzdHJveUZ1bmN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIENvbnRhaW5lcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHVwZGF0ZU1vdXNlRG93bkVsZW1lbnQpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5mb2N1c0VzY2FwZUV2ZW50UmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbGxJZk5vdENvbnRhaW5zID0gbmV3IE1ldGhvZCgoLyoqIEB0eXBlIHtDb250YWluZXJFdmVudH0gKi8gZXZlbnQpID0+IHtcbiAgICAgICAgICAgIENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmIChDb250YWluZXJFbGVtZW50VXRpbHMuY29udGFpbnMoZm9jdXNSb290LmNvbnRhaW5lckVsZW1lbnQsIENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBub3QgY29ubmVjdGVkLCB0aGVuIHRoZSBlbGVtZW50IGlzIG5vdCB2aXNpYmxlXG4gICAgICAgICAgICAvLyBhbmQgd2Ugc2hvdWxkIG5vdCB0cmlnZ2VyIGZvY3VzIGVzY2FwZSBldmVudHNcbiAgICAgICAgICAgIGlmICghQ29udGFpbmVyRWxlbWVudFV0aWxzLmlzQ29ubmVjdGVkKENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQ2FudmFzUm9vdC5zaG91bGRTd2FsbG93TmV4dEZvY3VzRXNjYXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXN0cm95RnVuY3Rpb25zLnB1c2goXG4gICAgICAgICAgICBDb250YWluZXJXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBjYWxsSWZOb3RDb250YWlucylcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZGVzdHJveUZ1bmN0aW9ucy5mb3JFYWNoKGRlc3Ryb3kgPT4gZGVzdHJveSgpKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIGFuIGVsZW1lbnQgaXMgY29uZ2lndXJlZCB0byBiZSBoaWRkZW4gYnkgRm9jdXNFc2NhcGUsXG4gICAgICogYW5kIHdhcyBzaG93biBieSBhbiBldmVudCB0cmlnZ2VyZWQgZnJvbSBhbiBleHRlcm5hbCBlbGVtZW50LFxuICAgICAqIHRoZW4gRm9jdXNFc2NhcGUgZ2V0cyB0cmlnZ2VyZWQgcmlnaHQgYWZ0ZXIgdGhlIGVsZW1lbnQgaXNcbiAgICAgKiBzaG93bi4gVGhlcmVmb3JlIHRoaXMgZnVuY3Rpb24gYWxsb3dzIHRoaXMgZXZlbnQgdG8gYmUgXG4gICAgICogc3dhbGxvd2VkIHRvIGF2b2lkIHRoaXMgYmVoYXZpb3JcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZm9yTWlsbGlzZWNvbmRzIFxuICAgICAqL1xuICAgIHN0YXRpYyBzd2FsbG93Rm9jdXNFc2NhcGUoZm9yTWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIENhbnZhc1Jvb3Quc2hvdWxkU3dhbGxvd05leHRGb2N1c0VzY2FwZSA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5zaG91bGRTd2FsbG93TmV4dEZvY3VzRXNjYXBlID0gZmFsc2U7XG4gICAgICAgIH0sIGZvck1pbGxpc2Vjb25kcyk7XG4gICAgfVxufSIsImltcG9ydCB7IE1hcCwgTGlzdCwgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDYW52YXNSb290IH0gZnJvbSBcIi4vY2FudmFzUm9vdC5qc1wiO1xuaW1wb3J0IHsgSFRNTCB9IGZyb20gXCIuLi9odG1sL2h0bWwuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRub2RlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L3RleHRub2RlRWxlbWVudC5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQ2FudmFzU3R5bGVzXCIpO1xuXG5jb25zdCBzdHlsZXMgPSBuZXcgTWFwKCk7XG5jb25zdCBzdHlsZU93bmVycyA9IG5ldyBNYXAoKTtcbmNvbnN0IGVuYWJsZWRTdHlsZXMgPSBuZXcgTGlzdCgpO1xuXG5leHBvcnQgY2xhc3MgQ2FudmFzU3R5bGVzIHtcblxuICAgIHN0YXRpYyBzZXRTdHlsZShuYW1lLCBzb3VyY2UpIHtcbiAgICAgICAgaWYoc3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBzdHlsZXMuZ2V0KG5hbWUpLnNldENoaWxkKG5ldyBUZXh0bm9kZUVsZW1lbnQoc291cmNlLmdldFN0eWxlc1NvdXJjZSgpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICAgICAgbGV0IHN0eWxlRWxlbWVudCA9IEhUTUwuY3VzdG9tKFwic3R5bGVcIik7XG4gICAgICAgICAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJpZFwiLG5hbWUpO1xuICAgICAgICAgICAgc3R5bGVFbGVtZW50LnNldENoaWxkKG5ldyBUZXh0bm9kZUVsZW1lbnQoc291cmNlLmdldFN0eWxlc1NvdXJjZSgpKSk7XG4gICAgICAgICAgICBzdHlsZXMuc2V0KG5hbWUsIHN0eWxlRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVtb3ZlU3R5bGUobmFtZSkge1xuICAgICAgICBpZihlbmFibGVkU3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBlbmFibGVkU3R5bGVzLnJlbW92ZShuYW1lKTtcbiAgICAgICAgICAgIENhbnZhc1Jvb3QucmVtb3ZlRWxlbWVudChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZihzdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIHN0eWxlcy5yZW1vdmUobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZGlzYWJsZVN0eWxlKG5hbWUsIG93bmVySWQgPSAwKSB7XG4gICAgICAgIENhbnZhc1N0eWxlcy5yZW1vdmVTdHlsZU93bmVyKG5hbWUsIG93bmVySWQpO1xuICAgICAgICBpZihDYW52YXNTdHlsZXMuaGFzU3R5bGVPd25lcihuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFzdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcihcIlN0eWxlIGRvZXMgbm90IGV4aXN0OiBcIiArIG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKGVuYWJsZWRTdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIGVuYWJsZWRTdHlsZXMucmVtb3ZlKG5hbWUpO1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5yZW1vdmVFbGVtZW50KG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGVuYWJsZVN0eWxlKG5hbWUsIG93bmVySWQgPSAwKSB7XG4gICAgICAgIENhbnZhc1N0eWxlcy5hZGRTdHlsZU93bmVyKG5hbWUsIG93bmVySWQpO1xuICAgICAgICBpZighc3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBMT0cuZXJyb3IoXCJTdHlsZSBkb2VzIG5vdCBleGlzdDogXCIgKyBuYW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZighZW5hYmxlZFN0eWxlcy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgZW5hYmxlZFN0eWxlcy5hZGQobmFtZSk7XG4gICAgICAgICAgICBDYW52YXNSb290LmFkZEhlYWRlckVsZW1lbnQoc3R5bGVzLmdldChuYW1lKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYWRkU3R5bGVPd25lcihuYW1lLCBvd25lcklkKSB7XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgc3R5bGVPd25lcnMuc2V0KG5hbWUsIG5ldyBMaXN0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5nZXQobmFtZSkuY29udGFpbnMob3duZXJJZCkpIHtcbiAgICAgICAgICAgIHN0eWxlT3duZXJzLmdldChuYW1lKS5hZGQob3duZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVtb3ZlU3R5bGVPd25lcihuYW1lLCBvd25lcklkKSB7XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0eWxlT3duZXJzLmdldChuYW1lKS5yZW1vdmUob3duZXJJZCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGhhc1N0eWxlT3duZXIobmFtZSkge1xuICAgICAgICBpZighc3R5bGVPd25lcnMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVPd25lcnMuZ2V0KG5hbWUpLnNpemUoKSA+IDA7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBDb21wb25lbnRGYWN0b3J5IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudE5hbWUgXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBjcmVhdGUoY29tcG9uZW50TmFtZSkge1xuICAgICAgICB0aHJvdyBcIk5vdCBpbXBsZW1lbnRlZFwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IEluamVjdGlvblBvaW50IH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBEb21UcmVlIH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi9jb21wb25lbnQuanNcIjtcbmltcG9ydCB7IFVuaXF1ZUlkUmVnaXN0cnkgfSBmcm9tIFwiLi91bmlxdWVJZFJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBFbGVtZW50UmVnaXN0cmF0b3IgfSBmcm9tIFwiLi9lbGVtZW50UmVnaXN0cmF0b3IuanNcIjtcbmltcG9ydCB7IFRlbXBsYXRlUmVnaXN0cnkgfSBmcm9tIFwiLi4vdGVtcGxhdGUvdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi4vc3R5bGVzL3N0eWxlc1JlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBDYW52YXNTdHlsZXMgfSBmcm9tIFwiLi4vY2FudmFzL2NhbnZhc1N0eWxlcy5qc1wiO1xuaW1wb3J0IHsgQ29tcG9uZW50RmFjdG9yeSB9IGZyb20gXCIuL2NvbXBvbmVudEZhY3RvcnkuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIlRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeVwiKTtcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeSBleHRlbmRzIENvbXBvbmVudEZhY3Rvcnl7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVzUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShTdHlsZXNSZWdpc3RyeSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtUZW1wbGF0ZVJlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLnRlbXBsYXRlUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShUZW1wbGF0ZVJlZ2lzdHJ5KTtcblxuICAgICAgICAvKiogQHR5cGUge1VuaXF1ZUlkUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMudW5pcXVlSWRSZWdpc3RyeSA9IEluamVjdGlvblBvaW50Lmluc3RhbmNlKFVuaXF1ZUlkUmVnaXN0cnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNsYXNzVHlwZSByZXByZXNlbnRzIHRoZSB0ZW1wbGF0ZSBhbmQgdGhlIHN0eWxlcyBuYW1lIGlmIHRoZSBzdHlsZSBmb3IgdGhhdCBuYW1lIGlzIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIGNyZWF0ZShjbGFzc1R5cGUpe1xuICAgICAgICBpZiAoIWNsYXNzVHlwZS5URU1QTEFURV9VUkwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlIGNvbXBvbmVudCBjbGFzcyBtdXN0IGltcGxlbWVudCBzdGF0aWMgbWVtYmVyIFRFTVBMQVRFX1VSTFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGVSZWdpc3RyeS5nZXQoY2xhc3NUeXBlLm5hbWUpO1xuICAgICAgICBpZighdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcih0aGlzLnRlbXBsYXRlUmVnaXN0cnkpO1xuICAgICAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gdGVtcGxhdGUgd2FzIGZvdW5kIHdpdGggbmFtZSBcIiArIGNsYXNzVHlwZS5uYW1lKTtcblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsZW1lbnRSZWdpc3RyYXRvciA9IG5ldyBFbGVtZW50UmVnaXN0cmF0b3IodGhpcy51bmlxdWVJZFJlZ2lzdHJ5LCB0ZW1wbGF0ZUNvbXBvbmVudENvdW50ZXIrKyk7XG4gICAgICAgIG5ldyBEb21UcmVlKHRlbXBsYXRlLmdldFRlbXBsYXRlU291cmNlKCksIGVsZW1lbnRSZWdpc3RyYXRvcikubG9hZCgpO1xuXG4gICAgICAgIGlmIChjbGFzc1R5cGUuU1RZTEVTX1VSTCkge1xuICAgICAgICAgICAgdGhpcy5tb3VudFN0eWxlcyhjbGFzc1R5cGUubmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudChlbGVtZW50UmVnaXN0cmF0b3IuY29tcG9uZW50SW5kZXgsIGVsZW1lbnRSZWdpc3RyYXRvci5yb290RWxlbWVudCwgZWxlbWVudFJlZ2lzdHJhdG9yLmdldEVsZW1lbnRNYXAoKSk7XG4gICAgfVxuXG4gICAgbW91bnRTdHlsZXMobmFtZSkge1xuICAgICAgICBpZiAodGhpcy5zdHlsZXNSZWdpc3RyeS5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgQ2FudmFzU3R5bGVzLnNldFN0eWxlKG5hbWUsIHRoaXMuc3R5bGVzUmVnaXN0cnkuZ2V0KG5hbWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5sZXQgdGVtcGxhdGVDb21wb25lbnRDb3VudGVyID0gMDsiLCJpbXBvcnQgeyBUcmFpbE5vZGUgfSBmcm9tIFwiLi90cmFpbE5vZGUuanNcIjtcblxuZXhwb3J0IGNsYXNzIFRyYWlsSXRlcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSB0cmFpbE5vZGUgXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGVbXX0gdHJhaWxOb2RlUGF0aCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0cmFpbE5vZGUgPSBudWxsLCB0cmFpbE5vZGVQYXRoID0gW10pIHtcbiAgICAgICAgLyoqIEB0eXBlIHtUcmFpbE5vZGV9ICovXG4gICAgICAgIHRoaXMudHJhaWxOb2RlID0gdHJhaWxOb2RlO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VHJhaWxOb2RlW119ICovXG4gICAgICAgIHRoaXMudHJhaWxOb2RlUGF0aCA9IHRyYWlsTm9kZVBhdGg7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBUcmFpbE5vZGUgfSBmcm9tIFwiLi90cmFpbE5vZGUuanNcIjtcbmltcG9ydCB7IEhpc3RvcnkgfSBmcm9tIFwiLi9oaXN0b3J5LmpzXCI7XG5pbXBvcnQgeyBVcmxCdWlsZGVyIH0gZnJvbSBcIi4uL3V0aWwvdXJsQnVpbGRlci5qc1wiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4uL3V0aWwvdXJsLmpzXCI7XG5pbXBvcnQgeyBUcmFpbEl0ZXJhdGlvbiB9IGZyb20gXCIuL3RyYWlsSXRlcmF0aW9uLmpzXCI7XG5pbXBvcnQgeyBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJUcmFpbFByb2Nlc3NvclwiKTtcblxuZXhwb3J0IGNsYXNzIFRyYWlsUHJvY2Vzc29yIHtcblxuICAgIC8qKlxuICAgICAqIFVJIHJlZmVycyB0byB0aGUgd2ViIGFwcGxpY2F0aW9uLiBVSSBuYXZpZ2F0aW9uIG1lYW5zIGFueSBvcGVyYXRpb25cbiAgICAgKiBwZXJmb3JtZWQgd2l0aGluIHRoZSB3ZWIgYXBwIHdoaWNoIHNob3VsZCB0cmlnZ2VyIGEgbmF2aWdhdGlvbiBjaGFuZ2UuXG4gICAgICogXG4gICAgICogQSBVSSBuYXZpZ2F0aW9uIGNoYW5nZSB3aWxsIHVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IChwdXNoIGEgbmV3IHVybCBzdGF0ZSlcbiAgICAgKiBhcyB0aGlzIGRvZXMgbm90IGhhcHBlbiB0aHJvdWdoIGJyb3dzZXIgY29udHJvbHMgKGJhY2svZm9yd2FyZCBidXR0b25zL3VybCBiYXIpLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1biBcbiAgICAgKiBAcGFyYW0ge2FueX0gY3VycmVudE9iamVjdFxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSB0cmFpbE5vZGUgXG4gICAgICogQHBhcmFtIHtib29sZWFufSByZXBsYWNlQ3VycmVudFVybFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5jbHVkZVdheXBvaW50c1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgc3RhdGljIHVpTmF2aWdhdGUoZnVuLCBjdXJyZW50T2JqZWN0LCB0cmFpbE5vZGUsIHJlcGxhY2VDdXJyZW50VXJsID0gZmFsc2UsIGluY2x1ZGVXYXlwb2ludHMgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCB0cmFpbE5vZGVzUGF0aCA9IFRyYWlsUHJvY2Vzc29yLm5vZGVzUGF0aEJ5RnVuY3Rpb24oZnVuLCB0cmFpbE5vZGUpO1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKCF0cmFpbE5vZGVzUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1cnJlbnRUcmFpbCA9IFwiXCI7XG4gICAgICAgIGZvciAoY29uc3QgdHJhaWxOb2RlIG9mIHRyYWlsTm9kZXNQYXRoKSB7XG5cbiAgICAgICAgICAgIGlmICghdHJhaWxOb2RlLnRyYWlsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHJhaWxQcm9jZXNzb3IudWlOYXZpZ2F0ZTogVHJhaWxOb2RlIGluIHBhdGggaGFzIG5vIHRyYWlsIGRlZmluZWRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnRUcmFpbCArPSB0cmFpbE5vZGUudHJhaWw7XG5cbiAgICAgICAgICAgIGlmICh0cmFpbE5vZGUucHJvcGVydHkgJiYgY3VycmVudE9iamVjdFt0cmFpbE5vZGUucHJvcGVydHldKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudE9iamVjdCA9IGN1cnJlbnRPYmplY3RbdHJhaWxOb2RlLnByb3BlcnR5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFpbE5vZGUud2F5cG9pbnQpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRyYWlsTm9kZS53YXlwb2ludC5jYWxsKGN1cnJlbnRPYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGluY2x1ZGVXYXlwb2ludHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVcmxCdWlsZGVyLmNyZWF0ZSgpLndpdGhVcmwoQ29udGFpbmVyVXJsLmN1cnJlbnRVcmwoKSkud2l0aEFuY2hvcihjdXJyZW50VHJhaWwpLmJ1aWxkKCk7XG4gICAgICAgICAgICAgICAgSGlzdG9yeS5wdXNoVXJsKHVybCwgdXJsLnRvU3RyaW5nKCksIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpbmNsdWRlV2F5cG9pbnRzKSB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBVcmxCdWlsZGVyLmNyZWF0ZSgpLndpdGhVcmwoQ29udGFpbmVyVXJsLmN1cnJlbnRVcmwoKSkud2l0aEFuY2hvcihjdXJyZW50VHJhaWwpLmJ1aWxkKCk7XG4gICAgICAgICAgICBpZiAocmVwbGFjZUN1cnJlbnRVcmwpIHtcbiAgICAgICAgICAgICAgICBIaXN0b3J5LnJlcGxhY2VVcmwodXJsLCB1cmwudG9TdHJpbmcoKSwgbnVsbCk7XG4gICAgICAgICAgICB9IGVsc2UgeyAgICBcbiAgICAgICAgICAgICAgICBIaXN0b3J5LnB1c2hVcmwodXJsLCB1cmwudG9TdHJpbmcoKSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGllbnQgcmVmZXJzIHRvIHRoZSBicm93c2VyIG9yIGNvbnRhaW5lciBob3N0aW5nIHRoZSB3ZWIgYXBwbGljYXRpb24uXG4gICAgICogQSBjbGllbnQgbmF2aWdhdGlvbiBtZWFucyB0aGUgdXNlciBoYXMgcGVyZm9ybWVkIGEgbmF2aWdhdGlvbiBhY3Rpb24gZnJvbVxuICAgICAqIHRoZSBicm93c2VyIGNvbnRyb2xzIChiYWNrL2ZvcndhcmQgYnV0dG9ucy91cmwgYmFyKS5cbiAgICAgKiBcbiAgICAgKiBUaGUgbmVjZXNzYXJ5IGZ1bmN0aW9ucyBhbG9uZyB0aGUgdHJhaWwgYXJlIHRyaWdnZXJlZCB0byBicmluZyB0aGUgYXBwbGljYXRpb25cbiAgICAgKiB0byB0aGUgY29ycmVjdCBzdGF0ZS4gQnV0IHRoZSBicm93c2VyIGhpc3RvcnkgaXMgbm90IHVwZGF0ZWQgYXMgdGhpcyBuYXZpZ2F0aW9uXG4gICAgICogb3JpZ2luYXRlcyBmcm9tIHRoZSBicm93c2VyIGNvbnRyb2xzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICogQHBhcmFtIHthbnl9IGN1cnJlbnRPYmplY3RcbiAgICAgKiBAcGFyYW0ge1RyYWlsTm9kZX0gdHJhaWxOb2RlXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBzdGF0aWMgY2xpZW50TmF2aWdhdGUodXJsLCBjdXJyZW50T2JqZWN0LCB0cmFpbE5vZGUpIHtcbiAgICAgICAgY29uc3QgdHJhaWxOb2Rlc1BhdGggPSBUcmFpbFByb2Nlc3Nvci5ub2Rlc1BhdGhCeVRyYWlsKHVybC5hbmNob3IsIHRyYWlsTm9kZSk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gbnVsbDtcblxuICAgICAgICBpZiAoIXRyYWlsTm9kZXNQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHRyYWlsTm9kZSBvZiB0cmFpbE5vZGVzUGF0aCkge1xuXG4gICAgICAgICAgICBpZiAodHJhaWxOb2RlLnByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgY3VycmVudE9iamVjdCA9IGN1cnJlbnRPYmplY3RbdHJhaWxOb2RlLnByb3BlcnR5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFpbE5vZGUud2F5cG9pbnQpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRyYWlsTm9kZS53YXlwb2ludC5jYWxsKGN1cnJlbnRPYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRoZUZ1bmN0aW9uIFxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSByb290IFxuICAgICAqIEByZXR1cm5zIHtUcmFpbE5vZGVbXX1cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9kZXNQYXRoQnlGdW5jdGlvbih0aGVGdW5jdGlvbiwgcm9vdCkge1xuXG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpdGVyYXRpb24gPSBuZXcgVHJhaWxJdGVyYXRpb24ocm9vdCwgW3Jvb3RdKTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbaXRlcmF0aW9uXTtcblxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEl0ZXJhdGlvbiA9IHN0YWNrLnBvcCgpO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUuZGVzdGluYXRpb24gPT09IHRoZUZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlUGF0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHQgJiYgY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5ldyBUcmFpbEl0ZXJhdGlvbihjaGlsZCwgWy4uLmN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlUGF0aCwgY2hpbGRdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRyYWlsIFxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSByb290IFxuICAgICAqIEByZXR1cm5zIHtUcmFpbE5vZGVbXX1cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9kZXNQYXRoQnlUcmFpbCh0cmFpbCwgcm9vdCkge1xuXG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpdGVyYXRpb24gPSBuZXcgVHJhaWxJdGVyYXRpb24ocm9vdCwgW3Jvb3RdKTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbaXRlcmF0aW9uXTtcblxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEl0ZXJhdGlvbiA9IHN0YWNrLnBvcCgpO1xuXG4gICAgICAgICAgICBsZXQgY3VycmVudFRyYWlsID0gXCJcIjtcbiAgICAgICAgICAgIGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlUGF0aC5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgY3VycmVudFRyYWlsICs9IG5vZGUudHJhaWw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRUcmFpbCA9PT0gdHJhaWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dCAmJiBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3IFRyYWlsSXRlcmF0aW9uKGNoaWxkLCBbLi4uY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoLCBjaGlsZF0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG59IiwiZXhwb3J0IGNsYXNzIFN0eWxlU2VsZWN0b3Ige1xuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY2xhc3NOYW1lKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgU3RyaW5nPn0gKi9cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgKi9cbiAgICB3aXRoQXR0cmlidXRlKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IGF0dHJTdHJpbmcgPSBcIlwiO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgYXR0clN0cmluZyArPSBgXFx0JHtrZXl9OiAke3ZhbHVlfTtcXG5gO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuY2xhc3NOYW1lfSB7XFxuJHthdHRyU3RyaW5nfX1gO1xuICAgIH1cblxufSIsImltcG9ydCB7IFN0eWxlU2VsZWN0b3IgfSBmcm9tIFwiLi9zdHlsZVNlbGVjdG9yXCI7XG5cbmV4cG9ydCBjbGFzcyBTdHlsZU1lZGlhIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZWRpYSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZWRpYSkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLm1lZGlhID0gbWVkaWE7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxTdHlsZVNlbGVjdG9yPn0gKi9cbiAgICAgICAgdGhpcy5zdHlsZVNlbGVjdG9yQXJyYXkgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0eWxlU2VsZWN0b3J9IHN0eWxlU2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7U3R5bGVNZWRpYX1cbiAgICAgKi9cbiAgICB3aXRoU2VsZWN0b3Ioc3R5bGVTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLnN0eWxlU2VsZWN0b3JBcnJheS5zZXQoc3R5bGVTZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGxldCBtZWRpYVN0cmluZyA9IFwiXCI7XG4gICAgICAgIHRoaXMuc3R5bGVTZWxlY3RvckFycmF5LmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBtZWRpYVN0cmluZyArPSBgJHt2YWx1ZS50b1N0cmluZygpfVxcbmA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5tZWRpYX0ge1xcbiR7bWVkaWFTdHJpbmd9XFxufVxcbmA7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgU3R5bGVNZWRpYSB9IGZyb20gXCIuL3N0eWxlTWVkaWFcIjtcbmltcG9ydCB7IFN0eWxlU2VsZWN0b3IgfSBmcm9tIFwiLi9zdHlsZVNlbGVjdG9yXCI7XG5pbXBvcnQgeyBTdHlsZXNoZWV0IH0gZnJvbSBcIi4vc3R5bGVzaGVldFwiO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVzaGVldEJ1aWxkZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3R5bGVzaGVldEJ1aWxkZXIoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlU2VsZWN0b3JbXX0gKi9cbiAgICAgICAgdGhpcy5zdHlsZVNlbGVjdG9yQXJyYXkgPSBbXTtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlTWVkaWFbXX0gKi9cbiAgICAgICAgdGhpcy5tZWRpYUFycmF5ID0gW107XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZVNlbGVjdG9yfFN0eWxlTWVkaWF9ICovXG4gICAgICAgIHRoaXMubGFzdEFkZGVkID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlU2VsZWN0b3J8U3R5bGVNZWRpYX0gKi9cbiAgICAgICAgdGhpcy5jb250ZXh0ID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlU2VsZWN0b3J8U3R5bGVNZWRpYX0gKi9cbiAgICAgICAgdGhpcy5wYXJlbnRDb250ZXh0ID0gbnVsbDtcblxuICAgIH1cblxuICAgIG9wZW4oKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXN0QWRkZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNvbnRleHQgdG8gb3BlblwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sYXN0QWRkZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudENvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmxhc3RBZGRlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY29udGV4dCB0byBjbG9zZVwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLnBhcmVudENvbnRleHQ7XG4gICAgICAgIHRoaXMucGFyZW50Q29udGV4dCA9IG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVNlbGVjdG9yTmFtZSBcbiAgICAgKiBAcmV0dXJucyB7U3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc2VsZWN0b3Ioc3R5bGVTZWxlY3Rvck5hbWUpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IG5ldyBTdHlsZVNlbGVjdG9yKHN0eWxlU2VsZWN0b3JOYW1lKTtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZVNlbGVjdG9yQXJyYXkucHVzaChlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuY29udGV4dCBpbnN0YW5jZW9mIFN0eWxlTWVkaWEpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5zdHlsZVNlbGVjdG9yQXJyYXkucHVzaChlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgT3BlbiBjb250ZXh0IG11c3QgYmUgYSBtZWRpYSBjb250ZXh0IHdoZW4gYWRkaW5nICR7c3R5bGVTZWxlY3Rvck5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0QWRkZWQgPSBlbGVtZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtZWRpYShtZWRpYVNlbGVjdG9yKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGFkZCBtZWRpYSAke21lZGlhU2VsZWN0b3J9IGluc2lkZSBvcGVuIGNvbnRleHRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50ID0gbmV3IFN0eWxlTWVkaWEobWVkaWFTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMubWVkaWFBcnJheS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZCA9IGVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbHVlIFxuICAgICAqIEByZXR1cm5zIHtTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdHlsZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKCEodGhpcy5jb250ZXh0IGluc3RhbmNlb2YgU3R5bGVTZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gb3BlbiBzZWxlY3RvciBjb250ZXh0IHdoZW4gYWRkaW5nIHN0eWxlICR7cHJvcGVydHl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0LndpdGhBdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1N0eWxlc2hlZXR9XG4gICAgICovXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIGxldCBzdHlsZXNTdHJpbmcgPSBcIlwiO1xuICAgICAgICB0aGlzLnN0eWxlU2VsZWN0b3JBcnJheS5mb3JFYWNoKChzdHlsZVNlbGVjdG9yKSA9PiB7XG4gICAgICAgICAgICBzdHlsZXNTdHJpbmcgKz0gc3R5bGVTZWxlY3Rvci50b1N0cmluZygpICsgXCJcXG5cIjtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubWVkaWFBcnJheS5mb3JFYWNoKChzdHlsZU1lZGlhKSA9PiB7XG4gICAgICAgICAgICBzdHlsZXNTdHJpbmcgKz0gc3R5bGVNZWRpYS50b1N0cmluZygpICsgXCJcXG5cIjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgU3R5bGVzaGVldChzdHlsZXNTdHJpbmcpO1xuICAgIH1cblxufSIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgVW5pcXVlSWRSZWdpc3RyeSB9IGZyb20gXCIuL3VuaXF1ZUlkUmVnaXN0cnlcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYmFzZUVsZW1lbnRcIjtcbmltcG9ydCB7IEhUTUwgfSBmcm9tIFwiLi4vaHRtbC9odG1sXCI7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRCdWlsZGVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VW5pcXVlSWRSZWdpc3RyeX0gaWRSZWdpc3RyeVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnRCdWlsZGVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoaWRSZWdpc3RyeSkge1xuICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudEJ1aWxkZXIoaWRSZWdpc3RyeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtVbmlxdWVJZFJlZ2lzdHJ5fSBpZFJlZ2lzdHJ5XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoaWRSZWdpc3RyeSkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VW5pcXVlSWRSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy5pZFJlZ2lzdHJ5ID0gaWRSZWdpc3RyeTtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIEJhc2VFbGVtZW50Pn0gKi9cbiAgICAgICAgdGhpcy5lbGVtZW50TWFwID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMubGFzdEFkZGVkRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5jb250ZXh0RWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudFtdfSAqL1xuICAgICAgICB0aGlzLnRyYWlsID0gW107XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VuaXF1ZUlkUmVnaXN0cnl9IGlkUmVnaXN0cnlcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsIEJhc2VFbGVtZW50Pn0gZWxlbWVudE1hcFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgXG4gICAgICogQHBhcmFtIHtTdHJpbmdbXX0gYXR0cmlidXRlQXJyYXkgXG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyB0YWcoaWRSZWdpc3RyeSwgZWxlbWVudE1hcCwgdGFnLCAuLi5hdHRyaWJ1dGVBcnJheSkge1xuXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgYXR0cmlidXRlQXJyYXkuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gYXR0ci5zcGxpdChcIj1cIik7XG4gICAgICAgICAgIGF0dHJpYnV0ZU1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBIVE1MLmN1c3RvbSh0YWcsIGF0dHJpYnV0ZU1hcCk7XG5cbiAgICAgICAgYXR0cmlidXRlTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChcImlkXCIgPT09IGtleSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRNYXAuc2V0KHZhbHVlLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGlkUmVnaXN0cnkuaWRBdHRyaWJ1dGVXaXRoU3VmZml4KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgXG4gICAgICogQHBhcmFtICB7U3RyaW5nW119IGF0dHJpYnV0ZUFycmF5IFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHJvb3QodGFnLCAuLi5hdHRyaWJ1dGVBcnJheSkge1xuICAgICAgICBpZiAodGhpcy5yb290RWxlbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogUm9vdCBlbGVtZW50IGlzIGFscmVhZHkgZGVmaW5lZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IENvbXBvbmVudEJ1aWxkZXIudGFnKHRoaXMuaWRSZWdpc3RyeSwgdGhpcy5lbGVtZW50TWFwLCB0YWcsIC4uLmF0dHJpYnV0ZUFycmF5KTtcbiAgICAgICAgdGhpcy5sYXN0QWRkZWRFbGVtZW50ID0gdGhpcy5yb290RWxlbWVudDtcbiAgICAgICAgdGhpcy5jb250ZXh0RWxlbWVudCA9IHRoaXMucm9vdEVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWdOYW1lIFxuICAgICAqIEBwYXJhbSAge1N0cmluZ1tdfSBhdHRyaWJ1dGVBcnJheVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnRCdWlsZGVyfVxuICAgICAqL1xuICAgIG5vZGUodGFnTmFtZSwgLi4uYXR0cmlidXRlQXJyYXkpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBSb290IGVsZW1lbnQgaXMgbm90IGRlZmluZWQuIENhbGwgcm9vdCgpIGJlZm9yZSBhZGRpbmcgY2hpbGQgZWxlbWVudHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRyYWlsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogTm8gb3BlbiBlbGVtZW50IGNvbnRleHQgdG8gYWRkIGNoaWxkIGVsZW1lbnRzLCBjYWxsIG9wZW4oKSBiZWZvcmUgYWRkaW5nLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50ID0gQ29tcG9uZW50QnVpbGRlci50YWcodGhpcy5pZFJlZ2lzdHJ5LCB0aGlzLmVsZW1lbnRNYXAsIHRhZ05hbWUsIC4uLmF0dHJpYnV0ZUFycmF5KTtcbiAgICAgICAgdGhpcy5jb250ZXh0RWxlbWVudC5hZGRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgdGhpcy5sYXN0QWRkZWRFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudEJ1aWxkZXJ9XG4gICAgICovXG4gICAgdGV4dCh0ZXh0KSB7XG4gICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogUm9vdCBlbGVtZW50IGlzIG5vdCBkZWZpbmVkLiBDYWxsIHJvb3QoKSBiZWZvcmUgYWRkaW5nIGNoaWxkIGVsZW1lbnRzLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50cmFpbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IE5vIG9wZW4gZWxlbWVudCBjb250ZXh0IHRvIGFkZCBjaGlsZCBlbGVtZW50cywgY2FsbCBvcGVuKCkgYmVmb3JlIGFkZGluZy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0RWxlbWVudC5hZGRDaGlsZCh0ZXh0KTtcbiAgICAgICAgdGhpcy5sYXN0QWRkZWRFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBSb290IGVsZW1lbnQgaXMgbm90IGRlZmluZWQuIENhbGwgcm9vdCgpIGJlZm9yZSBhZGRpbmcgY2hpbGQgZWxlbWVudHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IFVuYWJsZSB0byBvcGVuIGxhc3QgZWxlbWVudC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50cmFpbC5wdXNoKHRoaXMuY29udGV4dEVsZW1lbnQpO1xuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50ID0gdGhpcy5sYXN0QWRkZWRFbGVtZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhaWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBObyBvcGVuIGVsZW1lbnQgY29udGV4dCB0byBjbG9zZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0RWxlbWVudCA9IHRoaXMudHJhaWwucG9wKCk7XG4gICAgICAgIHRoaXMubGFzdEFkZGVkRWxlbWVudCA9IHRoaXMuY29udGV4dEVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGJ1aWxkKCkge1xuICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudChjb21wb25lbnRCdWlsZGVyQ291bnRlcisrLCB0aGlzLnJvb3RFbGVtZW50LCB0aGlzLmVsZW1lbnRNYXApO1xuICAgIH1cbn1cblxubGV0IGNvbXBvbmVudEJ1aWxkZXJDb3VudGVyID0gMDsiLCJpbXBvcnQgeyBJbmplY3Rpb25Qb2ludCB9IGZyb20gXCJtaW5kaV92MVwiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi4vc3R5bGVzL3N0eWxlc1JlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBDb21wb25lbnRGYWN0b3J5IH0gZnJvbSBcIi4vY29tcG9uZW50RmFjdG9yeVwiO1xuaW1wb3J0IHsgVW5pcXVlSWRSZWdpc3RyeSB9IGZyb20gXCIuL3VuaXF1ZUlkUmVnaXN0cnlcIjtcbmltcG9ydCB7IENhbnZhc1N0eWxlcyB9IGZyb20gXCIuLi9jYW52YXMvY2FudmFzU3R5bGVzXCI7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi4vY29tcG9uZW50L2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgU3R5bGVzaGVldEJ1aWxkZXIgfSBmcm9tIFwiLi4vc3R5bGVzL3N0eWxlc2hlZXRCdWlsZGVyXCI7XG5pbXBvcnQgeyBDb21wb25lbnRCdWlsZGVyIH0gZnJvbSBcIi4uL2NvbXBvbmVudC9jb21wb25lbnRCdWlsZGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBJbmxpbmVDb21wb25lbnRGYWN0b3J5IGV4dGVuZHMgQ29tcG9uZW50RmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlc1JlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLnN0eWxlc1JlZ2lzdHJ5ID0gSW5qZWN0aW9uUG9pbnQuaW5zdGFuY2UoU3R5bGVzUmVnaXN0cnkpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VW5pcXVlSWRSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy51bmlxdWVJZFJlZ2lzdHJ5ID0gSW5qZWN0aW9uUG9pbnQuaW5zdGFuY2UoVW5pcXVlSWRSZWdpc3RyeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2xhc3NUeXBlIHJlcHJlc2VudHMgdGhlIGlubGluZSBjb21wb25lbnQgY2xhc3NcbiAgICAgKi9cbiAgICBjcmVhdGUoY2xhc3NUeXBlKXtcbiAgICAgICAgaWYgKCFjbGFzc1R5cGUuYnVpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIklubGluZSBjb21wb25lbnQgY2xhc3MgbXVzdCBpbXBsZW1lbnQgc3RhdGljIG1ldGhvZCBidWlsZENvbXBvbmVudCgpXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEB0eXBlIHtDb21wb25lbnR9ICovXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNsYXNzVHlwZS5idWlsZENvbXBvbmVudChDb21wb25lbnRCdWlsZGVyLmNyZWF0ZSh0aGlzLnVuaXF1ZUlkUmVnaXN0cnkpKTtcblxuICAgICAgICBpZiAoY2xhc3NUeXBlLmJ1aWxkU3R5bGVzaGVldCkge1xuICAgICAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgICAgICBjb25zdCBzdHlsZXNoZWV0ID0gY2xhc3NUeXBlLmJ1aWxkU3R5bGVzaGVldChTdHlsZXNoZWV0QnVpbGRlci5jcmVhdGUoKSk7XG5cbiAgICAgICAgICAgIENhbnZhc1N0eWxlcy5zZXRTdHlsZShjbGFzc1R5cGUubmFtZSwgc3R5bGVzaGVldCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBNaW5kaUluamVjdG9yLFxuICAgIE1pbmRpQ29uZmlnLFxuICAgIEluc3RhbmNlUG9zdENvbmZpZ1RyaWdnZXIsXG4gICAgQ29uZmlnQWNjZXNzb3IsXG4gICAgU2luZ2xldG9uQ29uZmlnLFxuICAgIFByb3RvdHlwZUNvbmZpZywgXG4gICAgQ29uZmlnIH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBBcnJheVV0aWxzLCBMb2dnZXIsIE1ldGhvZCwgU3RyaW5nVXRpbHMgfSBmcm9tICBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb250YWluZXJFdmVudCwgQ29udGFpbmVyVXJsIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50Q29uZmlnUHJvY2Vzc29yIH0gZnJvbSBcIi4vY29tcG9uZW50L2NvbXBvbmVudENvbmZpZ1Byb2Nlc3Nvci5qc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gXCIuL3RlbXBsYXRlL3RlbXBsYXRlUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFN0eWxlc1JlZ2lzdHJ5IH0gZnJvbSBcIi4vc3R5bGVzL3N0eWxlc1JlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBIaXN0b3J5IH0gZnJvbSBcIi4vbmF2aWdhdGlvbi9oaXN0b3J5LmpzXCI7XG5pbXBvcnQgeyBEaU1vZHVsZUxvYWRlciB9IGZyb20gXCIuL2xvYWRlci9kaU1vZHVsZUxvYWRlci5qc1wiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4vdXRpbC91cmwuanNcIjtcbmltcG9ydCB7IE1vZHVsZVJ1bm5lciB9IGZyb20gXCIuL21vZHVsZVJ1bm5lci5qc1wiO1xuaW1wb3J0IHsgTW9kdWxlIH0gZnJvbSBcIi4vbW9kdWxlLmpzXCI7XG5pbXBvcnQgeyBBY3RpdmVNb2R1bGVSdW5uZXIgfSBmcm9tIFwiLi9hY3RpdmVNb2R1bGVSdW5uZXIuanNcIjtcbmltcG9ydCB7IFN0YXRlTWFuYWdlciB9IGZyb20gXCIuL3N0YXRlL3N0YXRlTWFuYWdlci5qc1wiO1xuaW1wb3J0IHsgVW5pcXVlSWRSZWdpc3RyeSB9IGZyb20gXCIuL2NvbXBvbmVudC91bmlxdWVJZFJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZUNvbXBvbmVudEZhY3RvcnkgfSBmcm9tIFwiLi9jb21wb25lbnQvdGVtcGxhdGVDb21wb25lbnRGYWN0b3J5LmpzXCI7XG5pbXBvcnQgeyBNb2R1bGVMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIvbW9kdWxlTG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBUcmFpbFByb2Nlc3NvciB9IGZyb20gXCIuL25hdmlnYXRpb24vdHJhaWxQcm9jZXNzb3IuanNcIjtcbmltcG9ydCB7IElubGluZUNvbXBvbmVudEZhY3RvcnkgfSBmcm9tIFwiLi9jb21wb25lbnQvaW5saW5lQ29tcG9uZW50RmFjdG9yeS5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQXBwbGljYXRpb25cIik7XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIE1vZHVsZVJ1bm5lciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0FycmF5PE1vZHVsZUxvYWRlcj59IG1vZHVsZUxvYWRlckFycmF5IFxuICAgICAqIEBwYXJhbSB7Q29uZmlnfSBjb25maWcgXG4gICAgICogQHBhcmFtIHtBcnJheX0gd29ya2VyQXJyYXkgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobW9kdWxlTG9hZGVyQXJyYXksIGNvbmZpZyA9IG5ldyBNaW5kaUNvbmZpZygpLCB3b3JrZXJBcnJheSA9IG5ldyBBcnJheSgpKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKiogQHR5cGUge0FycmF5PE1vZHVsZUxvYWRlcj59ICovXG4gICAgICAgIHRoaXMubW9kdWxlTG9hZGVyQXJyYXkgPSBtb2R1bGVMb2FkZXJBcnJheTtcblxuICAgICAgICAvKiogQHR5cGUge01pbmRpQ29uZmlnfSAqL1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcblxuICAgICAgICAvKiogQHR5cGUge0FycmF5fSAqL1xuICAgICAgICB0aGlzLndvcmtlckFycmF5ID0gd29ya2VyQXJyYXk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgICAgICAgdGhpcy5ydW5uaW5nV29ya2VycyA9IG5ldyBBcnJheSgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TW9kdWxlfSAqL1xuICAgICAgICB0aGlzLmFjdGl2ZU1vZHVsZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5kZWZhdWx0Q29uZmlnID0gW1xuICAgICAgICAgICAgU2luZ2xldG9uQ29uZmlnLnVubmFtZWQoVGVtcGxhdGVSZWdpc3RyeSksXG4gICAgICAgICAgICBTaW5nbGV0b25Db25maWcudW5uYW1lZChTdHlsZXNSZWdpc3RyeSksXG4gICAgICAgICAgICBTaW5nbGV0b25Db25maWcudW5uYW1lZChVbmlxdWVJZFJlZ2lzdHJ5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKFRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeSksXG4gICAgICAgICAgICBTaW5nbGV0b25Db25maWcudW5uYW1lZChJbmxpbmVDb21wb25lbnRGYWN0b3J5KSxcbiAgICAgICAgICAgIFByb3RvdHlwZUNvbmZpZy51bm5hbWVkKFN0YXRlTWFuYWdlcilcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLmRlZmF1bHRDb25maWdQcm9jZXNzb3JzID0gWyBDb21wb25lbnRDb25maWdQcm9jZXNzb3IgXTtcblxuICAgICAgICB0aGlzLmRlZmF1bHRJbnN0YW5jZVByb2Nlc3NvcnMgPSBbIEluc3RhbmNlUG9zdENvbmZpZ1RyaWdnZXIgXTtcblxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgTE9HLmluZm8oXCJSdW5uaW5nIEFwcGxpY2F0aW9uXCIpO1xuICAgICAgICB0aGlzLmNvbmZpZ1xuICAgICAgICAgICAgLmFkZEFsbFR5cGVDb25maWcodGhpcy5kZWZhdWx0Q29uZmlnKVxuICAgICAgICAgICAgLmFkZEFsbENvbmZpZ1Byb2Nlc3Nvcih0aGlzLmRlZmF1bHRDb25maWdQcm9jZXNzb3JzKVxuICAgICAgICAgICAgLmFkZEFsbEluc3RhbmNlUHJvY2Vzc29yKHRoaXMuZGVmYXVsdEluc3RhbmNlUHJvY2Vzc29ycyk7XG4gICAgICAgIEFjdGl2ZU1vZHVsZVJ1bm5lci5pbnN0YW5jZSgpLnNldCh0aGlzKTtcbiAgICAgICAgQ29udGFpbmVyVXJsLmFkZFVzZXJOYXZpZ2F0ZUxpc3RlbmVyKG5ldyBNZXRob2QodGhpcy51cGRhdGUsIHRoaXMpKTtcbiAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgdGhpcy5ydW5Nb2R1bGUoSGlzdG9yeS5jdXJyZW50VXJsKCkpO1xuICAgICAgICB0aGlzLnN0YXJ0V29ya2VycygpO1xuICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7Q29udGFpbmVyRXZlbnR9IGV2ZW50XG4gICAgICovXG4gICAgdXBkYXRlKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHVybCA9IEhpc3RvcnkuY3VycmVudFVybCgpO1xuICAgICAgICBMT0cuaW5mbyhcIkFwcGxpY2F0aW9uOiB1cGRhdGUgdG8gXCIgKyB1cmwudG9TdHJpbmcoKSk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZU1vZHVsZSAmJiB0aGlzLmFjdGl2ZU1vZHVsZS50cmFpbE1hcCAmJiBTdHJpbmdVdGlscy5zdGFydHNXaXRoKHVybC5hbmNob3IsIHRoaXMuYWN0aXZlTW9kdWxlLnRyYWlsTWFwLnRyYWlsKSkge1xuICAgICAgICAgICAgVHJhaWxQcm9jZXNzb3IuY2xpZW50TmF2aWdhdGUodXJsLCB0aGlzLmFjdGl2ZU1vZHVsZSwgdGhpcy5hY3RpdmVNb2R1bGUudHJhaWxNYXApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucnVuTW9kdWxlKHVybCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBhc3luYyBydW5Nb2R1bGUodXJsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGVMb2FkZXIgPSB0aGlzLmdldE1hdGNoaW5nTW9kdWxlTG9hZGVyKHVybCk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU1vZHVsZSA9IGF3YWl0IG1vZHVsZUxvYWRlci5sb2FkKCk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU1vZHVsZS51cmwgPSB1cmw7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU1vZHVsZS5sb2FkKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVNb2R1bGUudHJhaWxNYXApIHtcbiAgICAgICAgICAgICAgICBUcmFpbFByb2Nlc3Nvci5jbGllbnROYXZpZ2F0ZSh1cmwsIHRoaXMuYWN0aXZlTW9kdWxlLCB0aGlzLmFjdGl2ZU1vZHVsZS50cmFpbE1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVNb2R1bGU7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0V29ya2VycygpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZ1dvcmtlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnO1xuICAgICAgICBjb25zdCBydW5uaW5nV29ya2VycyA9IHRoaXMucnVubmluZ1dvcmtlcnM7XG4gICAgICAgIHRoaXMud29ya2VyQXJyYXkuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IHZhbHVlKCk7XG4gICAgICAgICAgICBNaW5kaUluamVjdG9yLmluamVjdChpbnN0YW5jZSwgY29uZmlnKTtcbiAgICAgICAgICAgIEFycmF5VXRpbHMuYWRkKHJ1bm5pbmdXb3JrZXJzLCBpbnN0YW5jZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmxcbiAgICAgKiBAcmV0dXJucyB7RGlNb2R1bGVMb2FkZXJ9XG4gICAgICovXG4gICAgZ2V0TWF0Y2hpbmdNb2R1bGVMb2FkZXIodXJsKSB7XG4gICAgICAgIGxldCBmb3VuZE1vZHVsZUxvYWRlciA9IG51bGw7XG4gICAgICAgIHRoaXMubW9kdWxlTG9hZGVyQXJyYXkuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICghZm91bmRNb2R1bGVMb2FkZXIgJiYgdmFsdWUubWF0Y2hlcyh1cmwpKSB7XG4gICAgICAgICAgICAgICAgZm91bmRNb2R1bGVMb2FkZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmb3VuZE1vZHVsZUxvYWRlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgZ2xvYmFsIGFjY2VzcyB0byBkZXBlbmRlbmN5IGluamVjdGlvbiBjb25maWdcbiAgICAgKi9cbiAgICB3aW5kb3dEaUNvbmZpZygpIHtcbiAgICAgICAgd2luZG93LmRpQ29uZmlnID0gKCkgPT4ge1xuICAgICAgICAgICAgTE9HLmluZm8odGhpcy5jb25maWcuY29uZmlnRW50cmllcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgZ2xvYmFsIGFjY2VzcyB0byB0ZW1wbGF0ZSByZWdpc3RyeVxuICAgICAqL1xuICAgIHdpbmRvd1RlbXBsYXRlUmVnaXN0cnkoKSB7XG4gICAgICAgIHdpbmRvdy50ZW1wbGF0ZVJlZ2lzdHJ5ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZUNvbmZpZyA9IENvbmZpZ0FjY2Vzc29yLnR5cGVDb25maWdCeU5hbWUoVGVtcGxhdGVSZWdpc3RyeS5uYW1lLCB0aGlzLmNvbmZpZyk7XG4gICAgICAgICAgICBMT0cuaW5mbyh0eXBlQ29uZmlnLmluc3RhbmNlSG9sZGVyKCkuaW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIGdsb2JhbCBhY2Nlc3MgdG8gc3R5bGUgcmVnaXN0cnlcbiAgICAgKi9cbiAgICB3aW5kb3dTdHlsZVJlZ2lzdHJ5KCkge1xuICAgICAgICB3aW5kb3cuc3R5bGVSZWdpc3RyeSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVDb25maWcgPSBDb25maWdBY2Nlc3Nvci50eXBlQ29uZmlnQnlOYW1lKFN0eWxlc1JlZ2lzdHJ5Lm5hbWUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIExPRy5pbmZvKHR5cGVDb25maWcuaW5zdGFuY2VIb2xkZXIoKS5pbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBQcm9wZXJ0eUFjY2Vzc29yLCBMaXN0LCBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0SW5wdXRFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYWJzdHJhY3RJbnB1dEVsZW1lbnRcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIklucHV0RWxlbWVudERhdGFCaW5kaW5nXCIpO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRFbGVtZW50RGF0YUJpbmRpbmcge1xuXG4gICAgY29uc3RydWN0b3IobW9kZWwsIHZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yID0gdmFsaWRhdG9yO1xuICAgICAgICB0aGlzLnB1bGxlcnMgPSBuZXcgTGlzdCgpO1xuICAgICAgICB0aGlzLnB1c2hlcnMgPSBuZXcgTGlzdCgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsaW5rKG1vZGVsLCB2YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnB1dEVsZW1lbnREYXRhQmluZGluZyhtb2RlbCwgdmFsaWRhdG9yKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0Fic3RyYWN0SW5wdXRFbGVtZW50fSBmaWVsZCBcbiAgICAgKi9cbiAgICB0byhmaWVsZCkge1xuICAgICAgICBjb25zdCBwdWxsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtb2RlbFZhbHVlID0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCBmaWVsZC5uYW1lKTtcbiAgICAgICAgICAgIGlmIChtb2RlbFZhbHVlICE9PSBmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIFByb3BlcnR5QWNjZXNzb3Iuc2V0VmFsdWUodGhpcy5tb2RlbCwgZmllbGQubmFtZSwgZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdG9yICYmIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKXtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZpZWxkLmxpc3RlblRvKFwiY2hhbmdlXCIsIHB1bGxlciwgdGhpcyk7XG4gICAgICAgIGZpZWxkLmxpc3RlblRvKFwia2V5dXBcIiwgcHVsbGVyLCB0aGlzKTtcblxuICAgICAgICBjb25zdCBwdXNoZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtb2RlbFZhbHVlID0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCBmaWVsZC5uYW1lKTtcbiAgICAgICAgICAgIGlmIChtb2RlbFZhbHVlICE9PSBmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gbW9kZWxWYWx1ZSA/IG1vZGVsVmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdG9yICYmIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlU2lsZW50ICYmIGZpZWxkLnZhbHVlKXtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZVNpbGVudChmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNoYW5nZWRGdW5jdGlvbk5hbWUgPSBcIl9fY2hhbmdlZF9cIiArIGZpZWxkLm5hbWUucmVwbGFjZShcIi5cIixcIl9cIik7XG4gICAgICAgIGlmICghdGhpcy5tb2RlbFtjaGFuZ2VkRnVuY3Rpb25OYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5tb2RlbFtjaGFuZ2VkRnVuY3Rpb25OYW1lXSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHVsbGVycy5hZGQocHVsbGVyKTtcbiAgICAgICAgdGhpcy5wdXNoZXJzLmFkZChwdXNoZXIpO1xuXG4gICAgICAgIGxldCBtb2RlbFZhbHVlID0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCBmaWVsZC5uYW1lKTtcblxuICAgICAgICBpZiAobW9kZWxWYWx1ZSkge1xuICAgICAgICAgICAgcHVzaGVyLmNhbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgcHVsbGVyLmNhbGwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QWJzdHJhY3RJbnB1dEVsZW1lbnR9IGZpZWxkIFxuICAgICAqL1xuICAgIGFuZChmaWVsZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50byhmaWVsZCk7XG4gICAgfVxuXG4gICAgcHVsbCgpIHtcbiAgICAgICAgdGhpcy5wdWxsZXJzLmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmNhbGwocGFyZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdXNoKCkge1xuICAgICAgICB0aGlzLnB1c2hlcnMuZm9yRWFjaCgodmFsdWUsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuY2FsbChwYXJlbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgUHJveHlPYmplY3RGYWN0b3J5IHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBwcm94eSBmb3IgYW4gb2JqZWN0IHdoaWNoIGFsbG93cyBkYXRhYmluZGluZyBmcm9tIHRoZSBvYmplY3QgdG8gdGhlIGZvcm0gZWxlbWVudFxuICAgICAqIFxuICAgICAqIEB0ZW1wbGF0ZSBUXG4gICAgICogQHBhcmFtIHtUfSBvYmplY3QgXG4gICAgICogQHJldHVybnMge1R9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVByb3h5T2JqZWN0KG9iamVjdCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iamVjdCwge1xuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzdWNjZXNzID0gKHRhcmdldFtwcm9wXSA9IHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGxldCBjaGFuZ2VkRnVuY3Rpb25OYW1lID0gXCJfX2NoYW5nZWRfXCIgKyBwcm9wO1xuICAgICAgICAgICAgICAgIGxldCBjaGFuZ2VkRnVuY3Rpb24gPSB0YXJnZXRbY2hhbmdlZEZ1bmN0aW9uTmFtZV07XG4gICAgICAgICAgICAgICAgaWYoY2hhbmdlZEZ1bmN0aW9uICYmIHR5cGVvZiBjaGFuZ2VkRnVuY3Rpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYm91bmRDaGFuZ2VkRnVuY3Rpb24gPSBjaGFuZ2VkRnVuY3Rpb24uYmluZCh0YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICBib3VuZENoYW5nZWRGdW5jdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyA9PT0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBNYXAgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuLyoqIEB0eXBlIHtNYXB9ICovXG5sZXQgY29uZmlndXJlZEZ1bmN0aW9uTWFwID0gbmV3IE1hcCgpO1xuXG5leHBvcnQgY2xhc3MgQ29uZmlndXJlZEZ1bmN0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRoZUZ1bmN0aW9uXG4gICAgICovXG4gICAgc3RhdGljIGNvbmZpZ3VyZShuYW1lLCB0aGVGdW5jdGlvbikge1xuICAgICAgICBjb25maWd1cmVkRnVuY3Rpb25NYXAuc2V0KG5hbWUsIHRoZUZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZXhlY3V0ZShuYW1lLCBwYXJhbWV0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ3VyZWRGdW5jdGlvbk1hcC5nZXQobmFtZSkuY2FsbChudWxsLCBwYXJhbWV0ZXIpO1xuICAgIH1cblxufSIsImltcG9ydCB7IENvbmZpZ3VyZWRGdW5jdGlvbiB9IGZyb20gXCIuLi9jb25maWcvY29uZmlndXJlZEZ1bmN0aW9uLmpzXCI7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvc2ltcGxlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRXZlbnQge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZXZlbnQpIHtcblxuICAgICAgICAvKiogQHR5cGUge0V2ZW50fSAqL1xuICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50LnR5cGUudG9Mb3dlckNhc2UoKSA9PSBcImRyYWdzdGFydFwiKXtcbiAgICAgICAgICAgIHRoaXMuZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHtcbiAgICAgICAgdGhpcy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICBwcmV2ZW50RGVmYXVsdCgpIHtcbiAgICAgICAgdGhpcy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGdldCBmaWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQudGFyZ2V0ICYmIHRoaXMuZXZlbnQudGFyZ2V0LmZpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ldmVudC50YXJnZXQuZmlsZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZXZlbnQuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge0RhdGFUcmFuc2Zlcn0gKi9cbiAgICAgICAgICAgIGNvbnN0IGRhdGFUcmFuc2ZlciA9IHRoaXMuZXZlbnQuZGF0YVRyYW5zZmVyO1xuICAgICAgICAgICAgaWYgKGRhdGFUcmFuc2Zlci5maWxlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBldmVudCBhbmQgdGhlIGVkZ2UgeCBjb29yZGluYXRlIG9mIHRoZSBjb250YWluaW5nIG9iamVjdFxuICAgICAqL1xuICAgIGdldCBvZmZzZXRYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5vZmZzZXRYO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBldmVudCBhbmQgdGhlIGVkZ2UgeSBjb29yZGluYXRlIG9mIHRoZSBjb250YWluaW5nIG9iamVjdFxuICAgICAqL1xuICAgIGdldCBvZmZzZXRZKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50Lm9mZnNldFk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG1vdXNlIHggY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnQgcmVsYXRpdmUgdG8gdGhlIGNsaWVudCB3aW5kb3cgdmlld1xuICAgICAqL1xuICAgIGdldCBjbGllbnRYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5jbGllbnRYO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBtb3VzZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50IHJlbGF0aXZlIHRvIHRoZSBjbGllbnQgd2luZG93IHZpZXdcbiAgICAgKi9cbiAgICBnZXQgY2xpZW50WSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnQuY2xpZW50WTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U2ltcGxlRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXQgdGFyZ2V0KCkge1xuICAgICAgICBpZiAodGhpcy5ldmVudCAmJiB0aGlzLmV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIENvbmZpZ3VyZWRGdW5jdGlvbi5leGVjdXRlKFwibWFwRWxlbWVudFwiLCB0aGlzLmV2ZW50LnRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U2ltcGxlRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXQgcmVsYXRlZFRhcmdldCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQgJiYgdGhpcy5ldmVudC5yZWxhdGVkVGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlndXJlZEZ1bmN0aW9uLmV4ZWN1dGUoXCJtYXBFbGVtZW50XCIsIHRoaXMuZXZlbnQucmVsYXRlZFRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICAgZ2V0UmVsYXRlZFRhcmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50LnJlbGF0ZWRUYXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBDb25maWd1cmVkRnVuY3Rpb24uZXhlY3V0ZShcIm1hcEVsZW1lbnRcIiwgdGhpcy5ldmVudC5yZWxhdGVkVGFyZ2V0KS5nZXRBdHRyaWJ1dGVWYWx1ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgdGFyZ2V0VmFsdWUoKSB7XG4gICAgICAgIGlmKHRoaXMudGFyZ2V0KSB7IFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldCBrZXlDb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5rZXlDb2RlO1xuICAgIH1cblxuICAgIGlzS2V5Q29kZShjb2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50LmtleUNvZGUgPT09IGNvZGU7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuLyoqXG4gKiBPYmplY3QgRnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGlmIHRoZSBmaWx0ZXIgZnVuY3Rpb24gcmV0dXJucyB0cnVlXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEZpbHRlcmVkTWV0aG9kIGV4dGVuZHMgTWV0aG9kIHtcblxuICAgIC8qKlxuICAgICAqIENvbnRydWN0b3JcbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gbWV0aG9kIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRoZUZpbHRlciBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXRob2QsIGZpbHRlcil7XG4gICAgICAgIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICB9XG5cbiAgICBjYWxsKHBhcmFtcyl7XG4gICAgICAgIGlmKHRoaXMuZmlsdGVyICYmIHRoaXMuZmlsdGVyLmNhbGwodGhpcyxwYXJhbXMpKSB7XG4gICAgICAgICAgICB0aGlzLm1ldGhvZC5jYWxsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBNZXRob2QsIE1hcCwgTGlzdCwgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJFdmVudE1hbmFnZXJcIik7XG5cbi8qKlxuICogRXZlbnRNYW5hZ2VyXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKiBAdHlwZSBNYXA8TGlzdDxNZXRob2Q+PiAqL1xuICAgICAgICB0aGlzLmxpc3RlbmVyTWFwID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0T2JqZWN0XG4gICAgICogQHJldHVybnMge0V2ZW50TWFuYWdlcn1cbiAgICAgKi9cbiAgICBsaXN0ZW5UbyhldmVudFR5cGUsIGxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHRPYmplY3QsIGV4cGxvZGVBcnJheVBhcmFtcyA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgTWV0aG9kKGxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHRPYmplY3QsIGV4cGxvZGVBcnJheVBhcmFtcyk7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lck1hcC5jb250YWlucyhldmVudFR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyTWFwLnNldChldmVudFR5cGUsIG5ldyBMaXN0KCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJNYXAuZ2V0KGV2ZW50VHlwZSkuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUV2ZW50VHlwZSBcbiAgICAgKiBAcGFyYW0ge0V2ZW50TWFuYWdlcn0gZGVzdGluYXRpb25FdmVudE1hbmFnZXIgXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc3RpbmF0aW9uRXZlbnRUeXBlIFxuICAgICAqIEBwYXJhbSB7YW55fSBjdXN0b21QYXJhbWV0ZXJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnRNYW5hZ2VyfVxuICAgICAqL1xuICAgIHJvdXRlKHNvdXJjZUV2ZW50VHlwZSwgZGVzdGluYXRpb25FdmVudE1hbmFnZXIsIGRlc3RpbmF0aW9uRXZlbnRUeXBlLCBjdXN0b21QYXJhbWV0ZXIgPSBudWxsKSB7XG4gICAgICAgIHRoaXMubGlzdGVuVG8oc291cmNlRXZlbnRUeXBlLCAoZGVmYXVsdFBhcmFtZXRlcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWxsUGFyYW1ldGVycyA9IEFycmF5LmlzQXJyYXkoZGVmYXVsdFBhcmFtZXRlcikgPyBkZWZhdWx0UGFyYW1ldGVyIDogW2RlZmF1bHRQYXJhbWV0ZXJdO1xuICAgICAgICAgICAgaWYgKGN1c3RvbVBhcmFtZXRlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFsbFBhcmFtZXRlcnMucHVzaChjdXN0b21QYXJhbWV0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlc3RpbmF0aW9uRXZlbnRNYW5hZ2VyLnRyaWdnZXIoZGVzdGluYXRpb25FdmVudFR5cGUsIGFsbFBhcmFtZXRlcnMpO1xuICAgICAgICB9LCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgXG4gICAgICogQHBhcmFtIHtBcnJheXxhbnl9IHBhcmFtZXRlciBcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XG4gICAgICovXG4gICAgYXN5bmMgdHJpZ2dlcihldmVudFR5cGUsIHBhcmFtZXRlcikge1xuICAgICAgICBpZiAoIWV2ZW50VHlwZSkge1xuICAgICAgICAgICAgTE9HLmVycm9yKFwiRXZlbnQgdHlwZSBpcyB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyTWFwLmNvbnRhaW5zKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzdWx0QXJyYXkgPSBbXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lck1hcC5nZXQoZXZlbnRUeXBlKS5mb3JFYWNoKChsaXN0ZW5lciwgcGFyZW50KSA9PiB7XG4gICAgICAgICAgICByZXN1bHRBcnJheS5wdXNoKGxpc3RlbmVyLmNhbGwocGFyYW1ldGVyKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHRBcnJheS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRBcnJheVswXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0QXJyYXkpO1xuICAgIH1cblxufSIsImltcG9ydCB7IFN0eWxlTWVkaWEgfSBmcm9tIFwiLi9zdHlsZU1lZGlhLmpzXCI7XG5pbXBvcnQgeyBTdHlsZVNlbGVjdG9yIH0gZnJvbSBcIi4vc3R5bGVTZWxlY3Rvci5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzaGVldEJ1aWxkZXIgfSBmcm9tIFwiLi9zdHlsZXNoZWV0QnVpbGRlci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQ3NzM1N0eWxlc2hlZXRCdWlsZGVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZShzdHlsZXNoZWV0QnVpbGRlciA9IFN0eWxlc2hlZXRCdWlsZGVyLmNyZWF0ZSgpKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzM1N0eWxlc2hlZXRCdWlsZGVyKHN0eWxlc2hlZXRCdWlsZGVyKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihzdHlsZXNoZWV0QnVpbGRlciA9IFN0eWxlc2hlZXRCdWlsZGVyLmNyZWF0ZSgpKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZXNoZWV0QnVpbGRlcn0gKi9cbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlciA9IHN0eWxlc2hlZXRCdWlsZGVyO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY29udGV4dCBpbnN0YW5jZW9mIFN0eWxlU2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5vcGVuKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtaW5XaWR0aCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWF4V2lkdGggXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBtZWRpYShtaW5XaWR0aCwgbWF4V2lkdGgsIHBvaW50ZXIgPSBudWxsLCBob3ZlciA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY29udGV4dCBpbnN0YW5jZW9mIFN0eWxlU2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jb250ZXh0IGluc3RhbmNlb2YgU3R5bGVNZWRpYSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgbWVkaWFRdWVyeSA9IFwiQG1lZGlhIFwiO1xuICAgICAgICBsZXQgaGFzQ29uZGl0aW9uID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKG1pbldpZHRoKSB7XG4gICAgICAgICAgICBtZWRpYVF1ZXJ5ICs9IGAobWluLXdpZHRoOiAke21pbldpZHRofSlgO1xuICAgICAgICAgICAgaGFzQ29uZGl0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXhXaWR0aCkge1xuICAgICAgICAgICAgaWYgKGhhc0NvbmRpdGlvbikgeyBtZWRpYVF1ZXJ5ICs9IFwiIGFuZCBcIjsgfVxuICAgICAgICAgICAgbWVkaWFRdWVyeSArPSBgKG1heC13aWR0aDogJHttYXhXaWR0aH0pYDtcbiAgICAgICAgICAgIGhhc0NvbmRpdGlvbiA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9pbnRlcikge1xuICAgICAgICAgICAgaWYgKGhhc0NvbmRpdGlvbikgeyBtZWRpYVF1ZXJ5ICs9IFwiIGFuZCBcIjsgfVxuICAgICAgICAgICAgbWVkaWFRdWVyeSArPSBgKHBvaW50ZXI6ICR7cG9pbnRlcn0pYDtcbiAgICAgICAgICAgIGhhc0NvbmRpdGlvbiA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaG92ZXIpIHtcbiAgICAgICAgICAgIGlmIChoYXNDb25kaXRpb24pIHsgbWVkaWFRdWVyeSArPSBcIiBhbmQgXCI7IH1cbiAgICAgICAgICAgIG1lZGlhUXVlcnkgKz0gYChob3ZlcjogJHtob3Zlcn0pYDtcbiAgICAgICAgICAgIGhhc0NvbmRpdGlvbiA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLm1lZGlhKG1lZGlhUXVlcnkpO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLm9wZW4oKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGN1cnNvciBFLmcuIFwicG9pbnRlclwiLCBcImRlZmF1bHRcIiwgXCJ0ZXh0XCIsIFwibW92ZVwiLCBcIm5vdC1hbGxvd2VkXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGN1cnNvcihjdXJzb3IpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImN1cnNvclwiLCBjdXJzb3IpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29udGVudCBFLmcuIFwiJydcIiwgXCInSGVsbG8nXCIsIFwidXJsKGltYWdlLnBuZylcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovICBcbiAgICBjb250ZW50KGNvbnRlbnQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImNvbnRlbnRcIiwgY29udGVudCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB3aWR0aCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpZHRoKHdpZHRoKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJ3aWR0aFwiLCB3aWR0aCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtaW5XaWR0aCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1pbldpZHRoKG1pbldpZHRoKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtaW4td2lkdGhcIiwgbWluV2lkdGgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWF4V2lkdGggXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBtYXhXaWR0aChtYXhXaWR0aCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwibWF4LXdpZHRoXCIsIG1heFdpZHRoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGhlaWdodCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGhlaWdodChoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImhlaWdodFwiLCBoZWlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWluSGVpZ2h0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbWluSGVpZ2h0KG1pbkhlaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwibWluLWhlaWdodFwiLCBtaW5IZWlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1heEhlaWdodCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1heEhlaWdodChtYXhIZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1heC1oZWlnaHRcIiwgbWF4SGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHpJbmRleCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHpJbmRleCh6SW5kZXgpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInotaW5kZXhcIiwgekluZGV4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGxpbmVIZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuXG4gICAgbGluZUhlaWdodChsaW5lSGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJsaW5lLWhlaWdodFwiLCBsaW5lSGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZvbnRTaXplXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBmb250U2l6ZShmb250U2l6ZSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZm9udC1zaXplXCIsIGZvbnRTaXplKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZvbnRXZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGZvbnRXZWlnaHQoZm9udFdlaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZm9udC13ZWlnaHRcIiwgZm9udFdlaWdodCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmb250RmFtaWx5XG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBmb250RmFtaWx5KGZvbnRGYW1pbHkpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImZvbnQtZmFtaWx5XCIsIGZvbnRGYW1pbHkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sb3JcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGNvbG9yKGNvbG9yKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJjb2xvclwiLCBjb2xvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0QWxpZ24gRS5nLiBcImxlZnRcIiwgXCJyaWdodFwiLCBcImNlbnRlclwiLCBcImp1c3RpZnlcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgdGV4dEFsaWduKHRleHRBbGlnbikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidGV4dC1hbGlnblwiLCB0ZXh0QWxpZ24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2ZXJ0aWNhbEFsaWduKHZlcnRpY2FsQWxpZ24pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInZlcnRpY2FsLWFsaWduXCIsIHZlcnRpY2FsQWxpZ24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB1c2VyU2VsZWN0KHVzZXJTZWxlY3QpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInVzZXItc2VsZWN0XCIsIHVzZXJTZWxlY3QpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdyBcbiAgICAgKiBHcm93cyByZWxhdGl2ZSB0byB0aGUgb3RoZXIgZmxleCBpdGVtcyBpbiB0aGUgY29udGFpbmVyIHdoZW4gdGhlcmUgaXMgZXh0cmEgc3BhY2UuXG4gICAgICogRS5nLiBncm93IG9mIDEgdnMgZ3JvdyBvZiAyLCB0aGUgc2Vjb25kIGl0ZW0gd2lsbCBncm93IHR3aWNlIGFzIG11Y2guXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNocmluayBcbiAgICAgKiBTaHJpbmtzIHJlbGF0aXZlIHRvIHRoZSBvdGhlciBmbGV4IGl0ZW1zIGluIHRoZSBjb250YWluZXIgd2hlbiBub3QgZW5vdWdoIHNwYWNlLlxuICAgICAqIEUuZy4gc2hyaW5rIG9mIDEgdnMgc2hyaW5rIG9mIDIsIHRoZSBzZWNvbmQgaXRlbSB3aWxsIHNocmluayB0d2ljZSBhcyBtdWNoLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBiYXNpcyBcbiAgICAgKiBJbml0aWFsIG1haW4gc2l6ZS4gRS5nIFwiMTAwcHhcIiwgXCIyMCVcIiwgXCJhdXRvXCIuIERlZmF1bHQgdmFsdWUgaXMgXCJhdXRvXCIsXG4gICAgICogc2l6ZWQgYWNjb3JkaW5nIHRvIGl0cyBjb250ZW50LiBJZiBcIjBcIiwgc2l6ZWQgYmFzZWQgb24gZ3JvdyBhbmQgc2hyaW5rLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZmxleChncm93LCBzaHJpbmssIGJhc2lzKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYCR7Z3Jvd30gJHtzaHJpbmt9ICR7YmFzaXN9YDtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImZsZXhcIiwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIEUuZyBcInJvd1wiLCBcImNvbHVtblwiLCBcInJvdy1yZXZlcnNlXCIsIFwiY29sdW1uLXJldmVyc2VcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZmxleERpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImZsZXgtZGlyZWN0aW9uXCIsIGRpcmVjdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmbG93IEUuZy4gXCJyb3cgbm93cmFwXCIsIFwiY29sdW1uIHdyYXBcIiwgXCJyb3ctcmV2ZXJzZSB3cmFwLXJldmVyc2VcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZmxleEZsb3coZmxvdykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZmxleC1mbG93XCIsIGZsb3cpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnYXAoZ2FwKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJnYXBcIiwgZ2FwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbHVtbnNcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnMoY29sdW1ucykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zXCIsIGNvbHVtbnMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcm93c1xuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZ3JpZFRlbXBsYXRlUm93cyhyb3dzKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJncmlkLXRlbXBsYXRlLXJvd3NcIiwgcm93cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2x1bW5cbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGdyaWRDb2x1bW4oY29sdW1uKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJncmlkLWNvbHVtblwiLCBjb2x1bW4pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcm93XG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBncmlkUm93KHJvdykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZ3JpZC1yb3dcIiwgcm93KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFsaWduSXRlbXMgRS5nLiBcInN0cmV0Y2hcIiwgXCJjZW50ZXJcIiwgXCJmbGV4LXN0YXJ0XCIsIFwiZmxleC1lbmRcIiwgXCJiYXNlbGluZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBhbGlnbkl0ZW1zKGFsaWduSXRlbXMpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImFsaWduLWl0ZW1zXCIsIGFsaWduSXRlbXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gRS5nLiBcInN0YXRpY1wiLCBcInJlbGF0aXZlXCIsIFwiYWJzb2x1dGVcIiwgXCJmaXhlZFwiLCBcInN0aWNreVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBwb3NpdGlvbihwb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicG9zaXRpb25cIiwgcG9zaXRpb24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYm90dG9tIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYm90dG9tKGJvdHRvbSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYm90dG9tXCIsIGJvdHRvbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmlnaHQgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICByaWdodChyaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicmlnaHRcIiwgcmlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdG9wIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgdG9wKHRvcCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidG9wXCIsIHRvcCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBsZWZ0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbGVmdChsZWZ0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJsZWZ0XCIsIGxlZnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlzcGxheSBFLmcuIFwiYmxvY2tcIiwgXCJpbmxpbmUtYmxvY2tcIiwgXCJmbGV4XCIsIFwiaW5saW5lLWZsZXhcIiwgXCJncmlkXCIsIFwiaW5saW5lLWdyaWRcIiwgXCJub25lXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGRpc3BsYXkoZGlzcGxheSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZGlzcGxheVwiLCBkaXNwbGF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZpc2liaWxpdHkgRS5nLiBcInZpc2libGVcIiwgXCJoaWRkZW5cIiwgXCJjb2xsYXBzZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICB2aXNpYmlsaXR5KHZpc2liaWxpdHkpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInZpc2liaWxpdHlcIiwgdmlzaWJpbGl0eSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0b3AgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJpZ2h0IFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBib3R0b20gXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGxlZnQgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBwYWRkaW5nKHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xuICAgICAgICBpZiAodG9wICYmIHJpZ2h0ICYmIGJvdHRvbSAmJiBsZWZ0KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGAke3RvcH0gJHtyaWdodH0gJHtib3R0b219ICR7bGVmdH1gO1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmdcIiwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmctdG9wXCIsIHRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicGFkZGluZy1yaWdodFwiLCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvdHRvbSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmctYm90dG9tXCIsIGJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlZnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJwYWRkaW5nLWxlZnRcIiwgbGVmdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRvcCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmlnaHQgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJvdHRvbSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbGVmdCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1hcmdpbih0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQpIHtcbiAgICAgICAgaWYgKHRvcCAmJiByaWdodCAmJiBib3R0b20gJiYgbGVmdCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBgJHt0b3B9ICR7cmlnaHR9ICR7Ym90dG9tfSAke2xlZnR9YDtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW5cIiwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1hcmdpbi10b3BcIiwgdG9wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW4tcmlnaHRcIiwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib3R0b20pIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW4tYm90dG9tXCIsIGJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlZnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXJnaW4tbGVmdFwiLCBsZWZ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gd2lkdGhcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sb3JcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJvcmRlcih3aWR0aCwgc3R5bGUsIGNvbG9yKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYCR7d2lkdGh9ICR7c3R5bGV9ICR7Y29sb3J9YDtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJvcmRlclwiLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByYWRpdXNcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJvcmRlclJhZGl1cyhyYWRpdXMpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJvcmRlci1yYWRpdXNcIiwgcmFkaXVzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZENvbG9yKGNvbG9yKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJhY2tncm91bmRcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJhY2tncm91bmQoYmFja2dyb3VuZCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYmFja2dyb3VuZFwiLCBiYWNrZ3JvdW5kKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJhY2tncm91bmRQb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZFBvc2l0aW9uKGJhY2tncm91bmRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYmFja2dyb3VuZC1wb3NpdGlvblwiLCBiYWNrZ3JvdW5kUG9zaXRpb24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZFNpemVcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJhY2tncm91bmRTaXplKGJhY2tncm91bmRTaXplKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLXNpemVcIiwgYmFja2dyb3VuZFNpemUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZENsaXAgRS5nLiBcImJvcmRlci1ib3hcIiwgXCJwYWRkaW5nLWJveFwiLCBcImNvbnRlbnQtYm94XCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJhY2tncm91bmRDbGlwKGJhY2tncm91bmRDbGlwKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLWNsaXBcIiwgYmFja2dyb3VuZENsaXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZEltYWdlIEUuZy4gXCJ1cmwoaW1hZ2UucG5nKVwiLCBcIm5vbmVcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZEltYWdlKGJhY2tncm91bmRJbWFnZSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBiYWNrZ3JvdW5kSW1hZ2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZFJlcGVhdCBFLmcuIFwicmVwZWF0XCIsIFwibm8tcmVwZWF0XCIsIFwicmVwZWF0LXhcIiwgXCJyZXBlYXQteVwiLCBcInNwYWNlXCIsIFwicm91bmRcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZFJlcGVhdChiYWNrZ3JvdW5kUmVwZWF0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLXJlcGVhdFwiLCBiYWNrZ3JvdW5kUmVwZWF0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFwcGVhcmFuY2UgRS5nLiBcIm5vbmVcIiwgXCJhdXRvXCIsIFwiYnV0dG9uXCIsIFwidGV4dGZpZWxkXCIsIFwibWVudWxpc3RcIiwgXCJzZWFyY2hmaWVsZFwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBhcHBlYXJhbmNlKGFwcGVhcmFuY2UpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImFwcGVhcmFuY2VcIiwgYXBwZWFyYW5jZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcGFjaXR5IEUuZy4gXCIwXCIsIFwiMC41XCIsIFwiMVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBvcGFjaXR5KG9wYWNpdHkpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm9wYWNpdHlcIiwgb3BhY2l0eSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBqdXN0aWZ5Q29udGVudCBFLmcuIFwiZmxleC1zdGFydFwiLCBcImZsZXgtZW5kXCIsIFwiY2VudGVyXCIsIFwic3BhY2UtYmV0d2VlblwiLCBcInNwYWNlLWFyb3VuZFwiLCBcInNwYWNlLWV2ZW5seVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBqdXN0aWZ5Q29udGVudChqdXN0aWZ5Q29udGVudCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwianVzdGlmeS1jb250ZW50XCIsIGp1c3RpZnlDb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFsaWduU2VsZiBFLmcuIFwiYXV0b1wiLCBcInN0cmV0Y2hcIiwgXCJjZW50ZXJcIiwgXCJmbGV4LXN0YXJ0XCIsIFwiZmxleC1lbmRcIiwgXCJiYXNlbGluZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBhbGlnblNlbGYoYWxpZ25TZWxmKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJhbGlnbi1zZWxmXCIsIGFsaWduU2VsZik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvdmVyZmxvd1ggRS5nLiBcInZpc2libGVcIiwgXCJoaWRkZW5cIiwgXCJzY3JvbGxcIiwgXCJhdXRvXCJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3ZlcmZsb3dZIEUuZy4gXCJ2aXNpYmxlXCIsIFwiaGlkZGVuXCIsIFwic2Nyb2xsXCIsIFwiYXV0b1wiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBvdmVyZmxvdyhvdmVyZmxvd1gsIG92ZXJmbG93WSkge1xuICAgICAgICBpZiAob3ZlcmZsb3dYKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwib3ZlcmZsb3cteFwiLCBvdmVyZmxvd1gpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdmVyZmxvd1kpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJvdmVyZmxvdy15XCIsIG92ZXJmbG93WSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJveFNpemluZyBFLmcuIFwiY29udGVudC1ib3hcIiwgXCJib3JkZXItYm94XCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJveFNpemluZyhib3hTaXppbmcpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJveC1zaXppbmdcIiwgYm94U2l6aW5nKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9mZnNldFggXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9mZnNldFkgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJsdXJSYWRpdXNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3ByZWFkUmFkaXVzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBib3hTaGFkb3cob2Zmc2V0WCwgb2Zmc2V0WSwgYmx1clJhZGl1cywgc3ByZWFkUmFkaXVzLCBjb2xvcikge1xuICAgICAgICBpZiAoYmx1clJhZGl1cyAmJiBzcHJlYWRSYWRpdXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYCR7b2Zmc2V0WH0gJHtvZmZzZXRZfSAke2JsdXJSYWRpdXN9ICR7c3ByZWFkUmFkaXVzfSAke2NvbG9yfWA7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYm94LXNoYWRvd1wiLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmx1clJhZGl1cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBgJHtvZmZzZXRYfSAke29mZnNldFl9ICR7Ymx1clJhZGl1c30gJHtjb2xvcn1gO1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJveC1zaGFkb3dcIiwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBgJHtvZmZzZXRYfSAke29mZnNldFl9ICR7Y29sb3J9YDtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJib3gtc2hhZG93XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gey4uLlN0cmluZ1tdfSB0cmFuc2l0aW9ucyBFLmcuIFtcInRyYW5zZm9ybVwiLCBcIi4zc1wiLCBudWxsLCBcImVhc2UtaW4tb3V0XCJdLCBbXCJvcGFjaXR5XCIsIFwiLjJzXCJdXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICB0cmFuc2l0aW9uKC4uLnRyYW5zaXRpb25zKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25WYWx1ZXMgPSB0cmFuc2l0aW9ucy5tYXAodHJhbnNpdGlvbiA9PiB7XG4gICAgICAgICAgICBjb25zdCBbcHJvcGVydHksIGR1cmF0aW9uLCBkZWxheSwgdGltaW5nRnVuY3Rpb25dID0gdHJhbnNpdGlvbjtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IGAke3Byb3BlcnR5fSAke2R1cmF0aW9ufWA7XG4gICAgICAgICAgICBpZiAodGltaW5nRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSBgICR7dGltaW5nRnVuY3Rpb259YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkZWxheSkge1xuICAgICAgICAgICAgICAgIHZhbHVlICs9IGAgJHtkZWxheX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInRyYW5zaXRpb25cIiwgdHJhbnNpdGlvblZhbHVlcy5qb2luKFwiLCBcIikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNmb3JtIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgdHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybU9yaWdpbih0cmFuc2Zvcm1PcmlnaW4pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgdHJhbnNmb3JtT3JpZ2luKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLmNvbnRleHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY2xvc2UoKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuYnVpbGQoKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMaXN0LCBNYXAsIE1hcFV0aWxzLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudFwiO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVBY2Nlc3NvciB7XG4gICAgXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Jhc2VFbGVtZW50fVxuICAgICAqIEByZXR1cm4ge1N0eWxlQWNjZXNzb3J9XG4gICAgICovXG4gICAgc3RhdGljIGZyb20oYmFzZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHlsZUFjY2Vzc29yKGJhc2VFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBiYXNlRWxlbWVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihiYXNlRWxlbWVudCkge1xuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmJhc2VFbGVtZW50ID0gYmFzZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJzdHlsZVwiLCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlTmFtZSBcbiAgICAgKi9cbiAgICByZW1vdmUoc3R5bGVOYW1lKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgaWYgKGN1cnJlbnRTdHlsZU1hcC5jb250YWlucyhzdHlsZU5hbWUpKSB7XG4gICAgICAgICAgICBjdXJyZW50U3R5bGVNYXAucmVtb3ZlKHN0eWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIsIE1hcFV0aWxzLnRvU3RyaW5nKGN1cnJlbnRTdHlsZU1hcCwgXCI6XCIsIFwiO1wiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZU5hbWUgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlVmFsdWUgXG4gICAgICovXG4gICAgc2V0KHN0eWxlTmFtZSwgc3R5bGVWYWx1ZSkge1xuICAgICAgICBjb25zdCBjdXJyZW50U3R5bGVNYXAgPSB0aGlzLnN0eWxlc0FzTWFwKHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJzdHlsZVwiKSk7XG4gICAgICAgIGN1cnJlbnRTdHlsZU1hcC5zZXQoc3R5bGVOYW1lLCBzdHlsZVZhbHVlKTtcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIsIE1hcFV0aWxzLnRvU3RyaW5nKGN1cnJlbnRTdHlsZU1hcCwgXCI6XCIsIFwiO1wiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZU5hbWUgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlVmFsdWUgXG4gICAgICovXG4gICAgaXMoc3R5bGVOYW1lLCBzdHlsZVZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLm5vbk51bGxFcXVhbHMoY3VycmVudFN0eWxlTWFwLmdldChzdHlsZU5hbWUpLCBzdHlsZVZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlTmFtZSBcbiAgICAgKi9cbiAgICBleGlzdHMoc3R5bGVOYW1lKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdHlsZU1hcC5jb250YWlucyhzdHlsZU5hbWUpO1xuICAgIH1cblxuICAgIHN0eWxlc0FzTWFwKHN0eWxlcykge1xuICAgICAgICBpZiAoIXN0eWxlcyB8fCBzdHlsZXMuaW5kZXhPZihcIjpcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZVBhaXJMaXN0ID0gbmV3IExpc3QoU3RyaW5nVXRpbHMudG9BcnJheShzdHlsZXMsIFwiO1wiKSk7XG4gICAgICAgIGN1cnJlbnRTdHlsZVBhaXJMaXN0LmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUuaW5kZXhPZihcIjpcIikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRLZXkgPSB2YWx1ZS5zcGxpdChcIjpcIilbMF0udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRWYWx1ZSA9IHZhbHVlLnNwbGl0KFwiOlwiKVsxXS50cmltKCk7XG4gICAgICAgICAgICBjdXJyZW50U3R5bGVNYXAuc2V0KHJlc29sdmVkS2V5LCByZXNvbHZlZFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdHlsZU1hcDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBBcnJheVV0aWxzLCBMaXN0LCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudFwiO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVTZWxlY3RvckFjY2Vzc29yIHtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybiB7U3R5bGVTZWxlY3RvckFjY2Vzc29yfVxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tKGJhc2VFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgU3R5bGVTZWxlY3RvckFjY2Vzc29yKGJhc2VFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBiYXNlRWxlbWVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihiYXNlRWxlbWVudCkge1xuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmJhc2VFbGVtZW50ID0gYmFzZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIFxuICAgICAqL1xuICAgIHRvZ2dsZShjc3NDbGFzcykge1xuICAgICAgICBsZXQgY3VycmVudENsYXNzID0gdGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzQXJyYXkgPSBTdHJpbmdVdGlscy50b0FycmF5KGN1cnJlbnRDbGFzcywgXCIgXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzTGlzdCA9IG5ldyBMaXN0KGN1cnJlbnRDbGFzc0FycmF5KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjdXJyZW50Q2xhc3NMaXN0LmNvbnRhaW5zKGNzc0NsYXNzKSkge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJhc2VFbGVtZW50LnNldEF0dHJpYnV0ZVZhbHVlKFwiY2xhc3NcIiwgQXJyYXlVdGlscy50b1N0cmluZyhjdXJyZW50Q2xhc3NMaXN0LmdldEFycmF5KCksIFwiIFwiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjc3NDbGFzcyBcbiAgICAgKi9cbiAgICBlbmFibGUoY3NzQ2xhc3MpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzcyA9IHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0FycmF5ID0gU3RyaW5nVXRpbHMudG9BcnJheShjdXJyZW50Q2xhc3MsIFwiIFwiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0xpc3QgPSBuZXcgTGlzdChjdXJyZW50Q2xhc3NBcnJheSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWN1cnJlbnRDbGFzc0xpc3QuY29udGFpbnMoY3NzQ2xhc3MpKSB7XG4gICAgICAgICAgICBjdXJyZW50Q2xhc3NMaXN0LmFkZChjc3NDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBBcnJheVV0aWxzLnRvU3RyaW5nKGN1cnJlbnRDbGFzc0xpc3QuZ2V0QXJyYXkoKSwgXCIgXCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIFxuICAgICAqL1xuICAgIGRpc2FibGUoY3NzQ2xhc3MpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzcyA9IHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0FycmF5ID0gU3RyaW5nVXRpbHMudG9BcnJheShjdXJyZW50Q2xhc3MsIFwiIFwiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0xpc3QgPSBuZXcgTGlzdChjdXJyZW50Q2xhc3NBcnJheSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoY3VycmVudENsYXNzTGlzdC5jb250YWlucyhjc3NDbGFzcykpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QucmVtb3ZlKGNzc0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBBcnJheVV0aWxzLnRvU3RyaW5nKGN1cnJlbnRDbGFzc0xpc3QuZ2V0QXJyYXkoKSwgXCIgXCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzUmVtb3ZhbFByZWZpeCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzQ2xhc3NcbiAgICAgKi9cbiAgICByZXBsYWNlKGNzc0NsYXNzUmVtb3ZhbFByZWZpeCwgY3NzQ2xhc3MpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzcyA9IHRoaXMuYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0FycmF5ID0gU3RyaW5nVXRpbHMudG9BcnJheShjdXJyZW50Q2xhc3MsIFwiIFwiKTtcbiAgICAgICAgbGV0IGN1cnJlbnRDbGFzc0xpc3QgPSBuZXcgTGlzdChjdXJyZW50Q2xhc3NBcnJheSk7XG4gICAgICAgIGxldCB0b1JlbW92ZUFycmF5ID0gW107XG5cbiAgICAgICAgaWYgKCFTdHJpbmdVdGlscy5pc0JsYW5rKGNzc0NsYXNzUmVtb3ZhbFByZWZpeCkpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUuc3RhcnRzV2l0aChjc3NDbGFzc1JlbW92YWxQcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvUmVtb3ZlQXJyYXkucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0b1JlbW92ZUFycmF5LmZvckVhY2goKHRvUmVtb3ZlVmFsdWUpID0+IHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QucmVtb3ZlKHRvUmVtb3ZlVmFsdWUpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGN1cnJlbnRDbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIsIEFycmF5VXRpbHMudG9TdHJpbmcoY3VycmVudENsYXNzTGlzdC5nZXRBcnJheSgpLCBcIiBcIikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBcblxufSIsImltcG9ydCB7IE1hcCwgTG9nZ2VyLCBTdHJpbmdVdGlscywgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDbGllbnQgfSBmcm9tIFwiLi4vY2xpZW50L2NsaWVudC5qc1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyRG93bmxvYWQsIENvbnRhaW5lckh0dHBSZXNwb25zZSwgQ29udGFpbmVyVXBsb2FkRGF0YSB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcblxuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiSHR0cENhbGxCdWlsZGVyXCIpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwQ2FsbEJ1aWxkZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih1cmwpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYXV0aG9yaXphdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMuc3VjY2Vzc01hcHBpbmdNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMuZmFpbE1hcHBpbmdNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5lcnJvck1hcHBpbmdGdW5jdGlvbiA9IChlcnJvcikgPT4geyByZXR1cm4gZXJyb3I7IH07XG5cbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSA9IDQwMDA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIHRoaXMucmVzcG9uc2VUaW1lb3V0VmFsdWUgPSA0MDAwO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWV0aG9kfSAqL1xuICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tNZXRob2QgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgICAgICAgdGhpcy5kb3dubG9hZFJlc3BvbnNlID0gZmFsc2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFxuICAgICAqIEByZXR1cm5zIHtIdHRwQ2FsbEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3RhdGljIG5ld0luc3RhbmNlKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IEh0dHBDYWxsQnVpbGRlcih1cmwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcHBlckZ1bmN0aW9uIG1hcHBlciBmdW5jdGlvbiB0byBwYXNzIHRoZSByZXN1bHQgb2JqZWN0IHRvXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIHN1Y2Nlc3NNYXBwaW5nKGNvZGUsIG1hcHBlckZ1bmN0aW9uID0gKCkgPT4geyByZXR1cm4gbnVsbDsgfSkge1xuICAgICAgICB0aGlzLnN1Y2Nlc3NNYXBwaW5nTWFwLnNldChjb2RlLCBtYXBwZXJGdW5jdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtIdHRwQ2FsbEJ1aWxkZXI8Q29udGFpbmVyRG93bmxvYWQ+fVxuICAgICAqL1xuICAgIGFzRG93bmxvYWQoKSB7XG4gICAgICAgIHRoaXMuZG93bmxvYWRSZXNwb25zZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcHBlckZ1bmN0aW9uIG1hcHBlciBmdW5jdGlvbiB0byBwYXNzIHRoZSByZXN1bHQgb2JqZWN0IHRvXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIGZhaWxNYXBwaW5nKGNvZGUsIG1hcHBlckZ1bmN0aW9uID0gKCkgPT4geyByZXR1cm4gbnVsbDsgfSkge1xuICAgICAgICB0aGlzLmZhaWxNYXBwaW5nTWFwLnNldChjb2RlLCBtYXBwZXJGdW5jdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcHBlckZ1bmN0aW9uIG1hcHBlciBmdW5jdGlvbiB0byBwYXNzIHRoZSByZXN1bHQgb2JqZWN0IHRvXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIGVycm9yTWFwcGluZyhtYXBwZXJGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmVycm9yTWFwcGluZ0Z1bmN0aW9uID0gbWFwcGVyRnVuY3Rpb247XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdXRob3JpemF0aW9uIFxuICAgICAqIEByZXR1cm4ge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBhdXRob3JpemF0aW9uSGVhZGVyKGF1dGhvcml6YXRpb24pIHtcbiAgICAgICAgaWYgKCFTdHJpbmdVdGlscy5pc0JsYW5rKGF1dGhvcml6YXRpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhvcml6YXRpb24gPSBcIkJlYXJlciBcIiArIGF1dGhvcml6YXRpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNZXRob2R9IHByb2dyZXNzQ2FsbGJhY2tNZXRob2QgXG4gICAgICogQHJldHVybnMge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBwcm9ncmVzc0NhbGxiYWNrKHByb2dyZXNzQ2FsbGJhY2tNZXRob2QpIHtcbiAgICAgICAgdGhpcy5wcm9ncmVzc0NhbGxiYWNrTWV0aG9kID0gcHJvZ3Jlc3NDYWxsYmFja01ldGhvZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbm5lY3Rpb25UaW1lb3V0VmFsdWUgXG4gICAgICogQHJldHVybnMge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBjb25uZWN0aW9uVGltZW91dChjb25uZWN0aW9uVGltZW91dFZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSA9IGNvbm5lY3Rpb25UaW1lb3V0VmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByZXNwb25zZVRpbWVvdXRWYWx1ZSBcbiAgICAgKiBAcmV0dXJucyB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIHJlc3BvbnNlVGltZW91dChyZXNwb25zZVRpbWVvdXRWYWx1ZSkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlVGltZW91dFZhbHVlID0gcmVzcG9uc2VUaW1lb3V0VmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIGdldCgpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBDbGllbnQuZ2V0KHRoaXMudXJsLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSwgdGhpcy5kb3dubG9hZFJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIHBvc3QocGF5bG9hZCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5wb3N0KHRoaXMudXJsLCBwYXlsb2FkLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMucHJvZ3Jlc3NDYWxsYmFja01ldGhvZCwgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIHB1dChwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LnB1dCh0aGlzLnVybCwgcGF5bG9hZCwgdGhpcy5hdXRob3JpemF0aW9uLCB0aGlzLnByb2dyZXNzQ2FsbGJhY2tNZXRob2QsIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFzVHlwZU1hcHBlZFByb21pc2UocmVzcG9uc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fENvbnRhaW5lclVwbG9hZERhdGF9IHBheWxvYWRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAgICAgKi9cbiAgICBhc3luYyBwYXRjaChwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LnBhdGNoKHRoaXMudXJsLCBwYXlsb2FkLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMucHJvZ3Jlc3NDYWxsYmFja01ldGhvZCwgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIGRlbGV0ZShwYXlsb2FkID0gbnVsbCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5kZWxldGUodGhpcy51cmwsIHBheWxvYWQsIHRoaXMuYXV0aG9yaXphdGlvbiwgdGhpcy5wcm9ncmVzc0NhbGxiYWNrTWV0aG9kLCB0aGlzLmNvbm5lY3Rpb25UaW1lb3V0VmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5hc1R5cGVNYXBwZWRQcm9taXNlKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1Byb21pc2U8Q29udGFpbmVySHR0cFJlc3BvbnNlfSBmZXRjaFByb21pc2UgXG4gICAgICovXG4gICAgYXN5bmMgYXNUeXBlTWFwcGVkUHJvbWlzZShmZXRjaFByb21pc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZldGNoUmVzcG9uc2UgPSBhd2FpdCBmZXRjaFByb21pc2U7XG4gICAgICAgICAgICBpZiAoZmV0Y2hSZXNwb25zZSBpbnN0YW5jZW9mIENvbnRhaW5lckRvd25sb2FkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZldGNoUmVzcG9uc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5oYW5kbGVGZXRjaFJlc3BvbnNlKGZldGNoUmVzcG9uc2UpO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBBUEkgZGlkIG5vdCBleGVjdXRlXG4gICAgICAgICAgICB0aHJvdyB0aGlzLmVycm9yTWFwcGluZ0Z1bmN0aW9uKGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7Q29udGFpbmVySHR0cFJlc3BvbnNlfSBmZXRjaFJlc3BvbnNlIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmUgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcmVqZWN0IFxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZUZldGNoUmVzcG9uc2UoZmV0Y2hSZXNwb25zZSkge1xuICAgICAgICBjb25zdCBzdWNjZXNzUmVzcG9uc2VNYXBwZXIgPSB0aGlzLnN1Y2Nlc3NNYXBwaW5nTWFwLmdldChmZXRjaFJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgIGNvbnN0IGZhaWxSZXNwb25zZU1hcHBlciA9IHRoaXMuZmFpbE1hcHBpbmdNYXAuZ2V0KGZldGNoUmVzcG9uc2Uuc3RhdHVzKTtcblxuICAgICAgICAvLyBFbXB0eSByZXNwb25zZVxuICAgICAgICBpZiAoMjA0ID09PSBmZXRjaFJlc3BvbnNlLnN0YXR1cyB8fCBmZXRjaFJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1MZW5ndGhcIikgPT09IFwiMFwiKSB7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzc1Jlc3BvbnNlTWFwcGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZU1hcHBlcihudWxsKTsgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmFpbFJlc3BvbnNlTWFwcGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZmFpbFJlc3BvbnNlTWFwcGVyKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBtYXBwZXIgZm9yIHJldHVybiBzdGF0dXM6IFwiICsgZmV0Y2hSZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXNzdW1pbmcganNvbiByZXNwb25zZVxuICAgICAgICBsZXQgc3VjY2Vzc1Jlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgbGV0IGZhaWxSZXNwb25zZSA9IG51bGw7ICAgICAgXG4gICAgICAgIHRyeSB7ICBcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlSnNvbiA9IGF3YWl0IGZldGNoUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3NSZXNwb25zZU1hcHBlcikgeyBcbiAgICAgICAgICAgICAgICBzdWNjZXNzUmVzcG9uc2UgPSBzdWNjZXNzUmVzcG9uc2VNYXBwZXIocmVzcG9uc2VKc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHN1Y2Nlc3NSZXNwb25zZSAmJiBmYWlsUmVzcG9uc2VNYXBwZXIpIHtcbiAgICAgICAgICAgICAgICBmYWlsUmVzcG9uc2UgPSBmYWlsUmVzcG9uc2VNYXBwZXIocmVzcG9uc2VKc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHN1Y2Nlc3NSZXNwb25zZSAmJiBudWxsID09IGZhaWxSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGZhaWxSZXNwb25zZSA9IHRoaXMuZXJyb3JNYXBwaW5nRnVuY3Rpb24ocmVzcG9uc2VKc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmVzcG9uc2UgZGlkIG5vdCBwcm92aWRlIGpzb25cbiAgICAgICAgICAgIExPRy5lcnJvcihcIkVycm9yIHBhcnNpbmcgcmVzcG9uc2UganNvblwiLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyB0aGlzLmVycm9yTWFwcGluZ0Z1bmN0aW9uKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZhaWxSZXNwb25zZSkge1xuICAgICAgICAgICAgdGhyb3cgZmFpbFJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgbWFwcGVyIGZvciByZXR1cm4gc3RhdHVzOiBcIiArIGZldGNoUmVzcG9uc2Uuc3RhdHVzKTtcbiAgICB9XG5cbn0iLCJleHBvcnQgY2xhc3MgUXVlcnlQYXJhbUJ1aWxkZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtRdWVyeVBhcmFtQnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFF1ZXJ5UGFyYW1CdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgXG4gICAgICogQHJldHVybnMge1F1ZXJ5UGFyYW1CdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhTdHJpbmcoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgXG4gICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWVBcnJheSBcbiAgICAgKiBAcmV0dXJucyB7UXVlcnlQYXJhbUJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aEFycmF5KGtleSwgdmFsdWVBcnJheSkge1xuICAgICAgICB0aGlzLnBhcmFtcy5zZXQoa2V5LCB2YWx1ZUFycmF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBidWlsZCgpIHtcbiAgICAgICAgbGV0IHF1ZXJ5UGFyYW0gPSBcIlwiO1xuICAgICAgICBsZXQgZmlyc3RQYXJhbSA9IHRydWU7XG4gICAgICAgIHRoaXMucGFyYW1zLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlyc3RQYXJhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBcIiZcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0UGFyYW0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW0gKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZpcnN0UGFyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBcIiZcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdFBhcmFtID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBxdWVyeVBhcmFtO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU2hhVXRpbHMge1xuXG4gICAgc3RhdGljIGFzeW5jIHNoYTI1NkI2NChtZXNzYWdlKSB7XG4gICAgICBjb25zdCBtc2dCdWZmZXIgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7IC8vIEVuY29kZSB0aGUgc3RyaW5nIGFzIFVURi04XG4gICAgICBjb25zdCBoYXNoQnVmZmVyID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0yNTYnLCBtc2dCdWZmZXIpOyAvLyBIYXNoIHRoZSBtZXNzYWdlXG4gICAgICBjb25zdCBoYXNoQXJyYXkgPSBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGhhc2hCdWZmZXIpKTsgLy8gQ29udmVydCBidWZmZXIgdG8gYnl0ZSBhcnJheVxuICAgICAgY29uc3QgYmFzZTY0SGFzaCA9IGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5oYXNoQXJyYXkpKTsgLy8gQ29udmVydCBieXRlcyB0byBiYXNlNjQgc3RyaW5nXG4gICAgICByZXR1cm4gYmFzZTY0SGFzaDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMaXN0LCBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkFic3RyYWN0VmFsaWRhdG9yXCIpO1xuXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0N1cnJlbnRseVZhbGlkXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgZW5hYmxlZCA9IHRydWUpIHtcbiAgICAgICAgdGhpcy52YWxpZExpc3RlbmVyTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgICAgIHRoaXMuaW52YWxpZExpc3RlbmVyTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSBjdXJyZW50bHlWYWxpZDtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZW5hYmxlZDtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgdGhpcy52YWxpZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlKCkge1xuICAgICAgICBsZXQgd2FzVmFsaWQgPSB0aGlzLmN1cnJlbnRseVZhbGlkO1xuICAgICAgICAvLyBGYWtlIHZhbGlkXG4gICAgICAgIHRoaXMudmFsaWQoKTtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSB3YXNWYWxpZDtcbiAgICB9XG5cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudGx5VmFsaWQ7XG4gICAgfVxuXG5cdHZhbGlkKCkge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSB0cnVlO1xuICAgICAgICBpZighdGhpcy52YWxpZExpc3RlbmVyTGlzdCkge1xuICAgICAgICAgICAgTE9HLndhcm4oXCJObyB2YWxpZGF0aW9uIGxpc3RlbmVyc1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbGlkTGlzdGVuZXJMaXN0LmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmNhbGwoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcblx0fVxuXG5cdGludmFsaWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJyZW50bHlWYWxpZCA9IGZhbHNlO1xuICAgICAgICBpZighdGhpcy5pbnZhbGlkTGlzdGVuZXJMaXN0KSB7XG4gICAgICAgICAgICBMT0cud2FybihcIk5vIGludmFsaWRhdGlvbiBsaXN0ZW5lcnNcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZhbGlkTGlzdGVuZXJMaXN0LmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmNhbGwoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcblx0fVxuXG5cdHZhbGlkU2lsZW50KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRseVZhbGlkID0gdHJ1ZTtcblx0fVxuXG5cdGludmFsaWRTaWxlbnQoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHtNZXRob2R9IHZhbGlkTGlzdGVuZXIgXG5cdCAqL1xuXHR3aXRoVmFsaWRMaXN0ZW5lcih2YWxpZExpc3RlbmVyKSB7XG5cdFx0dGhpcy52YWxpZExpc3RlbmVyTGlzdC5hZGQodmFsaWRMaXN0ZW5lcik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7TWV0aG9kfSBpbnZhbGlkTGlzdGVuZXIgXG5cdCAqL1xuXHR3aXRoSW52YWxpZExpc3RlbmVyKGludmFsaWRMaXN0ZW5lcikge1xuXHRcdHRoaXMuaW52YWxpZExpc3RlbmVyTGlzdC5hZGQoaW52YWxpZExpc3RlbmVyKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBMaXN0LCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSAnLi9hYnN0cmFjdFZhbGlkYXRvci5qcyc7XG5cbmV4cG9ydCBjbGFzcyBBbmRWYWxpZGF0b3JTZXQgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cbiAgICBjb25zdHJ1Y3Rvcihpc1ZhbGlkRnJvbVN0YXJ0ID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoaXNWYWxpZEZyb21TdGFydCk7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdFZhbGlkYXRvcn0gdmFsaWRhdG9yXG4gICAgICovXG4gICAgd2l0aFZhbGlkYXRvcih2YWxpZGF0b3IpIHtcbiAgICAgICAgdmFsaWRhdG9yLndpdGhWYWxpZExpc3RlbmVyKG5ldyBNZXRob2QodGhpcy5vbmVWYWxpZCwgdGhpcykpO1xuICAgICAgICB2YWxpZGF0b3Iud2l0aEludmFsaWRMaXN0ZW5lcihuZXcgTWV0aG9kKHRoaXMub25lSW52YWxpZCwgdGhpcykpO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuYWRkKHZhbGlkYXRvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uZSB2YWxpZGF0b3Igc2FpZCBpdCB3YXMgdmFsaWRcbiAgICAgKi9cbiAgICBvbmVWYWxpZCgpIHtcbiAgICAgICAgbGV0IGZvdW5kSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuZm9yRWFjaCgodmFsdWUscGFyZW50KSA9PiB7XG4gICAgICAgICAgICBpZighdmFsdWUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgZm91bmRJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGlmKCFmb3VuZEludmFsaWQpIHtcbiAgICAgICAgICAgIHN1cGVyLnZhbGlkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbmUgdmFsaWRhdG9yIHNhaWQgaXQgd2FzIGludmFsaWRcbiAgICAgKi9cbiAgICBvbmVJbnZhbGlkKCkge1xuICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgfVxufSIsImltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSBcIi4vYWJzdHJhY3RWYWxpZGF0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIFJlZ2V4VmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgcmVnZXggPSBcIiguKilcIikge1xuXHRcdHN1cGVyKGlzY3VycmVudGx5VmFsaWQpO1xuXHRcdHRoaXMubWFuZGF0b3J5ID0gbWFuZGF0b3J5O1xuICAgICAgICB0aGlzLnJlZ2V4ID0gcmVnZXg7XG4gICAgfVxuXG5cdHZhbGlkYXRlKHZhbHVlKXtcblx0XHRpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLm1hdGNoKHRoaXMucmVnZXgpKXtcblx0ICAgIFx0dGhpcy52YWxpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZighdmFsdWUgJiYgIXRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHRcdHRoaXMudmFsaWQoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLm1hdGNoKHRoaXMucmVnZXgpKXtcblx0ICAgIFx0dGhpcy52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZighdmFsdWUgJiYgIXRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHRcdHRoaXMudmFsaWRTaWxlbnQoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59XG4iLCJpbXBvcnQgeyBSZWdleFZhbGlkYXRvciB9IGZyb20gXCIuL3JlZ2V4VmFsaWRhdG9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFbWFpbFZhbGlkYXRvciBleHRlbmRzIFJlZ2V4VmFsaWRhdG9yIHtcblxuICAgIHN0YXRpYyBFTUFJTF9GT1JNQVQgPSAvXlxcdysoW1xcLi1dP1xcdyspKkBcXHcrKFtcXC4tXT9cXHcrKSooXFwuXFx3ezIsM30pKyQvO1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihtYW5kYXRvcnksIGlzY3VycmVudGx5VmFsaWQsIEVtYWlsVmFsaWRhdG9yLkVNQUlMX0ZPUk1BVCk7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBBYnN0cmFjdFZhbGlkYXRvciB9IGZyb20gXCIuL2Fic3RyYWN0VmFsaWRhdG9yLmpzXCI7XG5pbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIEVxdWFsc0Z1bmN0aW9uUmVzdWx0VmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHtib29sZWFufSBtYW5kYXRvcnkgXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNjdXJyZW50bHlWYWxpZCBcblx0ICogQHBhcmFtIHtNZXRob2R9IGNvbXBhcmVkVmFsdWVGdW5jdGlvbiBcblx0ICovXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgY29tcGFyZWRWYWx1ZUZ1bmN0aW9uID0gbnVsbCkge1xuXHRcdHN1cGVyKGlzY3VycmVudGx5VmFsaWQpO1xuXG5cdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdHRoaXMubWFuZGF0b3J5ID0gbWFuZGF0b3J5O1xuXG5cdFx0LyoqIEB0eXBlIHtNZXRob2R9ICovXG5cdFx0dGhpcy5jb21wYXJlZFZhbHVlRnVuY3Rpb24gPSBjb21wYXJlZFZhbHVlRnVuY3Rpb247XG5cdH1cblxuXHR2YWxpZGF0ZSh2YWx1ZSl7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fSBlbHNlIGlmKHZhbHVlID09PSB0aGlzLmNvbXBhcmVkVmFsdWVGdW5jdGlvbi5jYWxsKCkpe1xuXHQgICAgXHR0aGlzLnZhbGlkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2UgaWYodmFsdWUgPT09IHRoaXMuY29tcGFyZWRWYWx1ZUZ1bmN0aW9uLmNhbGwoKSl7XG5cdCAgICBcdHRoaXMudmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbnZhbGlkU2lsZW50KCk7XG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBBYnN0cmFjdFZhbGlkYXRvciB9IGZyb20gXCIuL2Fic3RyYWN0VmFsaWRhdG9yLmpzXCI7XG5pbXBvcnQgeyBNZXRob2QsIFByb3BlcnR5QWNjZXNzb3IgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIEVxdWFsc1Byb3BlcnR5VmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHtib29sZWFufSBtYW5kYXRvcnkgXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNjdXJyZW50bHlWYWxpZCBcblx0ICogQHBhcmFtIHtNZXRob2R9IGNvbXBhcmVkVmFsdWVGdW5jdGlvbiBcblx0ICovXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgbW9kZWwgPSBudWxsLCBhdHRyaWJ1dGVOYW1lID0gbnVsbCkge1xuXHRcdHN1cGVyKGlzY3VycmVudGx5VmFsaWQpO1xuXG5cdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdHRoaXMubWFuZGF0b3J5ID0gbWFuZGF0b3J5O1xuXG5cdFx0LyoqIEB0eXBlIHtvYmplY3R9ICovXG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICAgICAgXG4gICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZU5hbWUgPSBhdHRyaWJ1dGVOYW1lO1xuXHR9XG5cblx0dmFsaWRhdGUodmFsdWUpe1xuXHRcdGlmICghdmFsdWUgJiYgdGhpcy5tYW5kYXRvcnkpIHtcblx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZSA9PT0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCB0aGlzLmF0dHJpYnV0ZU5hbWUpKXtcblx0ICAgIFx0dGhpcy52YWxpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHR9XG5cdH1cblxuXHR2YWxpZGF0ZVNpbGVudCh2YWx1ZSl7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkU2lsZW50KCk7XG5cdFx0fSBlbHNlIGlmKHZhbHVlID09PSBQcm9wZXJ0eUFjY2Vzc29yLmdldFZhbHVlKHRoaXMubW9kZWwsIHRoaXMuYXR0cmlidXRlTmFtZSkpe1xuXHQgICAgXHR0aGlzLnZhbGlkU2lsZW50KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgQWJzdHJhY3RWYWxpZGF0b3IgfSBmcm9tIFwiLi9hYnN0cmFjdFZhbGlkYXRvci5qc1wiO1xuaW1wb3J0IHsgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmV4cG9ydCBjbGFzcyBFcXVhbHNTdHJpbmdWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IG1hbmRhdG9yeSBcblx0ICogQHBhcmFtIHtib29sZWFufSBpc2N1cnJlbnRseVZhbGlkIFxuXHQgKiBAcGFyYW0ge01ldGhvZH0gY29tcGFyZWRWYWx1ZUZ1bmN0aW9uIFxuXHQgKi9cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlLCBjb250cm9sVmFsdWUgPSBudWxsKSB7XG5cdFx0c3VwZXIoaXNjdXJyZW50bHlWYWxpZCk7XG5cblx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0dGhpcy5tYW5kYXRvcnkgPSBtYW5kYXRvcnk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMuY29udHJvbFZhbHVlID0gY29udHJvbFZhbHVlO1xuXHR9XG5cblx0dmFsaWRhdGUodmFsdWUpe1xuXHRcdGlmICghdmFsdWUgJiYgdGhpcy5tYW5kYXRvcnkpIHtcblx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZSA9PT0gY29udHJvbFZhbHVlKXtcblx0ICAgIFx0dGhpcy52YWxpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHR9XG5cdH1cblxuXHR2YWxpZGF0ZVNpbGVudCh2YWx1ZSl7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkU2lsZW50KCk7XG5cdFx0fSBlbHNlIGlmKHZhbHVlID09PSBjb250cm9sVmFsdWUpe1xuXHQgICAgXHR0aGlzLnZhbGlkU2lsZW50KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgUmVnZXhWYWxpZGF0b3IgfSBmcm9tIFwiLi9yZWdleFZhbGlkYXRvci5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBOdW1iZXJWYWxpZGF0b3IgZXh0ZW5kcyBSZWdleFZhbGlkYXRvciB7XG5cbiAgICBzdGF0aWMgUEhPTkVfRk9STUFUID0gL15cXGQqJC87XG5cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKG1hbmRhdG9yeSwgaXNjdXJyZW50bHlWYWxpZCwgTnVtYmVyVmFsaWRhdG9yLlBIT05FX0ZPUk1BVCk7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBMaXN0LCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSAnLi9hYnN0cmFjdFZhbGlkYXRvci5qcydcblxuZXhwb3J0IGNsYXNzIE9yVmFsaWRhdG9yU2V0IGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGlzVmFsaWRGcm9tU3RhcnQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihpc1ZhbGlkRnJvbVN0YXJ0KTtcbiAgICAgICAgdGhpcy52YWxpZGF0b3JMaXN0ID0gbmV3IExpc3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0Fic3RyYWN0VmFsaWRhdG9yfSB2YWxpZGF0b3JcbiAgICAgKi9cbiAgICB3aXRoVmFsaWRhdG9yKHZhbGlkYXRvcikge1xuICAgICAgICB2YWxpZGF0b3Iud2l0aFZhbGlkTGlzdGVuZXIobmV3IE1ldGhvZCh0aGlzLm9uZVZhbGlkLCB0aGlzKSk7XG4gICAgICAgIHZhbGlkYXRvci53aXRoSW52YWxpZExpc3RlbmVyKG5ldyBNZXRob2QodGhpcy5vbmVJbnZhbGlkLCB0aGlzKSk7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdC5hZGQodmFsaWRhdG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT25lIHZhbGlkYXRvciBzYWlkIGl0IHdhcyB2YWxpZFxuICAgICAqL1xuICAgIG9uZVZhbGlkKCkge1xuICAgICAgICBzdXBlci52YWxpZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uZSB2YWxpZGF0b3Igc2FpZCBpdCB3YXMgaW52YWxpZFxuICAgICAqL1xuICAgIG9uZUludmFsaWQoKSB7XG4gICAgICAgIGxldCBmb3VuZFZhbGlkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdC5mb3JFYWNoKCh2YWx1ZSxwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIGlmKHZhbHVlLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgIGZvdW5kVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgaWYoZm91bmRWYWxpZCkge1xuICAgICAgICAgICAgc3VwZXIudmFsaWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLmludmFsaWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IFJlZ2V4VmFsaWRhdG9yIH0gZnJvbSBcIi4vcmVnZXhWYWxpZGF0b3IuanNcIjtcblxuY29uc3QgUEFTU1dPUkRfRk9STUFUID0gL14oPz0uKltBLVphLXpdKSg/PS4qP1swLTldKSg/PS4qP1sjPyFAJCVeJiotXSkuezgsfSQvO1xuXG5leHBvcnQgY2xhc3MgUGFzc3dvcmRWYWxpZGF0b3IgZXh0ZW5kcyBSZWdleFZhbGlkYXRvciB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKG1hbmRhdG9yeSwgaXNjdXJyZW50bHlWYWxpZCwgUEFTU1dPUkRfRk9STUFUKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBSZWdleFZhbGlkYXRvciB9IGZyb20gXCIuL3JlZ2V4VmFsaWRhdG9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBQaG9uZVZhbGlkYXRvciBleHRlbmRzIFJlZ2V4VmFsaWRhdG9yIHtcblxuICAgIHN0YXRpYyBQSE9ORV9GT1JNQVQgPSAvXlxcK1swLTldezJ9XFxzPyhbMC05XVxccz8pKiQvO1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihtYW5kYXRvcnksIGlzY3VycmVudGx5VmFsaWQsIFBob25lVmFsaWRhdG9yLlBIT05FX0ZPUk1BVCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQWJzdHJhY3RWYWxpZGF0b3IgfSBmcm9tIFwiLi9hYnN0cmFjdFZhbGlkYXRvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgUmVxdWlyZWRWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cblx0Y29uc3RydWN0b3IoY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgZW5hYmxlZCA9IHRydWUpIHtcblx0XHRzdXBlcihjdXJyZW50bHlWYWxpZCwgZW5hYmxlZCk7XG5cdH1cblxuXHR2YWxpZGF0ZSh2YWx1ZSl7XG5cdFx0aWYodmFsdWUgPT09IFwiXCIpe1xuXHQgICAgXHR0aGlzLmludmFsaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy52YWxpZCgpO1xuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZih2YWx1ZSA9PT0gXCJcIil7XG5cdCAgICBcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZhbGlkU2lsZW50KCk7XG5cdFx0fVxuXHR9XG5cbn1cbiIsImltcG9ydCB7IE1hY1V0aWxzLCBSYWRpeFV0aWxzLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgSWRTcGFjZSB7XG5cbiAgICBzdGF0aWMgSURfU1BBQ0VfU1RSSU5HX1dJRFRIID0gMTc7XG5cbiAgICBzdGF0aWMgSFdfU1RSSU5HX1BBUlRfV0lEVEggPSA5O1xuICAgIHN0YXRpYyBFUE9DSF9TRUNPTkRTX1NUUklOR19QQVJUX1dJRFRIID0gNjtcbiAgICBzdGF0aWMgQ09VTlRfU1RSSU5HX1BBUlRfV0lEVEggPSAyO1xuXG4gICAgY29uc3RydWN0b3IobWFjID0gbnVsbCwgZXBvY2hTZWNvbmRzID0gbnVsbCwgY291bnRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5tYWMgPSBtYWM7XG4gICAgICAgIHRoaXMuZXBvY2hTZWNvbmRzID0gZXBvY2hTZWNvbmRzO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZFNwYWNlU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtJZFNwYWNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShpZFNwYWNlU3RyaW5nKSB7XG4gICAgICAgIGlmIChpZFNwYWNlU3RyaW5nID09IG51bGwgfHwgaWRTcGFjZVN0cmluZy5sZW5ndGggPCBJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCB8fCAhUmFkaXhVdGlscy5pc1ZhbGlkUmFkaXhTdHJpbmcoaWRTcGFjZVN0cmluZykpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiSUQgU3BhY2UgbXVzdCBiZSBhdCBsZWFzdCBcIiArIElkU3BhY2UuSURfU1BBQ0VfU1RSSU5HX1dJRFRIICsgXCIgY2hhcmFjdGVycyBsb25nIGFuZCBjb250YWluIHZhbGlkIGNoYXJhY3RlcnMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hY1N0cmluZyA9IGlkU3BhY2VTdHJpbmcuc3Vic3RyaW5nKDAsIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgpO1xuICAgICAgICBjb25zdCBlcG9jaFNlY29uZHNTdHJpbmcgPSBpZFNwYWNlU3RyaW5nLnN1YnN0cmluZyhcbiAgICAgICAgICAgIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgsIFxuICAgICAgICAgICAgSWRTcGFjZS5IV19TVFJJTkdfUEFSVF9XSURUSCArIElkU3BhY2UuRVBPQ0hfU0VDT05EU19TVFJJTkdfUEFSVF9XSURUSCk7XG5cbiAgICAgICAgY29uc3QgY291bnRlclN0cmluZyA9IGlkU3BhY2VTdHJpbmcuc3Vic3RyaW5nKFxuICAgICAgICAgICAgSWRTcGFjZS5IV19TVFJJTkdfUEFSVF9XSURUSCArIElkU3BhY2UuRVBPQ0hfU0VDT05EU19TVFJJTkdfUEFSVF9XSURUSCxcbiAgICAgICAgICAgIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEggKyBJZFNwYWNlLkVQT0NIX1NFQ09ORFNfU1RSSU5HX1BBUlRfV0lEVEggKyBJZFNwYWNlLkNPVU5UX1NUUklOR19QQVJUX1dJRFRIKTtcblxuICAgICAgICBjb25zdCBtYWMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyhtYWNTdHJpbmcpO1xuICAgICAgICBjb25zdCBlcG9jaFNlY29uZHMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyhlcG9jaFNlY29uZHNTdHJpbmcpO1xuICAgICAgICBjb25zdCBjb3VudGVyID0gUmFkaXhVdGlscy5mcm9tUmFkaXhTdHJpbmcoY291bnRlclN0cmluZyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBJZFNwYWNlKG1hYywgZXBvY2hTZWNvbmRzLCBjb3VudGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBtYWNTdHJpbmcgPSBTdHJpbmdVdGlscy5sZWZ0UGFkKFJhZGl4VXRpbHMudG9SYWRpeFN0cmluZyh0aGlzLm1hYyksIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgsICcwJyk7XG4gICAgICAgIGNvbnN0IGVwb2NoU2Vjb25kc1N0cmluZyA9IFN0cmluZ1V0aWxzLmxlZnRQYWQoUmFkaXhVdGlscy50b1JhZGl4U3RyaW5nKHRoaXMuZXBvY2hTZWNvbmRzKSwgSWRTcGFjZS5FUE9DSF9TRUNPTkRTX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICBjb25zdCBjb3VudGVyU3RyaW5nID0gU3RyaW5nVXRpbHMubGVmdFBhZChSYWRpeFV0aWxzLnRvUmFkaXhTdHJpbmcodGhpcy5jb3VudGVyKSwgSWRTcGFjZS5DT1VOVF9TVFJJTkdfUEFSVF9XSURUSCwgJzAnKTtcbiAgICAgICAgcmV0dXJuIG1hY1N0cmluZyArIGVwb2NoU2Vjb25kc1N0cmluZyArIGNvdW50ZXJTdHJpbmc7XG4gICAgfVxuXG4gICAgcmVwb3J0KCkge1xuICAgICAgICBjb25zdCByZXBvcnQgPSBuZXcgTWFwKCk7XG4gICAgICAgIHJlcG9ydC5zZXQoXCJJZFNwYWNlIFtNQUNdXCIsIE1hY1V0aWxzLnRvTWFjQWRkcmVzcyh0aGlzLm1hYykpO1xuICAgICAgICByZXBvcnQuc2V0KFwiSWRTcGFjZSBbRXBvY2hdXCIsIHRoaXMuZXBvY2hTZWNvbmRzICogMTAwMCk7XG4gICAgICAgIHJlcG9ydC5zZXQoXCJJZFNwYWNlIFtEYXRlXVwiLCBuZXcgRGF0ZSh0aGlzLmVwb2NoU2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICByZXBvcnQuc2V0KFwiSWRTcGFjZSBbQ291bnRlcl1cIiwgdGhpcy5jb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG59IiwiaW1wb3J0IHsgUmFkaXhVdGlscywgU3RyaW5nVXRpbHMgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIFVzZXJJZCB7XG5cbiAgICBzdGF0aWMgVVNFUl9JRF9TVFJJTkdfV0lEVEggPSA5O1xuXG4gICAgc3RhdGljIEVQT0NIX0NFTlRJU19TVFJJTkdfUEFSVF9XSURUSCA9IDc7XG4gICAgc3RhdGljIENPVU5UX1NUUklOR19QQVJUX1dJRFRIID0gMjtcblxuICAgIGNvbnN0cnVjdG9yKGVwb2NoQ2VudGlzID0gbnVsbCwgY291bnRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lcG9jaENlbnRpcyA9IGVwb2NoQ2VudGlzO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWRTdHJpbmcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHVzZXJJZFN0cmluZykge1xuICAgICAgICBpZiAodXNlcklkU3RyaW5nID09IG51bGwgfHwgdXNlcklkU3RyaW5nLmxlbmd0aCAhPT0gVXNlcklkLlVTRVJfSURfU1RSSU5HX1dJRFRIIHx8ICFSYWRpeFV0aWxzLmlzVmFsaWRSYWRpeFN0cmluZyh1c2VySWRTdHJpbmcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2VyIElEIG11c3QgYmUgYXQgbGVhc3QgXCIgKyBVc2VySWQuVVNFUl9JRF9TVFJJTkdfV0lEVEggKyBcIiBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNvbnRhaW4gdmFsaWQgY2hhcmFjdGVycy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXBvY2hDZW50aXMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyh1c2VySWRTdHJpbmcuc3Vic3RyaW5nKDAsIFVzZXJJZC5FUE9DSF9DRU5USVNfU1RSSU5HX1BBUlRfV0lEVEgpKTtcbiAgICAgICAgY29uc3QgY291bnRlciA9IFJhZGl4VXRpbHMuZnJvbVJhZGl4U3RyaW5nKHVzZXJJZFN0cmluZy5zdWJzdHJpbmcoVXNlcklkLkVQT0NIX0NFTlRJU19TVFJJTkdfUEFSVF9XSURUSCwgVXNlcklkLlVTRVJfSURfU1RSSU5HX1dJRFRIKSk7XG4gICAgICAgIHJldHVybiBuZXcgVXNlcklkKGVwb2NoQ2VudGlzLCBjb3VudGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBlcG9jaE1pbGxpc1N0cmluZyA9IFN0cmluZ1V0aWxzLmxlZnRQYWQoUmFkaXhVdGlscy50b1JhZGl4U3RyaW5nKHRoaXMuZXBvY2hDZW50aXMpLCBVc2VySWQuRVBPQ0hfQ0VOVElTX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICBjb25zdCBjb3VudGVyU3RyaW5nID0gU3RyaW5nVXRpbHMubGVmdFBhZChSYWRpeFV0aWxzLnRvUmFkaXhTdHJpbmcodGhpcy5jb3VudGVyKSwgVXNlcklkLkNPVU5UX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICByZXR1cm4gZXBvY2hNaWxsaXNTdHJpbmcgKyBjb3VudGVyU3RyaW5nO1xuICAgIH1cblxuICAgIHJlcG9ydCgpIHtcbiAgICAgICAgY29uc3QgcmVwb3J0ID0gbmV3IE1hcCgpO1xuICAgICAgICByZXBvcnQuc2V0KFwiVXNlcklkIFtFcG9jaF1cIiwgdGhpcy5lcG9jaENlbnRpcyAqIDEwKTtcbiAgICAgICAgcmVwb3J0LnNldChcIlVzZXJJZCBbRGF0ZV1cIiwgbmV3IERhdGUodGhpcy5lcG9jaENlbnRpcyAqIDEwKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgcmVwb3J0LnNldChcIlVzZXJJZCBbQ291bnRlcl1cIiwgdGhpcy5jb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBJZFNwYWNlIH0gZnJvbSBcIi4vaWRTcGFjZVwiO1xuaW1wb3J0IHsgVXNlcklkIH0gZnJvbSBcIi4vdXNlcklkXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJZFwiKTtcblxuZXhwb3J0IGNsYXNzIElkIHtcblxuICAgIGNvbnN0cnVjdG9yKGlkU3BhY2UgPSBudWxsLCB1c2VySWQgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuaWRTcGFjZSA9IGlkU3BhY2VcbiAgICAgICAgdGhpcy51c2VySWQgPSB1c2VySWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtJZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UoaWRTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaWRTcGFjZVN0cmluZyA9IGlkU3RyaW5nLnN1YnN0cmluZygwLCBJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZFN0cmluZyA9IGlkU3RyaW5nLnN1YnN0cmluZyhJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCk7XG5cbiAgICAgICAgY29uc3QgaWRTcGFjZSA9IElkU3BhY2UucGFyc2UoaWRTcGFjZVN0cmluZyk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJJZC5wYXJzZSh1c2VySWRTdHJpbmcpO1xuXG4gICAgICAgIHJldHVybiBuZXcgSWQoaWRTcGFjZSwgdXNlcklkKTtcbiAgICB9XG5cbiAgICByZXBvcnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgaWRTcGFjZVJlcG9ydCA9IHRoaXMuaWRTcGFjZS5yZXBvcnQoKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaWRTcGFjZVJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHJlcG9ydC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlcklkUmVwb3J0ID0gdGhpcy51c2VySWQucmVwb3J0KCk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHVzZXJJZFJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHJlcG9ydC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG5cbiAgICByZXBvcnRTdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IHRoaXMucmVwb3J0KCk7XG4gICAgICAgIGxldCByZXBvcnRTdHJpbmcgPSBcIlwiXG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIHJlcG9ydFN0cmluZyArPSBrZXkgKyBcIjogXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwb3J0U3RyaW5nICs9IFwiXFxuXCIgKyBrZXkgKyBcIjogXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcG9ydFN0cmluZztcbiAgICB9XG5cbiAgICBwcmludCAoKXtcbiAgICAgICAgTE9HLmluZm8odGhpcy5yZXBvcnRTdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBpZFNwYWNlLnRvU3RyaW5nKCkgKyB1c2VySWQudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB1c2VySWQoKSB7XG4gICAgICAgIHJldHVybiB1c2VySWQudG9TdHJpbmcoKTtcbiAgICB9XG5cbn0iXSwibmFtZXMiOlsiU3RyaW5nVXRpbHMiLCJMb2dnZXIiLCJDb250YWluZXJVcmwiLCJDb250YWluZXJIdHRwQ2xpZW50IiwiQ29udGFpbmVyVXBsb2FkRGF0YSIsIkxPRyIsIkluamVjdGlvblBvaW50IiwiTWluZGlJbmplY3RvciIsIkFycmF5VXRpbHMiLCJNYXAiLCJYbWxFbGVtZW50IiwiQ29udGFpbmVyRWxlbWVudFV0aWxzIiwiQ29udGFpbmVyRWxlbWVudCIsIkxpc3QiLCJNZXRob2QiLCJDb250YWluZXJUZXh0IiwiWG1sQ2RhdGEiLCJYbWxBdHRyaWJ1dGUiLCJDb250YWluZXJXaW5kb3ciLCJEb21UcmVlIiwiTWluZGlDb25maWciLCJTaW5nbGV0b25Db25maWciLCJQcm90b3R5cGVDb25maWciLCJJbnN0YW5jZVBvc3RDb25maWdUcmlnZ2VyIiwiQ29uZmlnQWNjZXNzb3IiLCJQcm9wZXJ0eUFjY2Vzc29yIiwiTWFwVXRpbHMiLCJDb250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T0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzNDLFlBQVksU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMzQyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMzQyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN2QyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFNBQVM7QUFDVCxRQUFRLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckQ7QUFDQSxRQUFRLE1BQU0sYUFBYSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDMUMsUUFBUSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLO0FBQzNDLFlBQVksYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqRCxTQUFTLENBQUMsQ0FBQztBQUNYLFFBQVEsT0FBTyxhQUFhLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksT0FBTyxlQUFlLENBQUMsU0FBUyxFQUFFO0FBQ3RDLFFBQVEsSUFBSSxT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SSxLQUFLLE1BQU0sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDdkQsU0FBUztBQUNULFFBQVEsR0FBRyxLQUFLLFlBQVlBLHVCQUFVLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDbEUsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDNUQsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDNUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDOUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDOUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDaEYsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDN0UsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDNUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDNUUsU0FBUztBQUNULFFBQVEsT0FBTyxL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
