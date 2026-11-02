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

class StateChange {
    constructor(object, key, change) {
        this.object = object;
        this.key = key;
        this.change = change;
    }
}

/**
 * StateManager
 * 
 * @template T, T2
 */
class StateManager {

    static STATE_MANAGER_PROXY = Symbol('stateManagerProxy');

    /** A change was observed creating adding new domain object */
    static CHANGE_NEW = "__CHANGE_NEW__";

    /** A change was observed updating an existing domain object */
    static CHANGE_UPDATE = "__CHANGE_UPDATE__";

    /** A change was observed removing an existing domain object */
    static CHANGE_REMOVE = "__CHANGE_REMOVE__";


    /** This key matches any key in the domain map */
    static KEY_ANY = "__KEY_ANY__";

    /** The default key used when no specific key is provided */
    static KEY_DEFAULT = "__KEY_DEFAULT__";


    /** A trigger to create an object or objects downstream, resulted in a domain change */
    static TRIGGER_CREATE = "__TRIGGER_CREATE__";

    /** A trigger to delete an object or objects downstream, resulted in a domain change */
    static TRIGGER_DELETE = "__TRIGGER_DELETE__";

    /** A trigger to update an object or objects downstream, resulted in a domain change */
    static TRIGGER_UPDATE = "__TRIGGER_UPDATE__";

    /** A trigger to read an object or objects downstream, resulted in a domain change */
    static TRIGGER_READ = "__TRIGGER_READ__";

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
     * @param {any} context
     * @param {Function} domainListener
     * @param {Function} errorListener
     * @param {String} key
     */
    react(context, domainListenerFunction, errorListenerFunction = null, key = StateManager.KEY_DEFAULT) {

        // If key is ANY, then we are passing an array, so the listener should expect an array of state changes rather than individual objects.
        const domainListener = new coreutil_v1.Method(domainListenerFunction, context);
        const errorListener = errorListenerFunction ? new coreutil_v1.Method(errorListenerFunction, context, key != StateManager.KEY_ANY) : null;

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

    async updateError(error, key = StateManager.KEY_DEFAULT) {
        this.initialized = true;
        this.errorMap.set(key, error);
        this.signalErrorChange(error, key);
    }

    async updateDomainByArray(array, property, trigger = StateManager.TRIGGER_READ) {
        if (!Array.isArray(array)) {
            throw new Error("updateDomainArray expects an array");
        }

        const stateChangeArray = new Array();

        // Create proxies for each object in the array and collect their property values as update keys
        for (let i = 0; i < array.length; i++) {
            const object = array[i];
            const propertyValue = object[property];
            const proxyObject = this.createProxy(object, propertyValue, this);
            stateChangeArray.push(new StateChange(proxyObject, propertyValue, this.domainMap.has(propertyValue) ? StateManager.CHANGE_UPDATE : StateManager.CHANGE_NEW));
        }

        this.initialized = true;

        // Update the domain map with the new proxies
        for (const stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            this.domainMap.set(key, object);
        }

        // Signal domain change for each updated key
        this.signalDomainChange(stateChangeArray);
    }

    async updateDomainByMap(map, trigger = StateManager.TRIGGER_READ) {
        if (!(map instanceof Map)) {
            throw new Error("updateDomainByMap expects a Map");
        }

        const stateChangeArray = new Array();
        
        // Create proxies for each value in the map and collect their keys as update keys
        for (const [key, value] of map.entries()) {
            const proxyValue = this.createProxy(value, key, this);
            stateChangeArray.push(new StateChange(proxyValue, key, this.domainMap.has(key) ? StateManager.CHANGE_UPDATE : StateManager.CHANGE_NEW));
        }

        this.initialized = true;

        // Update the domain map with the new proxies and record their change types
        for (const stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            this.domainMap.set(key, object);
        }

        // Signal domain change for each updated key
        this.signalDomainChange(stateChangeArray);
    }

    /**
     * 
     * @param {any} object the domain object to update
     * @param {string} trigger the trigger type that caused the update
     * @param {string} key the key associated with the domain object
     * @returns {any} the proxied domain object after the update
     */
    async updateDomain(object, key = StateManager.KEY_DEFAULT, trigger = StateManager.TRIGGER_READ) {
        if (Array.isArray(object) || object instanceof Map ) {
            throw new Error("updateDomain expects a single object, not an array or map");
        }

        const proxyObject = this.createProxy(object, key, this);

        let change = this.domainMap.has(key) ? StateManager.CHANGE_UPDATE : StateManager.CHANGE_NEW;

        this.domainMap.set(key, proxyObject);
        
        this.initialized = true;
        if (this.errorMap.get(key) != null) {
            this.errorMap.delete(key);
            this.signalErrorChange(null, key);
        }
        this.signalDomainChange([new StateChange(proxyObject, key, change)], trigger);
        return proxyObject;
    }

    /**
     * 
     * @param {string} trigger the trigger type that caused the deletion
     * @param {string} key the key associated with the domain object to delete
     */
    async remove(key = StateManager.KEY_DEFAULT, trigger = StateManager.TRIGGER_DELETE) {

        this.domainMap.delete(key);
        this.errorMap.delete(key);

        this.initialized = true;

        if (this.domainMap.has(key)) {
            this.signalDomainChange([new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_REMOVE)], trigger);
        }

        if (StateManager.KEY_DEFAULT !== key) {
            this.domainListeners.delete(key);
            this.errorListeners.delete(key);
        }
    }

    async reset() {
        this.initialized = true;
        const stateChangeArray = [];
        for (let key of this.domainMap.keys()) {
            stateChangeArray.push(new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_REMOVE), StateManager.TRIGGER_READ);
        }
        this.signalDomainChange(stateChangeArray);

        this.domainMap.clear();
        this.errorMap.clear();

        this.initialized = false;

