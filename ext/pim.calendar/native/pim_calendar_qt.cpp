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

#include <json/value.h>
#include <bb/pim/calendar/CalendarFolder>
#include <bb/pim/calendar/Notification>
#include <bb/pim/calendar/Recurrence>
#include <bb/pim/calendar/Frequency>
#include <bb/pim/calendar/Attendee>
#include <bb/pim/calendar/AttendeeRole>
#include <bb/pim/calendar/EventSearchParameters>
#include <bb/pim/calendar/SortField>
#include <bb/pim/calendar/FolderKey>
#include <bb/pim/account/AccountService>
#include <bb/pim/account/Account>
#include <bb/pim/account/Service>

#include <stdio.h>
#include <QFile>
#include <QTextStream>
#include <QPair>
#include <QSet>
#include <QMap>
#include <QtAlgorithms>
#include <string>
#include <sstream>
#include <map>
#include <algorithm>

#include "pim_calendar_qt.hpp"

namespace webworks {
/*
StringToKindMap PimContactsQt::_attributeKindMap;
StringToSubKindMap PimContactsQt::_attributeSubKindMap;
KindToStringMap PimContactsQt::_kindAttributeMap;
SubKindToStringMap PimContactsQt::_subKindAttributeMap;
QList<bbpim::SortSpecifier> PimContactsQt::_sortSpecs;
std::map<bbpim::ContactId, bbpim::Contact> PimContactsQt::_contactSearchMap;
*/
PimCalendarQt::PimCalendarQt()
{
/*
    static bool mapInit = false;

    if (!mapInit) {
        createAttributeKindMap();
        createAttributeSubKindMap();
        createKindAttributeMap();
        createSubKindAttributeMap();
        mapInit = true;
    }
*/
}

PimCalendarQt::~PimCalendarQt()
{
}

/****************************************************************
 * Public Functions
 ****************************************************************/

Json::Value PimCalendarQt::Find(const Json::Value& args)
{
    Json::Value returnObj;
    // TODO(rtse): must escape double quotes and other problematic characters otherwise there might be problems with JSON parsing

    if (args.isMember("options") && args["options"].isMember("filter") && !args["options"]["filter"].isNull()) {
        bbpim::EventSearchParameters searchParams = getSearchParams(args["options"]);
        bbpim::CalendarService service;
        QList<bbpim::CalendarEvent> events = service.events(searchParams);

        Json::Value results;
        QString format = "yyyy-MM-dd hh:mm:ss";

        for (QList<bbpim::CalendarEvent>::const_iterator i = events.constBegin(); i != events.constEnd(); i++) {
            bbpim::CalendarEvent event = *i;
            Json::Value e;

            e["accountId"] = event.accountId();
            e["id"] = event.id();
            e["folderId"] = event.folderId();
            e["parentId"] = event.parentId();

            // Reminder can be negative, when an all-day event is created, and reminder is set to "On the day at 9am", reminder=-540 (negative!)
            // For events with all-day=false, default reminder (in calendar app) is 15 mins before start -> reminder=15:
            // Tested:
            // 1 hour before start -> reminder=60
            // 2 days before start -> reminder=2880
            // 1 week before start -> reminder=10080
            e["reminder"] = event.reminder();
            e["birthday"] = event.isBirthday();
            e["allDay"] = event.isAllDay();

            // meeting status values:
            // - 0: not a meeting;
            // - 1 and 9: is a meeting;
            // - 3 and 11: meeting received;
            // - 5 and 13: meeting is canceled;
            // - 7 and 15: meeting is canceled and received.
            e["status"] = event.meetingStatus();

            // busy status values (BusyStatus::Type)
            // Free = 0, Used to inform that the event represents free time (the event's owner is available)
            // Tentative = 1, Tells that an event may or may not happen (the owner may be available).
            // Busy = 2, Tells that the event is confirmed (the owner is busy).
            // OutOfOffice = 3, Indicates that the event owner is out of office.
            e["transparency"] = event.busyStatus();
            e["start"] = event.startTime().toString(format).toStdString();
            e["end"] = event.endTime().toString(format).toStdString();

            // sensitivity values (Sensitivity::Type)
            // Normal = 0, To be used for unrestricted events.
            // Personal = 1, Sensitivity value for personal events.
            // Private = 2, Sensitivity level for private events.
            // Confidential = 3, Maximum sensitivity level for events.
            e["sensitivity"] = event.sensitivity();
            e["timezone"] = event.timezone().toStdString();
            e["summary"] = event.subject().toStdString();
            e["description"] = event.body().toStdString();
            e["location"] = event.location().toStdString();
            e["url"] = event.url().toStdString();
            e["attendees"] = Json::Value();

            QList<bbpim::Attendee> attendees = event.attendees();

            for (QList<bbpim::Attendee>::const_iterator j = attendees.constBegin(); j != attendees.constEnd(); j++) {
                bbpim::Attendee attendee = *j;
                Json::Value a;

                a["id"] = attendee.id();
                a["eventId"] = attendee.eventId();

                // contactId is 0 even if contact is on device...maybe it's a permission issue (contact permission not specified in app)
                // would most likely just leave it out
                a["contactId"] = attendee.contactId();
                a["email"] = attendee.email().toStdString();
                a["name"] = attendee.name().toStdString();
                a["type"] = attendee.type();
                a["role"] = attendee.role();
                a["owner"] = attendee.isOwner();
                a["status"] = attendee.status();

                e["attendees"].append(a);
            }

            if (event.recurrence().isValid()) {
                e["recurrence"] = Json::Value();
                e["recurrence"]["start"] = event.recurrence().start().toString(format).toStdString();
                e["recurrence"]["end"] = event.recurrence().end().toString(format).toStdString();
                e["recurrence"]["until"] = event.recurrence().until().toString(format).toStdString();
                e["recurrence"]["frequency"] = event.recurrence().frequency();
                e["recurrence"]["interval"] = event.recurrence().interval();
                e["recurrence"]["numberOfOccurrences"] = event.recurrence().numberOfOccurrences();
                e["recurrence"]["dayInWeek"] = event.recurrence().dayInWeek();
                e["recurrence"]["dayInMonth"] = event.recurrence().dayInMonth();
                e["recurrence"]["weekInMonth"] = event.recurrence().weekInMonth();
                e["recurrence"]["monthInYear"] = event.recurrence().monthInYear();
            }

            results.append(e);
        }

        returnObj["_success"] = true;
        returnObj["events"] = results;
    } else {
        returnObj["_success"] = false;
    }

    return returnObj;
}

Json::Value PimCalendarQt::Save(const Json::Value& attributeObj)
{
    if (!attributeObj.isMember("id") || attributeObj["id"].isNull()) {
        return CreateCalendarEvent(attributeObj);
    } else if (attributeObj.isMember("id") && attributeObj["id"].isInt()) {
        /*
        int contactId = attributeObj["id"].asInt();
        bbpim::ContactService service;

        if (contactId > 0) {
            bbpim::Contact contact = service.contactDetails(contactId);

            if (contact.isValid()) {
                return EditContact(contact, attributeObj);
            }
        } else {
            bbpim::Contact contact = service.contactDetails(contactId * -1);

            if (contact.isValid()) {
                return CloneContact(contact, attributeObj);
            }
        }*/
    }

    Json::Value returnObj;
    returnObj["_success"] = false;
    returnObj["code"] = INVALID_ARGUMENT_ERROR;
    return returnObj;
}

Json::Value PimCalendarQt::GetCalendarFolders()
{
    bbpim::CalendarService service;
    QList<bbpim::CalendarFolder> folders = service.folders();
    Json::Value folderList;

    for (QList<bbpim::CalendarFolder>::const_iterator i = folders.constBegin(); i != folders.constEnd(); i++) {
        bbpim::CalendarFolder folder = *i;
        Json::Value f;

        f["id"] = Json::Value(folder.id());
        f["accountId"] = Json::Value(folder.accountId());
        f["name"] = Json::Value(folder.name().toStdString());
        f["readonly"] = Json::Value(folder.isReadOnly());
        f["ownerEmail"] = Json::Value(folder.ownerEmail().toStdString());
        f["type"] = Json::Value(folder.type());
        folderList.append(f);
    }

    return folderList;
}

Json::Value PimCalendarQt::GetTimezones()
{
    Json::Value results;

    QFile file("/usr/share/zoneinfo/tzvalid");
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        qDebug() << "unable to load list";
    } else {
        QTextStream in(&file);
        while (!in.atEnd()) {
            QString line = in.readLine();
            if (line.startsWith("\"")) {
                line.remove("\"");
                results.append(line.toStdString());
            }
        }
    }

