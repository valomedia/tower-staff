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

import { test, expect, pendingAssistance } from './fixtures';

const connecting = 'Verbindung wird hergestellt…';
const waiting = 'Warten auf Anfragen…';
const ringing = 'Eine Nutzer:in benötigt Unterstützung!';

test('retries backend setup and recovers without reloading', async ({page, backend}) => {
    backend.tokenStatus = 503;
    await page.goto('/');

    await expect(page).toHaveTitle('Tower');
    await expect(page.getByRole('heading', {name: 'Tower', exact: true})).toBeVisible();
    await expect(page.getByText(connecting, {exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Anfrage annehmen'})).toBeDisabled();
    await expect(page.locator('#call-options-button')).toBeDisabled();

    // Strict Mode can bootstrap twice; a third request proves the retry timer ran.
    await expect.poll(() => backend.requests.filter(request => request === 'GET /api/assistanceToken').length)
        .toBeGreaterThanOrEqual(3);
    expect(backend.requests).not.toContain('GET /api/offerAssistance');

    const navigations: string[] = [];
    page.on('framenavigated', frame => navigations.push(frame.url()));
    backend.tokenStatus = 200;
    await expect(page.getByText(waiting, {exact: true})).toBeVisible();
    await expect(page.locator('#call-options-button')).toBeEnabled();
    await expect.poll(() => backend.requests).toContain('GET /api/offerAssistance');
    expect(navigations).toEqual([]);
});

test('polls the queue and clears withdrawn requests without allowing an unready call', async ({page, backend}) => {
    await page.goto('/');
    await expect(page.getByText(waiting, {exact: true})).toBeVisible();
    await expect.poll(() => backend.requests).toContain('GET /api/offerAssistance');
    await expect(page.getByRole('button', {name: 'Anfrage annehmen'})).toBeDisabled();

    backend.assistanceRequest = pendingAssistance();
    await expect(page.getByText(ringing, {exact: true})).toBeVisible();
    // Tower HTTP mocks do not replace the real ACS calling stack.
    await expect(page.getByRole('button', {name: 'Anfrage annehmen'})).toBeDisabled();

    backend.assistanceRequest = undefined;
    await expect(page.getByText(waiting, {exact: true})).toBeVisible();
    expect(backend.requests).not.toContain('POST /api/beginAssistance');
});

test('clears ringing on a polling failure and recovers on the next successful poll', async ({page, backend}) => {
    backend.assistanceRequest = pendingAssistance();
    await page.goto('/');
    await expect(page.getByText(ringing, {exact: true})).toBeVisible();

    backend.offerStatus = 503;
    await expect(page.getByText(waiting, {exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Anfrage annehmen'})).toBeDisabled();

    backend.offerStatus = 200;
    await expect(page.getByText(ringing, {exact: true})).toBeVisible();
});

test('toggles the ringtone through the rendered controls', async ({page}) => {
    await page.goto('/');
    await expect(page.getByText(waiting, {exact: true})).toBeVisible();

    await page.getByRole('button', {name: 'Klingelton ist an'}).click();
    await expect(page.getByRole('button', {name: 'Klingelton ist aus'})).toBeVisible();
    await page.getByRole('button', {name: 'Klingelton ist aus'}).click();
    await expect(page.getByRole('button', {name: 'Klingelton ist an'})).toBeVisible();
});

test('reloads for a near-expiry token when a request arrives', async ({page, backend}) => {
    backend.userToken.expiresOn = new Date(Date.now() + 60 * 60 * 1000);
    await page.goto('/');
    await expect(page.getByText(waiting, {exact: true})).toBeVisible();
    const bootstrapRequests = backend.requests.filter(request => request === 'GET /api/assistanceToken').length;

    // The current document keeps the old token; the next bootstrap receives a fresh one.
    backend.userToken.expiresOn = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const reloaded = page.waitForEvent('framenavigated', frame => frame === page.mainFrame());
    backend.assistanceRequest = pendingAssistance();
    await reloaded;

    await expect(page.getByText(ringing, {exact: true})).toBeVisible();
    expect(backend.requests.filter(request => request === 'GET /api/assistanceToken').length)
        .toBeGreaterThan(bootstrapRequests);
});
