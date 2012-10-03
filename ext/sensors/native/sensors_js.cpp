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

#include <string>
#include "sensors_js.hpp"

bool eventsInitialized = false;

Sensors::Sensors(const std::string& id) : m_id(id)
{
    m_thread = 0;
}

Sensors::~Sensors()
{
    if (m_thread) {
        StopEvents();
    }
}

char* onGetObjList()
{
    static char name[] = "Sensors";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id)
{
    if (className != "Sensors") {
        return NULL;
    }

    return new Sensors(id);
}

std::string Sensors::InvokeMethod(const std::string& command)
{
    int index = command.find_first_of(" ");
    string strCommand = command.substr(0, index);
    string jsonObject = command.substr(index + 1, command.length());

    if (strCommand == "startSensor") {
        Json::Reader reader;
        Json::Value obj;

        bool parse = reader.parse(jsonObject, obj);

        if (!parse)
            return "";

        SensorConfig sensorConfig;
        sensorConfig.type = obj["type"].asString();
        sensorConfig.delay = obj["delay"].asInt();
    } else if (strCommand == "startEvents") {
        StartEvents();
        return "";
    } else if (strCommand == "stopEvents") {
        StopEvents();
        return "";
    }

    return NULL;
}

bool Sensors::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void Sensors::NotifyEvent(const std::string& event)
{
    std::string eventString = m_id + " onsensor ";
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}