    return results;
}

Json::Value PimCalendarQt::CreateCalendarEvent(const Json::Value& args)
{
    //const Json::Value::Members attributeKeys = attributeObj.getMemberNames();
    //Json::Value contactFields;

    Json::Value returnObj;

    bbpim::CalendarEvent ev;
    bb::pim::account::AccountService accountService;
    bb::pim::account::Account defaultCalAccnt = accountService.defaultAccount(bb::pim::account::Service::Calendars);

    QDateTime startTime = QDateTime::fromString(args["start"].asString().c_str(), "yyyyMMddhhmm");
    QDateTime endTime = QDateTime::fromString(args["end"].asString().c_str(), "yyyyMMddhhmm");

    ev.setAccountId(defaultCalAccnt.id());
    ev.setFolderId(1);
    ev.setStartTime(startTime);
    ev.setEndTime(endTime);
    // TODO(rtse): timezone
    ev.setSubject(args["summary"].asString().c_str());
    ev.setLocation(args["location"].asString().c_str());

    if (!args["recurrence"].isNull()) {
        Json::Value recurrence_json = args["recurrence"];

        if (recurrence_json["frequency"].isNull()) {
            returnObj["_success"] = false;
            returnObj["code"] = INVALID_ARGUMENT_ERROR;
            return returnObj;
        }

        bbpim::Recurrence recurrence;
        recurrence.setFrequency(bbpim::Frequency::Type(recurrence_json["frequency"].asInt()));
        recurrence.setInterval(recurrence_json.get("interval", 1).asInt());

        if (recurrence_json.isMember("expires")) {
            recurrence.setUntil(QDateTime::fromString(recurrence_json["expires"].asCString(), "yyyyMMddhhmm"));
        }

        if (recurrence_json.isMember("numberOfOccurrences")) {
            recurrence.setNumberOfOccurrences(recurrence_json["numberOfOccurrences"].asInt());
        }

        recurrence.setDayInWeek(recurrence_json.get("dayInWeek", 1 << (startTime.date().dayOfWeek()%7)).asInt());
        recurrence.setWeekInMonth(recurrence_json.get("weekInMonth", (startTime.date().day()/7) + 1).asInt());
        recurrence.setDayInMonth(recurrence_json.get("dayInMonth", startTime.date().day()).asInt());
        recurrence.setMonthInYear(recurrence_json.get("monthInYear", startTime.date().month()).asInt());

        if (!recurrence.isValid()) {
            returnObj["_success"] = false;
            returnObj["code"] = UNKNOWN_ERROR;
            return returnObj;
        }

        ev.setRecurrence(recurrence);
    }

    for (int i = 0; i < args["attendees"].size(); i++) {
        bbpim::Attendee attendee;
        Json::Value attendee_json = args["attendees"][i];

        attendee.setName(QString(attendee_json.get("name", "").asCString()));
        attendee.setEmail(QString(attendee_json.get("email", "").asCString()));
        attendee.setType((bbpim::Attendee::Type)(attendee_json.get("type", bbpim::Attendee::Host).asInt()));
        attendee.setRole((bbpim::AttendeeRole::Type)(attendee_json.get("role", bbpim::AttendeeRole::Chair).asInt()));
        attendee.setContactId(attendee_json.get("contactId", 0).asInt());
        attendee.setOwner(attendee_json.get("owner", false).asBool());

        if (!attendee.isValid()) {
            returnObj["_success"] = false;
            returnObj["code"] = UNKNOWN_ERROR;
            return returnObj;
        }

        ev.addAttendee(attendee);
    }

    bbpim::Notification notification;
    notification.setComments(QString("Some comments for you"));
    notification.setNotifyAll(true);

    bbpim::CalendarService service;
    // service.createEvent(ev, notification);
    service.createEvent(ev);

    if (ev.isValid()) {
        //returnObj = populateContact(newContact, contactFields);
        returnObj["_success"] = true;
        returnObj["id"] = Json::Value(ev.id());
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = UNKNOWN_ERROR;
    }

    return returnObj;
}

Json::Value PimCalendarQt::DeleteCalendarEvent(const Json::Value& calEventObj)
{
/*
    Json::Value returnObj;

    if (contactObj.isMember("contactId") && contactObj["contactId"].isInt()) {
        bbpim::ContactId contactId = contactObj["contactId"].asInt();

        bbpim::ContactService service;
        bbpim::Contact contact = service.filteredContact(contactId, bbpim::ContactListFilters());

        if (contact.isValid()) {
            service.deleteContact(contactId);
            returnObj["_success"] = true;
            return returnObj;
        }
    }

    returnObj["_success"] = false;
    returnObj["code"] = INVALID_ARGUMENT_ERROR;
*/
    Json::Value returnObj;
    return returnObj;
}

Json::Value PimCalendarQt::EditCalendarEvent(bbpim::CalendarEvent& calEvent, const Json::Value& attributeObj)
{
    bbpim::CalendarService service;
    service.updateEvent(calEvent, bbpim::Notification());

    /*
    bbpim::ContactBuilder contactBuilder(contact.edit());
    const Json::Value::Members attributeKeys = attributeObj.getMemberNames();
    Json::Value contactFields;

    for (int i = 0; i < attributeKeys.size(); i++) {
        const std::string key = attributeKeys[i];
        contactFields.append(Json::Value(key));
        syncAttributeKind(contact, attributeObj[key], key);
    }

    bbpim::ContactService service;
    contact = service.updateContact(contact);

    Json::Value returnObj;

    if (contact.isValid()) {
        returnObj = populateContact(contact, contactFields);
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = UNKNOWN_ERROR;
    }
    */
    Json::Value returnObj;
    return returnObj;
}

Json::Value PimCalendarQt::CloneCalendarEvent(bbpim::CalendarEvent& calEvent, const Json::Value& attributeObj)
{
/*
    bbpim::ContactService service;
    bbpim::Contact newContact;
    bbpim::ContactBuilder contactBuilder(newContact.edit());
    contactBuilder = contactBuilder.addFromContact(contact);
    contactBuilder = contactBuilder.setFavorite(contact.isFavourite());

    newContact = service.createContact(newContact, false);

    Json::Value returnObj;

    if (newContact.isValid()) {
        returnObj = EditContact(newContact, attributeObj);
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = UNKNOWN_ERROR;
    }
*/
    Json::Value returnObj;
    return returnObj;
}

/****************************************************************
 * Helper functions for Find
 ****************************************************************/
bbpim::EventSearchParameters PimCalendarQt::getSearchParams(const Json::Value& args) {
    bbpim::EventSearchParameters searchParams;
    QDateTime now = QDateTime::currentDateTime();

    // filter - prefix
    searchParams.setPrefix(QString(args["filter"]["prefix"].asCString()));

    // filter - start
    if (!args["filter"]["start"].empty()) {
        searchParams.setStart(QDateTime::fromString(args["filter"]["start"].asCString(), Qt::ISODate));
    } else {
        searchParams.setStart(now.addYears(-100));
    }

    // filter - end
    if (!args["filter"]["end"].empty()) {
        searchParams.setEnd(QDateTime::fromString(args["filter"]["end"].asCString(), Qt::ISODate));
    } else {
        searchParams.setEnd(now.addYears(100));
    }

    // filter - expand recurring
    searchParams.setExpand(args["filter"]["expandRecurring"].asBool());

    // filter - folders
    if (!args["filter"]["folders"].empty()) {
        for (int i = 0; i < args["filter"]["folders"].size(); i++) {
            Json::Value folder = args["filter"]["folders"][i];
            bbpim::FolderKey folderKey;

            folderKey.setFolderId(folder["id"].asInt());
            folderKey.setAccountId(folder["accountId"].asInt());

            searchParams.addFolder(folderKey);
        }
    }

    // detail
    searchParams.setDetails((bbpim::DetailLevel::Type) args["detail"].asInt());

    // sort
    if (!args["sort"].empty()) {
        QList<QPair<bbpim::SortField::Type, bool > > sortSpecsList;

        for (int i = 0; i < args["sort"].size(); i++) {
            Json::Value sort = args["sort"][i];
            QPair<bbpim::SortField::Type, bool> sortSpec;

            sortSpec.first = (bbpim::SortField::Type) sort["fieldName"].asInt();
            sortSpec.second = !sort["desc"].asBool();

            sortSpecsList.append(sortSpec);
        }

        searchParams.setSort(sortSpecsList);
    }

    // limit
    if (!args["limit"].asInt() > 0) {
        searchParams.setLimit(args["limit"].asInt());
    }

    return searchParams;
}

