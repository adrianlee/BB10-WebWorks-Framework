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
#include <stdio.h>
#include <string>
#include <sstream>
#include <QList>
#include <QtCore>
#include "pim_message_ndk.hpp"

namespace webworks {

    PimMessageNdk::PimMessageNdk()
    {
    }

    PimMessageNdk::~PimMessageNdk()
    {
    }

    /****************************************************************
    * Public Functions
    ****************************************************************/
    
    Json::Value PimMessageNdk::getAccounts()
    {
        fprintf(stderr, "Inside getAccounts of pim_message_ndk.cpp \n");
    
        qDebug() << "Before calling AccountService";

        //Grab list of accounts
        QList<Account> accountList = AccountService().accounts(Service::Messages);
        
        qDebug() << accountList;

        qDebug() << "before the for loop";
        
        //Create Json object containing array of accounts
        Json::Value accountArray;
        for (int i = 0; i < accountList.size(); i++)
        {
            qDebug() << "inside the for loop";

            Account c_account = accountList[i];

            //Json representation of account
            Json::Value accountJson;
            
            std::string accountIdString;
            std::stringstream ss;
            ss << c_account.id();
            accountIdString = ss.str();

            fprintf(stderr, "%s\n",accountIdString.c_str());

            accountJson["id"] = Json::Value(accountIdString);
            accountJson["displayName"] = Json::Value(c_account.displayName().toStdString());

            accountArray.append(accountJson);
        }
        qDebug() << "after the for loop";

        Json::Value returnObj;
        returnObj["accounts"] = accountArray;
        return returnObj;
    }

    void PimMessageNdk::send(const Json::Value& argsObj) {
        bb::pim::message::MessageBuilder *builder = MessageBuilder::create(-1);

        QString *subjectString = new QString(argsObj["subject"].asCString());
        builder->subject(*subjectString);

        QString *recipientString = new QString(argsObj["recipient"].asCString());
        MessageContact recipient = MessageContact(-1, MessageContact::To, QString(), *recipientString);
        builder->addRecipient(recipient);

        QString *bodyString = new QString(argsObj["body"].asCString());
        builder->body(MessageBody::PlainText, bodyString->toUtf8());

        bb::pim::message::MessageService messageService;
        messageService.send(-1, *builder);
    }

} //namespace webworks
