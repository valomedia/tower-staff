//
//  useSpeakers.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { AudioDeviceInfo } from '@azure/communication-calling';
import { useCallClient } from '@azure/communication-react';
import useCallClientState from './useCallClientState';
import { useEffect } from 'react';

export default function useSpeakers(): {
    speakers: AudioDeviceInfo[],
    selectedSpeaker?: AudioDeviceInfo,
    setSelectedSpeaker: (speaker: AudioDeviceInfo) => Promise<void>
} {
    const callClient = useCallClient();

    const state = useCallClientState();

    async function setSelectedSpeaker(speaker: AudioDeviceInfo) {
        await (await callClient.getDeviceManager()).selectSpeaker(speaker);
    }

    useEffect(
        () => {
            callClient.getDeviceManager().then(deviceManager => deviceManager.getSpeakers());
        },
        [callClient]
    );

    return {
        speakers: state.deviceManager.speakers,
        selectedSpeaker: state.deviceManager.selectedSpeaker,
        setSelectedSpeaker
    };
}
