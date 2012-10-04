/**
* The abstraction layer for webviews functionality
 *
 * @author dkerr
 * $Id: webviews.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var request = require('../../lib/request'),
    _readyTrigger,
    _destroyedTrigger,
    _prevWebview,
    _currWebview,
    _webviews = {};

function screenWindowHandle(id) {
    return qnx.callExtensionMethod("webview.jsScreenWindowHandle", id);
}

function onWebviewCreated(id) {
    console.log(_webviews[id].params.url);
}

function onAnimationFinished(animationId) {
    console.log(animationId);
}

module.exports = {

    /**
     * Initializes the extension
     */
    init: function () {
        console.log('webviews.init');
        if (typeof chrome.internal === "object") {
            chrome.internal.windowAnimations = {};
            chrome.internal.windowAnimations.onWindowAnimationFinished = onAnimationFinished;
        }
    },

    /*
     * Creates the webview through the webplatform.js module provided in the webworks framework
     * @param args {Object} Webview parameters
     * Ex: {
     *      url: [optional],
     *      x: <left>,
     *      y: <top>,
     *      w: <width>,
     *      h: <height>,
     *      z: <zOrder>
     *  }
     * @returns id {Number} The webviews ID
     */
    create: function (args) {
        var webviewObj = window.qnx.webplatform.createWebView(function () {
            var requestObj = request.init(webviewObj);

            webviewObj.visible = false;
            webviewObj.active = false;
            webviewObj.zOrder = args.z;
            webviewObj.enableCrossSiteXHR = true;
            webviewObj.setGeometry(args.x, args.y, args.w, args.h);
            webviewObj.webviewHandle = screenWindowHandle(webviewObj.id);
            webviewObj.autoDeferNetworkingAndJavaScript = false;
            webviewObj.executeJavaScript("1 + 1");

            webviewObj.onNetworkResourceRequested = requestObj.networkResourceRequestedHandler;

            if (args.url) {
                webviewObj.url = args.url;
            }

            // dispatch the webviewready event
            if (_readyTrigger && typeof _readyTrigger === 'function') {
                onWebviewCreated(webviewObj.id);
                _readyTrigger({id: webviewObj.id, webviewHandle: webviewObj.webviewHandle});
            }
        });

        webviewObj.params = args;
        _webviews[webviewObj.id] = webviewObj;

        return webviewObj.id;
    },

    /**
     * Destroys the webview
     * @param id {Number} The webview ID
     */
    destroy: function (id) {
        _webviews[id].destroy(function () {
            if (_destroyedTrigger && typeof _destroyedTrigger === 'function') {
                _destroyedTrigger({id: id});
            }
            delete _webviews[id];
        });
        return true;
    }
};
