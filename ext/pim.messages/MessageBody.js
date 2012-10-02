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
var MessageBody,
    MessageError = require("./MessageError");

MessageBody = function (args) {
    if (!args) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    this.type = args.type;
    this.data = args.data;
};

MessageBody.prototype.Type = {
    'PlainTest': 0,
    'Html': 1
};

MessageBody.prototype.toJSON = function () {
    return {
        'type': this.type,
        'data': this.data
    };
};

module.exports = MessageBody;