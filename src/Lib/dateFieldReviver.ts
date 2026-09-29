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
