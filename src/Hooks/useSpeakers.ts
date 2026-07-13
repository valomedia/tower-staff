//
//  useSpeakers.ts
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { AudioDeviceInfo } from '@azure/communication-calling';
import { useCallClient } from '@azure/communication-react';
import useCallClientState from './useCallClientState';
import { useEffect } from 'react';

/**
 * Hook for dealing with output devices.
 */
export default function useSpeakers(): {
    speakers: AudioDeviceInfo[],
    selectedSpeaker?: AudioDeviceInfo,
    setSelectedSpeaker: (speaker: AudioDeviceInfo) => Promise<void>
} {
    const callClient = useCallClient();

    const state = useCallClientState();

    /**
     * The list of available output devices.
     */
    const speakers = state.deviceManager.speakers;

    /**
     * The currently selected output device.
     */
    const selectedSpeaker = state.deviceManager.selectedSpeaker;

    /**
     * Change the selected output device.
     *
     * @param speaker The output device to switch to.
     */
    async function setSelectedSpeaker(speaker: AudioDeviceInfo) {
        await (await callClient.getDeviceManager()).selectSpeaker(speaker);
    }

    useEffect(
        () => {
            callClient.getDeviceManager().then(deviceManager => deviceManager.getSpeakers());
        },
        [callClient]
    );

    return {speakers, selectedSpeaker, setSelectedSpeaker};
}
