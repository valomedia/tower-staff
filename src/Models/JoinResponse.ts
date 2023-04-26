//
//  JoinResponse.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-26.
//
//


interface JoinResponse {
    joinInfo: {
        meetingResponse: {
            Meeting: {
                externalMeetingId: String | null,
                primaryMeetingId: String | null,
                mediaPlacement: {
                    audioFallbackUrl: String | null,
                    audioHostUrl: String,
                    signalingUrl: String,
                    turnControlUrl: String | null,
                    eventIngestionUrl: String | null
                },
                mediaRegion: String,
                meetingId: String
            }
        },
        attendeeResponse: {
            Attendee: {
                attendeeId: String,
                externalUserId: String,
                joinToken: String
            }
        }
    }
}

export default JoinResponse