/*
QList<bbpim::SearchField::Type> PimContactsQt::getSearchFields(const Json::Value& searchFieldsJson)
{
    QList<bbpim::SearchField::Type> searchFields;

    switch (searchFieldsJson["fieldName"].asInt()) {
        case bbpim::SearchField::FirstName:
            searchFields.append(bbpim::SearchField::FirstName);
            break;
        case bbpim::SearchField::LastName:
            searchFields.append(bbpim::SearchField::LastName);
            break;
        case bbpim::SearchField::CompanyName:
            searchFields.append(bbpim::SearchField::CompanyName);
            break;
        case bbpim::SearchField::Phone:
            searchFields.append(bbpim::SearchField::Phone);
            break;
        case bbpim::SearchField::Email:
            searchFields.append(bbpim::SearchField::Email);
            break;
        case bbpim::SearchField::BBMPin:
            searchFields.append(bbpim::SearchField::BBMPin);
            break;
        case bbpim::SearchField::LinkedIn:
            searchFields.append(bbpim::SearchField::LinkedIn);
            break;
        case bbpim::SearchField::Twitter:
            searchFields.append(bbpim::SearchField::Twitter);
            break;
        case bbpim::SearchField::VideoChat:
            searchFields.append(bbpim::SearchField::VideoChat);
            break;
    }

    return searchFields;
}

void PimContactsQt::getSortSpecs(const Json::Value& sort)
{
    _sortSpecs.clear();

    if (sort.isArray()) {
        for (int j = 0; j < sort.size(); j++) {
            bbpim::SortOrder::Type order;
            bbpim::SortColumn::Type sortField;

            if (sort[j]["desc"].asBool()) {
                order = bbpim::SortOrder::Descending;
            } else {
                order = bbpim::SortOrder::Ascending;
            }

            switch (sort[j]["fieldName"].asInt()) {
                case bbpim::SortColumn::FirstName:
                    sortField = bbpim::SortColumn::FirstName;
                    break;
                case bbpim::SortColumn::LastName:
                    sortField = bbpim::SortColumn::LastName;
                    break;
                case bbpim::SortColumn::CompanyName:
                    sortField = bbpim::SortColumn::CompanyName;
                    break;
            }

            _sortSpecs.append(bbpim::SortSpecifier(sortField, order));
        }
    }
}

QSet<bbpim::ContactId> PimContactsQt::getPartialSearchResults(const Json::Value& filter, const Json::Value& contactFields, const bool favorite)
{
    QSet<bbpim::ContactId> results;

    _contactSearchMap.clear();

    if (!filter.empty()) {
        for (int j = 0; j < filter.size(); j++) {
            QSet<bbpim::ContactId> currentResults = singleFieldSearch(filter[j], contactFields, favorite);

            if (currentResults.empty()) {
                // no need to continue, can return right away
                results = currentResults;
                break;
            } else {
                if (j == 0) {
                    results = currentResults;
                } else {
                    results.intersect(currentResults);
                }
            }
        }
    }

    return results;
}

QSet<bbpim::ContactId> PimContactsQt::singleFieldSearch(const Json::Value& searchFieldsJson, const Json::Value& contactFields, bool favorite)
{
    QList<bbpim::SearchField::Type> searchFields = PimContactsQt::getSearchFields(searchFieldsJson);
    QSet<bbpim::ContactId> contactIds;

    if (!searchFields.empty()) {
        bbpim::ContactService contactService;
        bbpim::ContactSearchFilters contactFilter;
        QList<bbpim::AttributeKind::Type> includeFields;
        QList<bbpim::Contact> results;

        contactFilter.setSearchFields(searchFields);
        contactFilter.setSearchValue(QString(searchFieldsJson["fieldValue"].asString().c_str()));

        if (favorite) {
            contactFilter.setIsFavourite(favorite);
        }

        for (int i = 0; i < contactFields.size(); i++) {
            // favorite is always included, no need to include
            if (contactFields[i].asString() == "favorite") {
                continue;
            }

            std::map<std::string, bbpim::AttributeKind::Type>::const_iterator kindIter = _attributeKindMap.find(contactFields[i].asString());

            if (kindIter != _attributeKindMap.end()) {
                // multiple fields can map to the same kind, only add kind to the list if it's not already added
                if (includeFields.count(kindIter->second) == 0) {
                    includeFields.append(kindIter->second);
                }
            } else if (contactFields[i].asString() == "displayName" || contactFields[i].asString() == "nickname") {
                // special case: displayName and nickname are first-level fields under Contact but only map to AttributeSubKind
                if (includeFields.count(bbpim::AttributeKind::Name) == 0) {
                    includeFields.append(bbpim::AttributeKind::Name);
                }
            }
        }

        contactFilter.setShowAttributes(true);
        contactFilter.setIncludeAttributes(includeFields);

        results = contactService.searchContacts(contactFilter);

        for (int i = 0; i < results.size(); i++) {
            contactIds.insert(results[i].id());
            _contactSearchMap[results[i].id()] = results[i];
        }
    }

    return contactIds;
}

void PimContactsQt::populateField(const bbpim::Contact& contact, bbpim::AttributeKind::Type kind, Json::Value& contactItem, bool isContactField, bool isArray)
{
    QList<bbpim::ContactAttribute> attrs = contact.filteredAttributes(kind);

    for (QList<bbpim::ContactAttribute>::const_iterator k = attrs.constBegin(); k != attrs.constEnd(); k++) {
        bbpim::ContactAttribute currentAttr = *k;

        // displayName and nickname are populated separately, do not populate within the name object
        if (currentAttr.subKind() == bbpim::AttributeSubKind::NameDisplayName || currentAttr.subKind() == bbpim::AttributeSubKind::NameNickname) {
            continue;
        }

        Json::Value val;
        SubKindToStringMap::const_iterator typeIter = _subKindAttributeMap.find(currentAttr.subKind());

        if (typeIter != _subKindAttributeMap.end()) {
            if (isContactField) {
                val["type"] = Json::Value(typeIter->second);
                val["value"] = Json::Value(currentAttr.value().toStdString());
                contactItem.append(val);
            } else {
                if (isArray) {
                    val = Json::Value(currentAttr.value().toStdString());
                    contactItem.append(val);
                } else {
                    if (kind == bbpim::AttributeKind::Date) {
                        QString format = "yyyy-MM-dd";
                        contactItem[typeIter->second] = Json::Value(currentAttr.valueAsDateTime().date().toString(format).toStdString());
                    } else {
                        if (kind == bbpim::AttributeKind::Note) {
                            contactItem["note"] = Json::Value(currentAttr.value().toStdString());
                        } else {
                            contactItem[typeIter->second] = Json::Value(currentAttr.value().toStdString());
                        }
                    }
                }
            }
        }
    }
}

void PimContactsQt::populateDisplayNameNickName(const bbpim::Contact& contact, Json::Value& contactItem, const std::string& field)
{
    QList<bbpim::ContactAttribute> attrs = contact.filteredAttributes(bbpim::AttributeKind::Name);
    bbpim::AttributeSubKind::Type subkind = (field == "displayName" ? bbpim::AttributeSubKind::NameDisplayName : bbpim::AttributeSubKind::NameNickname);

    for (QList<bbpim::ContactAttribute>::const_iterator k = attrs.constBegin(); k != attrs.constEnd(); k++) {
        bbpim::ContactAttribute currentAttr = *k;

        if (currentAttr.subKind() == subkind) {
            contactItem[field] = Json::Value(currentAttr.value().toStdString());
            break;
        }
    }
}

void PimContactsQt::populateAddresses(const bbpim::Contact& contact, Json::Value& contactAddrs)
{
    bbpim::ContactService contactService;
    bbpim::Contact fullContact = contactService.contactDetails(contact.id());
    QList<bbpim::ContactPostalAddress> addrs = fullContact.postalAddresses();

    for (QList<bbpim::ContactPostalAddress>::const_iterator k = addrs.constBegin(); k != addrs.constEnd(); k++) {
        bbpim::ContactPostalAddress currentAddr = *k;
        Json::Value addr;

        SubKindToStringMap::const_iterator typeIter = _subKindAttributeMap.find(currentAddr.subKind());

        if (typeIter != _subKindAttributeMap.end()) {
            addr["type"] = Json::Value(typeIter->second);
        }

        addr["streetAddress"] = Json::Value(currentAddr.line1().toStdString());
        addr["streetOther"] = Json::Value(currentAddr.line2().toStdString());
        addr["country"] = Json::Value(currentAddr.country().toStdString());
        addr["locality"] = Json::Value(currentAddr.city().toStdString());
        addr["postalCode"] = Json::Value(currentAddr.postalCode().toStdString());
        addr["region"] = Json::Value(currentAddr.region().toStdString());

        contactAddrs.append(addr);
    }
}

void PimContactsQt::populateOrganizations(const bbpim::Contact& contact, Json::Value& contactOrgs)
{
    QList<QList<bbpim::ContactAttribute> > orgAttrs = contact.filteredAttributesByGroupKey(bbpim::AttributeKind::OrganizationAffiliation);

    for (QList<QList<bbpim::ContactAttribute> >::const_iterator j = orgAttrs.constBegin(); j != orgAttrs.constEnd(); j++) {
        QList<bbpim::ContactAttribute> currentOrgAttrs = *j;
        Json::Value org;

        for (QList<bbpim::ContactAttribute>::const_iterator k = currentOrgAttrs.constBegin(); k != currentOrgAttrs.constEnd(); k++) {
            bbpim::ContactAttribute attr = *k;
            SubKindToStringMap::const_iterator typeIter = _subKindAttributeMap.find(attr.subKind());

            if (typeIter != _subKindAttributeMap.end()) {
                org[typeIter->second] = Json::Value(attr.value().toStdString());
            }
        }

        contactOrgs.append(org);
    }
}

void PimContactsQt::populatePhotos(const bbpim::Contact& contact, Json::Value& contactPhotos)
{
    bbpim::ContactService contactService;
    bbpim::Contact fullContact = contactService.contactDetails(contact.id());
    QList<bbpim::ContactPhoto> photos = fullContact.photos();
    bbpim::ContactPhoto primaryPhoto = fullContact.primaryPhoto();

    for (QList<bbpim::ContactPhoto>::const_iterator k = photos.constBegin(); k != photos.constEnd(); k++) {
        Json::Value photo;

        photo["originalFilePath"] = Json::Value((*k).originalPhoto().toStdString());
        photo["largeFilePath"] = Json::Value((*k).largePhoto().toStdString());
        photo["smallFilePath"] = Json::Value((*k).smallPhoto().toStdString());
        photo["pref"] = Json::Value((primaryPhoto.id() == (*k).id()));

        contactPhotos.append(photo);
    }
}

QString PimContactsQt::getSortFieldValue(const bbpim::SortColumn::Type sort_field, const bbpim::Contact& contact)
{
    switch (sort_field) {
        case bbpim::SortColumn::FirstName:
            return contact.sortFirstName();
        case bbpim::SortColumn::LastName:
            return contact.sortLastName();
        case bbpim::SortColumn::CompanyName:
            return contact.sortCompanyName();
    }

    return QString();
}

bool PimContactsQt::lessThan(const bbpim::Contact& c1, const bbpim::Contact& c2)
{
    QList<bbpim::SortSpecifier>::const_iterator i = PimContactsQt::_sortSpecs.constBegin();
    bbpim::SortSpecifier sortSpec;
    QString val1, val2;

    do {
        sortSpec = *i;
        val1 = PimContactsQt::getSortFieldValue(sortSpec.first, c1);
        val2 = PimContactsQt::getSortFieldValue(sortSpec.first, c2);
        ++i;
    } while (val1 == val2 && i != PimContactsQt::_sortSpecs.constEnd());

    if (sortSpec.second == bbpim::SortOrder::Ascending) {
        return val1 < val2;
    } else {
        return !(val1 < val2);
    }
}

Json::Value PimContactsQt::assembleSearchResults(const QSet<bbpim::ContactId>& resultIds, const Json::Value& contactFields, int limit)
{
    QMap<bbpim::ContactId, bbpim::Contact> completeResults;

    // put complete contacts in map
    for (QSet<bbpim::ContactId>::const_iterator i = resultIds.constBegin(); i != resultIds.constEnd(); i++) {
        completeResults.insertMulti(*i, _contactSearchMap[*i]);
    }

    // sort results based on sort specs
    QList<bbpim::Contact> sortedResults = completeResults.values();
    if (!_sortSpecs.empty()) {
        qSort(sortedResults.begin(), sortedResults.end(), lessThan);
    }

    Json::Value contactArray;

    // if limit is -1, returned all available results, otherwise return based on the number passed in find options
    if (limit == -1) {
        limit = sortedResults.size();
    } else {
        limit = std::min(limit, sortedResults.size());
    }

    for (int i = 0; i < limit; i++) {
        Json::Value contactItem = populateContact(sortedResults[i], contactFields);
        contactArray.append(contactItem);
    }

    return contactArray;
}
*/

