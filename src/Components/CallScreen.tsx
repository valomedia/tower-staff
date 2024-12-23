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
import Location from '../Models/Location';
import PhotoResource from '../Models/PhotoResource';
import { AppContext } from '../Routes/App';
import {
    Call,
    CallAgent,
    CallClient, DataChannelSender,
    DeviceManager, Features,
    RemoteParticipant,
    RemoteVideoStream,
    VideoStreamRenderer
} from '@azure/communication-calling';
import UserToken from '../Models/UserToken';
import AssistanceRequest from '../Models/AssistanceRequest';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { DataMessage, Message, messageReviver } from '../Models/Message';
import { ErrorMessage } from '../Models/Message';
import ErrorInfo, { isErrorInfo } from '../Models/ErrorInfo';
import PhotoDataChunk from '../Models/PhotoDataChunk';
import Orientation from '../Models/Orientation';
import usePhoto from '../Hooks/usePhoto';

/*
 * The in-call ui.
 */
const CallScreen = () => {

    /*
     * Whether a call is ongoing.
     */
    const {isOnCall, setIsOnCall} = useContext(AppContext);

    const [isCallConnected, setIsCallConnected] = useState(false);

    const [isDataChannelAvailable, setIsDataChannelAvailable] = useState(false);

    const [isVideoReceiving, setIsVideoReceiving] = useState(false);

    const [isVideoAvailable, setIsVideoAvailable] = useState(false);

    const [callClient, setCallClient] = useState<CallClient|undefined>();

    const [callAgent, setCallAgent] = useState<CallAgent|undefined>();

    const [deviceManager, setDeviceManager] = useState<DeviceManager|undefined>();

    const [call, setCall] = useState<Call|undefined>();

    const [messageSender, setMessageSender] = useState<DataChannelSender|undefined>();

    const [isCallOnHold, setIsCallOnHold] = useState(false);

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
     * The remote video container.
     */
    const videoContainerRef = useRef() as MutableRefObject<HTMLDivElement>;

    /*
     * Mute the microphone.
     */
    const muteInput = () => {
        if (!call) { return; }
        call.mute();
        setIsAudioInputMuted(true);
    };

    /*
     * Unmute the microphone.
     */
    const unmuteInput = () => {
        if (!call) { return; }
        call.unmute();
        setIsAudioInputMuted(false);
    };

    /*
     * Mute the output.
     */
    const muteOutput = () => {
        if (!call) { return; }
        call.muteIncomingAudio();
        setIsAudioOutputMuted(true);
    };

    /*
     * Unmute the output.
     */
    const unmuteOutput = () => {
        if (!call) { return; }
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
        sendMessage({switchCameraRequest: {}});
    };

    /*
     * Toggle torch
     */
    const toggleTorch = () => {
        setIsTogglingTorch(true);
        sendMessage({toggleTorchRequest: {}});
    };

    /*
     * Request location
     */
    const requestLocation = () => {
        setIsRequestingLocation(true);
        sendMessage({locationRequest: {}});
    };

    const handleCapturePhotoResponse = (capturePhotoResponse: {}|ErrorInfo) => {
        setIsCapturingPhoto(false);
    };

    const handleSwitchCameraResponse = (switchCameraResponse: {}|ErrorInfo) => {
        setIsSwitchingCamera(false);
        if (!isErrorInfo(switchCameraResponse)) { setIsUsingFrontCamera(!isUsingFrontCamera); }
    };

    const handleToggleTorchResponse = (toggleTorchResponse: {}|ErrorInfo) => {
        setIsTogglingTorch(false);
        if (!isErrorInfo(toggleTorchResponse)) { setIsUsingTorch(!isUsingTorch); }
    };

    const handleLocationResponse = (locationResponse: {}|ErrorInfo) => {
        setIsRequestingLocation(false);
        if (isErrorInfo(locationResponse)) {setIsLocationAvailable(false);}
    };

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

    const handleOrientationEvent = (orientationEvent: Orientation) => {
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

    const handleErrorEvent = (errorEvent: ErrorInfo) => {
        console.warn(errorEvent.error);
    };

    /*
     * End the call.
     */
    const hangUp = () => {
        setIsHangingUp(true);
        call?.hangUp({forEveryone: true});
        onCallEnd();
    };

    /**
     * Put the caller on hold.
     */
    const holdCall = () => {
        muteInput();
        muteOutput();
        setIsCallOnHold(true);
        sendMessage({holdEvent: {}})
    };

    /**
     * Put the caller on the line.
     */
    const resumeCall = () => {
        unmuteInput();
        unmuteOutput();
        setIsCallOnHold(false);
        sendMessage({resumeEvent: {}})
    };

    const startCall = async (
        {userToken, assistanceRequest}: {userToken: UserToken, assistanceRequest: AssistanceRequest}
    ): Promise<{call: Call, assistanceRequest: AssistanceRequest}> => {
        const token = userToken.token;
        const tokenCredential = new AzureCommunicationTokenCredential(token);

        const callClient = new CallClient();
        const callAgent = await callClient.createCallAgent(tokenCredential);
        const deviceManager = await callClient.getDeviceManager();

        await deviceManager.askDevicePermission({audio: true, video: false});
        const call = callAgent.join({groupId: crypto.randomUUID()});

        setCallClient(callClient);
        setCallAgent(callAgent);
        setDeviceManager(deviceManager);
        setCall(call);
        setIsVideoReceiving(true);

        return {call, assistanceRequest};
    };

    const subscribeToCall = ({call, assistanceRequest}: {call: Call, assistanceRequest: AssistanceRequest}): void => {
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
                    onCallStart(call);
                    console.log('Call started');
                    break;
                case 'Disconnected':
                    hangUp();
                    console.log(`Call ended, call end reason=${JSON.stringify(call.callEndReason)}`);
                    break;
            }
        });

        call.remoteParticipants.forEach(subscribeToRemoteParticipant);
        call.on('remoteParticipantsUpdated', ({added, removed}) => {
            added.forEach(subscribeToRemoteParticipant);
            if (removed.length) {
                console.warn('Remote participant unexpectedly removed from call.');
                endCall();
            }
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

        // If the incoming stream is RawMedia, we have to guess the initial orientation while we wait for the first
        // orientationEvent Message. We will assume the video is in portrait mode.
        if (remoteVideoStream.mediaStreamType === "RawMedia") {
            videoContainer.className = "portrait";
        }

        const createViewIfAvailable = async () => {
            if (remoteVideoStream.isAvailable) {
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

    const endCall = () => {
    };

    const onCallStart = (call: Call) => {
        setIsCallConnected(true);
        createDataChannel(call);
    };

    const createDataChannel = (call: Call) => {
        const dataChannel = call.feature(Features.DataChannel);

        const messageSender = dataChannel.createDataChannelSender({
            bitrateInKbps: 32,
            channelId: 1000,
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
                if ("errorEvent" in message) { handleErrorEvent(message.errorEvent); }
            });
        });
    };

    const sendMessage = (message: Message) => {
        messageSender?.sendMessage((new TextEncoder()).encode(JSON.stringify(message)));
    };

    /*
     * Reset everything when the call ends.
     */
    const onCallEnd = async () => {
        await callAgent?.dispose();

        setIsOnCall(false);
        setIsCallConnected(false);
        setIsDataChannelAvailable(false);
        setIsHangingUp(false);
        setIsVideoReceiving(false);
        setIsVideoAvailable(false);
        setCallClient(undefined);
        setCallAgent(undefined);
        setDeviceManager(undefined);
        setCall(undefined);
        setMessageSender(undefined);
        setIsCallOnHold(false);
        setIsAudioInputMuted(false);
        setIsAudioOutputMuted(false);
        setIsCapturingPhoto(false);
        setIsSwitchingCamera(false);
        setIsUsingFrontCamera(false);
        setIsTogglingTorch(false);
        setIsUsingTorch(false);
        setIsRequestingLocation(false);
        setIsLocationAvailable(true);
        setLocation(undefined);
        clearPhoto();
        setIsVideoMaximized(false);
    };

    useEffect(
        () => {
            if (isOnCall) {
                TowerApi
                    .beginAssistance()
                    .then(startCall)
                    .then(subscribeToCall)
                    .catch(error => {
                        console.error(error);
                        onCallEnd();
                    });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOnCall, setIsOnCall]
    );

    return (
        <>
            {isCallOnHold && call && <CallOptionsDialog onSubmit={resumeCall}/>}
            <div id='call-screen' className='screen' hidden={!isOnCall}>
                <main className={isVideoMaximized ? 'maximized' : ''}>
                    <div id='no-video-indicator'><FontAwesomeIcon icon={faVideoSlash}/></div>
                    <div id='hold-indicator' hidden={!isCallOnHold}><FontAwesomeIcon icon={faPause}/></div>
                    <div id='loading-indicator' hidden={isVideoReceiving || !isVideoAvailable}>
                        <div>
                            <div className='loading-spinner'/>
                        </div>
                    </div>
                    <div
                            ref={videoContainerRef}
                            id='video-container'
                            hidden={!isVideoReceiving || !isVideoAvailable || isCallOnHold}>
                    </div>
                </main>
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
                            disabled={isHangingUp}>
                        <FontAwesomeIcon icon={faMaximize}/>
                    </button>
                    <button
                            id='capture-photo-button'
                            onClick={capturePhoto}
                            disabled={isCapturingPhoto || !isDataChannelAvailable || isCallOnHold || isHangingUp}>
                        <FontAwesomeIcon icon={faImage}/>
                    </button>
                    <button
                            id='camera-switch-button'
                            onClick={switchCamera}
                            disabled={isSwitchingCamera || !isDataChannelAvailable || isCallOnHold || isHangingUp}>
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
                                    || !isDataChannelAvailable
                                    || isCallOnHold
                                    || isHangingUp
                            }>
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
                    {isAudioInputMuted ? (
                        <button
                                id='unmute-input-button'
                                className='inactive'
                                onClick={unmuteInput}
                                disabled={isCallOnHold || !isCallConnected || isHangingUp}>
                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                        </button>
                    ) : (
                        <button
                                id='mute-input-button'
                                className='active'
                                onClick={muteInput}
                                disabled={!isCallConnected || isHangingUp}>
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    )}
                    {isAudioOutputMuted ? (
                        <button
                                id='unmute-output-button'
                                className='inactive'
                                onClick={unmuteOutput}
                                disabled={isCallOnHold || !isCallConnected || isHangingUp}>
                            <FontAwesomeIcon icon={faVolumeXmark}/>
                        </button>
                    ) : (
                        <button
                                id='mute-output-button'
                                className='active'
                                onClick={muteOutput}
                                disabled={!isCallConnected || isHangingUp}>
                            <FontAwesomeIcon icon={faVolumeHigh}/>
                        </button>
                    )}
                    {isCallOnHold ? (
                        <button
                                id='resume-button'
                                className='active'
                                onClick={resumeCall}
                                disabled={!isDataChannelAvailable || isHangingUp}>
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
                    <button id='hangup-button' disabled={isHangingUp} onClick={hangUp}>
                        {isHangingUp ? (
                            <div className='spinner-container'><div className='loading-spinner'/></div>
                        ) : (
                            <FontAwesomeIcon icon={faPhone}/>
                        )}
                        &nbsp;
                        Auflegen
                    </button>
                </footer>
            </div>
        </>
    );
};

export default CallScreen;
