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
var _apiDir = __dirname + "./../../../../ext/identity/",
    index;

describe("identity index", function () {
    beforeEach(function () {
        index = require(_apiDir + "index");
    });

    afterEach(function () {
        index = null;
    });

    describe("qnx.webplatform.device fields", function () {
        beforeEach(function () {
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
        });

        function successCase(indexField, deviceField) {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy();

            window.qnx.webplatform.device[deviceField] = (new Date()).getTime();

            index[indexField](success, fail);
            expect(success).toHaveBeenCalledWith(window.qnx.webplatform.device[deviceField]);
            expect(fail).not.toHaveBeenCalled();
        }

        function missingCase(indexField) {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy();

            index[indexField](success, fail);
            expect(success).not.toHaveBeenCalled();
            expect(fail).toHaveBeenCalledWith(-1, "Cannot retrieve data from system");
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

            index[indexField](success, fail);
            expect(success).not.toHaveBeenCalled();
            expect(fail).toHaveBeenCalledWith(-1, errMsg);
        }

        describe("uuid", function () {
            it("calls success when devicepin is truthy", function () {
                successCase("uuid","devicePin");
            });

            it("calls fail when devicepin is not there", function () {
                missingCase("uuid");
            });

            it("calls fail when devicePin throws an error", function () {
                errorCase("uuid", "devicePin");
            });
        });

        describe("IMSI", function () {
            it("calls success when IMSI is truthy", function () {
                successCase("IMSI","IMSI");
            });

            it("calls fail when IMSI is not there", function () {
                missingCase("IMSI");
            });

            it("calls fail when devicePin throws an error", function () {
                errorCase("IMSI", "IMSI");
            });
        });

        describe("IMEI", function () {
            it("calls success when IMEI is truthy", function () {
                successCase("IMEI","IMEI");
            });

            it("calls fail when IMEI is not there", function () {
                missingCase("IMEI");
            });

            it("calls fail when devicePin throws an error", function () {
                errorCase("IMEI", "IMEI");
            });
        });
    });
});
