/*
 * Copyright (c) 2023-2026 valo.media GmbH
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

//
//  asset.d.ts
//  tower-staff
//
//
//

declare module "*.m4a" {
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