/****************************************************************
 * Helper functions shared by Find and Save
 ****************************************************************/
/*
Json::Value PimContactsQt::populateContact(bbpim::Contact& contact, const Json::Value& contactFields)
{
    Json::Value contactItem;

    for (int i = 0; i < contactFields.size(); i++) {
        std::string field = contactFields[i].asString();
        std::map<std::string, bbpim::AttributeKind::Type>::const_iterator kindIter = _attributeKindMap.find(field);

        if (kindIter != _attributeKindMap.end()) {
            switch (kindIter->second) {
                case bbpim::AttributeKind::Name: {
                    contactItem[field] = Json::Value();
                    populateField(contact, kindIter->second, contactItem[field], false, false);
                    break;
                }

                case bbpim::AttributeKind::OrganizationAffiliation: {
                    contactItem[field] = Json::Value();
                    populateOrganizations(contact, contactItem[field]);
                    break;
                }

                case bbpim::AttributeKind::Date:
                case bbpim::AttributeKind::Note:
                case bbpim::AttributeKind::Sound: {
                    populateField(contact, kindIter->second, contactItem, false, false);
                    break;
                }

                case bbpim::AttributeKind::VideoChat: {
                    contactItem[field] = Json::Value();
                    populateField(contact, kindIter->second, contactItem[field], false, true);
                    break;
                }

                case bbpim::AttributeKind::Email:
                case bbpim::AttributeKind::Fax:
                case bbpim::AttributeKind::Pager:
                case bbpim::AttributeKind::Phone:
                case bbpim::AttributeKind::Profile:
                case bbpim::AttributeKind::Website:
                case bbpim::AttributeKind::InstantMessaging: {
                    contactItem[field] = Json::Value();
                    populateField(contact, kindIter->second, contactItem[field], true, false);
                    break;
                }

                // Special cases (treated differently in ContactBuilder):
                default: {
                    if (field == "addresses") {
                        contactItem[field] = Json::Value();
                        populateAddresses(contact, contactItem[field]);
                    } else if (field == "photos") {
                        contactItem[field] = Json::Value();
                        populatePhotos(contact, contactItem[field]);
                    }

                    break;
                }
            }
        } else {
            if (field == "displayName" || field == "nickname") {
                populateDisplayNameNickName(contact, contactItem, field);
            }
        }
    }

    contactItem["id"] = Json::Value(contact.id());
    contactItem["favorite"] = Json::Value(contact.isFavourite()); // always populate favorite

    return contactItem;
}
*/
/****************************************************************
 * Helper functions for Save
 ****************************************************************/
