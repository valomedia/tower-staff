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

            meetingSession.audioVideo.bindAudioElement(audioElement);
            meetingSession.audioVideo.addObserver(observer);
            meetingSession.audioVideo.start();
        })()
    }

    /*
     * The Amazon Chime MeetingSession for the call.
     */
    meetingSession: MeetingSession;

}

const logger = new ConsoleLogger('CallController', LogLevel.INFO);
const deviceController = new DefaultDeviceController(logger);

export default CallController;
