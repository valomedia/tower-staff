//
//  style.d.ts
//  tower-staff
//
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
