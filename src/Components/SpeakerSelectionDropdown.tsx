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

import useSpeakers from '../Hooks/useSpeakers';
import Dropdown from './Dropdown';

/**
 * A dropdown for choosing the output device.
 */
export default function SpeakerSelectionDropdown() {
    const {
        speakers,
        selectedSpeaker,
        setSelectedSpeaker
    } = useSpeakers();

    return (
        <Dropdown
            label={'Lautsprecher'}
            options={speakers}
            selectedOption={selectedSpeaker?.id}
            onChange={selectedDeviceId => {
                const newlySelectedSpeaker = speakers.find(speaker => speaker.id === selectedDeviceId);
                if (newlySelectedSpeaker) {
                    console.log(`Switching output to: ${newlySelectedSpeaker.name}`);

                    // noinspection JSIgnoredPromiseFromCall
                    setSelectedSpeaker(newlySelectedSpeaker);
                }
            }}
        />
    );
}
