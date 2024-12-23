//
//  BeginAssistanceResponse.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-11-25.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import UserToken, { userTokenReviver } from './UserToken';
import AssistanceRequest, { assistanceRequestReviver } from './AssistanceRequest';

export default interface BeginAssistanceResponse {

    userToken: UserToken;

    assistanceRequest: AssistanceRequest;

}

export function beginAssistanceResponseReviver(key: string, value: any): any {
    if (key === 'userToken') {return JSON.parse(JSON.stringify(value), userTokenReviver);}
    if (key === 'assistanceRequest') {return JSON.parse(JSON.stringify(value), assistanceRequestReviver);}
    return value;
}
