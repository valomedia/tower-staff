//
//  CallQualityData.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-11-20.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import CallQualityLevel from './CallQualityLevel';

/**
 * The data sent in a realtime data message related to call quality.
 *
 * This contains the data that gets sent in the change-call-quality-request, change-call-quality-response and
 * call-quality-event realtime data messages.
 */
export default interface CallQualityData {

    /**
     * The preset for the video quality related to this message.
     *
     * For the change-call-quality-response and call-quality-event realtime data messages, this specifies the new
     * settings being used. In a change-call-quality-request, this specifies the requested call quality.
     */
    callQualityLevel?: CallQualityLevel;

    /**
     * The error message if something went wrong.
     */
    message?: string;
}
