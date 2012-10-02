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
    _ID = require("./manifest.json").namespace;
    _utils = require("./../../lib/utils"),
    Message = require("./Message"),
    // MessageAccount = require("./MessageAccount"),
    // MessageError = require("./MessageError"),
    MessageService = {};
// 
// function invokeCallback(callback, args) {
    // if (callback && typeof callback === "function") {
        // callback(args);
    // }
// }
// 
// function validateFindArguments(findOptions, onFindSuccess, onFindError) {
    // var error = false;
// 
    // //TODO Add logic.
// 
// 
    // if (error) {
        // invokeCallback(onFindError, new MessageError(MessageError.INVALID_ARGUMENT_ERROR));
    // }
// 
    // return !error;
// }
// 
MessageService.create = function (args) {
    var message;

    // if (!args.accoutnId) {
        // new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    // }

    //-->>message = window.webworks.execSync(_ID, "create", args);
    message = new Message(args);
    console.log("Client.create Message");
    //->>return new Message(message);
    return message;
};
// 
MessageService.getAccounts = function (args) {
    var obj = window.webworks.execSync(_ID, "getAccounts"),
        accounts = [];
        
        console.log("Accounts Client.js")
        console.log(obj)

    // obj.forEach(function (account) {
        // accounts.push(new MessageAccount(account));
    // });

    return accounts;
};
// 
// MessageService.getDefaultAccount = function () {
    // var defaultAccount = window.webworks.execSync(_ID, "getDefaultAccount");
// 
    // return new MessageAccount(defaultAccount);
// };
// 
// MessageService.find = function (messageFields, findOptions, onFindSuccess, onFindError) {
    // var callback,
        // eventId;
// 
    // if (!validateFindArguments(findOptions, onFindSuccess, onFindError)) {
        // return;
    // }
    // //TODO Implement the logic
// 
    // eventId = _utils.guid();
// 
    // window.webworks.event.once(_ID, eventId, callback);
// 
    // return window.webworks.execAsync(_ID, "find", {
        // "_eventId": eventId,
        // "fields": messageFields,
        // "options": findOptions
    // });
// };
// 
_self.MessageService = MessageService;

module.exports = _self;
