/*
 * Copyright 2011-2012 Research In Motion Limited.
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

var libDir = __dirname + "./../../../../lib/",
    extDir = __dirname + "./../../../../ext/",
    ID = "system",
    apiDir = extDir + ID + "/",
    Whitelist = require(libDir + "policy/whitelist").Whitelist,
    events = require(libDir + "event"),
    eventExt = require(extDir + "event/index"),
    utils = require(libDir + "utils"),
    sysIndex,
    successCB,
    failCB;

beforeEach(function () {
    GLOBAL.JNEXT = {};
    sysIndex = require(apiDir + "index");
});

afterEach(function () {
    delete GLOBAL.JNEXT;
    sysIndex = null;
});

describe("system index", function () {
    it("hasPermission", function () {
        var success = jasmine.createSpy(),
            env = {
                "request": {
                    "origin": "blah"
                },
                "response": {
                }
            };

        spyOn(Whitelist.prototype, "isFeatureAllowed").andReturn(true);

        sysIndex.hasPermission(success, undefined, {"module": "blackberry.system"}, env);

        expect(Whitelist.prototype.isFeatureAllowed).toHaveBeenCalled();
        expect(success).toHaveBeenCalledWith(0);
    });

    it("hasCapability", function () {
        var success = jasmine.createSpy();

        sysIndex.hasCapability(success, undefined, {"capability": "network.wlan"}, undefined);

        expect(success).toHaveBeenCalledWith(true);
    });

    describe("battery events", function () {
        beforeEach(function () {
            successCB = jasmine.createSpy("Success Callback");
            failCB = jasmine.createSpy("Fail Callback");
            spyOn(utils, "loadExtensionModule").andCallFake(function () {
                return eventExt;
            });
        });

        afterEach(function () {
            successCB = null;
            failCB = null;
        });

        it("responds to 'batterycritical' events", function () {
            var eventName = "batterycritical",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'batterycritical' events", function () {
            var eventName = "batterycritical",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });

        it("responds to 'batterylow' events", function () {
            var eventName = "batterylow",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'batterylow' events", function () {
            var eventName = "batterylow",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });

        it("responds to 'batterystatus' events", function () {
            var eventName = "batterystatus",
                args = {eventName: encodeURIComponent(eventName)};

            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(successCB, failCB, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();
        });

        it("removes 'batterystatus' events", function () {
            var eventName = "batterystatus",
                args = {eventName: encodeURIComponent(eventName)};

            spyOn(events, "remove");
            eventExt.remove(successCB, failCB, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();
        });

        it("invokes success callback when battery event name with not defined", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};

            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(successCB, failCB, args);
            expect(events.add).toHaveBeenCalled();
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();
        });

        it("invokes success callback when tring to remove battery event with name not defined", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};

            spyOn(events, "remove");
            eventExt.remove(successCB, failCB, args);
            expect(events.remove).toHaveBeenCalled();
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();
        });

        it("invokes fail callback when exception occured", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};

            spyOn(events, "add").andCallFake(function () {
                throw "";
            });

            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(successCB, failCB, args);
            expect(events.add).toHaveBeenCalled();
            expect(successCB).not.toHaveBeenCalled();
            expect(failCB).toHaveBeenCalledWith(-1, jasmine.any(String));
        });

        it("invokes fail callback when exception occured", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};

            spyOn(events, "remove").andCallFake(function () {
                throw "";
            });
            eventExt.remove(successCB, failCB, args);
            expect(events.remove).toHaveBeenCalled();
            expect(successCB).not.toHaveBeenCalled();
            expect(failCB).toHaveBeenCalledWith(-1, jasmine.any(String));
        });
    });

    describe("qnx.webplatform.device properties", function () {
        beforeEach(function () {
            sysIndex = require(apiDir + "index");
            GLOBAL.window = {
                qnx: {
                    webplatform: {
                        device: {
                        }
                    }
                }
            };
        });

        afterEach(function () {
            delete window.qnx.webplatform.device;
            GLOBAL.window = null;
            sysIndex = null;
        });

        function successCase(indexField, deviceField) {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy();

            window.qnx.webplatform.device[deviceField] = (new Date()).getTime();

            sysIndex[indexField](success, fail);
            expect(success).toHaveBeenCalledWith(window.qnx.webplatform.device[deviceField]);
            expect(fail).not.toHaveBeenCalled();
        }

        function errorCase(indexField, deviceField) {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy(),
                errMsg = "Something bad happened";

            Object.defineProperty(window.qnx.webplatform.device, deviceField, {
                get: function () {
                    throw new Error(errMsg);
                }
            });

            sysIndex[indexField](success, fail);
            expect(success).not.toHaveBeenCalled();
            expect(fail).toHaveBeenCalledWith(-1, errMsg);
        }

        describe("softwareVersion", function () {
            it("calls success when softwareVersion is truthy", function () {
                successCase("softwareVersion", "scmBundle");
            });

            it("calls fail when softwareVersion throws an error", function () {
                errorCase("softwareVersion", "scmBundle");
            });
        });

        describe("name", function () {
            it("calls success when name is truthy", function () {
                successCase("name", "deviceName");
            });

            it("calls fail when name throws an error", function () {
                errorCase("name", "deviceName");
            });
        });

        describe("hardwareId", function () {
            it("calls success when hardwareId is truthy", function () {
                successCase("hardwareId", "hardwareId");
            });

            it("calls fail when hardwareId throws an error", function () {
                errorCase("hardwareId", "hardwareId");
            });
        });
    });

    describe("device region", function () {
        var mockApplication;
        beforeEach(function () {
            sysIndex = require(apiDir + "index");
            mockApplication = {};
            GLOBAL.window = {
                qnx: {
                    webplatform: {
                        getApplication: jasmine.createSpy().andReturn(mockApplication)
                    }
                }
            };
        });

        afterEach(function () {
            delete GLOBAL.window;
            sysIndex = null;
        });

        it("calls success when there is no error retrieving data", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy();

            mockApplication.systemRegion = (new Date()).getTime();

            sysIndex.region(success, fail);
            expect(success).toHaveBeenCalledWith(window.qnx.webplatform.getApplication().systemRegion);
            expect(fail).not.toHaveBeenCalled();
        });

        it("calls fail when there is an error", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy(),
                errMsg = "Something bad happened";

            Object.defineProperty(mockApplication, "systemRegion", {
                get: function () {
                    throw new Error(errMsg);
                }
            });

            sysIndex.region(success, fail);
            expect(success).not.toHaveBeenCalled();
            expect(fail).toHaveBeenCalledWith(-1, errMsg);
        });
    });

    describe("languagechanged event", function () {
        beforeEach(function () {
            successCB = jasmine.createSpy("Success Callback");
            failCB = jasmine.createSpy("Fail Callback");
            spyOn(utils, "loadExtensionModule").andCallFake(function () {
                return eventExt;
            });
        });

        afterEach(function () {
            successCB = null;
            failCB = null;
        });

        it("responds to 'languagechanged' events", function () {
            var eventName = "languagechanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'languagechanged' event", function () {
            var eventName = "languagechanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });
    });

    describe("regionchanged event", function () {
        beforeEach(function () {
            successCB = jasmine.createSpy("Success Callback");
            failCB = jasmine.createSpy("Fail Callback");
            spyOn(utils, "loadExtensionModule").andCallFake(function () {
                return eventExt;
            });
        });

        afterEach(function () {
            successCB = null;
            failCB = null;
        });

        it("responds to 'regionchanged' events", function () {
            var eventName = "regionchanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'regionchanged' event", function () {
            var eventName = "regionchanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });
    });

    describe("font", function () {
        describe("font methods", function () {
            var fontFamily = "courier",
                fontSize = 10,
                mockedFontFamily,
                mockedFontSize,
                ERROR_ID = -1;

            beforeEach(function () {
                successCB = jasmine.createSpy("Success Callback");
                failCB = jasmine.createSpy("Fail Callback");
                mockedFontFamily = jasmine.createSpy("getSystemFontFamily").andReturn(fontFamily);
                mockedFontSize = jasmine.createSpy("getSystemFontSize").andReturn(fontSize);
                GLOBAL.window = GLOBAL;
                GLOBAL.window.qnx = {
                    webplatform: {
                        getApplication: function () {
                            return {
                                getSystemFontFamily: mockedFontFamily,
                                getSystemFontSize: mockedFontSize
                            };
                        }
                    }
                };
            });

            afterEach(function () {
                successCB = null;
                failCB = null;
                mockedFontFamily = null;
                mockedFontSize = null;
            });

            it("can call fontFamily and fontSize the qnx.weblplatform Application", function () {
                sysIndex.getFontInfo(successCB, null, null, null);
                expect(mockedFontFamily).toHaveBeenCalled();
                expect(mockedFontSize).toHaveBeenCalled();
            });

            it("can call success callback when getFontInfo call succeed", function () {
                sysIndex.getFontInfo(successCB, failCB, null, null);
                expect(successCB).toHaveBeenCalledWith({'fontFamily': fontFamily, 'fontSize': fontSize});
                expect(failCB).not.toHaveBeenCalled();
            });

            it("can call fail callback when getFontInfo call failed", function () {
                sysIndex.getFontInfo(null, failCB, null, null);
                expect(successCB).not.toHaveBeenCalledWith({'fontFamily': fontFamily, 'fontSize': fontSize});
                expect(failCB).toHaveBeenCalledWith(ERROR_ID, jasmine.any(Object));
            });
        });

        describe("fontchanged event", function () {
            beforeEach(function () {
                spyOn(utils, "loadExtensionModule").andCallFake(function () {
                    return eventExt;
                });
            });

            it("responds to 'fontchanged' events", function () {
                var eventName = "fontchanged",
                    args = {eventName : encodeURIComponent(eventName)};

                spyOn(events, "add");
                sysIndex.registerEvents(jasmine.createSpy());
                eventExt.add(null, null, args);
                expect(events.add).toHaveBeenCalled();
                expect(events.add.mostRecentCall.args[0].event).toEqual(eventName);
                expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
            });

            it("removes 'fontchanged' event", function () {
                var eventName = "fontchanged",
                    args = {eventName : encodeURIComponent(eventName)};

                spyOn(events, "remove");
                eventExt.remove(null, null, args);
                expect(events.remove).toHaveBeenCalled();
                expect(events.remove.mostRecentCall.args[0].event).toEqual(eventName);
            });
        });
    });
});
