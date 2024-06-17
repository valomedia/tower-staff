//
//  react-app-env.d.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
    // noinspection JSUnusedGlobalSymbols
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly PUBLIC_URL: string;
    }
}

declare module '*.avif' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.bmp' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.gif' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.jpg' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.jpeg' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.png' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.webp' {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module '*.svg' {
    import * as React from 'react';

    // noinspection JSUnusedGlobalSymbols
    export const ReactComponent: React.FunctionComponent<React.SVGProps<
        SVGSVGElement
    > & { title?: string }>;

    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

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
