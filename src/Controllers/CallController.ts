//
//  CallController.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-26.
//
//

import {
    AudioVideoObserver,
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSession,
    MeetingSessionConfiguration,
    VideoTileState
} from 'amazon-chime-sdk-js';

import JoinResponse from '../Models/JoinResponse';
import DataMessageTopic from '../Models/DataMessageTopic';

/*
 * Controller in charge of one call.
 */
class CallController {

    constructor(
        joinResponse: JoinResponse,
        audioElement: HTMLAudioElement,
        videoElement: HTMLVideoElement,
        observer: AudioVideoObserver = {}
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
                videoTileDidUpdate: (tileState: VideoTileState) => {
                    // Ignore a tile without attendee ID or tile ID, a local tile, and a content share.
                    if (!tileState.tileId || !tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
                        return;
                    }

                    meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
                }
            });

            await meetingSession.audioVideo.bindAudioElement(audioElement);
            meetingSession.audioVideo.addObserver(observer);
            meetingSession.audioVideo.start();
        })()
    }

    /*
     * The Amazon Chime MeetingSession for the call.
     */
    meetingSession: MeetingSession;

    /*
     * Tell the client to switch cameras.
     */
    async switchCamera() {
        this.sendMessage(DataMessageTopic.SwitchCameraRequest);
        return this.receiveMessage(DataMessageTopic.SwitchCameraResponse);
    }

    /*
     * Tell the client to toggle the torch.
     */
    async toggleTorch() {
        this.sendMessage(DataMessageTopic.ToggleTorchRequest);
        return this.receiveMessage(DataMessageTopic.ToggleTorchResponse);
    }

    private sendMessage(topic: DataMessageTopic, data: Object = {}) {
        this.meetingSession.audioVideo.realtimeSendDataMessage(topic, data, dataMessageLifetimeMs);
    }

    private async receiveMessage(topic: DataMessageTopic) {
        return new Promise<Object>((resolve) => {
            this.meetingSession.audioVideo.realtimeSubscribeToReceiveDataMessage(
                topic,
                (msg) => {
                    this.meetingSession.audioVideo.realtimeUnsubscribeFromReceiveDataMessage(topic);
                    resolve(msg.json())
                }
            )
        })
    }

}

/*
 * How long the data messages are valid.
 *
 * Since the messages are always transmitted to the user in real time (there is no situation where messages are sent
 * for a user that isn't on the call yet), the messages are usually delivered immediately.  The messages still have a
 * lifetime of ten seconds however, in order to account for users who may be experiencing brief intermittent
 * interruptions in their connection, due to a spotty network.
 *
 * If the message does not reach the user within ten seconds, the message will be quietly discarded.  This will
 * currently result in actions in the ui becoming disabled for the duration of the call.  The inherent assumption
 * being, that if the call hangs completely for more than ten seconds at a time, assistance will become impossible
 * anyway, and there is no reasonable way to gracefully recover.
 */
const dataMessageLifetimeMs = 10_000;

const logger = new ConsoleLogger('CallController', LogLevel.INFO);
const deviceController = new DefaultDeviceController(logger);

export default CallController;