/*
void PimContactsQt::addAttributeKind(bbpim::ContactBuilder& contactBuilder, const Json::Value& jsonObj, const std::string& field)
{
    StringToKindMap::const_iterator kindIter = _attributeKindMap.find(field);

    if (kindIter != _attributeKindMap.end()) {
        switch (kindIter->second) {
            // Attributes requiring group keys:
            case bbpim::AttributeKind::Name: {
                QList<SubkindValuePair> convertedList = convertGroupedAttributes(jsonObj);
                addConvertedGroupedList(contactBuilder, kindIter->second, convertedList, "1");
                break;
            }
            case bbpim::AttributeKind::OrganizationAffiliation: {
                for (int i = 0; i < jsonObj.size(); i++) {
                    std::stringstream groupKeyStream;
                    groupKeyStream << i + 1;

                    QList<SubkindValuePair> convertedList = convertGroupedAttributes(jsonObj[i]);
                    addConvertedGroupedList(contactBuilder, kindIter->second, convertedList, groupKeyStream.str());
                }

                break;
            }

            // String arrays:
            case bbpim::AttributeKind::VideoChat: {
                QList<SubkindValuePair> convertedList = convertStringArray(jsonObj, bbpim::AttributeSubKind::VideoChatBbPlaybook);
                addConvertedList(contactBuilder, kindIter->second, convertedList);
                break;
            }

            // Dates:
            case bbpim::AttributeKind::Date: {
                StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(field);

                if (subkindIter != _attributeSubKindMap.end()) {
                    std::string value = jsonObj.asString();
                    addAttributeDate(contactBuilder, kindIter->second, subkindIter->second, value);
                }

                break;
            }

            // Strings:
            case bbpim::AttributeKind::Note:
            case bbpim::AttributeKind::Sound: {
                StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(field);

                if (subkindIter != _attributeSubKindMap.end()) {
                    QList<SubkindValuePair> convertedList;
                    std::string value = jsonObj.asString();
                    convertedList.append(SubkindValuePair(subkindIter->second, value));
                    addConvertedList(contactBuilder, kindIter->second, convertedList);
                }

                break;
            }

            // ContactField attributes:
            case bbpim::AttributeKind::Phone:
            case bbpim::AttributeKind::Email:
            case bbpim::AttributeKind::Fax:
            case bbpim::AttributeKind::Pager:
            case bbpim::AttributeKind::InstantMessaging:
            case bbpim::AttributeKind::Website:
            case bbpim::AttributeKind::Group:
            case bbpim::AttributeKind::Profile: {
                QList<SubkindValuePair> convertedList = convertFieldAttributes(jsonObj);
                addConvertedList(contactBuilder, kindIter->second, convertedList);
                break;
            }

            // Special cases (treated differently in ContactBuilder):
            default: {
                if (field == "addresses") {
                    for (int i = 0; i < jsonObj.size(); i++) {
                        Json::Value addressObj = jsonObj[i];
                        addPostalAddress(contactBuilder, addressObj);
                    }
                } else if (field == "photos") {
                    for (int i = 0; i < jsonObj.size(); i++) {
                        Json::Value photoObj = jsonObj[i];
                        addPhoto(contactBuilder, photoObj);
                    }
                } else if (field == "favorite") {
                    bool isFavorite = jsonObj.asBool();
                    contactBuilder = contactBuilder.setFavorite(isFavorite);
                }

                break;
            }
        }
    }
}

void PimContactsQt::syncAttributeKind(bbpim::Contact& contact, const Json::Value& jsonObj, const std::string& field)
{
    StringToKindMap::const_iterator kindIter = _attributeKindMap.find(field);
    bbpim::ContactBuilder contactBuilder(contact.edit());

    if (kindIter != _attributeKindMap.end()) {
        switch (kindIter->second) {
            // Attributes requiring group keys:
            case bbpim::AttributeKind::Name: {
                QList<QList<bbpim::ContactAttribute> > savedList = contact.filteredAttributesByGroupKey(kindIter->second);
                QList<SubkindValuePair> convertedList = convertGroupedAttributes(jsonObj);

                if (!savedList.empty()) {
                    syncConvertedGroupedList(contactBuilder, kindIter->second, savedList[0], convertedList, "1");
                } else {
                    addConvertedGroupedList(contactBuilder, kindIter->second, convertedList, "1");
                }

                break;
            }
            case bbpim::AttributeKind::OrganizationAffiliation: {
                QList<QList<bbpim::ContactAttribute> > savedList = contact.filteredAttributesByGroupKey(kindIter->second);
                syncAttributeGroup(contactBuilder, kindIter->second, savedList, jsonObj);
                break;
            }

            // String arrays:
            case bbpim::AttributeKind::VideoChat: {
                QList<bbpim::ContactAttribute> savedList = contact.filteredAttributes(kindIter->second);
                QList<SubkindValuePair> convertedList = convertStringArray(jsonObj, bbpim::AttributeSubKind::VideoChatBbPlaybook);
                syncConvertedList(contactBuilder, kindIter->second, savedList, convertedList);
                break;
            }

            // Dates:
            case bbpim::AttributeKind::Date: {
                StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(field);

                if (subkindIter != _attributeSubKindMap.end()) {
                    QList<bbpim::ContactAttribute> savedList = contact.filteredAttributes(kindIter->second);
                    syncAttributeDate(contactBuilder, savedList, subkindIter->second, jsonObj.asString());
                }

                break;
            }

            // Strings:
            case bbpim::AttributeKind::Note:
            case bbpim::AttributeKind::Sound: {
                QList<bbpim::ContactAttribute> savedList = contact.filteredAttributes(kindIter->second);
                QList<SubkindValuePair> convertedList;
                StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(field);

                if (subkindIter != _attributeSubKindMap.end()) {
                    std::string value = jsonObj.asString();
                    convertedList.append(SubkindValuePair(subkindIter->second, value));
                }

                syncConvertedList(contactBuilder, kindIter->second, savedList, convertedList);
                break;
            }

            // ContactField attributes:
            case bbpim::AttributeKind::Phone:
            case bbpim::AttributeKind::Email:
            case bbpim::AttributeKind::Fax:
            case bbpim::AttributeKind::Pager:
            case bbpim::AttributeKind::InstantMessaging:
            case bbpim::AttributeKind::Website:
            case bbpim::AttributeKind::Group:
            case bbpim::AttributeKind::Profile: {
                QList<bbpim::ContactAttribute> savedList = contact.filteredAttributes(kindIter->second);
                QList<SubkindValuePair> convertedList = convertFieldAttributes(jsonObj);
                syncConvertedList(contactBuilder, kindIter->second, savedList, convertedList);
                break;
            }

            // Special cases (treated differently in ContactBuilder):
            default: {
                if (field == "addresses") {
                    QList<bbpim::ContactPostalAddress> savedList = contact.postalAddresses();
                    syncPostalAddresses(contactBuilder, savedList, jsonObj);
                } else if (field == "photos") {
                    QList<bbpim::ContactPhoto> savedList = contact.photos();
                    syncPhotos(contactBuilder, savedList, jsonObj);

                } else if (field == "favorite") {
                    bool isFavorite = jsonObj.asBool();
                    contactBuilder.setFavorite(isFavorite);
                }

                break;
            }
        }
    }
}


QList<SubkindValuePair> PimContactsQt::convertGroupedAttributes(const Json::Value& fieldsObj)
{
    const Json::Value::Members fields = fieldsObj.getMemberNames();
    QList<SubkindValuePair> convertedList;

    for (int i = 0; i < fields.size(); i++) {
        const std::string fieldKey = fields[i];
        StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(fieldKey);

        if (subkindIter != _attributeSubKindMap.end()) {
            convertedList.append(SubkindValuePair(subkindIter->second, fieldsObj[fieldKey].asString()));
        }
    }

    return convertedList;
}

QList<SubkindValuePair> PimContactsQt::convertFieldAttributes(const Json::Value& fieldArray)
{
    QList<SubkindValuePair> convertedList;

    for (int i = 0; i < fieldArray.size(); i++) {
        Json::Value fieldObj = fieldArray[i];
        std::string type = fieldObj.get("type", "").asString();
        std::string value = fieldObj.get("value", "").asString();
        StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(type);

        if (subkindIter != _attributeSubKindMap.end()) {
            convertedList.append(SubkindValuePair(subkindIter->second, value));
        }
    }

    return convertedList;
}

QList<SubkindValuePair> PimContactsQt::convertStringArray(const Json::Value& stringArray, bbpim::AttributeSubKind::Type subkind)
{
    QList<SubkindValuePair> convertedList;

    for (int i = 0; i < stringArray.size(); i++) {
        std::string value = stringArray[i].asString();
        convertedList.append(SubkindValuePair(subkind, value));
    }

    return convertedList;
}

void PimContactsQt::addConvertedList(bbpim::ContactBuilder& contactBuilder, const bbpim::AttributeKind::Type kind, const QList<SubkindValuePair>& convertedList)
{
    for (int i = 0; i < convertedList.size(); i++) {
        //addAttribute(contactBuilder, kind, convertedList[i].first, convertedList[i].second);
        bbpim::ContactAttribute attribute;
        bbpim::ContactAttributeBuilder attributeBuilder(attribute.edit());

        attributeBuilder = attributeBuilder.setKind(kind);
        attributeBuilder = attributeBuilder.setSubKind(convertedList[i].first);
        attributeBuilder = attributeBuilder.setValue(QString(convertedList[i].second.c_str()));

        contactBuilder.addAttribute(attribute);
    }
}

void PimContactsQt::addConvertedGroupedList(bbpim::ContactBuilder& contactBuilder, const bbpim::AttributeKind::Type kind, const QList<SubkindValuePair>& convertedList, const std::string& groupKey)
{
    for (int i = 0; i < convertedList.size(); i++) {
        //addAttributeToGroup(contactBuilder, kind, convertedList[i].first, convertedList[i].second, groupKey);
        bbpim::ContactAttribute attribute;
        bbpim::ContactAttributeBuilder attributeBuilder(attribute.edit());

        attributeBuilder = attributeBuilder.setKind(kind);
        attributeBuilder = attributeBuilder.setSubKind(convertedList[i].first);
        attributeBuilder = attributeBuilder.setValue(QString(convertedList[i].second.c_str()));
        attributeBuilder = attributeBuilder.setGroupKey(QString(groupKey.c_str()));

        contactBuilder.addAttribute(attribute);
    }
}

void PimContactsQt::addAttributeDate(bbpim::ContactBuilder& contactBuilder, const bbpim::AttributeKind::Type kind, const bbpim::AttributeSubKind::Type subkind, const std::string& value)
{
    bbpim::ContactAttribute attribute;
    bbpim::ContactAttributeBuilder attributeBuilder(attribute.edit());

    QDateTime date = QDateTime::fromString(QString(value.c_str()), QString("ddd MMM dd yyyy"));

    attributeBuilder = attributeBuilder.setKind(kind);
    attributeBuilder = attributeBuilder.setSubKind(subkind);

    if (date.isValid()) {
        attributeBuilder = attributeBuilder.setValue(date);
    } else {
        attributeBuilder = attributeBuilder.setValue(QString(value.c_str()));
    }

    contactBuilder.addAttribute(attribute);
}
*/
/*
void PimContactsQt::addAttribute(bbpim::ContactBuilder& contactBuilder, const bbpim::AttributeKind::Type kind, const bbpim::AttributeSubKind::Type subkind, const std::string& value)
{
    bbpim::ContactAttribute attribute;
    bbpim::ContactAttributeBuilder attributeBuilder(attribute.edit());

    attributeBuilder = attributeBuilder.setKind(kind);
    attributeBuilder = attributeBuilder.setSubKind(subkind);
    attributeBuilder = attributeBuilder.setValue(QString(value.c_str()));

    contactBuilder.addAttribute(attribute);
}
*/

