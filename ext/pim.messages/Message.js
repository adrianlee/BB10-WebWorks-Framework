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
    Messsage,
    MessageError = require("./MessageError"),
    MessageAccount = require("./MessageAccount"),
    MessageAddress = require("./MessageAddress"),
    MessageAttachment = require("./MessageAttachment");

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

Messsage = function (args) {
    var that = this;

    this.account = new MessageAccount(args.account);
    this.folder = args.folder;
    this.priority = args.priority;
    this.flagged = args.flagged;
    this.followup = args.followup;
    this.status = args.status;
    this.read = args.read;
    this.addresses = MessageAddress.getArrayOfObjectsFromArrayOfJSONs(args.addresses);
    this.attachments = MessageAttachment.getArrayOfObjectsFromArrayOfJSONs(args.attachments);
    this.subject = args.subject;
    this.body = args.body;

    this.getId = function () {
        return args.id;
    };

    function getJSON() {
        return {
            'id': that.getId(),
            'account': that.account.getJSON(),
            'folder': that.folder,
            'priority': that.priority,
            'flagged': that.flagged,
            'followup': that.followup,
            'status': that.status,
            'read': that.read,
            'addresses': MessageAddress.getArrayOfJSONsFromArrayOfObjects(that.addresses),
            'attachments': MessageAttachment.getArrayOfJSONsFromArrayOfObjects(that.attachments),
            'subject': that.subject,
            'body': that.body
        };
    }

    this.save = function (onSuccess, onError) {
        var request;

        request = getJSON();

        if ((onSuccess && typeof onSuccess === "function") || (onError && typeof onError === "function")) {
            request.eventId = _utils.guid();
            setCallbackForOnce(request.eventId, onSuccess, onError);
        }

        return window.webworks.execAsync(_ID, "saveMessage", request);
    };

    this.send = function (onSuccess, onError) {
        var request;

        request = getJSON();

        if ((onSuccess && typeof onSuccess === "function") || (onError && typeof onError === "function")) {
            request.eventId = _utils.guid();
            setCallbackForOnce(request.eventId, onSuccess, onError);
        }

        return window.webworks.execAsync(_ID, "sendMessage", request);
    };
    //TODO To be implemented
    this.file = function (newFolderName, onSuccess, onError) {
    };
    this.addAttachment = function (name, mimeType, filePath) {
        var props = {
            'id': _utils.guid(),
            'name': name,
            'mimeType': mimeType,
            'filePath': filePath
        };

        that.attachments.push(new MessageAttachment(props));
    };
    this.removeAttachment = function (index) {
        if (index && typeof index === "number" && index > 0 && index < that.attachments.length) {
            that.attachments.splice(index, 1);
        }
    };
};

Messsage.MessageStatus = function () {
    window.webworks.defineReadOnlyField(this, "read", 0);
    window.webworks.defineReadOnlyField(this, "draft", 1);
    window.webworks.defineReadOnlyField(this, "field", 2);
    window.webworks.defineReadOnlyField(this, "sent", 3);
    window.webworks.defineReadOnlyField(this, "deffered", 4);
    window.webworks.defineReadOnlyField(this, "broadcast", 5);
    window.webworks.defineReadOnlyField(this, "now", 6);
};

Messsage.PriorityType = function () {
    window.webworks.defineReadOnlyField(this, "Low", 0);
    window.webworks.defineReadOnlyField(this, "Normal", 1);
    window.webworks.defineReadOnlyField(this, "Hight", 2);
};

module.exports = Messsage;