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
var MessageContact,
    MessageError = require("./MessageError");

MessageContact = function (args) {
    if (!args) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    this.contactId = args.contactId;
    this.type = args.type;
    this.name = args.name;
    this.address = args.address;
    this.displayableName = args.displayableName;
};

MessageContact.getContacts = function (args) {
    var contacts = [];

    if (!args) {
        return null;
    }

    args.forEach(function (contact) {
        contacts.push(new MessageContact(contact));
    });
};

MessageContact.prototype.Type = {
    'To': 0,
    'Cc': 1,
    'Bcc': 2,
    'From': 3,
    'ReplyTo': 4
};

module.exports = MessageContact;