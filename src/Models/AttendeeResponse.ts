//
//  AttendeeResponse.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-09-06.
//
//


interface JoinResponse {
        Attendee: {
            AttendeeId: string,
            ExternalUserId: string,
            JoinToken: string
        }
}

export default JoinResponse
