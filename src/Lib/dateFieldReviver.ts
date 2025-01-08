//
//  dateFieldReviver.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-24.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * JSON reviver for objects containing Date's.
 *
 * This reviver detects strings that are in date time string format and turns them into Date objects. To avoid
 * converting fields that shouldn't be converted, no components of the date time string format may be omitted.
 *
 * @param _
 * @param value The value produced by parsing.
 *
 * @return A Date if the value is a string that looks like a date, the unmodified value otherwise.
 */
export default function dateFieldReviver(_: string, value: any): any {
    return (typeof value === "string" && value.match(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ/))
        ? new Date(value) : value;
}
