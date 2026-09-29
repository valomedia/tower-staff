/*
 * Copyright (c) 2023-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

//
//  CallScreen.tsx
//  tower-staff
//
//
//

import { MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
    faRotateRight,
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
import { FULL_ROTATION, ROTATION_STEP, RotationAngle } from '../Models/RotationAngle';

const DATA_CHANNEL_ID = 1000;

const DATA_CHANNEL_BANDWIDTH_KBPS = 32;

const DATA_CHANNEL_FLUSH_DELAY_MS = 2000;

const FORCE_CALL_TEARDOWN_DELAY_MS = 10000;

const RESUME_CALL_DELAY_MS = 3000;

const RENDER_PHOTO_PREVIEW_DELAY_MS = 500;

const REENABLE_PHOTO_BUTTON_DELAY_MS = 8000;

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
        setIsPresentingCallOptionsDialog,
        resetCallingStack
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
     * How much the video from the caller needs to be rotated clockwise to achieve its natural orientation.
     */
    const [videoOrientation, setVideoOrientation] = useState<RotationAngle>(0);

    /**
     * How much the assistant has manually rotated the video clockwise, relative to its natural orientation.
     */
    const [videoRotationAngle, setVideoRotationAngle] = useState<RotationAngle>(0);

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
     * Timeout for re-enabling the photo button is no response is received.
     *
     * This is the ID of the timeout that re-enables the photo button after a while if no response is received. It is
     * needed to cancel the timeout when a response is received and the button is re-enabled before the timeout.
     * Otherwise the timeout would still fire and might prematurely re-enable the button while it's disabled again
     * waiting for a new photo.
     */
    const [photoTimeout, setPhotoTimeout] = useState<NodeJS.Timeout>();

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
    const {photo, setPhoto, storePhotoDataChunk, clearPhoto} = usePhoto();

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

    /**
     * The canvas photo previews are drawn into.
     */
    const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>;

    const hangUpTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const forceTearingDownCallRef = useRef(false);

    const clearPendingHangUpTimeout = () => {
        if (!hangUpTimeoutRef.current) { return; }

        clearTimeout(hangUpTimeoutRef.current);
        hangUpTimeoutRef.current = undefined;
    };

    const finalizeCallEnd = useCallback(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        const videoContainer = videoContainerRef.current;

        clearPendingHangUpTimeout();
        forceTearingDownCallRef.current = false;

        setIsOnCall(false);
        setIsCallConnected(false);
        setIsDataChannelAvailable(false);
        setIsHangingUp(false);
        setIsVideoReceiving(false);
        setIsVideoAvailable(false);
        setIsVideoEnabled(true);
        setVideoRotationAngle(0);
        setVideoOrientation(0);
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
        videoContainer?.replaceChildren();
        if (videoContainer) {
            videoContainer.className = '';
        }
        if (canvas) {
            context?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setIsVideoMaximized(false);
    }, [clearPhoto, setIsOnCall]);

    const forceResetActiveCall = useCallback(async (reason: string) => {
        if (forceTearingDownCallRef.current) { return; }

        forceTearingDownCallRef.current = true;
        setIsHangingUp(true);
        console.warn(reason);

        try {
            await resetCallingStack();
        } catch (error) {
            console.error('Failed to reset ACS calling stack.', error);
        } finally {
            finalizeCallEnd();
        }
    }, [finalizeCallEnd, resetCallingStack]);

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
    const capturePhoto = async () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        setIsCapturingPhoto(true);
        clearPhoto();
        if (canvas) {
            context?.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Re-enable the button after a while even if no response is received.
        setPhotoTimeout(setTimeout(() => setIsCapturingPhoto(false), REENABLE_PHOTO_BUTTON_DELAY_MS));

        // Render a preview by pulling a frame from the video feed. This is delayed slightly to hopefully make it match
        // up roughly with what will be on the photo once it comes through.
        setTimeout(() => renderPhotoPreview(), RENDER_PHOTO_PREVIEW_DELAY_MS);

        if (!isDataChannelAvailable) { return; }
        sendMessage({capturePhotoRequest: await TowerApi.createImageUploadUrl()});
    };

    /*
     * Capture a picture preview.
     *
     * Capturing a photo takes a while and isn't supported by all apps. For this reason, shortly after the assistant
     * has hit the photo capture button, we capture a frame from the video feed, so we have something to display while
     * waiting for (or instead of) the real picture.
     */
    const renderPhotoPreview = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        const videoContainer = videoContainerRef.current;
        const video = videoContainer?.getElementsByTagName('video').item(0);
        if (!canvas || !context || !video) { return; }

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const dw = (videoOrientation === 0 || videoOrientation === 180) ? canvas.width : canvas.height;
        const dh = (videoOrientation === 0 || videoOrientation === 180) ? canvas.height : canvas.width;
        const sw = Math.min(video.videoWidth, video.videoHeight * dw / dh);
        const sh = Math.min(video.videoHeight, video.videoWidth / dw * dh);
        const sx = (video.videoWidth - sw) / 2;
        const sy = (video.videoHeight - sh) / 2;

        switch (videoOrientation) {
            case 90:
                context.setTransform(0, 1, -1, 0, dh, 0);
                break;
            case 180:
                context.setTransform(-1, 0, 0, -1, dw, dh);
                break;
            case 270:
                context.setTransform(0, -1, 1, 0, 0, dw);
                break;
        }
        context.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
        context.setTransform(1, 0, 0, 1, 0, 0);
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
     * Rotate the video manually.
     */
    const rotateVideo = () => {
        setVideoRotationAngle(((videoRotationAngle + ROTATION_STEP) % FULL_ROTATION) as RotationAngle);
    };

    /**
     * Respond to a capturePhotoResponse.
     *
     * When this arrives, the photo has already been fully transmitted and is hopefully being shown to the user, so
     * this just re-enables the button.
     */
    const handleCapturePhotoResponse = (capturePhotoResponse: {key: string}|{uuid: string}|ErrorInfo) => {
        setIsCapturingPhoto(false);
        if (photoTimeout) { clearTimeout(photoTimeout); }
        if ("key" in capturePhotoResponse) {
            TowerApi
                .createImageDownloadUrl(capturePhotoResponse.key)
                .then(x => x.downloadUrl)
                .then(setPhoto);
        }
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
    const handleOrientationEvent = (orientationEvent: {rotationAngle: RotationAngle}) => {
        setVideoOrientation(orientationEvent.rotationAngle);
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
    const endCall = (callToEnd?: Call) => {
        if (!callToEnd) {
            finalizeCallEnd();
            return;
        }

        if (isHangingUp || forceTearingDownCallRef.current) { return; }

        if (callToEnd.state === 'Disconnected') {
            finalizeCallEnd();
            return;
        }

        setIsHangingUp(true);
        clearPendingHangUpTimeout();
        hangUpTimeoutRef.current = setTimeout(
            async () => {
                if (callToEnd.state === 'Disconnected' || forceTearingDownCallRef.current) { return; }

                await forceResetActiveCall(`Call ${callToEnd.id} did not disconnect cleanly; resetting ACS call stack.`);
            },
            FORCE_CALL_TEARDOWN_DELAY_MS
        );

        callToEnd
            .hangUp({forEveryone: true})
            .catch(async error => {
                console.error('Failed to hang up the call cleanly; resetting ACS call stack.', error);
                await forceResetActiveCall(`Hang-up failed for call ${callToEnd.id}; resetting ACS call stack.`);
            });
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
                    finalizeCallEnd();
                    console.log(`Call ended, call end reason=${JSON.stringify(call.callEndReason)}`);
                    break;
            }
        });

        call.remoteParticipants.forEach(subscribeToRemoteParticipant);
        call.on('remoteParticipantsUpdated', ({added, removed}) => {
            added.forEach(subscribeToRemoteParticipant);

            // End the call, if the user unexpectedly drops.
            if (removed.length) {endCall(call);}
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
        if (!videoContainer) { return; }

        const createViewIfAvailable = async () => {
            if (remoteVideoStream.isAvailable) {
                // If the incoming stream is RawMedia, we have to guess the initial orientation while we wait for the
                // first orientationEvent Message. We will assume the video is in portrait mode.
                if (!videoContainer.className && remoteVideoStream.mediaStreamType === "RawMedia") {
                    videoContainer.className = "portrait";
                }

                const view = await renderer.createView({scalingMode: 'Fit'});
                if (!videoContainerRef.current) {
                    view.dispose();
                    return;
                }
                videoContainer.appendChild(view.target);
                const disposeViewIfUnavailable = async () => {
                    if (!remoteVideoStream.isAvailable) {
                        if (videoContainer.contains(view.target)) {
                            videoContainer.removeChild(view.target);
                        }
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
                console.log("Got data message:", message);

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
        console.log("Sending data message:", message);
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
                        finalizeCallEnd();
                    });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOnCall, setIsOnCall]
    );

    useEffect(
        () =>
            () => {
                clearPendingHangUpTimeout();
            },
        []
    );

    useEffect(
        () => {
            if (videoContainerRef.current) {
                videoContainerRef.current.className = `rotation-${videoOrientation + videoRotationAngle}`;
            }
        },
        [videoOrientation, setVideoOrientation, videoRotationAngle, setVideoRotationAngle]
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
                    <canvas ref={canvasRef}></canvas>
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
                    <button
                        id='rotate-video-button'
                        className={videoRotationAngle ? 'active' : 'inactive'}
                        onClick={rotateVideo}>
                        <FontAwesomeIcon icon={faRotateRight}/>
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
                    <button id='hangup-button' disabled={isHangingUp} onClick={() => endCall(call)}>
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
