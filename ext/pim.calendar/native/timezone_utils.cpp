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

#include <bb/pim/calendar/CalendarService>
#include <bb/pim/calendar/CalendarSettings>
#include <bb/pim/calendar/Result>
#include <unicode/calendar.h>
#include <unicode/timezone.h>
#include <qDebug>

#include "timezone_utils.hpp"

QString TimezoneUtils::getCurrentTimezone()
{
    bb::pim::calendar::CalendarService service;
    bb::pim::calendar::Result::Type result;
    bb::pim::calendar::CalendarSettings settings = service.settings(&result);

    //if (result == 0) {
       // return settings.timezoneDatabaseId();
    //}
    return QString("America/Los_Angeles");
    //return QString();
}

int TimezoneUtils::offsetFromUtcToTz(QDateTime date, QString timezoneId, bool& error)
{
    int offset = 0;
    UErrorCode errorCode = U_ZERO_ERROR;

    // get timezone object
    TimeZone* tz = TimeZone::createTimeZone((UChar*) timezoneId.data());
    if (!tz) {
        error = true;
        return 0;
    }

    UnicodeString name;
    tz->getDisplayName(name);
    QByteArray string = timezoneId.toLocal8Bit();

    // get offset
    // cal takes ownership of tz - tried to delete it and got an error
    Calendar* cal = Calendar::createInstance(tz, errorCode);
    if (!cal || errorCode > 0) {
        error = true;
        return 0;
    }
    cal->set(date.date().year(), date.date().month(), date.date().day(), date.time().hour(), date.time().minute());
    UDate udate = cal->getTime(errorCode);
    if (errorCode > 0) {
        error = true;
        delete cal;
        return 0;
    }

    UBool isGmt = false;
    int32_t rawOffset = 0;
    int32_t dstOffset = 0;
    tz->getOffset(udate, isGmt, rawOffset, dstOffset, errorCode);
    if (errorCode > 0) {
        error = true;
        delete cal;
        return 0;
    }
    offset = rawOffset + dstOffset;
    delete cal;

    offset /= 1000;

    error = false;
    fprintf(stderr, "just before fromUtcToTz return: %d\n", offset);
    return offset;
}

// from timezoneId to local
// returns offset in seconds
int TimezoneUtils::offsetFromTzToLocal(QDateTime date, QString timezoneId, bool& error) {
    bool utcToTzError = false;
    int utcToTz = offsetFromUtcToTz(date, timezoneId, utcToTzError);
    if (utcToTzError) {
        error = true;
        return 0;
    }

    int tzToUtc = -utcToTz;
    bool utcToLocalError = false;
    int utcToLocal = offsetFromUtcToTz(date, getCurrentTimezone(), utcToLocalError);
    if (utcToLocalError) {
        error = true;
        return 0;
    }
    int tzToLocal = tzToUtc + utcToLocal;
    error = false;
    return tzToLocal;
}

QDateTime TimezoneUtils::convertFromLocalToUtc(QDateTime date, QString timezoneId)
{
    fprintf(stderr, "Date from param: %s\n", date.toString().toStdString().c_str());
    fprintf(stderr, "TimezoneId from param: %s\n", timezoneId.toStdString().c_str());

    if (timezoneId == "") {
        timezoneId = getCurrentTimezone();
        fprintf(stderr, "get current timezone: %s\n", getCurrentTimezone().toStdString().c_str());
    }

    bool utcToTzError = false;
    int offset = offsetFromUtcToTz(date, /*timezoneId*/getCurrentTimezone(), utcToTzError);

    fprintf(stderr, "Offset: %d\n", offset);
    fprintf(stderr, "Error: %s\n", utcToTzError ? "true" : "false");

    QDateTime convertedDate = date.addSecs(offset);
    fprintf(stderr, "Converted date: %s\n", convertedDate.toString().toStdString().c_str());
    return convertedDate;
}

QDateTime TimezoneUtils::convertToLocalTimezone(QDateTime date, QString timezoneId)
{
    if (timezoneId == getCurrentTimezone() || timezoneId == "") { // TODO revisit
        return date;
    }

    bool error = false;
    int offset = offsetFromTzToLocal(date, timezoneId, error);
    QDateTime convertedDate;
    if (!error) {
        convertedDate = date.addSecs(offset);
        //QDateTime convertedDate2 = convertToLocalTimezone2(date, timezoneId);

        //if (convertedDate != convertedDate2) {
        //   QByteArray string = (convertedDate.toString()+ " to: " + convertedDate2.toString()).toLocal8Bit();
        //}
    } //else {
        //convertedDate = convertToLocalTimezone2(date, timezoneId);
    //}

    return convertedDate;
}

QDateTime TimezoneUtils::convertFromLocalTimezone(QDateTime date, QString timezoneId)
{
    if (timezoneId == getCurrentTimezone() || timezoneId == "") { // TODO revisit
        return date;
    }

    bool error = false;
    int offset = offsetFromTzToLocal(date, timezoneId, error);
    QDateTime convertedDate;
    if (!error) {
        convertedDate = date.addSecs(-offset);
        //QDateTime convertedDate2 = convertFromLocalTimezone2(date, timezoneId);
        //if (convertedDate != convertedDate2) {
          // QByteArray string = (convertedDate.toString()+ " to: " + convertedDate2.toString()).toLocal8Bit();
       // }
    } //else {
       // convertedDate = convertFromLocalTimezone2(date, timezoneId);
    //}

    return convertedDate;
}
