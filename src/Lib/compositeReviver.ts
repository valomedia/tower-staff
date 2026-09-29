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
 * Function for creating JSON revivers that consist of a pipeline of other revivers.
 *
 * This function will take any number of JSON revivers as an argument and return a reviver that applies all the
 * revivers in the order they were given in.
 *
 * @revivers The revivers to compose
 */
export default function compositeReviver(
    ...revivers: ((key: string, value: any) => any)[]
): (key: string, value: any) => any {
    return (key, value) => revivers.reduce(({key, value}, f) => ({key, value: f(key, value)}), {key, value}).value
}

