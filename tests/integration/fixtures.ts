/*
 * Copyright (c) 2026 valo.media GmbH
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

import { test as base, expect } from '@playwright/test';
import type AssistanceRequest from '../../src/Models/AssistanceRequest';
import type UserToken from '../../src/Models/UserToken';

interface MockBackend {
    tokenStatus: number;
    userToken: UserToken;
    offerStatus: number;
    assistanceRequest?: AssistanceRequest;
    requests: string[];
}

export function pendingAssistance(): AssistanceRequest {
    return {
        user: {
            username: 'Test caller',
            communicationUserId: '8:acs:00000000-0000-0000-0000-000000000000_00000000-0000-0000-0000-000000000002'
        },
        startDateTime: new Date()
    };
}

export const test = base.extend<{backend: MockBackend}>({
    backend: [async ({context, baseURL}, use) => {
        const backend: MockBackend = {
            tokenStatus: 200,
            userToken: {
                user: {
                    username: 'Test assistant',
                    communicationUserId: '8:acs:00000000-0000-0000-0000-000000000000_00000000-0000-0000-0000-000000000001'
                },
                // Deliberately invalid: real ACS initialization must not authenticate.
                token: 'integration-test-not-a-credential',
                expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            offerStatus: 200,
            requests: []
        };
        const unexpectedRequests: string[] = [];
        const pageErrors: string[] = [];
        const appOrigin = new URL(baseURL!).origin;

        context.on('page', page => page.on('pageerror', error => pageErrors.push(error.message)));
        await context.route('**/*', async route => {
            const request = route.request();
            const url = new URL(request.url());
            const key = `${request.method()} ${url.pathname}`;

            if (url.origin === appOrigin) {
                if (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) {
                    await route.continue();
                    return;
                }

                backend.requests.push(key);
                if (key === 'GET /api/assistanceToken' && !url.search) {
                    await route.fulfill({
                        status: backend.tokenStatus,
                        json: {userToken: backend.userToken}
                    });
                    return;
                }
                if (key === 'GET /api/offerAssistance' && !url.search) {
                    await route.fulfill({
                        status: backend.offerStatus,
                        json: {assistanceRequest: backend.assistanceRequest}
                    });
                    return;
                }
            }

            // The real ACS SDK fetches remote configuration even without valid credentials.
            // Deny that known request without contacting Azure; fail all other unexpected traffic.
            const isAcsConfiguration = request.method() === 'GET'
                && url.origin === 'https://ecs.communication.microsoft.com'
                && url.pathname.startsWith('/config/v1/Skype/');
            if (!isAcsConfiguration) {
                unexpectedRequests.push(`${request.method()} ${url.href}`);
            }
            await route.abort('blockedbyclient');
        });

        await context.routeWebSocket('**/*', socket => {
            const url = new URL(socket.url());
            if (url.origin === appOrigin.replace('http:', 'ws:') && url.pathname === '/ws') {
                socket.connectToServer();
            } else {
                unexpectedRequests.push(`WebSocket ${url.href}`);
                socket.close();
            }
        });

        await use(backend);
        expect(unexpectedRequests, 'Only mocked API calls and local app assets are allowed').toEqual([]);
        expect(pageErrors, 'The real app must not throw unhandled errors').toEqual([]);
    }, {auto: true}]
});

export { expect } from '@playwright/test';
