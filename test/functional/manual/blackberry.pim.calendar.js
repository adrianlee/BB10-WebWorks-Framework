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
    Attendee,
    selectedFolder,
    doneTesting = false;

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

function getCalendarFolder(domainSubstr) {
    var folders = cal.getCalendarFolders(),
        found;

    if (domainSubstr) {
        domainSubstr = domainSubstr.toLowerCase();
    }

    folders.forEach(function (f) {
        if (!domainSubstr) {
            if (f.name === "Home") {
                found = f;
                return;
            }
        } else {
            if (f.ownerEmail && f.ownerEmail.toLowerCase().indexOf(domainSubstr) !== -1) {
                if (f.ownerEmail.toLowerCase().indexOf("outlook") === -1 || f.type === 8) {
                    found = f;
                    return;
                }
            }
        }
    });

    return found;
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

afterEach(function () {
    if (doneTesting) {
        deleteEventWithMatchingPrefix("WebWorksTest manual");
    }
});

describe("blackberry.pim.calendar", function () {
    it('can create event in a specified calendar folder (not local)', function () {
        var substr = window.prompt("Enter the domain substring of the calendar you want to use", "gmail"),
            evt,
            called = false,
            successCb = jasmine.createSpy().andCallFake(function (saved) {
                called = true;
                expect(saved.folder).toBeDefined();
            }),
            errorCb = jasmine.createSpy().andCallFake(function () {
                called = true;
            });

        selectedFolder = getCalendarFolder(substr);

        if (!selectedFolder) {
            window.alert("The specified calendar folder cannot be found. All the tests will be skipped");
        } else {
            evt = cal.createEvent({
                "summary": "WebWorksTest manual create event in folder",
                "location": "Location manual",
                "allDay": false,
                "start": new Date("Jan 15, 2013, 12:00"),
                "end": new Date("Jan 15, 2013, 12:30")
            }, selectedFolder);
            evt.save(successCb, errorCb);

            waitsFor(function () {
                return called;
            }, "Event not saved to device calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        }
    });

    it('can search events in the selected folder only', function () {
        if (selectedFolder) {
            var filter = new CalendarEventFilter("WebWorksTest manual", [selectedFolder], null, null, false),
                findOptions = new CalendarFindOptions(filter, null, CalendarFindOptions.DETAIL_FULL),
                called = false,
                homeCalFolder = getCalendarFolder();
                successCb = jasmine.createSpy().andCallFake(function (events) {
                    called = true;
                    expect(events.length).toBe(1); // should only find the one in specified folder
                    expect(events[0].summary).toBe("WebWorksTest manual create event in folder");
                    expect(events[0].location).toBe("Location manual");
                }),
                errorCb = jasmine.createSpy().andCallFake(function () {
                    called = true;
                });

            // create event in local calendar with common prefix
            evt = cal.createEvent({
                "summary": "WebWorksTest manual create event in local folder",
                "location": "Location manual",
                "allDay": false,
                "start": new Date("Jan 15, 2013, 12:00"),
                "end": new Date("Jan 15, 2013, 12:30")
            }, homeCalFolder);
            evt.save(function (saved) {
                cal.findEvents(findOptions, successCb, errorCb);
            });

            waitsFor(function () {
                return called;
            }, "Event not found in calendar", 15000);

            runs(function () {
                expect(successCb).toHaveBeenCalled();
                expect(errorCb).not.toHaveBeenCalled();
            });
        }
    });

    it('Signal test end of all tests', function () {
        if (selectedFolder) {
            doneTesting = true;
        }
    });
});