/*
void PimContactsQt::addAttributeToGroup(bbpim::ContactBuilder& contactBuilder, const bbpim::AttributeKind::Type kind, const bbpim::AttributeSubKind::Type subkind, const std::string& value, const std::string& groupKey)
{
    bbpim::ContactAttribute attribute;
    bbpim::ContactAttributeBuilder attributeBuilder(attribute.edit());

    attributeBuilder = attributeBuilder.setKind(kind);
    attributeBuilder = attributeBuilder.setSubKind(subkind);
    attributeBuilder = attributeBuilder.setValue(QString(value.c_str()));
    attributeBuilder = attributeBuilder.setGroupKey(QString(groupKey.c_str()));

    contactBuilder.addAttribute(attribute);
}
*/
/*
void PimContactsQt::addPostalAddress(bbpim::ContactBuilder& contactBuilder, const Json::Value& addressObj)
{
    bbpim::ContactPostalAddress address;
    bbpim::ContactPostalAddressBuilder addressBuilder(address.edit());

    if (addressObj.isMember("type")) {
        std::string value = addressObj["type"].asString();
        StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(value);

        if (subkindIter != _attributeSubKindMap.end()) {
            addressBuilder = addressBuilder.setSubKind(subkindIter->second);
        }
    }

    addressBuilder = addressBuilder.setLine1(QString(addressObj.get("streetAddress", "").asCString()));
    addressBuilder = addressBuilder.setLine2(QString(addressObj.get("streetOther", "").asCString()));
    addressBuilder = addressBuilder.setCity(QString(addressObj.get("locality", "").asCString()));
    addressBuilder = addressBuilder.setRegion(QString(addressObj.get("region", "").asCString()));
    addressBuilder = addressBuilder.setCountry(QString(addressObj.get("country", "").asCString()));
    addressBuilder = addressBuilder.setPostalCode(QString(addressObj.get("postalCode", "").asCString()));

    contactBuilder = contactBuilder.addPostalAddress(address);
}

void PimContactsQt::addPhoto(bbpim::ContactBuilder& contactBuilder, const Json::Value& photoObj)
{
    bbpim::ContactPhoto photo;
    bbpim::ContactPhotoBuilder photoBuilder(photo.edit());

    std::string filepath = photoObj.get("originalFilePath", "").asString();
    bool pref = photoObj.get("pref", false).asBool();

    photoBuilder.setOriginalPhoto(QString(filepath.c_str()));
    photoBuilder.setPrimaryPhoto(pref);

    contactBuilder = contactBuilder.addPhoto(photo, pref);
}


void PimContactsQt::syncConvertedList(bbpim::ContactBuilder& contactBuilder, bbpim::AttributeKind::Type kind, QList<bbpim::ContactAttribute> savedList, const QList<SubkindValuePair>& convertedList)
{
    int index;

    for (index = 0; index < savedList.size() && index < convertedList.size(); index++) {
        if (savedList[index].subKind() != convertedList[index].first || savedList[index].value().toStdString() != convertedList[index].second) {
            bbpim::ContactAttributeBuilder attributeBuilder(savedList[index].edit());
            attributeBuilder = attributeBuilder.setSubKind(convertedList[index].first);
            attributeBuilder = attributeBuilder.setValue(QString(convertedList[index].second.c_str()));
        }
    }

    if (index < savedList.size()) {
        for (; index < savedList.size(); index++) {
            contactBuilder = contactBuilder.deleteAttribute(savedList[index]);
        }
    } else if (index < convertedList.size()) {
        for (; index < convertedList.size(); index++) {
            QList<SubkindValuePair> remainingList = convertedList.mid(index);
            addConvertedList(contactBuilder, kind, remainingList);
        }
    }
}

void PimContactsQt::syncConvertedGroupedList(bbpim::ContactBuilder& contactBuilder, bbpim::AttributeKind::Type kind, QList<bbpim::ContactAttribute> savedList, QList<SubkindValuePair> convertedList, const std::string& groupKey)
{
    int index;

    for (index = 0; index < savedList.size() && index < convertedList.size(); index++) {
        bbpim::ContactAttributeBuilder attributeBuilder(savedList[index].edit());
        attributeBuilder = attributeBuilder.setSubKind(convertedList[index].first);
        attributeBuilder = attributeBuilder.setValue(QString(convertedList[index].second.c_str()));
        attributeBuilder = attributeBuilder.setGroupKey(QString(groupKey.c_str()));
    }

    if (index < savedList.size()) {
        for (; index < savedList.size(); index++) {
            contactBuilder = contactBuilder.deleteAttribute(savedList[index]);
        }
    } else if (index < convertedList.size()) {
        for (; index < convertedList.size(); index++) {
            QList<SubkindValuePair> remainingList = convertedList.mid(index);
            addConvertedList(contactBuilder, kind, remainingList);
        }
    }
}

void PimContactsQt::syncAttributeGroup(bbpim::ContactBuilder& contactBuilder, bbpim::AttributeKind::Type kind, QList<QList<bbpim::ContactAttribute> > savedList, const Json::Value& jsonObj)
{
    int i;

    for (i = 0; i < jsonObj.size() && i < savedList.size(); i++) {
        std::stringstream groupKeyStream;
        groupKeyStream << i + 1;

        QList<SubkindValuePair> convertedList = convertGroupedAttributes(jsonObj[i]);
        syncConvertedGroupedList(contactBuilder, kind, savedList[i], convertedList, groupKeyStream.str());
    }

    if (i < savedList.size()) {
        for (; i < savedList.size(); i++) {
            for (int j = 0; j < savedList[i].size(); j++) {
                contactBuilder = contactBuilder.deleteAttribute(savedList[i][j]);
            }
        }
    } else if (i < jsonObj.size()) {
        for (; i < jsonObj.size(); i++) {
            std::stringstream groupKeyStream;
            groupKeyStream << i + 1;

            QList<SubkindValuePair> convertedList = convertGroupedAttributes(jsonObj[i]);
            addConvertedGroupedList(contactBuilder, kind, convertedList, groupKeyStream.str());
        }
    }
}

void PimContactsQt::syncAttributeDate(bbpim::ContactBuilder& contactBuilder, QList<bbpim::ContactAttribute>& savedList, const bbpim::AttributeSubKind::Type subkind, const std::string& value)
{
    bool found = false;

    for (int i = 0; i < savedList.size(); i++) {
        if (savedList[i].subKind() == subkind) {
            if (found) {
                contactBuilder = contactBuilder.deleteAttribute(savedList[i]);
            } else {
                found = true;
                bbpim::ContactAttributeBuilder attributeBuilder(savedList[i].edit());
                QDateTime date = QDateTime::fromString(QString(value.c_str()), QString("ddd MMM dd yyyy"));

                if (date.isValid()) {
                    attributeBuilder = attributeBuilder.setValue(date);
                } else {
                    attributeBuilder = attributeBuilder.setValue(QString(value.c_str()));
                }
            }
        }
    }
}

void PimContactsQt::syncPostalAddresses(bbpim::ContactBuilder& contactBuilder, QList<bbpim::ContactPostalAddress>& savedList, const Json::Value& jsonObj)
{
    int i;

    for (i = 0; i < savedList.size() && i < jsonObj.size(); i++) {
        Json::Value addressObj = jsonObj[i];
        bbpim::ContactPostalAddressBuilder addressBuilder(savedList[i].edit());

        std::string type = addressObj.get("type", "other").asString();
        StringToSubKindMap::const_iterator subkindIter = _attributeSubKindMap.find(type);

        if (subkindIter != _attributeSubKindMap.end()) {
            addressBuilder = addressBuilder.setSubKind(subkindIter->second);
        }

        addressBuilder = addressBuilder.setLine1(QString(addressObj.get("streetAddress", "").asCString()));
        addressBuilder = addressBuilder.setLine2(QString(addressObj.get("streetOther", "").asCString()));
        addressBuilder = addressBuilder.setCity(QString(addressObj.get("locality", "").asCString()));
        addressBuilder = addressBuilder.setRegion(QString(addressObj.get("region", "").asCString()));
        addressBuilder = addressBuilder.setCountry(QString(addressObj.get("country", "").asCString()));
        addressBuilder = addressBuilder.setPostalCode(QString(addressObj.get("postalCode", "").asCString()));
    }

    if (i < savedList.size()) {
        for (; i < savedList.size(); i++) {
            contactBuilder = contactBuilder.deletePostalAddress(savedList[i]);
        }
    } else if (i < jsonObj.size()) {
        for (; i < jsonObj.size(); i++) {
            addPostalAddress(contactBuilder, jsonObj[i]);
        }
    }
}

void PimContactsQt::syncPhotos(bbpim::ContactBuilder& contactBuilder, QList<bbpim::ContactPhoto>& savedList, const Json::Value& jsonObj)
{
    int i;

    for (i = 0; i < savedList.size() && i < jsonObj.size(); i++) {
        std::string filepath = jsonObj[i].get("originalFilePath", "").asString();
        bool pref = jsonObj[i].get("pref", false).asBool();

        bbpim::ContactPhotoBuilder photoBuilder(savedList[i].edit());
        photoBuilder.setOriginalPhoto(QString(filepath.c_str()));
        photoBuilder.setPrimaryPhoto(pref);
    }

    if (i < savedList.size()) {
        for (; i < savedList.size(); i++) {
            contactBuilder = contactBuilder.deletePhoto(savedList[i]);
        }
    } else if (i < jsonObj.size()) {
        for (; i < jsonObj.size(); i++) {
            addPhoto(contactBuilder, jsonObj[i]);
        }
    }
}
*/
/****************************************************************
 * Mapping functions
 ****************************************************************/
