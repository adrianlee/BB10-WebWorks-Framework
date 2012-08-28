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
    utils = require("./../../lib/utils"),
    CalendarError = require("./CalendarError");

/**
 * Contains information about a single calendar event.
 * @constructor
 * @param properties
 */
CalendarEvent = function (properties) {
    var privateId,
        privateAccountId,
        privateParentId;

    this.allDay = properties && properties.allDay !== undefined ? properties.allDay : null;
    this.attendees = properties && properties.attendees !== undefined ? properties.attendees : [];
    this.birthday = properties && properties.birthday !== undefined ? properties.birthday : null;
    this.description = properties && properties.description !== undefined ? properties.description : "";
    this.end = properties && properties.end !== undefined ? new Date(parseInt(properties.end, 10)) : null;
    // TODO folderId?
    this.location = properties && properties.location !== undefined ? properties.location : "";
    this.reminder = properties && properties.reminder !== undefined ? properties.reminder : "";
    this.recurrence = properties && properties.recurrence !== undefined ? properties.recurrence : null;
    this.sensitivity = properties && properties.sensitivity !== undefined ? properties.sensitivity : null;
    this.status = properties && properties.status !== undefined ? properties.status : "";
    this.start = properties && properties.start !== undefined ? new Date(parseInt(properties.start, 10)) : null;
    this.summary = properties && properties.summary !== undefined ? properties.summary : "";
    this.timezone = properties && properties.timezone !== undefined ? properties.timezone : "";
    this.transparency = properties && properties.transparency !== undefined ? properties.transparency : "";
    this.folder = properties && properties.folder !== undefined ? properties.folder : null;

    privateId = properties && properties.id !== undefined ? properties.id : null;
    privateAccountId = properties && properties.accountId !== undefined ? properties.accountId : null;
    privateParentId = properties && properties.parentId !== undefined ? properties.parentId : null;

    Object.defineProperty(this, "id", { "value": privateId });
    Object.defineProperty(this, "accountId", { "value": privateAccountId });
    Object.defineProperty(this, "parentId", { "value": privateParentId });

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

    if (args.start) {
        console.log(args.start.toDateString());
        args.start = args.start.toDateString();
    }

    if (args.end) {
        console.log(args.end.toDateString());
        args.end = args.end.toDateString();
    }

    if (this.id === null || this.id === "" || window.isNaN(this.id)) {
        args.id = this.id;
    } else {
        args.id = window.parseInt(this.id);
    }

    if (this.accountId === null || this.accountId === "" || window.isNaN(this.accountId)) {
        args.accountId = this.accountId;
    } else {
        args.accountId = window.parseInt(this.accountId);
    }

    if (this.parentId === null || this.parentId === "" || window.isNaN(this.parentId)) {
        args.parentId = this.parentId;
    } else {
        args.parentId = window.parseInt(this.parentId);
    }

    args._eventId = utils.guid();

    saveCallback = function (args) {
        var result = JSON.parse(unescape(args.result)),
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
                errorObj = new CalendarError(result.code);
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

Object.defineProperty(CalendarEvent, "NORMAL", {"value": 0});
Object.defineProperty(CalendarEvent, "PERSONAL", {"value": 1});
Object.defineProperty(CalendarEvent, "PRIVATE", {"value": 2});
Object.defineProperty(CalendarEvent, "CONFIDENTIAL", {"value": 3});

module.exports = CalendarEvent;
