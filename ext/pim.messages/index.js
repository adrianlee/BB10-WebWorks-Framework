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
var pimMessages = require("./PimMessageJNEXT").messages,
    _event = require("../../lib/event"),
    _utils = require("../../lib/utils"),
    _config = require("../../lib/config"),
    MessageError = require("./MessageError");


// function checkPermission(success, eventId) {
    // if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
        // _event.trigger(eventId, {
            // "result": escape(JSON.stringify({
                // "_success": false,
                // "code": MessageError.PERMISSION_DENIED_ERROR
            // }))
        // });
        // success();
        // return false;
    // }
// 
    // return true;
// }
// 
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
        var parsedArgs;

        if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            success(null);
            return;
        }

        parsedArgs = getParsedArgs(args);
        success(pimMessages.create(parsedArgs));
    },

    getAccounts: function (success, fail, args) {
        var result;
        console.log("Getting Accounts...");

        // if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            // success(null);
            // return;
        // }

result = pimMessages.getAccounts();
console.log("Result");
console.log(result);
        success(result);
    },

    // getDefaultAccount: function (success, fail, args) {
        // if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            // success(null);
            // return;
        // }
// 
        // success(pimMessages.getDefaultAccount());
    // },
// 
    // save: function (success, fail, args) {
        // //TODO To be implemented
    // },
// 
    send: function (success, fail, args) {
        try {
    console.log("Index.send");
    console.log(args);
        
        var parsedArgs;

        // if (!_utils.hasPermission(_config, "access_pimdomain_messages")) {
            // success(null);
            // return;
        // }

        parsedArgs = getParsedArgs(args);
    console.log(parsedArgs);
    console.log(pimMessages);
    console.log(success);
    //pimMessages.send(parsedArgs);
        //success(pimMessages.send(parsedArgs));
            console.log("Message Sent");

        }
        catch(e) {console.log("Error: Index.send " + e)}
    }
// 
    // find: function (success, fail, args) {
        // var findOptions = {},
            // key;
// 
        // for (key in args) {
            // if (args.hasOwnProperty(key)) {
                // findOptions[key] = JSON.parse(decodeURIComponent(args[key]));
            // }
        // }
// 
        // if (!checkPermission(success, findOptions["_eventId"])) {
            // return;
        // }
// 
        // pimMessages.find(findOptions);
        // success();
    // },
};

