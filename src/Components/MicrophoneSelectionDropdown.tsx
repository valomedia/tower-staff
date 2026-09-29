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

import useMicrophones from '../Hooks/useMicrophones';
import Dropdown from './Dropdown';

/**
 * A dropdown for choosing the input device.
 */
export default function MicrophoneSelectionDropdown() {
    const {
        microphones,
        selectedMicrophone,
        setSelectedMicrophone
    } = useMicrophones();

    return (
        <Dropdown
            label={'Mikrofon'}
            options={microphones}
            selectedOption={selectedMicrophone?.id}
            onChange={(selectedDeviceId) => {
                const newlySelectedMicrophone = microphones.find(microphone => microphone.id === selectedDeviceId);
                if (newlySelectedMicrophone) {
                    console.log(`Switching input to: ${newlySelectedMicrophone.name}`);

                    // noinspection JSIgnoredPromiseFromCall
                    setSelectedMicrophone(newlySelectedMicrophone);
                }
            }}
        />
    );
}
