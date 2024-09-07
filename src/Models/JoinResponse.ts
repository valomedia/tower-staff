//
//  JoinResponse.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-26.
//
//


import MeetingResponse from './MeetingResponse';
import AttendeeResponse from './AttendeeResponse';

interface JoinResponse {
    joinInfo: {
        meetingResponse: MeetingResponse,
        attendeeResponse: AttendeeResponse
    }
}

export default JoinResponse
