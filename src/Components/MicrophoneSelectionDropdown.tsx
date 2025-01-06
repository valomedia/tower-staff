//
//  MicrophoneSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import useMicrophones from '../Hooks/useMicrophones';
import Dropdown from './Dropdown';

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
            selectedOption={selectedMicrophone}
            onSelectionChange={(selectedDeviceId) => {
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
