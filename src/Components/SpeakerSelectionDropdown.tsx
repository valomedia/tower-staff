//
//  SpeakerSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import useSpeakers from '../Hooks/useSpeakers';
import DeviceSelectionDropdown from './DeviceSelectionDropdown';

export default function SpeakerSelectionDropdown() {
    const {
        speakers,
        selectedSpeaker,
        setSelectedSpeaker
    } = useSpeakers();

    return (
        <DeviceSelectionDropdown
            placeholder={speakers.length === 0 ? 'Keine Lautsprecher gefunden': 'Lautsprecher auswählen'}
            label={'Lautsprecher'}
            devices={speakers}
            selectedDevice={selectedSpeaker}
            onSelectionChange={selectedDeviceId => {
                const newlySelectedSpeaker = speakers.find(speaker => speaker.id === selectedDeviceId);
                if (newlySelectedSpeaker) {
                    console.log(`Switching output to: ${newlySelectedSpeaker.name}`);
                    setSelectedSpeaker(newlySelectedSpeaker);
                }
            }}
        />
    );
}
