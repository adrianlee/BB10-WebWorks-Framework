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
var MesssageFolder,
    Type;

MesssageFolder = function (args) {
    this.name = args.name;
    this.type = args.type;
};

MesssageFolder.getFoldersArray = function (folders) {
    var foldersArray = [];

    if (folders) {
        folders.forEach(function (folder) {
            foldersArray.push(new MesssageFolder(folder));
        });
    }

    return foldersArray;
};

Type = function () {
    Object.defineProperty(this, "Unknown", {"value": 0});
    Object.defineProperty(this, "Inbox", {"value": 1});
    Object.defineProperty(this, "Outbox", {"value": 2});
    Object.defineProperty(this, "Drafts", {"value": 3});
    Object.defineProperty(this, "Sent", {"value": 4});
    Object.defineProperty(this, "Trash", {"value": 5});
    Object.defineProperty(this, "Other", {"value": 6});
};

MesssageFolder.Type = Type;

module.exports = MesssageFolder;