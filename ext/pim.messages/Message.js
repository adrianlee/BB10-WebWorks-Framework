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
var Messsage,
    MessageError = require("./MessageError"),
    MessageBody = require("./MessageBody"),
    MessageContact = require("./MessageContact"),
    MessageAttachment = require("./MessageAttachment");

Messsage = function (args) {
    if (!args) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    this.messageId = args.messageId;
    this.folderId = args.folderId;
    this.accountId = args.accountId;
    this.conversationId = args.conversationId;
    this.mimeType = args.mimeType;
    this.inbound = args.inbound;
    this.priority = args.priority;
    this.deviceTimestamp = args.deviceTimestamp;
    this.serverTimestamp = args.serverTimestamp;
    this.sender = new MessageContact(args.sender);
    this.recipients = MessageContact.getContacts(args.recipients);
    this.subject = args.subject;
    this.body = new MessageBody(args.body);
    this.attachments = MessageAttachment.getAttachments(args.attachments);
    this.recipientCount = args.recipientCount;
    this.attachementCount = args.attachementCount;
    this.followUp = args.followUp;
    this.status = args.status;
};

Messsage.prototype.MessageStatus = {
    'read': 0,
    'draft': 1,
    'field': 2,
    'sent': 3,
    'deffered': 4,
    'broadcast': 5,
    'now': 6
};

Messsage.prototype.Priority = {
    'Low': 0,
    'Normal': 1,
    'Hight': 2,
};

module.exports = Messsage;