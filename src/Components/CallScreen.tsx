//
//  CallScreen.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import './CallScreen.scss';
import TowerApi from '../Api/TowerApi';
import CallController from '../Controllers/CallController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCameraRotate,
    faHeartPulse,
    faImage,
    faLightbulb,
    faLocationDot,
    faMaximize,
    faMicrophone,
    faMicrophoneSlash,
    faPause,
    faPhone,
    faVideoSlash,
    faVolumeHigh,
    faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import CallOptionsDialog from './CallOptionsDialog';
import Coordinate from '../Models/Coordinate';
import MapComponent from './MapComponent';
import LocationEventData, { locationEventDataReviver } from '../Models/LocationEventData';
import { DataMessage } from 'amazon-chime-sdk-js';
import DataMessageTopic from '../Models/DataMessageTopic';
import PhotoResource from '../Models/PhotoResource';
import { AppContext } from '../Routes/App';
import CallQualityLevel from '../Models/CallQualityLevel';
import CallQualityData from '../Models/CallQualityData';

/*
 * The in-call ui.
 */
const CallScreen = () => {

    /*
     * Whether a call is ongoing.
     */
    const {isOnCall, setIsOnCall} = useContext(AppContext);

    /*
     * The session for the current call.
     */
    const [callController, setCallController] = useState<CallController>();

    /*
     * Whether the assistant can currently speak to the user.
     *
     * This is false initially while the assistant is reading the user profile and will be set to false again if the
     * assistant puts the call on hold. It determines whether the call option dialog should be displayed.
     */
    const [isAssistantReady, setIsAssistantReady] = useState(false);

    /*
     * Whether audio input is currently muted.
     */
    const [isAudioInputMuted, setIsAudioInputMuted] = useState(true);

    /*
     * Whether audio output is currently muted.
     */
    const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(true);

    /*
     * Whether a photo is currently being taken.
     *
     * This is used to disable the shutter button while waiting for the device to take a photo, to avoid the user
     * triggering multiple photo capture requests in rapid succession when the photo takes a while to show.
     */
    const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

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
     * This is used to disable the torch toggle button while waiting for the device to acknowledge the torch toggle.
     * Without this, the user might grow impatient and click the button again, assuming it did not work the first time,
     * causing the torch to turn back off immediately.
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
     * This is set to false, if the user's devices cannot or will not produce a location.
     */
    const [isLocationAvailable, setIsLocationAvailable] = useState(true);

    /*
     * The location, that is currently shown on screen, if any.
     */
    const [location, setLocation] = useState<Coordinate|undefined>();

    /*
     * The most recently captured photo, if any.
     */
    const [photo, setPhoto] = useState<PhotoResource|undefined>();

    /*
     * Whether the assistant currently has the video maximized (and zoomed in).
     */
    const [isVideoMaximized, setIsVideoMaximized] = useState(false);

    /*
     * Whether the video feed is currently being restarted.
     */
    const [isRestartingVideo, setIsRestartingVideo] = useState(false);

    /**
     * The call quality level as reported by the client app.
     */
    const [callQualityLevel, setCallQualityLevel] = useState<CallQualityLevel|undefined>();

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
     * Capture a photo.
     */
    const handlePhotoCapture = () => {
        if (callController) {
            setIsCapturingPhoto(true);
            callController.capturePhoto().then(photo => {
                setIsCapturingPhoto(false);
                if (photo) {setPhoto(photo);}
            });
        }
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

            // Needs error handling.
            // noinspection JSIgnoredPromiseFromCall
            callController.requestLocation();
        }
    }

    /*
     * Respond to a location event
     */
    const onLocationEvent = (locationEventData: LocationEventData) => {
        console.log(locationEventData);
        setIsRequestingLocation(false)
        setLocation(locationEventData.locationInfo?.coordinate)
        if (!locationEventData.locationInfo) {
            setIsLocationAvailable(false);
        }
    }

    /**
     * Respond to a call quality event.
     */
    const onCallQualityEvent = (callQualityData: CallQualityData) => {
        console.log(callQualityData);
        if (callQualityData.callQualityLevel) { setCallQualityLevel(callQualityData.callQualityLevel); }
    }

    /*
     * Restart the video.
     */
    const handleVideoRestart = () => {
        if (callController) {
            setIsRestartingVideo(true);
            callController.restartVideo().then(() => setIsRestartingVideo(false));
        }
    }

    /*
     * End the call.
     */
    const handleHangup = () => {
        const meetingId = callController?.meetingSession.configuration.meetingId;
        if (meetingId) {TowerApi.end(meetingId);}
        onCallEnd();
    }

    /**
     * Put the caller on the line.
     */
    const handleAssistantReady = () => {
        handleInputUnmute()
        handleOutputUnmute()
        callController?.sendAssistantReadyEvent()
        setIsAssistantReady(true)
    }

    /**
     * Put the caller on hold.
     */
    const handleAssistantBusy = () => {
        handleInputMute()
        handleOutputMute()
        callController?.sendAssistantBusyEvent()
        setIsAssistantReady(false)
    }

    /*
     * Reset everything when the call ends.
     */
    const onCallEnd = () => {
        setIsOnCall(false);
        setIsAssistantReady(false);
        setIsAudioInputMuted(true);
        setIsAudioOutputMuted(true);
        setIsCapturingPhoto(false);
        setIsSwitchingCamera(false);
        setIsUsingFrontCamera(false);
        setIsTogglingTorch(false);
        setIsUsingTorch(false);
        setIsRequestingLocation(false);
        setIsLocationAvailable(true);
        setLocation(undefined);
        setPhoto(undefined);
        setIsVideoMaximized(false);
        setIsRestartingVideo(false);
        setCallController(undefined);
    }

    useEffect(
        () => {
            if (isOnCall) {
                TowerApi
                    .join()
                    .then((joinResponse) => {
                        let callController = new CallController(
                            joinResponse,
                            audioRef.current,
                            videoRef.current,
                            {audioVideoDidStop: onCallEnd},
                            (msg: DataMessage) => {
                                switch (msg.topic) {
                                    case DataMessageTopic.LocationEvent:
                                        onLocationEvent(JSON.parse(msg.text(), locationEventDataReviver));
                                        break;
                                    case DataMessageTopic.CallQualityEvent:
                                        onCallQualityEvent(JSON.parse(msg.text()));
                                        break;
                                }
                            }
                        );
                        setCallController(callController);
                        callController
                            .meetingSession
                            .audioVideo
                            .realtimeSubscribeToMuteAndUnmuteLocalAudio(setIsAudioInputMuted)
                    })
                    .catch(onCallEnd);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOnCall, setIsOnCall]
    );

    return (
        <>
            {
                !isAssistantReady
                    && callController
                    && <CallOptionsDialog
                            callController={callController}
                            callQualityLevel={callQualityLevel}
                            onSubmit={handleAssistantReady}/>
            }
            <section id='call-screen' className={isOnCall ? 'active' : 'inactive'}>
                <div id='video-background'><FontAwesomeIcon icon={faVideoSlash}/></div>
                <video ref={videoRef} className={isVideoMaximized ? 'maximized' : ''}></video>
                {!isAssistantReady && <div id='hold-indicator'><FontAwesomeIcon icon={faPause}/></div>}
                <audio ref={audioRef}></audio>
                <aside id='left-aside' className={isVideoMaximized ? 'closed' : 'open'}>
                    {location && (<MapComponent coordinate={location}/>)}
                </aside>
                <aside id='right-aside' className={isVideoMaximized ? 'closed' : 'open'}>
                    {photo && (<img src={photo.imageURL.href} alt='Vom Gerät der Benutzer:in aufgenommenes Foto'/>)}
                </aside>
                <footer>
                    <button
                            id='maximize-video-button'
                            onClick={() => setIsVideoMaximized(!isVideoMaximized)}
                            className={isVideoMaximized ? 'active' : 'inactive'}
                            disabled={!isAssistantReady}>
                        <FontAwesomeIcon icon={faMaximize}/>
                    </button>
                    <button
                            id='capture-photo-button'
                            onClick={handlePhotoCapture}
                            disabled={isCapturingPhoto || !callController || !isAssistantReady}>
                        <FontAwesomeIcon icon={faImage}/>
                    </button>
                    <button
                            id='camera-switch-button'
                            onClick={handleCameraSwitch}
                            disabled={isSwitchingCamera || !callController || !isAssistantReady}>
                        <FontAwesomeIcon icon={faCameraRotate}/>
                    </button>
                    <button
                            id='restart-video-button'
                            onClick={handleVideoRestart}
                            disabled={isRestartingVideo || !callController || !isAssistantReady}>
                        <FontAwesomeIcon icon={faHeartPulse}/>
                    </button>
                    <button
                            id='torch-toggle-button'
                            className={isUsingTorch ? 'active' : 'inactive'}
                            onClick={handleTorchToggle}
                            disabled={
                                isTogglingTorch
                                    || isSwitchingCamera
                                    || isUsingFrontCamera
                                    || !callController
                                    || !isAssistantReady
                            }>
                        <FontAwesomeIcon icon={faLightbulb}/>
                    </button>
                    <button
                            id='request-location-button'
                            onClick={handleLocationRequest}
                            disabled={
                                isRequestingLocation
                                    || !!location
                                    || !isLocationAvailable
                                    || !callController
                                    || !isAssistantReady
                            }>
                        <FontAwesomeIcon icon={faLocationDot}/>
                    </button>
                    {isAudioInputMuted ? (
                        <button
                                id='unmute-input-button'
                                className='inactive'
                                onClick={handleInputUnmute}
                                disabled={!isAssistantReady}>
                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                        </button>
                    ) : (
                        <button id='mute-input-button' className='active' onClick={handleInputMute}>
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    )}
                    {isAudioOutputMuted ? (
                        <button
                                id='unmute-output-button'
                                className='inactive'
                                onClick={handleOutputUnmute}
                                disabled={!isAssistantReady}>
                            <FontAwesomeIcon icon={faVolumeXmark}/>
                        </button>
                    ) : (
                        <button id='mute-output-button' className='active' onClick={handleOutputMute}>
                            <FontAwesomeIcon icon={faVolumeHigh}/>
                        </button>
                    )}
                    {isAssistantReady ? (
                        <button id="hold-button" className='inactive' onClick={handleAssistantBusy}>
                            <FontAwesomeIcon icon={faPause}/>
                        </button>
                    ) : (
                        <button id="ready-button" className='active' onClick={handleAssistantReady}>
                            <FontAwesomeIcon icon={faPause}/>
                        </button>
                    )}
                    <button id='hangup-button' onClick={handleHangup}>
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
