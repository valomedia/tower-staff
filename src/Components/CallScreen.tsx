//
//  CallScreen.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import './CallScreen.scss';
import useHash from '../Hooks/useHash';
import TowerApi from '../Api/TowerApi';
import CallController from '../Controllers/CallController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGear,
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVolumeHigh,
    faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import { MeetingSessionStatus } from 'amazon-chime-sdk-js';
import CallOptionsModal from './CallOptionsModal';

/*
 * The in-call ui.
 */
const CallScreen = () => {

    /*
     * The current screen
     */
    const [hash, setHash] = useHash();

    /*
     * The session for the current call.
     */
    const [callController, setCallController] = useState<CallController>();

    /*
     * Whether to show the options-dialog.
     *
     * This determines whether the options dialog should be displayed. Regardless of the value of this boolean, the
     * options dialog will only show when the CallController becomes available.
     */
    const [isPresentingCallOptionsModal, setIsPresentingCallOptionsModal] = useState(true);

    /*
     * Whether audio input is currently muted.
     */
    const [isAudioInputMuted, setIsAudioInputMuted] = useState(true);

    /*
     * Whether audio output is currently muted.
     */
    const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(true);

    /*
     * The audio element.
     */
    const audioRef = useRef() as MutableRefObject<HTMLAudioElement>;

    /*
     * The video element.
     */
    const videoRef = useRef() as MutableRefObject<HTMLVideoElement>;

    /*
     * Mute the microphone.
     */
    const handleInputMute = () => {
        callController?.meetingSession.audioVideo.realtimeMuteLocalAudio();
    }

    /*
     * Unmute the microphone.
     */
    const handleInputUnmute = () => {
        callController?.meetingSession.audioVideo.realtimeUnmuteLocalAudio();
    }

    /*
     * Mute the output.
     */
    const handleOutputMute = () => {
        audioRef.current.muted = true;
        setIsAudioOutputMuted(true)
    }

    /*
     * Unmute the output.
     */
    const handleOutputUnmute = () => {
        audioRef.current.muted = false;
        setIsAudioOutputMuted(false);
    }

    useEffect(
        () => {
            if (hash === "#call-screen") {
                TowerApi
                    .join()
                    .then((joinResponse) => {
                        let callController = new CallController(
                            joinResponse,
                            audioRef.current,
                            videoRef.current,
                            {
                                audioVideoDidStop: (sessionStatus: MeetingSessionStatus) => {
                                    setHash('#launch-screen')
                                },
                                audioVideoDidStart: () => {
                                    handleInputUnmute()
                                    handleOutputUnmute()
                                    setIsAudioInputMuted(false)
                                    setIsAudioOutputMuted(false)
                                }
                            }
                        );
                        setCallController(callController);
                        callController
                            .meetingSession
                            .audioVideo
                            .realtimeSubscribeToMuteAndUnmuteLocalAudio(setIsAudioInputMuted)
                    })
                    .catch(() => setHash('#launch-screen'))
            }
        },
        [hash, setHash]
    );

    return (
        <>
            {
                isPresentingCallOptionsModal
                    && callController
                    &&
                        <CallOptionsModal
                                callController={callController}
                                onSubmit={() => setIsPresentingCallOptionsModal(false)}/>
            }
            <section id='call-screen'>
                <video ref={videoRef}></video>
                <audio ref={audioRef}></audio>
                <footer>
                    {isAudioInputMuted ? (
                        <button id='unmute-input-button' onClick={handleInputUnmute}>
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    ) : (
                        <button id='mute-input-button' onClick={handleInputMute}>
                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                        </button>
                    )}
                    {isAudioOutputMuted ? (
                        <button id='unmute-output-button' onClick={handleOutputUnmute}>
                            <FontAwesomeIcon icon={faVolumeHigh}/>
                        </button>
                    ) : (
                        <button id='mute-output-button' onClick={handleOutputMute}>
                            <FontAwesomeIcon icon={faVolumeXmark}/>
                        </button>
                    )}
                    <button id='option-button' onClick={() => setIsPresentingCallOptionsModal(true)}>
                        <FontAwesomeIcon icon={faGear}/>
                    </button>
                    <button id='hangup-button' onClick={TowerApi.end}>
                        <FontAwesomeIcon icon={faPhone}/>
                        &nbsp;
                        Auflegen
                    </button>
                </footer>
            </section>
        </>
    );
}

export default CallScreen;
