//
//  CallOptionsModal.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-02.
//
//

import './CallOptionsModal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import CallController from '../Controllers/CallController';
import callScreen from './CallScreen';
import { FormEvent, useEffect, useState } from 'react';
import { AudioInputDevice } from 'amazon-chime-sdk-js';

/*
 * The modal allowing the user to choose input and output devices.
 */
const CallOptionsModal = (
    {
        callController,
        onSubmit
    }: {
        callController: CallController,
        onSubmit: (
            {
                audioInputDeviceInfo,
                audioOutputDeviceInfo
            }: {
                audioInputDeviceInfo: MediaDeviceInfo,
                audioOutputDeviceInfo: MediaDeviceInfo
            }
        )
            => void
    }
) => {

    /*
     * The available input devices.
     */
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);

    /*
     * The available output devices.
     */
    const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);

    /*
     * Handle form submission.
     *
     * This is called when the user clicks the confirmation-button on the modal dialog and will call onSubmit with
     * the selected devices.
     */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        console.log("Handle submit")
        // Prevent the browser from reloading the page.
        e.preventDefault();

        // Read the form data.
        const form = e.currentTarget;
        const formData = new FormData(form);

        const audioInputDeviceInfo
            = audioInputDevices.filter(x => x.deviceId === formData.get('audio-input-device'))[0];
        const audioOutputDeviceInfo
            = audioOutputDevices.filter(x => x.deviceId === formData.get('audio-output-device'))[0];

        callController.meetingSession.audioVideo.startAudioInput(audioInputDeviceInfo.deviceId);
        callController.meetingSession.audioVideo.chooseAudioOutput(audioOutputDeviceInfo.deviceId);

        console.log({ audioInputDeviceInfo, audioOutputDeviceInfo });
        onSubmit({ audioInputDeviceInfo, audioOutputDeviceInfo });
    }

    useEffect(
        () => {
            callController.meetingSession.audioVideo.listAudioInputDevices().then(setAudioInputDevices);
            callController.meetingSession.audioVideo.listAudioOutputDevices().then(setAudioOutputDevices);
        },
        [callController]
    );

    return (
        <div id='call-options-modal' className='modal'>
            <h1>Anrufoptionen</h1>
            <form onSubmit={handleSubmit}>
                <div className='preference'>
                    <label htmlFor='audio-input-device'>Audioeingabegerät</label>
                    <select name='audio-input-device'>
                        {audioInputDevices.map(x => <option value={x.deviceId}>{x.label}</option>)}
                    </select>
                </div>
                <div className='preference'>
                    <label htmlFor='audio-output-device'>Audioausgabegerät</label>
                    <select name='audio-output-device'>
                        {audioOutputDevices.map(x => <option value={x.deviceId}>{x.label}</option>)}
                    </select>
                </div>
                <button type='submit' className='accept-button'>
                    Auswahl bestätigen
                    &nbsp;
                    <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
                </button>
            </form>
        </div>
    );
};

export default CallOptionsModal;
