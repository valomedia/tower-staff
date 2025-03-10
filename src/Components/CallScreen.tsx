//
//  CallScreen.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import './CallScreen.scss';
import * as TowerApi from '../Api/TowerApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCameraRotate,
    faGear,
    faImage,
    faLightbulb,
    faLocationDot,
    faMaximize,
    faMicrophone,
    faMicrophoneSlash,
    faPause,
    faPhone,
    faVideo,
    faVideoSlash,
    faVolumeHigh,
    faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import Coordinate from '../Models/Coordinate';
import MapComponent from './MapComponent';
import Location from '../Models/Location';
import { AppContext } from '../Routes/App';
import {
    Call,
    DataChannelSender,
    Features,
    RemoteParticipant,
    RemoteVideoStream,
    VideoStreamRenderer
} from '@azure/communication-calling';
import AssistanceRequest from '../Models/AssistanceRequest';
import { Message, messageReviver } from '../Models/Message';
import ErrorInfo, { isErrorInfo } from '../Models/ErrorInfo';
import PhotoDataChunk from '../Models/PhotoDataChunk';
import usePhoto from '../Hooks/usePhoto';
import { CallProvider, useCallAgent } from '@azure/communication-react';
import { UserData } from '../Models/UserData';
import ProfileComponent from './ProfileComponent';

const DATA_CHANNEL_ID = 1000;

const DATA_CHANNEL_BANDWIDTH_KBPS = 32;

const DATA_CHANNEL_FLUSH_DELAY_MS = 2000;

const RESUME_CALL_DELAY_MS = 3000;

/**
 * The in-call ui.
 */
