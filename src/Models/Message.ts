//
//  Message.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-21.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import PhotoDataChunk from './PhotoDataChunk';
import Location from './Location';
import ErrorInfo, { isErrorInfo } from './ErrorInfo';
import { EmptyObject } from './UtilityTypes';

/**
 * A data channel message.
 */
export type Message = DataMessage|ErrorMessage

/**
 * A data channel message that is sent during normal operation.
 */
export type DataMessage
    = {capturePhotoRequest: EmptyObject}
    | {capturePhotoResponse: {uuid: string}}
    | {switchCameraRequest: EmptyObject}
    | {switchCameraResponse: EmptyObject}
    | {toggleTorchRequest: EmptyObject}
    | {toggleTorchResponse: EmptyObject}
    | {locationRequest: EmptyObject}
    | {locationResponse: EmptyObject}
    | {holdEvent: EmptyObject}
    | {resumeEvent: EmptyObject}
    | {photoDataEvent: PhotoDataChunk}
    | {orientationEvent: {rotationAngle: 0|90|180|270}}
    | {locationEvent: Location}
    | {flushEvent: EmptyObject}
    | {videoToggleEvent: {isVideoEnabled: boolean}}

/**
 * A data channel message sent when something goes wrong.
 */
export type ErrorMessage
    = {capturePhotoResponse: ErrorInfo}
    | {switchCameraResponse: ErrorInfo}
    | {toggleTorchResponse: ErrorInfo}
    | {locationResponse: ErrorInfo}
    | {locationEvent: ErrorInfo}
    | {errorEvent: ErrorInfo}

/**
 * JSON reviver for Messages.
 *
 * @param key The key associated with the value.
 * @param value The value produced by parsing.
 *
 * @return The revived version of value.
 */
export function messageReviver(key: string, value: any): any {
    switch (key) {
        case "locationEvent": return !isErrorInfo(value) ? new Location(value) : value;
        default: return value;
    }
}
