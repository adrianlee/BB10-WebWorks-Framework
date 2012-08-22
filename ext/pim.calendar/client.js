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
 
var _self = {},
    _ID = require("./manifest.json").namespace,
    CalendarEvent = require("./CalendarEvent"),
    CalendarError = require("./CalendarError");

function invokeCallback(callback, args) {
    if (callback && typeof callback === "function") {
        callback(args);
    }
}

_self.create = function (properties) {
    var args = {},
        key;

    for (key in properties) {
        if (properties.hasOwnProperty(key)) {
            args[key] = properties[key];
        }
    }

    args.id = null;

    return new CalendarEvent(args);
};

_self.getCalendarFolders = function () {
    return window.webworks.execSync(_ID, "getCalendarFolders");
};

_self.getTimezones = function () {
    return window.webworks.execSync(_ID, "getTimezones");
};

_self.findEvents = function (onFindSuccess, onFindError, findOptions) {
    var callback,
        eventId;

    //if (!validateFindArguments(onFindSuccess, onFindError, findOptions)) {
      //  return;
    //}

    callback = function (args) {
        console.log(unescape(args.result));
        var result = JSON.parse(unescape(args.result)),
            events = result.events;//
            //realEvents = [];

        if (result._success) {/*
            if (events) {
                events.forEach(function (contact) {
                    contactUtils.populateContact(contact);
                    realContacts.push(new Contact(contact));
                });
            }*/
            onFindSuccess(events/*realContacts*/);
        } else {
            invokeCallback(onFindError, new CalendarError(result.code));
        }
    };

    eventId = "tempId.find"; //utils.guid();

    window.webworks.event.once(_ID, eventId, callback);

    return window.webworks.execAsync(_ID, "find", {
        "_eventId": eventId,
        "options": findOptions
    });
};

_self.CalendarEvent = CalendarEvent;
_self.CalendarError = CalendarError;

module.exports = _self;
