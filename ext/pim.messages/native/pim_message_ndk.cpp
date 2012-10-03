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

    Json::Value PimMessageNdk::getAccounts()
    {
        Json::Value returnObj;
        
        fprintf(stderr, "before accountList\n");
        
        const QList<Account>accountList = AccountService().accounts(Service::Messages);

        fprintf(stderr, "after accountList\n");

        fprintf(stderr, "accountList size: %d\n", accountList.size());

        //Create Json object containing array of accounts
        Json::Value accountArray;
        for (int i = 0; i < accountList.size(); i++)
        {
            fprintf(stderr, "inside for loop\n");
            Account c_account = accountList[i];

            //Json representation of account
            Json::Value accountJson;

            std::string accountIdString;
            std::stringstream ss;
            ss << c_account.id();
            accountIdString = ss.str();

            fprintf(stderr, "AccoundIdString: %s\n",accountIdString.c_str());
            fprintf(stderr, "Account DisplayName: %s\n", c_account.displayName().toStdString().c_str());

            accountJson["id"] = Json::Value(accountIdString);
            accountJson["name"] = Json::Value(c_account.displayName().toStdString());

            Json::Value accountFoldersArray;
            const QList<MessageFolder> accountFolders = MessageService().folders(c_account.id());

            for (int j = 0; j < accountFolders.size(); j++)
            {
                MessageFolder c_messageFolder = accountFolders[i];

                Json::Value folderJson;
                folderJson["type"] = Json::Value(c_messageFolder.type());
                folderJson["name"] = Json::Value(c_messageFolder.name().toStdString());
                accountFoldersArray.append(folderJson);
            }
            
            accountJson["folders"] = accountFoldersArray;

            accountArray.append(accountJson);
        }
        fprintf(stderr, "Size of accountArray: %d\n", accountArray.size());
        
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
