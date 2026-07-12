//
//  compositeReviver.ts
//  tower-staff
//
//  Copyright © 2025 valo.media GmbH. All rights reserved.
//

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

