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
#include "pim_message_ndk.hpp"

namespace webworks {

    PimMessageNdk::PimMessageNdk()
    {
    }

    PimMessageNdk::~PimMessageNdk()
    {
    }

    /*******************************************************************
    PUBLIC FUNCTIONS
    *******************************************************************/

    Json::Value PimMessageNdk::getAccounts()
    {
        Json::Value returnObj;
        
        const QList<Account>accountList = AccountService().accounts(Service::Messages);
        Json::Value accountArray;
        for (int i = 0; i < accountList.size(); i++)
        {
            Account account = accountList[i];
            accountArray.append(accountToJson(account));
        }
        returnObj["accounts"] = accountArray;
        
        return returnObj;
    }

    Json::Value PimMessageNdk::getDefaultAccount() 
    {
        Json::Value returnObj;

        const QMap<Service::Type, Account> defaultAccounts = AccountService().defaultAccounts();
        Account defaultAccount = defaultAccounts[Service::Messages];
        returnObj = accountToJson(defaultAccount);

        return returnObj;
    }

    void PimMessageNdk::send(const Json::Value& argsObj) 
    {
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

    /*******************************************************************
    PRIVATE FUNCTIONS
    *******************************************************************/

    Json::Value PimMessageNdk::accountToJson(Account account)
    {
        Json::Value accountJson;

        std::string accountIdString;
        std::stringstream ss;
        ss << account.id();
        accountIdString = ss.str();

        accountJson["id"] = Json::Value(accountIdString);
        accountJson["name"] = Json::Value(account.displayName().toStdString());

        Json::Value accountFoldersArray;
        const QList<MessageFolder> accountFolders = MessageService().folders(account.id());
        for (int i = 0; i < accountFolders.size(); i++)
        {
            MessageFolder messageFolder = accountFolders[i];
            accountFoldersArray.append(folderToJson(messageFolder));
        }
        accountJson["folders"] = accountFoldersArray;

        return accountJson;
    }

    Json::Value PimMessageNdk::folderToJson(MessageFolder folder)
    {
        Json::Value folderJson;
        
        folderJson["type"] = Json::Value(folder.type());
        folderJson["name"] = Json::Value(folder.name().toStdString());
        
        return folderJson;
    }

} //namespace webworks
