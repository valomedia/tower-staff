//
//  ErrorInfo.ts
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * The data sent in an ErrorMessage.
 */
export default interface ErrorInfo {

    /**
     * A text describing the error that occurred in English.
     */
    readonly error: string;

    /**
     * A text describing the error that occurred in the language of the caller, if available.
     */
    readonly localizedError?: string;

}

/**
 * Predicate for checking if a given object is an ErrorMessage.
 *
 * @param errorInfo The object to check.
 */
export function isErrorInfo(errorInfo: any): errorInfo is ErrorInfo {
    return (
        typeof errorInfo === 'object'
        && typeof errorInfo.error === 'string'
        && (typeof errorInfo.localizedError === 'undefined' || typeof errorInfo.localizedError === 'string')
    );
}
