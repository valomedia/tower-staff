//
//  CallController.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-26.
//
//

import {
    AudioVideoObserver,
    ConsoleLogger,
    DataMessage,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSession,
    MeetingSessionConfiguration,
    VideoTileState
} from 'amazon-chime-sdk-js';

import JoinResponse from '../Models/JoinResponse';
import DataMessageTopic from '../Models/DataMessageTopic';
import RealtimeDataMessageObserver from '../Models/RealtimeDataMessageObserver';
import CapturePhotoResponseData, { capturePhotoResponseDataReviver } from '../Models/CapturePhotoResponseData';
import PhotoResource from '../Models/PhotoResource';

/*
 * Controller in charge of one call.
 */
class CallController {

    constructor(
        joinResponse: JoinResponse,
        audioElement: HTMLAudioElement,
        videoElement: HTMLVideoElement,
        observer: AudioVideoObserver = {},
        dataMessageDidReceived: RealtimeDataMessageObserver
    ) {
        const meetingResponse = joinResponse.joinInfo.meetingResponse;
        const attendeeResponse = joinResponse.joinInfo.attendeeResponse;
        const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeResponse);
        const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
        this.meetingSession = meetingSession;

        (async () => {
            const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
            const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();

            audioInputDevices.forEach(mediaDeviceInfo => {
                console.log(`Device ID: ${mediaDeviceInfo.deviceId} Input: ${mediaDeviceInfo.label}`);
            });
            audioOutputDevices.forEach(mediaDeviceInfo => {
                console.log(`Device ID: ${mediaDeviceInfo.deviceId} Output: ${mediaDeviceInfo.label}`);
            })

            meetingSession.audioVideo.addObserver({
                // Add the video, once the caller is connected.
                videoTileDidUpdate: (tileState: VideoTileState) => {
                    // Ignore a tile without attendee ID or tile ID, a local tile, and a content share.
                    if (!tileState.tileId || !tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
                        return;
                    }
                    logger.info('videoTileDidUpdate')
                    meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
                    videoElement.classList.remove('inactive')
                    videoElement.classList.add('active')
                },

                // If a video tile is removed, unbind the stream from the element, but keep the element around in case
                // the video resumes.
                videoTileWasRemoved: (tileId: number) => {
                    logger.info('videoTileWasRemoved')
                    meetingSession.audioVideo.unbindVideoElement(tileId, false)
                    videoElement.classList.remove('active')
                    videoElement.classList.add('inactive')
                }
            });

            audioElement.muted = true
            meetingSession.audioVideo.realtimeMuteLocalAudio();
            await meetingSession.audioVideo.bindAudioElement(audioElement);
            meetingSession.audioVideo.addObserver(observer);
            for (let topic of Object.values(DataMessageTopic)) {
                meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(topic, dataMessageDidReceived);
                meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(topic, (msg) => {
                    logger.info(`dataMessageDidReceived ${msg.timestampMs} ${msg.topic} ${msg.senderAttendeeId}`);
                })
            }
            meetingSession.audioVideo.start();
        })()
    }

    /*
     * The Amazon Chime MeetingSession for the call.
     */
    meetingSession: MeetingSession;

    /*
     * Tell the client to capture a photo.
     */
    async capturePhoto() {
        this.sendMessage(DataMessageTopic.CapturePhotoRequest);
        const response = await this.awaitCapturePhotoResponse();
        if (!response.photoData) { return; }
        const imageSize = response.photoData.imageSize;
        const chunkCount = response.photoData.chunkingInfo.count;
        const photoUUID = response.photoData.chunkingInfo.uuid;
        const chunks: string[] = new Array(chunkCount);
        chunks[response.photoData.chunkingInfo.index] = response.photoData.imageData;
        while (chunks.flat().length < response.photoData.chunkingInfo.count) {
            const chunk = await this.awaitCapturePhotoResponse();
            if (
                chunk.photoData
                    && chunk.photoData.imageSize.toString() === imageSize.toString()
                    && chunk.photoData.chunkingInfo.uuid === photoUUID
                    && chunk.photoData.chunkingInfo.count === chunkCount
            ) {
                chunks[chunk.photoData.chunkingInfo.index] = chunk.photoData.imageData;
            }
        }
        return new PhotoResource(new URL('data:image/jpeg;base64,' + chunks.join('')), imageSize);
    }

    /*
     * Tell the client to switch cameras.
     */
    async switchCamera() {
        this.sendMessage(DataMessageTopic.SwitchCameraRequest);
        await this.awaitResponse(DataMessageTopic.SwitchCameraResponse);
    }

    /*
     * Tell the client to toggle the torch.
     */
    async toggleTorch() {
        this.sendMessage(DataMessageTopic.ToggleTorchRequest);
        await this.awaitResponse(DataMessageTopic.ToggleTorchResponse);
    }

    /*
     * Request the current location from the client.
     */
    async requestLocation() {
        this.sendMessage(DataMessageTopic.LocationRequest);
        await this.awaitResponse(DataMessageTopic.LocationResponse);
    }

    /*
     * Tell the client to restart the video.
     */
    async restartVideo() {
        this.sendMessage(DataMessageTopic.RestartVideoRequest);
        await this.awaitResponse(DataMessageTopic.RestartVideoResponse);
    }

    /**
     * Tell the client that the assistant is ready.
     */
    sendAssistantReadyEvent() {
        this.sendMessage(DataMessageTopic.AssistantReadyEvent);
    }

    /**
     * Tell the client that the assistant is busy.
     */
    sendAssistantBusyEvent() {
        this.sendMessage(DataMessageTopic.AssistantBusyEvent);
    }

    private sendMessage(topic: DataMessageTopic, data: Object = {}) {
        this.meetingSession.audioVideo.realtimeSendDataMessage(topic, data, dataMessageLifetimeMs);
    }

    private async awaitResponse(topic: DataMessageTopic) {
        return new Promise<DataMessage>((resolve) => {
            this.meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(
                topic,
                (msg) => {
                    this.meetingSession.audioVideo.realtimeUnsubscribeFromReceiveDataMessage(topic);
                    resolve(msg)
                }
            )
        })
    }

    private async awaitCapturePhotoResponse(): Promise<CapturePhotoResponseData> {
        return JSON.parse(
            (await this.awaitResponse(DataMessageTopic.CapturePhotoResponse)).text(),
            capturePhotoResponseDataReviver
        );
    }

}

/*
 * How long the data messages are valid.
 *
 * Since the messages are always transmitted to the user in real time (there is no situation where messages are sent
 * for a user that isn't on the call yet), the messages are usually delivered immediately.  The messages still have a
 * lifetime of ten seconds, however, to account for users who may be experiencing brief intermittent interruptions in
 * their connection, due to a spotty network.
 *
 * If the message does not reach the user within ten seconds, the message will be quietly discarded.  This will
 * currently result in actions in the ui becoming disabled for the duration of the call.  The inherent assumption
 * being that if the call hangs completely for more than ten seconds at a time, assistance will become impossible
 * anyway, and there is no reasonable way to gracefully recover.
 */
const dataMessageLifetimeMs = 10_000;

const logger = new ConsoleLogger('CallController', LogLevel.INFO);
const deviceController = new DefaultDeviceController(logger);

export default CallController;
