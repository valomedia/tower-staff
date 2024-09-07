//
//  MeetingResponse.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-09-06.
//
//


interface MeetingResponse {
    Meeting: {
        ExternalMeetingId: string | null,
        PrimaryMeetingId: string | null,
        MediaPlacement: {
            AudioFallbackUrl: string | null,
            AudioHostUrl: string,
            SignalingUrl: string,
            TurnControlUrl: string | null,
            EventIngestionUrl: string | null
        },
        MediaRegion: string,
        MeetingId: string
    }
}

export default MeetingResponse
