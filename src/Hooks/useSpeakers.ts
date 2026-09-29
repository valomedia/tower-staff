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
