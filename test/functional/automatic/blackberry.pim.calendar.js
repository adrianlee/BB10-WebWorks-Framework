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
    CalendarRepeatRule;
    // Attendee

function testReadOnly(object, property) {
    var oldValue = object[property];
    object[property] = "test different";
    expect(object[property]).toBe(oldValue);
}

function findByEventsByPrefix(prefix, onFound) {
    var filter = new CalendarEventFilter(prefix, null, null, null, false),
        findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL);

    cal.findEvents(
        function (events) {
            if (onFound && typeof onFound === "function") {
                onFound(events);
            }
        }, function (error) {
            console.log("Failed to find events with prefix '" + prefix + "', error code=" + error.code);
        }, findOptions);
}

function deleteEventWithMatchingPrefix(prefix) {
    var numEventsRemoved = 0,
        numEventsFound = 0,
        successCb = function () {
            numEventsRemoved++;
        };

    findByEventsByPrefix(prefix, function (events) {
            numEventsFound = events.length;
            events.forEach(function (e, index) {
                e.remove(successCb);
                waitsFor(function () {
                    return numEventsRemoved === index + 1;
                }, "Event not removed", 15000);
            });
        });

    waitsFor(function () {
        return numEventsRemoved === numEventsFound;
    }, "Not all events removed", 15000);

    runs(function () {
        expect(numEventsRemoved).toBe(numEventsFound);
    });
}

beforeEach(function () {
    cal = blackberry.pim.calendar;
    CalendarEvent = cal.CalendarEvent;
    CalendarFolder = cal.CalendarFolder;
    CalendarFindOptions = cal.CalendarFindOptions;
    CalendarEventFilter = cal.CalendarEventFilter;
    CalendarError = cal.CalendarError;
    CalendarRepeatRule = cal.CalendarRepeatRule;
});

