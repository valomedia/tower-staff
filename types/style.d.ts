//
//  style.d.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-28.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };

    // noinspection JSUnusedGlobalSymbols
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };

    // noinspection JSUnusedGlobalSymbols
    export default classes;
}

declare module '*.module.sass' {
    const classes: { readonly [key: string]: string };

    // noinspection JSUnusedGlobalSymbols
    export default classes;
}
