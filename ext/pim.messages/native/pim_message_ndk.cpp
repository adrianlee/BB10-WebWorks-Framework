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

    /****************************************************************
    * Public Functions
    ****************************************************************/
    
    Json::Value PimMessageNdk::getAccounts()
    {
        //Grab list of accounts
        QList<Account> accountList = AccountService().accounts(Service::Messages);
        
        //Create Json object containing array of account
        Json::Value = accountArray;
        for (int i = 0; i < accountList.size(); i++)
        {
            Account c_account = accountList[i];

            //Json representation of account
            Json::Value accountJson;
            accountJson["id"] = Json::Value(c_account.id);
            accountJson["displayName"] = Json::Value(c_account.displayName);

            accountArray.append(accountJson);
        }

        Json::Value returnObj;
        returnObj["accounts"] = accountArray;
        return returnObj;
    }



} //namespace webworks
