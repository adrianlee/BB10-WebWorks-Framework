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

#include <json/reader.h>
#include <json/writer.h>
#include <string>
#include "pim_message_js.hpp"

PimMessage::PimMessage(const std::string& id) : m_id(id), m_thread(0)
{
    messageController = new webworks::PimMessageNdk();
}

char* onGetObjList()
{
    // Return list of classes in the object
    static char name[] = "PimMessage";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id)
{
    // Make sure we are creating the right class
    if (className != "PimMessage") {
        return 0;
    }

    return new PimMessage(id);
}

bool PimMessage::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void PimMessage::NotifyEvent(const std::string& event)
{
    std::string eventString = m_id;
    eventString.append(" ");
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}

std::string PimMessage::InvokeMethod(const std::string& command) 
{
    int index = command.find_first_of(" ");

    string strCommand = command.substr(0, index);
    string jsonObject = command.substr(index + 1, command.length());

    Json::Reader reader;
    Json::Value *obj = new Json::Value;
    bool parse = reader.parse(jsonObject, *obj);

    if (!parse) {
        fprintf(stderr, "%s", "error parsing\n");
        return "Cannot parse JSON object";
    }

    if (strCommand == "getAccounts") {
        Json::Value result = messageController->getAccounts();
        Json::FastWriter writer;
        std::string jsonString = writer.write(result);
        return jsonString;
    }
    else if (strCommand == "send") {
        Json::Value result = messageController->send(obj);
    }

    return "";
}
