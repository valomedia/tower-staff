//
//  UtilityTypes.ts
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

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
