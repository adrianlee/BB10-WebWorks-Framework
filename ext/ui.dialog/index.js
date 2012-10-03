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
function validateIdMessageSettings(args) {
    args.eventId = JSON.parse(decodeURIComponent(args.eventId));
    if (args.message) {
        args.message = decodeURIComponent(args.message);
        args.message = args.message.replace(/"/g, '');
    } else {
        return 1;
    }
    if (args.type) {
        args.type = decodeURIComponent(args.type);
        args.type = args.type.replace(/"/g, '');
    }
    if (args.buttons) {
        args.buttons = decodeURIComponent(args.buttons);
    }
    if (args.title) {
        args.title = decodeURIComponent(args.title);
        args.title = args.title.replace(/"/g, '');
    }
    if (args.option) {
        args.option = decodeURIComponent(args.option);
        args.option = args.option.replace(/"/g, '');
    }
    return 0;
}

var dialog,
    _event = require("../../lib/event"),
    overlayWebView = require('../../lib/overlayWebView'),
    _webview = require("../../lib/webview");
    
module.exports = {
    customAskAsync: function (success, fail, args, env) {
        if (validateIdMessageSettings(args) === 1) {
            fail(-1, "message is undefined");
            return;
        }
        if(!args.title){
            fail(-1, "buttons is title");
            return;
        }
        if(!args.buttons){
            fail(-1, "buttons is undefined");
            return;
        }
        var  messageObj = {
            title : args.title,
            htmlmessage :  args.message,
            dialogType : "customAsk",
            optionalButtons : args.buttons
        };
        overlayWebView.showDialog(messageObj, function(result){alert(result.customButton);});
        success();
    },

    standardAskAsync: function (success, fail, args, env) {
        if (validateIdMessageSettings(args) === 1) {
            fail(-1, "message is undefined");
            return;
        }
        var  messageObj = {
            title : args.title,
            htmlmessage :  args.message,
            dialogType : args.type,
            thirdOptionLabel : args.option
        };
        overlayWebView.showDialog(messageObj);
        success();
    }
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.Dialog = function ()
{   
    var self = this;

    self.show = function (eventId, message, buttons, settings) {
        settings.message = message;
        settings.buttons = buttons;
        settings.eventId = eventId;
        settings.windowGroup = _webview.windowGroup();
        self.eventId = settings.eventId = eventId;
        var val = JNEXT.invoke(self.m_id, "show " + JSON.stringify(settings));
        return val;
    };

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("dialog")) {   
            return false;
        }

        self.m_id = JNEXT.createObject("dialog.Dialog");
        
        if (self.m_id === "") {   
            return false;
        }

        JNEXT.registerEvents(self);
    };
    
    self.onEvent = function (strData) {
        var arData = strData.split(" "),
            strEventDesc = arData[0];
            
        if (strEventDesc === "result") {
            _event.trigger(self.eventId, arData[1]);
        }
    };
    
    self.onBlink = {};
    self.m_id = "";
    self.eventId = "";

    self.init();
};

dialog = new JNEXT.Dialog();
