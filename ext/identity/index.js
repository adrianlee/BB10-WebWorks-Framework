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
var ERROR_ID = -1,
    ERRON_MSG_PPS = "Cannot retrieve data from system";

function getDeviceField(field, success, fail) {
    var result;

    try {
        result = window.qnx.webplatform.device[field];
    } catch (err) {
        fail(ERROR_ID, err.message);
        return;
    }

    if (result !== undefined) {
        success(result);
    } else {
        fail(ERROR_ID, ERRON_MSG_PPS);
    }
}

module.exports = {
    uuid: function (success, fail) {
        getDeviceField("devicePin", success, fail);
    },
    IMSI: function (success, fail) {
        getDeviceField("IMSI", success, fail);
    },
    IMEI: function (success, fail) {
        getDeviceField("IMEI", success, fail);
    }
};
