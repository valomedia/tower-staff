//
//  dateFieldReviver.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-24.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

export default function dateFieldReviver(key: string, value: any) {
    return (typeof value === "string" && value.match(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ/))
        ? new Date(value) : value;
}
