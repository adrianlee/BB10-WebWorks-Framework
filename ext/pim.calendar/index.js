/*
 * Copyright 2012 Research In Motion Limited.
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

var pimCalendar,
    _event = require("../../lib/event"),
    _utils = require("../../lib/utils"),
    config = require("../../lib/config");/*,
    ContactError = require("./ContactError");*/

function checkPermission(success, eventId) {/*
    if (!_utils.hasPermission(config, "access_pimdomain_calendars")) {
        _event.trigger(eventId, {
            "_success": false,
            "code": ContactError.PERMISSION_DENIED_ERROR
        });
        success();
        return false;
    }
*/
    return true;
}

module.exports = {
    find: function (success, fail, args) {
        var findOptions = {},
            key;

        for (key in args) {
            if (args.hasOwnProperty(key)) {
                findOptions[key] = JSON.parse(decodeURIComponent(args[key]));
            }
        }

        if (!checkPermission(success, findOptions["_eventId"])) {
            return;
        }

        pimCalendar.find(findOptions);

        success();
    },

    save: function (success, fail, args) {
        var attributes = {},
            key;

        for (key in args) {
            if (args.hasOwnProperty(key)) {
                attributes[key] = JSON.parse(decodeURIComponent(args[key]));
            }
        }

        if (!checkPermission(success, attributes["_eventId"])) {
            return;
        }

        pimCalendar.save(attributes);
        success();
    },

    remove: function (success, fail, args) {
        var attributes = { "calEventId" : JSON.parse(decodeURIComponent(args.calEventId)),
                           "_eventId" : JSON.parse(decodeURIComponent(args._eventId))};

        if (!checkPermission(success, attributes["_eventId"])) {
            return;
        }

        pimCalendar.remove(attributes);
        success();
    },

    getCalendarFolders: function (success, fail, args) {
/*
        if (!_utils.hasPermission(config, "access_pimdomain_calendars")) {
            success(null);
            return;
        }
*/
        success(pimCalendar.getCalendarFolders());
    },

    getTimezones: function (success, fail, args) {
        success(pimCalendar.getTimezones());
    }
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.PimCalendar = function ()
{
    var self = this;

    self.find = function (args) {
        JNEXT.invoke(self.m_id, "find " + JSON.stringify(args));
        return "";
    };

    self.save = function (args) {
        JNEXT.invoke(self.m_id, "save " + JSON.stringify(args));
        return "";
    };

    self.remove = function (args) {
        JNEXT.invoke(self.m_id, "remove " + JSON.stringify(args));
        return "";
    };

    self.getCalendarFolders = function (args) {
        var result = JNEXT.invoke(self.m_id, "getCalendarFolders");
        console.log("getCalendarFolders, result=" + result);
        return JSON.parse(result);
    };

    self.getTimezones = function () {
        var result = JNEXT.invoke(self.m_id, "getTimezones");
        console.log("getTimezones, result=" + result);
        return JSON.parse(result);
    };

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("pimCalendar")) {
            return false;
        }

        self.m_id = JNEXT.createObject("pimCalendar.PimCalendar");

        if (self.m_id === "") {
            return false;
        }

        JNEXT.registerEvents(self);
    };

    self.onEvent = function (strData) {
        var arData = strData.split(" "),
            strEventDesc = arData[0],
            args = {};

        if (strEventDesc === "result") {
            args.result = escape(strData.split(" ").slice(2).join(" "));
            _event.trigger(arData[1], args);
        }
    };

    self.m_id = "";

    self.init();
};

pimCalendar = new JNEXT.PimCalendar();