describe("blackberry.pim.calendar", function () {
    var calEvent;

    describe("Object and constants definitions", function () {
        it('blackberry.pim.calendar should exist', function () {
            expect(cal).toBeDefined();
        });

        it('blackberry.pim.calendar child objects should exist', function () {
            expect(CalendarEvent).toBeDefined();
            expect(CalendarFolder).toBeDefined();
            expect(CalendarFindOptions).toBeDefined();
            expect(CalendarEventFilter).toBeDefined();
            expect(CalendarError).toBeDefined();
            // expect(Attendee).toBeDefined();
            // expect(CalendarRepeatRule).toBeDefined();
        });

        it('blackberry.pim.calendar.CalendarFindOptions constants should exist', function () {
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

        it('blackberry.pim.calendar.CalendarFindOptions constants should be read-only', function () {
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

        it('blackberry.pim.calendar.CalendarError constants should exist', function () {
            expect(CalendarError.UNKNOWN_ERROR).toBeDefined();
            expect(CalendarError.INVALID_ARGUMENT_ERROR).toBeDefined();
            expect(CalendarError.TIMEOUT_ERROR).toBeDefined();
            expect(CalendarError.PENDING_OPERATION_ERROR).toBeDefined();
            expect(CalendarError.IO_ERROR).toBeDefined();
            expect(CalendarError.NOT_SUPPORTED_ERROR).toBeDefined();
            expect(CalendarError.PERMISSION_DENIED_ERROR).toBeDefined();
        });

        it('blackberry.pim.calendar.CalendarError constants should be read-only', function () {
            testReadOnly(CalendarError, "UNKNOWN_ERROR");
            testReadOnly(CalendarError, "INVALID_ARGUMENT_ERROR");
            testReadOnly(CalendarError, "TIMEOUT_ERROR");
            testReadOnly(CalendarError, "PENDING_OPERATION_ERROR");
            testReadOnly(CalendarError, "IO_ERROR");
            testReadOnly(CalendarError, "NOT_SUPPORTED_ERROR");
            testReadOnly(CalendarError, "PERMISSION_DENIED_ERROR");
        });

        it('blackberry.pim.calendar.CalendarRepeatRule constants should exist', function () {
            expect(CalendarRepeatRule.SUNDAY).toBeDefined();
            expect(CalendarRepeatRule.MONDAY).toBeDefined();
            expect(CalendarRepeatRule.TUESDAY).toBeDefined();
            expect(CalendarRepeatRule.WEDNESDAY).toBeDefined();
            expect(CalendarRepeatRule.THURSDAY).toBeDefined();
            expect(CalendarRepeatRule.FRIDAY).toBeDefined();
            expect(CalendarRepeatRule.SATURDAY).toBeDefined();
            expect(CalendarRepeatRule.LAST_DAY_IN_MONTH).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_DAILY).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_WEEKLY).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_MONTHLY).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_MONTHLY).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_MONTHLY_AT_A_WEEK_DAY).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_YEARLY).toBeDefined();
            expect(CalendarRepeatRule.FREQUENCY_YEARLY_AT_A_WEEK_DAY_OF_MONTH).toBeDefined();
        });

        it('blackberry.pim.calendar.CalendarRepeatRule constants should be read-only', function () {
            testReadOnly(CalendarRepeatRule, "SUNDAY");
            testReadOnly(CalendarRepeatRule, "MONDAY");
            testReadOnly(CalendarRepeatRule, "TUESDAY");
            testReadOnly(CalendarRepeatRule, "WEDNESDAY");
            testReadOnly(CalendarRepeatRule, "THURSDAY");
            testReadOnly(CalendarRepeatRule, "FRIDAY");
            testReadOnly(CalendarRepeatRule, "SATURDAY");
            testReadOnly(CalendarRepeatRule, "LAST_DAY_IN_MONTH");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_DAILY");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_WEEKLY");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_MONTHLY");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_MONTHLY");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_MONTHLY_AT_A_WEEK_DAY");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_YEARLY");
            testReadOnly(CalendarRepeatRule, "FREQUENCY_YEARLY_AT_A_WEEK_DAY_OF_MONTH");
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

        it('Can create blackberry.pim.calendar.CalendarRepeatRule object', function () {
            var rule = new CalendarRepeatRule({
                "frequency": CalendarRepeatRule.FREQUENCY_WEEKLY,
                "numberOfOccurrences": 9,
                "expires": Date.parse("Dec 31, 2012")
            });

            expect(rule.frequency).toBe(CalendarRepeatRule.FREQUENCY_WEEKLY);
            expect(rule.numberOfOccurrences).toBe(9);
            expect(rule.expires.toISOString()).toBe(new Date(Date.parse("Dec 31, 2012")).toISOString());
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
        it('should return a CalendarEvent object', function () {
            // TODO have to fix client.js to name it createEvents
            var start = new Date("Dec 31, 2012"),
                end = new Date("Jan 01, 2013"),
                summary = "WebWorksTest create event 1",
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

        it('can call save to persist the event on the device', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created).toBeDefined();
                    expect(typeof created.id).toBe("string");
                    expect(created.id).not.toBe("");
                    expect(created.start.toISOString()).toBe(new Date(Date.parse("Dec 31, 2012")).toISOString());
                    expect(created.end.toISOString()).toBe(new Date(Date.parse("Jan 01, 2013")).toISOString());
                    expect(created.allDay).toBeTruthy();
                    expect(created.summary).toBe("WebWorksTest create event 1");
                    expect(created.location).toBe("Location 1");
                    calEvent = created;
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

        it('saved event can be found by findEvents', function () {
            findByEventsByPrefix("WebWorksTest create event 1", function (events) {
                expect(events.length).toBe(1);
                expect(events[0].id).not.toBe("");
                expect(events[0].start.toISOString()).toBe(new Date(Date.parse("Dec 31, 2012")).toISOString());
                expect(events[0].end.toISOString()).toBe(new Date(Date.parse("Jan 01, 2013")).toISOString());
                expect(events[0].allDay).toBeTruthy();
                expect(events[0].summary).toBe("WebWorksTest create event 1");
                expect(events[0].location).toBe("Location 1");
            });
        });

        it('can call remove to remove the event from the device', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function () {
                    called = true;

                }),
                errorCb = jasmine.createSpy().andCallFake(function () {
                    called = true;
                });

            calEvent.remove(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Event not removed from device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('removed event cannot be found by findEvents', function () {
            findByEventsByPrefix("WebWorksTest create event 1", function (events) {
                expect(events.length).toBe(0);
            });
        });
    });

    describe("blackberry.pim.calendar.findEvents", function () {
        var doneTestingFind = false;

        // clean up all events with summary/location with prefix WebworksTest
        afterEach(function () {
            if (doneTestingFind) {
                deleteEventWithMatchingPrefix("WebWorksTest");
            }
        });

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

        it('can find event by prefix', function () {
            var called = false,
                filter = new CalendarEventFilter("WebWorksTest abc", null, null, null, false),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL),
                start = new Date("Dec 31, 2012"),
                end = new Date("Jan 01, 2013"),
                summary = "WebWorksTest abc",
                location = "Home",
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    called = true;
                    expect(events.length).toBe(1);
                    expect(events[0].summary).toBe(summary);
                    expect(events[0].location).toBe(location);
                    expect(events[0].allDay).toBeTruthy();
                }),
                errorCb = jasmine.createSpy().andCallFake(function () {
                    called = true;
                }),
                created;

            created = cal.create({
                "summary": summary,
                "location": location,
                "allDay": true,
                "start": start,
                "end": end
            });

            created.save(function () {
                cal.findEvents(successCb, errorCb, findOptions);
            });

            waitsFor(function () {
                return called;
            }, "Find callback not invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it("Signal the end of all find tests", function () {
            doneTestingFind = true;
        });
    });
});