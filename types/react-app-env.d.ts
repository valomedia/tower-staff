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
