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
    CalendarError,
    calEvent;
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

    describe("Child objects creation", function () {
        it('Can create blackberry.pim.calendar.CalendarEventFilter object', function () {
            var start = new Date(),
                end = new Date(),
                filter = new CalendarEventFilter("abc", null, start, end, true);

            expect(filter).toBeDefined();
            expect(filter.prefix).toBe("abc");
            expect(filter.folders).toBe(null);
            expect(filter.start).toBe(start);
            expect(filter.end).toBe(end);
            expect(filter.expandRecurring).toBe(true);
        });

        it('Can create blackberry.pim.calendar.CalendarFindOptions object', function () {
            var filter = new CalendarEventFilter("abc", null, new Date(), new Date(), true),
                sort = [{
                    "fieldName": CalendarFindOptions.SORT_FIELD_START,
                    "desc": false
                }],
                detail = CalendarFindOptions.DETAIL_FULL,
                limit = 5,
                options = new CalendarFindOptions(filter, sort, detail, limit);

            expect(options).toBeDefined();
            expect(options.filter.prefix).toBe("abc");
            expect(options.filter.folders).toBe(null);
            expect(options.filter.expandRecurring).toBe(true);
            expect(options.sort.length).toBe(1);
            expect(options.sort).toContain({
                "fieldName": CalendarFindOptions.SORT_FIELD_START,
                "desc": false
            });
            expect(options.detail).toBe(detail);
            expect(options.limit).toBe(5);
        });
    });

    describe("blackberry.pim.calendar.getTimezones", function () {
        it('returns the list of all supported timezones', function () {
            var timezones = cal.getTimezones();

            expect(timezones).toBeDefined();
            expect(timezones).toContain("America/New_York");
            expect(timezones).toContain("America/Los_Angeles");
        });
    });

    describe("blackberry.pim.calendar.getCalendarFolders", function () {
        it('returns at least the Home calendar', function () {
            var folders = cal.getCalendarFolders(),
                homeFolderFound;

            expect(folders).toBeDefined();
            expect(folders.length).toBeGreaterThan(0);

            homeFolderFound = folders.reduce(function (found, f, index) {
                return found || f.name === "Home";
            }, false);

            expect(homeFolderFound).toBeTruthy();
        });
    });

    describe("blackberry.pim.calendar.createEvents", function () {
        //var calEvent;

        it('should return a CalendarEvent object', function () {
            // TODO have to fix client.js to name it createEvents
            var start = new Date("Dec 31, 2012"),
                end = new Date("Jan 01, 2013"),
                summary = "WebWorks test create event 1",
                location = "Location 1";

            calEvent = cal.create({
                "summary": summary,
                "location": location,
                "allDay": true,
                "start": start,
                "end": end
            });

            expect(calEvent).toBeDefined();
            expect(calEvent.summary).toBe(summary);
            expect(calEvent.location).toBe(location);
            expect(calEvent.allDay).toBeTruthy();
            expect(calEvent.start).toBe(start);
            expect(calEvent.end).toBe(end);
            expect(typeof calEvent.save).toBe("function");
            expect(typeof calEvent.remove).toBe("function");
            expect(typeof calEvent.createExceptionEvent).toBe("function");
        });

        it('can call save to persist the event on the device ', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created).toBeDefined();
                    expect(typeof created.id).toBe("string");
                    expect(created.id).not.toBe("");
                    expect(created.start).toBe(new Date(Date.parse("Dec 31, 2012")));
                    expect(created.end).toBe(new Date(Date.parse("Jan 01, 2013")));
                    expect(created.allDay).toBeTruthy();
                    expect(created.summary).toBe("WebWorks test create event 1");
                    expect(created.location).toBe("Location 1");
                }),
                errorCb = jasmine.createSpy();

            calEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });
    });

    describe("blackberry.pim.calendar.findEvents", function () {
        it('invoke error callback with invalid arguments error if find options is not specified', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy();

            cal.findEvents(successCb, errorCb);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });

        it('invoke error callback with invalid arguments error if find options does not have filter', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy(),
                findOptions = new CalendarFindOptions(null, null, CalendarFindOptions.DETAIL_FULL, 5);

            cal.findEvents(successCb, errorCb, findOptions);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });

        it('invoke error callback with invalid arguments error if find options filter does not have prefix', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy(),
                filter = new CalendarEventFilter("", null, null, null, false),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL, 5);

            cal.findEvents(successCb, errorCb, findOptions);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });

        it('invoke error callback with invalid arguments error if find options has invalid detail level', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy(),
                filter = new CalendarEventFilter("abc", null, null, null, false),
                findOptions = new CalendarFindOptions(filter, null, -890, 5);

            cal.findEvents(successCb, errorCb, findOptions);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });
    });
});