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

 var cal,
     CalendarEvent,
     CalendarFolder,
     CalendarFindOptions,
     CalendarEventFilter,
     CalendarError;
     // Attendee
     // CalendarRepeatRule

function testReadOnly(object, property) {
    var oldValue = object[property];
    object[property] = "test different";
    expect(object[property]).toBe(oldValue);
}

beforeEach(function () {
    cal = blackberry.pim.calendar;
    CalendarEvent = cal.CalendarEvent;
    CalendarFolder = cal.CalendarFolder;
    CalendarFindOptions = cal.CalendarFindOptions;
    CalendarEventFilter = cal.CalendarEventFilter;
    CalendarError = cal.CalendarError;
});

describe("blackberry.pim.calendar", function () {
    describe("Object and constants definitions", function () {
        it('blackberry.pim.calendar should exist', function () {
            expect(cal).toBeDefined();
        });

        it('blackberry.pim.contacts child objects should exist', function () {
            expect(CalendarEvent).toBeDefined();
            expect(CalendarFolder).toBeDefined();
            expect(CalendarFindOptions).toBeDefined();
            expect(CalendarEventFilter).toBeDefined();
            expect(CalendarError).toBeDefined();
            // expect(Attendee).toBeDefined();
            // expect(CalendarRepeatRule).toBeDefined();
        });

        it('blackberry.pim.contacts.CalendarFindOptions constants should exist', function () {
            expect(CalendarFindOptions.SORT_FIELD_GUID).toBeDefined();
            expect(CalendarFindOptions.SORT_FIELD_SUMMARY).toBeDefined();
            expect(CalendarFindOptions.SORT_FIELD_LOCATION).toBeDefined();
            expect(CalendarFindOptions.SORT_FIELD_START).toBeDefined();
            expect(CalendarFindOptions.SORT_FIELD_END).toBeDefined();
            expect(CalendarFindOptions.DETAIL_MONTHLY).toBeDefined();
            expect(CalendarFindOptions.DETAIL_WEEKLY).toBeDefined();
            expect(CalendarFindOptions.DETAIL_FULL).toBeDefined();
            expect(CalendarFindOptions.DETAIL_AGENDA).toBeDefined();
        });

        it('blackberry.pim.contacts.CalendarFindOptions constants should be read-only', function () {
            testReadOnly(CalendarFindOptions, "SORT_FIELD_GUID");
            testReadOnly(CalendarFindOptions, "SORT_FIELD_SUMMARY");
            testReadOnly(CalendarFindOptions, "SORT_FIELD_LOCATION");
            testReadOnly(CalendarFindOptions, "SORT_FIELD_START");
            testReadOnly(CalendarFindOptions, "SORT_FIELD_END");
            testReadOnly(CalendarFindOptions, "DETAIL_MONTHLY");
            testReadOnly(CalendarFindOptions, "DETAIL_WEEKLY");
            testReadOnly(CalendarFindOptions, "DETAIL_FULL");
            testReadOnly(CalendarFindOptions, "DETAIL_AGENDA");
        });

        it('blackberry.pim.contacts.CalendarError constants should exist', function () {
            expect(CalendarError.UNKNOWN_ERROR).toBeDefined();
            expect(CalendarError.INVALID_ARGUMENT_ERROR).toBeDefined();
            expect(CalendarError.TIMEOUT_ERROR).toBeDefined();
            expect(CalendarError.PENDING_OPERATION_ERROR).toBeDefined();
            expect(CalendarError.IO_ERROR).toBeDefined();
            expect(CalendarError.NOT_SUPPORTED_ERROR).toBeDefined();
            expect(CalendarError.PERMISSION_DENIED_ERROR).toBeDefined();
        });

        it('blackberry.pim.contacts.CalendarError constants should be read-only', function () {
            testReadOnly(CalendarError, "UNKNOWN_ERROR");
            testReadOnly(CalendarError, "INVALID_ARGUMENT_ERROR");
            testReadOnly(CalendarError, "TIMEOUT_ERROR");
            testReadOnly(CalendarError, "PENDING_OPERATION_ERROR");
            testReadOnly(CalendarError, "IO_ERROR");
            testReadOnly(CalendarError, "NOT_SUPPORTED_ERROR");
            testReadOnly(CalendarError, "PERMISSION_DENIED_ERROR");
        });
    });
});