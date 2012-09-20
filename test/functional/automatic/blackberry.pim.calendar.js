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
    recEvent,
    CalendarEvent,
    CalendarFolder,
    CalendarFindOptions,
    CalendarEventFilter,
    CalendarError,
    CalendarRepeatRule,
    Attendee;

function testReadOnly(object, property) {
    var oldValue = object[property];
    object[property] = "test different";
    expect(object[property]).toBe(oldValue);
}

function findByEventsByPrefix(prefix, onFound, expandRecurring) {
    var filter = new CalendarEventFilter(prefix, null, null, null, !!expandRecurring),
        findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL);

    cal.findEvents(
        findOptions,
        function (events) {
            if (onFound && typeof onFound === "function") {
                onFound(events);
            }
        }, function (error) {
            console.log("Failed to find events with prefix '" + prefix + "', error code=" + error.code);
        });
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
    Attendee = cal.Attendee;
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
            expect(Attendee).toBeDefined();
            expect(CalendarRepeatRule).toBeDefined();
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

        it('blackberry.pim.calendar.CalendarEvent constants should exist', function () {
            expect(CalendarEvent.SENSITIVITY_NORMAL).toBeDefined();
            expect(CalendarEvent.SENSITIVITY_PERSONAL).toBeDefined();
            expect(CalendarEvent.SENSITIVITY_PRIVATE).toBeDefined();
            expect(CalendarEvent.SENSITIVITY_CONFIDENTIAL).toBeDefined();
            expect(CalendarEvent.TRANSPARENCY_FREE).toBeDefined();
            expect(CalendarEvent.TRANSPARENCY_TENTATIVE).toBeDefined();
            expect(CalendarEvent.TRANSPARENCY_BUSY).toBeDefined();
            expect(CalendarEvent.TRANSPARENCY_OUT_OF_OFFICE).toBeDefined();
        });

        it('blackberry.pim.calendar.CalendarEvent constants should be read-only', function () {
            testReadOnly(CalendarEvent, "SENSITIVITY_NORMAL");
            testReadOnly(CalendarEvent, "SENSITIVITY_PERSONAL");
            testReadOnly(CalendarEvent, "SENSITIVITY_PRIVATE");
            testReadOnly(CalendarEvent, "SENSITIVITY_CONFIDENTIAL");
            testReadOnly(CalendarEvent, "TRANSPARENCY_FREE");
            testReadOnly(CalendarEvent, "TRANSPARENCY_TENTATIVE");
            testReadOnly(CalendarEvent, "TRANSPARENCY_BUSY");
            testReadOnly(CalendarEvent, "TRANSPARENCY_OUT_OF_OFFICE");
        });

        it('blackberry.pim.calendar.Attendee constants should exist', function () {
            expect(Attendee.TYPE_HOST).toBeDefined();
            expect(Attendee.TYPE_PARTICIPANT).toBeDefined();
            expect(Attendee.ROLE_CHAIR).toBeDefined();
            expect(Attendee.ROLE_REQUIRED_PARTICIPANT).toBeDefined();
            expect(Attendee.ROLE_OPTIONAL_PARTICIPANT).toBeDefined();
            expect(Attendee.ROLE_NON_PARTICIPANT).toBeDefined();
            expect(Attendee.STATUS_UNKNOWN).toBeDefined();
            expect(Attendee.STATUS_TENTATIVE).toBeDefined();
            expect(Attendee.STATUS_ACCEPTED).toBeDefined();
            expect(Attendee.STATUS_DECLINED).toBeDefined();
            expect(Attendee.STATUS_NOT_RESPONDED).toBeDefined();
        });

        it('blackberry.pim.calendar.Attendee constants should be read-only', function () {
            testReadOnly(Attendee, "TYPE_HOST");
            testReadOnly(Attendee, "TYPE_PARTICIPANT");
            testReadOnly(Attendee, "ROLE_CHAIR");
            testReadOnly(Attendee, "ROLE_REQUIRED_PARTICIPANT");
            testReadOnly(Attendee, "ROLE_OPTIONAL_PARTICIPANT");
            testReadOnly(Attendee, "ROLE_NON_PARTICIPANT");
            testReadOnly(Attendee, "STATUS_UNKNOWN");
            testReadOnly(Attendee, "STATUS_TENTATIVE");
            testReadOnly(Attendee, "STATUS_ACCEPTED");
            testReadOnly(Attendee, "STATUS_DECLINED");
            testReadOnly(Attendee, "STATUS_NOT_RESPONDED");
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
                "expires": new Date("Dec 31, 2012")
            });

            expect(rule.frequency).toBe(CalendarRepeatRule.FREQUENCY_WEEKLY);
            expect(rule.numberOfOccurrences).toBe(9);
            expect(rule.expires.toISOString()).toBe(new Date("Dec 31, 2012").toISOString());
        });

        it('Can create blackberry.pim.calendar.Attendee object', function () {
            var attendee = new Attendee({
                "email": "abc@blah.com",
                "name": "John Doe",
                "role": Attendee.ROLE_REQUIRED_PARTICIPANT,
                "type": Attendee.TYPE_PARTICIPANT
            });

            expect(attendee.email).toBe("abc@blah.com");
            expect(attendee.name).toBe("John Doe");
            expect(attendee.role).toBe(Attendee.ROLE_REQUIRED_PARTICIPANT);
            expect(attendee.type).toBe(Attendee.TYPE_PARTICIPANT);
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
            var start = new Date("Dec 31, 2012"),
                end = new Date("Jan 01, 2013"),
                summary = "WebWorksTest create event 1",
                location = "Location 1";

            calEvent = cal.createEvent({
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
                    expect(created.start.toISOString()).toBe(new Date("Dec 31, 2012").toISOString());
                    expect(created.end.toISOString()).toBe(new Date("Jan 01, 2013").toISOString());
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
                expect(events[0].start.toISOString()).toBe(new Date("Dec 31, 2012").toISOString());
                expect(events[0].end.toISOString()).toBe(new Date("Jan 01, 2013").toISOString());
                expect(events[0].allDay).toBeTruthy();
                expect(events[0].summary).toBe("WebWorksTest create event 1");
                expect(events[0].location).toBe("Location 1");
            });
        });

        it('can edit a saved event', function () {
            var called = false,
                newSummary = "WebWorksTest create event 1 modified",
                newLocation = "Location 1 modified",
                newStart = new Date("Dec 31, 2012, 11:30"),
                newEnd = new Date("Dec 31, 2012, 11:45"),
                newAllDay = false,
                successCb = jasmine.createSpy().andCallFake(function (saved) {
                    called = true;
                    expect(saved.summary).toBe(newSummary);
                    expect(saved.location).toBe(newLocation);
                    expect(saved.allDay).toBe(newAllDay);
                    expect(saved.start.toISOString()).toBe(newStart.toISOString());
                    expect(saved.end.toISOString()).toBe(newEnd.toISOString());
                }),
                errorCb = jasmine.createSpy().andCallFake(function () {
                    called = true;
                });

            calEvent.summary = newSummary;
            calEvent.location = newLocation;
            calEvent.allDay = newAllDay;
            calEvent.start = newStart;
            calEvent.end = newEnd;

            calEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('edited event can be found by findEvents', function () {
            findByEventsByPrefix("WebWorksTest create event 1", function (events) {
                expect(events.length).toBe(1);
                expect(events[0].id).not.toBe("");
                expect(events[0].start.toISOString()).toBe(new Date("Dec 31, 2012, 11:30").toISOString());
                expect(events[0].end.toISOString()).toBe(new Date("Dec 31, 2012, 11:45").toISOString());
                expect(events[0].allDay).toBeFalsy();
                expect(events[0].summary).toBe("WebWorksTest create event 1 modified");
                expect(events[0].location).toBe("Location 1 modified");
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

    describe("Recurring event", function () {
        it('Can save a monthly recurring event on device', function () {
            var start = new Date("Jan 6, 2013, 12:00"),
                end = new Date("Jan 6, 2013, 12:30"),
                location = "some location",
                summary = "WebWorksTest awesome recurring event",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_MONTHLY,
                    "expires": new Date("Dec 31, 2013"),
                    "numberOfOccurrences": 4
                }),
                called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created.summary).toBe(summary);
                    expect(created.location).toBe(location);
                    expect(created.recurrence).toBeDefined();
                    expect(created.recurrence.frequency).toBe(CalendarRepeatRule.FREQUENCY_MONTHLY);
                    expect(created.recurrence.numberOfOccurrences).toBe(4);
                    recEvent = created;
                }),
                errorCb = jasmine.createSpy(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": location, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Can find recurring event (with expandRecurring set to false)', function () {
            var called = false,
                filter = new CalendarEventFilter("WebWorksTest awesome recurring", null, null, null, false),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL),
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    expect(events.length).toBe(1); // only found original event if expand flag is set to false
                    expect(events[0].summary).toBe(recEvent.summary);
                    expect(events[0].location).toBe(recEvent.location);
                    expect(events[0].start.toISOString()).toBe(recEvent.start.toISOString());
                    expect(events[0].end.toISOString()).toBe(recEvent.end.toISOString());
                    called = true;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            cal.findEvents(findOptions, successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Can find recurring event (with expandRecurring set to true)', function () {
            var called = false,
                filter = new CalendarEventFilter("WebWorksTest awesome recurring", null, null, null, true),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL),
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    var starts = [];

                    expect(events.length).toBe(4); // found all occurrences since expand flag is true

                    events.forEach(function (evt) {
                        starts.push(evt.start.toISOString());
                        expect(evt.summary).toBe(recEvent.summary);
                        expect(evt.location).toBe(recEvent.location);
                        expect(evt.allDay).toBe(recEvent.allDay);
                    });

                    expect(starts).toContain(new Date("Jan 6, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 6, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Mar 6, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Apr 6, 2013, 12:00").toISOString());

                    called = true;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            cal.findEvents(findOptions, successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Can save a recurring event (with expires) on device', function () {
            var start = new Date("Jan 7, 2013, 12:00"),
                end = new Date("Jan 7, 2013, 12:30"),
                venue = "some location",
                summary = "WebWorksTest awesome rec event binding expires",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_MONTHLY,
                    "expires": new Date("Mar 30, 2013"),
                    "numberOfOccurrences": 4
                }),
                called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created.summary).toBe(summary);
                    expect(created.location).toBe(venue);
                    expect(created.recurrence).toBeDefined();
                    expect(created.recurrence.frequency).toBe(CalendarRepeatRule.FREQUENCY_MONTHLY);
                    expect(created.recurrence.numberOfOccurrences).toBe(4);
                    recEvent = created;
                }),
                errorCb = jasmine.createSpy(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": venue, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Expires in CalendarRepeatRule works', function () {
            var called = false,
                filter = new CalendarEventFilter("WebWorksTest awesome rec event binding expires", null, null, null, true),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL),
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    var starts = [];

                    expect(events.length).toBe(3); // found all occurrences since expand flag is true

                    events.forEach(function (evt) {
                        starts.push(evt.start.toISOString());
                        expect(evt.summary).toBe(recEvent.summary);
                        expect(evt.location).toBe(recEvent.location);
                        expect(evt.allDay).toBe(recEvent.allDay);
                    });

                    expect(starts).toContain(new Date("Jan 7, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 7, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Mar 7, 2013, 12:00").toISOString());
                    
                    called = true;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            cal.findEvents(findOptions, successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Can save a recurring event repeating on Mon/Wed every week', function () {
            var start = new Date("Jan 21, 2013, 12:00"),
                end = new Date("Jan 21, 2013, 12:30"),
                venue = "some location",
                summary = "WebWorksTest every Mon and Wed",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_WEEKLY,
                    "expires": new Date("Mar 30, 2013"),
                    "dayInWeek": CalendarRepeatRule.MONDAY | CalendarRepeatRule.WEDNESDAY
                }),
                called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created.summary).toBe(summary);
                    expect(created.location).toBe(venue);
                    expect(created.recurrence).toBeDefined();
                    expect(created.recurrence.frequency).toBe(CalendarRepeatRule.FREQUENCY_WEEKLY);
                    expect(created.recurrence.dayInWeek).toBe(CalendarRepeatRule.MONDAY | CalendarRepeatRule.WEDNESDAY);
                    recEvent = created;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": venue, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Weekly recurrence with multiple weekdays works', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    expect(events.length).toBe(20); // found all occurrences since expand flag is true
                    called = true;
                });

            findByEventsByPrefix("WebWorksTest every Mon and Wed", successCb, true);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
            });
        });

        it('Can save a recurring event repeating on first Friday of every month', function () {
            var start = new Date("Feb 1, 2013, 12:00"),
                end = new Date("Feb 1, 2013, 12:30"),
                venue = "some location",
                summary = "WebWorksTest first Fri every month",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_MONTHLY_AT_A_WEEK_DAY,
                    "expires": new Date("Jun 30, 2013"),
                    "dayInWeek": CalendarRepeatRule.FRIDAY,
                    "weekInMonth": 1
                }),
                called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created.summary).toBe(summary);
                    expect(created.location).toBe(venue);
                    expect(created.recurrence).toBeDefined();
                    expect(created.recurrence.frequency).toBe(CalendarRepeatRule.FREQUENCY_MONTHLY_AT_A_WEEK_DAY);
                    expect(created.recurrence.dayInWeek).toBe(CalendarRepeatRule.FRIDAY);
                    expect(created.recurrence.weekInMonth).toBe(1);
                    recEvent = created;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": venue, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Monthly recurrence at a weekday works', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    var starts = [];

                    expect(events.length).toBe(5); // found all occurrences since expand flag is true

                    events.forEach(function (evt) {
                        starts.push(evt.start.toISOString());
                    });

                    expect(starts).toContain(new Date("Feb 1, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Mar 1, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Apr 5, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("May 3, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Jun 7, 2013, 12:00").toISOString());

                    called = true;
                });

            findByEventsByPrefix("WebWorksTest first Fri every month", successCb, true);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
            });
        });

        it('Can save a recurring event repeating on seventh month of the first Friday every year', function () {
            var start = new Date("Jul 5, 2013, 12:00"),
                end = new Date("Jul 5, 2013, 12:30"),
                venue = "some location",
                summary = "WebWorksTest 1st Fri of 7th month every year",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_YEARLY_AT_A_WEEK_DAY_OF_MONTH,
                    "expires": new Date("Jun 30, 2017"),
                    "dayInWeek": CalendarRepeatRule.FRIDAY,
                    "weekInMonth": 1,
                    "monthInYear": 7
                }),
                called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created.summary).toBe(summary);
                    expect(created.location).toBe(venue);
                    expect(created.recurrence).toBeDefined();
                    expect(created.recurrence.frequency).toBe(CalendarRepeatRule.FREQUENCY_YEARLY_AT_A_WEEK_DAY_OF_MONTH);
                    expect(created.recurrence.dayInWeek).toBe(CalendarRepeatRule.FRIDAY);
                    expect(created.recurrence.weekInMonth).toBe(1);
                    expect(created.recurrence.monthInYear).toBe(7);
                    recEvent = created;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": venue, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Yearly recurrence at a weekday of a month works', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    var starts = [];

                    expect(events.length).toBe(4); // found all occurrences since expand flag is true

                    events.forEach(function (evt) {
                        starts.push(evt.start.toISOString());
                    });

                    expect(starts).toContain(new Date("Jul 5, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Jul 4, 2014, 12:00").toISOString());
                    expect(starts).toContain(new Date("Jul 3, 2015, 12:00").toISOString());
                    expect(starts).toContain(new Date("Jul 1, 2016, 12:00").toISOString());

                    called = true;
                });

            findByEventsByPrefix("WebWorksTest 1st Fri of 7th month every year", successCb, true);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
            });
        });

        it('Can save a recurring event repeating on the last day of every month', function () {
            var start = new Date("Jan 31, 2013, 12:00"),
                end = new Date("Jan 31, 2013, 12:30"),
                venue = "some location",
                summary = "WebWorksTest last day of every month",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_MONTHLY,
                    "expires": new Date("Jun 1, 2013"),
                    "dayInMonth": CalendarRepeatRule.LAST_DAY_IN_MONTH
                }),
                called = false,
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    expect(created.summary).toBe(summary);
                    expect(created.location).toBe(venue);
                    expect(created.recurrence).toBeDefined();
                    expect(created.recurrence.frequency).toBe(CalendarRepeatRule.FREQUENCY_MONTHLY);
                    expect(created.recurrence.dayInMonth).toBe(CalendarRepeatRule.LAST_DAY_IN_MONTH);
                    recEvent = created;
                }),
                errorCb = jasmine.createSpy().andCallFake(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": venue, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        });

        it('Montly recurrence on the last day of the month works', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    var starts = [];

                    expect(events.length).toBe(5); // found all occurrences since expand flag is true

                    events.forEach(function (evt) {
                        starts.push(evt.start.toISOString());
                    });

                    expect(starts).toContain(new Date("Jan 31, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 28, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Mar 31, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Apr 30, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("May 31, 2013, 12:00").toISOString());

                    called = true;
                });

            findByEventsByPrefix("WebWorksTest last day of every month", successCb, true);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
            });
        });
    });

    describe("Exception event", function () {
        it('Can create an exception event', function () {
            var start = new Date("Jan 21, 2013, 12:00"),
                end = new Date("Jan 21, 2013, 12:30"),
                location = "some location",
                summary = "WebWorksTest test exception event",
                rule = new CalendarRepeatRule({
                    "frequency": CalendarRepeatRule.FREQUENCY_WEEKLY,
                    "expires": new Date("Feb 18, 2013"),
                    "dayInWeek": CalendarRepeatRule.TUESDAY | CalendarRepeatRule.FRIDAY
                }),
                called = false,
                exceptionEvtSavedCalled = false,
                exceptionSavedCb = jasmine.createSpy().andCallFake(function (exc) {
                    exceptionEvtSavedCalled = true;
                    expect(exc.id).not.toBe(recEvent.id);
                    expect(exc.parentId).toBe(recEvent.id);
                }),
                exceptionErrorCb = jasmine.createSpy().andCallFake(function (error) {
                    exceptionEvtSavedCalled = true;
                }),
                successCb = jasmine.createSpy().andCallFake(function (created) {
                    called = true;
                    recEvent = created;
                    findByEventsByPrefix(summary, function (events) {
                        var starts = [],
                            exceptionEvt;

                        expect(events.length).toBe(8);

                        events.forEach(function (evt) {
                            starts.push(evt.start.toISOString());
                        });

                        expect(starts).toContain(new Date("Jan 22, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Jan 25, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Jan 29, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Feb 1, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Feb 5, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Feb 8, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Feb 12, 2013, 12:00").toISOString());
                        expect(starts).toContain(new Date("Feb 15, 2013, 12:00").toISOString());

                        exceptionEvt = recEvent.createExceptionEvent(new Date("Feb 15, 2013, 12:00"));
                        exceptionEvt.start = new Date("Feb 16, 2013, 12:00");
                        exceptionEvt.end = new Date("Feb 16, 2013, 12:30");
                        exceptionEvt.save(exceptionSavedCb, exceptionErrorCb);
                    }, true);
                }),
                errorCb = jasmine.createSpy(function (error) {
                    called = true;
                });

            recEvent = cal.createEvent({"summary": summary, "location": location, "start": start, "end": end, "recurrence": rule});
            recEvent.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });

            waitsFor(function () {
                return exceptionEvtSavedCalled;
            }, "Recurring event not saved to device calendar", 15000);

            runs(function () {
                expect(exceptionSavedCb).toHaveBeenCalled();
                expect(exceptionErrorCb).not.toHaveBeenCalled();
            });
        });

        it('Exception event replaces original occurence', function () {
            var called = false,
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    var starts = [];

                    expect(events.length).toBe(8);// found all occurrences since expand flag is true

                    events.forEach(function (evt) {
                        starts.push(evt.start.toISOString());
                    });

                    expect(starts).toContain(new Date("Jan 22, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Jan 25, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Jan 29, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 1, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 5, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 8, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 12, 2013, 12:00").toISOString());
                    expect(starts).toContain(new Date("Feb 16, 2013, 12:00").toISOString());

                    called = true;
                });

            findByEventsByPrefix("WebWorksTest test exception event", successCb, true);

            waitsFor(function () {
                return called;
            }, "Find callback never invoked", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
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

            cal.findEvents(null, successCb, errorCb);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });

        it('invoke error callback with invalid arguments error if find options does not have filter', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy(),
                findOptions = new CalendarFindOptions(null, null, CalendarFindOptions.DETAIL_FULL, 5);

            cal.findEvents(findOptions, successCb, errorCb);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });

        it('invoke error callback with invalid arguments error if find options filter does not have prefix', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy(),
                filter = new CalendarEventFilter("", null, null, null, false),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL, 5);

            cal.findEvents(findOptions, successCb, errorCb);

            expect(errorCb).toHaveBeenCalledWith(new CalendarError(CalendarError.INVALID_ARGUMENT_ERROR));
            expect(successCb).not.toHaveBeenCalled();
        });

        it('invoke error callback with invalid arguments error if find options has invalid detail level', function () {
            var successCb = jasmine.createSpy(),
                errorCb = jasmine.createSpy(),
                filter = new CalendarEventFilter("abc", null, null, null, false),
                findOptions = new CalendarFindOptions(filter, null, -890, 5);

            cal.findEvents(findOptions, successCb, errorCb);

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

            created = cal.createEvent({
                "summary": summary,
                "location": location,
                "allDay": true,
                "start": start,
                "end": end
            });

            created.save(function () {
                cal.findEvents(findOptions, successCb, errorCb);
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