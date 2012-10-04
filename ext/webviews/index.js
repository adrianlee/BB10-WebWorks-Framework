/**
 * Allows limited creation and control of webview objects
 *
 * @author dkerr
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
    _webviews = require("./webviews"),
    _webview = require("../../lib/webview"),
    _actionMap = {
        /**
         * @event
         * Triggered when the webview is created and ready
         */
        webviewready: {
            context: require("./context"),
            event: "webviewready",
            trigger: function (args) {
                _event.trigger("webviewready", args);
            }
        },
        webviewdestroyed: {
            context: require("./context"),
            event: "webviewdestroyed",
            trigger: function (args) {
                _event.trigger("webviewdestroyed", args);
            }
        }
    };

(function init() {
    var eventExt = _utils.loadExtensionModule("event", "index");
    eventExt.registerEvents(_actionMap);
    _webviews.init();
}());

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
    /**
     * Initializes the extension and sets the application's webview to a non-screen defined size.
     */
    init: function (success, fail, args) {
        var localArgs = JSON.parse(decodeURIComponent(args));

        _webview.setGeometry(localArgs.x, localArgs.y, localArgs.w, localArgs.h);
        success();
    },

    /**
     * Creates a webview
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are:
     * Ex: {
     *      url: [optional],
     *      x: <left>,
     *      y: <top>,
     *      w: <width>,
     *      h: <height>,
     *      z: <zOrder>
     *  }
     * @param env {Object} Environment variables
     * @returns id {Object} The id of the webview created.
     */
    create: function (success, fail, args) {
        var localArgs = JSON.parse(decodeURIComponent(args)),
            id = _webviews.create(localArgs);

        if (id !== -1) {
            success(id);
        } else {
            fail(-1, "Error creating webview");
        }
    },

    /**
     * Destroys a webview
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
     * @param env {Object} Environment variables
     */
    destroy: function (success, fail, args) {
        try {
            var localArgs = JSON.parse(decodeURIComponent(args));
            success(_webviews.destroy(localArgs.id));
        } catch (e) {
            fail(-1, e);
        }
    }
};
