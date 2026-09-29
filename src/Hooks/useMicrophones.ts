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
