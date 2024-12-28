//
//  MicrophoneSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import './MicrophoneSelectionDropdown.scss';
import useMicrophones from '../Hooks/useMicrophones';
import DeviceSelectionDropdown from './DeviceSelectionDropdown';

export default function MicrophoneSelectionDropdown() {
    const {
        microphones,
        selectedMicrophone,
        setSelectedMicrophone
    } = useMicrophones();

    return (
        <DeviceSelectionDropdown
            placeholder={microphones.length === 0 ? 'Keine Mikrofone gefunden' : 'Mikrofon auswählen'}
            label={'Mikrofon'}
            devices={microphones}
            selectedDevice={selectedMicrophone}
            onSelectionChange={(selectedDeviceId) => {
                const newlySelectedMicrophone = microphones.find(microphone => microphone.id === selectedDeviceId);
                if (newlySelectedMicrophone) {
                    console.log(`Switching input to: ${newlySelectedMicrophone.name}`);
                    setSelectedMicrophone(newlySelectedMicrophone);
                }
            }}
        />
    );
}