/*
void PimContactsQt::createAttributeKindMap()
{
    _attributeKindMap["phoneNumbers"] = bbpim::AttributeKind::Phone;
    _attributeKindMap["faxNumbers"] = bbpim::AttributeKind::Fax;
    _attributeKindMap["pagerNumbers"] = bbpim::AttributeKind::Pager;
    _attributeKindMap["emails"] = bbpim::AttributeKind::Email;
    _attributeKindMap["urls"] = bbpim::AttributeKind::Website;
    _attributeKindMap["socialNetworks"] = bbpim::AttributeKind::Profile;
    _attributeKindMap["anniversary"] = bbpim::AttributeKind::Date;
    _attributeKindMap["birthday"] = bbpim::AttributeKind::Date;
    _attributeKindMap["categories"] = bbpim::AttributeKind::Group;
    _attributeKindMap["name"] = bbpim::AttributeKind::Name;
    _attributeKindMap["organizations"] = bbpim::AttributeKind::OrganizationAffiliation;
    _attributeKindMap["education"] = bbpim::AttributeKind::Education;
    _attributeKindMap["note"] = bbpim::AttributeKind::Note;
    _attributeKindMap["ims"] = bbpim::AttributeKind::InstantMessaging;
    _attributeKindMap["ringtone"] = bbpim::AttributeKind::Sound;
    _attributeKindMap["videoChat"] = bbpim::AttributeKind::VideoChat;
    _attributeKindMap["addresses"] = bbpim::AttributeKind::Invalid;
    _attributeKindMap["favorite"] = bbpim::AttributeKind::Invalid;
    _attributeKindMap["photos"] = bbpim::AttributeKind::Invalid;
}

void PimContactsQt::createAttributeSubKindMap()
{
    _attributeSubKindMap["other"] = bbpim::AttributeSubKind::Other;
    _attributeSubKindMap["home"] = bbpim::AttributeSubKind::Home;
    _attributeSubKindMap["work"] = bbpim::AttributeSubKind::Work;
    _attributeSubKindMap["mobile"] = bbpim::AttributeSubKind::PhoneMobile;
    _attributeSubKindMap["direct"] = bbpim::AttributeSubKind::FaxDirect;
    _attributeSubKindMap["blog"] = bbpim::AttributeSubKind::Blog;
    _attributeSubKindMap["resume"] = bbpim::AttributeSubKind::WebsiteResume;
    _attributeSubKindMap["portfolio"] = bbpim::AttributeSubKind::WebsitePortfolio;
    _attributeSubKindMap["personal"] = bbpim::AttributeSubKind::WebsitePersonal;
    _attributeSubKindMap["company"] = bbpim::AttributeSubKind::WebsiteCompany;
    _attributeSubKindMap["facebook"] = bbpim::AttributeSubKind::ProfileFacebook;
    _attributeSubKindMap["twitter"] = bbpim::AttributeSubKind::ProfileTwitter;
    _attributeSubKindMap["linkedin"] = bbpim::AttributeSubKind::ProfileLinkedIn;
    _attributeSubKindMap["gist"] = bbpim::AttributeSubKind::ProfileGist;
    _attributeSubKindMap["tungle"] = bbpim::AttributeSubKind::ProfileTungle;
    _attributeSubKindMap["birthday"] = bbpim::AttributeSubKind::DateBirthday;
    _attributeSubKindMap["anniversary"] = bbpim::AttributeSubKind::DateAnniversary;
    _attributeSubKindMap["categories"] = bbpim::AttributeSubKind::GroupDepartment;
    _attributeSubKindMap["givenName"] = bbpim::AttributeSubKind::NameGiven;
    _attributeSubKindMap["familyName"] = bbpim::AttributeSubKind::NameSurname;
    _attributeSubKindMap["honorificPrefix"] = bbpim::AttributeSubKind::Title;
    _attributeSubKindMap["honorificSuffix"] = bbpim::AttributeSubKind::NameSuffix;
    _attributeSubKindMap["middleName"] = bbpim::AttributeSubKind::NameMiddle;
    _attributeSubKindMap["nickname"] = bbpim::AttributeSubKind::NameNickname;
    _attributeSubKindMap["displayName"] = bbpim::AttributeSubKind::NameDisplayName;
    _attributeSubKindMap["phoneticGivenName"] = bbpim::AttributeSubKind::NamePhoneticGiven;
    _attributeSubKindMap["phoneticFamilyName"] = bbpim::AttributeSubKind::NamePhoneticSurname;
    _attributeSubKindMap["name"] = bbpim::AttributeSubKind::OrganizationAffiliationName;
    _attributeSubKindMap["department"] = bbpim::AttributeSubKind::OrganizationAffiliationDetails;
    _attributeSubKindMap["title"] = bbpim::AttributeSubKind::Title;
    _attributeSubKindMap["BbmPin"] = bbpim::AttributeSubKind::InstantMessagingBbmPin;
    _attributeSubKindMap["Aim"] = bbpim::AttributeSubKind::InstantMessagingAim;
    _attributeSubKindMap["Aliwangwang"] = bbpim::AttributeSubKind::InstantMessagingAliwangwang;
    _attributeSubKindMap["GoogleTalk"] = bbpim::AttributeSubKind::InstantMessagingGoogleTalk;
    _attributeSubKindMap["Sametime"] = bbpim::AttributeSubKind::InstantMessagingSametime;
    _attributeSubKindMap["Icq"] = bbpim::AttributeSubKind::InstantMessagingIcq;
    _attributeSubKindMap["Jabber"] = bbpim::AttributeSubKind::InstantMessagingJabber;
    _attributeSubKindMap["MsLcs"] = bbpim::AttributeSubKind::InstantMessagingMsLcs;
    _attributeSubKindMap["Skype"] = bbpim::AttributeSubKind::InstantMessagingSkype;
    _attributeSubKindMap["YahooMessenger"] = bbpim::AttributeSubKind::InstantMessagingYahooMessenger;
    _attributeSubKindMap["YahooMessegerJapan"] = bbpim::AttributeSubKind::InstantMessagingYahooMessengerJapan;
    _attributeSubKindMap["BbPlaybook"] = bbpim::AttributeSubKind::VideoChatBbPlaybook;
    _attributeSubKindMap["ringtone"] = bbpim::AttributeSubKind::SoundRingtone;
    _attributeSubKindMap["note"] = bbpim::AttributeSubKind::Invalid;
}

void PimContactsQt::createKindAttributeMap() {
    _kindAttributeMap[bbpim::AttributeKind::Phone] = "phoneNumbers";
    _kindAttributeMap[bbpim::AttributeKind::Fax] = "faxNumbers";
    _kindAttributeMap[bbpim::AttributeKind::Pager] = "pagerNumber";
    _kindAttributeMap[bbpim::AttributeKind::Email] = "emails";
    _kindAttributeMap[bbpim::AttributeKind::Website] = "urls";
    _kindAttributeMap[bbpim::AttributeKind::Profile] = "socialNetworks";
    _kindAttributeMap[bbpim::AttributeKind::OrganizationAffiliation] = "organizations";
    _kindAttributeMap[bbpim::AttributeKind::Education] = "education";
    _kindAttributeMap[bbpim::AttributeKind::Note] = "note";
    _kindAttributeMap[bbpim::AttributeKind::InstantMessaging] = "ims";
    _kindAttributeMap[bbpim::AttributeKind::VideoChat] = "videoChat";
    _kindAttributeMap[bbpim::AttributeKind::Sound] = "ringtone";
    _kindAttributeMap[bbpim::AttributeKind::Website] = "urls";
}

void PimContactsQt::createSubKindAttributeMap() {
    _subKindAttributeMap[bbpim::AttributeSubKind::Other] = "other";
    _subKindAttributeMap[bbpim::AttributeSubKind::Home] = "home";
    _subKindAttributeMap[bbpim::AttributeSubKind::Work] = "work";
    _subKindAttributeMap[bbpim::AttributeSubKind::PhoneMobile] = "mobile";
    _subKindAttributeMap[bbpim::AttributeSubKind::FaxDirect] = "direct";
    _subKindAttributeMap[bbpim::AttributeSubKind::Blog] = "blog";
    _subKindAttributeMap[bbpim::AttributeSubKind::WebsiteResume] = "resume";
    _subKindAttributeMap[bbpim::AttributeSubKind::WebsitePortfolio] = "portfolio";
    _subKindAttributeMap[bbpim::AttributeSubKind::WebsitePersonal] = "personal";
    _subKindAttributeMap[bbpim::AttributeSubKind::WebsiteCompany] = "company";
    _subKindAttributeMap[bbpim::AttributeSubKind::ProfileFacebook] = "facebook";
    _subKindAttributeMap[bbpim::AttributeSubKind::ProfileTwitter] = "twitter";
    _subKindAttributeMap[bbpim::AttributeSubKind::ProfileLinkedIn] = "linkedin";
    _subKindAttributeMap[bbpim::AttributeSubKind::ProfileGist] = "gist";
    _subKindAttributeMap[bbpim::AttributeSubKind::ProfileTungle] = "tungle";
    _subKindAttributeMap[bbpim::AttributeSubKind::DateBirthday] = "birthday";
    _subKindAttributeMap[bbpim::AttributeSubKind::DateAnniversary] = "anniversary";
    _subKindAttributeMap[bbpim::AttributeSubKind::NameGiven] = "givenName";
    _subKindAttributeMap[bbpim::AttributeSubKind::NameSurname] = "familyName";
    _subKindAttributeMap[bbpim::AttributeSubKind::Title] = "honorificPrefix";
    _subKindAttributeMap[bbpim::AttributeSubKind::NameSuffix] = "honorificSuffix";
    _subKindAttributeMap[bbpim::AttributeSubKind::NameMiddle] = "middleName";
    _subKindAttributeMap[bbpim::AttributeSubKind::NamePhoneticGiven] = "phoneticGivenName";
    _subKindAttributeMap[bbpim::AttributeSubKind::NamePhoneticSurname] = "phoneticFamilyName";
    _subKindAttributeMap[bbpim::AttributeSubKind::NameNickname] = "nickname";
    _subKindAttributeMap[bbpim::AttributeSubKind::NameDisplayName] = "displayName";
    _subKindAttributeMap[bbpim::AttributeSubKind::OrganizationAffiliationName] = "name";
    _subKindAttributeMap[bbpim::AttributeSubKind::OrganizationAffiliationDetails] = "department";
    _subKindAttributeMap[bbpim::AttributeSubKind::Title] = "title";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingBbmPin] = "BbmPin";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingAim] = "Aim";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingAliwangwang] = "Aliwangwang";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingGoogleTalk] = "GoogleTalk";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingSametime] = "Sametime";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingIcq] = "Icq";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingJabber] = "Jabber";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingMsLcs] = "MsLcs";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingSkype] = "Skype";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingYahooMessenger] = "YahooMessenger";
    _subKindAttributeMap[bbpim::AttributeSubKind::InstantMessagingYahooMessengerJapan] = "YahooMessegerJapan";
    _subKindAttributeMap[bbpim::AttributeSubKind::VideoChatBbPlaybook] = "BbPlaybook";
    _subKindAttributeMap[bbpim::AttributeSubKind::SoundRingtone] = "ringtone";
}
*/
} // namespace webworks

