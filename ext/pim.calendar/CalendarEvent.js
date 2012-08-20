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
var CalendarEvent,
    _ID = require("./manifest.json").namespace, // normally 2nd-level require does not work in client side, but manifest has already been required in client.js, so this is ok
    utils = require("./../../lib/utils");

/**
 * Contains information about a single calendar event.
 * @constructor
 * @param properties
 */
CalendarEvent = function (properties) {
    this.description = properties && properties.description ? properties.description : "";
    this.location = properties && properties.location ? properties.location : "";
    this.summary = properties && properties.summary ? properties.summary : "";
    this.start = properties && properties.start ? properties.start : null;
    this.end = properties && properties.end ? properties.end : null;
    this.status = properties && properties.status ? properties.status : "";
    // TODO transparency?
    this.recurrence = properties && properties.recurrence ? properties.recurrence : null;
    this.reminder = properties && properties.reminder ? properties.reminder : "";    

    var privateId = properties && properties.id ? properties.id : null;
    Object.defineProperty(this, "id", { "value": privateId });
};

CalendarEvent.prototype.save = function (onSaveSuccess, onSaveError) {
    var args = {},
        key,
        successCallback = onSaveSuccess,
        errorCallback = onSaveError,
        saveCallback;

    for (key in this) {
        if (this.hasOwnProperty(key) && this[key] !== null) {
            args[key] = this[key];
        }
    }
/*
    if (args.nickname) {
        args.name = args.name || {};
        args.name.nickname = args.nickname;
    }

    if (args.displayName) {
        args.name = args.name || {};
        args.name.displayName = args.displayName;
    }

    if (args.birthday && args.birthday.toDateString) {
        args.birthday = args.birthday.toDateString();
    }

    if (args.anniversary && args.anniversary.toDateString) {
        args.anniversary = args.anniversary.toDateString();
    }
*/
    if (this.id === null || this.id === "" || window.isNaN(this.id)) {
        args.id = this.id;
    } else {
        args.id = window.parseInt(this.id);
    }

    args._eventId = utils.guid();

    saveCallback = function (args) {
        var result = JSON.parse(unescape(args.result)),
            newContact,
            errorObj;

        if (result._success) {
            if (successCallback) {
                result.id = result.id.toString();
                //contactUtils.populateContact(result);

                //newContact = new CalendarEvent(result);
                successCallback(result.id);
            }
        } else {
            if (errorCallback) {
                //errorObj = new ContactError(result.code);
                errorCallback(errorObj);
            }
        }
    };

    window.webworks.event.once(_ID, args._eventId, saveCallback);
    return window.webworks.execAsync(_ID, "save", args);
};

CalendarEvent.prototype.remove = function (onRemoveSuccess, onRemoveError) {
    var args = {},
        successCallback = onRemoveSuccess,
        errorCallback = onRemoveError,
        removeCallback;

    args.contactId = window.parseInt(this.id);
    args._eventId = utils.guid();

    removeCallback = function (args) {
        var result = JSON.parse(unescape(args.result)),
            errorObj;

        if (result._success) {
            if (successCallback) {
                successCallback();
            }
        } else {
            if (errorCallback) {
                errorObj = new ContactError(result.code);
                errorCallback(errorObj);
            }
        }
    };

    window.webworks.event.once(_ID, args._eventId, removeCallback);
    return window.webworks.execAsync(_ID, "remove", args);
};

CalendarEvent.prototype.clone = function () {
    var calEvent = new CalendarEvent({"id" : -1 * this.id}),
        key;

    for (key in this) {
        if (this.hasOwnProperty(key)) {
            calEvent[key] = this[key];
        }
    }

    return calEvent;
};

module.exports = CalendarEvent;
