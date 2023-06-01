//
//  RealtimeDataMessageObserver.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-31.
//
//

import { DataMessage } from 'amazon-chime-sdk-js';

export default interface RealtimeDataMessageObserver {
    (msg: DataMessage): void;
}
