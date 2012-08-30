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
    utils = require("./../../lib/utils"),
    calendarUtils = require("./calendarUtils"),
    CalendarEvent = require("./CalendarEvent"),
    CalendarError = require("./CalendarError"),
    CalendarFindOptions = require("./CalendarFindOptions"),
    CalendarFolder = require("./CalendarFolder");

function invokeCallback(callback, args) {
    if (callback && typeof callback === "function") {
        callback(args);
    }
}

function validateFindArguments(onFindSuccess, onFindError, findOptions) {
    var error = false;

    if (!onFindSuccess || typeof onFindSuccess !== "function" || !findOptions || typeof findOptions.limit !== "number" ||
        !findOptions.filter || !findOptions.filter.prefix || typeof findOptions.filter.prefix !== "string") {
        error = true;
    } else {
        switch (findOptions.detail) {
        case CalendarFindOptions.DETAIL_MONTHLY:
        case CalendarFindOptions.DETAIL_WEEKLY:
        case CalendarFindOptions.DETAIL_FULL:
        case CalendarFindOptions.DETAIL_AGENDA:
            break;
        default:
            error = true;
        }

        if (!error && findOptions.sort && findOptions.sort.forEach) {
            findOptions.sort.forEach(function (s) {
                switch (s.fieldName) {
                case CalendarFindOptions.SORT_FIELD_GUID:
                case CalendarFindOptions.SORT_FIELD_SUMMARY:
                case CalendarFindOptions.SORT_FIELD_LOCATION:
                case CalendarFindOptions.SORT_FIELD_START:
                case CalendarFindOptions.SORT_FIELD_END:
                    break;
                default:
                    error = true;
                }

                if (s.desc === undefined || typeof s.desc !== "boolean") {
                    error = true;
                }
            });
        }

        error = error ? error : findOptions.filter.start && !calendarUtils.isDate(findOptions.filter.start);
        error = error ? error : findOptions.filter.end && !calendarUtils.isDate(findOptions.filter.end);

        if (!error && findOptions.filter.folders) {
            findOptions.filter.folders.forEach(function (folder) {
                if (!folder || !folder.id || isNaN(parseInt(folder.id, 10)) || !folder.accountId || isNaN(folder.accountId, 10)) {
                    error = true;
                }
            });
        }
    }

    if (error) {
        invokeCallback(onFindError, new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
    }

    return !error;
}

function getFolderKeyList(folders) {
    var folderKeys = [];

    if (folders && folders.forEach) {
        folders.forEach(function (folder) {
            folderKeys.push({
                "id": parseInt(folder.id, 10),
                "accountId": parseInt(folder.accountId, 10)
            });
        });
    }

    return folderKeys;
}

_self.create = function (properties, folder) {
    var args = {},
        key;

    for (key in properties) {
        if (properties.hasOwnProperty(key)) {
            args[key] = properties[key];
        }
    }

    args["folder"] = folder;

    args.id = null;

    return new CalendarEvent(args);
};

_self.getCalendarFolders = function () {
    var obj = window.webworks.execSync(_ID, "getCalendarFolders"),
        folders = [];

    obj.forEach(function (props) {
        folders.push(new CalendarFolder(props));
    });

    return folders;
};

_self.getTimezones = function () {
    return window.webworks.execSync(_ID, "getTimezones");
};

_self.findEvents = function (onFindSuccess, onFindError, findOptions) {
    var callback,
        eventId;

    if (!validateFindArguments(onFindSuccess, onFindError, findOptions)) {
        return;
    }

    findOptions.filter.folders = getFolderKeyList(findOptions.filter.folders);

    callback = function (args) {
        console.log(unescape(args.result));
        var result = JSON.parse(unescape(args.result)),
            events = result.events,
            realEvents = [];

        if (result._success) {
            if (events) {
                events.forEach(function (event) {
                    // contactUtils.populateContact(contact);
                    event["folder"] = result.folders[event.accountId + "-" + event.folderId];
                    realEvents.push(new CalendarEvent(event));
                });
            }
            console.log(events);
            onFindSuccess(realEvents);
        } else {
            invokeCallback(onFindError, new CalendarError(result.code));
        }
    };

    eventId = utils.guid();

    window.webworks.event.once(_ID, eventId, callback);

    return window.webworks.execAsync(_ID, "find", {
        "_eventId": eventId,
        "options": findOptions
    });
};

_self.CalendarEvent = CalendarEvent;
_self.CalendarError = CalendarError;
_self.CalendarFindOptions = CalendarFindOptions;
_self.CalendarFolder = CalendarFolder;
_self.CalendarEventFilter = require("./CalendarEventFilter");

module.exports = _self;
