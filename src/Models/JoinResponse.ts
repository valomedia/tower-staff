//
//  JoinResponse.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-26.
//
//


interface JoinResponse {
    joinInfo: {
        meetingResponse: {
            Meeting: {
                externalMeetingId: string | null,
                primaryMeetingId: string | null,
                mediaPlacement: {
                    audioFallbackUrl: string | null,
                    audioHostUrl: string,
                    signalingUrl: string,
                    turnControlUrl: string | null,
                    eventIngestionUrl: string | null
                },
                mediaRegion: string,
                meetingId: string
            }
        },
        attendeeResponse: {
            Attendee: {
                attendeeId: string,
                externalUserId: string,
                joinToken: string
            }
        }
    }
}

export default JoinResponse
