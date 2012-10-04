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
    _utils = require("./../../lib/utils"),
    MessageService,
    Message = require("./Message"),
    MessageAccount = require("./MessageAccount"),
    MessageError = require("./MessageError");

MessageService.create = function (account) {
    var message,
        defaultAccount;

    if (!account) {
        defaultAccount = window.webworks.execSync(_ID, "getDefaultAccount");
        message = window.webworks.execSync(_ID, "create", defaultAccount);
    }
    else if (account instanceof MessageAccount) {
        message = window.webworks.execSync(_ID, "create", account.getJSON());
    }
    else {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    return new Message(message);
};

MessageService.getMessageAccounts = function () {
    var obj = window.webworks.execSync(_ID, "getAccounts"),
        accounts = [];
        
    obj.forEach(function (account) {
        accounts.push(new MessageAccount(account));
    });

    return accounts;
};

MessageService.getDefaultMessageAccount = function () {
    var defaultAccount = window.webworks.execSync(_ID, "getDefaultAccount");

    return new MessageAccount(defaultAccount);
};

//TODO Implement the logic for find
MessageService.find = function (messageFields, findOptions, onSuccess, onError) {
};

_self.MessageService = MessageService;

module.exports = _self;
