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

    /*
    ----Public Functions
    */

    Json::Value PimMessageNdk::getAccounts()
    {
        Json::Value accountArray;
        
        const QList<Account>accountList = AccountService().accounts(Service::Messages);
        for (int i = 0; i < accountList.size(); i++)
        {
            Account account = accountList[i];
            accountArray.append(accountToJson(account));
        }

        return accountArray;
    }

    Json::Value PimMessageNdk::getDefaultAccount() 
    {
        Json::Value defaultAccountJson;

        const QMap<Service::Type, Account> defaultAccounts = AccountService().defaultAccounts();
        Account defaultAccount = defaultAccounts[Service::Messages];
        defaultAccountJson = accountToJson(defaultAccount);

        return defaultAccountJson;
    }

    Json::Value PimMessageNdk::send(const Json::Value& argsObj) 
    {
        Json::Value returnObj;
        
        return returnObj;
    }
    Json::Value PimMessageNdk::save(const Json::Value& argsObj)
    {
        Json::Value returnObj;
        
        return returnObj;
    }
    Json::Value PimMessageNdk::saveAttachment(const Json::Value& argsObj)
    {
        Json::Value returnObj;
        
        return returnObj;
    }

    /*
    ----Private Functions
    */

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
