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
    faCameraRotate,
    faGear,
    faLightbulb,
    faLocationDot,
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVolumeHigh,
    faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import CallOptionsModal from './CallOptionsModal';
import Coordinate from '../Models/Coordinate';
import MapComponent from './MapComponent';

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
    const [isAudioInputMuted, setIsAudioInputMuted] = useState(false);

    /*
     * Whether audio output is currently muted.
     */
    const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(false);

    /*
     * Whether the camera is currently being switched.
     *
     * This is used to disable the camera switch button while waiting for the device to acknowledge the camera switch,
     * to avoid a double switch due to the user thinking the switching didn't work.
     */
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

    /*
     * Whether the camera in use is the front camera.
     */
    const [isUsingFrontCamera, setIsUsingFrontCamera] = useState(false);

    /*
     * Whether the torch is currently being switched.
     *
     * This is used to disable the torch toggle button while waiting for the device to acknowledge the torch toggle, to
     * avoid the user pressing the button again while the torch is already turning on, thereby turning it back off
     * immediately.
     */
    const [isTogglingTorch, setIsTogglingTorch] = useState(false);

    /*
     * Whether the torch is currently on.
     */
    const [isUsingTorch, setIsUsingTorch] = useState(false);

    /*
     * Whether the location is currently being requested.
     *
     * This will become true when the assistant requests the location and remain true until the location data has
     * either arrived, or is sure to never arrive.
     */
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    /*
     * Whether requesting the location is currently possible.
     *
     * This is set to false, if the users devices cannot or will not produce a location.
     */
    const [isLocationAvailable, setIsLocationAvailable] = useState(true);

    /*
     * The location, that is currently shown on screen, if any.
     */
    const [location, setLocation] = useState<Coordinate|undefined>();

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

    /*
     * Switch cameras
     */
    const handleCameraSwitch = () => {
        if (callController) {
            setIsSwitchingCamera(true);
            setIsUsingTorch(false);
            setIsUsingFrontCamera(!isUsingFrontCamera);
            callController.switchCamera().then(() => setIsSwitchingCamera(false));
        }
    }

    /*
     * Toggle torch
     */
    const handleTorchToggle = () => {
        if (callController) {
            setIsTogglingTorch(true);
            setIsUsingTorch(!isUsingTorch);
            callController.toggleTorch().then(() => setIsTogglingTorch(false));
        }
    }

    /*
     * Request location
     */
    const handleLocationRequest = () => {
        if (callController) {
            setIsRequestingLocation(true);
            callController.requestLocation().then(res => {
                setIsRequestingLocation(false)
                setLocation(res.locationInfo?.coordinate)
                if (!res.locationInfo) { setIsLocationAvailable(false); }
            })
        }
    }

    /*
     * Reset everything when the call ends.
     */
    const onCallEnd = () => {
        setHash('#launch-screen');
        setIsPresentingCallOptionsModal(false);
        setIsAudioInputMuted(false);
        setIsAudioOutputMuted(false);
        setIsSwitchingCamera(false);
        setIsUsingFrontCamera(false);
        setIsTogglingTorch(false);
        setIsUsingTorch(false);
        setIsRequestingLocation(false);
        setIsLocationAvailable(true);
        setLocation(undefined);
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
                            {audioVideoDidStop: onCallEnd}
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                {location && (<MapComponent coordinate={location}/>)}
                <footer>
                    <button
                            id='camera-switch-button'
                            onClick={handleCameraSwitch}
                            disabled={isSwitchingCamera || !callController}>
                        <FontAwesomeIcon icon={faCameraRotate}/>
                    </button>
                    <button
                            id='torch-toggle-button'
                            className={isUsingTorch ? 'active' : 'inactive'}
                            onClick={handleTorchToggle}
                            disabled={isTogglingTorch || isSwitchingCamera || isUsingFrontCamera || !callController}>
                        <FontAwesomeIcon icon={faLightbulb}/>
                    </button>
                    <button
                            id='request-location-button'
                            onClick={handleLocationRequest}
                            disabled={isRequestingLocation || !isLocationAvailable || !callController}>
                        <FontAwesomeIcon icon={faLocationDot}/>
                    </button>
                    {isAudioInputMuted ? (
                        <button id='unmute-input-button' className='inactive' onClick={handleInputUnmute}>
                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                        </button>
                    ) : (
                        <button id='mute-input-button' className='active' onClick={handleInputMute}>
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    )}
                    {isAudioOutputMuted ? (
                        <button id='unmute-output-button' className='inactive' onClick={handleOutputUnmute}>
                            <FontAwesomeIcon icon={faVolumeXmark}/>
                        </button>
                    ) : (
                        <button id='mute-output-button' className='active' onClick={handleOutputMute}>
                            <FontAwesomeIcon icon={faVolumeHigh}/>
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
