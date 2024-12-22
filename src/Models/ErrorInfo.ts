//
//  ErrorInfo.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-21.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

export default interface ErrorInfo {

    readonly error: string;

    readonly localizedError?: string;

}

export function isErrorInfo(errorInfo: any): errorInfo is ErrorInfo {
    return (
        typeof errorInfo === 'object'
        && typeof errorInfo.error === 'string'
        && (typeof errorInfo.localizedError === 'undefined' || typeof errorInfo.localizedError === 'string')
    );
}
