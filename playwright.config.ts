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

import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:4173';

export default defineConfig({
    testDir: './tests/integration',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    workers: 1,
    expect: {timeout: 10_000},
    reporter: [['list'], ['html', {open: 'never'}]],
    use: {
        baseURL,
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
    },
    projects: [{
        name: 'chromium',
        use: {
            ...devices['Desktop Chrome'],
            launchOptions: {
                executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
                args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
            }
        }
    }],
    webServer: {
        command: 'npm run start:integration',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000
    }
});
