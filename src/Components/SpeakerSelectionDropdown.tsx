//
//  SpeakerSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

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
            selectedOption={selectedSpeaker}
            onSelectionChange={selectedDeviceId => {
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
