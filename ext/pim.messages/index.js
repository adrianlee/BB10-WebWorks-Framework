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
var pimMessages,
    _event = require("../../lib/event"),
    _utils = require("../../lib/utils"),
    _config = require("../../lib/config"),
    MessagesError = require("./MessagesError");


function checkPermission(success, eventId) {
    if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
        _event.trigger(eventId, {
            "result": escape(JSON.stringify({
                "_success": false,
                "code": MessagesError.PERMISSION_DENIED_ERROR
            }))
        });
        success();
        return false;
    }

    return true;
}

function getParsedArgs(args) {
    var parsedArgs = {},
        key;

    for (key in args) {
        if (args.hasOwnProperty(key)) {
            parsedArgs[key] = JSON.parse(decodeURIComponent(args[key]));
        }
    }

    return parsedArgs;
}

module.exports = {
    create: function (success, fail, args) {
        var parsedArgs = getParsedArgs(args);

        if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            success(null);
            return;
        }

        success(pimMessages.create(parsedArgs));
    },

    geAccounts: function (success, fail, args) {
        if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            success(null);
            return;
        }

        success(pimMessages.getAccounts());
    },

    getDefaultAccount: function (success, fail, args) {
        if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            success(null);
            return;
        }

        success(pimMessages.getDefaultAccount());
    },

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

        pimMessages.find(findOptions);
        success();
    },
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.pimMessages = function ()
{
    var self = this;

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("pimMessages")) {
            return false;
        }

        self.m_id = JNEXT.createObject("pimMessages.pimMessages");

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

pimMessages = new JNEXT.pimMessages();
