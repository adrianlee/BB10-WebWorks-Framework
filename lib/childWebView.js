/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var overlayWebView = require('./overlayWebView'),
    _controller,
    _webviewObj,
    hasWebViewLoaded = false,
    isInitialized = false,
    CONTROLS_HEIGHT = 121 + 10, // height + border
    self;

function init() {

    _controller = window.qnx.webplatform.getController();

    // publish remote functions for the UI control bar
    _controller.publishRemoteFunction('childWebView.back', function () {
        self.back();
    });

    _controller.publishRemoteFunction('childWebView.destroy', function () {
        self.destroy();
    });
}

self = {
    init: init,
    create: function (ready) {
        if (!isInitialized) {
            init();
            isInitialized = true;
        }

        _webviewObj = window.qnx.webplatform.createWebView({processType: 1}, function () {

            hasWebViewLoaded = true;

            _webviewObj.visible = true;
            _webviewObj.active = true;
            _webviewObj.zOrder = 1;

            self.initOverlayControls();
            self.showOverlayControls();

            _webviewObj.setGeometry(0, CONTROLS_HEIGHT, screen.width, screen.height - CONTROLS_HEIGHT);

            _webviewObj.enableWebEventRedirect("JavaScriptCallback", 1);
            _webviewObj.backgroundColor = 0xFFFFFFFF;
            _webviewObj.sensitivity = "SensitivityTest";
            _webviewObj.devicePixelRatio = 1;

            _webviewObj.addEventListener('Destroyed', function () {
                hasWebViewLoaded = false;
                self.hideOverlayControls();
            });

            if (ready && typeof ready === 'function') {
                ready();
            }
        });
    },

    id: function () {
        return _webviewObj.id;
    },

    destroy: function () {
        hasWebViewLoaded = false;
        if (_webviewObj) {
            _webviewObj.destroy();
        }
    },

    setURL: function (url) {
        _webviewObj.url = url;
    },

    setGeometry: function (x, y, width, height) {
        _webviewObj.setGeometry(x, y, width, height);
    },

    setSensitivity: function (sensitivity) {
        _webviewObj.sensitivity = sensitivity;
    },

    setApplicationOrientation: function (angle) {
        _webviewObj.setApplicationOrientation(angle);
    },

    notifyApplicationOrientationDone: function () {
        _webviewObj.notifyApplicationOrientationDone();
    },

    executeJavascript: function (js) {
        _webviewObj.executeJavaScript(js);
    },

    windowGroup: function () {
        return _webviewObj.windowGroup;
    },

    notifyContextMenuCancelled: function () {
        _webviewObj.notifyContextMenuCancelled();
    },

    initOverlayControls: function () {
        return overlayWebView.executeJavascript("require('childWebViewControls').init();");
    },

    showOverlayControls: function () {
        return overlayWebView.executeJavascript("require('childWebViewControls').show();");
    },

    hideOverlayControls: function () {
        return overlayWebView.executeJavascript("require('childWebViewControls').hide();");
    },

    open: function (url, callback) {
        var complete = function () {
            if (typeof(callback) === 'function') {
                callback();
            }
        };
        if (hasWebViewLoaded) {
            self.setURL(url);
            complete();
        }
        else {
            self.create(function () {
                self.setURL(url);
                complete();
            });
        }
    },

    close: function () {
        if (hasWebViewLoaded) {
            self.destroy();
        }
    },

    back: function () {
        qnx.callExtensionMethod("webview.goBack", self.id());
    }
};

module.exports = self;
