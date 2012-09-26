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

var CalendarFindOptions = function (filter, sort, detail, limit) {
    this.filter = filter || null;
    this.sort = sort || null;
    this.detail = detail || -1; // -1 invalid
    this.limit = limit || -1; // -1 for returning all results
};

Object.defineProperty(CalendarFindOptions, "SORT_FIELD_GUID", { "value": 1 });
Object.defineProperty(CalendarFindOptions, "SORT_FIELD_SUMMARY", { "value": 2 });
Object.defineProperty(CalendarFindOptions, "SORT_FIELD_LOCATION", { "value": 3 });
Object.defineProperty(CalendarFindOptions, "SORT_FIELD_START", { "value": 4 });
Object.defineProperty(CalendarFindOptions, "SORT_FIELD_END", { "value": 5 });

Object.defineProperty(CalendarFindOptions, "DETAIL_MONTHLY", { "value": 1 });
Object.defineProperty(CalendarFindOptions, "DETAIL_WEEKLY", { "value": 2 });
Object.defineProperty(CalendarFindOptions, "DETAIL_FULL", { "value": 3 });
Object.defineProperty(CalendarFindOptions, "DETAIL_AGENDA", { "value": 4 });

module.exports = CalendarFindOptions;