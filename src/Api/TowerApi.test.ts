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

import { assistanceToken, createImageDownloadUrl } from './TowerApi';

describe('TowerApi', () => {
    const fetchMock = jest.fn();

    beforeEach(() => {
        process.env.REACT_APP_TOWER_API_ENDPOINT = 'https://tower.example';
        global.fetch = fetchMock;
    });

    afterEach(() => {
        fetchMock.mockReset();
    });

    it('fetches an assistance token from the configured endpoint', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            text: async () => JSON.stringify({
                userToken: {
                    token: 'test-token',
                    expiresOn: '2025-05-05T12:34:56.789Z'
                }
            })
        });

        const result = await assistanceToken();

        expect(fetchMock).toHaveBeenCalledWith(
            'https://tower.example/assistanceToken',
            expect.objectContaining({
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        );
        expect(result.userToken.token).toBe('test-token');
        expect(result.userToken.expiresOn).toBeInstanceOf(Date);
    });

    it('posts request bodies and revives URL and Date response fields', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            text: async () => JSON.stringify({
                downloadUrl: 'https://files.example/photo.jpg',
                expiresOn: '2025-05-05T12:34:56.789Z'
            })
        });

        const result = await createImageDownloadUrl('photo-key');

        expect(fetchMock).toHaveBeenCalledWith(
            'https://tower.example/createImageDownloadUrl',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({key: 'photo-key'})
            })
        );
        expect(result.downloadUrl).toBeInstanceOf(URL);
        expect(result.downloadUrl.href).toBe('https://files.example/photo.jpg');
        expect(result.expiresOn).toBeInstanceOf(Date);
    });

    it('throws when the backend responds with an error status', async () => {
        fetchMock.mockResolvedValue({ok: false, statusText: 'Unauthorized'});

        await expect(assistanceToken()).rejects.toThrow('Unauthorized');
    });
});