export default function CallScreen() {

    /*
     * Whether the assistant is on a call and whether the call options dialog is showing.
     */
    const {
        isOnCall,
        setIsOnCall,
        isPresentingCallOptionsDialog,
        setIsPresentingCallOptionsDialog
    } = useContext(AppContext);

    /**
     * Whether the assistant is connected to the user.
     */
    const [isCallConnected, setIsCallConnected] = useState(false);

    /**
     * Whether the data channel can be used.
     */
    const [isDataChannelAvailable, setIsDataChannelAvailable] = useState(false);

    /**
     * Whether video is being received.
     *
     * This indicates whether the app is actually receiving video frames at the moment.
     */
    const [isVideoReceiving, setIsVideoReceiving] = useState(false);

    /**
     * Whether the video stream is available.
     *
     * This indicates if there is a video stream that the app is trying to receive.
     */
    const [isVideoAvailable, setIsVideoAvailable] = useState(false);

    /**
     * Whether a video stream should be shown.
     *
     * This indicates whether the video is supposed to be displayed to the assistant, if available. It gets set to
     * false if the assistant switches the video feed off.
     */
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    /**
     * The CallAgent used to make the Call.
     */
    const callAgent = useCallAgent();

    /**
     * The ongoing Call, if any.
     */
    const [call, setCall] = useState<Call|undefined>();

    /**
     * The DataChannelSender used to send control messages.
     */
    const [messageSender, setMessageSender] = useState<DataChannelSender|undefined>();

    /**
     * Whether the assistant has put the call on hold.
     *
     * This will stay true until the call is fully resumed.
     */
    const [isCallOnHold, setIsCallOnHold] = useState(false);

    /**
     * Whether the call is being resumed.
     *
     * This is used to show the loading spinner for a few seconds after the assistant has chosen to resume the call,
     * while the user is being informed the call is about to resume.
     */
    const [isResumingCall, setIsResumingCall] = useState(false);

    /**
     * Whether tower-staff is in the process of ending the call.
     *
     * This becomes true if the assistant presses the hang-up button, or if the app terminates the call, because the
     * user has unexpectedly dropped. It will not become true when the call ends because the user has ended the call.
     */
    const [isHangingUp, setIsHangingUp] = useState(false);

    /*
     * Whether audio input is currently muted.
     */
    const [isAudioInputMuted, setIsAudioInputMuted] = useState(false);

    /*
     * Whether audio output is currently muted.
     */
    const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(false);

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

    /**
     * Whether we can switch between cameras.
     *
     * This is usually true, but is set to false for the duration of the Call if switching cameras fails.
     */
    const [isCameraSwitchAvailable, setIsCameraSwitchAvailable] = useState(true);

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

    /**
     * Whether the torch can be enabled.
     *
     * This is usually true, but is set to false for the duration of the call if trying to toggle the torch results
     * in an error.
     */
    const [isTorchAvailable, setIsTorchAvailable] = useState(true);

    /*
     * Whether the torch is currently on.
     */
    const [isUsingTorch, setIsUsingTorch] = useState(false);

    /*
     * Whether the location is currently being requested.
     *
     * This will become true when the assistant requests the location and remain true until the location data has
     * either arrived or is sure to never arrive.
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
    const {photo, storePhotoDataChunk, clearPhoto} = usePhoto();

    /*
     * Whether the assistant currently has the video maximized (and zoomed in).
     */
    const [isVideoMaximized, setIsVideoMaximized] = useState(false);

    /**
     * Information about the user who is making the call, if available.
     */
    const [userData, setUserData] = useState<UserData|undefined>();

    /**
     * The remote video container.
     */
    const videoContainerRef = useRef() as MutableRefObject<HTMLDivElement>;

    /*
     * Turn off the video feed.
     */
    function disableVideo() {
        setIsVideoEnabled(false);
        sendMessage({videoToggleEvent: {isVideoEnabled: false}});
    }

    /*
     * Turn on the video feed.
     */
    function enableVideo() {
        setIsVideoEnabled(true);
        sendMessage({videoToggleEvent: {isVideoEnabled: true}});
    }

    /*
     * Mute the microphone.
     */
    const muteInput = () => {
        if (!call || isAudioInputMuted) { return; }

        // noinspection JSIgnoredPromiseFromCall
        call.mute();

        setIsAudioInputMuted(true);
    };

    /*
     * Unmute the microphone.
     */
    const unmuteInput = () => {
        if (!call || !isAudioInputMuted) { return; }

        // noinspection JSIgnoredPromiseFromCall
        call.unmute();

        setIsAudioInputMuted(false);
    };

    /*
     * Mute the output.
     */
    const muteOutput = () => {
        if (!call || isAudioOutputMuted) { return; }

        // noinspection JSIgnoredPromiseFromCall
        call.muteIncomingAudio();

        setIsAudioOutputMuted(true);
    };

    /*
     * Unmute the output.
     */
    const unmuteOutput = () => {
        if (!call || !isAudioOutputMuted) { return; }

        // noinspection JSIgnoredPromiseFromCall
        call.unmuteIncomingAudio();

        setIsAudioOutputMuted(false);
    };

    /*
     * Capture a photo.
     */
    const capturePhoto = () => {
        setIsCapturingPhoto(true);
        sendMessage({capturePhotoRequest: {}});
    };

    /*
     * Switch cameras
     */
    const switchCamera = () => {
        setIsSwitchingCamera(true);
        setIsUsingTorch(false);
        setIsUsingFrontCamera(!isUsingFrontCamera);
        sendMessage({switchCameraRequest: {}});
    };

    /*
     * Toggle torch
     */
    const toggleTorch = () => {
        setIsTogglingTorch(true);
        setIsUsingTorch(!isUsingTorch);
        sendMessage({toggleTorchRequest: {}});
    };

    /*
     * Request location
     */
    const requestLocation = () => {
        setIsRequestingLocation(true);
        sendMessage({locationRequest: {}});
    };

    /**
     * Respond to a capturePhotoResponse.
     *
     * When this arrives, the photo has already been fully transmitted and is hopefully being shown to the user, so
     * this just re-enables the button.
     */
    const handleCapturePhotoResponse = (_: {uuid: string}|ErrorInfo) => {
        setIsCapturingPhoto(false);
    };

    /**
     * Respond to a switchCameraResponse.
     */
    const handleSwitchCameraResponse = (switchCameraResponse: {}|ErrorInfo) => {
        setIsSwitchingCamera(false);
        if (isErrorInfo(switchCameraResponse)) {
            setIsUsingFrontCamera(false);
            setIsCameraSwitchAvailable(false);
        }
    };

    /**
     * Respond to a toggleTorchResponse.
     */
    const handleToggleTorchResponse = (toggleTorchResponse: {}|ErrorInfo) => {
        setIsTogglingTorch(false);
        if (isErrorInfo(toggleTorchResponse)) {
            setIsUsingTorch(false);
            setIsTorchAvailable(false);
        }
    };

    /**
     * Respond to a locationResponse.
     */
    const handleLocationResponse = (locationResponse: {}|ErrorInfo) => {
        setIsRequestingLocation(false);
        if (isErrorInfo(locationResponse)) {setIsLocationAvailable(false);}
    };

    /**
     * Respond to a photoDataEvent.
     */
    const handlePhotoDataEvent = (photoDataEvent: PhotoDataChunk) => {
        storePhotoDataChunk(photoDataEvent);
    };

    /*
     * Respond to a location event
     */
    const handleLocationEvent = (locationEvent: Location|ErrorInfo) => {
        setIsRequestingLocation(false);
        if (!isErrorInfo(locationEvent)) {
            setLocation(locationEvent.coordinate);
        } else {
            setIsLocationAvailable(false);
        }
    };

    /**
     * Respond to an orientationEvent.
     */
    const handleOrientationEvent = (orientationEvent: {rotationAngle: 0|90|180|270}) => {
        const videoContainer = videoContainerRef.current;
        switch (orientationEvent.rotationAngle) {
            case 0:
                videoContainer.className = "landscape";
                break;
            case 90:
                videoContainer.className = "portrait";
                break;
            case 180:
                videoContainer.className = "landscape upside-down";
                break;
            case 270:
                videoContainer.className = "portrait upside-down";
                break;
        }
    };

    /**
     * Respond to a userHelloEvent.
     */
    const handleUserHelloEvent = (userHelloEvent: UserData) => {
        setUserData(userHelloEvent);
    };

    /**
     * Respond to an errorEvent.
     */
    const handleErrorEvent = (errorEvent: ErrorInfo) => {
        console.warn(errorEvent.error);
    };

    /*
     * End the call.
     */
    const endCall = () => {
        setIsHangingUp(true);
        call?.hangUp({forEveryone: true});

        videoContainerRef.current.className = "";

        setIsOnCall(false);
        setIsCallConnected(false);
        setIsDataChannelAvailable(false);
        setIsHangingUp(false);
        setIsVideoReceiving(false);
        setIsVideoAvailable(false);
        setIsVideoEnabled(true);
        setCall(undefined);
        setMessageSender(undefined);
        setIsCallOnHold(false);
        setIsResumingCall(false);
        setIsAudioInputMuted(false);
        setIsAudioOutputMuted(false);
        setIsCapturingPhoto(false);
        setIsSwitchingCamera(false);
        setIsCameraSwitchAvailable(true);
        setIsUsingFrontCamera(false);
        setIsTogglingTorch(false);
        setIsTorchAvailable(true);
        setIsUsingTorch(false);
        setIsRequestingLocation(false);
        setIsLocationAvailable(true);
        setLocation(undefined);
        setUserData(undefined);
        clearPhoto();
        setIsVideoMaximized(false);
    };

    /**
     * Put the caller on hold.
     */
    const holdCall = () => {
        if (!call) { return; }

        if (!isAudioInputMuted) {
            // noinspection JSIgnoredPromiseFromCall
            call.mute();
        }

        if (!isAudioOutputMuted) {
            // noinspection JSIgnoredPromiseFromCall
            call.muteIncomingAudio();
        }

        setIsCallOnHold(true);
        sendMessage({holdEvent: {}})
    };

    /**
     * Put the caller on the line.
     */
    const resumeCall = () => {
        sendMessage({resumeEvent: {}});
        setIsResumingCall(true);

        setTimeout(
            () => {
                if (!call) { return; }

                if (!isAudioInputMuted) {
                    // noinspection JSIgnoredPromiseFromCall
                    call.unmute();
                }

                if (!isAudioOutputMuted) {
                    // noinspection JSIgnoredPromiseFromCall
                    call.unmuteIncomingAudio();
                }

                setIsCallOnHold(false);
                setIsResumingCall(false);
            },
            RESUME_CALL_DELAY_MS
        );
    };

    /**
     * Start the call.
     *
     * This will take the AssistanceRequest from the backend and use it to start a call and subscribe to all the
     * necessary events.
     */
    const startCall = async ({assistanceRequest}: {assistanceRequest: AssistanceRequest}) => {
        const call = callAgent!.join({groupId: crypto.randomUUID()});

        setCall(call);

        console.log(`Call Id: ${call.id}`);
        console.log(`Call state: ${call.state}`);

        call.on('idChanged', () =>
            console.log(`Call Id changed: ${call.id}`)
        );

        call.on('stateChanged', async () => {
            console.log(`Call state changed: ${call.state}`);
            switch (call.state) {
                case 'Connected':
                    console.log("Adding user:", assistanceRequest.user);
                    call?.addParticipant(assistanceRequest.user);
                    setIsCallConnected(true);
                    createDataChannel(call);
                    console.log('Call started');
                    break;
                case 'Disconnected':
                    endCall();
                    console.log(`Call ended, call end reason=${JSON.stringify(call.callEndReason)}`);
                    break;
            }
        });

        call.remoteParticipants.forEach(subscribeToRemoteParticipant);
        call.on('remoteParticipantsUpdated', ({added, removed}) => {
            added.forEach(subscribeToRemoteParticipant);

            // End the call, if the user unexpectedly drops.
            if (removed.length) {endCall();}
        });
    };

    const subscribeToRemoteParticipant = (remoteParticipant: RemoteParticipant): void => {
        console.log(`Remote participant state: ${remoteParticipant.state}`);

        remoteParticipant.on('stateChanged', () =>
            console.log(`Remote participant state changed: ${remoteParticipant.state}`)
        );

        remoteParticipant.videoStreams.forEach(subscribeToRemoteVideoStream);
        remoteParticipant.on('videoStreamsUpdated', ({added, removed}) => {
            added.forEach(() => console.log('Remote participant video stream was added.'));
            added.forEach(subscribeToRemoteVideoStream);
            removed.forEach(() => console.log('Remote participant video stream was removed.'));
        });
    };

    const subscribeToRemoteVideoStream = async (remoteVideoStream: RemoteVideoStream): Promise<void> => {
        const renderer = new VideoStreamRenderer(remoteVideoStream);
        const videoContainer = videoContainerRef.current;

        const createViewIfAvailable = async () => {
            if (remoteVideoStream.isAvailable) {
                // If the incoming stream is RawMedia, we have to guess the initial orientation while we wait for the
                // first orientationEvent Message. We will assume the video is in portrait mode.
                if (!videoContainer.className && remoteVideoStream.mediaStreamType === "RawMedia") {
                    videoContainer.className = "portrait";
                }

                const view = await renderer.createView({scalingMode: 'Fit'});
                videoContainer.appendChild(view.target);
                const disposeViewIfUnavailable = async () => {
                    if (!remoteVideoStream.isAvailable) {
                        videoContainer.removeChild(view.target);
                        view.dispose();
                        remoteVideoStream.off("isAvailableChanged", disposeViewIfUnavailable);
                    }
                };
                remoteVideoStream.on('isAvailableChanged', disposeViewIfUnavailable);
            }
        };

        remoteVideoStream.on('isReceivingChanged', () => setIsVideoReceiving(remoteVideoStream.isReceiving));
        remoteVideoStream.on('isAvailableChanged', () => setIsVideoAvailable(remoteVideoStream.isAvailable));

        remoteVideoStream.on('isAvailableChanged', createViewIfAvailable);
        await createViewIfAvailable();
        setIsVideoAvailable(remoteVideoStream.isAvailable);
    };


    /**
     * Establish an outgoing data channel and begin listening for incoming messages.
     */
    const createDataChannel = (call: Call) => {
        const dataChannel = call.feature(Features.DataChannel);

        const messageSender = dataChannel.createDataChannelSender({
            bitrateInKbps: DATA_CHANNEL_BANDWIDTH_KBPS,
            channelId: DATA_CHANNEL_ID,
            priority: "High",
            reliability: "Durable"
        });
        messageSender.setParticipants(call.remoteParticipants.map(participant => participant.identifier));
        setMessageSender(messageSender);

        dataChannel.on("dataChannelReceiverCreated", receiver => {
            receiver.on("close", () => {
                console.log(`data channel id = ${receiver.channelId} is closed`);
            });
            receiver.on("messageReady", () => {
                // The client is sending messages, so it's also able to receive them.
                setIsDataChannelAvailable(true);

                const message: Message
                    = JSON.parse((new TextDecoder()).decode(receiver.readMessage()!.data), messageReviver);
                if ("capturePhotoResponse" in message) { handleCapturePhotoResponse(message.capturePhotoResponse); }
                if ("switchCameraResponse" in message) { handleSwitchCameraResponse(message.switchCameraResponse); }
                if ("toggleTorchResponse" in message) { handleToggleTorchResponse(message.toggleTorchResponse); }
                if ("locationResponse" in message) { handleLocationResponse(message.locationResponse); }
                if ("photoDataEvent" in message) { handlePhotoDataEvent(message.photoDataEvent); }
                if ("locationEvent" in message) { handleLocationEvent(message.locationEvent); }
                if ("orientationEvent" in message) { handleOrientationEvent(message.orientationEvent); }
                if ("userHelloEvent" in message) { handleUserHelloEvent(message.userHelloEvent); }
                if ("errorEvent" in message) { handleErrorEvent(message.errorEvent); }
            });
        });
    };

    /**
     * Send a message through the data channel.
     */
    const sendMessage = (message: Message) => {
        messageSender?.sendMessage((new TextEncoder()).encode(JSON.stringify(message)));

        // ACS seems to have a bug where data messages can get stuck until another data message is sent. As
        // a workaround, we send a dummy message after each real message to flush it through.
        setTimeout(
            () => {messageSender?.sendMessage((new TextEncoder().encode(JSON.stringify({flushEvent: {}}))))},
            DATA_CHANNEL_FLUSH_DELAY_MS
        );
    };

    useEffect(
        () => {
            if (isOnCall) {
                TowerApi
                    .beginAssistance()
                    .then(startCall)
                    .catch(error => {
                        console.error(error);
                        endCall();
                    });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOnCall, setIsOnCall]
    );

    return (
        <CallProvider call={call}>
            <div id='call-screen' className='screen' hidden={!isOnCall}>
                <main className={isVideoMaximized ? 'maximized' : ''}>
                    <div id='no-video-indicator'><FontAwesomeIcon icon={faVideoSlash}/></div>
                    <div id='hold-indicator' hidden={!isCallOnHold || isResumingCall}>
                        <FontAwesomeIcon icon={faPause}/>
                    </div>
                    <div
                        id='loading-indicator'
                        hidden={
                            (isVideoReceiving || !isVideoAvailable || isCallOnHold || !isVideoEnabled)
                                && !isResumingCall
                        }
                    >
                        <div>
                            <div className='loading-spinner'/>
                        </div>
                    </div>
                    <div
                            ref={videoContainerRef}
                            id='video-container'
                            hidden={!isVideoReceiving || !isVideoAvailable || isCallOnHold || !isVideoEnabled}>
                    </div>
                </main>
                <aside id='left-aside' className={isVideoMaximized ? 'closed' : 'open'}>
                    {userData && (<ProfileComponent userData={userData}/>)}
                    {location && (<MapComponent coordinate={location}/>)}
                </aside>
                <aside id='right-aside' className={isVideoMaximized ? 'closed' : 'open'}>
                    {photo && (<img src={photo.href} alt='Vom Gerät der Benutzer:in aufgenommenes Foto'/>)}
                </aside>
                <footer>
                    <button
                        id='maximize-video-button'
                        onClick={() => setIsVideoMaximized(!isVideoMaximized)}
                        className={isVideoMaximized ? 'active' : 'inactive'}
                        disabled={isHangingUp}>
                        <FontAwesomeIcon icon={faMaximize}/>
                    </button>
                    <button
                        id='capture-photo-button'
                        onClick={capturePhoto}
                        disabled={
                            isCapturingPhoto
                                || !isDataChannelAvailable
                                || isCallOnHold
                                || isHangingUp
                                || !isVideoEnabled
                        }
                    >
                        <FontAwesomeIcon icon={faImage}/>
                    </button>
                    <button
                        id='camera-switch-button'
                        onClick={switchCamera}
                        disabled={
                            isSwitchingCamera
                                || !isCameraSwitchAvailable
                                || !isDataChannelAvailable
                                || isCallOnHold
                                || isHangingUp
                                || !isVideoEnabled
                        }
                    >
                        <FontAwesomeIcon icon={faCameraRotate}/>
                    </button>
                    <button
                        id='torch-toggle-button'
                        className={isUsingTorch ? 'active' : 'inactive'}
                        onClick={toggleTorch}
                        disabled={
                            isTogglingTorch
                                || isSwitchingCamera
                                || isUsingFrontCamera
                                || !isTorchAvailable
                                || !isDataChannelAvailable
                                || isCallOnHold
                                || isHangingUp
                                || !isVideoEnabled
                        }
                    >
                        <FontAwesomeIcon icon={faLightbulb}/>
                    </button>
                    <button
                        id='request-location-button'
                        onClick={requestLocation}
                        disabled={
                            isRequestingLocation
                            || !!location
                            || !isLocationAvailable
                            || !isDataChannelAvailable
                            || isCallOnHold
                            || isHangingUp
                        }>
                        <FontAwesomeIcon icon={faLocationDot}/>
                    </button>
                    {isVideoEnabled ? (
                        <button
                            id='disable-video-button'
                            className='active'
                            onClick={disableVideo}
                            disabled={!isCallConnected || isCallOnHold || isHangingUp}
                        ><FontAwesomeIcon icon={faVideo}/></button>
                    ) : (
                        <button
                            id='enable-video-button'
                            className='inactive'
                            onClick={enableVideo}
                            disabled={!isCallConnected || isCallOnHold || isHangingUp}
                        ><FontAwesomeIcon icon={faVideoSlash}/></button>
                    )}
                    {isAudioInputMuted ? (
                        <button
                            id='unmute-input-button'
                            className='inactive'
                            onClick={unmuteInput}
                            disabled={!isCallConnected || isCallOnHold || isHangingUp}>
                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                        </button>
                    ) : (
                        <button
                            id='mute-input-button'
                            className='active'
                            onClick={muteInput}
                            disabled={!isCallConnected || isCallOnHold || isHangingUp}>
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    )}
                    {isAudioOutputMuted ? (
                        <button
                            id='unmute-output-button'
                            className='inactive'
                            onClick={unmuteOutput}
                            disabled={!isCallConnected || isCallOnHold || isHangingUp}>
                            <FontAwesomeIcon icon={faVolumeXmark}/>
                        </button>
                    ) : (
                        <button
                            id='mute-output-button'
                            className='active'
                            onClick={muteOutput}
                            disabled={!isCallConnected || isCallOnHold || isHangingUp}>
                            <FontAwesomeIcon icon={faVolumeHigh}/>
                        </button>
                    )}
                    {isCallOnHold ? (
                        <button
                            id='resume-button'
                            className='active'
                            onClick={resumeCall}
                            disabled={!isDataChannelAvailable || isHangingUp || isResumingCall}>
                            <FontAwesomeIcon icon={faPause}/>
                        </button>
                    ) : (
                        <button
                            id='hold-button'
                            className='inactive'
                            onClick={holdCall}
                            disabled={!isDataChannelAvailable || isHangingUp}>
                            <FontAwesomeIcon icon={faPause}/>
                        </button>
                    )}
                    <button
                        id='call-options-button'
                        className={isPresentingCallOptionsDialog ? 'active' : 'inactive'}
                        onClick={() => setIsPresentingCallOptionsDialog(!isPresentingCallOptionsDialog)}
                    >
                        <FontAwesomeIcon icon={faGear}/>
                    </button>
                    <button id='hangup-button' disabled={isHangingUp} onClick={endCall}>
                        {isHangingUp ? (
                            <div className='spinner-container'>
                                <div className='loading-spinner'/>
                            </div>
                        ) : (
                            <FontAwesomeIcon icon={faPhone}/>
                        )}
                        &nbsp;
                        Auflegen
                    </button>
                </footer>
            </div>
        </CallProvider>
    );
};