        this.errorListeners.clear();
        this.domainListeners.clear();
    }

    async clear() {
        this.initialized = true;
        const stateChangeArray = [];
        for (let key of this.domainMap.keys()) {
            stateChangeArray.push(new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_REMOVE), StateManager.TRIGGER_READ);
        }
        this.signalDomainChange(stateChangeArray);

        this.domainMap.clear();
        const anyKeyDomainListener = this.domainListeners.get(StateManager.KEY_ANY);
        this.domainListeners.clear();
        this.domainListeners.set(StateManager.KEY_ANY, anyKeyDomainListener);

        this.errorMap.clear();
        const anyKeyErrorListeners = this.errorListeners.get(StateManager.KEY_ANY);
        this.errorListeners.clear();
        this.errorListeners.set(StateManager.KEY_ANY, anyKeyErrorListeners);

        this.initialized = false;
    }

    /**
     * Signals a domain change to all listeners for a specific key.
     * @param {StateChange[]} stateChangeArray - An array of StateChange objects representing the changes.
     * @param {string} trigger - The trigger that caused the domain change.
     */
    signalDomainChange(stateChangeArray, trigger = StateManager.TRIGGER_READ) {

        // Signal domain changes to all listeners for the specific key
        for (const stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            if (key != StateManager.KEY_DEFAULT && !this.domainListeners.has(key)) {
                continue;
            }
            for (let listener of this.domainListeners.get(key)) {
                listener.call([object, key, change, trigger]);
            }
        }

        if (!this.domainListeners.has(StateManager.KEY_ANY)) {
            return;
        }

        // Signal domain changes to all listeners for any key, and finish with finalize for the collected changes
        for (let listener of this.domainListeners.get(StateManager.KEY_ANY)) {
            // Pass the every state change to the listener for the ANY key
            listener.call([stateChangeArray, trigger]);
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

        if (key != StateManager.KEY_ANY && this.errorListeners.has(StateManager.KEY_ANY)) {
            for (let listener of this.errorListeners.get(StateManager.KEY_ANY)) {
                listener.call([error, key]);
            }
        }
    }

    /**
     * 
     * @param {any} object 
     * @param {string} key 
     * @param {StateManager} stateManager 
     * @returns 
     */
    createProxy(object, key, stateManager) {
        if (object[StateManager.STATE_MANAGER_PROXY]) {
            LOG.warn("Object is already a state manager proxy.");
            return object;
        }
        return new Proxy(object, {
            get: (target, prop, receiver) => {
                if (prop === StateManager.STATE_MANAGER_PROXY) {
                    return true;
                }
                return Reflect.get(target, prop, receiver);
            },
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
                const stateChange = new StateChange(target, key, StateManager.CHANGE_UPDATE);
                stateManager.signalDomainChange([stateChange], StateManager.TRIGGER_READ);
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
            this.containerElement.prependChild(input.containerElement);
            return;
        }
        if (input && input.rootElement) {
            this.containerElement.prependChild(input.rootElement.containerElement);
            return;
        }
        if (typeof input == "string") {
            this.containerElement.prependChild(containerbridge_v1.ContainerElementUtils.createTextNode(input));
            return;
        }
        if (input instanceof containerbridge_v1.ContainerText) {
            this.containerElement.prependChild(input);
            return;
        }
        if (input instanceof Element) {
            this.containerElement.prependChild(input);
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
            const trailLeaf = Array.isArray(trailNode.trail) ? trailNode.trail[trailNode.trail.length - 1] : trailNode.trail;
            currentTrail += trailLeaf;

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

        let lastTrailNode = null;
        for (const trailNode of trailNodesPath) {
            lastTrailNode = trailNode;

            if (trailNode.property) {
                currentObject = currentObject[trailNode.property];
            }
            if (trailNode.waypoint) {
                response = trailNode.waypoint.call(currentObject);
            }
        }
        if (lastTrailNode && lastTrailNode.destination) {
            response = lastTrailNode.destination.call(currentObject);
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
                const trailLeaf = Array.isArray(node.trail) ? node.trail[node.trail.length - 1] : node.trail;
                currentTrail += trailLeaf;
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
            if (!attr.includes("=")) {
                attributeMap.set(attr, "");
                return;
            }
            let firstEqualSignIndex = attr.indexOf("=");
            const key = attr.substring(0, firstEqualSignIndex);
            const value = attr.substring(firstEqualSignIndex + 1);
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
        field.listenTo("input", puller, this);
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

    static CHANGE_LISTENER_PROXY = Symbol('changeListenerProxy');

    /**
     * Creates a proxy for an object which allows databinding from the object to the form element
     * 
     * @template T
     * @param {T} object 
     * @returns {T}
     */
    static createProxyObject(object) {
        if (object[ProxyObjectFactory.CHANGE_LISTENER_PROXY]) {
            LOG.warn("Object is already a change listener proxy.");
            return object;
        }
        return new Proxy(object, {
            get: (target, prop, receiver) => {
                if (prop === ProxyObjectFactory.CHANGE_LISTENER_PROXY) {
                    return true;
                }
                return Reflect.get(target, prop, receiver);
            },
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

class NamedTrailRegistry {

    constructor(registry) {
        /** @type {Object} */
        this.registry = registry;
    }

    /**
     * 
     * @param {String} name 
     * @returns 
     */
    async getTrail(name) {
        if (this.registry[name]) {
            return this.registry[name];
        }
        return null;
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

    rows(rows) {
        this.stylesheetBuilder.style("rows", rows);
        return this;
    }

    columns(columns) {
        this.stylesheetBuilder.style("columns", columns);
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

class ShaUtils {

    static async sha256B64(message) {
      const msgBuffer = new TextEncoder().encode(message); // Encode the string as UTF-8
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // Hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
      const base64Hash = btoa(String.fromCharCode(...hashArray)); // Convert bytes to base64 string
      return base64Hash;
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
        this.currentlyValid = true;
        if (!this.enabled) {
            return;
        }
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
        this.currentlyValid = false;
        if (!this.enabled) {
            return;
        }
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

const PASSWORD_FORMAT = /^(?=.*[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

class PasswordValidator extends RegexValidator {

    constructor(mandatory = false, iscurrentlyValid = false) {
        super(mandatory, iscurrentlyValid, PASSWORD_FORMAT);
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

class PhoneValidator extends RegexValidator {

    static PHONE_FORMAT = /^\+[0-9]{2}\s?([0-9]\s?)*$/;

    constructor(mandatory = false, iscurrentlyValid = false) {
        super(mandatory, iscurrentlyValid, PhoneValidator.PHONE_FORMAT);
    }

}

class PrimitiveValidator extends AbstractValidator {

    constructor(mandatory = false, iscurrentlyValid = false, value = true) {
        super(iscurrentlyValid);
        this.mandatory = mandatory;
        this.value = value;
    }

    validate(value){
        if (value && value === this.value){
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
        if (value && value === this.value){
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
exports.NamedTrailRegistry = NamedTrailRegistry;
exports.Navigation = Navigation;
exports.NumberValidator = NumberValidator;
exports.OptionElement = OptionElement;
exports.OrValidatorSet = OrValidatorSet;
exports.PasswordValidator = PasswordValidator;
exports.PhoneValidator = PhoneValidator;
exports.PrimitiveValidator = PrimitiveValidator;
exports.ProxyObjectFactory = ProxyObjectFactory;
exports.QueryParamBuilder = QueryParamBuilder;
exports.RadioInputElement = RadioInputElement;
exports.RegexValidator = RegexValidator;
exports.RequiredValidator = RequiredValidator;
exports.SelectElement = SelectElement;
exports.ShaUtils = ShaUtils;
exports.SimpleElement = SimpleElement;
exports.StateChange = StateChange;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnV0dGluMmMtY29yZV92MS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL251dHRpbjJjL21vZHVsZVJ1bm5lci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybFV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vaGlzdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL3VybEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi9uYXZpZ2F0aW9uLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vdHJhaWxOb2RlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2FjdGl2ZU1vZHVsZVJ1bm5lci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jbGllbnQvY2xpZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZXNoZWV0LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3N0eWxlcy9zdHlsZXNSZWdpc3RyeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy90ZW1wbGF0ZS90ZW1wbGF0ZS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy90ZW1wbGF0ZS90ZW1wbGF0ZVJlZ2lzdHJ5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3RlbXBsYXRlL3RlbXBsYXRlc0xvYWRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVzTG9hZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2NvbXBvbmVudC9jb21wb25lbnRDb25maWdQcm9jZXNzb3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbG9hZGVyL2xvYWRlckludGVyY2VwdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2xvYWRlci9tb2R1bGVMb2FkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbW9kdWxlLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2xvYWRlci9kaU1vZHVsZUxvYWRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdGF0ZS9zdGF0ZUNoYW5nZS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdGF0ZS9zdGF0ZU1hbmFnZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L3VuaXF1ZUlkUmVnaXN0cnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9hdHRyaWJ1dGUuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9tYXBwZWRDb250YWluZXJFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvZWxlbWVudFV0aWxzLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvYmFzZUVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2NvbXBvbmVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvcmFkaW9JbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9jaGVja2JveElucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3RleHRJbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC90ZXh0YXJlYUlucHV0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3RleHRub2RlRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3NpbXBsZUVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9mb3JtRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L3ZpZGVvRWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L29wdGlvbkVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvaHRtbC9odG1sLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2VsZW1lbnQvc2VsZWN0RWxlbWVudC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9lbGVtZW50L2ZpbGVJbnB1dEVsZW1lbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZWxlbWVudC9lbGVtZW50TWFwcGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL2NvbXBvbmVudC9lbGVtZW50UmVnaXN0cmF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY2FudmFzL2NhbnZhc1Jvb3QuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY2FudmFzL2NhbnZhc1N0eWxlcy5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jb21wb25lbnQvY29tcG9uZW50RmFjdG9yeS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9jb21wb25lbnQvdGVtcGxhdGVDb21wb25lbnRGYWN0b3J5LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL25hdmlnYXRpb24vdHJhaWxJdGVyYXRpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi90cmFpbFByb2Nlc3Nvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVTZWxlY3Rvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVNZWRpYS5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvc3R5bGVzaGVldEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2NvbXBvbmVudEJ1aWxkZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29tcG9uZW50L2lubGluZUNvbXBvbmVudEZhY3RvcnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvYXBwbGljYXRpb24uanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvY29uZmlnL2NvbmZpZ3VyZWRGdW5jdGlvbi5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9kYXRhQmluZC9pbnB1dEVsZW1lbnREYXRhQmluZGluZy5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9kYXRhQmluZC9wcm94eU9iamVjdEZhY3RvcnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZXZlbnQvZXZlbnQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvZXZlbnQvZXZlbnRGaWx0ZXJlZE1ldGhvZC5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9ldmVudC9ldmVudE1hbmFnZXIuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvbmF2aWdhdGlvbi9uYW1lZFRyYWlsUmVnaXN0cnkuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvc3R5bGVzL3N0eWxlQWNjZXNzb3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvc3R5bGVzL3N0eWxlQ2xhc3NBY2Nlc3Nvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy9zdHlsZXMvY3NzM1N0eWxlc2hlZXRCdWlsZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvaHR0cENhbGxCdWlsZGVyLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3V0aWwvc2hhVXRpbHMuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9xdWVyeVBhcmFtQnVpbGRlci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvYWJzdHJhY3RWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL3JlZ2V4VmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9lbWFpbFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvYW5kVmFsaWRhdG9yU2V0LmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9lcXVhbHNGdW5jdGlvblJlc3VsdFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvZXF1YWxzUHJvcGVydHlWYWxpZGF0b3IuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL2VxdWFsc1N0cmluZ1ZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvbnVtYmVyVmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9wYXNzd29yZFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3Ivb3JWYWxpZGF0b3JTZXQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdmFsaWRhdG9yL3Bob25lbFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy92YWxpZGF0b3IvcHJpbWl0aXZlVmFsaWRhdG9yLmpzIiwiLi4vLi4vc3JjL251dHRpbjJjL3ZhbGlkYXRvci9yZXF1aXJlZFZhbGlkYXRvci5qcyIsIi4uLy4uL3NyYy9udXR0aW4yYy91dGlsL2lkL2lkU3BhY2UuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9pZC91c2VySWQuanMiLCIuLi8uLi9zcmMvbnV0dGluMmMvdXRpbC9pZC9pZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTW9kdWxlUnVubmVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgIHJ1bk1vZHVsZSh1cmwpIHtcbiAgICAgfVxuXG59IiwiaW1wb3J0IHsgU3RyaW5nVXRpbHMgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIFVybHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm90b2NvbCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaG9zdCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcG9ydCBcbiAgICAgKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IHBhdGhWYWx1ZUFycmF5IFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgQXJyYXk8U3RyaW5nPj59IHF1ZXJ5UGFyYW1NYXBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYW5jaG9yIFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgU3RyaW5nPn0gYW5jaG9yUGFyYW1NYXBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcm90b2NvbCwgaG9zdCwgcG9ydCA9IG51bGwsIHBhdGhWYWx1ZUFycmF5ID0gbnVsbCwgcXVlcnlQYXJhbU1hcCA9IG51bGwsIGFuY2hvciA9IG51bGwsIGFuY2hvclBhcmFtTWFwID0gbnVsbCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnByb3RvY29sU3RyaW5nID0gcHJvdG9jb2w7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMuaG9zdFN0cmluZyA9IGhvc3Q7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMucG9ydFN0cmluZyA9IHBvcnQ7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxTdHJpbmc+fSAqL1xuICAgICAgICB0aGlzLnBhdGhWYWx1ZUFycmF5ID0gcGF0aFZhbHVlQXJyYXk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBBcnJheTxTdHJpbmc+Pn0gKi9cbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtTWFwID0gcXVlcnlQYXJhbU1hcDtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIFN0cmluZz59ICovXG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1NYXAgPSBhbmNob3JQYXJhbU1hcDtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5hbmNob3JTdHJpbmcgPSBhbmNob3I7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMucGF0aFZhbHVlQXJyYXkpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aFZhbHVlQXJyYXkgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5xdWVyeVBhcmFtTWFwKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1NYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuYW5jaG9yUGFyYW1NYXApIHtcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yUGFyYW1NYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgcHJvdG9jb2woKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvdG9jb2xTdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0IGhvc3QoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaG9zdFN0cmluZztcbiAgICB9XG5cbiAgICBnZXQgcG9ydCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5wb3J0U3RyaW5nO1xuICAgIH1cblxuICAgIGdldCBwYXRoc0xpc3QoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aFZhbHVlTGlzdDtcbiAgICB9XG5cbiAgICBnZXQgYW5jaG9yKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmFuY2hvclN0cmluZztcbiAgICB9XG5cbiAgICBnZXQgcGFyYW1ldGVyTWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbWV0ZXJWYWx1ZU1hcDtcbiAgICB9XG5cbiAgICBnZXRQYXRoUGFydChpbmRleCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGhWYWx1ZUxpc3QuZ2V0KGluZGV4KTtcbiAgICB9XG5cbiAgICByZXBsYWNlUGF0aFZhbHVlKGZyb20sIHRvKXtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHRoaXMucGF0aFZhbHVlQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMubm9uTnVsbEVxdWFscyhmcm9tLCB0aGlzLnBhdGhWYWx1ZUFycmF5W2ldKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aFZhbHVlQXJyYXlbaV0gPSB0bztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHBhdGgoKXtcbiAgICAgICAgbGV0IHBhdGggPSBcIi9cIjtcbiAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wYXRoVmFsdWVMaXN0LmZvckVhY2goKHZhbHVlID0+IHtcbiAgICAgICAgICAgIGlmICghZmlyc3QpIHtcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aCArIFwiL1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0aCA9IHBhdGggKyB2YWx1ZTtcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH0pLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgdmFyIHZhbHVlID0gXCJcIjtcbiAgICAgICAgaWYodGhpcy5wcm90b2NvbCAhPT0gbnVsbCl7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlICsgdGhpcy5wcm90b2NvbCArIFwiLy9cIjtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLmhvc3QgIT09IG51bGwpe1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIHRoaXMuaG9zdDtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLnBvcnQgIT09IG51bGwpe1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIFwiOlwiICsgdGhpcy5wb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXRoVmFsdWVBcnJheS5mb3JFYWNoKChwYXRoUGFydCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIFwiL1wiICsgcGF0aFBhcnQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKHRoaXMucXVlcnlQYXJhbU1hcC5zaXplID4gMCl7XG4gICAgICAgICAgICBjb25zdCBxdWVyeVBhcmFtU3RyaW5ncyA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtTWFwLmZvckVhY2goKHZhbHVlQXJyYXksIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtU3RyaW5ncy5wdXNoKGtleSArIFwiPVwiICsgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbVN0cmluZ3MucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocXVlcnlQYXJhbVN0cmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIj9cIiArIHF1ZXJ5UGFyYW1TdHJpbmdzLmpvaW4oXCImXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhhc2hBZGRlZCA9IGZhbHNlO1xuICAgICAgICBpZih0aGlzLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaGFzaEFkZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIiNcIiArIHRoaXMuYW5jaG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYW5jaG9yUGFyYW1NYXAuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvclBhcmFtU3RyaW5ncyA9IG5ldyBBcnJheSgpO1xuXG4gICAgICAgICAgICB0aGlzLmFuY2hvclBhcmFtTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yUGFyYW1TdHJpbmdzLnB1c2goa2V5ICsgXCI9XCIgKyB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChhbmNob3JQYXJhbVN0cmluZ3MubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghaGFzaEFkZGVkKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIFwiI1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSArIFwiP1wiICsgYW5jaG9yUGFyYW1TdHJpbmdzLmpvaW4oXCImXCIpO1xuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgTGlzdCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4vdXJsLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBVcmxVdGlscyB7XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZSBzdHJpbmcgdG8gdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7VXJsfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZSh1cmxTdHJpbmcpIHtcblxuICAgICAgICBpZiAodXJsU3RyaW5nID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcHJvdG9jb2wgPSAgICAgVXJsVXRpbHMucGFyc2VQcm90b2NvbCh1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBob3N0ID0gICAgICAgICBVcmxVdGlscy5wYXJzZUhvc3QodXJsU3RyaW5nKTtcbiAgICAgICAgY29uc3QgcG9ydCA9ICAgICAgICAgVXJsVXRpbHMucGFyc2VQb3J0KHVybFN0cmluZyk7XG4gICAgICAgIGNvbnN0IHBhdGhzTGlzdCA9ICAgIFVybFV0aWxzLnBhcnNlUGF0aEFycmF5KHVybFN0cmluZyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW0gPSAgIFVybFV0aWxzLnBhcnNlUXVlcnlQYXJhbSh1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSAgICAgICBVcmxVdGlscy5wYXJzZUFuY2hvcih1cmxTdHJpbmcpO1xuICAgICAgICBjb25zdCBhbmNob3JQYXJhbXMgPSBVcmxVdGlscy5wYXJzZUFuY2hvclBhcmFtcyh1cmxTdHJpbmcpO1xuXG4gICAgICAgIHJldHVybiBuZXcgVXJsKHByb3RvY29sLCBob3N0LCBwb3J0LCBwYXRoc0xpc3QsIHF1ZXJ5UGFyYW0sIGFuY2hvciwgYW5jaG9yUGFyYW1zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlUHJvdG9jb2wodXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiLy9cIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvY29sID0gdXJsU3RyaW5nLnNwbGl0KFwiLy9cIilbMF07XG4gICAgICAgIGlmIChwcm90b2NvbFtwcm90b2NvbC5sZW5ndGggLSAxXSAhPT0gXCI6XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm90b2NvbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlSG9zdCh1cmxTdHJpbmcpIHtcbiAgICAgICAgaWYgKHVybFN0cmluZyA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICBpZiAodXJsU3RyaW5nLmluZGV4T2YoXCI6Ly9cIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaG9zdEFuZFBvcnQgPSB1cmxTdHJpbmcuc3BsaXQoXCI6Ly9cIilbMV07XG4gICAgICAgIGlmIChob3N0QW5kUG9ydC5pbmRleE9mKFwiL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGhvc3RBbmRQb3J0ID0gaG9zdEFuZFBvcnQuc3BsaXQoXCIvXCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBob3N0ID0gaG9zdEFuZFBvcnQ7XG4gICAgICAgIGlmIChob3N0QW5kUG9ydC5pbmRleE9mKFwiOlwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGhvc3QgPSBob3N0QW5kUG9ydC5zcGxpdChcIjpcIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZVBvcnQodXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGhvc3RBbmRQb3J0ID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICBpZiAoaG9zdEFuZFBvcnQuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICBob3N0QW5kUG9ydCA9IGhvc3RBbmRQb3J0LnNwbGl0KFwiL1wiKVswXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaG9zdEFuZFBvcnQuaW5kZXhPZihcIjpcIikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KGhvc3RBbmRQb3J0LnNwbGl0KFwiOlwiKVsxXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFN0cmluZyBcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8U3RyaW5nPn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VQYXRoQXJyYXkodXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3Vic3RyaW5nKHVybFN0cmluZy5pbmRleE9mKFwiL1wiKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiI1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIiNcIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIj9cIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByYXdQYXRoUGFydExpc3QgPSB1cmxTdHJpbmcuc3BsaXQoXCIvXCIpO1xuXG4gICAgICAgIGNvbnN0IHBhdGhWYWx1ZUxpc3QgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgcmF3UGF0aFBhcnRMaXN0LmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBwYXRoVmFsdWVMaXN0LnB1c2goZGVjb2RlVVJJKHZhbHVlKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGF0aFZhbHVlTGlzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtNYXA8U3RyaW5nLCBMaXN0PFN0cmluZz4+fVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZVF1ZXJ5UGFyYW0odXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3Vic3RyaW5nKHVybFN0cmluZy5pbmRleE9mKFwiL1wiKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiI1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIiNcIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiP1wiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCI/XCIpWzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwgfHwgdXJsU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHF1ZXJ5UGFyYW0gPSB1cmxTdHJpbmc7XG4gICAgICAgIGNvbnN0IHBhcmFtTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBjb25zdCBwYXJhbVBhaXJzID0gcXVlcnlQYXJhbS5zcGxpdChcIiZcIik7XG4gICAgICAgIHBhcmFtUGFpcnMuZm9yRWFjaCgocGFpcikgPT4ge1xuICAgICAgICAgICAgbGV0IGtleSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHBhaXIuaW5kZXhPZihcIj1cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGFpci5zcGxpdChcIj1cIilbMF07XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYWlyLnNwbGl0KFwiPVwiKVsxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGFpcjtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXkgPSBkZWNvZGVVUkkoa2V5KTtcbiAgICAgICAgICAgIHZhbHVlID0gZGVjb2RlVVJJKHZhbHVlKTtcbiAgICAgICAgICAgIGlmICghcGFyYW1NYXAuZ2V0KGtleSkpIHtcbiAgICAgICAgICAgICAgICBwYXJhbU1hcC5zZXQoa2V5LCBuZXcgQXJyYXkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbU1hcC5nZXQoa2V5KS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXJhbU1hcDtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VBbmNob3IodXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3Vic3RyaW5nKHVybFN0cmluZy5pbmRleE9mKFwiL1wiKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiI1wiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCIjXCIpWzFdO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybFN0cmluZyA9IHVybFN0cmluZy5zcGxpdChcIj9cIilbMF07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGFuY2hvciA9IHVybFN0cmluZztcbiAgICAgICAgcmV0dXJuIGFuY2hvcjtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VBbmNob3JQYXJhbXModXJsU3RyaW5nKSB7XG4gICAgICAgIGlmICh1cmxTdHJpbmcgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiOi8vXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdXJsU3RyaW5nID0gdXJsU3RyaW5nLnNwbGl0KFwiOi8vXCIpWzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIi9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3Vic3RyaW5nKHVybFN0cmluZy5pbmRleE9mKFwiL1wiKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybFN0cmluZy5pbmRleE9mKFwiI1wiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIiNcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCIjXCIpWzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmxTdHJpbmcuaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG4gICAgICAgICAgICB1cmxTdHJpbmcgPSB1cmxTdHJpbmcuc3BsaXQoXCI/XCIpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGFuY2hvclBhcmFtU3RyaW5nID0gdXJsU3RyaW5nO1xuICAgICAgICBjb25zdCBwYXJhbU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgcGFyYW1QYWlycyA9IGFuY2hvclBhcmFtU3RyaW5nLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgcGFyYW1QYWlycy5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgICAgICAgICBsZXQga2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAocGFpci5pbmRleE9mKFwiPVwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBwYWlyLnNwbGl0KFwiPVwiKVswXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhaXIuc3BsaXQoXCI9XCIpWzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBwYWlyO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleSA9IGRlY29kZVVSSShrZXkpO1xuICAgICAgICAgICAgdmFsdWUgPSBkZWNvZGVVUkkodmFsdWUpO1xuICAgICAgICAgICAgcGFyYW1NYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBhcmFtTWFwO1xuICAgIH1cblxuXG59IiwiaW1wb3J0IHsgQ29udGFpbmVyVXJsIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgVXJsVXRpbHMgfSBmcm9tIFwiLi4vdXRpbC91cmxVdGlscy5qc1wiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJIaXN0b3J5XCIpO1xuXG5leHBvcnQgY2xhc3MgSGlzdG9yeSB7XG5cbiAgICBzdGF0aWMgcmVwbGFjZVVybCh1cmwsIHRpdGxlLCBzdGF0ZU9iamVjdCkge1xuICAgICAgICBDb250YWluZXJVcmwucmVwbGFjZVVybCh1cmwudG9TdHJpbmcoKSwgdGl0bGUsIHN0YXRlT2JqZWN0KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHVzaFVybCh1cmwsIHRpdGxlLCBzdGF0ZU9iamVjdCkge1xuICAgICAgICBDb250YWluZXJVcmwucHVzaFVybCh1cmwudG9TdHJpbmcoKSwgdGl0bGUsIHN0YXRlT2JqZWN0KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3VycmVudFVybCgpIHtcbiAgICAgICAgcmV0dXJuIFVybFV0aWxzLnBhcnNlKENvbnRhaW5lclVybC5jdXJyZW50VXJsKCkpO1xuICAgIH1cblxufSIsImltcG9ydCB7IFN0cmluZ1V0aWxzIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi91cmwuanNcIjtcbmltcG9ydCB7IFVybFV0aWxzIH0gZnJvbSBcIi4vdXJsVXRpbHMuanNcIjtcbmltcG9ydCB7IENvbnRhaW5lclVybCB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcblxuZXhwb3J0IGNsYXNzIFVybEJ1aWxkZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgICAgIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLmhvc3QgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLyoqIEB0eXBlIHtOdW1iZXJ9ICovXG4gICAgICAgIHRoaXMucG9ydCA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvKiogQHR5cGUge0FycmF5PFN0cmluZz59ICovXG4gICAgICAgIHRoaXMucGF0aEFycmF5ID0gbmV3IEFycmF5KCk7XG4gICAgICAgIFxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIEFycmF5PFN0cmluZz4+fSAqL1xuICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5hbmNob3IgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgQXJyYXk8U3RyaW5nPj59ICovXG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFVybEJ1aWxkZXIoKTtcbiAgICB9XG5cbiAgICB3aXRoQ3VycmVudFVybCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2l0aFVybChDb250YWluZXJVcmwuY3VycmVudFVybCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgICB3aXRoVXJsKHVybCkge1xuICAgICAgICB0aGlzLndpdGhBbGxPZlVybChVcmxVdGlscy5wYXJzZSh1cmwpKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgICB3aXRoUm9vdE9mVXJsKHVybCkge1xuICAgICAgICB0aGlzLnByb3RvY29sID0gdXJsLnByb3RvY29sO1xuICAgICAgICB0aGlzLnBvcnQgPSB1cmwucG9ydDtcbiAgICAgICAgdGhpcy5ob3N0ID0gdXJsLmhvc3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgIHdpdGhQYXRoT2ZVcmwodXJsKSB7XG4gICAgICAgIHRoaXMud2l0aFJvb3RPZlVybCh1cmwpO1xuICAgICAgICB0aGlzLnBhdGhBcnJheSA9IHVybC5wYXRoVmFsdWVBcnJheTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoQWxsT2ZVcmwodXJsKSB7XG4gICAgICAgIHRoaXMud2l0aFBhdGhPZlVybCh1cmwpO1xuICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwID0gdXJsLnF1ZXJ5UGFyYW1NYXA7XG4gICAgICAgIHRoaXMuYW5jaG9yID0gdXJsLmFuY2hvcjtcbiAgICAgICAgdGhpcy5hbmNob3JQYXJhbWV0ZXJNYXAgPSB1cmwuYW5jaG9yUGFyYW1NYXA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm90b2NvbCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoUHJvdG9jb2wocHJvdG9jb2wpIHtcbiAgICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcG9ydCBcbiAgICAgKiBAcmV0dXJucyB7VXJsQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoUG9ydChwb3J0KSB7XG4gICAgICAgIHRoaXMucG9ydCA9IHBvcnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBob3N0IFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhIb3N0KGhvc3QpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFBhdGgocGF0aCkge1xuICAgICAgICB0aGlzLnBhdGhBcnJheSA9IFVybFV0aWxzLnBhcnNlUGF0aEFycmF5KHBhdGgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYW5jaG9yIFxuICAgICAqIEByZXR1cm5zIHtVcmxCdWlsZGVyfVxuICAgICAqL1xuICAgIHdpdGhBbmNob3IoYW5jaG9yKSB7XG4gICAgICAgIC8vIFJlc2V0IGFuY2hvciBwYXJhbWV0ZXJzIHdoZW4gc2V0dGluZyBhbmNob3IgZGlyZWN0bHlcbiAgICAgICAgdGhpcy5hbmNob3JQYXJhbWV0ZXJNYXAgPSBudWxsO1xuICAgICAgICB0aGlzLmFuY2hvciA9IGFuY2hvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgd2l0aEFuY2hvclBhcmFtU3RyaW5nKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5jaG9yUGFyYW1ldGVyTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgXG4gICAgICogQHJldHVybnMge1VybEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFF1ZXJ5UGFyYW1TdHJpbmcoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5xdWVyeVBhcmFtZXRlck1hcCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJNYXAuc2V0KGtleSwgW3ZhbHVlXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgXG4gICAgICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSB2YWx1ZUFycmF5IFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHdpdGhRdWVyeVBhcmFtQXJyYXkoa2V5LCB2YWx1ZUFycmF5KSB7XG4gICAgICAgIGlmICh0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtZXRlck1hcC5zZXQoa2V5LCB2YWx1ZUFycmF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVwbGFjZVBhdGhWYWx1ZShmcm9tLCB0byl7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnBhdGhBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChTdHJpbmdVdGlscy5jb250YWlucyhmcm9tLCB0aGlzLnBhdGhBcnJheVtpXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhBcnJheVtpXSA9IHRoaXMucGF0aEFycmF5W2ldLnJlcGxhY2UoZnJvbSwgdG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSArKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBidWlsZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVcmwodGhpcy5wcm90b2NvbCwgdGhpcy5ob3N0LCB0aGlzLnBvcnQsIHRoaXMucGF0aEFycmF5LCB0aGlzLnF1ZXJ5UGFyYW1ldGVyTWFwLCB0aGlzLmFuY2hvciwgdGhpcy5hbmNob3JQYXJhbWV0ZXJNYXApO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBIaXN0b3J5IH0gZnJvbSBcIi4vaGlzdG9yeS5qc1wiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4uL3V0aWwvdXJsLmpzXCI7XG5pbXBvcnQgeyBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBVcmxCdWlsZGVyIH0gZnJvbSBcIi4uL3V0aWwvdXJsQnVpbGRlci5qc1wiO1xuXG5sZXQgbmF2aWdhdG9pb24gPSBudWxsO1xuXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbiB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtOYXZpZ2F0aW9ufVxuICAgICAqL1xuICAgIHN0YXRpYyBpbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCFuYXZpZ2F0b2lvbikge1xuICAgICAgICAgICAgbmF2aWdhdG9pb24gPSBuZXcgTmF2aWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZSBicm93c2VyIHRvIG5ldyB1cmxcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIGdvKHVybCkge1xuICAgICAgICBDb250YWluZXJVcmwuZ28odXJsLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5hdmlnYXRlIGJyb3dzZXIgYmFja1xuICAgICAqL1xuICAgIGJhY2soKSB7XG4gICAgICAgIENvbnRhaW5lclVybC5iYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBwYXRoIHdpdGhvdXQgcmVuYXZpZ2F0aW5nIGJyb3dzZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgICAqIEByZXR1cm5zIHtVcmx9XG4gICAgICovXG4gICAgbG9hZFBhdGgocGF0aCkge1xuICAgICAgICBjb25zdCB1cmwgPSBIaXN0b3J5LmN1cnJlbnRVcmwoKTtcbiAgICAgICAgY29uc3QgbmV3VXJsID0gVXJsQnVpbGRlci5jcmVhdGUoKS53aXRoUm9vdE9mVXJsKHVybCkud2l0aFBhdGgocGF0aCkuYnVpbGQoKTtcbiAgICAgICAgSGlzdG9yeS5wdXNoVXJsKG5ld1VybCk7XG4gICAgICAgIHJldHVybiBuZXdVcmw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBhbmNob3Igd2l0aG91dCByZW5hdmlnYXRpbmcgYnJvd3NlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbmNob3JcbiAgICAgKiBAcmV0dXJucyB7VXJsfVxuICAgICAqL1xuICAgIGxvYWRBbmNob3IoYW5jaG9yKSB7XG4gICAgICAgIGNvbnN0IHVybCA9IEhpc3RvcnkuY3VycmVudFVybCgpO1xuICAgICAgICBjb25zdCBuZXdVcmwgPSBVcmxCdWlsZGVyLmNyZWF0ZSgpLndpdGhSb290T2ZVcmwodXJsKS53aXRoQW5jaG9yKGFuY2hvcikuYnVpbGQoKTtcbiAgICAgICAgSGlzdG9yeS5wdXNoVXJsKG5ld1VybCk7XG4gICAgICAgIHJldHVybiBuZXdVcmw7XG4gICAgfVxuXG59IiwiZXhwb3J0IGNsYXNzIFRyYWlsTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgICAgIHRoaXMucm9vdCA9IGZhbHNlO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnRyYWlsID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge3Byb3BlcnR5fSAqL1xuICAgICAgICB0aGlzLnByb3BlcnR5ID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge2Z1bmN0aW9ufSAqL1xuICAgICAgICB0aGlzLndheXBvaW50ID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge2Z1bmN0aW9ufSAqL1xuICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge0FycmF5PFRyYWlsTm9kZT59ICovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTW9kdWxlUnVubmVyIH0gZnJvbSBcIi4vbW9kdWxlUnVubmVyLmpzXCI7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi9uYXZpZ2F0aW9uLmpzXCI7XG5pbXBvcnQgeyBUcmFpbE5vZGUgfSBmcm9tIFwiLi9uYXZpZ2F0aW9uL3RyYWlsTm9kZS5qc1wiO1xuXG5sZXQgYWN0aXZlTW9kdWxlUnVubmVyID0gbnVsbDtcblxuZXhwb3J0IGNsYXNzIEFjdGl2ZU1vZHVsZVJ1bm5lciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAvKiogQHR5cGUge01vZHVsZVJ1bm5lcn0gKi9cbiAgICAgICAgdGhpcy5tb2R1bGVSdW5uZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtBY3RpdmVNb2R1bGVSdW5uZXJ9XG4gICAgICovXG4gICAgc3RhdGljIGluc3RhbmNlKCkge1xuICAgICAgICBpZiAoIWFjdGl2ZU1vZHVsZVJ1bm5lcikge1xuICAgICAgICAgICAgYWN0aXZlTW9kdWxlUnVubmVyID0gbmV3IEFjdGl2ZU1vZHVsZVJ1bm5lcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3RpdmVNb2R1bGVSdW5uZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNb2R1bGVSdW5uZXJ9IG5ld01vZHVsZVJ1bm5lciBcbiAgICAgKi9cbiAgICBzZXQobmV3TW9kdWxlUnVubmVyKSB7XG4gICAgICAgIHRoaXMubW9kdWxlUnVubmVyID0gbmV3TW9kdWxlUnVubmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgYW5jaG9yIHdpdGhvdXQgcmVuYXZpZ2F0aW5nIGJyb3dzZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHJhaWwgXG4gICAgICovXG4gICAgIGFzeW5jIGxvYWQodHJhaWwpIHtcbiAgICAgICAgY29uc3QgdXJsID0gTmF2aWdhdGlvbi5pbnN0YW5jZSgpLmxvYWRBbmNob3IodHJhaWwpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5tb2R1bGVSdW5uZXIucnVuTW9kdWxlKHVybCk7XG4gICAgfVxufSIsImltcG9ydCB7IENvbnRhaW5lckh0dHBDbGllbnQsIENvbnRhaW5lckh0dHBSZXNwb25zZSwgQ29udGFpbmVyVXBsb2FkRGF0YSB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcbmltcG9ydCB7IE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENvbnRhaW5lckh0dHBSZXNwb25zZT58UHJvbWlzZTxDb250YWluZXJEb3dubG9hZD59XG4gICAgICovXG4gICAgc3RhdGljIGdldCh1cmwsIGF1dGhvcml6YXRpb24gPSBudWxsLCB0aW1lb3V0ID0gMTAwMCwgZG93bmxvYWQgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gQ2xpZW50LmdldEhlYWRlcihhdXRob3JpemF0aW9uKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgbW9kZTogJ2NvcnMnLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyAvLyBtYW51YWwsICpmb2xsb3csIGVycm9yXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvd25sb2FkKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC5kb3dubG9hZCh1cmwudG9TdHJpbmcoKSwgcGFyYW1zLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ29udGFpbmVySHR0cENsaWVudC5mZXRjaCh1cmwudG9TdHJpbmcoKSwgcGFyYW1zLCB0aW1lb3V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fENvbnRhaW5lclVwbG9hZERhdGF9IGRhdGFcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBwcm9ncmVjQ2FsbGJhY2tNZXRob2RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENvbnRhaW5lckh0dHBSZXNwb25zZT59XG4gICAgICovXG4gICAgc3RhdGljIHBvc3QodXJsLCBkYXRhLCBhdXRob3JpemF0aW9uID0gbnVsbCwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kID0gbnVsbCwgdGltZW91dCA9IDEwMDApe1xuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIENvbnRhaW5lclVwbG9hZERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LnVwbG9hZChcIlBPU1RcIiwgdXJsLCBkYXRhLCBhdXRob3JpemF0aW9uLCBwcm9ncmVjQ2FsbGJhY2tNZXRob2QsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBDbGllbnQuZ2V0SGVhZGVyKGF1dGhvcml6YXRpb24pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSAge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksIC8vIG11c3QgbWF0Y2ggJ0NvbnRlbnQtVHlwZScgaGVhZGVyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIG1vZGU6IFwiY29yc1wiLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiLCAvLyBtYW51YWwsICpmb2xsb3csIGVycm9yXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZmV0Y2godXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBkYXRhXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gcHJvZ3JlY0NhbGxiYWNrTWV0aG9kXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2U+fVxuICAgICAqL1xuICAgIHN0YXRpYyBwdXQodXJsLCBkYXRhLCBhdXRob3JpemF0aW9uID0gbnVsbCwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kID0gbnVsbCwgdGltZW91dCA9IDEwMDApe1xuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIENvbnRhaW5lclVwbG9hZERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LnVwbG9hZChcIlBVVFwiLCB1cmwsIGRhdGEsIGF1dGhvcml6YXRpb24sIHByb2dyZWNDYWxsYmFja01ldGhvZCwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGVhZGVycyA9IENsaWVudC5nZXRIZWFkZXIoYXV0aG9yaXphdGlvbik7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSwgLy8gbXVzdCBtYXRjaCAnQ29udGVudC1UeXBlJyBoZWFkZXJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsIFxuICAgICAgICAgICAgbW9kZTogJ2NvcnMnLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JywgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gZGF0YVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtNZXRob2R9IHByb2dyZWNDYWxsYmFja01ldGhvZFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0XG4gICAgICogQHJldHVybnMge1Byb21pc2U8Q29udGFpbmVySHR0cFJlc3BvbnNlPn1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGF0Y2godXJsLCBkYXRhLCBhdXRob3JpemF0aW9uID0gbnVsbCwgcHJvZ3JlY0NhbGxiYWNrTWV0aG9kID0gbnVsbCwgdGltZW91dCA9IDEwMDApIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IENsaWVudC5nZXRIZWFkZXIoYXV0aG9yaXphdGlvbik7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSwgLy8gbXVzdCBtYXRjaCAnQ29udGVudC1UeXBlJyBoZWFkZXJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJywgXG4gICAgICAgICAgICBtb2RlOiAnY29ycycsIC8vIG5vLWNvcnMsIGNvcnMsICpzYW1lLW9yaWdpblxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLCAvLyBtYW51YWwsICpmb2xsb3csIGVycm9yXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZmV0Y2godXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fENvbnRhaW5lclVwbG9hZERhdGF9IGRhdGFcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBwcm9ncmVjQ2FsbGJhY2tNZXRob2RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENvbnRhaW5lckh0dHBSZXNwb25zZT59XG4gICAgICovXG4gICAgc3RhdGljIGRlbGV0ZSh1cmwsIGRhdGEsIGF1dGhvcml6YXRpb24gPSBudWxsLCBwcm9ncmVjQ2FsbGJhY2tNZXRob2QgPSBudWxsLCB0aW1lb3V0ID0gMTAwMCkge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gQ2xpZW50LmdldEhlYWRlcihhdXRob3JpemF0aW9uKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9ICB7XG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksIC8vIG11c3QgbWF0Y2ggJ0NvbnRlbnQtVHlwZScgaGVhZGVyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBtb2RlOiAnY29ycycsIC8vIG5vLWNvcnMsIGNvcnMsICpzYW1lLW9yaWdpblxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JywgLy8gbWFudWFsLCAqZm9sbG93LCBlcnJvclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBDb250YWluZXJIdHRwQ2xpZW50LmZldGNoKHVybC50b1N0cmluZygpLCBwYXJhbXMsIHRpbWVvdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICAgIG1vZGU6ICdjb3JzJywgLy8gbm8tY29ycywgY29ycywgKnNhbWUtb3JpZ2luXG4gICAgICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLCAvLyBtYW51YWwsICpmb2xsb3csIGVycm9yXG4gICAgICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIENvbnRhaW5lckh0dHBDbGllbnQuZmV0Y2godXJsLnRvU3RyaW5nKCksIHBhcmFtcywgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0SGVhZGVyKGF1dGhvcml6YXRpb24gPSBudWxsKSB7XG4gICAgICAgIGlmIChhdXRob3JpemF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwidXNlci1hZ2VudFwiOiBcIk1vemlsbGEvNC4wIE1ETiBFeGFtcGxlXCIsXG4gICAgICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGF1dGhvcml6YXRpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJ1c2VyLWFnZW50XCI6IFwiTW96aWxsYS80LjAgTUROIEV4YW1wbGVcIixcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIH07XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBTdHlsZXNoZWV0IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZXNTb3VyY2UgXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc3R5bGVzU291cmNlKXtcblxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5zdHlsZXNTb3VyY2UgPSBzdHlsZXNTb3VyY2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRTdHlsZXNTb3VyY2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3R5bGVzU291cmNlO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBMb2dnZXIsIE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSBcIi4uL2NsaWVudC9jbGllbnQuanNcIjtcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgVXJsVXRpbHMgfSBmcm9tIFwiLi4vdXRpbC91cmxVdGlscy5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzaGVldCB9IGZyb20gXCIuL3N0eWxlc2hlZXQuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIlN0eWxlc1JlZ2lzdHJ5XCIpO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVzUmVnaXN0cnkge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgLyoqIEB0eXBlIHtNYXB9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwfSAqL1xuICAgICAgICB0aGlzLnN0eWxlc1VybE1hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge2ludGVnZXJ9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzUXVldWVTaXplID0gMDtcblxuICAgICAgICAvKiogQHR5cGUge01ldGhvZH0gKi9cbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICogQHBhcmFtIHtTdHlsZXN9IHN0eWxlcyBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIHNldChuYW1lLCBzdHlsZXMsIHVybCl7XG4gICAgICAgIGlmKHVybCAhPT0gdW5kZWZpbmVkICYmIHVybCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNVcmxNYXAuc2V0KG5hbWUsIHVybCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdHlsZXNNYXAuc2V0KG5hbWUsIHN0eWxlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICovXG4gICAgZ2V0KG5hbWUpe1xuICAgICAgICByZXR1cm4gdGhpcy5zdHlsZXNNYXAuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqL1xuICAgIGNvbnRhaW5zKG5hbWUpe1xuICAgICAgICBpZiAodGhpcy5zdHlsZXNNYXAuZ2V0KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtNZXRob2R9IGNhbGxiYWNrIFxuICAgICAqL1xuICAgIGRvbmUoY2FsbGJhY2spe1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuZG9DYWxsYmFjayh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0eWxlc1JlZ2lzdHJ5fSByZWdpc3RyeSBcbiAgICAgKi9cbiAgICBkb0NhbGxiYWNrKHJlZ2lzdHJ5KXtcbiAgICAgICAgaWYocmVnaXN0cnkuY2FsbGJhY2sgIT09IG51bGwgJiYgcmVnaXN0cnkuY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAgJiYgcmVnaXN0cnkuc3R5bGVzUXVldWVTaXplID09PSByZWdpc3RyeS5zdHlsZXNNYXAuZW50cmllcy5sZW5ndGgpe1xuICAgICAgICAgICAgdmFyIHRlbXBDYWxsYmFjayA9IHJlZ2lzdHJ5LmNhbGxiYWNrO1xuICAgICAgICAgICAgcmVnaXN0cnkuY2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgICAgdGVtcENhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICovXG4gICAgIGFzeW5jIGxvYWQobmFtZSwgdXJsKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzUXVldWVTaXplICsrO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5nZXQodXJsKTtcbiAgICAgICAgaWYoIXJlc3BvbnNlLm9rKXtcbiAgICAgICAgICAgIHRocm93IFwiVW5hYmxlIHRvIGxvYWQgc3R5bGVzIGZvciBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICB0aGlzLnNldChuYW1lLCBuZXcgU3R5bGVzaGVldCh0ZXh0KSwgdXJsKTtcbiAgICAgICAgdGhpcy5kb0NhbGxiYWNrKHRoaXMpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01hcDxzdHJpbmcsIHN0cmluZz59IG5hbWVVcmxNYXAgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3R5bGVzTG9hZGVkUHJvbWlzZShuYW1lVXJsTWFwKSB7XG4gICAgICAgIFxuICAgICAgICBpZighbmFtZVVybE1hcCB8fCBuYW1lVXJsTWFwLnNpemUgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxvYWRQcm9taXNlcyA9IFtdO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzO1xuICAgICAgICBuYW1lVXJsTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQuY29udGFpbnMoa2V5KSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxvYWRQcm9taXNlcy5wdXNoKHBhcmVudC5wcml2YXRlTG9hZChrZXksIFVybFV0aWxzLnBhcnNlKHZhbHVlKSkpO1xuICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwobG9hZFByb21pc2VzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIGFzeW5jIHByaXZhdGVMb2FkKG5hbWUsIHVybCkge1xuICAgICAgICBMT0cuaW5mbyhcIkxvYWRpbmcgc3R5bGVzIFwiICsgbmFtZSArIFwiIGF0IFwiICsgdXJsLnRvU3RyaW5nKCkpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LmdldCh1cmwpO1xuICAgICAgICBpZighcmVzcG9uc2Uub2spe1xuICAgICAgICAgICAgdGhyb3cgXCJVbmFibGUgdG8gbG9hZCBzdHlsZXMgZm9yIFwiICsgbmFtZSArIFwiIGF0IFwiICsgdXJsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IG5ldyBTdHlsZXNoZWV0KHRleHQpO1xuICAgICAgICB0aGlzLnNldChuYW1lLCBzdHlsZXMsIHVybCk7XG4gICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgfVxufSIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRle1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlU291cmNlIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlU291cmNlKXtcblxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVNvdXJjZSA9IHRlbXBsYXRlU291cmNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGVtcGxhdGVTb3VyY2UoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVTb3VyY2U7XG4gICAgfVxuXG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmltcG9ydCB7IExvZ2dlciwgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZSB9IGZyb20gXCIuL3RlbXBsYXRlLmpzXCI7XG5pbXBvcnQgeyBDbGllbnQgfSBmcm9tIFwiLi4vY2xpZW50L2NsaWVudC5qc1wiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4uL3V0aWwvdXJsLmpzXCI7XG5pbXBvcnQgeyBVcmxVdGlscyB9IGZyb20gXCIuLi91dGlsL3VybFV0aWxzLmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJUZW1wbGF0ZVJlZ2lzdHJ5XCIpO1xuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVSZWdpc3RyeSB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAvKiogQHR5cGUge01hcH0gKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZU1hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcH0gKi9cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVVybE1hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge2ludGVnZXJ9ICovXG4gICAgICAgIHRoaXMudGVtcGxhdGVRdWV1ZVNpemUgPSAwO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWV0aG9kfSAqL1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5sYW5ndWFnZVByZWZpeCA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmd1YWdlUHJlZml4IFxuICAgICAqL1xuICAgIHNldExhbmd1YWdlUHJlZml4KGxhbmd1YWdlUHJlZml4KSB7XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VQcmVmaXggPSBsYW5ndWFnZVByZWZpeDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1RlbXBsYXRlfSB0ZW1wbGF0ZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIHNldChuYW1lLHRlbXBsYXRlLHVybCl7XG4gICAgICAgIGlmKHVybCAhPT0gdW5kZWZpbmVkICYmIHVybCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZVVybE1hcC5zZXQobmFtZSwgdXJsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRlbXBsYXRlTWFwLnNldChuYW1lLCB0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICovXG4gICAgZ2V0KG5hbWUpe1xuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZU1hcC5nZXQobmFtZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgXG4gICAgICovXG4gICAgY29udGFpbnMobmFtZSl7XG4gICAgICAgIGlmICh0aGlzLnRlbXBsYXRlTWFwLmdldChuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBjYWxsYmFjayBcbiAgICAgKi9cbiAgICBkb25lKGNhbGxiYWNrKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmRvQ2FsbGJhY2sodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtUZW1wbGF0ZVJlZ2lzdHJ5fSByZWdpc3RyeSBcbiAgICAgKi9cbiAgICBkb0NhbGxiYWNrKHJlZ2lzdHJ5KXtcbiAgICAgICAgaWYodG1vLmNhbGxiYWNrICE9PSBudWxsICYmIHJlZ2lzdHJ5LmNhbGxiYWNrICE9PSB1bmRlZmluZWQgICYmIHJlZ2lzdHJ5LnRlbXBsYXRlUXVldWVTaXplID09PSByZWdpc3RyeS50ZW1wbGF0ZU1hcC5zaXplKCkpe1xuICAgICAgICAgICAgdmFyIHRlbXBDYWxsYmFjayA9IHJlZ2lzdHJ5LmNhbGxiYWNrO1xuICAgICAgICAgICAgcmVnaXN0cnkuY2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgICAgdGVtcENhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFxuICAgICAqIEBwYXJhbSB7VXJsfSB1cmwgXG4gICAgICovXG4gICAgYXN5bmMgbG9hZChuYW1lLCB1cmwpIHtcbiAgICAgICAgaWYodGhpcy5sYW5ndWFnZVByZWZpeCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdXJsLnBhdGhzTGlzdC5zZXRMYXN0KFxuICAgICAgICAgICAgICAgIHRoaXMubGFuZ3VhZ2VQcmVmaXggKyBcIi5cIiArXG4gICAgICAgICAgICAgICAgdXJsLnBhdGhzTGlzdC5nZXRMYXN0KClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZW1wbGF0ZVF1ZXVlU2l6ZSArKztcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQuZ2V0KHVybCk7XG4gICAgICAgIGlmKCFyZXNwb25zZS5vayl7XG4gICAgICAgICAgICB0aHJvdyBcIlVuYWJsZSB0byBsb2FkIHRlbXBsYXRlIGZvciBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICB0aGlzLnNldChuYW1lLG5ldyBUZW1wbGF0ZSh0ZXh0KSx1cmwpO1xuICAgICAgICB0aGlzLmRvQ2FsbGJhY2sodGhpcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0VGVtcGxhdGVzTG9hZGVkUHJvbWlzZShuYW1lVXJsTWFwKSB7XG4gICAgICAgIFxuICAgICAgICBpZighbmFtZVVybE1hcCB8fCBuYW1lVXJsTWFwLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbG9hZFByb21pc2VzID0gW107XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXM7XG4gICAgICAgIG5hbWVVcmxNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKHBhcmVudC5jb250YWlucyhrZXkpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxvYWRQcm9taXNlcy5wdXNoKHBhcmVudC5wcml2YXRlTG9hZChrZXksIFVybFV0aWxzLnBhcnNlKHZhbHVlKSkpO1xuICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwobG9hZFByb21pc2VzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqL1xuICAgIGFzeW5jIHByaXZhdGVMb2FkKG5hbWUsIHVybCkge1xuICAgICAgICBpZiAodGhpcy5sYW5ndWFnZVByZWZpeCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdXJsLnBhdGhzTGlzdC5zZXRMYXN0KFxuICAgICAgICAgICAgICAgIHRoaXMubGFuZ3VhZ2VQcmVmaXggKyBcIi5cIiArXG4gICAgICAgICAgICAgICAgdXJsLnBhdGhzTGlzdC5nZXRMYXN0KClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgTE9HLmluZm8oXCJMb2FkaW5nIHRlbXBsYXRlIFwiICsgbmFtZSArIFwiIGF0IFwiICsgdXJsLnRvU3RyaW5nKCkpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IENsaWVudC5nZXQodXJsKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vayl7XG4gICAgICAgICAgICB0aHJvdyBcIlVuYWJsZSB0byBsb2FkIHRlbXBsYXRlIGZvciBcIiArIG5hbWUgKyBcIiBhdCBcIiArIHVybDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZSh0ZXh0KTtcbiAgICAgICAgdGhpcy5zZXQobmFtZSwgdGVtcGxhdGUsIHVybCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSBcIi4vdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgVHlwZUNvbmZpZyB9IGZyb20gXCJtaW5kaV92MVwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiVGVtcGxhdGVQb3N0Q29uZmlnXCIpO1xuXG4vKipcbiAqIFRvIGJlIGFkZGVkIHRvIG1pbmRpIGFzIGEgc2luZ2xldG9uLiBXaWxsIHNjYW4gdGhyb3VnaCBhbGwgY29uZmlndXJlZCBjbGFzc2VzIHRoYXQgaGF2ZSBhIFRFTVBMQVRFX1VSTFxuICogc3RhdGljIGdldHRlciBhbmQgd2lsbCBhc3luY3Jvbm91c2x5IGxvYWQgdGhlbS4gUmV0dXJucyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiBhbGwgdGVtcGxhdGVzIGFyZSBsb2FkZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlc0xvYWRlciB7XG5cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VGVtcGxhdGVSZWdpc3RyeX0gdGVtcGxhdGVSZWdpc3RyeSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVJlZ2lzdHJ5KSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtUZW1wbGF0ZVJlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLnRlbXBsYXRlUmVnaXN0cnkgPSB0ZW1wbGF0ZVJlZ2lzdHJ5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZyxUeXBlQ29uZmlnPn0gY29uZmlnRW50cmllc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGxvYWQoY29uZmlnRW50cmllcykge1xuICAgICAgICBsZXQgdGVtcGxhdGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbmZpZ0VudHJpZXMuZm9yRWFjaCgoY29uZmlnRW50cnksIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbmZpZ0VudHJ5LmNsYXNzUmVmZXJlbmNlLlRFTVBMQVRFX1VSTCkge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlTWFwLnNldChjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5uYW1lLCBjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5URU1QTEFURV9VUkwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTsgXG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlUmVnaXN0cnkuZ2V0VGVtcGxhdGVzTG9hZGVkUHJvbWlzZSh0ZW1wbGF0ZU1hcCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBTdHlsZXNSZWdpc3RyeSB9IGZyb20gXCIuL3N0eWxlc1JlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBUeXBlQ29uZmlnIH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJTdHlsZXNMb2FkZXJcIik7XG5cbi8qKlxuICogVG8gYmUgYWRkZWQgdG8gbWluZGkgYXMgYSBzaW5nbGV0b24uIFdpbGwgc2NhbiB0aHJvdWdoIGFsbCBjb25maWd1cmVkIGNsYXNzZXMgdGhhdCBoYXZlIGEgU1RZTEVTX1VSTFxuICogc3RhdGljIGdldHRlciBhbmQgd2lsbCBhc3luY3Jvbm91c2x5IGxvYWQgdGhlbS4gUmV0dXJucyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiBhbGwgc3R5bGVzIGFyZSBsb2FkZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFN0eWxlc0xvYWRlciB7XG5cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3R5bGVzUmVnaXN0cnl9IHN0eWxlc1JlZ2lzdHJ5IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0eWxlc1JlZ2lzdHJ5KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBzdHlsZXNSZWdpc3RyeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01hcDxTdHJpbmcsIFR5cGVDb25maWc+fSBjb25maWdFbnRyaWVzXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgbG9hZChjb25maWdFbnRyaWVzKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlc01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uZmlnRW50cmllcy5mb3JFYWNoKChjb25maWdFbnRyeSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZihjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5TVFlMRVNfVVJMKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzTWFwLnNldChjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5uYW1lLCBjb25maWdFbnRyeS5jbGFzc1JlZmVyZW5jZS5TVFlMRVNfVVJMKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTsgXG4gICAgICAgIHJldHVybiB0aGlzLnN0eWxlc1JlZ2lzdHJ5LmdldFN0eWxlc0xvYWRlZFByb21pc2Uoc3R5bGVzTWFwKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENvbmZpZywgSW5qZWN0aW9uUG9pbnQsIFR5cGVDb25maWcgfSBmcm9tIFwibWluZGlfdjFcIjtcbmltcG9ydCB7IFN0eWxlc1JlZ2lzdHJ5IH0gZnJvbSBcIi4uL3N0eWxlcy9zdHlsZXNSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZWdpc3RyeSB9IGZyb20gXCIuLi90ZW1wbGF0ZS90ZW1wbGF0ZVJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZXNMb2FkZXIgfSBmcm9tIFwiLi4vdGVtcGxhdGUvdGVtcGxhdGVzTG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBTdHlsZXNMb2FkZXIgfSBmcm9tIFwiLi4vc3R5bGVzL3N0eWxlc0xvYWRlci5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQ29tcG9uZW50Q29uZmlnUHJvY2Vzc29yXCIpXG5cbi8qKlxuICogTWluZGkgY29uZmlnIHByb2Nlc3NvciB3aGljaCBsb2FkcyBhbGwgdGVtcGxhdGVzIGFuZCBzdHlsZXMgZm9yIGFsbCBjb25maWd1cmVkIGNvbXBvbmVudHNcbiAqIGFuZCB0aGVuIGNhbGxzIGFueSBleGlzdGluZyBjb21wb25lbnRMb2FkZWQgZnVuY3Rpb24gb24gZWFjaCBjb21wb25lbnRcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudENvbmZpZ1Byb2Nlc3NvciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1RlbXBsYXRlUmVnaXN0cnl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRlbXBsYXRlUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShUZW1wbGF0ZVJlZ2lzdHJ5KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1N0eWxlc1JlZ2lzdHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdHlsZXNSZWdpc3RyeSA9IEluamVjdGlvblBvaW50Lmluc3RhbmNlKFN0eWxlc1JlZ2lzdHJ5KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIHBvc3RDb25maWcoKXtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZXNMb2FkZXIgPSBuZXcgVGVtcGxhdGVzTG9hZGVyKHRoaXMudGVtcGxhdGVSZWdpc3RyeSk7XG4gICAgICAgIHRoaXMuc3R5bGVzTG9hZGVyID0gbmV3IFN0eWxlc0xvYWRlcih0aGlzLnN0eWxlc1JlZ2lzdHJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0NvbmZpZ30gY29uZmlnXG4gICAgICogQHBhcmFtIHtNYXA8c3RyaW5nLCBUeXBlQ29uZmlnPn0gdW5jb25maWd1cmVkQ29uZmlnRW50cmllc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHByb2Nlc3NDb25maWcoY29uZmlnLCB1bmNvbmZpZ3VyZWRDb25maWdFbnRyaWVzKSB7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICAgWyBcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlc0xvYWRlci5sb2FkKHVuY29uZmlndXJlZENvbmZpZ0VudHJpZXMpLCBcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc0xvYWRlci5sb2FkKHVuY29uZmlndXJlZENvbmZpZ0VudHJpZXMpIFxuICAgICAgICAgICAgXVxuICAgICAgICApO1xuICAgIH1cblxufSIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiXG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJMb2FkZXJJbnRlcmNlcHRvclwiKTtcblxuZXhwb3J0IGNsYXNzIExvYWRlckludGVyY2VwdG9yIHtcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIHByb2Nlc3MoKSB7XG4gICAgICAgIExPRy5pbmZvKFwiVW5pbXBsZW1lbnRlZCBMb2FkZXIgSW50ZXJjZXB0b3IgYnJlYWtzIGJ5IGRlZmF1bHRcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMb2dnZXIsIFN0cmluZ1V0aWxzIH0gZnJvbSBcImNvcmV1dGlsX3YxXCJcbmltcG9ydCB7IFVybCB9IGZyb20gXCIuLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgTG9hZGVySW50ZXJjZXB0b3IgfSBmcm9tIFwiLi9sb2FkZXJJbnRlcmNlcHRvci5qc1wiXG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJNb2R1bGVMb2FkZXJcIik7XG5cbmV4cG9ydCBjbGFzcyBNb2R1bGVMb2FkZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1vZHVsZVBhdGggXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRyYWlsU3RhcnQgXG4gICAgICogQHBhcmFtIHtBcnJheTxMb2FkZXJJbnRlcmNlcHRvcj59IGxvYWRlckludGVyY2VwdG9yc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1vZHVsZVBhdGgsIHRyYWlsU3RhcnQsIGxvYWRlckludGVyY2VwdG9ycyA9IFtdKSB7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tb2R1bGVQYXRoID0gbW9kdWxlUGF0aDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHJhaWxTdGFydCA9IHRyYWlsU3RhcnQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtBcnJheTxMb2FkZXJJbnRlcmNlcHRvcj59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmxvYWRlckludGVyY2VwdG9ycyA9IGxvYWRlckludGVyY2VwdG9ycztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1hdGNoZXMgaWYgdGhlIGNvbmZpZ3VyZWQgbWF0Y2hVcmwgc3RhcnRzIHdpdGggdGhlIHByb3ZpZGVkIHVybCBvclxuICAgICAqIGlmIHRoZSBjb25maWd1cmVkIG1hdGNoVXJsIGlzIG51bGxcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIG1hdGNoZXModXJsKXtcbiAgICAgICAgLy8gTm8gdHJhaWxTdGFydCBtZWFucyBkZWZhdWx0IG1hdGNoXG4gICAgICAgIGlmICghdGhpcy50cmFpbFN0YXJ0KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIHVybCBhbmQgbm9uIG51bGwgdHJhaWxTdGFydCwgbWVhbnMgbm8gbWF0Y2hcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcihcIlVybCBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gYW5jaG9yIG1hdGNoIG9ubHkgaWYgdHJhaWxTdGFydCBpcyBcIi9cIlxuICAgICAgICBpZiAoIXVybC5hbmNob3IpIHtcbiAgICAgICAgICAgIGlmIChTdHJpbmdVdGlscy5lcXVhbHModGhpcy50cmFpbFN0YXJ0LCBcIi9cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4YWN0IG1hdGNoIGZvciByb290IHRyYWlsU3RhcnRcbiAgICAgICAgaWYgKFN0cmluZ1V0aWxzLmVxdWFscyh0aGlzLnRyYWlsU3RhcnQsIFwiL1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmVxdWFscyh1cmwuYW5jaG9yLCB0aGlzLnRyYWlsU3RhcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLnN0YXJ0c1dpdGgodXJsLmFuY2hvciwgdGhpcy50cmFpbFN0YXJ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxNYWluPn1cbiAgICAgKi9cbiAgICBhc3luYyBsb2FkKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgdGhpcy5pbXBvcnRNb2R1bGUoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaW50ZXJjZXB0b3JzUGFzcygpO1xuICAgICAgICAgICAgcmV0dXJuIG1vZHVsZTtcbiAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgIExPRy53YXJuKFwiRmlsdGVyIHJlamVjdGVkIFwiICsgcmVhc29uKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgaW50ZXJjZXB0b3JzUGFzcygpIHtcbiAgICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gdGhpcy5sb2FkZXJJbnRlcmNlcHRvcnM7XG4gICAgICAgIGlmIChpbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCBpbnRlcmNlcHRvclByb21pc2VDaGFpbiA9IGludGVyY2VwdG9yc1swXS5wcm9jZXNzKCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGludGVyY2VwdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGludGVyY2VwdG9yUHJvbWlzZUNoYWluID0gaW50ZXJjZXB0b3JQcm9taXNlQ2hhaW4udGhlbihpbnRlcmNlcHRvcnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGludGVyY2VwdG9yUHJvbWlzZUNoYWluO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbXBvcnRNb2R1bGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGUgPSBhd2FpdCBpbXBvcnQodGhpcy5tb2R1bGVQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgbW9kdWxlLmRlZmF1bHQoKTtcbiAgICAgICAgfSBjYXRjaChyZWFzb24pICB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBUcmFpbE5vZGUgfSBmcm9tIFwiLi9uYXZpZ2F0aW9uL3RyYWlsTm9kZVwiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4vdXRpbC91cmxcIjtcblxuZXhwb3J0IGNsYXNzIE1vZHVsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAvKiogQHR5cGUge1VybH0gKi9cbiAgICAgICAgdGhpcy51cmwgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VHJhaWxOb2RlfSAqL1xuICAgICAgICB0aGlzLnRyYWlsTWFwID0gbnVsbDtcbiAgICB9XG5cbiAgICBhc3luYyBsb2FkKCkge1xuICAgICAgICB0aHJvdyBcIk1vZHVsZSBjbGFzcyBtdXN0IGltcGxlbWVudCBsb2FkKClcIjtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBBcnJheVV0aWxzLCBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIlxuaW1wb3J0IHsgTWluZGlDb25maWcsIE1pbmRpSW5qZWN0b3IgfSBmcm9tIFwibWluZGlfdjFcIjtcbmltcG9ydCB7IE1vZHVsZUxvYWRlciB9IGZyb20gXCIuL21vZHVsZUxvYWRlci5qc1wiO1xuaW1wb3J0IHsgTG9hZGVySW50ZXJjZXB0b3IgfSBmcm9tIFwiLi9sb2FkZXJJbnRlcmNlcHRvci5qc1wiXG5pbXBvcnQgeyBNb2R1bGUgfSBmcm9tIFwiLi4vbW9kdWxlLmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJEaU1vZHVsZUxvYWRlclwiKTtcblxuZXhwb3J0IGNsYXNzIERpTW9kdWxlTG9hZGVyIGV4dGVuZHMgTW9kdWxlTG9hZGVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtb2R1bGVQYXRoIFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0cmFpbE1hcCBcbiAgICAgKiBAcGFyYW0ge01pbmRpQ29uZmlnfSBjb25maWdcbiAgICAgKiBAcGFyYW0ge0FycmF5PExvYWRlckludGVyY2VwdG9yPn0gbG9hZGVySW50ZXJjZXB0b3JzXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobW9kdWxlUGF0aCwgdHJhaWxNYXAsIGNvbmZpZywgbG9hZGVySW50ZXJjZXB0b3JzID0gW10pIHtcbiAgICAgICAgc3VwZXIobW9kdWxlUGF0aCwgdHJhaWxNYXAsIGxvYWRlckludGVyY2VwdG9ycyk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNaW5kaUNvbmZpZ30gKi9cbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1Byb21pc2U8TW9kdWxlPn1cbiAgICAgKi9cbiAgICBhc3luYyBsb2FkKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgdGhpcy5pbXBvcnRNb2R1bGUoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaW50ZXJjZXB0b3JzUGFzcygpO1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IE1pbmRpSW5qZWN0b3IuaW5qZWN0KG1vZHVsZSwgdGhpcy5jb25maWcpO1xuICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgTE9HLndhcm4oXCJNb2R1bGUgbG9hZGVyIGZhaWxlZCBcIiArIHJlYXNvbik7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TW9kdWxlTG9hZGVyfSBtb2R1bGVMb2FkZXJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBhc3luYyBpbXBvcnRNb2R1bGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGUgPSBhd2FpdCBzdXBlci5pbXBvcnRNb2R1bGUoKTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmFkZEFsbFR5cGVDb25maWcobW9kdWxlLnR5cGVDb25maWdBcnJheSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbmZpZy5maW5hbGl6ZSgpO1xuICAgICAgICAgICAgY29uc3Qgd29ya2luZ0NvbmZpZyA9IHRoaXMuY29uZmlnO1xuICAgICAgICAgICAgYXdhaXQgQXJyYXlVdGlscy5wcm9taXNlQ2hhaW4odGhpcy5sb2FkZXJJbnRlcmNlcHRvcnMsIChsb2FkZXJJbnRlcmNlcHRvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBNaW5kaUluamVjdG9yLmluamVjdChsb2FkZXJJbnRlcmNlcHRvciwgd29ya2luZ0NvbmZpZyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBTdGF0ZUNoYW5nZSB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCBrZXksIGNoYW5nZSkge1xuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgIHRoaXMuY2hhbmdlID0gY2hhbmdlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IFN0YXRlQ2hhbmdlIH0gZnJvbSBcIi4vc3RhdGVDaGFuZ2VcIjtcblxuLyoqXG4gKiBTdGF0ZU1hbmFnZXJcbiAqIFxuICogQHRlbXBsYXRlIFQsIFQyXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hbmFnZXIge1xuXG4gICAgc3RhdGljIFNUQVRFX01BTkFHRVJfUFJPWFkgPSBTeW1ib2woJ3N0YXRlTWFuYWdlclByb3h5Jyk7XG5cbiAgICAvKiogQSBjaGFuZ2Ugd2FzIG9ic2VydmVkIGNyZWF0aW5nIGFkZGluZyBuZXcgZG9tYWluIG9iamVjdCAqL1xuICAgIHN0YXRpYyBDSEFOR0VfTkVXID0gXCJfX0NIQU5HRV9ORVdfX1wiO1xuXG4gICAgLyoqIEEgY2hhbmdlIHdhcyBvYnNlcnZlZCB1cGRhdGluZyBhbiBleGlzdGluZyBkb21haW4gb2JqZWN0ICovXG4gICAgc3RhdGljIENIQU5HRV9VUERBVEUgPSBcIl9fQ0hBTkdFX1VQREFURV9fXCI7XG5cbiAgICAvKiogQSBjaGFuZ2Ugd2FzIG9ic2VydmVkIHJlbW92aW5nIGFuIGV4aXN0aW5nIGRvbWFpbiBvYmplY3QgKi9cbiAgICBzdGF0aWMgQ0hBTkdFX1JFTU9WRSA9IFwiX19DSEFOR0VfUkVNT1ZFX19cIjtcblxuXG4gICAgLyoqIFRoaXMga2V5IG1hdGNoZXMgYW55IGtleSBpbiB0aGUgZG9tYWluIG1hcCAqL1xuICAgIHN0YXRpYyBLRVlfQU5ZID0gXCJfX0tFWV9BTllfX1wiO1xuXG4gICAgLyoqIFRoZSBkZWZhdWx0IGtleSB1c2VkIHdoZW4gbm8gc3BlY2lmaWMga2V5IGlzIHByb3ZpZGVkICovXG4gICAgc3RhdGljIEtFWV9ERUZBVUxUID0gXCJfX0tFWV9ERUZBVUxUX19cIjtcblxuXG4gICAgLyoqIEEgdHJpZ2dlciB0byBjcmVhdGUgYW4gb2JqZWN0IG9yIG9iamVjdHMgZG93bnN0cmVhbSwgcmVzdWx0ZWQgaW4gYSBkb21haW4gY2hhbmdlICovXG4gICAgc3RhdGljIFRSSUdHRVJfQ1JFQVRFID0gXCJfX1RSSUdHRVJfQ1JFQVRFX19cIjtcblxuICAgIC8qKiBBIHRyaWdnZXIgdG8gZGVsZXRlIGFuIG9iamVjdCBvciBvYmplY3RzIGRvd25zdHJlYW0sIHJlc3VsdGVkIGluIGEgZG9tYWluIGNoYW5nZSAqL1xuICAgIHN0YXRpYyBUUklHR0VSX0RFTEVURSA9IFwiX19UUklHR0VSX0RFTEVURV9fXCI7XG5cbiAgICAvKiogQSB0cmlnZ2VyIHRvIHVwZGF0ZSBhbiBvYmplY3Qgb3Igb2JqZWN0cyBkb3duc3RyZWFtLCByZXN1bHRlZCBpbiBhIGRvbWFpbiBjaGFuZ2UgKi9cbiAgICBzdGF0aWMgVFJJR0dFUl9VUERBVEUgPSBcIl9fVFJJR0dFUl9VUERBVEVfX1wiO1xuXG4gICAgLyoqIEEgdHJpZ2dlciB0byByZWFkIGFuIG9iamVjdCBvciBvYmplY3RzIGRvd25zdHJlYW0sIHJlc3VsdGVkIGluIGEgZG9tYWluIGNoYW5nZSAqL1xuICAgIHN0YXRpYyBUUklHR0VSX1JFQUQgPSBcIl9fVFJJR0dFUl9SRUFEX19cIjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIFQ+fSAqL1xuICAgICAgICB0aGlzLmRvbWFpbk1hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIFQyPn0gKi9cbiAgICAgICAgdGhpcy5lcnJvck1hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIEFycmF5PE1ldGhvZD59ICovXG4gICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWFwPFN0cmluZywgQXJyYXk8TWV0aG9kPn0gKi9cbiAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2FueX0gY29udGV4dFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGRvbWFpbkxpc3RlbmVyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JMaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICAgKi9cbiAgICByZWFjdChjb250ZXh0LCBkb21haW5MaXN0ZW5lckZ1bmN0aW9uLCBlcnJvckxpc3RlbmVyRnVuY3Rpb24gPSBudWxsLCBrZXkgPSBTdGF0ZU1hbmFnZXIuS0VZX0RFRkFVTFQpIHtcblxuICAgICAgICAvLyBJZiBrZXkgaXMgQU5ZLCB0aGVuIHdlIGFyZSBwYXNzaW5nIGFuIGFycmF5LCBzbyB0aGUgbGlzdGVuZXIgc2hvdWxkIGV4cGVjdCBhbiBhcnJheSBvZiBzdGF0ZSBjaGFuZ2VzIHJhdGhlciB0aGFuIGluZGl2aWR1YWwgb2JqZWN0cy5cbiAgICAgICAgY29uc3QgZG9tYWluTGlzdGVuZXIgPSBuZXcgTWV0aG9kKGRvbWFpbkxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHQpO1xuICAgICAgICBjb25zdCBlcnJvckxpc3RlbmVyID0gZXJyb3JMaXN0ZW5lckZ1bmN0aW9uID8gbmV3IE1ldGhvZChlcnJvckxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHQsIGtleSAhPSBTdGF0ZU1hbmFnZXIuS0VZX0FOWSkgOiBudWxsO1xuXG4gICAgICAgIGlmICghdGhpcy5kb21haW5MaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLnNldChrZXksIG5ldyBBcnJheSgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRvbWFpbkxpc3RlbmVycy5nZXQoa2V5KS5wdXNoKGRvbWFpbkxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoZXJyb3JMaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZXJyb3JMaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLnNldChrZXksIG5ldyBBcnJheSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMuZ2V0KGtleSkucHVzaChlcnJvckxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBvYmplY3RBcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5kb21haW5NYXAudmFsdWVzKCkpO1xuICAgIH1cblxuICAgIGFzeW5jIHVwZGF0ZUVycm9yKGVycm9yLCBrZXkgPSBTdGF0ZU1hbmFnZXIuS0VZX0RFRkFVTFQpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZXJyb3JNYXAuc2V0KGtleSwgZXJyb3IpO1xuICAgICAgICB0aGlzLnNpZ25hbEVycm9yQ2hhbmdlKGVycm9yLCBrZXkpO1xuICAgIH1cblxuICAgIGFzeW5jIHVwZGF0ZURvbWFpbkJ5QXJyYXkoYXJyYXksIHByb3BlcnR5LCB0cmlnZ2VyID0gU3RhdGVNYW5hZ2VyLlRSSUdHRVJfUkVBRCkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyYXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1cGRhdGVEb21haW5BcnJheSBleHBlY3RzIGFuIGFycmF5XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdGVDaGFuZ2VBcnJheSA9IG5ldyBBcnJheSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBwcm94aWVzIGZvciBlYWNoIG9iamVjdCBpbiB0aGUgYXJyYXkgYW5kIGNvbGxlY3QgdGhlaXIgcHJvcGVydHkgdmFsdWVzIGFzIHVwZGF0ZSBrZXlzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdCA9IGFycmF5W2ldO1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICAgICAgICBjb25zdCBwcm94eU9iamVjdCA9IHRoaXMuY3JlYXRlUHJveHkob2JqZWN0LCBwcm9wZXJ0eVZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgIHN0YXRlQ2hhbmdlQXJyYXkucHVzaChuZXcgU3RhdGVDaGFuZ2UocHJveHlPYmplY3QsIHByb3BlcnR5VmFsdWUsIHRoaXMuZG9tYWluTWFwLmhhcyhwcm9wZXJ0eVZhbHVlKSA/IFN0YXRlTWFuYWdlci5DSEFOR0VfVVBEQVRFIDogU3RhdGVNYW5hZ2VyLkNIQU5HRV9ORVcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZG9tYWluIG1hcCB3aXRoIHRoZSBuZXcgcHJveGllc1xuICAgICAgICBmb3IgKGNvbnN0IHN0YXRlQ2hhbmdlIG9mIHN0YXRlQ2hhbmdlQXJyYXkpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb2JqZWN0LCBrZXksIGNoYW5nZSB9ID0gc3RhdGVDaGFuZ2U7XG4gICAgICAgICAgICB0aGlzLmRvbWFpbk1hcC5zZXQoa2V5LCBvYmplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2lnbmFsIGRvbWFpbiBjaGFuZ2UgZm9yIGVhY2ggdXBkYXRlZCBrZXlcbiAgICAgICAgdGhpcy5zaWduYWxEb21haW5DaGFuZ2Uoc3RhdGVDaGFuZ2VBcnJheSk7XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlRG9tYWluQnlNYXAobWFwLCB0cmlnZ2VyID0gU3RhdGVNYW5hZ2VyLlRSSUdHRVJfUkVBRCkge1xuICAgICAgICBpZiAoIShtYXAgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1cGRhdGVEb21haW5CeU1hcCBleHBlY3RzIGEgTWFwXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdGVDaGFuZ2VBcnJheSA9IG5ldyBBcnJheSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHByb3hpZXMgZm9yIGVhY2ggdmFsdWUgaW4gdGhlIG1hcCBhbmQgY29sbGVjdCB0aGVpciBrZXlzIGFzIHVwZGF0ZSBrZXlzXG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3h5VmFsdWUgPSB0aGlzLmNyZWF0ZVByb3h5KHZhbHVlLCBrZXksIHRoaXMpO1xuICAgICAgICAgICAgc3RhdGVDaGFuZ2VBcnJheS5wdXNoKG5ldyBTdGF0ZUNoYW5nZShwcm94eVZhbHVlLCBrZXksIHRoaXMuZG9tYWluTWFwLmhhcyhrZXkpID8gU3RhdGVNYW5hZ2VyLkNIQU5HRV9VUERBVEUgOiBTdGF0ZU1hbmFnZXIuQ0hBTkdFX05FVykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkb21haW4gbWFwIHdpdGggdGhlIG5ldyBwcm94aWVzIGFuZCByZWNvcmQgdGhlaXIgY2hhbmdlIHR5cGVzXG4gICAgICAgIGZvciAoY29uc3Qgc3RhdGVDaGFuZ2Ugb2Ygc3RhdGVDaGFuZ2VBcnJheSkge1xuICAgICAgICAgICAgY29uc3QgeyBvYmplY3QsIGtleSwgY2hhbmdlIH0gPSBzdGF0ZUNoYW5nZTtcbiAgICAgICAgICAgIHRoaXMuZG9tYWluTWFwLnNldChrZXksIG9iamVjdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaWduYWwgZG9tYWluIGNoYW5nZSBmb3IgZWFjaCB1cGRhdGVkIGtleVxuICAgICAgICB0aGlzLnNpZ25hbERvbWFpbkNoYW5nZShzdGF0ZUNoYW5nZUFycmF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge2FueX0gb2JqZWN0IHRoZSBkb21haW4gb2JqZWN0IHRvIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0cmlnZ2VyIHRoZSB0cmlnZ2VyIHR5cGUgdGhhdCBjYXVzZWQgdGhlIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgdGhlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIGRvbWFpbiBvYmplY3RcbiAgICAgKiBAcmV0dXJucyB7YW55fSB0aGUgcHJveGllZCBkb21haW4gb2JqZWN0IGFmdGVyIHRoZSB1cGRhdGVcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVEb21haW4ob2JqZWN0LCBrZXkgPSBTdGF0ZU1hbmFnZXIuS0VZX0RFRkFVTFQsIHRyaWdnZXIgPSBTdGF0ZU1hbmFnZXIuVFJJR0dFUl9SRUFEKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkgfHwgb2JqZWN0IGluc3RhbmNlb2YgTWFwICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidXBkYXRlRG9tYWluIGV4cGVjdHMgYSBzaW5nbGUgb2JqZWN0LCBub3QgYW4gYXJyYXkgb3IgbWFwXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJveHlPYmplY3QgPSB0aGlzLmNyZWF0ZVByb3h5KG9iamVjdCwga2V5LCB0aGlzKTtcblxuICAgICAgICBsZXQgY2hhbmdlID0gdGhpcy5kb21haW5NYXAuaGFzKGtleSkgPyBTdGF0ZU1hbmFnZXIuQ0hBTkdFX1VQREFURSA6IFN0YXRlTWFuYWdlci5DSEFOR0VfTkVXO1xuXG4gICAgICAgIHRoaXMuZG9tYWluTWFwLnNldChrZXksIHByb3h5T2JqZWN0KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5lcnJvck1hcC5nZXQoa2V5KSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yTWFwLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxFcnJvckNoYW5nZShudWxsLCBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2lnbmFsRG9tYWluQ2hhbmdlKFtuZXcgU3RhdGVDaGFuZ2UocHJveHlPYmplY3QsIGtleSwgY2hhbmdlKV0sIHRyaWdnZXIpO1xuICAgICAgICByZXR1cm4gcHJveHlPYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyaWdnZXIgdGhlIHRyaWdnZXIgdHlwZSB0aGF0IGNhdXNlZCB0aGUgZGVsZXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IHRoZSBrZXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBkb21haW4gb2JqZWN0IHRvIGRlbGV0ZVxuICAgICAqL1xuICAgIGFzeW5jIHJlbW92ZShrZXkgPSBTdGF0ZU1hbmFnZXIuS0VZX0RFRkFVTFQsIHRyaWdnZXIgPSBTdGF0ZU1hbmFnZXIuVFJJR0dFUl9ERUxFVEUpIHtcblxuICAgICAgICB0aGlzLmRvbWFpbk1hcC5kZWxldGUoa2V5KTtcbiAgICAgICAgdGhpcy5lcnJvck1hcC5kZWxldGUoa2V5KTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5kb21haW5NYXAuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsRG9tYWluQ2hhbmdlKFtuZXcgU3RhdGVDaGFuZ2UodGhpcy5kb21haW5NYXAuZ2V0KGtleSksIGtleSwgU3RhdGVNYW5hZ2VyLkNIQU5HRV9SRU1PVkUpXSwgdHJpZ2dlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU3RhdGVNYW5hZ2VyLktFWV9ERUZBVUxUICE9PSBrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycy5kZWxldGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJlc2V0KCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgc3RhdGVDaGFuZ2VBcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBrZXkgb2YgdGhpcy5kb21haW5NYXAua2V5cygpKSB7XG4gICAgICAgICAgICBzdGF0ZUNoYW5nZUFycmF5LnB1c2gobmV3IFN0YXRlQ2hhbmdlKHRoaXMuZG9tYWluTWFwLmdldChrZXkpLCBrZXksIFN0YXRlTWFuYWdlci5DSEFOR0VfUkVNT1ZFKSwgU3RhdGVNYW5hZ2VyLlRSSUdHRVJfUkVBRCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaWduYWxEb21haW5DaGFuZ2Uoc3RhdGVDaGFuZ2VBcnJheSk7XG5cbiAgICAgICAgdGhpcy5kb21haW5NYXAuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5lcnJvck1hcC5jbGVhcigpO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmVycm9yTGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBzdGF0ZUNoYW5nZUFycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGtleSBvZiB0aGlzLmRvbWFpbk1hcC5rZXlzKCkpIHtcbiAgICAgICAgICAgIHN0YXRlQ2hhbmdlQXJyYXkucHVzaChuZXcgU3RhdGVDaGFuZ2UodGhpcy5kb21haW5NYXAuZ2V0KGtleSksIGtleSwgU3RhdGVNYW5hZ2VyLkNIQU5HRV9SRU1PVkUpLCBTdGF0ZU1hbmFnZXIuVFJJR0dFUl9SRUFEKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNpZ25hbERvbWFpbkNoYW5nZShzdGF0ZUNoYW5nZUFycmF5KTtcblxuICAgICAgICB0aGlzLmRvbWFpbk1hcC5jbGVhcigpO1xuICAgICAgICBjb25zdCBhbnlLZXlEb21haW5MaXN0ZW5lciA9IHRoaXMuZG9tYWluTGlzdGVuZXJzLmdldChTdGF0ZU1hbmFnZXIuS0VZX0FOWSk7XG4gICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZG9tYWluTGlzdGVuZXJzLnNldChTdGF0ZU1hbmFnZXIuS0VZX0FOWSwgYW55S2V5RG9tYWluTGlzdGVuZXIpO1xuXG4gICAgICAgIHRoaXMuZXJyb3JNYXAuY2xlYXIoKTtcbiAgICAgICAgY29uc3QgYW55S2V5RXJyb3JMaXN0ZW5lcnMgPSB0aGlzLmVycm9yTGlzdGVuZXJzLmdldChTdGF0ZU1hbmFnZXIuS0VZX0FOWSk7XG4gICAgICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5lcnJvckxpc3RlbmVycy5zZXQoU3RhdGVNYW5hZ2VyLktFWV9BTlksIGFueUtleUVycm9yTGlzdGVuZXJzKTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2lnbmFscyBhIGRvbWFpbiBjaGFuZ2UgdG8gYWxsIGxpc3RlbmVycyBmb3IgYSBzcGVjaWZpYyBrZXkuXG4gICAgICogQHBhcmFtIHtTdGF0ZUNoYW5nZVtdfSBzdGF0ZUNoYW5nZUFycmF5IC0gQW4gYXJyYXkgb2YgU3RhdGVDaGFuZ2Ugb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyaWdnZXIgLSBUaGUgdHJpZ2dlciB0aGF0IGNhdXNlZCB0aGUgZG9tYWluIGNoYW5nZS5cbiAgICAgKi9cbiAgICBzaWduYWxEb21haW5DaGFuZ2Uoc3RhdGVDaGFuZ2VBcnJheSwgdHJpZ2dlciA9IFN0YXRlTWFuYWdlci5UUklHR0VSX1JFQUQpIHtcblxuICAgICAgICAvLyBTaWduYWwgZG9tYWluIGNoYW5nZXMgdG8gYWxsIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmljIGtleVxuICAgICAgICBmb3IgKGNvbnN0IHN0YXRlQ2hhbmdlIG9mIHN0YXRlQ2hhbmdlQXJyYXkpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb2JqZWN0LCBrZXksIGNoYW5nZSB9ID0gc3RhdGVDaGFuZ2U7XG4gICAgICAgICAgICBpZiAoa2V5ICE9IFN0YXRlTWFuYWdlci5LRVlfREVGQVVMVCAmJiAhdGhpcy5kb21haW5MaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZG9tYWluTGlzdGVuZXJzLmdldChrZXkpKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChbb2JqZWN0LCBrZXksIGNoYW5nZSwgdHJpZ2dlcl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmRvbWFpbkxpc3RlbmVycy5oYXMoU3RhdGVNYW5hZ2VyLktFWV9BTlkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaWduYWwgZG9tYWluIGNoYW5nZXMgdG8gYWxsIGxpc3RlbmVycyBmb3IgYW55IGtleSwgYW5kIGZpbmlzaCB3aXRoIGZpbmFsaXplIGZvciB0aGUgY29sbGVjdGVkIGNoYW5nZXNcbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5kb21haW5MaXN0ZW5lcnMuZ2V0KFN0YXRlTWFuYWdlci5LRVlfQU5ZKSkge1xuICAgICAgICAgICAgLy8gUGFzcyB0aGUgZXZlcnkgc3RhdGUgY2hhbmdlIHRvIHRoZSBsaXN0ZW5lciBmb3IgdGhlIEFOWSBrZXlcbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwoW3N0YXRlQ2hhbmdlQXJyYXksIHRyaWdnZXJdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNpZ25hbHMgYW4gZXJyb3IgY2hhbmdlIHRvIGFsbCBsaXN0ZW5lcnMgZm9yIGEgc3BlY2lmaWMga2V5LlxuICAgICAqIEBwYXJhbSB7YW55fSBlcnJvciAtIFRoZSBlcnJvciB0aGF0IGhhcyBvY2N1cnJlZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gVGhlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIGVycm9yLlxuICAgICAqL1xuICAgIHNpZ25hbEVycm9yQ2hhbmdlKGVycm9yLCBrZXkpIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JMaXN0ZW5lcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZXJyb3JMaXN0ZW5lcnMuZ2V0KGtleSkpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKFtlcnJvciwga2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5ICE9IFN0YXRlTWFuYWdlci5LRVlfQU5ZICYmIHRoaXMuZXJyb3JMaXN0ZW5lcnMuaGFzKFN0YXRlTWFuYWdlci5LRVlfQU5ZKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5lcnJvckxpc3RlbmVycy5nZXQoU3RhdGVNYW5hZ2VyLktFWV9BTlkpKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChbZXJyb3IsIGtleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHthbnl9IG9iamVjdCBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFxuICAgICAqIEBwYXJhbSB7U3RhdGVNYW5hZ2VyfSBzdGF0ZU1hbmFnZXIgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgY3JlYXRlUHJveHkob2JqZWN0LCBrZXksIHN0YXRlTWFuYWdlcikge1xuICAgICAgICBpZiAob2JqZWN0W1N0YXRlTWFuYWdlci5TVEFURV9NQU5BR0VSX1BST1hZXSkge1xuICAgICAgICAgICAgTE9HLndhcm4oXCJPYmplY3QgaXMgYWxyZWFkeSBhIHN0YXRlIG1hbmFnZXIgcHJveHkuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iamVjdCwge1xuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSBTdGF0ZU1hbmFnZXIuU1RBVEVfTUFOQUdFUl9QUk9YWSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogU2lnbmFscyBhIGRvbWFpbiBjaGFuZ2Ugd2hlbiBhIHByb3BlcnR5IGlzIHNldCBvbiB0aGUgc3RhdGUgbWFuYWdlZCBvYmplY3QuXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2FueX0gdGFyZ2V0IFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3AgXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgXG4gICAgICAgICAgICAgKiBAcmV0dXJucyBcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRbcHJvcF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBzdWNjZXNzID0gKHRhcmdldFtwcm9wXSA9IHZhbHVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZUNoYW5nZSA9IG5ldyBTdGF0ZUNoYW5nZSh0YXJnZXQsIGtleSwgU3RhdGVNYW5hZ2VyLkNIQU5HRV9VUERBVEUpO1xuICAgICAgICAgICAgICAgIHN0YXRlTWFuYWdlci5zaWduYWxEb21haW5DaGFuZ2UoW3N0YXRlQ2hhbmdlXSwgU3RhdGVNYW5hZ2VyLlRSSUdHRVJfUkVBRCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MgPT09IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBNYXAgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIFVuaXF1ZUlkUmVnaXN0cnkge1xuXG4gICAgaWRBdHRyaWJ1dGVXaXRoU3VmZml4IChpZCkge1xuICAgICAgICBpZihpZE5hbWVzLmNvbnRhaW5zKGlkKSkge1xuICAgICAgICAgICAgdmFyIG51bWJlciA9IGlkTmFtZXMuZ2V0KGlkKTtcbiAgICAgICAgICAgIGlkTmFtZXMuc2V0KGlkLG51bWJlcisxKTtcbiAgICAgICAgICAgIHJldHVybiBpZCArIFwiLVwiICsgbnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlkTmFtZXMuc2V0KGlkLDEpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG59XG5cbnZhciBpZE5hbWVzID0gbmV3IE1hcCgpOyIsImV4cG9ydCBjbGFzcyBBdHRyaWJ1dGUge1xuXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlID0gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlLnZhbHVlO1xuICAgIH1cblxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUubmFtZTtcbiAgICB9XG5cbiAgICBnZXQgbmFtZXNwYWNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUubmFtZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCB9IGZyb20gXCJjb250YWluZXJicmlkZ2VfdjFcIjtcblxuZXhwb3J0IGNsYXNzIE1hcHBlZENvbnRhaW5lckVsZW1lbnQge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtDb250YWluZXJFbGVtZW50fSBlbGVtZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcblxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRhaW5lckVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBAdHlwZSB7Q29udGFpbmVyRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDb250YWluZXJFbGVtZW50LCBDb250YWluZXJFbGVtZW50VXRpbHMgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IFhtbEVsZW1lbnQgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBNYXBwZWRDb250YWluZXJFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvbWFwcGVkQ29udGFpbmVyRWxlbWVudFwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiRWxlbWVudFV0aWxzXCIpO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudFV0aWxzIHtcblxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlIFxuICAgICAqIEBwYXJhbSB7TWFwcGVkQ29udGFpbmVyRWxlbWVudH0gcGFyZW50IFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVDb250YWluZXJFbGVtZW50KHZhbHVlLCBwYXJlbnQpIHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgWG1sRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIEVsZW1lbnRVdGlscy5jcmVhdGVGcm9tWG1sRWxlbWVudCh2YWx1ZSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZUVsZW1lbnQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChDb250YWluZXJFbGVtZW50VXRpbHMuaXNVSUVsZW1lbnQodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbnRhaW5lckVsZW1lbnQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIExPRy5lcnJvcihcIlVucmVjb2duaXplZCB2YWx1ZSBmb3IgRWxlbWVudFwiKTtcbiAgICAgICAgTE9HLmVycm9yKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJyb3dzZXIgRWxlbWVudCBmcm9tIHRoZSBYbWxFbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IHhtbEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge01hcHBlZENvbnRhaW5lckVsZW1lbnR9IHBhcmVudEVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbVhtbEVsZW1lbnQoeG1sRWxlbWVudCwgcGFyZW50RWxlbWVudCkge1xuICAgICAgICBsZXQgZWxlbWVudCA9IG51bGw7XG4gICAgICAgIGlmICh4bWxFbGVtZW50Lm5hbWVzcGFjZSkge1xuICAgICAgICAgICAgZWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVFbGVtZW50TlMoeG1sRWxlbWVudC5uYW1lc3BhY2VVcmksIHhtbEVsZW1lbnQuZnVsbE5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVFbGVtZW50KHhtbEVsZW1lbnQubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudEVsZW1lbnQgJiYgcGFyZW50RWxlbWVudC5jb250YWluZXJFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBwYXJlbnRFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgeG1sRWxlbWVudC5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZUtleSwgYXR0cmlidXRlKSA9PiB7XG4gICAgICAgICAgICBDb250YWluZXJFbGVtZW50VXRpbHMuc2V0QXR0cmlidXRlVmFsdWUoZWxlbWVudCwgYXR0cmlidXRlS2V5LCBhdHRyaWJ1dGUudmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgTWFwLCBMb2dnZXIsIExpc3QsIE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCwgQ29udGFpbmVyRWxlbWVudFV0aWxzLCBDb250YWluZXJUZXh0IH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgQXR0cmlidXRlIH0gZnJvbSBcIi4vYXR0cmlidXRlLmpzXCI7XG5pbXBvcnQgeyBFbGVtZW50VXRpbHMgfSBmcm9tIFwiLi4vdXRpbC9lbGVtZW50VXRpbHMuanNcIjtcbmltcG9ydCB7IE1hcHBlZENvbnRhaW5lckVsZW1lbnQgfSBmcm9tIFwiLi9tYXBwZWRDb250YWluZXJFbGVtZW50LmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJCYXNlRWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIGJhc2UgY2xhc3MgZm9yIGVuY2xvc2luZyBhbiBIVE1MRWxlbWVudFxuICovXG5leHBvcnQgY2xhc3MgQmFzZUVsZW1lbnQgZXh0ZW5kcyBNYXBwZWRDb250YWluZXJFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR8c3RyaW5nfGFueX0gdmFsdWUgVmFsdWUgdG8gYmUgY29udmVydGVkIHRvIENvbnRhaW5lciBVSSBFbGVtZW50IChIVE1MRWxlbWVudCBpbiB0aGUgY2FzZSBvZiBXZWIgQnJvd3NlcilcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgdGhlIHBhcmVudCBCYXNlRWxlbWVudFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoRWxlbWVudFV0aWxzLmNyZWF0ZUNvbnRhaW5lckVsZW1lbnQodmFsdWUsIHBhcmVudCkpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuZXZlbnRzQXR0YWNoZWQgPSBuZXcgTGlzdCgpO1xuICAgIH1cblxuICAgIGxvYWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICBpZiAodGhpcy5jb250YWluZXJFbGVtZW50LmF0dHJpYnV0ZXMgPT09IG51bGwgfHwgdGhpcy5jb250YWluZXJFbGVtZW50LmF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlTWFwID09PSBudWxsIHx8IHRoaXMuYXR0cmlidXRlTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTWFwLnNldCh0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXR0cmlidXRlc1tpXS5uYW1lLG5ldyBBdHRyaWJ1dGUodGhpcy5jb250YWluZXJFbGVtZW50LmF0dHJpYnV0ZXNbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0T2JqZWN0XG4gICAgICogQHBhcmFtIHtib29sZWFufSBjYXB0dXJlXG4gICAgICogQHJldHVybnMge0Jhc2VFbGVtZW50fVxuICAgICAqL1xuICAgIGxpc3RlblRvKGV2ZW50VHlwZSwgbGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCwgY2FwdHVyZSA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IE1ldGhvZChsaXN0ZW5lckZ1bmN0aW9uLCBjb250ZXh0T2JqZWN0KTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCBmdWxsTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC50YWdOYW1lO1xuICAgIH1cblxuICAgIGdldCB0b3AoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYm91bmRpbmdDbGllbnRSZWN0LnRvcDtcbiAgICB9XG5cbiAgICBnZXQgYm90dG9tKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LmJvdW5kaW5nQ2xpZW50UmVjdC5ib3R0b207XG4gICAgfVxuXG4gICAgZ2V0IGxlZnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYm91bmRpbmdDbGllbnRSZWN0LmxlZnQ7XG4gICAgfVxuXG4gICAgZ2V0IHJpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LmJvdW5kaW5nQ2xpZW50UmVjdC5yaWdodDtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0IGF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHRoaXMubG9hZEF0dHJpYnV0ZXMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwO1xuICAgIH1cblxuICAgIHNldEF0dHJpYnV0ZVZhbHVlKGtleSwgdmFsdWUpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnNldEF0dHJpYnV0ZVZhbHVlKHRoaXMuY29udGFpbmVyRWxlbWVudCwga2V5LHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXRBdHRyaWJ1dGVWYWx1ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIENvbnRhaW5lckVsZW1lbnRVdGlscy5nZXRBdHRyaWJ1dGVWYWx1ZSh0aGlzLmNvbnRhaW5lckVsZW1lbnQsIGtleSk7XG4gICAgfVxuXG4gICAgY29udGFpbnNBdHRyaWJ1dGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckVsZW1lbnQgPSB0aGlzLmNvbnRhaW5lckVsZW1lbnQ7XG4gICAgICAgIHJldHVybiBjb250YWluZXJFbGVtZW50Lmhhc0F0dHJpYnV0ZShrZXkpO1xuICAgIH1cblxuICAgIHJlbW92ZUF0dHJpYnV0ZShrZXkpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgIH1cblxuICAgIHNldFN0eWxlKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnN0eWxlW2tleV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXRTdHlsZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5zdHlsZVtrZXldO1xuICAgIH1cblxuICAgIHJlbW92ZVN0eWxlKGtleSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuc3R5bGVba2V5XSA9IG51bGw7XG4gICAgfVxuXG4gICAgc2V0KGlucHV0KSB7XG4gICAgICAgIGlmIChudWxsID09PSBpbnB1dCB8fCB1bmRlZmluZWQgPT09IGlucHV0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBpbnB1dCBwcm92aWRlZCB0byBzZXQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYoIXRoaXMuY29udGFpbmVyRWxlbWVudC5wYXJlbnROb2RlKXtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGUgZWxlbWVudCBoYXMgbm8gcGFyZW50LCBjYW4gbm90IHN3YXAgaXQgZm9yIHZhbHVlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8qKiBAdHlwZSB7Q29udGFpbmVyRWxlbWVudH0gKi9cbiAgICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRoaXMuY29udGFpbmVyRWxlbWVudC5wYXJlbnROb2RlO1xuXG4gICAgICAgIGlmKGlucHV0LmNvbnRhaW5lckVsZW1lbnQpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGlucHV0LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKGlucHV0ICYmIGlucHV0LnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbnB1dC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50LCB0aGlzLmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gaW5wdXQucm9vdEVsZW1lbnQuY29udGFpbmVyRWxlbWVudDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2YgaW5wdXQgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZVRleHROb2RlKGlucHV0KSwgdGhpcy5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGlucHV0LCB0aGlzLmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKGlucHV0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaW5wdXQsIHRoaXMuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgTE9HLndhcm4oXCJObyB2YWxpZCBpbnB1dCB0byBzZXQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIExPRy53YXJuKGlucHV0KTtcbiAgICB9XG5cbiAgICBpc01vdW50ZWQoKSB7XG4gICAgICAgIGlmKHRoaXMuY29udGFpbmVyRWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy5jb250YWluZXJFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7Q29udGFpbmVyRWxlbWVudH0gKi9cbiAgICAgICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLmNvbnRhaW5lckVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDaGlsZChpbnB1dCkge1xuICAgICAgICBpZiAobnVsbCA9PT0gaW5wdXQgfHwgdW5kZWZpbmVkID09PSBpbnB1dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gaW5wdXQgcHJvdmlkZWQgdG8gc2V0IHRoZSBlbGVtZW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5hZGRDaGlsZChpbnB1dCk7XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoaW5wdXQpIHtcbiAgICAgICAgaWYgKG51bGwgPT09IGlucHV0IHx8IHVuZGVmaW5lZCA9PT0gaW5wdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGlucHV0IHByb3ZpZGVkIHRvIHNldCB0aGUgZWxlbWVudFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQuY29udGFpbmVyRWxlbWVudCAhPT0gdW5kZWZpbmVkICYmIGlucHV0LmNvbnRhaW5lckVsZW1lbnQgIT09IG51bGwpe1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC5yb290RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVUZXh0Tm9kZShpbnB1dCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyRWxlbWVudCA9IG5ldyBDb250YWluZXJFbGVtZW50KGlucHV0KTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChjb250YWluZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBMT0cud2FybihcIk5vIHZhbGlkIGlucHV0IHRvIGFkZCB0aGUgZWxlbWVudFwiKTtcbiAgICAgICAgTE9HLndhcm4oaW5wdXQpO1xuICAgIH1cblxuICAgIHByZXBlbmRDaGlsZChpbnB1dCkge1xuICAgICAgICBpZiAobnVsbCA9PT0gaW5wdXQgfHwgdW5kZWZpbmVkID09PSBpbnB1dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gaW5wdXQgcHJvdmlkZWQgdG8gc2V0IHRoZSBlbGVtZW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuY29udGFpbmVyRWxlbWVudC5maXJzdENoaWxkID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQuY29udGFpbmVyRWxlbWVudCAhPT0gdW5kZWZpbmVkICYmIGlucHV0LmNvbnRhaW5lckVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5wcmVwZW5kQ2hpbGQoaW5wdXQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucHJlcGVuZENoaWxkKGlucHV0LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnByZXBlbmRDaGlsZChDb250YWluZXJFbGVtZW50VXRpbHMuY3JlYXRlVGV4dE5vZGUoaW5wdXQpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBDb250YWluZXJUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucHJlcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucHJlcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBMT0cud2FybihcIk5vIHZhbGlkIGlucHV0IHRvIHByZXBlbmQgdGhlIGVsZW1lbnRcIik7XG4gICAgICAgIExPRy53YXJuKGlucHV0KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBNYXAgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYmFzZUVsZW1lbnRcIjtcblxuLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb21wb25lbnRJbmRleCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSByb290RWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge01hcH0gZWxlbWVudE1hcCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb21wb25lbnRJbmRleCwgcm9vdEVsZW1lbnQsIGVsZW1lbnRNYXApIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRJbmRleCA9IGNvbXBvbmVudEluZGV4O1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAgPSBlbGVtZW50TWFwO1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gcm9vdEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBcbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgZ2V0KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgc2V0IChpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwLmdldChpZCkuc2V0KHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBcbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgY2xlYXJDaGlsZHJlbihpZCl7XG4gICAgICAgIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpLmNsZWFyKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgc2V0Q2hpbGQgKGlkLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKS5zZXRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgYWRkQ2hpbGQgKGlkLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKS5hZGRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRNYXAuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJucyB7QmFzZUVsZW1lbnR9XG4gICAgICovXG4gICAgcHJlcGVuZENoaWxkIChpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50TWFwLmdldChpZCkucHJlcGVuZENoaWxkKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudE1hcC5nZXQoaWQpO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQWJzdHJhY3RJbnB1dEVsZW1lbnRcIik7XG5cbi8qKlxuICogU2hhcmVkIHByb3BlcnRpZXMgb2YgaW5wdXQgZWxlbWVudHNcbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0SW5wdXRFbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIodmFsdWUsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgICAqL1xuICAgIHNldCBuYW1lKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgZ2l2ZW4gYW55IHByb2Nlc3NpbmcgcnVsZXNcbiAgICAgKi9cbiAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2luZ1ZhbHVlO1xuICAgIH1cblxuICAgIHNldCB2YWx1ZSh2YWx1ZSl7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZGlzcGF0Y2hFdmVudCgnY2hhbmdlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc291cmNlIHZhbHVlXG4gICAgICovXG4gICAgZ2V0IGJhY2tpbmdWYWx1ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJFbGVtZW50LnZhbHVlO1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBzZWxlY3RBbGwoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5zZWxlY3QoKTtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRpc2FibGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQWJzdHJhY3RJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgUmFkaW9JbnB1dEVsZW1lbnQgZXh0ZW5kcyBBYnN0cmFjdElucHV0RWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHNldCBjaGVja2VkKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpc0NoZWNrZWQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkO1xuICAgIH1cblxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNDaGVja2VkKCk7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkID0gKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBcInRydWVcIik7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQWJzdHJhY3RJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hJbnB1dEVsZW1lbnQgZXh0ZW5kcyBBYnN0cmFjdElucHV0RWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHNldCBjaGVja2VkKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpc0NoZWNrZWQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkO1xuICAgIH1cblxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNDaGVja2VkKCk7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5jaGVja2VkID0gKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBcInRydWVcIik7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQge1htbEVsZW1lbnR9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7QWJzdHJhY3RJbnB1dEVsZW1lbnR9IGZyb20gXCIuL2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBUZXh0SW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHtYbWxFbGVtZW50fSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQge0Fic3RyYWN0SW5wdXRFbGVtZW50fSBmcm9tIFwiLi9hYnN0cmFjdElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVGV4dGFyZWFJbnB1dEVsZW1lbnQgZXh0ZW5kcyBBYnN0cmFjdElucHV0RWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIGdldCBpbm5lckhUTUwoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbm5lckhUTUw7XG4gICAgfVxuXG4gICAgc2V0IGlubmVySFRNTCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBhZGRDaGlsZChpbnB1dCkge1xuICAgICAgICBzdXBlci5hZGRDaGlsZChpbnB1dCk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmlubmVySFRNTDtcbiAgICB9XG5cbiAgICBwcmVwZW5kQ2hpbGQoaW5wdXQpIHtcbiAgICAgICAgc3VwZXIucHJlcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5uZXJIVE1MO1xuICAgIH1cblxufSIsImltcG9ydCB7IFhtbENkYXRhIH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCwgQ29udGFpbmVyRWxlbWVudFV0aWxzIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVGV4dG5vZGVFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbENkYXRhfSB2YWx1ZSBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmFsdWUsIHBhcmVudCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7Q29udGFpbmVyRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICBpZih2YWx1ZSBpbnN0YW5jZW9mIFhtbENkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSB0aGlzLmNyZWF0ZUZyb21YbWxDZGF0YSh2YWx1ZSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmNyZWF0ZVRleHROb2RlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7WG1sQ2RhdGF9IGNkYXRhRWxlbWVudCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnRFbGVtZW50IFxuICAgICAqL1xuICAgIGNyZWF0ZUZyb21YbWxDZGF0YShjZGF0YUVsZW1lbnQsIHBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5jcmVhdGVUZXh0Tm9kZShjZGF0YUVsZW1lbnQudmFsdWUpO1xuICAgICAgICBpZihwYXJlbnRFbGVtZW50ICE9PSBudWxsICYmIHBhcmVudEVsZW1lbnQuY29udGFpbmVyRWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcGFyZW50RWxlbWVudC5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gICAgfVxuXG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmltcG9ydCB7IFhtbEVsZW1lbnQgfSBmcm9tIFwieG1scGFyc2VyX3YxXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVFbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBnZXQgaW5uZXJIVE1MKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIH1cblxuICAgIHNldCBpbm5lckhUTUwodmFsdWUpe1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRm9ybUVsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG4gICAgICogQHBhcmFtIHtCYXNlRWxlbWVudH0gcGFyZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBwYXJlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgdGhlIGlucHV0cyBuYW1lXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGlucHV0cyBuYW1lXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQgbmFtZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQubmFtZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHN1Ym1pdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5zdWJtaXQoKTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIFZpZGVvRWxlbWVudCBleHRlbmRzIEJhc2VFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1htbEVsZW1lbnR9IHZhbHVlIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBnZXQgbWFwcGVkRWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudDtcbiAgICB9XG5cbiAgICBwbGF5TXV0ZWQoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5wbGF5TXV0ZWQoKTtcbiAgICB9XG5cbiAgICBwbGF5KCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQucGxheSgpO1xuICAgIH1cblxuICAgIG11dGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5tdXRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdW5tdXRlKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQubXV0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIE9wdGlvbkVsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudCB7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG5cdCAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcblx0ICovXG5cdGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuXHRcdHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgICAgIHRoaXMub3B0aW9uTGFiZWwgPSBudWxsO1xuXHR9XG5cbiAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlVmFsdWUoXCJ2YWx1ZVwiKTtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUodmFsKXtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVWYWx1ZShcInZhbHVlXCIsIHZhbCk7XG4gICAgfVxuXG4gICAgZ2V0IGxhYmVsKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbkxhYmVsO1xuICAgIH1cblxuICAgIHNldCBsYWJlbCh2YWx1ZSl7XG4gICAgICAgIHRoaXMub3B0aW9uTGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRDaGlsZCh2YWx1ZSk7XG4gICAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQge1htbEF0dHJpYnV0ZSwgWG1sRWxlbWVudH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHtFbGVtZW50TWFwcGVyfSBmcm9tIFwiLi4vZWxlbWVudC9lbGVtZW50TWFwcGVyLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBIVE1Me1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVsZW1lbnROYW1lIFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgU3RyaW5nPn0gYXR0cmlidXRlTWFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjdXN0b20oZWxlbWVudE5hbWUsIGF0dHJpYnV0ZU1hcCA9IG51bGwpe1xuICAgICAgICBjb25zdCB4bWxFbGVtZW50ID0gbmV3IFhtbEVsZW1lbnQoZWxlbWVudE5hbWUpO1xuICAgICAgICBpZiAoYXR0cmlidXRlTWFwKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHhtbEVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgbmV3IFhtbEF0dHJpYnV0ZShrZXksIG51bGwsIHZhbHVlKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRWxlbWVudE1hcHBlci5tYXAoeG1sRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVsZW1lbnROYW1lIFxuICAgICAqIEBwYXJhbSB7TWFwPFN0cmluZywgU3RyaW5nPn0gYXR0cmlidXRlTWFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjdXN0b21DaGlsZChlbGVtZW50TmFtZSwgcGFyZW50LCBhdHRyaWJ1dGVNYXAgPSBudWxsKXtcbiAgICAgICAgY29uc3QgeG1sRWxlbWVudCA9IG5ldyBYbWxFbGVtZW50KGVsZW1lbnROYW1lKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZU1hcCkge1xuICAgICAgICAgICAgYXR0cmlidXRlTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB4bWxFbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIG5ldyBYbWxBdHRyaWJ1dGUoa2V5LCBudWxsLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEVsZW1lbnRNYXBwZXIubWFwKHhtbEVsZW1lbnQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFwcGx5U3R5bGVzKGVsZW1lbnQsIGNsYXNzVmFsdWUsIHN0eWxlVmFsdWUpe1xuICAgICAgICBpZihjbGFzc1ZhbHVlKXtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBjbGFzc1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZihzdHlsZVZhbHVlKXtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJzdHlsZVwiLCBzdHlsZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBhKHZhbHVlLCBocmVmLCBjbGFzc1ZhbHVlLCBzdHlsZVZhbHVlKXtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEhUTUwuY3VzdG9tKFwiYVwiKTtcbiAgICAgICAgZWxlbWVudC5hZGRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJocmVmXCIsaHJlZik7XG4gICAgICAgIEhUTUwuYXBwbHlTdHlsZXMoZWxlbWVudCwgY2xhc3NWYWx1ZSwgc3R5bGVWYWx1ZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBpKHZhbHVlLCBjbGFzc1ZhbHVlLCBzdHlsZVZhbHVlKXtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEhUTUwuY3VzdG9tKFwiaVwiKTtcbiAgICAgICAgZWxlbWVudC5hZGRDaGlsZCh2YWx1ZSk7XG4gICAgICAgIEhUTUwuYXBwbHlTdHlsZXMoZWxlbWVudCwgY2xhc3NWYWx1ZSwgc3R5bGVWYWx1ZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IE9wdGlvbkVsZW1lbnQgfSBmcm9tIFwiLi9vcHRpb25FbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEhUTUwgfSBmcm9tIFwiLi4vaHRtbC9odG1sLmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJbnB1dEVsZW1lbnREYXRhQmluZGluZ1wiKTtcblxuZXhwb3J0IGNsYXNzIFNlbGVjdEVsZW1lbnQgZXh0ZW5kcyBCYXNlRWxlbWVudCB7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0ge1htbEVsZW1lbnR9IGVsZW1lbnQgXG5cdCAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcblx0ICovXG5cdGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudCkge1xuXHRcdHN1cGVyKGVsZW1lbnQsIHBhcmVudCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxPcHRpb25FbGVtZW50Pn0gKi9cbiAgICAgICAgdGhpcy5vcHRpb25zQXJyYXkgPSBbXTtcblx0fVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9wdGlvbnMgYXMgYXJyYXkgb2YgT3B0aW9uRWxlbWVudFxuICAgICAqIEByZXR1cm4ge0FycmF5PE9wdGlvbkVsZW1lbnQ+fVxuICAgICAqL1xuICAgIGdldCBvcHRpb25zKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNBcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3B0aW9ucyBmcm9tIGFycmF5IG9mIE9wdGlvbkVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5PE9wdGlvbkVsZW1lbnQ+fSBvcHRpb25zQXJyYXlcbiAgICAgKi9cbiAgICBzZXQgb3B0aW9ucyhvcHRpb25zQXJyYXkpe1xuICAgICAgICB0aGlzLm9wdGlvbnNBcnJheSA9IG9wdGlvbnNBcnJheTtcbiAgICAgICAgdGhpcy5yZW5kZXJPcHRpb25zKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyT3B0aW9ucygpe1xuICAgICAgICB3aGlsZSAodGhpcy5jb250YWluZXJFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNvbnRhaW5lckVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgdGhpcy5vcHRpb25zQXJyYXkpe1xuICAgICAgICAgICAgLy8gUmVwbGFjZSB3aXRoIGNvbnRhaW5lcmJyaWRnZVxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uRWxlbWVudCA9IEhUTUwuY3VzdG9tQ2hpbGQoXCJvcHRpb25cIiwgdGhpcyk7XG4gICAgICAgICAgICBvcHRpb25FbGVtZW50LnZhbHVlID0gb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgb3B0aW9uRWxlbWVudC5sYWJlbCA9IG9wdGlvbi5sYWJlbDtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb25FbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgaW5wdXRzIG5hbWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgICAqL1xuICAgIHNldCBuYW1lKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5uYW1lID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgZ2l2ZW4gYW55IHByb2Nlc3NpbmcgcnVsZXNcbiAgICAgKi9cbiAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2luZ1ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIGdpdmVuIGFueSBwcm9jZXNzaW5nIHJ1bGVzXG4gICAgICovXG4gICAgc2V0IHZhbHVlKHZhbHVlKXtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnQudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZGlzcGF0Y2hFdmVudCgnY2hhbmdlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTE9HLndhcm4oXCJWYWx1ZSAnXCIgKyB2YWx1ZSArIFwiJyBub3QgZm91bmQgaW4gb3B0aW9ucyBmb3Igc2VsZWN0IGVsZW1lbnQgd2l0aCBuYW1lICdcIiArIHRoaXMubmFtZSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzb3VyY2UgdmFsdWVcbiAgICAgKi9cbiAgICBnZXQgYmFja2luZ1ZhbHVlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lckVsZW1lbnQudmFsdWU7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxuICAgIHNlbGVjdEFsbCgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LnNlbGVjdCgpO1xuICAgIH1cblxuICAgIGVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZGlzYWJsZSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1htbEVsZW1lbnR9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7QWJzdHJhY3RJbnB1dEVsZW1lbnR9IGZyb20gXCIuL2Fic3RyYWN0SW5wdXRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuL2Jhc2VFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBGaWxlSW5wdXRFbGVtZW50IGV4dGVuZHMgQWJzdHJhY3RJbnB1dEVsZW1lbnR7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSBlbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBmb2N1cygpIHtcbiAgICAgICAgTE9HLldBUk4oXCJGaWxlIGlucHV0IGVsZW1lbnRzIGNhbm5vdCBiZSBmb2N1c2VkIGRpcmVjdGx5IGR1ZSB0byBicm93c2VyIHNlY3VyaXR5IHJlc3RyaWN0aW9ucy5cIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5pbXBvcnQgeyBYbWxDZGF0YSxYbWxFbGVtZW50IH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgUmFkaW9JbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9yYWRpb0lucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgQ2hlY2tib3hJbnB1dEVsZW1lbnQgfSBmcm9tIFwiLi9jaGVja2JveElucHV0RWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgVGV4dElucHV0RWxlbWVudCB9IGZyb20gXCIuL3RleHRJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRhcmVhSW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vdGV4dGFyZWFJbnB1dEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRub2RlRWxlbWVudCB9IGZyb20gXCIuL3RleHRub2RlRWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCB9IGZyb20gXCIuL3NpbXBsZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4vYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IEZvcm1FbGVtZW50IH0gZnJvbSBcIi4vZm9ybUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFZpZGVvRWxlbWVudCB9IGZyb20gXCIuL3ZpZGVvRWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgT3B0aW9uRWxlbWVudCB9IGZyb20gXCIuL29wdGlvbkVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFNlbGVjdEVsZW1lbnQgfSBmcm9tIFwiLi9zZWxlY3RFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBGaWxlSW5wdXRFbGVtZW50IH0gZnJvbSBcIi4vZmlsZUlucHV0RWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudE1hcHBlciB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7YW55fSBpbnB1dCBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBwYXJlbnQgXG4gICAgICovXG4gICAgc3RhdGljIG1hcChpbnB1dCwgcGFyZW50KSB7XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1JhZGlvKGlucHV0KSl7ICAgICByZXR1cm4gbmV3IFJhZGlvSW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb0NoZWNrYm94KGlucHV0KSl7ICByZXR1cm4gbmV3IENoZWNrYm94SW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1N1Ym1pdChpbnB1dCkpeyAgICByZXR1cm4gbmV3IFRleHRJbnB1dEVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvRm9ybShpbnB1dCkpeyAgICAgIHJldHVybiBuZXcgRm9ybUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvVGV4dGFyZWEoaW5wdXQpKXsgIHJldHVybiBuZXcgVGV4dGFyZWFJbnB1dEVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvRmlsZShpbnB1dCkpeyAgICAgIHJldHVybiBuZXcgRmlsZUlucHV0RWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9UZXh0KGlucHV0KSl7ICAgICAgcmV0dXJuIG5ldyBUZXh0SW5wdXRFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1ZpZGVvKGlucHV0KSl7ICAgICByZXR1cm4gbmV3IFZpZGVvRWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9UZXh0bm9kZShpbnB1dCkpeyAgcmV0dXJuIG5ldyBUZXh0bm9kZUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgaWYgKEVsZW1lbnRNYXBwZXIubWFwc1RvT3B0aW9uKGlucHV0KSl7ICAgIHJldHVybiBuZXcgT3B0aW9uRWxlbWVudChpbnB1dCwgcGFyZW50KTsgfVxuICAgICAgICBpZiAoRWxlbWVudE1hcHBlci5tYXBzVG9TZWxlY3QoaW5wdXQpKXsgICAgcmV0dXJuIG5ldyBTZWxlY3RFbGVtZW50KGlucHV0LCBwYXJlbnQpOyB9XG4gICAgICAgIGlmIChFbGVtZW50TWFwcGVyLm1hcHNUb1NpbXBsZShpbnB1dCkpeyAgICByZXR1cm4gbmV3IFNpbXBsZUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7IH1cbiAgICAgICAgY29uc29sZS5sb2coXCJNYXBwaW5nIHRvIHNpbXBsZSBieSBkZWZhdWx0IFwiICsgaW5wdXQpO1xuICAgICAgICByZXR1cm4gbmV3IFNpbXBsZUVsZW1lbnQoaW5wdXQsIHBhcmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1JhZGlvKGlucHV0KXtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBpbnB1dC50eXBlID09PSBcInJhZGlvXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJpbnB1dFwiICYmIGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikgJiZcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcInJhZGlvXCIpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYXBzVG9DaGVja2JveChpbnB1dCl7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgaW5wdXQudHlwZSA9PT0gXCJjaGVja2JveFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwiaW5wdXRcIiAmJiBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICYmXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJjaGVja2JveFwiKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvU3VibWl0KGlucHV0KXtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBpbnB1dC50eXBlID09PSBcInN1Ym1pdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwiaW5wdXRcIiAmJiBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICYmXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJzdWJtaXRcIikge1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb0Zvcm0oaW5wdXQpe1xuICAgICAgICByZXR1cm4gKGlucHV0IGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50KSB8fFxuICAgICAgICAgICAgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcImZvcm1cIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb0ZpbGUoaW5wdXQpe1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJmaWxlXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJpbnB1dFwiICYmIGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikgJiZcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcImZpbGVcIikgeyBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvVGV4dChpbnB1dCl7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcInRleHRcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IFwiaGlkZGVuXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcIm51bWJlclwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJwYXNzd29yZFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJlbWFpbFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gXCJkYXRlXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09PSBcInRpbWVcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcImlucHV0XCIpIHtcbiAgICAgICAgICAgIGlmKCFpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcInRleHRcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJoaWRkZW5cIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJudW1iZXJcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgaWYoaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS52YWx1ZSA9PT0gXCJwYXNzd29yZFwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcImVtYWlsXCIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgIGlmKGlucHV0LmdldEF0dHJpYnV0ZShcInR5cGVcIikudmFsdWUgPT09IFwiZGF0ZVwiKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICBpZihpbnB1dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLnZhbHVlID09PSBcInRpbWVcIikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvVGV4dG5vZGUoaW5wdXQpe1xuICAgICAgICByZXR1cm4gKGlucHV0IGluc3RhbmNlb2YgTm9kZSAmJiBpbnB1dC5ub2RlVHlwZSA9PT0gXCJURVhUX05PREVcIikgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbENkYXRhKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFwc1RvT3B0aW9uKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxPcHRpb25FbGVtZW50KSB8fFxuICAgICAgICAgICAgKGlucHV0IGluc3RhbmNlb2YgWG1sRWxlbWVudCAmJiBpbnB1dC5uYW1lID09PSBcIm9wdGlvblwiKTtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIG1hcHNUb1NlbGVjdChpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQgJiYgaW5wdXQubmFtZSA9PT0gXCJzZWxlY3RcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1ZpZGVvKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwidmlkZW9cIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1RleHRhcmVhKGlucHV0KXtcbiAgICAgICAgcmV0dXJuIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQpIHx8XG4gICAgICAgICAgICAoaW5wdXQgaW5zdGFuY2VvZiBYbWxFbGVtZW50ICYmIGlucHV0Lm5hbWUgPT09IFwidGV4dGFyZWFcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG1hcHNUb1NpbXBsZShpbnB1dCl7XG4gICAgICAgIHJldHVybiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgfHxcbiAgICAgICAgICAgIChpbnB1dCBpbnN0YW5jZW9mIFhtbEVsZW1lbnQpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IE1hcCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuaW1wb3J0IHsgWG1sRWxlbWVudCB9IGZyb20gXCJ4bWxwYXJzZXJfdjFcIjtcbmltcG9ydCB7IEVsZW1lbnRNYXBwZXIgfSBmcm9tIFwiLi4vZWxlbWVudC9lbGVtZW50TWFwcGVyLmpzXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Jhc2VFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vdW5pcXVlSWRSZWdpc3RyeS5qc1wiO1xuXG4vKipcbiAqIENvbGxlY3RzIGluZm9ybWF0aW9uIHdoZW4gZWxlbWVudHMgYXJlIGNyZWF0ZWQgYW5kIGZpbmRzIHRoZSByb290IGVsZW1lbnQsIGNyZWF0ZXMgbWFwIG9mIGVsZW1lbnRzIFxuICovXG5leHBvcnQgY2xhc3MgRWxlbWVudFJlZ2lzdHJhdG9yIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7VW5pcXVlSWRSZWdpc3RyeX0gdW5pcXVlSWRSZWdpc3RyeSBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29tcG9uZW50SW5kZXggXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodW5pcXVlSWRSZWdpc3RyeSwgY29tcG9uZW50SW5kZXgpIHtcblxuICAgICAgICAvKiogQHR5cGUge051bWJlcn0gKi9cbiAgICAgICAgdGhpcy5jb21wb25lbnRJbmRleCA9IGNvbXBvbmVudEluZGV4O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VW5pcXVlSWRSZWdpc3RyeX0gKi9cbiAgICAgICAgdGhpcy51bmlxdWVJZFJlZ2lzdHJ5ID0gdW5pcXVlSWRSZWdpc3RyeTtcblxuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICB0aGlzLmVsZW1lbnRNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgZ2V0RWxlbWVudE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudE1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0ZW5zIHRvIGVsZW1lbnRzIGJlaW5nIGNyZWF0ZWQsIGFuZCB0YWtlcyBpbm4gdGhlIGNyZWF0ZWQgWG1sRWxlbWVudCBhbmQgaXRzIHBhcmVudCBYbWxFbGVtZW50XG4gICAgICogXG4gICAgICogQHBhcmFtIHtYbWxFbGVtZW50fSB4bWxFbGVtZW50IFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IHBhcmVudFdyYXBwZXIgXG4gICAgICovXG4gICAgZWxlbWVudENyZWF0ZWQoeG1sRWxlbWVudCwgcGFyZW50V3JhcHBlcikge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gRWxlbWVudE1hcHBlci5tYXAoeG1sRWxlbWVudCwgcGFyZW50V3JhcHBlcik7XG5cbiAgICAgICAgdGhpcy5hZGRUb0VsZW1lbnRJZE1hcChlbGVtZW50KTtcblxuICAgICAgICBpZih0aGlzLnJvb3RFbGVtZW50ID09PSBudWxsICYmIGVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgYWRkVG9FbGVtZW50SWRNYXAoZWxlbWVudCkge1xuICAgICAgICBpZihlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCB8fCAhKGVsZW1lbnQgaW5zdGFuY2VvZiBCYXNlRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaWQgPSBudWxsO1xuICAgICAgICBpZihlbGVtZW50LmNvbnRhaW5zQXR0cmlidXRlKFwiaWRcIikpIHtcbiAgICAgICAgICAgIGlkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImlkXCIpO1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImlkXCIsdGhpcy51bmlxdWVJZFJlZ2lzdHJ5LmlkQXR0cmlidXRlV2l0aFN1ZmZpeChpZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoaWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudE1hcC5zZXQoaWQsZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHsgQ29udGFpbmVyRWxlbWVudCwgQ29udGFpbmVyRWxlbWVudFV0aWxzLCBDb250YWluZXJFdmVudCwgQ29udGFpbmVyV2luZG93IH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuaW1wb3J0IHsgTWV0aG9kIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi4vY29tcG9uZW50L2NvbXBvbmVudC5qc1wiO1xuaW1wb3J0IHsgQmFzZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9iYXNlRWxlbWVudC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQ2FudmFzUm9vdCB7XG5cbiAgICBzdGF0aWMgc2hvdWxkU3dhbGxvd05leHRGb2N1c0VzY2FwZSA9IGZhbHNlO1xuXG4gICAgLyoqIEB0eXBlIHtDb250YWluZXJFbGVtZW50fSAqL1xuICAgIHN0YXRpYyBtb3VzZURvd25FbGVtZW50ID0gbnVsbDtcblxuICAgIHN0YXRpYyBmb2N1c0VzY2FwZUV2ZW50UmVxdWVzdGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVwbGFjZUNvbXBvbmVudChpZCwgY29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgYm9keUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoY29tcG9uZW50LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQsIGJvZHlFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0Q29tcG9uZW50KGlkLCBjb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgYm9keUVsZW1lbnQgPSBDb250YWluZXJFbGVtZW50VXRpbHMuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBib2R5RWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQoY29tcG9uZW50LnJvb3RFbGVtZW50LmNvbnRhaW5lckVsZW1lbnQsIGJvZHlFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkQ2hpbGRDb21wb25lbnQoaWQsIGNvbXBvbmVudCkge1xuICAgICAgICBjb25zdCBib2R5RWxlbWVudCA9IENvbnRhaW5lckVsZW1lbnRVdGlscy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKGNvbXBvbmVudC5yb290RWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCBcbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkQ2hpbGRFbGVtZW50KGlkLCBlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gQ29udGFpbmVyRWxlbWVudFV0aWxzLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudC5jb250YWluZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZUVsZW1lbnQoaWQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnJlbW92ZUVsZW1lbnQoaWQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgc3RhdGljIGFkZEhlYWRlckVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICBDb250YWluZXJFbGVtZW50VXRpbHMuYXBwZW5kUm9vdE1ldGFDaGlsZChlbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAcGFyYW0ge0Jhc2VFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgc3RhdGljIGFkZEJvZHlFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLmFwcGVuZFJvb3RVaUNoaWxkKGVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJlcGVuZEhlYWRlckVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICBDb250YWluZXJFbGVtZW50VXRpbHMucHJlcGVuZEVsZW1lbnQoXCJoZWFkXCIsIGVsZW1lbnQuY29udGFpbmVyRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJlcGVuZEJvZHlFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgQ29udGFpbmVyRWxlbWVudFV0aWxzLnByZXBlbmRFbGVtZW50KFwiYm9keVwiLCBlbGVtZW50LmNvbnRhaW5lckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBSZW1lbWJlciB0byBzd2FsbG93Rm9jdXNFc2NhcGUgZm9yIGluaXRpYWwgdHJpZ2dlcmluZyBldmVudHNcbiAgICAgKiB3aGljaCBhcmUgZXh0ZXJuYWwgdG8gZm9jdXNSb290XG4gICAgICogXG4gICAgICogQWxzbyByZW1lbWJlciB0byBrZWVwIHRoZSBkZXN0cm95IGZ1bmN0aW9uIGFuZCBjYWxsIGl0XG4gICAgICogd2hlbiB0aGUgbGlzdGVuZXIgaXMgbm8gbG9uZ2VyIG5lZWRlZFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGZvY3VzUm9vdFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyRnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dE9iamVjdFxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gZGVzdHJveSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGNvbnRhaW5lciB3aW5kb3dcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuVG9Gb2N1c0VzY2FwZShmb2N1c1Jvb3QsIGxpc3RlbmVyRnVuY3Rpb24sIGNvbnRleHRPYmplY3QpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IE1ldGhvZChsaXN0ZW5lckZ1bmN0aW9uLCBjb250ZXh0T2JqZWN0KTtcblxuICAgICAgICBjb25zdCBkZXN0cm95RnVuY3Rpb25zID0gW107XG5cbiAgICAgICAgLyogSGFjazogQmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgd2F5IG9mIGtub3dpbmcgaW4gdGhlIGNsaWNrIGV2ZW50IHdoaWNoIGVsZW1lbnQgd2FzIGluIGZvY3VzIHdoZW4gbW91c2Vkb3duIG9jY3VyZWQgKi9cbiAgICAgICAgaWYgKCFDYW52YXNSb290LmZvY3VzRXNjYXBlRXZlbnRSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU1vdXNlRG93bkVsZW1lbnQgPSBuZXcgTWV0aG9kKCgvKiogQHR5cGUge0NvbnRhaW5lckV2ZW50fSAqLyBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVzdHJveUZ1bmN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIENvbnRhaW5lcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHVwZGF0ZU1vdXNlRG93bkVsZW1lbnQpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5mb2N1c0VzY2FwZUV2ZW50UmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbGxJZk5vdENvbnRhaW5zID0gbmV3IE1ldGhvZCgoLyoqIEB0eXBlIHtDb250YWluZXJFdmVudH0gKi8gZXZlbnQpID0+IHtcbiAgICAgICAgICAgIENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmIChDb250YWluZXJFbGVtZW50VXRpbHMuY29udGFpbnMoZm9jdXNSb290LmNvbnRhaW5lckVsZW1lbnQsIENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBub3QgY29ubmVjdGVkLCB0aGVuIHRoZSBlbGVtZW50IGlzIG5vdCB2aXNpYmxlXG4gICAgICAgICAgICAvLyBhbmQgd2Ugc2hvdWxkIG5vdCB0cmlnZ2VyIGZvY3VzIGVzY2FwZSBldmVudHNcbiAgICAgICAgICAgIGlmICghQ29udGFpbmVyRWxlbWVudFV0aWxzLmlzQ29ubmVjdGVkKENhbnZhc1Jvb3QubW91c2VEb3duRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQ2FudmFzUm9vdC5zaG91bGRTd2FsbG93TmV4dEZvY3VzRXNjYXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXN0cm95RnVuY3Rpb25zLnB1c2goXG4gICAgICAgICAgICBDb250YWluZXJXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBjYWxsSWZOb3RDb250YWlucylcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZGVzdHJveUZ1bmN0aW9ucy5mb3JFYWNoKGRlc3Ryb3kgPT4gZGVzdHJveSgpKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIGFuIGVsZW1lbnQgaXMgY29uZ2lndXJlZCB0byBiZSBoaWRkZW4gYnkgRm9jdXNFc2NhcGUsXG4gICAgICogYW5kIHdhcyBzaG93biBieSBhbiBldmVudCB0cmlnZ2VyZWQgZnJvbSBhbiBleHRlcm5hbCBlbGVtZW50LFxuICAgICAqIHRoZW4gRm9jdXNFc2NhcGUgZ2V0cyB0cmlnZ2VyZWQgcmlnaHQgYWZ0ZXIgdGhlIGVsZW1lbnQgaXNcbiAgICAgKiBzaG93bi4gVGhlcmVmb3JlIHRoaXMgZnVuY3Rpb24gYWxsb3dzIHRoaXMgZXZlbnQgdG8gYmUgXG4gICAgICogc3dhbGxvd2VkIHRvIGF2b2lkIHRoaXMgYmVoYXZpb3JcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZm9yTWlsbGlzZWNvbmRzIFxuICAgICAqL1xuICAgIHN0YXRpYyBzd2FsbG93Rm9jdXNFc2NhcGUoZm9yTWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIENhbnZhc1Jvb3Quc2hvdWxkU3dhbGxvd05leHRGb2N1c0VzY2FwZSA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5zaG91bGRTd2FsbG93TmV4dEZvY3VzRXNjYXBlID0gZmFsc2U7XG4gICAgICAgIH0sIGZvck1pbGxpc2Vjb25kcyk7XG4gICAgfVxufSIsImltcG9ydCB7IE1hcCwgTGlzdCwgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDYW52YXNSb290IH0gZnJvbSBcIi4vY2FudmFzUm9vdC5qc1wiO1xuaW1wb3J0IHsgSFRNTCB9IGZyb20gXCIuLi9odG1sL2h0bWwuanNcIjtcbmltcG9ydCB7IEJhc2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvYmFzZUVsZW1lbnQuanNcIjtcbmltcG9ydCB7IFRleHRub2RlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L3RleHRub2RlRWxlbWVudC5qc1wiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQ2FudmFzU3R5bGVzXCIpO1xuXG5jb25zdCBzdHlsZXMgPSBuZXcgTWFwKCk7XG5jb25zdCBzdHlsZU93bmVycyA9IG5ldyBNYXAoKTtcbmNvbnN0IGVuYWJsZWRTdHlsZXMgPSBuZXcgTGlzdCgpO1xuXG5leHBvcnQgY2xhc3MgQ2FudmFzU3R5bGVzIHtcblxuICAgIHN0YXRpYyBzZXRTdHlsZShuYW1lLCBzb3VyY2UpIHtcbiAgICAgICAgaWYoc3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBzdHlsZXMuZ2V0KG5hbWUpLnNldENoaWxkKG5ldyBUZXh0bm9kZUVsZW1lbnQoc291cmNlLmdldFN0eWxlc1NvdXJjZSgpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICAgICAgbGV0IHN0eWxlRWxlbWVudCA9IEhUTUwuY3VzdG9tKFwic3R5bGVcIik7XG4gICAgICAgICAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJpZFwiLG5hbWUpO1xuICAgICAgICAgICAgc3R5bGVFbGVtZW50LnNldENoaWxkKG5ldyBUZXh0bm9kZUVsZW1lbnQoc291cmNlLmdldFN0eWxlc1NvdXJjZSgpKSk7XG4gICAgICAgICAgICBzdHlsZXMuc2V0KG5hbWUsIHN0eWxlRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVtb3ZlU3R5bGUobmFtZSkge1xuICAgICAgICBpZihlbmFibGVkU3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBlbmFibGVkU3R5bGVzLnJlbW92ZShuYW1lKTtcbiAgICAgICAgICAgIENhbnZhc1Jvb3QucmVtb3ZlRWxlbWVudChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZihzdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIHN0eWxlcy5yZW1vdmUobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZGlzYWJsZVN0eWxlKG5hbWUsIG93bmVySWQgPSAwKSB7XG4gICAgICAgIENhbnZhc1N0eWxlcy5yZW1vdmVTdHlsZU93bmVyKG5hbWUsIG93bmVySWQpO1xuICAgICAgICBpZihDYW52YXNTdHlsZXMuaGFzU3R5bGVPd25lcihuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFzdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcihcIlN0eWxlIGRvZXMgbm90IGV4aXN0OiBcIiArIG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKGVuYWJsZWRTdHlsZXMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIGVuYWJsZWRTdHlsZXMucmVtb3ZlKG5hbWUpO1xuICAgICAgICAgICAgQ2FudmFzUm9vdC5yZW1vdmVFbGVtZW50KG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGVuYWJsZVN0eWxlKG5hbWUsIG93bmVySWQgPSAwKSB7XG4gICAgICAgIENhbnZhc1N0eWxlcy5hZGRTdHlsZU93bmVyKG5hbWUsIG93bmVySWQpO1xuICAgICAgICBpZighc3R5bGVzLmNvbnRhaW5zKG5hbWUpKSB7XG4gICAgICAgICAgICBMT0cuZXJyb3IoXCJTdHlsZSBkb2VzIG5vdCBleGlzdDogXCIgKyBuYW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZighZW5hYmxlZFN0eWxlcy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgZW5hYmxlZFN0eWxlcy5hZGQobmFtZSk7XG4gICAgICAgICAgICBDYW52YXNSb290LmFkZEhlYWRlckVsZW1lbnQoc3R5bGVzLmdldChuYW1lKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYWRkU3R5bGVPd25lcihuYW1lLCBvd25lcklkKSB7XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgc3R5bGVPd25lcnMuc2V0KG5hbWUsIG5ldyBMaXN0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5nZXQobmFtZSkuY29udGFpbnMob3duZXJJZCkpIHtcbiAgICAgICAgICAgIHN0eWxlT3duZXJzLmdldChuYW1lKS5hZGQob3duZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVtb3ZlU3R5bGVPd25lcihuYW1lLCBvd25lcklkKSB7XG4gICAgICAgIGlmKCFzdHlsZU93bmVycy5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0eWxlT3duZXJzLmdldChuYW1lKS5yZW1vdmUob3duZXJJZCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGhhc1N0eWxlT3duZXIobmFtZSkge1xuICAgICAgICBpZighc3R5bGVPd25lcnMuY29udGFpbnMobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVPd25lcnMuZ2V0KG5hbWUpLnNpemUoKSA+IDA7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBDb21wb25lbnRGYWN0b3J5IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudE5hbWUgXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBjcmVhdGUoY29tcG9uZW50TmFtZSkge1xuICAgICAgICB0aHJvdyBcIk5vdCBpbXBsZW1lbnRlZFwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IEluamVjdGlvblBvaW50IH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBEb21UcmVlIH0gZnJvbSBcInhtbHBhcnNlcl92MVwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi9jb21wb25lbnQuanNcIjtcbmltcG9ydCB7IFVuaXF1ZUlkUmVnaXN0cnkgfSBmcm9tIFwiLi91bmlxdWVJZFJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBFbGVtZW50UmVnaXN0cmF0b3IgfSBmcm9tIFwiLi9lbGVtZW50UmVnaXN0cmF0b3IuanNcIjtcbmltcG9ydCB7IFRlbXBsYXRlUmVnaXN0cnkgfSBmcm9tIFwiLi4vdGVtcGxhdGUvdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi4vc3R5bGVzL3N0eWxlc1JlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgeyBDYW52YXNTdHlsZXMgfSBmcm9tIFwiLi4vY2FudmFzL2NhbnZhc1N0eWxlcy5qc1wiO1xuaW1wb3J0IHsgQ29tcG9uZW50RmFjdG9yeSB9IGZyb20gXCIuL2NvbXBvbmVudEZhY3RvcnkuanNcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIlRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeVwiKTtcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeSBleHRlbmRzIENvbXBvbmVudEZhY3Rvcnl7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVzUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShTdHlsZXNSZWdpc3RyeSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtUZW1wbGF0ZVJlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLnRlbXBsYXRlUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShUZW1wbGF0ZVJlZ2lzdHJ5KTtcblxuICAgICAgICAvKiogQHR5cGUge1VuaXF1ZUlkUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMudW5pcXVlSWRSZWdpc3RyeSA9IEluamVjdGlvblBvaW50Lmluc3RhbmNlKFVuaXF1ZUlkUmVnaXN0cnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNsYXNzVHlwZSByZXByZXNlbnRzIHRoZSB0ZW1wbGF0ZSBhbmQgdGhlIHN0eWxlcyBuYW1lIGlmIHRoZSBzdHlsZSBmb3IgdGhhdCBuYW1lIGlzIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIGNyZWF0ZShjbGFzc1R5cGUpe1xuICAgICAgICBpZiAoIWNsYXNzVHlwZS5URU1QTEFURV9VUkwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlIGNvbXBvbmVudCBjbGFzcyBtdXN0IGltcGxlbWVudCBzdGF0aWMgbWVtYmVyIFRFTVBMQVRFX1VSTFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGVSZWdpc3RyeS5nZXQoY2xhc3NUeXBlLm5hbWUpO1xuICAgICAgICBpZighdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIExPRy5lcnJvcih0aGlzLnRlbXBsYXRlUmVnaXN0cnkpO1xuICAgICAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gdGVtcGxhdGUgd2FzIGZvdW5kIHdpdGggbmFtZSBcIiArIGNsYXNzVHlwZS5uYW1lKTtcblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsZW1lbnRSZWdpc3RyYXRvciA9IG5ldyBFbGVtZW50UmVnaXN0cmF0b3IodGhpcy51bmlxdWVJZFJlZ2lzdHJ5LCB0ZW1wbGF0ZUNvbXBvbmVudENvdW50ZXIrKyk7XG4gICAgICAgIG5ldyBEb21UcmVlKHRlbXBsYXRlLmdldFRlbXBsYXRlU291cmNlKCksIGVsZW1lbnRSZWdpc3RyYXRvcikubG9hZCgpO1xuXG4gICAgICAgIGlmIChjbGFzc1R5cGUuU1RZTEVTX1VSTCkge1xuICAgICAgICAgICAgdGhpcy5tb3VudFN0eWxlcyhjbGFzc1R5cGUubmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudChlbGVtZW50UmVnaXN0cmF0b3IuY29tcG9uZW50SW5kZXgsIGVsZW1lbnRSZWdpc3RyYXRvci5yb290RWxlbWVudCwgZWxlbWVudFJlZ2lzdHJhdG9yLmdldEVsZW1lbnRNYXAoKSk7XG4gICAgfVxuXG4gICAgbW91bnRTdHlsZXMobmFtZSkge1xuICAgICAgICBpZiAodGhpcy5zdHlsZXNSZWdpc3RyeS5jb250YWlucyhuYW1lKSkge1xuICAgICAgICAgICAgQ2FudmFzU3R5bGVzLnNldFN0eWxlKG5hbWUsIHRoaXMuc3R5bGVzUmVnaXN0cnkuZ2V0KG5hbWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5sZXQgdGVtcGxhdGVDb21wb25lbnRDb3VudGVyID0gMDsiLCJpbXBvcnQgeyBUcmFpbE5vZGUgfSBmcm9tIFwiLi90cmFpbE5vZGUuanNcIjtcblxuZXhwb3J0IGNsYXNzIFRyYWlsSXRlcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSB0cmFpbE5vZGUgXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGVbXX0gdHJhaWxOb2RlUGF0aCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0cmFpbE5vZGUgPSBudWxsLCB0cmFpbE5vZGVQYXRoID0gW10pIHtcbiAgICAgICAgLyoqIEB0eXBlIHtUcmFpbE5vZGV9ICovXG4gICAgICAgIHRoaXMudHJhaWxOb2RlID0gdHJhaWxOb2RlO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VHJhaWxOb2RlW119ICovXG4gICAgICAgIHRoaXMudHJhaWxOb2RlUGF0aCA9IHRyYWlsTm9kZVBhdGg7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBUcmFpbE5vZGUgfSBmcm9tIFwiLi90cmFpbE5vZGUuanNcIjtcbmltcG9ydCB7IEhpc3RvcnkgfSBmcm9tIFwiLi9oaXN0b3J5LmpzXCI7XG5pbXBvcnQgeyBVcmxCdWlsZGVyIH0gZnJvbSBcIi4uL3V0aWwvdXJsQnVpbGRlci5qc1wiO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSBcIi4uL3V0aWwvdXJsLmpzXCI7XG5pbXBvcnQgeyBUcmFpbEl0ZXJhdGlvbiB9IGZyb20gXCIuL3RyYWlsSXRlcmF0aW9uLmpzXCI7XG5pbXBvcnQgeyBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJUcmFpbFByb2Nlc3NvclwiKTtcblxuZXhwb3J0IGNsYXNzIFRyYWlsUHJvY2Vzc29yIHtcblxuICAgIC8qKlxuICAgICAqIFVJIHJlZmVycyB0byB0aGUgd2ViIGFwcGxpY2F0aW9uLiBVSSBuYXZpZ2F0aW9uIG1lYW5zIGFueSBvcGVyYXRpb25cbiAgICAgKiBwZXJmb3JtZWQgd2l0aGluIHRoZSB3ZWIgYXBwIHdoaWNoIHNob3VsZCB0cmlnZ2VyIGEgbmF2aWdhdGlvbiBjaGFuZ2UuXG4gICAgICogXG4gICAgICogQSBVSSBuYXZpZ2F0aW9uIGNoYW5nZSB3aWxsIHVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IChwdXNoIGEgbmV3IHVybCBzdGF0ZSlcbiAgICAgKiBhcyB0aGlzIGRvZXMgbm90IGhhcHBlbiB0aHJvdWdoIGJyb3dzZXIgY29udHJvbHMgKGJhY2svZm9yd2FyZCBidXR0b25zL3VybCBiYXIpLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1biBcbiAgICAgKiBAcGFyYW0ge2FueX0gY3VycmVudE9iamVjdFxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSB0cmFpbE5vZGUgXG4gICAgICogQHBhcmFtIHtib29sZWFufSByZXBsYWNlQ3VycmVudFVybFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5jbHVkZVdheXBvaW50c1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgc3RhdGljIHVpTmF2aWdhdGUoZnVuLCBjdXJyZW50T2JqZWN0LCB0cmFpbE5vZGUsIHJlcGxhY2VDdXJyZW50VXJsID0gZmFsc2UsIGluY2x1ZGVXYXlwb2ludHMgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCB0cmFpbE5vZGVzUGF0aCA9IFRyYWlsUHJvY2Vzc29yLm5vZGVzUGF0aEJ5RnVuY3Rpb24oZnVuLCB0cmFpbE5vZGUpO1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKCF0cmFpbE5vZGVzUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1cnJlbnRUcmFpbCA9IFwiXCI7XG4gICAgICAgIGZvciAoY29uc3QgdHJhaWxOb2RlIG9mIHRyYWlsTm9kZXNQYXRoKSB7XG5cbiAgICAgICAgICAgIGlmICghdHJhaWxOb2RlLnRyYWlsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHJhaWxQcm9jZXNzb3IudWlOYXZpZ2F0ZTogVHJhaWxOb2RlIGluIHBhdGggaGFzIG5vIHRyYWlsIGRlZmluZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0cmFpbExlYWYgPSBBcnJheS5pc0FycmF5KHRyYWlsTm9kZS50cmFpbCkgPyB0cmFpbE5vZGUudHJhaWxbdHJhaWxOb2RlLnRyYWlsLmxlbmd0aCAtIDFdIDogdHJhaWxOb2RlLnRyYWlsO1xuICAgICAgICAgICAgY3VycmVudFRyYWlsICs9IHRyYWlsTGVhZjtcblxuICAgICAgICAgICAgaWYgKHRyYWlsTm9kZS5wcm9wZXJ0eSAmJiBjdXJyZW50T2JqZWN0W3RyYWlsTm9kZS5wcm9wZXJ0eV0pIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gY3VycmVudE9iamVjdFt0cmFpbE5vZGUucHJvcGVydHldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYWlsTm9kZS53YXlwb2ludCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdHJhaWxOb2RlLndheXBvaW50LmNhbGwoY3VycmVudE9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5jbHVkZVdheXBvaW50cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFVybEJ1aWxkZXIuY3JlYXRlKCkud2l0aFVybChDb250YWluZXJVcmwuY3VycmVudFVybCgpKS53aXRoQW5jaG9yKGN1cnJlbnRUcmFpbCkuYnVpbGQoKTtcbiAgICAgICAgICAgICAgICBIaXN0b3J5LnB1c2hVcmwodXJsLCB1cmwudG9TdHJpbmcoKSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWluY2x1ZGVXYXlwb2ludHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IFVybEJ1aWxkZXIuY3JlYXRlKCkud2l0aFVybChDb250YWluZXJVcmwuY3VycmVudFVybCgpKS53aXRoQW5jaG9yKGN1cnJlbnRUcmFpbCkuYnVpbGQoKTtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlQ3VycmVudFVybCkge1xuICAgICAgICAgICAgICAgIEhpc3RvcnkucmVwbGFjZVVybCh1cmwsIHVybC50b1N0cmluZygpLCBudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgIFxuICAgICAgICAgICAgICAgIEhpc3RvcnkucHVzaFVybCh1cmwsIHVybC50b1N0cmluZygpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsaWVudCByZWZlcnMgdG8gdGhlIGJyb3dzZXIgb3IgY29udGFpbmVyIGhvc3RpbmcgdGhlIHdlYiBhcHBsaWNhdGlvbi5cbiAgICAgKiBBIGNsaWVudCBuYXZpZ2F0aW9uIG1lYW5zIHRoZSB1c2VyIGhhcyBwZXJmb3JtZWQgYSBuYXZpZ2F0aW9uIGFjdGlvbiBmcm9tXG4gICAgICogdGhlIGJyb3dzZXIgY29udHJvbHMgKGJhY2svZm9yd2FyZCBidXR0b25zL3VybCBiYXIpLlxuICAgICAqIFxuICAgICAqIFRoZSBuZWNlc3NhcnkgZnVuY3Rpb25zIGFsb25nIHRoZSB0cmFpbCBhcmUgdHJpZ2dlcmVkIHRvIGJyaW5nIHRoZSBhcHBsaWNhdGlvblxuICAgICAqIHRvIHRoZSBjb3JyZWN0IHN0YXRlLiBCdXQgdGhlIGJyb3dzZXIgaGlzdG9yeSBpcyBub3QgdXBkYXRlZCBhcyB0aGlzIG5hdmlnYXRpb25cbiAgICAgKiBvcmlnaW5hdGVzIGZyb20gdGhlIGJyb3dzZXIgY29udHJvbHMuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVcmx9IHVybCBcbiAgICAgKiBAcGFyYW0ge2FueX0gY3VycmVudE9iamVjdFxuICAgICAqIEBwYXJhbSB7VHJhaWxOb2RlfSB0cmFpbE5vZGVcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHN0YXRpYyBjbGllbnROYXZpZ2F0ZSh1cmwsIGN1cnJlbnRPYmplY3QsIHRyYWlsTm9kZSkge1xuICAgICAgICBjb25zdCB0cmFpbE5vZGVzUGF0aCA9IFRyYWlsUHJvY2Vzc29yLm5vZGVzUGF0aEJ5VHJhaWwodXJsLmFuY2hvciwgdHJhaWxOb2RlKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBudWxsO1xuXG4gICAgICAgIGlmICghdHJhaWxOb2Rlc1BhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXN0VHJhaWxOb2RlID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCB0cmFpbE5vZGUgb2YgdHJhaWxOb2Rlc1BhdGgpIHtcbiAgICAgICAgICAgIGxhc3RUcmFpbE5vZGUgPSB0cmFpbE5vZGU7XG5cbiAgICAgICAgICAgIGlmICh0cmFpbE5vZGUucHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gY3VycmVudE9iamVjdFt0cmFpbE5vZGUucHJvcGVydHldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYWlsTm9kZS53YXlwb2ludCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdHJhaWxOb2RlLndheXBvaW50LmNhbGwoY3VycmVudE9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhc3RUcmFpbE5vZGUgJiYgbGFzdFRyYWlsTm9kZS5kZXN0aW5hdGlvbikge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBsYXN0VHJhaWxOb2RlLmRlc3RpbmF0aW9uLmNhbGwoY3VycmVudE9iamVjdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdGhlRnVuY3Rpb24gXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGV9IHJvb3QgXG4gICAgICogQHJldHVybnMge1RyYWlsTm9kZVtdfVxuICAgICAqL1xuICAgIHN0YXRpYyBub2Rlc1BhdGhCeUZ1bmN0aW9uKHRoZUZ1bmN0aW9uLCByb290KSB7XG5cbiAgICAgICAgaWYgKCFyb290KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGl0ZXJhdGlvbiA9IG5ldyBUcmFpbEl0ZXJhdGlvbihyb290LCBbcm9vdF0pO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtpdGVyYXRpb25dO1xuXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SXRlcmF0aW9uID0gc3RhY2sucG9wKCk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5kZXN0aW5hdGlvbiA9PT0gdGhlRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dCAmJiBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3IFRyYWlsSXRlcmF0aW9uKGNoaWxkLCBbLi4uY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoLCBjaGlsZF0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdHJhaWwgXG4gICAgICogQHBhcmFtIHtUcmFpbE5vZGV9IHJvb3QgXG4gICAgICogQHJldHVybnMge1RyYWlsTm9kZVtdfVxuICAgICAqL1xuICAgIHN0YXRpYyBub2Rlc1BhdGhCeVRyYWlsKHRyYWlsLCByb290KSB7XG5cbiAgICAgICAgaWYgKCFyb290KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGl0ZXJhdGlvbiA9IG5ldyBUcmFpbEl0ZXJhdGlvbihyb290LCBbcm9vdF0pO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtpdGVyYXRpb25dO1xuXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SXRlcmF0aW9uID0gc3RhY2sucG9wKCk7XG5cbiAgICAgICAgICAgIGxldCBjdXJyZW50VHJhaWwgPSBcIlwiO1xuICAgICAgICAgICAgY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGVQYXRoLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFpbExlYWYgPSBBcnJheS5pc0FycmF5KG5vZGUudHJhaWwpID8gbm9kZS50cmFpbFtub2RlLnRyYWlsLmxlbmd0aCAtIDFdIDogbm9kZS50cmFpbDtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhaWwgKz0gdHJhaWxMZWFmO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50VHJhaWwgPT09IHRyYWlsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlUGF0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHQgJiYgY3VycmVudEl0ZXJhdGlvbi50cmFpbE5vZGUubmV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlLm5leHQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjdXJyZW50SXRlcmF0aW9uLnRyYWlsTm9kZS5uZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5ldyBUcmFpbEl0ZXJhdGlvbihjaGlsZCwgWy4uLmN1cnJlbnRJdGVyYXRpb24udHJhaWxOb2RlUGF0aCwgY2hpbGRdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxufSIsImV4cG9ydCBjbGFzcyBTdHlsZVNlbGVjdG9yIHtcbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNsYXNzTmFtZSkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcblxuICAgICAgICAvKiogQHR5cGUge01hcDxTdHJpbmcsIFN0cmluZz59ICovXG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgd2l0aEF0dHJpYnV0ZShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGxldCBhdHRyU3RyaW5nID0gXCJcIjtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGF0dHJTdHJpbmcgKz0gYFxcdCR7a2V5fTogJHt2YWx1ZX07XFxuYDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmNsYXNzTmFtZX0ge1xcbiR7YXR0clN0cmluZ319YDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBTdHlsZVNlbGVjdG9yIH0gZnJvbSBcIi4vc3R5bGVTZWxlY3RvclwiO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVNZWRpYSB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVkaWEgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWVkaWEpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5tZWRpYSA9IG1lZGlhO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8U3R5bGVTZWxlY3Rvcj59ICovXG4gICAgICAgIHRoaXMuc3R5bGVTZWxlY3RvckFycmF5ID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHlsZVNlbGVjdG9yfSBzdHlsZVNlbGVjdG9yXG4gICAgICogQHJldHVybnMge1N0eWxlTWVkaWF9XG4gICAgICovXG4gICAgd2l0aFNlbGVjdG9yKHN0eWxlU2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5zdHlsZVNlbGVjdG9yQXJyYXkuc2V0KHN0eWxlU2VsZWN0b3IpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgbWVkaWFTdHJpbmcgPSBcIlwiO1xuICAgICAgICB0aGlzLnN0eWxlU2VsZWN0b3JBcnJheS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgbWVkaWFTdHJpbmcgKz0gYCR7dmFsdWUudG9TdHJpbmcoKX1cXG5gO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMubWVkaWF9IHtcXG4ke21lZGlhU3RyaW5nfVxcbn1cXG5gO1xuICAgIH1cblxufSIsImltcG9ydCB7IFN0eWxlTWVkaWEgfSBmcm9tIFwiLi9zdHlsZU1lZGlhXCI7XG5pbXBvcnQgeyBTdHlsZVNlbGVjdG9yIH0gZnJvbSBcIi4vc3R5bGVTZWxlY3RvclwiO1xuaW1wb3J0IHsgU3R5bGVzaGVldCB9IGZyb20gXCIuL3N0eWxlc2hlZXRcIjtcblxuZXhwb3J0IGNsYXNzIFN0eWxlc2hlZXRCdWlsZGVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFN0eWxlc2hlZXRCdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZVNlbGVjdG9yW119ICovXG4gICAgICAgIHRoaXMuc3R5bGVTZWxlY3RvckFycmF5ID0gW107XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZU1lZGlhW119ICovXG4gICAgICAgIHRoaXMubWVkaWFBcnJheSA9IFtdO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVTZWxlY3RvcnxTdHlsZU1lZGlhfSAqL1xuICAgICAgICB0aGlzLmxhc3RBZGRlZCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZVNlbGVjdG9yfFN0eWxlTWVkaWF9ICovXG4gICAgICAgIHRoaXMuY29udGV4dCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtTdHlsZVNlbGVjdG9yfFN0eWxlTWVkaWF9ICovXG4gICAgICAgIHRoaXMucGFyZW50Q29udGV4dCA9IG51bGw7XG5cbiAgICB9XG5cbiAgICBvcGVuKCkge1xuICAgICAgICBpZiAoIXRoaXMubGFzdEFkZGVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBjb250ZXh0IHRvIG9wZW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFzdEFkZGVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRDb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5sYXN0QWRkZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNvbnRleHQgdG8gY2xvc2VcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5wYXJlbnRDb250ZXh0O1xuICAgICAgICB0aGlzLnBhcmVudENvbnRleHQgPSBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVTZWxlY3Rvck5hbWUgXG4gICAgICogQHJldHVybnMge1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHNlbGVjdG9yKHN0eWxlU2VsZWN0b3JOYW1lKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBuZXcgU3R5bGVTZWxlY3RvcihzdHlsZVNlbGVjdG9yTmFtZSk7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVTZWxlY3RvckFycmF5LnB1c2goZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSBpZih0aGlzLmNvbnRleHQgaW5zdGFuY2VvZiBTdHlsZU1lZGlhKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuc3R5bGVTZWxlY3RvckFycmF5LnB1c2goZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE9wZW4gY29udGV4dCBtdXN0IGJlIGEgbWVkaWEgY29udGV4dCB3aGVuIGFkZGluZyAke3N0eWxlU2VsZWN0b3JOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdEFkZGVkID0gZWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbWVkaWEobWVkaWFTZWxlY3Rvcikge1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBhZGQgbWVkaWEgJHttZWRpYVNlbGVjdG9yfSBpbnNpZGUgb3BlbiBjb250ZXh0YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IG5ldyBTdHlsZU1lZGlhKG1lZGlhU2VsZWN0b3IpO1xuICAgICAgICB0aGlzLm1lZGlhQXJyYXkucHVzaChlbGVtZW50KTtcbiAgICAgICAgdGhpcy5sYXN0QWRkZWQgPSBlbGVtZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHkgXG4gICAgICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSB2YWx1ZSBcbiAgICAgKiBAcmV0dXJucyB7U3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3R5bGUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICAgIGlmICghKHRoaXMuY29udGV4dCBpbnN0YW5jZW9mIFN0eWxlU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG9wZW4gc2VsZWN0b3IgY29udGV4dCB3aGVuIGFkZGluZyBzdHlsZSAke3Byb3BlcnR5fWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGV4dC53aXRoQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtTdHlsZXNoZWV0fVxuICAgICAqL1xuICAgIGJ1aWxkKCkge1xuICAgICAgICBsZXQgc3R5bGVzU3RyaW5nID0gXCJcIjtcbiAgICAgICAgdGhpcy5zdHlsZVNlbGVjdG9yQXJyYXkuZm9yRWFjaCgoc3R5bGVTZWxlY3RvcikgPT4ge1xuICAgICAgICAgICAgc3R5bGVzU3RyaW5nICs9IHN0eWxlU2VsZWN0b3IudG9TdHJpbmcoKSArIFwiXFxuXCI7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm1lZGlhQXJyYXkuZm9yRWFjaCgoc3R5bGVNZWRpYSkgPT4ge1xuICAgICAgICAgICAgc3R5bGVzU3RyaW5nICs9IHN0eWxlTWVkaWEudG9TdHJpbmcoKSArIFwiXFxuXCI7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFN0eWxlc2hlZXQoc3R5bGVzU3RyaW5nKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcbmltcG9ydCB7IFVuaXF1ZUlkUmVnaXN0cnkgfSBmcm9tIFwiLi91bmlxdWVJZFJlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Jhc2VFbGVtZW50XCI7XG5pbXBvcnQgeyBIVE1MIH0gZnJvbSBcIi4uL2h0bWwvaHRtbFwiO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50QnVpbGRlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VuaXF1ZUlkUmVnaXN0cnl9IGlkUmVnaXN0cnlcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50QnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKGlkUmVnaXN0cnkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRCdWlsZGVyKGlkUmVnaXN0cnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VW5pcXVlSWRSZWdpc3RyeX0gaWRSZWdpc3RyeVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGlkUmVnaXN0cnkpIHtcblxuICAgICAgICAvKiogQHR5cGUge1VuaXF1ZUlkUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMuaWRSZWdpc3RyeSA9IGlkUmVnaXN0cnk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNYXA8U3RyaW5nLCBCYXNlRWxlbWVudD59ICovXG4gICAgICAgIHRoaXMuZWxlbWVudE1hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge0Jhc2VFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMuY29udGV4dEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnRbXX0gKi9cbiAgICAgICAgdGhpcy50cmFpbCA9IFtdO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtVbmlxdWVJZFJlZ2lzdHJ5fSBpZFJlZ2lzdHJ5XG4gICAgICogQHBhcmFtIHtNYXA8U3RyaW5nLCBCYXNlRWxlbWVudD59IGVsZW1lbnRNYXBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGFnIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nW119IGF0dHJpYnV0ZUFycmF5IFxuICAgICAqIEByZXR1cm5zIHtCYXNlRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgdGFnKGlkUmVnaXN0cnksIGVsZW1lbnRNYXAsIHRhZywgLi4uYXR0cmlidXRlQXJyYXkpIHtcblxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGF0dHJpYnV0ZUFycmF5LmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgICBpZiAoIWF0dHIuaW5jbHVkZXMoXCI9XCIpKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlTWFwLnNldChhdHRyLCBcIlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZmlyc3RFcXVhbFNpZ25JbmRleCA9IGF0dHIuaW5kZXhPZihcIj1cIik7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhdHRyLnN1YnN0cmluZygwLCBmaXJzdEVxdWFsU2lnbkluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXR0ci5zdWJzdHJpbmcoZmlyc3RFcXVhbFNpZ25JbmRleCArIDEpO1xuICAgICAgICAgICAgYXR0cmlidXRlTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtCYXNlRWxlbWVudH0gKi9cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IEhUTUwuY3VzdG9tKHRhZywgYXR0cmlidXRlTWFwKTtcblxuICAgICAgICBhdHRyaWJ1dGVNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKFwiaWRcIiA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudE1hcC5zZXQodmFsdWUsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gaWRSZWdpc3RyeS5pZEF0dHJpYnV0ZVdpdGhTdWZmaXgodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZyBcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmdbXX0gYXR0cmlidXRlQXJyYXkgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcm9vdCh0YWcsIC4uLmF0dHJpYnV0ZUFycmF5KSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBSb290IGVsZW1lbnQgaXMgYWxyZWFkeSBkZWZpbmVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gQ29tcG9uZW50QnVpbGRlci50YWcodGhpcy5pZFJlZ2lzdHJ5LCB0aGlzLmVsZW1lbnRNYXAsIHRhZywgLi4uYXR0cmlidXRlQXJyYXkpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSB0aGlzLnJvb3RFbGVtZW50O1xuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50ID0gdGhpcy5yb290RWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWUgXG4gICAgICogQHBhcmFtICB7U3RyaW5nW119IGF0dHJpYnV0ZUFycmF5XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbm9kZSh0YWdOYW1lLCAuLi5hdHRyaWJ1dGVBcnJheSkge1xuICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IFJvb3QgZWxlbWVudCBpcyBub3QgZGVmaW5lZC4gQ2FsbCByb290KCkgYmVmb3JlIGFkZGluZyBjaGlsZCBlbGVtZW50cy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudHJhaWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBObyBvcGVuIGVsZW1lbnQgY29udGV4dCB0byBhZGQgY2hpbGQgZWxlbWVudHMsIGNhbGwgb3BlbigpIGJlZm9yZSBhZGRpbmcuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBDb21wb25lbnRCdWlsZGVyLnRhZyh0aGlzLmlkUmVnaXN0cnksIHRoaXMuZWxlbWVudE1hcCwgdGFnTmFtZSwgLi4uYXR0cmlidXRlQXJyYXkpO1xuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50LmFkZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50QnVpbGRlcn1cbiAgICAgKi9cbiAgICB0ZXh0KHRleHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnRCdWlsZGVyOiBSb290IGVsZW1lbnQgaXMgbm90IGRlZmluZWQuIENhbGwgcm9vdCgpIGJlZm9yZSBhZGRpbmcgY2hpbGQgZWxlbWVudHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRyYWlsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogTm8gb3BlbiBlbGVtZW50IGNvbnRleHQgdG8gYWRkIGNoaWxkIGVsZW1lbnRzLCBjYWxsIG9wZW4oKSBiZWZvcmUgYWRkaW5nLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50LmFkZENoaWxkKHRleHQpO1xuICAgICAgICB0aGlzLmxhc3RBZGRlZEVsZW1lbnQgPSBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBvcGVuKCkge1xuICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IFJvb3QgZWxlbWVudCBpcyBub3QgZGVmaW5lZC4gQ2FsbCByb290KCkgYmVmb3JlIGFkZGluZyBjaGlsZCBlbGVtZW50cy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFzdEFkZGVkRWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50QnVpbGRlcjogVW5hYmxlIHRvIG9wZW4gbGFzdCBlbGVtZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyYWlsLnB1c2godGhpcy5jb250ZXh0RWxlbWVudCk7XG4gICAgICAgIHRoaXMuY29udGV4dEVsZW1lbnQgPSB0aGlzLmxhc3RBZGRlZEVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICBpZiAodGhpcy50cmFpbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudEJ1aWxkZXI6IE5vIG9wZW4gZWxlbWVudCBjb250ZXh0IHRvIGNsb3NlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHRFbGVtZW50ID0gdGhpcy50cmFpbC5wb3AoKTtcbiAgICAgICAgdGhpcy5sYXN0QWRkZWRFbGVtZW50ID0gdGhpcy5jb250ZXh0RWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYnVpbGQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50KGNvbXBvbmVudEJ1aWxkZXJDb3VudGVyKyssIHRoaXMucm9vdEVsZW1lbnQsIHRoaXMuZWxlbWVudE1hcCk7XG4gICAgfVxufVxuXG5sZXQgY29tcG9uZW50QnVpbGRlckNvdW50ZXIgPSAwOyIsImltcG9ydCB7IEluamVjdGlvblBvaW50IH0gZnJvbSBcIm1pbmRpX3YxXCI7XG5pbXBvcnQgeyBTdHlsZXNSZWdpc3RyeSB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnlcIjtcbmltcG9ydCB7IENvbXBvbmVudEZhY3RvcnkgfSBmcm9tIFwiLi9jb21wb25lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vdW5pcXVlSWRSZWdpc3RyeVwiO1xuaW1wb3J0IHsgQ2FudmFzU3R5bGVzIH0gZnJvbSBcIi4uL2NhbnZhcy9jYW52YXNTdHlsZXNcIjtcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuLi9jb21wb25lbnQvY29tcG9uZW50XCI7XG5pbXBvcnQgeyBTdHlsZXNoZWV0QnVpbGRlciB9IGZyb20gXCIuLi9zdHlsZXMvc3R5bGVzaGVldEJ1aWxkZXJcIjtcbmltcG9ydCB7IENvbXBvbmVudEJ1aWxkZXIgfSBmcm9tIFwiLi4vY29tcG9uZW50L2NvbXBvbmVudEJ1aWxkZXJcIjtcblxuZXhwb3J0IGNsYXNzIElubGluZUNvbXBvbmVudEZhY3RvcnkgZXh0ZW5kcyBDb21wb25lbnRGYWN0b3J5IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3R5bGVzUmVnaXN0cnl9ICovXG4gICAgICAgIHRoaXMuc3R5bGVzUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShTdHlsZXNSZWdpc3RyeSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtVbmlxdWVJZFJlZ2lzdHJ5fSAqL1xuICAgICAgICB0aGlzLnVuaXF1ZUlkUmVnaXN0cnkgPSBJbmplY3Rpb25Qb2ludC5pbnN0YW5jZShVbmlxdWVJZFJlZ2lzdHJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbGFzc1R5cGUgcmVwcmVzZW50cyB0aGUgaW5saW5lIGNvbXBvbmVudCBjbGFzc1xuICAgICAqL1xuICAgIGNyZWF0ZShjbGFzc1R5cGUpe1xuICAgICAgICBpZiAoIWNsYXNzVHlwZS5idWlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5saW5lIGNvbXBvbmVudCBjbGFzcyBtdXN0IGltcGxlbWVudCBzdGF0aWMgbWV0aG9kIGJ1aWxkQ29tcG9uZW50KClcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHR5cGUge0NvbXBvbmVudH0gKi9cbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY2xhc3NUeXBlLmJ1aWxkQ29tcG9uZW50KENvbXBvbmVudEJ1aWxkZXIuY3JlYXRlKHRoaXMudW5pcXVlSWRSZWdpc3RyeSkpO1xuXG4gICAgICAgIGlmIChjbGFzc1R5cGUuYnVpbGRTdHlsZXNoZWV0KSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBjbGFzc1R5cGUuYnVpbGRTdHlsZXNoZWV0KFN0eWxlc2hlZXRCdWlsZGVyLmNyZWF0ZSgpKTtcblxuICAgICAgICAgICAgQ2FudmFzU3R5bGVzLnNldFN0eWxlKGNsYXNzVHlwZS5uYW1lLCBzdHlsZXNoZWV0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cblxufSIsImltcG9ydCB7IE1pbmRpSW5qZWN0b3IsXG4gICAgTWluZGlDb25maWcsXG4gICAgSW5zdGFuY2VQb3N0Q29uZmlnVHJpZ2dlcixcbiAgICBDb25maWdBY2Nlc3NvcixcbiAgICBTaW5nbGV0b25Db25maWcsXG4gICAgUHJvdG90eXBlQ29uZmlnLCBcbiAgICBDb25maWcgfSBmcm9tIFwibWluZGlfdjFcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMsIExvZ2dlciwgTWV0aG9kLCBTdHJpbmdVdGlscyB9IGZyb20gIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENvbnRhaW5lckV2ZW50LCBDb250YWluZXJVcmwgfSBmcm9tIFwiY29udGFpbmVyYnJpZGdlX3YxXCI7XG5pbXBvcnQgeyBDb21wb25lbnRDb25maWdQcm9jZXNzb3IgfSBmcm9tIFwiLi9jb21wb25lbnQvY29tcG9uZW50Q29uZmlnUHJvY2Vzc29yLmpzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSBcIi4vdGVtcGxhdGUvdGVtcGxhdGVSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IHsgU3R5bGVzUmVnaXN0cnkgfSBmcm9tIFwiLi9zdHlsZXMvc3R5bGVzUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IEhpc3RvcnkgfSBmcm9tIFwiLi9uYXZpZ2F0aW9uL2hpc3RvcnkuanNcIjtcbmltcG9ydCB7IERpTW9kdWxlTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyL2RpTW9kdWxlTG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi91dGlsL3VybC5qc1wiO1xuaW1wb3J0IHsgTW9kdWxlUnVubmVyIH0gZnJvbSBcIi4vbW9kdWxlUnVubmVyLmpzXCI7XG5pbXBvcnQgeyBNb2R1bGUgfSBmcm9tIFwiLi9tb2R1bGUuanNcIjtcbmltcG9ydCB7IEFjdGl2ZU1vZHVsZVJ1bm5lciB9IGZyb20gXCIuL2FjdGl2ZU1vZHVsZVJ1bm5lci5qc1wiO1xuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSBcIi4vc3RhdGUvc3RhdGVNYW5hZ2VyLmpzXCI7XG5pbXBvcnQgeyBVbmlxdWVJZFJlZ2lzdHJ5IH0gZnJvbSBcIi4vY29tcG9uZW50L3VuaXF1ZUlkUmVnaXN0cnkuanNcIjtcbmltcG9ydCB7IFRlbXBsYXRlQ29tcG9uZW50RmFjdG9yeSB9IGZyb20gXCIuL2NvbXBvbmVudC90ZW1wbGF0ZUNvbXBvbmVudEZhY3RvcnkuanNcIjtcbmltcG9ydCB7IE1vZHVsZUxvYWRlciB9IGZyb20gXCIuL2xvYWRlci9tb2R1bGVMb2FkZXIuanNcIjtcbmltcG9ydCB7IFRyYWlsUHJvY2Vzc29yIH0gZnJvbSBcIi4vbmF2aWdhdGlvbi90cmFpbFByb2Nlc3Nvci5qc1wiO1xuaW1wb3J0IHsgSW5saW5lQ29tcG9uZW50RmFjdG9yeSB9IGZyb20gXCIuL2NvbXBvbmVudC9pbmxpbmVDb21wb25lbnRGYWN0b3J5LmpzXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJBcHBsaWNhdGlvblwiKTtcblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgTW9kdWxlUnVubmVyIHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QXJyYXk8TW9kdWxlTG9hZGVyPn0gbW9kdWxlTG9hZGVyQXJyYXkgXG4gICAgICogQHBhcmFtIHtDb25maWd9IGNvbmZpZyBcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB3b3JrZXJBcnJheSBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVMb2FkZXJBcnJheSwgY29uZmlnID0gbmV3IE1pbmRpQ29uZmlnKCksIHdvcmtlckFycmF5ID0gbmV3IEFycmF5KCkpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8TW9kdWxlTG9hZGVyPn0gKi9cbiAgICAgICAgdGhpcy5tb2R1bGVMb2FkZXJBcnJheSA9IG1vZHVsZUxvYWRlckFycmF5O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7TWluZGlDb25maWd9ICovXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gICAgICAgIHRoaXMud29ya2VyQXJyYXkgPSB3b3JrZXJBcnJheTtcblxuICAgICAgICAvKiogQHR5cGUge0FycmF5fSAqL1xuICAgICAgICB0aGlzLnJ1bm5pbmdXb3JrZXJzID0gbmV3IEFycmF5KCk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNb2R1bGV9ICovXG4gICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlID0gbnVsbDtcblxuICAgICAgICB0aGlzLmRlZmF1bHRDb25maWcgPSBbXG4gICAgICAgICAgICBTaW5nbGV0b25Db25maWcudW5uYW1lZChUZW1wbGF0ZVJlZ2lzdHJ5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKFN0eWxlc1JlZ2lzdHJ5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKFVuaXF1ZUlkUmVnaXN0cnkpLFxuICAgICAgICAgICAgU2luZ2xldG9uQ29uZmlnLnVubmFtZWQoVGVtcGxhdGVDb21wb25lbnRGYWN0b3J5KSxcbiAgICAgICAgICAgIFNpbmdsZXRvbkNvbmZpZy51bm5hbWVkKElubGluZUNvbXBvbmVudEZhY3RvcnkpLFxuICAgICAgICAgICAgUHJvdG90eXBlQ29uZmlnLnVubmFtZWQoU3RhdGVNYW5hZ2VyKVxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbmZpZ1Byb2Nlc3NvcnMgPSBbIENvbXBvbmVudENvbmZpZ1Byb2Nlc3NvciBdO1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdEluc3RhbmNlUHJvY2Vzc29ycyA9IFsgSW5zdGFuY2VQb3N0Q29uZmlnVHJpZ2dlciBdO1xuXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBMT0cuaW5mbyhcIlJ1bm5pbmcgQXBwbGljYXRpb25cIik7XG4gICAgICAgIHRoaXMuY29uZmlnXG4gICAgICAgICAgICAuYWRkQWxsVHlwZUNvbmZpZyh0aGlzLmRlZmF1bHRDb25maWcpXG4gICAgICAgICAgICAuYWRkQWxsQ29uZmlnUHJvY2Vzc29yKHRoaXMuZGVmYXVsdENvbmZpZ1Byb2Nlc3NvcnMpXG4gICAgICAgICAgICAuYWRkQWxsSW5zdGFuY2VQcm9jZXNzb3IodGhpcy5kZWZhdWx0SW5zdGFuY2VQcm9jZXNzb3JzKTtcbiAgICAgICAgQWN0aXZlTW9kdWxlUnVubmVyLmluc3RhbmNlKCkuc2V0KHRoaXMpO1xuICAgICAgICBDb250YWluZXJVcmwuYWRkVXNlck5hdmlnYXRlTGlzdGVuZXIobmV3IE1ldGhvZCh0aGlzLnVwZGF0ZSwgdGhpcykpO1xuICAgICAgICBjb25zdCBtb2R1bGUgPSBhd2FpdCB0aGlzLnJ1bk1vZHVsZShIaXN0b3J5LmN1cnJlbnRVcmwoKSk7XG4gICAgICAgIHRoaXMuc3RhcnRXb3JrZXJzKCk7XG4gICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtDb250YWluZXJFdmVudH0gZXZlbnRcbiAgICAgKi9cbiAgICB1cGRhdGUoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgdXJsID0gSGlzdG9yeS5jdXJyZW50VXJsKCk7XG4gICAgICAgIExPRy5pbmZvKFwiQXBwbGljYXRpb246IHVwZGF0ZSB0byBcIiArIHVybC50b1N0cmluZygpKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlTW9kdWxlICYmIHRoaXMuYWN0aXZlTW9kdWxlLnRyYWlsTWFwICYmIFN0cmluZ1V0aWxzLnN0YXJ0c1dpdGgodXJsLmFuY2hvciwgdGhpcy5hY3RpdmVNb2R1bGUudHJhaWxNYXAudHJhaWwpKSB7XG4gICAgICAgICAgICBUcmFpbFByb2Nlc3Nvci5jbGllbnROYXZpZ2F0ZSh1cmwsIHRoaXMuYWN0aXZlTW9kdWxlLCB0aGlzLmFjdGl2ZU1vZHVsZS50cmFpbE1hcCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5Nb2R1bGUodXJsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1VybH0gdXJsIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFzeW5jIHJ1bk1vZHVsZSh1cmwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZUxvYWRlciA9IHRoaXMuZ2V0TWF0Y2hpbmdNb2R1bGVMb2FkZXIodXJsKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlID0gYXdhaXQgbW9kdWxlTG9hZGVyLmxvYWQoKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlLnVybCA9IHVybDtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kdWxlLmxvYWQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZU1vZHVsZS50cmFpbE1hcCkge1xuICAgICAgICAgICAgICAgIFRyYWlsUHJvY2Vzc29yLmNsaWVudE5hdmlnYXRlKHVybCwgdGhpcy5hY3RpdmVNb2R1bGUsIHRoaXMuYWN0aXZlTW9kdWxlLnRyYWlsTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU1vZHVsZTtcbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgTE9HLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnRXb3JrZXJzKCkge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nV29ya2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWc7XG4gICAgICAgIGNvbnN0IHJ1bm5pbmdXb3JrZXJzID0gdGhpcy5ydW5uaW5nV29ya2VycztcbiAgICAgICAgdGhpcy53b3JrZXJBcnJheS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgdmFsdWUoKTtcbiAgICAgICAgICAgIE1pbmRpSW5qZWN0b3IuaW5qZWN0KGluc3RhbmNlLCBjb25maWcpO1xuICAgICAgICAgICAgQXJyYXlVdGlscy5hZGQocnVubmluZ1dvcmtlcnMsIGluc3RhbmNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtVcmx9IHVybFxuICAgICAqIEByZXR1cm5zIHtEaU1vZHVsZUxvYWRlcn1cbiAgICAgKi9cbiAgICBnZXRNYXRjaGluZ01vZHVsZUxvYWRlcih1cmwpIHtcbiAgICAgICAgbGV0IGZvdW5kTW9kdWxlTG9hZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tb2R1bGVMb2FkZXJBcnJheS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFmb3VuZE1vZHVsZUxvYWRlciAmJiB2YWx1ZS5tYXRjaGVzKHVybCkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZE1vZHVsZUxvYWRlciA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZvdW5kTW9kdWxlTG9hZGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSBnbG9iYWwgYWNjZXNzIHRvIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGNvbmZpZ1xuICAgICAqL1xuICAgIHdpbmRvd0RpQ29uZmlnKCkge1xuICAgICAgICB3aW5kb3cuZGlDb25maWcgPSAoKSA9PiB7XG4gICAgICAgICAgICBMT0cuaW5mbyh0aGlzLmNvbmZpZy5jb25maWdFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSBnbG9iYWwgYWNjZXNzIHRvIHRlbXBsYXRlIHJlZ2lzdHJ5XG4gICAgICovXG4gICAgd2luZG93VGVtcGxhdGVSZWdpc3RyeSgpIHtcbiAgICAgICAgd2luZG93LnRlbXBsYXRlUmVnaXN0cnkgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0eXBlQ29uZmlnID0gQ29uZmlnQWNjZXNzb3IudHlwZUNvbmZpZ0J5TmFtZShUZW1wbGF0ZVJlZ2lzdHJ5Lm5hbWUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIExPRy5pbmZvKHR5cGVDb25maWcuaW5zdGFuY2VIb2xkZXIoKS5pbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgZ2xvYmFsIGFjY2VzcyB0byBzdHlsZSByZWdpc3RyeVxuICAgICAqL1xuICAgIHdpbmRvd1N0eWxlUmVnaXN0cnkoKSB7XG4gICAgICAgIHdpbmRvdy5zdHlsZVJlZ2lzdHJ5ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZUNvbmZpZyA9IENvbmZpZ0FjY2Vzc29yLnR5cGVDb25maWdCeU5hbWUoU3R5bGVzUmVnaXN0cnkubmFtZSwgdGhpcy5jb25maWcpO1xuICAgICAgICAgICAgTE9HLmluZm8odHlwZUNvbmZpZy5pbnN0YW5jZUhvbGRlcigpLmluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IE1hcCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG4vKiogQHR5cGUge01hcH0gKi9cbmxldCBjb25maWd1cmVkRnVuY3Rpb25NYXAgPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBjbGFzcyBDb25maWd1cmVkRnVuY3Rpb24ge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdGhlRnVuY3Rpb25cbiAgICAgKi9cbiAgICBzdGF0aWMgY29uZmlndXJlKG5hbWUsIHRoZUZ1bmN0aW9uKSB7XG4gICAgICAgIGNvbmZpZ3VyZWRGdW5jdGlvbk1hcC5zZXQobmFtZSwgdGhlRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIHN0YXRpYyBleGVjdXRlKG5hbWUsIHBhcmFtZXRlcikge1xuICAgICAgICByZXR1cm4gY29uZmlndXJlZEZ1bmN0aW9uTWFwLmdldChuYW1lKS5jYWxsKG51bGwsIHBhcmFtZXRlcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUHJvcGVydHlBY2Nlc3NvciwgTGlzdCwgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBBYnN0cmFjdElucHV0RWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Fic3RyYWN0SW5wdXRFbGVtZW50XCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJbnB1dEVsZW1lbnREYXRhQmluZGluZ1wiKTtcblxuZXhwb3J0IGNsYXNzIElucHV0RWxlbWVudERhdGFCaW5kaW5nIHtcblxuICAgIGNvbnN0cnVjdG9yKG1vZGVsLCB2YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICB0aGlzLnZhbGlkYXRvciA9IHZhbGlkYXRvcjtcbiAgICAgICAgdGhpcy5wdWxsZXJzID0gbmV3IExpc3QoKTtcbiAgICAgICAgdGhpcy5wdXNoZXJzID0gbmV3IExpc3QoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbGluayhtb2RlbCwgdmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW5wdXRFbGVtZW50RGF0YUJpbmRpbmcobW9kZWwsIHZhbGlkYXRvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdElucHV0RWxlbWVudH0gZmllbGQgXG4gICAgICovXG4gICAgdG8oZmllbGQpIHtcbiAgICAgICAgY29uc3QgcHVsbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbW9kZWxWYWx1ZSA9IFByb3BlcnR5QWNjZXNzb3IuZ2V0VmFsdWUodGhpcy5tb2RlbCwgZmllbGQubmFtZSk7XG4gICAgICAgICAgICBpZiAobW9kZWxWYWx1ZSAhPT0gZmllbGQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBQcm9wZXJ0eUFjY2Vzc29yLnNldFZhbHVlKHRoaXMubW9kZWwsIGZpZWxkLm5hbWUsIGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRvciAmJiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZSl7XG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0b3IudmFsaWRhdGUoZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmaWVsZC5saXN0ZW5UbyhcImlucHV0XCIsIHB1bGxlciwgdGhpcyk7XG4gICAgICAgIGZpZWxkLmxpc3RlblRvKFwia2V5dXBcIiwgcHVsbGVyLCB0aGlzKTtcblxuICAgICAgICBjb25zdCBwdXNoZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtb2RlbFZhbHVlID0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCBmaWVsZC5uYW1lKTtcbiAgICAgICAgICAgIGlmIChtb2RlbFZhbHVlICE9PSBmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gbW9kZWxWYWx1ZSA/IG1vZGVsVmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdG9yICYmIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlU2lsZW50ICYmIGZpZWxkLnZhbHVlKXtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZVNpbGVudChmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNoYW5nZWRGdW5jdGlvbk5hbWUgPSBcIl9fY2hhbmdlZF9cIiArIGZpZWxkLm5hbWUucmVwbGFjZShcIi5cIixcIl9cIik7XG4gICAgICAgIGlmICghdGhpcy5tb2RlbFtjaGFuZ2VkRnVuY3Rpb25OYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5tb2RlbFtjaGFuZ2VkRnVuY3Rpb25OYW1lXSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHVsbGVycy5hZGQocHVsbGVyKTtcbiAgICAgICAgdGhpcy5wdXNoZXJzLmFkZChwdXNoZXIpO1xuXG4gICAgICAgIGxldCBtb2RlbFZhbHVlID0gUHJvcGVydHlBY2Nlc3Nvci5nZXRWYWx1ZSh0aGlzLm1vZGVsLCBmaWVsZC5uYW1lKTtcblxuICAgICAgICBpZiAobW9kZWxWYWx1ZSkge1xuICAgICAgICAgICAgcHVzaGVyLmNhbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgcHVsbGVyLmNhbGwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QWJzdHJhY3RJbnB1dEVsZW1lbnR9IGZpZWxkIFxuICAgICAqL1xuICAgIGFuZChmaWVsZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50byhmaWVsZCk7XG4gICAgfVxuXG4gICAgcHVsbCgpIHtcbiAgICAgICAgdGhpcy5wdWxsZXJzLmZvckVhY2goKHZhbHVlLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmNhbGwocGFyZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdXNoKCkge1xuICAgICAgICB0aGlzLnB1c2hlcnMuZm9yRWFjaCgodmFsdWUsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuY2FsbChwYXJlbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgUHJveHlPYmplY3RGYWN0b3J5IHtcblxuICAgIHN0YXRpYyBDSEFOR0VfTElTVEVORVJfUFJPWFkgPSBTeW1ib2woJ2NoYW5nZUxpc3RlbmVyUHJveHknKTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBwcm94eSBmb3IgYW4gb2JqZWN0IHdoaWNoIGFsbG93cyBkYXRhYmluZGluZyBmcm9tIHRoZSBvYmplY3QgdG8gdGhlIGZvcm0gZWxlbWVudFxuICAgICAqIFxuICAgICAqIEB0ZW1wbGF0ZSBUXG4gICAgICogQHBhcmFtIHtUfSBvYmplY3QgXG4gICAgICogQHJldHVybnMge1R9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVByb3h5T2JqZWN0KG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0W1Byb3h5T2JqZWN0RmFjdG9yeS5DSEFOR0VfTElTVEVORVJfUFJPWFldKSB7XG4gICAgICAgICAgICBMT0cud2FybihcIk9iamVjdCBpcyBhbHJlYWR5IGEgY2hhbmdlIGxpc3RlbmVyIHByb3h5LlwiKTtcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShvYmplY3QsIHtcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gUHJveHlPYmplY3RGYWN0b3J5LkNIQU5HRV9MSVNURU5FUl9QUk9YWSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3VjY2VzcyA9ICh0YXJnZXRbcHJvcF0gPSB2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgY2hhbmdlZEZ1bmN0aW9uTmFtZSA9IFwiX19jaGFuZ2VkX1wiICsgcHJvcDtcbiAgICAgICAgICAgICAgICBsZXQgY2hhbmdlZEZ1bmN0aW9uID0gdGFyZ2V0W2NoYW5nZWRGdW5jdGlvbk5hbWVdO1xuICAgICAgICAgICAgICAgIGlmKGNoYW5nZWRGdW5jdGlvbiAmJiB0eXBlb2YgY2hhbmdlZEZ1bmN0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvdW5kQ2hhbmdlZEZ1bmN0aW9uID0gY2hhbmdlZEZ1bmN0aW9uLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRDaGFuZ2VkRnVuY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MgPT09IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29uZmlndXJlZEZ1bmN0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZy9jb25maWd1cmVkRnVuY3Rpb24uanNcIjtcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9zaW1wbGVFbGVtZW50LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFdmVudCB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihldmVudCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7RXZlbnR9ICovXG4gICAgICAgIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQudHlwZS50b0xvd2VyQ2FzZSgpID09IFwiZHJhZ3N0YXJ0XCIpe1xuICAgICAgICAgICAgdGhpcy5ldmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RvcFByb3BhZ2F0aW9uKCkge1xuICAgICAgICB0aGlzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIHByZXZlbnREZWZhdWx0KCkge1xuICAgICAgICB0aGlzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgZ2V0IGZpbGVzKCkge1xuICAgICAgICBpZiAodGhpcy5ldmVudC50YXJnZXQgJiYgdGhpcy5ldmVudC50YXJnZXQuZmlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV2ZW50LnRhcmdldC5maWxlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ldmVudC5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7RGF0YVRyYW5zZmVyfSAqL1xuICAgICAgICAgICAgY29uc3QgZGF0YVRyYW5zZmVyID0gdGhpcy5ldmVudC5kYXRhVHJhbnNmZXI7XG4gICAgICAgICAgICBpZiAoZGF0YVRyYW5zZmVyLmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFUcmFuc2Zlci5maWxlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGV2ZW50IGFuZCB0aGUgZWRnZSB4IGNvb3JkaW5hdGUgb2YgdGhlIGNvbnRhaW5pbmcgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0IG9mZnNldFgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50Lm9mZnNldFg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGV2ZW50IGFuZCB0aGUgZWRnZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGNvbnRhaW5pbmcgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0IG9mZnNldFkoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnQub2Zmc2V0WTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbW91c2UgeCBjb29yZGluYXRlIG9mIHRoZSBldmVudCByZWxhdGl2ZSB0byB0aGUgY2xpZW50IHdpbmRvdyB2aWV3XG4gICAgICovXG4gICAgZ2V0IGNsaWVudFgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50LmNsaWVudFg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG1vdXNlIHkgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnQgcmVsYXRpdmUgdG8gdGhlIGNsaWVudCB3aW5kb3cgdmlld1xuICAgICAqL1xuICAgIGdldCBjbGllbnRZKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudC5jbGllbnRZO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtTaW1wbGVFbGVtZW50fVxuICAgICAqL1xuICAgIGdldCB0YXJnZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50ICYmIHRoaXMuZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlndXJlZEZ1bmN0aW9uLmV4ZWN1dGUoXCJtYXBFbGVtZW50XCIsIHRoaXMuZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtTaW1wbGVFbGVtZW50fVxuICAgICAqL1xuICAgIGdldCByZWxhdGVkVGFyZ2V0KCkge1xuICAgICAgICBpZiAodGhpcy5ldmVudCAmJiB0aGlzLmV2ZW50LnJlbGF0ZWRUYXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBDb25maWd1cmVkRnVuY3Rpb24uZXhlY3V0ZShcIm1hcEVsZW1lbnRcIiwgdGhpcy5ldmVudC5yZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgICBnZXRSZWxhdGVkVGFyZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQucmVsYXRlZFRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIENvbmZpZ3VyZWRGdW5jdGlvbi5leGVjdXRlKFwibWFwRWxlbWVudFwiLCB0aGlzLmV2ZW50LnJlbGF0ZWRUYXJnZXQpLmdldEF0dHJpYnV0ZVZhbHVlKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldCB0YXJnZXRWYWx1ZSgpIHtcbiAgICAgICAgaWYodGhpcy50YXJnZXQpIHsgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IGtleUNvZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50LmtleUNvZGU7XG4gICAgfVxuXG4gICAgaXNLZXlDb2RlKGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnQua2V5Q29kZSA9PT0gY29kZTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG4vKipcbiAqIE9iamVjdCBGdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgaWYgdGhlIGZpbHRlciBmdW5jdGlvbiByZXR1cm5zIHRydWVcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50RmlsdGVyZWRNZXRob2QgZXh0ZW5kcyBNZXRob2Qge1xuXG4gICAgLyoqXG4gICAgICogQ29udHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWV0aG9kfSBtZXRob2QgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdGhlRmlsdGVyIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1ldGhvZCwgZmlsdGVyKXtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgIH1cblxuICAgIGNhbGwocGFyYW1zKXtcbiAgICAgICAgaWYodGhpcy5maWx0ZXIgJiYgdGhpcy5maWx0ZXIuY2FsbCh0aGlzLHBhcmFtcykpIHtcbiAgICAgICAgICAgIHRoaXMubWV0aG9kLmNhbGwocGFyYW1zKTtcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IE1ldGhvZCwgTWFwLCBMaXN0LCBMb2dnZXIgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuY29uc3QgTE9HID0gbmV3IExvZ2dlcihcIkV2ZW50TWFuYWdlclwiKTtcblxuLyoqXG4gKiBFdmVudE1hbmFnZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqIEB0eXBlIE1hcDxMaXN0PE1ldGhvZD4+ICovXG4gICAgICAgIHRoaXMubGlzdGVuZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lckZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRPYmplY3RcbiAgICAgKiBAcmV0dXJucyB7RXZlbnRNYW5hZ2VyfVxuICAgICAqL1xuICAgIGxpc3RlblRvKGV2ZW50VHlwZSwgbGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCwgZXhwbG9kZUFycmF5UGFyYW1zID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBNZXRob2QobGlzdGVuZXJGdW5jdGlvbiwgY29udGV4dE9iamVjdCwgZXhwbG9kZUFycmF5UGFyYW1zKTtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyTWFwLmNvbnRhaW5zKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJNYXAuc2V0KGV2ZW50VHlwZSwgbmV3IExpc3QoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lck1hcC5nZXQoZXZlbnRUeXBlKS5hZGQobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc291cmNlRXZlbnRUeXBlIFxuICAgICAqIEBwYXJhbSB7RXZlbnRNYW5hZ2VyfSBkZXN0aW5hdGlvbkV2ZW50TWFuYWdlciBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzdGluYXRpb25FdmVudFR5cGUgXG4gICAgICogQHBhcmFtIHthbnl9IGN1c3RvbVBhcmFtZXRlclxuICAgICAqIEByZXR1cm5zIHtFdmVudE1hbmFnZXJ9XG4gICAgICovXG4gICAgcm91dGUoc291cmNlRXZlbnRUeXBlLCBkZXN0aW5hdGlvbkV2ZW50TWFuYWdlciwgZGVzdGluYXRpb25FdmVudFR5cGUsIGN1c3RvbVBhcmFtZXRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyhzb3VyY2VFdmVudFR5cGUsIChkZWZhdWx0UGFyYW1ldGVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhbGxQYXJhbWV0ZXJzID0gQXJyYXkuaXNBcnJheShkZWZhdWx0UGFyYW1ldGVyKSA/IGRlZmF1bHRQYXJhbWV0ZXIgOiBbZGVmYXVsdFBhcmFtZXRlcl07XG4gICAgICAgICAgICBpZiAoY3VzdG9tUGFyYW1ldGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYWxsUGFyYW1ldGVycy5wdXNoKGN1c3RvbVBhcmFtZXRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVzdGluYXRpb25FdmVudE1hbmFnZXIudHJpZ2dlcihkZXN0aW5hdGlvbkV2ZW50VHlwZSwgYWxsUGFyYW1ldGVycyk7XG4gICAgICAgIH0sIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBcbiAgICAgKiBAcGFyYW0ge0FycmF5fGFueX0gcGFyYW1ldGVyIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAgICAgKi9cbiAgICBhc3luYyB0cmlnZ2VyKGV2ZW50VHlwZSwgcGFyYW1ldGVyKSB7XG4gICAgICAgIGlmICghZXZlbnRUeXBlKSB7XG4gICAgICAgICAgICBMT0cuZXJyb3IoXCJFdmVudCB0eXBlIGlzIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJNYXAuY29udGFpbnMoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZXN1bHRBcnJheSA9IFtdO1xuICAgICAgICB0aGlzLmxpc3RlbmVyTWFwLmdldChldmVudFR5cGUpLmZvckVhY2goKGxpc3RlbmVyLCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdEFycmF5LnB1c2gobGlzdGVuZXIuY2FsbChwYXJhbWV0ZXIpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdEFycmF5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEFycmF5WzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyZXN1bHRBcnJheSk7XG4gICAgfVxuXG59IiwiZXhwb3J0IGNsYXNzIE5hbWVkVHJhaWxSZWdpc3RyeSB7XG5cbiAgICBjb25zdHJ1Y3RvcihyZWdpc3RyeSkge1xuICAgICAgICAvKiogQHR5cGUge09iamVjdH0gKi9cbiAgICAgICAgdGhpcy5yZWdpc3RyeSA9IHJlZ2lzdHJ5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFzeW5jIGdldFRyYWlsKG5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMucmVnaXN0cnlbbmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5W25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxufSIsImltcG9ydCB7IExpc3QsIE1hcCwgTWFwVXRpbHMsIFN0cmluZ1V0aWxzIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Jhc2VFbGVtZW50XCI7XG5cbmV4cG9ydCBjbGFzcyBTdHlsZUFjY2Vzc29yIHtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QmFzZUVsZW1lbnR9XG4gICAgICogQHJldHVybiB7U3R5bGVBY2Nlc3Nvcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbShiYXNlRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gbmV3IFN0eWxlQWNjZXNzb3IoYmFzZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGJhc2VFbGVtZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGJhc2VFbGVtZW50KSB7XG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQgPSBiYXNlRWxlbWVudDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIsIFwiXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVOYW1lIFxuICAgICAqL1xuICAgIHJlbW92ZShzdHlsZU5hbWUpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlTWFwID0gdGhpcy5zdHlsZXNBc01hcCh0aGlzLmJhc2VFbGVtZW50LmdldEF0dHJpYnV0ZVZhbHVlKFwic3R5bGVcIikpO1xuICAgICAgICBpZiAoY3VycmVudFN0eWxlTWFwLmNvbnRhaW5zKHN0eWxlTmFtZSkpIHtcbiAgICAgICAgICAgIGN1cnJlbnRTdHlsZU1hcC5yZW1vdmUoc3R5bGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJhc2VFbGVtZW50LnNldEF0dHJpYnV0ZVZhbHVlKFwic3R5bGVcIiwgTWFwVXRpbHMudG9TdHJpbmcoY3VycmVudFN0eWxlTWFwLCBcIjpcIiwgXCI7XCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlTmFtZSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVWYWx1ZSBcbiAgICAgKi9cbiAgICBzZXQoc3R5bGVOYW1lLCBzdHlsZVZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdHlsZU1hcCA9IHRoaXMuc3R5bGVzQXNNYXAodGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcInN0eWxlXCIpKTtcbiAgICAgICAgY3VycmVudFN0eWxlTWFwLnNldChzdHlsZU5hbWUsIHN0eWxlVmFsdWUpO1xuICAgICAgICB0aGlzLmJhc2VFbGVtZW50LnNldEF0dHJpYnV0ZVZhbHVlKFwic3R5bGVcIiwgTWFwVXRpbHMudG9TdHJpbmcoY3VycmVudFN0eWxlTWFwLCBcIjpcIiwgXCI7XCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlTmFtZSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVWYWx1ZSBcbiAgICAgKi9cbiAgICBpcyhzdHlsZU5hbWUsIHN0eWxlVmFsdWUpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlTWFwID0gdGhpcy5zdHlsZXNBc01hcCh0aGlzLmJhc2VFbGVtZW50LmdldEF0dHJpYnV0ZVZhbHVlKFwic3R5bGVcIikpO1xuICAgICAgICByZXR1cm4gU3RyaW5nVXRpbHMubm9uTnVsbEVxdWFscyhjdXJyZW50U3R5bGVNYXAuZ2V0KHN0eWxlTmFtZSksIHN0eWxlVmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVOYW1lIFxuICAgICAqL1xuICAgIGV4aXN0cyhzdHlsZU5hbWUpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlTWFwID0gdGhpcy5zdHlsZXNBc01hcCh0aGlzLmJhc2VFbGVtZW50LmdldEF0dHJpYnV0ZVZhbHVlKFwic3R5bGVcIikpO1xuICAgICAgICByZXR1cm4gY3VycmVudFN0eWxlTWFwLmNvbnRhaW5zKHN0eWxlTmFtZSk7XG4gICAgfVxuXG4gICAgc3R5bGVzQXNNYXAoc3R5bGVzKSB7XG4gICAgICAgIGlmICghc3R5bGVzIHx8IHN0eWxlcy5pbmRleE9mKFwiOlwiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50U3R5bGVNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlUGFpckxpc3QgPSBuZXcgTGlzdChTdHJpbmdVdGlscy50b0FycmF5KHN0eWxlcywgXCI7XCIpKTtcbiAgICAgICAgY3VycmVudFN0eWxlUGFpckxpc3QuZm9yRWFjaCgodmFsdWUsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS5pbmRleE9mKFwiOlwiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNvbHZlZEtleSA9IHZhbHVlLnNwbGl0KFwiOlwiKVswXS50cmltKCk7XG4gICAgICAgICAgICBjb25zdCByZXNvbHZlZFZhbHVlID0gdmFsdWUuc3BsaXQoXCI6XCIpWzFdLnRyaW0oKTtcbiAgICAgICAgICAgIGN1cnJlbnRTdHlsZU1hcC5zZXQocmVzb2x2ZWRLZXksIHJlc29sdmVkVmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gY3VycmVudFN0eWxlTWFwO1xuICAgIH1cblxufSIsImltcG9ydCB7IEFycmF5VXRpbHMsIExpc3QsIFN0cmluZ1V0aWxzIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBCYXNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L2Jhc2VFbGVtZW50XCI7XG5cbmV4cG9ydCBjbGFzcyBTdHlsZVNlbGVjdG9yQWNjZXNzb3Ige1xuICAgIFxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCYXNlRWxlbWVudH1cbiAgICAgKiBAcmV0dXJuIHtTdHlsZVNlbGVjdG9yQWNjZXNzb3J9XG4gICAgICovXG4gICAgc3RhdGljIGZyb20oYmFzZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHlsZVNlbGVjdG9yQWNjZXNzb3IoYmFzZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7QmFzZUVsZW1lbnR9IGJhc2VFbGVtZW50IFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGJhc2VFbGVtZW50KSB7XG4gICAgICAgIC8qKiBAdHlwZSB7QmFzZUVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQgPSBiYXNlRWxlbWVudDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIsIFwiXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzQ2xhc3MgXG4gICAgICovXG4gICAgdG9nZ2xlKGNzc0NsYXNzKSB7XG4gICAgICAgIGxldCBjdXJyZW50Q2xhc3MgPSB0aGlzLmJhc2VFbGVtZW50LmdldEF0dHJpYnV0ZVZhbHVlKFwiY2xhc3NcIik7XG4gICAgICAgIGxldCBjdXJyZW50Q2xhc3NBcnJheSA9IFN0cmluZ1V0aWxzLnRvQXJyYXkoY3VycmVudENsYXNzLCBcIiBcIik7XG4gICAgICAgIGxldCBjdXJyZW50Q2xhc3NMaXN0ID0gbmV3IExpc3QoY3VycmVudENsYXNzQXJyYXkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGN1cnJlbnRDbGFzc0xpc3QuY29udGFpbnMoY3NzQ2xhc3MpKSB7XG4gICAgICAgICAgICBjdXJyZW50Q2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50Q2xhc3NMaXN0LmFkZChjc3NDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYmFzZUVsZW1lbnQuc2V0QXR0cmlidXRlVmFsdWUoXCJjbGFzc1wiLCBBcnJheVV0aWxzLnRvU3RyaW5nKGN1cnJlbnRDbGFzc0xpc3QuZ2V0QXJyYXkoKSwgXCIgXCIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIFxuICAgICAqL1xuICAgIGVuYWJsZShjc3NDbGFzcykge1xuICAgICAgICBsZXQgY3VycmVudENsYXNzID0gdGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzQXJyYXkgPSBTdHJpbmdVdGlscy50b0FycmF5KGN1cnJlbnRDbGFzcywgXCIgXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzTGlzdCA9IG5ldyBMaXN0KGN1cnJlbnRDbGFzc0FycmF5KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghY3VycmVudENsYXNzTGlzdC5jb250YWlucyhjc3NDbGFzcykpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIsIEFycmF5VXRpbHMudG9TdHJpbmcoY3VycmVudENsYXNzTGlzdC5nZXRBcnJheSgpLCBcIiBcIikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzQ2xhc3MgXG4gICAgICovXG4gICAgZGlzYWJsZShjc3NDbGFzcykge1xuICAgICAgICBsZXQgY3VycmVudENsYXNzID0gdGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzQXJyYXkgPSBTdHJpbmdVdGlscy50b0FycmF5KGN1cnJlbnRDbGFzcywgXCIgXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzTGlzdCA9IG5ldyBMaXN0KGN1cnJlbnRDbGFzc0FycmF5KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjdXJyZW50Q2xhc3NMaXN0LmNvbnRhaW5zKGNzc0NsYXNzKSkge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iYXNlRWxlbWVudC5zZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIsIEFycmF5VXRpbHMudG9TdHJpbmcoY3VycmVudENsYXNzTGlzdC5nZXRBcnJheSgpLCBcIiBcIikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzQ2xhc3NSZW1vdmFsUHJlZml4IFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjc3NDbGFzc1xuICAgICAqL1xuICAgIHJlcGxhY2UoY3NzQ2xhc3NSZW1vdmFsUHJlZml4LCBjc3NDbGFzcykge1xuICAgICAgICBsZXQgY3VycmVudENsYXNzID0gdGhpcy5iYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGVWYWx1ZShcImNsYXNzXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzQXJyYXkgPSBTdHJpbmdVdGlscy50b0FycmF5KGN1cnJlbnRDbGFzcywgXCIgXCIpO1xuICAgICAgICBsZXQgY3VycmVudENsYXNzTGlzdCA9IG5ldyBMaXN0KGN1cnJlbnRDbGFzc0FycmF5KTtcbiAgICAgICAgbGV0IHRvUmVtb3ZlQXJyYXkgPSBbXTtcblxuICAgICAgICBpZiAoIVN0cmluZ1V0aWxzLmlzQmxhbmsoY3NzQ2xhc3NSZW1vdmFsUHJlZml4KSkge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5zdGFydHNXaXRoKGNzc0NsYXNzUmVtb3ZhbFByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmVBcnJheS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvUmVtb3ZlQXJyYXkuZm9yRWFjaCgodG9SZW1vdmVWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTGlzdC5yZW1vdmUodG9SZW1vdmVWYWx1ZSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY3VycmVudENsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpO1xuICAgICAgICB0aGlzLmJhc2VFbGVtZW50LnNldEF0dHJpYnV0ZVZhbHVlKFwiY2xhc3NcIiwgQXJyYXlVdGlscy50b1N0cmluZyhjdXJyZW50Q2xhc3NMaXN0LmdldEFycmF5KCksIFwiIFwiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIFxuXG59IiwiaW1wb3J0IHsgU3R5bGVNZWRpYSB9IGZyb20gXCIuL3N0eWxlTWVkaWEuanNcIjtcbmltcG9ydCB7IFN0eWxlU2VsZWN0b3IgfSBmcm9tIFwiLi9zdHlsZVNlbGVjdG9yLmpzXCI7XG5pbXBvcnQgeyBTdHlsZXNoZWV0QnVpbGRlciB9IGZyb20gXCIuL3N0eWxlc2hlZXRCdWlsZGVyLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBDc3MzU3R5bGVzaGVldEJ1aWxkZXIge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKHN0eWxlc2hlZXRCdWlsZGVyID0gU3R5bGVzaGVldEJ1aWxkZXIuY3JlYXRlKCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3MzU3R5bGVzaGVldEJ1aWxkZXIoc3R5bGVzaGVldEJ1aWxkZXIpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHN0eWxlc2hlZXRCdWlsZGVyID0gU3R5bGVzaGVldEJ1aWxkZXIuY3JlYXRlKCkpIHtcblxuICAgICAgICAvKiogQHR5cGUge1N0eWxlc2hlZXRCdWlsZGVyfSAqL1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyID0gc3R5bGVzaGVldEJ1aWxkZXI7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBzZWxlY3RvcihzZWxlY3Rvcikge1xuICAgICAgICBpZiAodGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jb250ZXh0IGluc3RhbmNlb2YgU3R5bGVTZWxlY3Rvcikge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLm9wZW4oKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1pbldpZHRoIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtYXhXaWR0aCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1lZGlhKG1pbldpZHRoLCBtYXhXaWR0aCwgcG9pbnRlciA9IG51bGwsIGhvdmVyID0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jb250ZXh0IGluc3RhbmNlb2YgU3R5bGVTZWxlY3Rvcikge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLmNvbnRleHQgaW5zdGFuY2VvZiBTdHlsZU1lZGlhKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBtZWRpYVF1ZXJ5ID0gXCJAbWVkaWEgXCI7XG4gICAgICAgIGxldCBoYXNDb25kaXRpb24gPSBmYWxzZTtcblxuICAgICAgICBpZiAobWluV2lkdGgpIHtcbiAgICAgICAgICAgIG1lZGlhUXVlcnkgKz0gYChtaW4td2lkdGg6ICR7bWluV2lkdGh9KWA7XG4gICAgICAgICAgICBoYXNDb25kaXRpb24gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1heFdpZHRoKSB7XG4gICAgICAgICAgICBpZiAoaGFzQ29uZGl0aW9uKSB7IG1lZGlhUXVlcnkgKz0gXCIgYW5kIFwiOyB9XG4gICAgICAgICAgICBtZWRpYVF1ZXJ5ICs9IGAobWF4LXdpZHRoOiAke21heFdpZHRofSlgO1xuICAgICAgICAgICAgaGFzQ29uZGl0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb2ludGVyKSB7XG4gICAgICAgICAgICBpZiAoaGFzQ29uZGl0aW9uKSB7IG1lZGlhUXVlcnkgKz0gXCIgYW5kIFwiOyB9XG4gICAgICAgICAgICBtZWRpYVF1ZXJ5ICs9IGAocG9pbnRlcjogJHtwb2ludGVyfSlgO1xuICAgICAgICAgICAgaGFzQ29uZGl0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChob3Zlcikge1xuICAgICAgICAgICAgaWYgKGhhc0NvbmRpdGlvbikgeyBtZWRpYVF1ZXJ5ICs9IFwiIGFuZCBcIjsgfVxuICAgICAgICAgICAgbWVkaWFRdWVyeSArPSBgKGhvdmVyOiAke2hvdmVyfSlgO1xuICAgICAgICAgICAgaGFzQ29uZGl0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIubWVkaWEobWVkaWFRdWVyeSk7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIub3BlbigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3Vyc29yIEUuZy4gXCJwb2ludGVyXCIsIFwiZGVmYXVsdFwiLCBcInRleHRcIiwgXCJtb3ZlXCIsIFwibm90LWFsbG93ZWRcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgY3Vyc29yKGN1cnNvcikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiY3Vyc29yXCIsIGN1cnNvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZW50IEUuZy4gXCInJ1wiLCBcIidIZWxsbydcIiwgXCJ1cmwoaW1hZ2UucG5nKVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi8gIFxuICAgIGNvbnRlbnQoY29udGVudCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiY29udGVudFwiLCBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHdpZHRoIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2lkdGgod2lkdGgpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIndpZHRoXCIsIHdpZHRoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1pbldpZHRoIFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbWluV2lkdGgobWluV2lkdGgpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1pbi13aWR0aFwiLCBtaW5XaWR0aCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtYXhXaWR0aCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG1heFdpZHRoKG1heFdpZHRoKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtYXgtd2lkdGhcIiwgbWF4V2lkdGgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaGVpZ2h0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgaGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtaW5IZWlnaHQgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBtaW5IZWlnaHQobWluSGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJtaW4taGVpZ2h0XCIsIG1pbkhlaWdodCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWF4SGVpZ2h0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbWF4SGVpZ2h0KG1heEhlaWdodCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwibWF4LWhlaWdodFwiLCBtYXhIZWlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gekluZGV4IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgekluZGV4KHpJbmRleCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiei1pbmRleFwiLCB6SW5kZXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbGluZUhlaWdodFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG5cbiAgICBsaW5lSGVpZ2h0KGxpbmVIZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImxpbmUtaGVpZ2h0XCIsIGxpbmVIZWlnaHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZm9udFNpemVcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGZvbnRTaXplKGZvbnRTaXplKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJmb250LXNpemVcIiwgZm9udFNpemUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZm9udFdlaWdodFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZm9udFdlaWdodChmb250V2VpZ2h0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJmb250LXdlaWdodFwiLCBmb250V2VpZ2h0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZvbnRGYW1pbHlcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGZvbnRGYW1pbHkoZm9udEZhbWlseSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZm9udC1mYW1pbHlcIiwgZm9udEZhbWlseSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgY29sb3IoY29sb3IpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImNvbG9yXCIsIGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHRBbGlnbiBFLmcuIFwibGVmdFwiLCBcInJpZ2h0XCIsIFwiY2VudGVyXCIsIFwianVzdGlmeVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICB0ZXh0QWxpZ24odGV4dEFsaWduKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJ0ZXh0LWFsaWduXCIsIHRleHRBbGlnbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZlcnRpY2FsQWxpZ24odmVydGljYWxBbGlnbikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidmVydGljYWwtYWxpZ25cIiwgdmVydGljYWxBbGlnbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVzZXJTZWxlY3QodXNlclNlbGVjdCkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidXNlci1zZWxlY3RcIiwgdXNlclNlbGVjdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm93IFxuICAgICAqIEdyb3dzIHJlbGF0aXZlIHRvIHRoZSBvdGhlciBmbGV4IGl0ZW1zIGluIHRoZSBjb250YWluZXIgd2hlbiB0aGVyZSBpcyBleHRyYSBzcGFjZS5cbiAgICAgKiBFLmcuIGdyb3cgb2YgMSB2cyBncm93IG9mIDIsIHRoZSBzZWNvbmQgaXRlbSB3aWxsIGdyb3cgdHdpY2UgYXMgbXVjaC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2hyaW5rIFxuICAgICAqIFNocmlua3MgcmVsYXRpdmUgdG8gdGhlIG90aGVyIGZsZXggaXRlbXMgaW4gdGhlIGNvbnRhaW5lciB3aGVuIG5vdCBlbm91Z2ggc3BhY2UuXG4gICAgICogRS5nLiBzaHJpbmsgb2YgMSB2cyBzaHJpbmsgb2YgMiwgdGhlIHNlY29uZCBpdGVtIHdpbGwgc2hyaW5rIHR3aWNlIGFzIG11Y2guXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJhc2lzIFxuICAgICAqIEluaXRpYWwgbWFpbiBzaXplLiBFLmcgXCIxMDBweFwiLCBcIjIwJVwiLCBcImF1dG9cIi4gRGVmYXVsdCB2YWx1ZSBpcyBcImF1dG9cIixcbiAgICAgKiBzaXplZCBhY2NvcmRpbmcgdG8gaXRzIGNvbnRlbnQuIElmIFwiMFwiLCBzaXplZCBiYXNlZCBvbiBncm93IGFuZCBzaHJpbmsuXG4gICAgICogXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBmbGV4KGdyb3csIHNocmluaywgYmFzaXMpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBgJHtncm93fSAke3Nocmlua30gJHtiYXNpc31gO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZmxleFwiLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb24gRS5nIFwicm93XCIsIFwiY29sdW1uXCIsIFwicm93LXJldmVyc2VcIiwgXCJjb2x1bW4tcmV2ZXJzZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBmbGV4RGlyZWN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiZmxleC1kaXJlY3Rpb25cIiwgZGlyZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZsb3cgRS5nLiBcInJvdyBub3dyYXBcIiwgXCJjb2x1bW4gd3JhcFwiLCBcInJvdy1yZXZlcnNlIHdyYXAtcmV2ZXJzZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBmbGV4RmxvdyhmbG93KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJmbGV4LWZsb3dcIiwgZmxvdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdhcChnYXApIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImdhcFwiLCBnYXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sdW1uc1xuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1ucyhjb2x1bW5zKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJncmlkLXRlbXBsYXRlLWNvbHVtbnNcIiwgY29sdW1ucyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb3dzXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBncmlkVGVtcGxhdGVSb3dzKHJvd3MpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImdyaWQtdGVtcGxhdGUtcm93c1wiLCByb3dzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbHVtblxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZ3JpZENvbHVtbihjb2x1bW4pIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImdyaWQtY29sdW1uXCIsIGNvbHVtbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb3dcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGdyaWRSb3cocm93KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJncmlkLXJvd1wiLCByb3cpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWxpZ25JdGVtcyBFLmcuIFwic3RyZXRjaFwiLCBcImNlbnRlclwiLCBcImZsZXgtc3RhcnRcIiwgXCJmbGV4LWVuZFwiLCBcImJhc2VsaW5lXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGFsaWduSXRlbXMoYWxpZ25JdGVtcykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYWxpZ24taXRlbXNcIiwgYWxpZ25JdGVtcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiBFLmcuIFwic3RhdGljXCIsIFwicmVsYXRpdmVcIiwgXCJhYnNvbHV0ZVwiLCBcImZpeGVkXCIsIFwic3RpY2t5XCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJwb3NpdGlvblwiLCBwb3NpdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBib3R0b20gXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBib3R0b20oYm90dG9tKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJib3R0b21cIiwgYm90dG9tKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByaWdodCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHJpZ2h0KHJpZ2h0KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJyaWdodFwiLCByaWdodCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0b3AgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICB0b3AodG9wKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJ0b3BcIiwgdG9wKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGxlZnQgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBsZWZ0KGxlZnQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImxlZnRcIiwgbGVmdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXNwbGF5IEUuZy4gXCJibG9ja1wiLCBcImlubGluZS1ibG9ja1wiLCBcImZsZXhcIiwgXCJpbmxpbmUtZmxleFwiLCBcImdyaWRcIiwgXCJpbmxpbmUtZ3JpZFwiLCBcIm5vbmVcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZGlzcGxheShkaXNwbGF5KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJkaXNwbGF5XCIsIGRpc3BsYXkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmlzaWJpbGl0eSBFLmcuIFwidmlzaWJsZVwiLCBcImhpZGRlblwiLCBcImNvbGxhcHNlXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHZpc2liaWxpdHkodmlzaWJpbGl0eSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidmlzaWJpbGl0eVwiLCB2aXNpYmlsaXR5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRvcCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmlnaHQgXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJvdHRvbSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbGVmdCBcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHBhZGRpbmcodG9wLCByaWdodCwgYm90dG9tLCBsZWZ0KSB7XG4gICAgICAgIGlmICh0b3AgJiYgcmlnaHQgJiYgYm90dG9tICYmIGxlZnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYCR7dG9wfSAke3JpZ2h0fSAke2JvdHRvbX0gJHtsZWZ0fWA7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicGFkZGluZ1wiLCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9wKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicGFkZGluZy10b3BcIiwgdG9wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJwYWRkaW5nLXJpZ2h0XCIsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm90dG9tKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicGFkZGluZy1ib3R0b21cIiwgYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVmdCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcInBhZGRpbmctbGVmdFwiLCBsZWZ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdG9wIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByaWdodCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYm90dG9tIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBsZWZ0IFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgbWFyZ2luKHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xuICAgICAgICBpZiAodG9wICYmIHJpZ2h0ICYmIGJvdHRvbSAmJiBsZWZ0KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGAke3RvcH0gJHtyaWdodH0gJHtib3R0b219ICR7bGVmdH1gO1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1hcmdpblwiLCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9wKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwibWFyZ2luLXRvcFwiLCB0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyaWdodCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1hcmdpbi1yaWdodFwiLCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvdHRvbSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1hcmdpbi1ib3R0b21cIiwgYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVmdCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm1hcmdpbi1sZWZ0XCIsIGxlZnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB3aWR0aFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvclxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYm9yZGVyKHdpZHRoLCBzdHlsZSwgY29sb3IpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBgJHt3aWR0aH0gJHtzdHlsZX0gJHtjb2xvcn1gO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYm9yZGVyXCIsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJhZGl1c1xuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYm9yZGVyUmFkaXVzKHJhZGl1cykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYm9yZGVyLXJhZGl1c1wiLCByYWRpdXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kQ29sb3IoY29sb3IpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgY29sb3IpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZFxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZChiYWNrZ3JvdW5kKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kXCIsIGJhY2tncm91bmQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFja2dyb3VuZFBvc2l0aW9uXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kUG9zaXRpb24oYmFja2dyb3VuZFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLXBvc2l0aW9uXCIsIGJhY2tncm91bmRQb3NpdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBiYWNrZ3JvdW5kU2l6ZVxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZFNpemUoYmFja2dyb3VuZFNpemUpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJhY2tncm91bmQtc2l6ZVwiLCBiYWNrZ3JvdW5kU2l6ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBiYWNrZ3JvdW5kQ2xpcCBFLmcuIFwiYm9yZGVyLWJveFwiLCBcInBhZGRpbmctYm94XCIsIFwiY29udGVudC1ib3hcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYmFja2dyb3VuZENsaXAoYmFja2dyb3VuZENsaXApIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJhY2tncm91bmQtY2xpcFwiLCBiYWNrZ3JvdW5kQ2xpcCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBiYWNrZ3JvdW5kSW1hZ2UgRS5nLiBcInVybChpbWFnZS5wbmcpXCIsIFwibm9uZVwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kSW1hZ2UoYmFja2dyb3VuZEltYWdlKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIGJhY2tncm91bmRJbWFnZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBiYWNrZ3JvdW5kUmVwZWF0IEUuZy4gXCJyZXBlYXRcIiwgXCJuby1yZXBlYXRcIiwgXCJyZXBlYXQteFwiLCBcInJlcGVhdC15XCIsIFwic3BhY2VcIiwgXCJyb3VuZFwiXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kUmVwZWF0KGJhY2tncm91bmRSZXBlYXQpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJhY2tncm91bmQtcmVwZWF0XCIsIGJhY2tncm91bmRSZXBlYXQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXBwZWFyYW5jZSBFLmcuIFwibm9uZVwiLCBcImF1dG9cIiwgXCJidXR0b25cIiwgXCJ0ZXh0ZmllbGRcIiwgXCJtZW51bGlzdFwiLCBcInNlYXJjaGZpZWxkXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGFwcGVhcmFuY2UoYXBwZWFyYW5jZSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYXBwZWFyYW5jZVwiLCBhcHBlYXJhbmNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wYWNpdHkgRS5nLiBcIjBcIiwgXCIwLjVcIiwgXCIxXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG9wYWNpdHkob3BhY2l0eSkge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwib3BhY2l0eVwiLCBvcGFjaXR5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGp1c3RpZnlDb250ZW50IEUuZy4gXCJmbGV4LXN0YXJ0XCIsIFwiZmxleC1lbmRcIiwgXCJjZW50ZXJcIiwgXCJzcGFjZS1iZXR3ZWVuXCIsIFwic3BhY2UtYXJvdW5kXCIsIFwic3BhY2UtZXZlbmx5XCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGp1c3RpZnlDb250ZW50KGp1c3RpZnlDb250ZW50KSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJqdXN0aWZ5LWNvbnRlbnRcIiwganVzdGlmeUNvbnRlbnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWxpZ25TZWxmIEUuZy4gXCJhdXRvXCIsIFwic3RyZXRjaFwiLCBcImNlbnRlclwiLCBcImZsZXgtc3RhcnRcIiwgXCJmbGV4LWVuZFwiLCBcImJhc2VsaW5lXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGFsaWduU2VsZihhbGlnblNlbGYpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImFsaWduLXNlbGZcIiwgYWxpZ25TZWxmKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG92ZXJmbG93WCBFLmcuIFwidmlzaWJsZVwiLCBcImhpZGRlblwiLCBcInNjcm9sbFwiLCBcImF1dG9cIlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvdmVyZmxvd1kgRS5nLiBcInZpc2libGVcIiwgXCJoaWRkZW5cIiwgXCJzY3JvbGxcIiwgXCJhdXRvXCJcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIG92ZXJmbG93KG92ZXJmbG93WCwgb3ZlcmZsb3dZKSB7XG4gICAgICAgIGlmIChvdmVyZmxvd1gpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJvdmVyZmxvdy14XCIsIG92ZXJmbG93WCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG92ZXJmbG93WSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcIm92ZXJmbG93LXlcIiwgb3ZlcmZsb3dZKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYm94U2l6aW5nIEUuZy4gXCJjb250ZW50LWJveFwiLCBcImJvcmRlci1ib3hcIlxuICAgICAqIEByZXR1cm5zIHtDc3MzU3R5bGVzaGVldEJ1aWxkZXJ9XG4gICAgICovXG4gICAgYm94U2l6aW5nKGJveFNpemluZykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYm94LXNpemluZ1wiLCBib3hTaXppbmcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb2Zmc2V0WCBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb2Zmc2V0WSBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmx1clJhZGl1c1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcHJlYWRSYWRpdXNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sb3JcbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIGJveFNoYWRvdyhvZmZzZXRYLCBvZmZzZXRZLCBibHVyUmFkaXVzLCBzcHJlYWRSYWRpdXMsIGNvbG9yKSB7XG4gICAgICAgIGlmIChibHVyUmFkaXVzICYmIHNwcmVhZFJhZGl1cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBgJHtvZmZzZXRYfSAke29mZnNldFl9ICR7Ymx1clJhZGl1c30gJHtzcHJlYWRSYWRpdXN9ICR7Y29sb3J9YDtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJib3gtc2hhZG93XCIsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChibHVyUmFkaXVzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGAke29mZnNldFh9ICR7b2Zmc2V0WX0gJHtibHVyUmFkaXVzfSAke2NvbG9yfWA7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwiYm94LXNoYWRvd1wiLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGAke29mZnNldFh9ICR7b2Zmc2V0WX0gJHtjb2xvcn1gO1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5zdHlsZShcImJveC1zaGFkb3dcIiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7Li4uU3RyaW5nW119IHRyYW5zaXRpb25zIEUuZy4gW1widHJhbnNmb3JtXCIsIFwiLjNzXCIsIG51bGwsIFwiZWFzZS1pbi1vdXRcIl0sIFtcIm9wYWNpdHlcIiwgXCIuMnNcIl1cbiAgICAgKiBAcmV0dXJucyB7Q3NzM1N0eWxlc2hlZXRCdWlsZGVyfVxuICAgICAqL1xuICAgIHRyYW5zaXRpb24oLi4udHJhbnNpdGlvbnMpIHtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvblZhbHVlcyA9IHRyYW5zaXRpb25zLm1hcCh0cmFuc2l0aW9uID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtwcm9wZXJ0eSwgZHVyYXRpb24sIGRlbGF5LCB0aW1pbmdGdW5jdGlvbl0gPSB0cmFuc2l0aW9uO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gYCR7cHJvcGVydHl9ICR7ZHVyYXRpb259YDtcbiAgICAgICAgICAgIGlmICh0aW1pbmdGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIHZhbHVlICs9IGAgJHt0aW1pbmdGdW5jdGlvbn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gYCAke2RlbGF5fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidHJhbnNpdGlvblwiLCB0cmFuc2l0aW9uVmFsdWVzLmpvaW4oXCIsIFwiKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0cmFuc2Zvcm0gXG4gICAgICogQHJldHVybnMge0NzczNTdHlsZXNoZWV0QnVpbGRlcn1cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNmb3JtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtT3JpZ2luKHRyYW5zZm9ybU9yaWdpbikge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCB0cmFuc2Zvcm1PcmlnaW4pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBidWlsZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuY29udGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5jbG9zZSgpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zdHlsZXNoZWV0QnVpbGRlci5idWlsZCgpO1xuICAgIH1cblxuICAgIHJvd3Mocm93cykge1xuICAgICAgICB0aGlzLnN0eWxlc2hlZXRCdWlsZGVyLnN0eWxlKFwicm93c1wiLCByb3dzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29sdW1ucyhjb2x1bW5zKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzaGVldEJ1aWxkZXIuc3R5bGUoXCJjb2x1bW5zXCIsIGNvbHVtbnMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59IiwiaW1wb3J0IHsgTWFwLCBMb2dnZXIsIFN0cmluZ1V0aWxzLCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IENsaWVudCB9IGZyb20gXCIuLi9jbGllbnQvY2xpZW50LmpzXCI7XG5pbXBvcnQgeyBDb250YWluZXJEb3dubG9hZCwgQ29udGFpbmVySHR0cFJlc3BvbnNlLCBDb250YWluZXJVcGxvYWREYXRhIH0gZnJvbSBcImNvbnRhaW5lcmJyaWRnZV92MVwiO1xuXG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJIdHRwQ2FsbEJ1aWxkZXJcIik7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBDYWxsQnVpbGRlciB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHVybCkge1xuXG4gICAgICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgICAgICB0aGlzLnVybCA9IHVybDtcblxuICAgICAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5hdXRob3JpemF0aW9uID0gbnVsbDtcblxuICAgICAgICAvKiogQHR5cGUge01hcH0gKi9cbiAgICAgICAgdGhpcy5zdWNjZXNzTWFwcGluZ01hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge01hcH0gKi9cbiAgICAgICAgdGhpcy5mYWlsTWFwcGluZ01hcCA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvKiogQHR5cGUge2Z1bmN0aW9ufSAqL1xuICAgICAgICB0aGlzLmVycm9yTWFwcGluZ0Z1bmN0aW9uID0gKGVycm9yKSA9PiB7IHJldHVybiBlcnJvcjsgfTtcblxuICAgICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAgICAgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlID0gNDAwMDtcblxuICAgICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAgICAgdGhpcy5yZXNwb25zZVRpbWVvdXRWYWx1ZSA9IDQwMDA7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtNZXRob2R9ICovXG4gICAgICAgIHRoaXMucHJvZ3Jlc3NDYWxsYmFja01ldGhvZCA9IG51bGw7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICAgICAgICB0aGlzLmRvd25sb2FkUmVzcG9uc2UgPSBmYWxzZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgXG4gICAgICogQHJldHVybnMge0h0dHBDYWxsQnVpbGRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgbmV3SW5zdGFuY2UodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgSHR0cENhbGxCdWlsZGVyKHVybCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNvZGUgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWFwcGVyRnVuY3Rpb24gbWFwcGVyIGZ1bmN0aW9uIHRvIHBhc3MgdGhlIHJlc3VsdCBvYmplY3QgdG9cbiAgICAgKiBAcmV0dXJuIHtIdHRwQ2FsbEJ1aWxkZXJ9XG4gICAgICovXG4gICAgc3VjY2Vzc01hcHBpbmcoY29kZSwgbWFwcGVyRnVuY3Rpb24gPSAoKSA9PiB7IHJldHVybiBudWxsOyB9KSB7XG4gICAgICAgIHRoaXMuc3VjY2Vzc01hcHBpbmdNYXAuc2V0KGNvZGUsIG1hcHBlckZ1bmN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge0h0dHBDYWxsQnVpbGRlcjxDb250YWluZXJEb3dubG9hZD59XG4gICAgICovXG4gICAgYXNEb3dubG9hZCgpIHtcbiAgICAgICAgdGhpcy5kb3dubG9hZFJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNvZGUgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWFwcGVyRnVuY3Rpb24gbWFwcGVyIGZ1bmN0aW9uIHRvIHBhc3MgdGhlIHJlc3VsdCBvYmplY3QgdG9cbiAgICAgKiBAcmV0dXJuIHtIdHRwQ2FsbEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZmFpbE1hcHBpbmcoY29kZSwgbWFwcGVyRnVuY3Rpb24gPSAoKSA9PiB7IHJldHVybiBudWxsOyB9KSB7XG4gICAgICAgIHRoaXMuZmFpbE1hcHBpbmdNYXAuc2V0KGNvZGUsIG1hcHBlckZ1bmN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWFwcGVyRnVuY3Rpb24gbWFwcGVyIGZ1bmN0aW9uIHRvIHBhc3MgdGhlIHJlc3VsdCBvYmplY3QgdG9cbiAgICAgKiBAcmV0dXJuIHtIdHRwQ2FsbEJ1aWxkZXJ9XG4gICAgICovXG4gICAgZXJyb3JNYXBwaW5nKG1hcHBlckZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuZXJyb3JNYXBwaW5nRnVuY3Rpb24gPSBtYXBwZXJGdW5jdGlvbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGF1dGhvcml6YXRpb24gXG4gICAgICogQHJldHVybiB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIGF1dGhvcml6YXRpb25IZWFkZXIoYXV0aG9yaXphdGlvbikge1xuICAgICAgICBpZiAoIVN0cmluZ1V0aWxzLmlzQmxhbmsoYXV0aG9yaXphdGlvbikpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aG9yaXphdGlvbiA9IFwiQmVhcmVyIFwiICsgYXV0aG9yaXphdGlvbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge01ldGhvZH0gcHJvZ3Jlc3NDYWxsYmFja01ldGhvZCBcbiAgICAgKiBAcmV0dXJucyB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIHByb2dyZXNzQ2FsbGJhY2socHJvZ3Jlc3NDYWxsYmFja01ldGhvZCkge1xuICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tNZXRob2QgPSBwcm9ncmVzc0NhbGxiYWNrTWV0aG9kO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29ubmVjdGlvblRpbWVvdXRWYWx1ZSBcbiAgICAgKiBAcmV0dXJucyB7SHR0cENhbGxCdWlsZGVyfVxuICAgICAqL1xuICAgIGNvbm5lY3Rpb25UaW1lb3V0KGNvbm5lY3Rpb25UaW1lb3V0VmFsdWUpIHtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlID0gY29ubmVjdGlvblRpbWVvdXRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJlc3BvbnNlVGltZW91dFZhbHVlIFxuICAgICAqIEByZXR1cm5zIHtIdHRwQ2FsbEJ1aWxkZXJ9XG4gICAgICovXG4gICAgcmVzcG9uc2VUaW1lb3V0KHJlc3BvbnNlVGltZW91dFZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2VUaW1lb3V0VmFsdWUgPSByZXNwb25zZVRpbWVvdXRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICovXG4gICAgYXN5bmMgZ2V0KCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IENsaWVudC5nZXQodGhpcy51cmwsIHRoaXMuYXV0aG9yaXphdGlvbiwgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlLCB0aGlzLmRvd25sb2FkUmVzcG9uc2UpO1xuICAgICAgICByZXR1cm4gdGhpcy5hc1R5cGVNYXBwZWRQcm9taXNlKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBwYXlsb2FkXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICovXG4gICAgYXN5bmMgcG9zdChwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LnBvc3QodGhpcy51cmwsIHBheWxvYWQsIHRoaXMuYXV0aG9yaXphdGlvbiwgdGhpcy5wcm9ncmVzc0NhbGxiYWNrTWV0aG9kLCB0aGlzLmNvbm5lY3Rpb25UaW1lb3V0VmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5hc1R5cGVNYXBwZWRQcm9taXNlKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBwYXlsb2FkXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICovXG4gICAgYXN5bmMgcHV0KHBheWxvYWQpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQucHV0KHRoaXMudXJsLCBwYXlsb2FkLCB0aGlzLmF1dGhvcml6YXRpb24sIHRoaXMucHJvZ3Jlc3NDYWxsYmFja01ldGhvZCwgdGhpcy5jb25uZWN0aW9uVGltZW91dFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNUeXBlTWFwcGVkUHJvbWlzZShyZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R8Q29udGFpbmVyVXBsb2FkRGF0YX0gcGF5bG9hZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqL1xuICAgIGFzeW5jIHBhdGNoKHBheWxvYWQpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDbGllbnQucGF0Y2godGhpcy51cmwsIHBheWxvYWQsIHRoaXMuYXV0aG9yaXphdGlvbiwgdGhpcy5wcm9ncmVzc0NhbGxiYWNrTWV0aG9kLCB0aGlzLmNvbm5lY3Rpb25UaW1lb3V0VmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5hc1R5cGVNYXBwZWRQcm9taXNlKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdHxDb250YWluZXJVcGxvYWREYXRhfSBwYXlsb2FkXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICovXG4gICAgYXN5bmMgZGVsZXRlKHBheWxvYWQgPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQ2xpZW50LmRlbGV0ZSh0aGlzLnVybCwgcGF5bG9hZCwgdGhpcy5hdXRob3JpemF0aW9uLCB0aGlzLnByb2dyZXNzQ2FsbGJhY2tNZXRob2QsIHRoaXMuY29ubmVjdGlvblRpbWVvdXRWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFzVHlwZU1hcHBlZFByb21pc2UocmVzcG9uc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7UHJvbWlzZTxDb250YWluZXJIdHRwUmVzcG9uc2V9IGZldGNoUHJvbWlzZSBcbiAgICAgKi9cbiAgICBhc3luYyBhc1R5cGVNYXBwZWRQcm9taXNlKGZldGNoUHJvbWlzZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmV0Y2hSZXNwb25zZSA9IGF3YWl0IGZldGNoUHJvbWlzZTtcbiAgICAgICAgICAgIGlmIChmZXRjaFJlc3BvbnNlIGluc3RhbmNlb2YgQ29udGFpbmVyRG93bmxvYWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmV0Y2hSZXNwb25zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmhhbmRsZUZldGNoUmVzcG9uc2UoZmV0Y2hSZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIEFQSSBkaWQgbm90IGV4ZWN1dGVcbiAgICAgICAgICAgIHRocm93IHRoaXMuZXJyb3JNYXBwaW5nRnVuY3Rpb24oZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtDb250YWluZXJIdHRwUmVzcG9uc2V9IGZldGNoUmVzcG9uc2UgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZSBcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWplY3QgXG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlRmV0Y2hSZXNwb25zZShmZXRjaFJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NSZXNwb25zZU1hcHBlciA9IHRoaXMuc3VjY2Vzc01hcHBpbmdNYXAuZ2V0KGZldGNoUmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgY29uc3QgZmFpbFJlc3BvbnNlTWFwcGVyID0gdGhpcy5mYWlsTWFwcGluZ01hcC5nZXQoZmV0Y2hSZXNwb25zZS5zdGF0dXMpO1xuXG4gICAgICAgIC8vIEVtcHR5IHJlc3BvbnNlXG4gICAgICAgIGlmICgyMDQgPT09IGZldGNoUmVzcG9uc2Uuc3RhdHVzIHx8IGZldGNoUmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LUxlbmd0aFwiKSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzUmVzcG9uc2VNYXBwZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlTWFwcGVyKG51bGwpOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmYWlsUmVzcG9uc2VNYXBwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBmYWlsUmVzcG9uc2VNYXBwZXIobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIG1hcHBlciBmb3IgcmV0dXJuIHN0YXR1czogXCIgKyBmZXRjaFJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBc3N1bWluZyBqc29uIHJlc3BvbnNlXG4gICAgICAgIGxldCBzdWNjZXNzUmVzcG9uc2UgPSBudWxsO1xuICAgICAgICBsZXQgZmFpbFJlc3BvbnNlID0gbnVsbDsgICAgICBcbiAgICAgICAgdHJ5IHsgIFxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VKc29uID0gYXdhaXQgZmV0Y2hSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzc1Jlc3BvbnNlTWFwcGVyKSB7IFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NSZXNwb25zZSA9IHN1Y2Nlc3NSZXNwb25zZU1hcHBlcihyZXNwb25zZUpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gc3VjY2Vzc1Jlc3BvbnNlICYmIGZhaWxSZXNwb25zZU1hcHBlcikge1xuICAgICAgICAgICAgICAgIGZhaWxSZXNwb25zZSA9IGZhaWxSZXNwb25zZU1hcHBlcihyZXNwb25zZUpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gc3VjY2Vzc1Jlc3BvbnNlICYmIG51bGwgPT0gZmFpbFJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZmFpbFJlc3BvbnNlID0gdGhpcy5lcnJvck1hcHBpbmdGdW5jdGlvbihyZXNwb25zZUpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXNwb25zZSBkaWQgbm90IHByb3ZpZGUganNvblxuICAgICAgICAgICAgTE9HLmVycm9yKFwiRXJyb3IgcGFyc2luZyByZXNwb25zZSBqc29uXCIsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IHRoaXMuZXJyb3JNYXBwaW5nRnVuY3Rpb24oZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3NSZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmFpbFJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aHJvdyBmYWlsUmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBtYXBwZXIgZm9yIHJldHVybiBzdGF0dXM6IFwiICsgZmV0Y2hSZXNwb25zZS5zdGF0dXMpO1xuICAgIH1cblxufSIsImV4cG9ydCBjbGFzcyBTaGFVdGlscyB7XG5cbiAgICBzdGF0aWMgYXN5bmMgc2hhMjU2QjY0KG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IG1zZ0J1ZmZlciA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShtZXNzYWdlKTsgLy8gRW5jb2RlIHRoZSBzdHJpbmcgYXMgVVRGLThcbiAgICAgIGNvbnN0IGhhc2hCdWZmZXIgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdCgnU0hBLTI1NicsIG1zZ0J1ZmZlcik7IC8vIEhhc2ggdGhlIG1lc3NhZ2VcbiAgICAgIGNvbnN0IGhhc2hBcnJheSA9IEFycmF5LmZyb20obmV3IFVpbnQ4QXJyYXkoaGFzaEJ1ZmZlcikpOyAvLyBDb252ZXJ0IGJ1ZmZlciB0byBieXRlIGFycmF5XG4gICAgICBjb25zdCBiYXNlNjRIYXNoID0gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmhhc2hBcnJheSkpOyAvLyBDb252ZXJ0IGJ5dGVzIHRvIGJhc2U2NCBzdHJpbmdcbiAgICAgIHJldHVybiBiYXNlNjRIYXNoO1xuICAgIH1cblxufSIsImV4cG9ydCBjbGFzcyBRdWVyeVBhcmFtQnVpbGRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMge1F1ZXJ5UGFyYW1CdWlsZGVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUXVlcnlQYXJhbUJ1aWxkZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBcbiAgICAgKiBAcmV0dXJucyB7UXVlcnlQYXJhbUJ1aWxkZXJ9XG4gICAgICovXG4gICAgd2l0aFN0cmluZyhrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZUFycmF5IFxuICAgICAqIEByZXR1cm5zIHtRdWVyeVBhcmFtQnVpbGRlcn1cbiAgICAgKi9cbiAgICB3aXRoQXJyYXkoa2V5LCB2YWx1ZUFycmF5KSB7XG4gICAgICAgIHRoaXMucGFyYW1zLnNldChrZXksIHZhbHVlQXJyYXkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIGJ1aWxkKCkge1xuICAgICAgICBsZXQgcXVlcnlQYXJhbSA9IFwiXCI7XG4gICAgICAgIGxldCBmaXJzdFBhcmFtID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wYXJhbXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaXJzdFBhcmFtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtICs9IFwiJlwiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RQYXJhbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbSArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmICghZmlyc3RQYXJhbSkge1xuICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtICs9IFwiJlwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0UGFyYW0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBxdWVyeVBhcmFtICs9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW07XG4gICAgfVxufSIsImltcG9ydCB7IExpc3QsIExvZ2dlciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5jb25zdCBMT0cgPSBuZXcgTG9nZ2VyKFwiQWJzdHJhY3RWYWxpZGF0b3JcIik7XG5cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ3VycmVudGx5VmFsaWRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihjdXJyZW50bHlWYWxpZCA9IGZhbHNlLCBlbmFibGVkID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnZhbGlkTGlzdGVuZXJMaXN0ID0gbmV3IExpc3QoKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkTGlzdGVuZXJMaXN0ID0gbmV3IExpc3QoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50bHlWYWxpZCA9IGN1cnJlbnRseVZhbGlkO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgIH1cblxuICAgIGVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmludmFsaWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc2FibGUoKSB7XG4gICAgICAgIGxldCB3YXNWYWxpZCA9IHRoaXMuY3VycmVudGx5VmFsaWQ7XG4gICAgICAgIC8vIEZha2UgdmFsaWRcbiAgICAgICAgdGhpcy52YWxpZCgpO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jdXJyZW50bHlWYWxpZCA9IHdhc1ZhbGlkO1xuICAgIH1cblxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50bHlWYWxpZDtcbiAgICB9XG5cblx0dmFsaWQoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSB0cnVlO1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCF0aGlzLnZhbGlkTGlzdGVuZXJMaXN0KSB7XG4gICAgICAgICAgICBMT0cud2FybihcIk5vIHZhbGlkYXRpb24gbGlzdGVuZXJzXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsaWRMaXN0ZW5lckxpc3QuZm9yRWFjaCgodmFsdWUsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuY2FsbCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMpO1xuXHR9XG5cblx0aW52YWxpZCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50bHlWYWxpZCA9IGZhbHNlO1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCF0aGlzLmludmFsaWRMaXN0ZW5lckxpc3QpIHtcbiAgICAgICAgICAgIExPRy53YXJuKFwiTm8gaW52YWxpZGF0aW9uIGxpc3RlbmVyc1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludmFsaWRMaXN0ZW5lckxpc3QuZm9yRWFjaCgodmFsdWUsIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuY2FsbCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMpO1xuXHR9XG5cblx0dmFsaWRTaWxlbnQoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudGx5VmFsaWQgPSB0cnVlO1xuXHR9XG5cblx0aW52YWxpZFNpbGVudCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50bHlWYWxpZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcGFyYW0ge01ldGhvZH0gdmFsaWRMaXN0ZW5lciBcblx0ICovXG5cdHdpdGhWYWxpZExpc3RlbmVyKHZhbGlkTGlzdGVuZXIpIHtcblx0XHR0aGlzLnZhbGlkTGlzdGVuZXJMaXN0LmFkZCh2YWxpZExpc3RlbmVyKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBcblx0ICogQHBhcmFtIHtNZXRob2R9IGludmFsaWRMaXN0ZW5lciBcblx0ICovXG5cdHdpdGhJbnZhbGlkTGlzdGVuZXIoaW52YWxpZExpc3RlbmVyKSB7XG5cdFx0dGhpcy5pbnZhbGlkTGlzdGVuZXJMaXN0LmFkZChpbnZhbGlkTGlzdGVuZXIpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSBcIi4vYWJzdHJhY3RWYWxpZGF0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIFJlZ2V4VmFsaWRhdG9yIGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgcmVnZXggPSBcIiguKilcIikge1xuXHRcdHN1cGVyKGlzY3VycmVudGx5VmFsaWQpO1xuXHRcdHRoaXMubWFuZGF0b3J5ID0gbWFuZGF0b3J5O1xuICAgICAgICB0aGlzLnJlZ2V4ID0gcmVnZXg7XG4gICAgfVxuXG5cdHZhbGlkYXRlKHZhbHVlKXtcblx0XHRpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLm1hdGNoKHRoaXMucmVnZXgpKXtcblx0ICAgIFx0dGhpcy52YWxpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZighdmFsdWUgJiYgIXRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHRcdHRoaXMudmFsaWQoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLm1hdGNoKHRoaXMucmVnZXgpKXtcblx0ICAgIFx0dGhpcy52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZighdmFsdWUgJiYgIXRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHRcdHRoaXMudmFsaWRTaWxlbnQoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59XG4iLCJpbXBvcnQgeyBSZWdleFZhbGlkYXRvciB9IGZyb20gXCIuL3JlZ2V4VmFsaWRhdG9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFbWFpbFZhbGlkYXRvciBleHRlbmRzIFJlZ2V4VmFsaWRhdG9yIHtcblxuICAgIHN0YXRpYyBFTUFJTF9GT1JNQVQgPSAvXlxcdysoW1xcLi1dP1xcdyspKkBcXHcrKFtcXC4tXT9cXHcrKSooXFwuXFx3ezIsM30pKyQvO1xuXG4gICAgY29uc3RydWN0b3IobWFuZGF0b3J5ID0gZmFsc2UsIGlzY3VycmVudGx5VmFsaWQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihtYW5kYXRvcnksIGlzY3VycmVudGx5VmFsaWQsIEVtYWlsVmFsaWRhdG9yLkVNQUlMX0ZPUk1BVCk7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBMaXN0LCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSAnLi9hYnN0cmFjdFZhbGlkYXRvci5qcyc7XG5cbmV4cG9ydCBjbGFzcyBBbmRWYWxpZGF0b3JTZXQgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cbiAgICBjb25zdHJ1Y3Rvcihpc1ZhbGlkRnJvbVN0YXJ0ID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoaXNWYWxpZEZyb21TdGFydCk7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdCA9IG5ldyBMaXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBYnN0cmFjdFZhbGlkYXRvcn0gdmFsaWRhdG9yXG4gICAgICovXG4gICAgd2l0aFZhbGlkYXRvcih2YWxpZGF0b3IpIHtcbiAgICAgICAgdmFsaWRhdG9yLndpdGhWYWxpZExpc3RlbmVyKG5ldyBNZXRob2QodGhpcy5vbmVWYWxpZCwgdGhpcykpO1xuICAgICAgICB2YWxpZGF0b3Iud2l0aEludmFsaWRMaXN0ZW5lcihuZXcgTWV0aG9kKHRoaXMub25lSW52YWxpZCwgdGhpcykpO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuYWRkKHZhbGlkYXRvcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uZSB2YWxpZGF0b3Igc2FpZCBpdCB3YXMgdmFsaWRcbiAgICAgKi9cbiAgICBvbmVWYWxpZCgpIHtcbiAgICAgICAgbGV0IGZvdW5kSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZhbGlkYXRvckxpc3QuZm9yRWFjaCgodmFsdWUscGFyZW50KSA9PiB7XG4gICAgICAgICAgICBpZighdmFsdWUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgZm91bmRJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGlmKCFmb3VuZEludmFsaWQpIHtcbiAgICAgICAgICAgIHN1cGVyLnZhbGlkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbmUgdmFsaWRhdG9yIHNhaWQgaXQgd2FzIGludmFsaWRcbiAgICAgKi9cbiAgICBvbmVJbnZhbGlkKCkge1xuICAgICAgICBzdXBlci5pbnZhbGlkKCk7XG4gICAgfVxufSIsImltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSBcIi4vYWJzdHJhY3RWYWxpZGF0b3IuanNcIjtcbmltcG9ydCB7IE1ldGhvZCB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgRXF1YWxzRnVuY3Rpb25SZXN1bHRWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IG1hbmRhdG9yeSBcblx0ICogQHBhcmFtIHtib29sZWFufSBpc2N1cnJlbnRseVZhbGlkIFxuXHQgKiBAcGFyYW0ge01ldGhvZH0gY29tcGFyZWRWYWx1ZUZ1bmN0aW9uIFxuXHQgKi9cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlLCBjb21wYXJlZFZhbHVlRnVuY3Rpb24gPSBudWxsKSB7XG5cdFx0c3VwZXIoaXNjdXJyZW50bHlWYWxpZCk7XG5cblx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0dGhpcy5tYW5kYXRvcnkgPSBtYW5kYXRvcnk7XG5cblx0XHQvKiogQHR5cGUge01ldGhvZH0gKi9cblx0XHR0aGlzLmNvbXBhcmVkVmFsdWVGdW5jdGlvbiA9IGNvbXBhcmVkVmFsdWVGdW5jdGlvbjtcblx0fVxuXG5cdHZhbGlkYXRlKHZhbHVlKXtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHR0aGlzLmludmFsaWQoKTtcblx0XHR9IGVsc2UgaWYodmFsdWUgPT09IHRoaXMuY29tcGFyZWRWYWx1ZUZ1bmN0aW9uLmNhbGwoKSl7XG5cdCAgICBcdHRoaXMudmFsaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fVxuXHR9XG5cblx0dmFsaWRhdGVTaWxlbnQodmFsdWUpe1xuXHRcdGlmICghdmFsdWUgJiYgdGhpcy5tYW5kYXRvcnkpIHtcblx0XHRcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZSA9PT0gdGhpcy5jb21wYXJlZFZhbHVlRnVuY3Rpb24uY2FsbCgpKXtcblx0ICAgIFx0dGhpcy52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9XG5cdH1cblxufSIsImltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSBcIi4vYWJzdHJhY3RWYWxpZGF0b3IuanNcIjtcbmltcG9ydCB7IE1ldGhvZCwgUHJvcGVydHlBY2Nlc3NvciB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgRXF1YWxzUHJvcGVydHlWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IG1hbmRhdG9yeSBcblx0ICogQHBhcmFtIHtib29sZWFufSBpc2N1cnJlbnRseVZhbGlkIFxuXHQgKiBAcGFyYW0ge01ldGhvZH0gY29tcGFyZWRWYWx1ZUZ1bmN0aW9uIFxuXHQgKi9cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlLCBtb2RlbCA9IG51bGwsIGF0dHJpYnV0ZU5hbWUgPSBudWxsKSB7XG5cdFx0c3VwZXIoaXNjdXJyZW50bHlWYWxpZCk7XG5cblx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0dGhpcy5tYW5kYXRvcnkgPSBtYW5kYXRvcnk7XG5cblx0XHQvKiogQHR5cGUge29iamVjdH0gKi9cbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICBcbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIHRoaXMuYXR0cmlidXRlTmFtZSA9IGF0dHJpYnV0ZU5hbWU7XG5cdH1cblxuXHR2YWxpZGF0ZSh2YWx1ZSl7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fSBlbHNlIGlmKHZhbHVlID09PSBQcm9wZXJ0eUFjY2Vzc29yLmdldFZhbHVlKHRoaXMubW9kZWwsIHRoaXMuYXR0cmlidXRlTmFtZSkpe1xuXHQgICAgXHR0aGlzLnZhbGlkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2UgaWYodmFsdWUgPT09IFByb3BlcnR5QWNjZXNzb3IuZ2V0VmFsdWUodGhpcy5tb2RlbCwgdGhpcy5hdHRyaWJ1dGVOYW1lKSl7XG5cdCAgICBcdHRoaXMudmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbnZhbGlkU2lsZW50KCk7XG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBBYnN0cmFjdFZhbGlkYXRvciB9IGZyb20gXCIuL2Fic3RyYWN0VmFsaWRhdG9yLmpzXCI7XG5pbXBvcnQgeyBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIEVxdWFsc1N0cmluZ1ZhbGlkYXRvciBleHRlbmRzIEFic3RyYWN0VmFsaWRhdG9yIHtcblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gbWFuZGF0b3J5IFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGlzY3VycmVudGx5VmFsaWQgXG5cdCAqIEBwYXJhbSB7TWV0aG9kfSBjb21wYXJlZFZhbHVlRnVuY3Rpb24gXG5cdCAqL1xuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UsIGNvbnRyb2xWYWx1ZSA9IG51bGwpIHtcblx0XHRzdXBlcihpc2N1cnJlbnRseVZhbGlkKTtcblxuXHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHR0aGlzLm1hbmRhdG9yeSA9IG1hbmRhdG9yeTtcblxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgdGhpcy5jb250cm9sVmFsdWUgPSBjb250cm9sVmFsdWU7XG5cdH1cblxuXHR2YWxpZGF0ZSh2YWx1ZSl7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLm1hbmRhdG9yeSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkKCk7XG5cdFx0fSBlbHNlIGlmKHZhbHVlID09PSBjb250cm9sVmFsdWUpe1xuXHQgICAgXHR0aGlzLnZhbGlkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW52YWxpZCgpO1xuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMubWFuZGF0b3J5KSB7XG5cdFx0XHR0aGlzLmludmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2UgaWYodmFsdWUgPT09IGNvbnRyb2xWYWx1ZSl7XG5cdCAgICBcdHRoaXMudmFsaWRTaWxlbnQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbnZhbGlkU2lsZW50KCk7XG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBSZWdleFZhbGlkYXRvciB9IGZyb20gXCIuL3JlZ2V4VmFsaWRhdG9yLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIE51bWJlclZhbGlkYXRvciBleHRlbmRzIFJlZ2V4VmFsaWRhdG9yIHtcblxuICAgIHN0YXRpYyBQSE9ORV9GT1JNQVQgPSAvXlxcZCokLztcblxuICAgIGNvbnN0cnVjdG9yKG1hbmRhdG9yeSA9IGZhbHNlLCBpc2N1cnJlbnRseVZhbGlkID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIobWFuZGF0b3J5LCBpc2N1cnJlbnRseVZhbGlkLCBOdW1iZXJWYWxpZGF0b3IuUEhPTkVfRk9STUFUKTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IFJlZ2V4VmFsaWRhdG9yIH0gZnJvbSBcIi4vcmVnZXhWYWxpZGF0b3IuanNcIjtcblxuY29uc3QgUEFTU1dPUkRfRk9STUFUID0gL14oPz0uKltBLVphLXpdKSg/PS4qP1swLTldKSg/PS4qP1sjPyFAJCVeJiotXSkuezgsfSQvO1xuXG5leHBvcnQgY2xhc3MgUGFzc3dvcmRWYWxpZGF0b3IgZXh0ZW5kcyBSZWdleFZhbGlkYXRvciB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKG1hbmRhdG9yeSwgaXNjdXJyZW50bHlWYWxpZCwgUEFTU1dPUkRfRk9STUFUKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBMaXN0LCBNZXRob2QgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcbmltcG9ydCB7IEFic3RyYWN0VmFsaWRhdG9yIH0gZnJvbSAnLi9hYnN0cmFjdFZhbGlkYXRvci5qcydcblxuZXhwb3J0IGNsYXNzIE9yVmFsaWRhdG9yU2V0IGV4dGVuZHMgQWJzdHJhY3RWYWxpZGF0b3Ige1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGlzVmFsaWRGcm9tU3RhcnQgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihpc1ZhbGlkRnJvbVN0YXJ0KTtcbiAgICAgICAgdGhpcy52YWxpZGF0b3JMaXN0ID0gbmV3IExpc3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0Fic3RyYWN0VmFsaWRhdG9yfSB2YWxpZGF0b3JcbiAgICAgKi9cbiAgICB3aXRoVmFsaWRhdG9yKHZhbGlkYXRvcikge1xuICAgICAgICB2YWxpZGF0b3Iud2l0aFZhbGlkTGlzdGVuZXIobmV3IE1ldGhvZCh0aGlzLm9uZVZhbGlkLCB0aGlzKSk7XG4gICAgICAgIHZhbGlkYXRvci53aXRoSW52YWxpZExpc3RlbmVyKG5ldyBNZXRob2QodGhpcy5vbmVJbnZhbGlkLCB0aGlzKSk7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdC5hZGQodmFsaWRhdG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT25lIHZhbGlkYXRvciBzYWlkIGl0IHdhcyB2YWxpZFxuICAgICAqL1xuICAgIG9uZVZhbGlkKCkge1xuICAgICAgICBzdXBlci52YWxpZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uZSB2YWxpZGF0b3Igc2FpZCBpdCB3YXMgaW52YWxpZFxuICAgICAqL1xuICAgIG9uZUludmFsaWQoKSB7XG4gICAgICAgIGxldCBmb3VuZFZhbGlkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmFsaWRhdG9yTGlzdC5mb3JFYWNoKCh2YWx1ZSxwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIGlmKHZhbHVlLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgIGZvdW5kVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgaWYoZm91bmRWYWxpZCkge1xuICAgICAgICAgICAgc3VwZXIudmFsaWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLmludmFsaWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IFJlZ2V4VmFsaWRhdG9yIH0gZnJvbSBcIi4vcmVnZXhWYWxpZGF0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIFBob25lVmFsaWRhdG9yIGV4dGVuZHMgUmVnZXhWYWxpZGF0b3Ige1xuXG4gICAgc3RhdGljIFBIT05FX0ZPUk1BVCA9IC9eXFwrWzAtOV17Mn1cXHM/KFswLTldXFxzPykqJC87XG5cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKG1hbmRhdG9yeSwgaXNjdXJyZW50bHlWYWxpZCwgUGhvbmVWYWxpZGF0b3IuUEhPTkVfRk9STUFUKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBBYnN0cmFjdFZhbGlkYXRvciB9IGZyb20gXCIuL2Fic3RyYWN0VmFsaWRhdG9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBQcmltaXRpdmVWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYW5kYXRvcnkgPSBmYWxzZSwgaXNjdXJyZW50bHlWYWxpZCA9IGZhbHNlLCB2YWx1ZSA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoaXNjdXJyZW50bHlWYWxpZCk7XG4gICAgICAgIHRoaXMubWFuZGF0b3J5ID0gbWFuZGF0b3J5O1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdmFsaWRhdGUodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUgPT09IHRoaXMudmFsdWUpe1xuICAgICAgICAgICAgdGhpcy52YWxpZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoIXZhbHVlICYmICF0aGlzLm1hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsaWQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZGF0ZVNpbGVudCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZSA9PT0gdGhpcy52YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLnZhbGlkU2lsZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZighdmFsdWUgJiYgIXRoaXMubWFuZGF0b3J5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZFNpbGVudCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmludmFsaWRTaWxlbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgQWJzdHJhY3RWYWxpZGF0b3IgfSBmcm9tIFwiLi9hYnN0cmFjdFZhbGlkYXRvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgUmVxdWlyZWRWYWxpZGF0b3IgZXh0ZW5kcyBBYnN0cmFjdFZhbGlkYXRvciB7XG5cblx0Y29uc3RydWN0b3IoY3VycmVudGx5VmFsaWQgPSBmYWxzZSwgZW5hYmxlZCA9IHRydWUpIHtcblx0XHRzdXBlcihjdXJyZW50bHlWYWxpZCwgZW5hYmxlZCk7XG5cdH1cblxuXHR2YWxpZGF0ZSh2YWx1ZSl7XG5cdFx0aWYodmFsdWUgPT09IFwiXCIpe1xuXHQgICAgXHR0aGlzLmludmFsaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy52YWxpZCgpO1xuXHRcdH1cblx0fVxuXG5cdHZhbGlkYXRlU2lsZW50KHZhbHVlKXtcblx0XHRpZih2YWx1ZSA9PT0gXCJcIil7XG5cdCAgICBcdHRoaXMuaW52YWxpZFNpbGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZhbGlkU2lsZW50KCk7XG5cdFx0fVxuXHR9XG5cbn1cbiIsImltcG9ydCB7IE1hY1V0aWxzLCBSYWRpeFV0aWxzLCBTdHJpbmdVdGlscyB9IGZyb20gXCJjb3JldXRpbF92MVwiO1xuXG5leHBvcnQgY2xhc3MgSWRTcGFjZSB7XG5cbiAgICBzdGF0aWMgSURfU1BBQ0VfU1RSSU5HX1dJRFRIID0gMTc7XG5cbiAgICBzdGF0aWMgSFdfU1RSSU5HX1BBUlRfV0lEVEggPSA5O1xuICAgIHN0YXRpYyBFUE9DSF9TRUNPTkRTX1NUUklOR19QQVJUX1dJRFRIID0gNjtcbiAgICBzdGF0aWMgQ09VTlRfU1RSSU5HX1BBUlRfV0lEVEggPSAyO1xuXG4gICAgY29uc3RydWN0b3IobWFjID0gbnVsbCwgZXBvY2hTZWNvbmRzID0gbnVsbCwgY291bnRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5tYWMgPSBtYWM7XG4gICAgICAgIHRoaXMuZXBvY2hTZWNvbmRzID0gZXBvY2hTZWNvbmRzO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZFNwYWNlU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtJZFNwYWNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShpZFNwYWNlU3RyaW5nKSB7XG4gICAgICAgIGlmIChpZFNwYWNlU3RyaW5nID09IG51bGwgfHwgaWRTcGFjZVN0cmluZy5sZW5ndGggPCBJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCB8fCAhUmFkaXhVdGlscy5pc1ZhbGlkUmFkaXhTdHJpbmcoaWRTcGFjZVN0cmluZykpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiSUQgU3BhY2UgbXVzdCBiZSBhdCBsZWFzdCBcIiArIElkU3BhY2UuSURfU1BBQ0VfU1RSSU5HX1dJRFRIICsgXCIgY2hhcmFjdGVycyBsb25nIGFuZCBjb250YWluIHZhbGlkIGNoYXJhY3RlcnMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hY1N0cmluZyA9IGlkU3BhY2VTdHJpbmcuc3Vic3RyaW5nKDAsIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgpO1xuICAgICAgICBjb25zdCBlcG9jaFNlY29uZHNTdHJpbmcgPSBpZFNwYWNlU3RyaW5nLnN1YnN0cmluZyhcbiAgICAgICAgICAgIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgsIFxuICAgICAgICAgICAgSWRTcGFjZS5IV19TVFJJTkdfUEFSVF9XSURUSCArIElkU3BhY2UuRVBPQ0hfU0VDT05EU19TVFJJTkdfUEFSVF9XSURUSCk7XG5cbiAgICAgICAgY29uc3QgY291bnRlclN0cmluZyA9IGlkU3BhY2VTdHJpbmcuc3Vic3RyaW5nKFxuICAgICAgICAgICAgSWRTcGFjZS5IV19TVFJJTkdfUEFSVF9XSURUSCArIElkU3BhY2UuRVBPQ0hfU0VDT05EU19TVFJJTkdfUEFSVF9XSURUSCxcbiAgICAgICAgICAgIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEggKyBJZFNwYWNlLkVQT0NIX1NFQ09ORFNfU1RSSU5HX1BBUlRfV0lEVEggKyBJZFNwYWNlLkNPVU5UX1NUUklOR19QQVJUX1dJRFRIKTtcblxuICAgICAgICBjb25zdCBtYWMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyhtYWNTdHJpbmcpO1xuICAgICAgICBjb25zdCBlcG9jaFNlY29uZHMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyhlcG9jaFNlY29uZHNTdHJpbmcpO1xuICAgICAgICBjb25zdCBjb3VudGVyID0gUmFkaXhVdGlscy5mcm9tUmFkaXhTdHJpbmcoY291bnRlclN0cmluZyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBJZFNwYWNlKG1hYywgZXBvY2hTZWNvbmRzLCBjb3VudGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBtYWNTdHJpbmcgPSBTdHJpbmdVdGlscy5sZWZ0UGFkKFJhZGl4VXRpbHMudG9SYWRpeFN0cmluZyh0aGlzLm1hYyksIElkU3BhY2UuSFdfU1RSSU5HX1BBUlRfV0lEVEgsICcwJyk7XG4gICAgICAgIGNvbnN0IGVwb2NoU2Vjb25kc1N0cmluZyA9IFN0cmluZ1V0aWxzLmxlZnRQYWQoUmFkaXhVdGlscy50b1JhZGl4U3RyaW5nKHRoaXMuZXBvY2hTZWNvbmRzKSwgSWRTcGFjZS5FUE9DSF9TRUNPTkRTX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICBjb25zdCBjb3VudGVyU3RyaW5nID0gU3RyaW5nVXRpbHMubGVmdFBhZChSYWRpeFV0aWxzLnRvUmFkaXhTdHJpbmcodGhpcy5jb3VudGVyKSwgSWRTcGFjZS5DT1VOVF9TVFJJTkdfUEFSVF9XSURUSCwgJzAnKTtcbiAgICAgICAgcmV0dXJuIG1hY1N0cmluZyArIGVwb2NoU2Vjb25kc1N0cmluZyArIGNvdW50ZXJTdHJpbmc7XG4gICAgfVxuXG4gICAgcmVwb3J0KCkge1xuICAgICAgICBjb25zdCByZXBvcnQgPSBuZXcgTWFwKCk7XG4gICAgICAgIHJlcG9ydC5zZXQoXCJJZFNwYWNlIFtNQUNdXCIsIE1hY1V0aWxzLnRvTWFjQWRkcmVzcyh0aGlzLm1hYykpO1xuICAgICAgICByZXBvcnQuc2V0KFwiSWRTcGFjZSBbRXBvY2hdXCIsIHRoaXMuZXBvY2hTZWNvbmRzICogMTAwMCk7XG4gICAgICAgIHJlcG9ydC5zZXQoXCJJZFNwYWNlIFtEYXRlXVwiLCBuZXcgRGF0ZSh0aGlzLmVwb2NoU2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICByZXBvcnQuc2V0KFwiSWRTcGFjZSBbQ291bnRlcl1cIiwgdGhpcy5jb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG59IiwiaW1wb3J0IHsgUmFkaXhVdGlscywgU3RyaW5nVXRpbHMgfSBmcm9tIFwiY29yZXV0aWxfdjFcIjtcblxuZXhwb3J0IGNsYXNzIFVzZXJJZCB7XG5cbiAgICBzdGF0aWMgVVNFUl9JRF9TVFJJTkdfV0lEVEggPSA5O1xuXG4gICAgc3RhdGljIEVQT0NIX0NFTlRJU19TVFJJTkdfUEFSVF9XSURUSCA9IDc7XG4gICAgc3RhdGljIENPVU5UX1NUUklOR19QQVJUX1dJRFRIID0gMjtcblxuICAgIGNvbnN0cnVjdG9yKGVwb2NoQ2VudGlzID0gbnVsbCwgY291bnRlciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lcG9jaENlbnRpcyA9IGVwb2NoQ2VudGlzO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWRTdHJpbmcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHVzZXJJZFN0cmluZykge1xuICAgICAgICBpZiAodXNlcklkU3RyaW5nID09IG51bGwgfHwgdXNlcklkU3RyaW5nLmxlbmd0aCAhPT0gVXNlcklkLlVTRVJfSURfU1RSSU5HX1dJRFRIIHx8ICFSYWRpeFV0aWxzLmlzVmFsaWRSYWRpeFN0cmluZyh1c2VySWRTdHJpbmcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2VyIElEIG11c3QgYmUgYXQgbGVhc3QgXCIgKyBVc2VySWQuVVNFUl9JRF9TVFJJTkdfV0lEVEggKyBcIiBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNvbnRhaW4gdmFsaWQgY2hhcmFjdGVycy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXBvY2hDZW50aXMgPSBSYWRpeFV0aWxzLmZyb21SYWRpeFN0cmluZyh1c2VySWRTdHJpbmcuc3Vic3RyaW5nKDAsIFVzZXJJZC5FUE9DSF9DRU5USVNfU1RSSU5HX1BBUlRfV0lEVEgpKTtcbiAgICAgICAgY29uc3QgY291bnRlciA9IFJhZGl4VXRpbHMuZnJvbVJhZGl4U3RyaW5nKHVzZXJJZFN0cmluZy5zdWJzdHJpbmcoVXNlcklkLkVQT0NIX0NFTlRJU19TVFJJTkdfUEFSVF9XSURUSCwgVXNlcklkLlVTRVJfSURfU1RSSU5HX1dJRFRIKSk7XG4gICAgICAgIHJldHVybiBuZXcgVXNlcklkKGVwb2NoQ2VudGlzLCBjb3VudGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBlcG9jaE1pbGxpc1N0cmluZyA9IFN0cmluZ1V0aWxzLmxlZnRQYWQoUmFkaXhVdGlscy50b1JhZGl4U3RyaW5nKHRoaXMuZXBvY2hDZW50aXMpLCBVc2VySWQuRVBPQ0hfQ0VOVElTX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICBjb25zdCBjb3VudGVyU3RyaW5nID0gU3RyaW5nVXRpbHMubGVmdFBhZChSYWRpeFV0aWxzLnRvUmFkaXhTdHJpbmcodGhpcy5jb3VudGVyKSwgVXNlcklkLkNPVU5UX1NUUklOR19QQVJUX1dJRFRILCAnMCcpO1xuICAgICAgICByZXR1cm4gZXBvY2hNaWxsaXNTdHJpbmcgKyBjb3VudGVyU3RyaW5nO1xuICAgIH1cblxuICAgIHJlcG9ydCgpIHtcbiAgICAgICAgY29uc3QgcmVwb3J0ID0gbmV3IE1hcCgpO1xuICAgICAgICByZXBvcnQuc2V0KFwiVXNlcklkIFtFcG9jaF1cIiwgdGhpcy5lcG9jaENlbnRpcyAqIDEwKTtcbiAgICAgICAgcmVwb3J0LnNldChcIlVzZXJJZCBbRGF0ZV1cIiwgbmV3IERhdGUodGhpcy5lcG9jaENlbnRpcyAqIDEwKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgcmVwb3J0LnNldChcIlVzZXJJZCBbQ291bnRlcl1cIiwgdGhpcy5jb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG59IiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmV1dGlsX3YxXCI7XG5pbXBvcnQgeyBJZFNwYWNlIH0gZnJvbSBcIi4vaWRTcGFjZVwiO1xuaW1wb3J0IHsgVXNlcklkIH0gZnJvbSBcIi4vdXNlcklkXCI7XG5cbmNvbnN0IExPRyA9IG5ldyBMb2dnZXIoXCJJZFwiKTtcblxuZXhwb3J0IGNsYXNzIElkIHtcblxuICAgIGNvbnN0cnVjdG9yKGlkU3BhY2UgPSBudWxsLCB1c2VySWQgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuaWRTcGFjZSA9IGlkU3BhY2VcbiAgICAgICAgdGhpcy51c2VySWQgPSB1c2VySWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkU3RyaW5nIFxuICAgICAqIEByZXR1cm5zIHtJZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UoaWRTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaWRTcGFjZVN0cmluZyA9IGlkU3RyaW5nLnN1YnN0cmluZygwLCBJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZFN0cmluZyA9IGlkU3RyaW5nLnN1YnN0cmluZyhJZFNwYWNlLklEX1NQQUNFX1NUUklOR19XSURUSCk7XG5cbiAgICAgICAgY29uc3QgaWRTcGFjZSA9IElkU3BhY2UucGFyc2UoaWRTcGFjZVN0cmluZyk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJJZC5wYXJzZSh1c2VySWRTdHJpbmcpO1xuXG4gICAgICAgIHJldHVybiBuZXcgSWQoaWRTcGFjZSwgdXNlcklkKTtcbiAgICB9XG5cbiAgICByZXBvcnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgaWRTcGFjZVJlcG9ydCA9IHRoaXMuaWRTcGFjZS5yZXBvcnQoKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaWRTcGFjZVJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHJlcG9ydC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlcklkUmVwb3J0ID0gdGhpcy51c2VySWQucmVwb3J0KCk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHVzZXJJZFJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHJlcG9ydC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG5cbiAgICByZXBvcnRTdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IHRoaXMucmVwb3J0KCk7XG4gICAgICAgIGxldCByZXBvcnRTdHJpbmcgPSBcIlwiXG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJlcG9ydC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIHJlcG9ydFN0cmluZyArPSBrZXkgKyBcIjogXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwb3J0U3RyaW5nICs9IFwiXFxuXCIgKyBrZXkgKyBcIjogXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcG9ydFN0cmluZztcbiAgICB9XG5cbiAgICBwcmludCAoKXtcbiAgICAgICAgTE9HLmluZm8odGhpcy5yZXBvcnRTdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBpZFNwYWNlLnRvU3RyaW5nKCkgKyB1c2VySWQudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB1c2VySWQoKSB7XG4gICAgICAgIHJldHVybiB1c2VySWQudG9TdHJpbmcoKTtcbiAgICB9XG5cbn0iXSwibmFtZXMiOlsiU3RyaW5nVXRpbHMiLCJMb2dnZXIiLCJDb250YWluZXJVcmwiLCJDb250YWluZXJIdHRwQ2xpZW50IiwiQ29udGFpbmVyVXBsb2FkRGF0YSIsIkxPRyIsIkluamVjdGlvblBvaW50IiwiTWluZGlJbmplY3RvciIsIkFycmF5VXRpbHMiLCJNZXRob2QiLCJNYXAiLCJYbWxFbGVtZW50IiwiQ29udGFpbmVyRWxlbWVudFV0aWxzIiwiQ29udGFpbmVyRWxlbWVudCIsIkxpc3QiLCJDb250YWluZXJUZXh0IiwiWG1sQ2RhdGEiLCJYbWxBdHRyaWJ1dGUiLCJDb250YWluZXJXaW5kb3ciLCJEb21UcmVlIiwiTWluZGlDb25maWciLCJTaW5nbGV0b25Db25maWciLCJQcm90b3R5cGVDb25maWciLCJJbnN0YW5jZVBvc3RDb25maWdUcmlnZ2VyIiwiQ29uZmlnQWNjZXNzb3IiLCJQcm9wZXJ0eUFjY2Vzc29yIiwiTWFwVXRpbHMiLCJDb250YWluZXJEb3dubG9hZCIsIlJhZGl4VXRpbHMiLCJNYWNVdGlscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sTUFBTSxZQUFZLENBQUM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxTQUFTLENBQUMsR0FBRyxFQUFFO0FBQ3BCLE1BQU07QUFDTjtBQUNBOztBQ1JPLE1BQU0sR0FBRztBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFLGNBQWMsR0FBRyxJQUFJLEVBQUUsYUFBYSxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFFLGNBQWMsR0FBRyxJQUFJLEVBQUU7QUFDaEk7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDdkM7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDL0I7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FB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LFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLGNBQWMsQ0FBQyxTQUFTLEVBQUU7QUFDckMsUUFBUSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFO0FBQ2hELFFBQVEsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzdDLFlBQVksU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsU0FBUztBQUNULFFBQVEsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzNDLFlBQVksU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMzQyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMzQyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFNBQVM7QUFDVCxRQUFRLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN2QyxZQUFZLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FB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SSxLQUFLLFVBQVUsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDM0QsWUFBWSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRTtBQUN4RCxZQUFZLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFO0FBQ3ZELFlBQVksSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDdkQsU0FBUztBQUNULFFBQVEsR0FBRyxLQUFLLFlBQVlBLHVCQUFVLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDbEUsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDNUQsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDNUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDOUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDOUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDaEYsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDN0Us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
