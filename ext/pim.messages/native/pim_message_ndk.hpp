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

#ifndef PIM_MESSAGES_NDK_H_
#define PIM_MESSAGES_NDK_H_

#include <bb/pim/account/Account>
#include <bb/pim/account/AccountService>
#include <bb/pim/message/MessageService>
#include <string>

class PimMessages;

namespace webworks {

using namespace bb::pim::account;
using namespace bb::pim::message;

class PimMessageNdk {
public:
    
    explicit PimMessageNdk();
    ~PimMessageNdk();

    // PIM Messages related functions
    Json::Value getAccounts();

private:

};

} // namespace webworks

#endif // PIM_MESSAGES_NDK_H_
