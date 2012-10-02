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
var CalendarRepeatRule = require("./CalendarRepeatRule");

module.exports = {
    isDate: function (obj) {
        return Object.prototype.toString.call(obj) === "[object Date]";
    },
    isObject: function (obj) {
		return Object.prototype.toString.call(obj) === "[object Object]";
    },
    populateEvent: function (props) {
        if (props.recurrence) {
            props.recurrence = new CalendarRepeatRule(props.recurrence);
        }

        return props;
    },
    preprocessDate: function (date) {
        var tmpDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        tmpDate.setMilliseconds(0);
        return tmpDate.toISOString();
    }
};