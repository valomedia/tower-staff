/*
 * Copyright (c) 2024-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import PhotoDataChunk from './PhotoDataChunk';
import Location from './Location';
import ErrorInfo, { isErrorInfo } from './ErrorInfo';
import { EmptyObject } from './UtilityTypes';
import { UserData } from './UserData';
import { RotationAngle } from './RotationAngle';
import UploadLink from './UploadLink';

/**
 * A data channel message.
 */
export type Message = DataMessage|ErrorMessage

/**
 * A data channel message that is sent during normal operation.
 */
export type DataMessage
    = {capturePhotoRequest: UploadLink}
    | {capturePhotoResponse: {key: string}|{uuid: string}}
    | {switchCameraRequest: EmptyObject}
    | {switchCameraResponse: EmptyObject}
    | {toggleTorchRequest: EmptyObject}
    | {toggleTorchResponse: EmptyObject}
    | {locationRequest: EmptyObject}
    | {locationResponse: EmptyObject}
    | {holdEvent: EmptyObject}
    | {resumeEvent: EmptyObject}
    | {photoDataEvent: PhotoDataChunk}
    | {orientationEvent: {rotationAngle: RotationAngle}}
    | {locationEvent: Location}
    | {flushEvent: EmptyObject}
    | {videoToggleEvent: {isVideoEnabled: boolean}}
    | {userHelloEvent: UserData}

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
