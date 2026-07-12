//
//  useMicrophones.ts
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { AudioDeviceInfo } from '@azure/communication-calling';
import { useCallClient } from '@azure/communication-react';
import useCallClientState from './useCallClientState';
import { useEffect } from 'react';

/**
 * Hook for dealing with input devices.
 */
export default function useMicrophones(): {
    microphones: AudioDeviceInfo[],
    selectedMicrophone?: AudioDeviceInfo,
    setSelectedMicrophone: (microphone: AudioDeviceInfo) => Promise<void>
} {
    const callClient = useCallClient();

    const state = useCallClientState();

    /**
     * The list of available input devices.
     */
    const microphones = state.deviceManager.microphones;

    /**
     * The currently selected input device.
     */
    const selectedMicrophone = state.deviceManager.selectedMicrophone;

    /**
     * Change the selected input device.
     *
     * @param microphone The input device to switch to.
     */
    async function setSelectedMicrophone(microphone: AudioDeviceInfo) {
        await (await callClient.getDeviceManager()).selectMicrophone(microphone);
    }

    useEffect(
        () => {
            callClient.getDeviceManager().then(deviceManager => deviceManager.getMicrophones());
        },
        [callClient]
    );

    return {microphones, selectedMicrophone, setSelectedMicrophone};
}
