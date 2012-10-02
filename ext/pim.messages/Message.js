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
    MessageBody = require("./MessageBody"),
    MessageContact = require("./MessageContact"),
    MessageAttachment = require("./MessageAttachment");

Messsage = function (args) {
    var messageId = args.messageId,
        folderId = args.folderId,
        accountId = args.accountId,
        conversationId = args.conversationId,
        status = args.status,
        sender = new MessageContact(args.sender),
        recipients = MessageContact.getContacts(args.recipients),
        subject = args.subject,
        body = new MessageBody(args.body),
        attachments = MessageAttachment.getAttachments(args.attachments),
        attachementCount = args.attachementCount;

    return {
        'mimeType': args.mimeType,
        'inbound': args.inbound,
        'priority': args.priority,
        'followUp': args.followUp,
        'status': status,
        'deviceTimestamp': args.deviceTimestamp,
        'serverTimestamp': args.serverTimestamp,
        'sender': sender,
        'recipients': recipients,
        'subject': subject,
        'body': body.toJSON(),
        'attachments': attachments,
        'attachementCount': attachementCount,
        'save': function () {
        }, 
        'send': function (onSuccess, onError, args) {
/*            
            function messageBuilder () {
                
                var message = {
                   'eventId': _utils.guid(),
                   'sender': sender.toJSON(),
                   'recipients': recipients.toJSON(),
                   'priority': priority,
                   'followUp': followUp,
                   'status': status,
                   'subject': subject,
                   'body': body.toJSON()
                }
                
                return message;
            }
 */           
            
            //var message = messageBuilder(),
            var message = {
                'eventId': _utils.guid(),
                'subject': "New email",
                'recipient': "sgolod@rim.com",
                'body': "You got it!"
            },
                callback;


            callback = function (args) {
                var result = JSON.parse(unescape(args.result)),
                    newContact,
                    errorObj;

                if (result.code !== -1) {
                    if (onSuccess) {
                        onSuccess();
                    }
                } else {
                    if (onError && typeof(onError) === "function") {
                        onError();
                    }
                }
            };

            window.webworks.event.once(_ID, message.eventId, callback);
            return window.webworks.execAsync(_ID, "send", message);
        }
    };
};


Messsage.prototype.getAttachment = function (index) {
    try {
        return this.attachments[index];
    } catch (e) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }
};

Messsage.prototype.addAttachment = function (attachment) {
    this.attachments.push(new MessageAttachment(attachment));
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