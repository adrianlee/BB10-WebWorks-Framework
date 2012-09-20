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

var CalendarFolder = function (properties) {
    this.accountId = properties && properties.accountId ? properties.accountId : "";
    this.color = properties && properties.color ? properties.color : "";
    this.id = properties && properties.id ? properties.id : "";
    this.name = properties && properties.name ? properties.name : "";
    this.ownerEmail = properties && properties.ownerEmail ? properties.ownerEmail : "";
    this.readonly = properties && properties.readonly ? properties.readonly : false;
    this.type = properties && properties.type ? properties.type : -1; // TODO
    this.visible = properties && properties.visible !== undefined ? properties.visible : true;
    this.supportsParticipants = properties && properties.supportsParticipants !== undefined ? properties.supportsParticipants : false;
    this.supportsInfiniteRecurrence = properties && properties.supportsInfiniteRecurrence !== undefined ? properties.supportsInfiniteRecurrence : false;
    this.supportsMessaging = properties && properties.supportsMessaging !== undefined ? properties.supportsMessaging : false;
    this.default = properties && properties.default !== undefined ? properties.default : false;
    this.enterprise = properties && properties.enterprise !== undefined ? properties.enterprise : false;
};

module.exports = CalendarFolder;
