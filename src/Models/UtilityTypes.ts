//
//  UtilityTypes.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-20.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

export type Primitive = number|string|boolean|symbol|null|undefined

export type EmptyObject = Record<PropertyKey, never>

export type ExcludeProperties<Type, ExcludedProperties>
    = Pick<Type, {[Key in keyof Type]: Type[Key] extends ExcludedProperties ? never : Key}[keyof Type]>

export type ExtractProperties<Type, IncludedProperties>
    = Pick<Type, {[Key in keyof Type]: Type[Key] extends IncludedProperties ? Key : never}[keyof Type]>

export type RecursivelyExcludeProperties<Type, ExcludedProperties>
    = Type extends Primitive ? Type
    : Type extends Array<infer Element> ? Array<RecursivelyExcludeProperties<Element, ExcludedProperties>>
    : ExcludeProperties<{
        [Key in keyof Type]: Type[Key] extends ExcludedProperties
            ? Type[Key]
            : RecursivelyExcludeProperties<Type[Key], ExcludedProperties>
    }, ExcludedProperties>

export type RecursivelyExtractProperties<Type, IncludedProperties>
    = Type extends Primitive ? Type
    : Type extends Array<infer Element> ? Array<RecursivelyExtractProperties<Element, IncludedProperties>>
    : ExtractProperties<{
        [Key in keyof Type]: Type[Key] extends IncludedProperties
            ? RecursivelyExcludeProperties<Type[Key], IncludedProperties>
            : Type[Key]
    }, IncludedProperties>

export type Dead<Type> = RecursivelyExcludeProperties<Type, Function>
