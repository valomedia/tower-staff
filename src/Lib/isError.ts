//
//  isError.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-22.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * Check if the given parameter is an Error.
 *
 * @param error     The parameter to check.
 */
export default function isError(error: any): error is Error {
    return (
        typeof error === 'object'
            && typeof error.name === 'string'
            && typeof error.message === 'string'
            && (typeof error.stack === 'undefined' || typeof error.stack === 'string')
    );
}
