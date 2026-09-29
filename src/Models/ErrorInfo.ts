/*
 * Copyright (c) 2024-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
