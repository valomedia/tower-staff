//
//  urlFieldReviver.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-24.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * JSON reviver for objects containing URLs.
 *
 * This reviver detects strings that start with `http://` or `https://` and turns them into URL objects.
 *
 * @param _
 * @param value The value produced by parsing.
 *
 * @return A URL if the value is a string that looks like a URL, the unmodified value otherwise.
 */
export default function urlFieldReviver(_: string, value: any): any {
    return (typeof value === "string" && value.match(/https?:\/\//)) ? new URL(value) : value;
}
