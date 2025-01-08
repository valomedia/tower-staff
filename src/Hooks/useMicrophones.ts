//
//  useMicrophones.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { AudioDeviceInfo } from '@azure/communication-calling';
import { useCallClient } from '@azure/communication-react';
import useCallClientState from './useCallClientState';
import { useEffect } from 'react';

export default function useMicrophones(): {
    microphones: AudioDeviceInfo[],
    selectedMicrophone?: AudioDeviceInfo,
    setSelectedMicrophone: (microphone: AudioDeviceInfo) => Promise<void>
} {
    const callClient = useCallClient();

    const state = useCallClientState();

    async function setSelectedMicrophone(microphone: AudioDeviceInfo) {
        await (await callClient.getDeviceManager()).selectMicrophone(microphone);
    }

    useEffect(
        () => {
            callClient.getDeviceManager().then(deviceManager => deviceManager.getMicrophones());
        },
        [callClient]
    );

    return {
        microphones: state.deviceManager.microphones,
        selectedMicrophone: state.deviceManager.selectedMicrophone,
        setSelectedMicrophone
    };
}
