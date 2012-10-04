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
var _ID = require("./manifest.json").namespace,
    _utils = require("./../../lib/utils"),
    MesssageAttachment,
    MessageFolder = require("./MessageFolder");

function setCallbackForOnce(eventId, onSuccess, onError) {
    var callback = function (errorMsg) {
        if (!errorMsg) {
            if (onSuccess && typeof onSuccess === "function") {
                onSuccess();
            }
        } else if (onError && typeof onError === "function") {
            onError();
        }
    };

    if (!window.webworks.event.isOn(eventId)) {
        window.webworks.event.once(_ID, eventId, callback);
    }
}

MesssageAttachment = function (args) {
    var that = this;

    this.name = args.name;
    this.mimeType = args.mimeType;

    this.getJSON = function () {
        return {
            'id': args.id,
            'filePath': args.filePath,
            'name': that.name,
            'mimeType': that.mimeType
        };
    };

    this.save = function (filePath, onSuccess, onError) {
        var request;

        args.filePath = filePath;
        request = that.getJSON();

        if ((onSuccess && typeof onSuccess === "function") || (onError && typeof onError === "function")) {
            request.eventId = _utils.guid();
            setCallbackForOnce(request.eventId, onSuccess, onError);
        }

        return window.webworks.execAsync(_ID, "saveAttachment", request);
    };
};

MesssageAttachment.getArrayOfObjectsFromArrayOfJSONs = function (attachments) {
    var objectsArray = [];

    if (attachments) {
        attachments.forEach(function (attachment) {
            objectsArray.push(new MessageFolder(attachment));
        });
    }

    return objectsArray;
};

MesssageAttachment.getArrayOfJSONsFromArrayOfObjects = function (attachments) {
    var jsonsArray = [];

    if (attachments) {
        attachments.forEach(function (attachment) {
            jsonsArray.push(attachment.getJSON());
        });
    }

    return jsonsArray;
};

module.exports = MesssageAttachment;