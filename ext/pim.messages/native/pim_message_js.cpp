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
#include "pim_message_ndk.hpp"

PimMessage::PimMessage(const std::string& id) : m_id(id), m_thread(0);
{
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

bool PimContacts::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void PimMessage::NotifyEvent(const std::string& eventId, const std::string& event)
{
    std::string eventString = m_id;
    eventString.append(" ");
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}
