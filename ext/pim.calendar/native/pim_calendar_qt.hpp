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

#ifndef PIM_CALENDAR_QT_H_
#define PIM_CALENDAR_QT_H_

#include <json/value.h>
#include <bb/pim/calendar/DataTypes>
#include <bb/pim/calendar/CalendarService>
#include <bb/pim/calendar/CalendarEvent>
#include <bb/pim/calendar/FolderKey>
#include <string>
#include <utility>
#include <map>
#include <limits>

class PimCalendar;

namespace webworks {

namespace bbpim = bb::pim::calendar;
/*
typedef std::map<std::string, bbpim::AttributeKind::Type> StringToKindMap;
typedef std::map<std::string, bbpim::AttributeSubKind::Type> StringToSubKindMap;
typedef std::map<bbpim::AttributeKind::Type, std::string> KindToStringMap;
typedef std::map<bbpim::AttributeSubKind::Type, std::string> SubKindToStringMap;

typedef std::pair<bbpim::AttributeSubKind::Type, std::string> SubkindValuePair;
*/
enum PimCalendarError {
    UNKNOWN_ERROR = 0,
    INVALID_ARGUMENT_ERROR = 1,
    TIMEOUT_ERROR = 2,
    PENDING_OPERATION_ERROR = 3,
    IO_ERROR = 4,
    NOT_SUPPORTED_ERROR = 5,
    PERMISSION_DENIED_ERROR = 20,
};

struct PimCalendarThreadInfo {
    PimCalendar *parent;
    Json::Value *jsonObj;
    std::string eventId;
};

const quint32 UNDEFINED_UINT = std::numeric_limits<quint32>::max();

class PimCalendarQt {
public:
    PimCalendarQt();
    ~PimCalendarQt();
    Json::Value Find(const Json::Value& args);
    Json::Value Save(const Json::Value& args);
    Json::Value CreateCalendarEvent(const Json::Value& args);
    Json::Value DeleteCalendarEvent(const Json::Value& args);
    Json::Value EditCalendarEvent(bbpim::CalendarEvent& contact, const Json::Value& attributeObj);
    Json::Value GetCalendarFolders();
    Json::Value GetDefaultCalendarFolder();
    Json::Value GetTimezones();

private:
    std::string intToStr(const int val);
    bbpim::FolderId intToFolderId(const quint32 id);
    QVariant getFromMap(QMap<QString, QVariant> map, QStringList keys);
    std::string getFolderKeyStr(bbpim::AccountId accountId, bbpim::FolderId folderId);
    bool getSearchParams(bbpim::EventSearchParameters& searchParams, const Json::Value& args);
    Json::Value lookupCalendarFolderByFolderKey(bbpim::AccountId accountId, bbpim::FolderId folderId);
    bool isDefaultCalendarFolder(const bbpim::CalendarFolder& folder);
    Json::Value getCalendarFolderJson(const bbpim::CalendarFolder& folder, bool skipDefaultCheck = false);

    Json::Value populateEvent(const bbpim::CalendarEvent& event, bool isFind);
    Json::Value getCalendarFolderByFolderKey(bbpim::AccountId accountId, bbpim::FolderId folderId);

    std::map<std::string, bbpim::CalendarFolder> _allFoldersMap;
    std::map<std::string, bbpim::CalendarFolder> _foldersMap;
};

} // namespace webworks

#endif // PIM_CALENDAR_QT_H_
