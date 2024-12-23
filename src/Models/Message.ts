//
//  Message.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-21.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import PhotoDataEvent from './PhotoDataEvent';
import Location from './Location';
import Orientation from './Orientation';
import ErrorInfo, { isErrorInfo } from './ErrorInfo';
import { EmptyObject } from '../../types/util';

export type Message = DataMessage|ErrorMessage

export type DataMessage
    = {capturePhotoRequest: EmptyObject}
    | {capturePhotoResponse: EmptyObject}
    | {switchCameraRequest: EmptyObject}
    | {switchCameraResponse: EmptyObject}
    | {toggleTorchRequest: EmptyObject}
    | {toggleTorchResponse: EmptyObject}
    | {locationRequest: EmptyObject}
    | {locationResponse: EmptyObject}
    | {holdEvent: EmptyObject}
    | {resumeEvent: EmptyObject}
    | {photoDataEvent: PhotoDataChunk}
    | {orientationEvent: Orientation}
    | {locationEvent: Location}
    | {errorEvent: ErrorInfo}

export type ErrorMessage
    = {capturePhotoResponse: ErrorInfo}
    | {switchCameraResponse: ErrorInfo}
    | {toggleTorchResponse: ErrorInfo}
    | {locationResponse: ErrorInfo}
    | {locationEvent: ErrorInfo}
    | {errorEvent: ErrorInfo}

export function messageReviver(key: string, value: any) {
    switch (key) {
        case "photoDataEvent": return !isErrorInfo(value) ? new PhotoDataChunk(value) : value;
        case "locationEvent": return !isErrorInfo(value) ? new Location(value) : value;
        default: return value;
    }
}
