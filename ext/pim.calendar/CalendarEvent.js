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
    CalendarError = require("./CalendarError"),
    CalendarFolder = require("./CalendarFolder");

/**
 * Contains information about a single calendar event.
 * @constructor
 * @param properties
 */
CalendarEvent = function (properties) {
    var privateId,
        privateParentId,
        privateFolder;

    this.allDay = properties && properties.allDay !== undefined ? properties.allDay : null;
    this.attendees = properties && properties.attendees !== undefined ? properties.attendees : [];
    this.birthday = properties && properties.birthday !== undefined ? properties.birthday : null;
    this.description = properties && properties.description !== undefined ? properties.description : "";
    this.end = properties && properties.end !== undefined ? (properties.end instanceof Date ? properties.end : new Date(parseInt(properties.end, 10))) : null;
    this.location = properties && properties.location !== undefined ? properties.location : "";
    this.reminder = properties && properties.reminder !== undefined ? properties.reminder : "";
    this.recurrence = properties && properties.recurrence !== undefined ? properties.recurrence : null;
    this.sensitivity = properties && properties.sensitivity !== undefined ? properties.sensitivity : null;
    this.status = properties && properties.status !== undefined ? properties.status : "";
    this.start = properties && properties.start !== undefined ? (properties.start instanceof Date ? properties.start : new Date(parseInt(properties.start, 10))) : null;
    this.summary = properties && properties.summary !== undefined ? properties.summary : "";
    this.timezone = properties && properties.timezone !== undefined ? properties.timezone : "";
    this.transparency = properties && properties.transparency !== undefined ? properties.transparency : "";
    this.originalStartTime = properties && properties.originalStartTime ? properties.originalStartTime : null;

    privateId = properties && properties.id !== undefined ? properties.id : null;
    privateParentId = properties && properties.parentId !== undefined ? properties.parentId : null;
    privateFolder = properties && properties.folder !== undefined ? new CalendarFolder(properties.folder) : null;

    Object.defineProperty(this, "id", { "value": privateId });
    Object.defineProperty(this, "parentId", { "value": privateParentId });
    Object.defineProperty(this, "folder", {"value": privateFolder });
};

CalendarEvent.prototype.save = function (onSaveSuccess, onSaveError) {
    var args = {},
        key,
        innerKey,
        successCallback = onSaveSuccess,
        errorCallback = onSaveError,
        saveCallback;

    for (key in this) {
        if (this.hasOwnProperty(key) && this[key] !== null) {
            if (Object.prototype.toString.call(this[key]) === "[object Object]") {
                args[key] = {};

                for (innerKey in this[key]) {
                    if (this[key][innerKey] !== null) {
                        args[key][innerKey] = this[key][innerKey];
                    }
                }
            } else {
                args[key] = this[key];
            }
        }
    }

    if (args.start) {
        console.log(args.start.toISOString());
        args.start = args.start.toISOString();
    }

    if (args.end) {
        console.log(args.end.toISOString());
        args.end = args.end.toISOString();
    }

    if (args.attendees) {
        for (key in args.attendees) {
            if (args.attendees[key].contactId && !window.isNaN(args.attendees[key].contactId)) {
                args.attendees[key].contactId = window.parseInt(args.attendees[key].contactId);
            }

            if (args.attendees[key].id && !window.isNaN(args.attendees[key].id)) {
                args.attendees[key].id = window.parseInt(args.attendees[key].id);
            }
        }
    }

    if (this.id && !window.isNaN(this.id)) {
        args.id = window.parseInt(this.id);
    }

    if (this.folder && this.folder.accountId && !window.isNaN(this.folder.accountId)) {
        args.accountId = window.parseInt(this.folder.accountId);
    }

    if (this.folder && this.folder.id && !window.isNaN(this.folder.id)) {
        args.folderId = window.parseInt(this.folder.id);
    }

    if (this.parentId && !window.isNaN(this.parentId)) {
        args.parentId = window.parseInt(this.parentId);
    }

    args._eventId = utils.guid();

    console.log(args);

    saveCallback = function (args) {
        var result = JSON.parse(unescape(args.result)),
            errorObj;

        console.log("Save result!");
        console.log(result);

        if (result._success) {
            if (successCallback) {
                result.id = result.id.toString();
                //contactUtils.populateContact(result);
                successCallback(new CalendarEvent(result.event));
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

    args.accountId = window.parseInt(this.accountId);
    args.calEventId = window.parseInt(this.id);
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

CalendarEvent.prototype.createExceptionEvent = function (originalStartTime) {
    var properties = {},
        key,
        exceptionEvent;

    for (key in this) {
        if (this.hasOwnProperty(key) && key !== "recurrence") {
            properties[key] = this[key];
        }
    }

    properties.id = null;
    properties.parentId = this.id;
    properties.originalStartTime = originalStartTime;

    exceptionEvent = new CalendarEvent(properties);

    if (this.recurrence && this.recurrence.exceptionDates && this.recurrence.exceptionDates.indexOf(originalStartTime) === -1) {
        this.recurrence.exceptionDates.push(originalStartTime);
    }

    return exceptionEvent;
};

Object.defineProperty(CalendarEvent, "NORMAL", {"value": 0});
Object.defineProperty(CalendarEvent, "PERSONAL", {"value": 1});
Object.defineProperty(CalendarEvent, "PRIVATE", {"value": 2});
Object.defineProperty(CalendarEvent, "CONFIDENTIAL", {"value": 3});

module.exports = CalendarEvent;
