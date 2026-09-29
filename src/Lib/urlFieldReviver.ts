/*
 * Copyright (c) 2025-2026 valo.media GmbH
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
