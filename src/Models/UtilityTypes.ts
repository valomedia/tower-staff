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
 * Any primitive including null and undefined.
 */
export type Primitive = number|string|boolean|symbol|null|undefined

/**
 * An object that must not have any properties.
 */
export type EmptyObject = Record<PropertyKey, never>

/**
 * A Type stripped of all properties that extend the ExcludedProperties.
 */
export type ExcludeProperties<Type, ExcludedProperties>
    = Pick<Type, {[Key in keyof Type]: Type[Key] extends ExcludedProperties ? never : Key}[keyof Type]>

/**
 * A Type stripped of all properties that don't extend the IncludedProperties.
 */
export type ExtractProperties<Type, IncludedProperties>
    = Pick<Type, {[Key in keyof Type]: Type[Key] extends IncludedProperties ? Key : never}[keyof Type]>

/**
 * A Type recursively stripped of all properties that extend the ExcludedProperties.
 *
 * This will recursively modify the Type, stopping when it reaches Primitives. The Array type is treated as a special
 * case in that it itself is left alone, but its type parameter will be modified according to the rules.
 */
export type RecursivelyExcludeProperties<Type, ExcludedProperties>
    = Type extends Primitive ? Type
    : Type extends Array<infer Element> ? Array<RecursivelyExcludeProperties<Element, ExcludedProperties>>
    : ExcludeProperties<{
        [Key in keyof Type]: Type[Key] extends ExcludedProperties
            ? Type[Key]
            : RecursivelyExcludeProperties<Type[Key], ExcludedProperties>
    }, ExcludedProperties>

/**
 * A Type recursively stripped of all properties that don't extend the IncludedProperties.
 *
 * This will recursively modify the Type, stopping when it reaches Primitives. The Array type is treated as a special
 * case in that it itself is left alone, but its type parameter will be modified according to the rules.
 */
// noinspection JSUnusedGlobalSymbols
export type RecursivelyExtractProperties<Type, IncludedProperties>
    = Type extends Primitive ? Type
    : Type extends Array<infer Element> ? Array<RecursivelyExtractProperties<Element, IncludedProperties>>
    : ExtractProperties<{
        [Key in keyof Type]: Type[Key] extends IncludedProperties
            ? RecursivelyExcludeProperties<Type[Key], IncludedProperties>
            : Type[Key]
    }, IncludedProperties>

/**
 * A Type recursively stripped of Functions.
 *
 * This is useful to represent the type that will result when decoding a type from JSON.
 */
export type Dead<Type> = RecursivelyExcludeProperties<Type, Function>
