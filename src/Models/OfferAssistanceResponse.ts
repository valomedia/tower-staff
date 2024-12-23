//
//  OfferAssistanceResponse.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-11-25.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import AssistanceRequest, { assistanceRequestReviver } from './AssistanceRequest';

export default interface OfferAssistanceResponse {

    assistanceRequest?: AssistanceRequest

    message?: string

}

export const offerAssistanceResponseReviver = assistanceRequestReviver;
