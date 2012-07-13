/*
 * Copyright 2010-2011 Research In Motion Limited.
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

module.exports = {
    addEventListener: function (event, trigger) {
        if (event) {
            switch (event) {
            case "pause":
            case "resume":
            case "swipedown":
            case "lowMemory":
                event = "application." + event;
                window.qnx.webplatform.getApplication().addEventListener(event, trigger);
                break;

            default:
                console.log("Ignore registration for unknown event: " + event);
                break;
            }
        }
    },

    removeEventListener: function (event, trigger) {
        if (event) {
            switch (event) {
            case "pause":
            case "resume":
            case "swipedown":
            case "lowMemory":
                event = "application." + event;
                window.qnx.webplatform.getApplication().removeEventListener(event, trigger);
                break;

            default:
                console.log("Ignore un-registration for unknown event: " + event);
                break;
            }
        }
    }
};