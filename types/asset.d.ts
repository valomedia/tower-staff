//
//  asset.d.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-06-07.
//
//

declare module "*.m4a" {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
}

declare module "*.mp3" {
    const src: string;

    // noinspection JSUnusedGlobalSymbols
    export default src;
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
