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
var MesssageAccount,
    EnterpriseType,
    FolderType,
    MessageError = require("./MessageError");

MesssageAccount = function (args) {
    if (!args) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    return {
        'name': args.name,
        'enterpriseType': args.enterpriseType,
        'social': args.social,
        'getMessageFolderInfo': function () {
            return args.folders;
        }
    };
};

EnterpriseType = function () {
    window.webworks.defineReadOnlyField(this, "EnterpriseUnknown", -1);
    window.webworks.defineReadOnlyField(this, "NonEnterprise", 0);
    window.webworks.defineReadOnlyField(this, "Enterprise", 1);
};

FolderType = function (){
    window.webworks.defineReadOnlyField(this, "Unknown", 0);
    window.webworks.defineReadOnlyField(this, "Inbox", 1);
    window.webworks.defineReadOnlyField(this, "Outbox", 2);
    window.webworks.defineReadOnlyField(this, "Drafts", 3);
    window.webworks.defineReadOnlyField(this, "Sent", 4);
    window.webworks.defineReadOnlyField(this, "Trash", 5);
    window.webworks.defineReadOnlyField(this, "Other", 6);
};

MesssageAccount.EnterpriseType = EnterpriseType;
MesssageAccount.FolderType = FolderType;

module.exports = MesssageAccount;