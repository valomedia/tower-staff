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

import compositeReviver from './compositeReviver';
import dateFieldReviver from './dateFieldReviver';
import urlFieldReviver from './urlFieldReviver';

describe('JSON field revivers', () => {
    it('converts date-time strings into Date instances', () => {
        const revived = dateFieldReviver('expiresOn', '2025-05-05T12:34:56.789Z');

        expect(revived).toBeInstanceOf(Date);
        expect(revived.toISOString()).toBe('2025-05-05T12:34:56.789Z');
    });

    it('leaves non-date strings unchanged', () => {
        expect(dateFieldReviver('name', '2025-05-05')).toBe('2025-05-05');
    });

    it('converts http and https strings into URL instances', () => {
        const revived = urlFieldReviver('downloadUrl', 'https://example.com/photo.jpg');

        expect(revived).toBeInstanceOf(URL);
        expect(revived.href).toBe('https://example.com/photo.jpg');
    });

    it('runs composed revivers in order when parsing JSON', () => {
        const parsed = JSON.parse(
            JSON.stringify({
                expiresOn: '2025-05-05T12:34:56.789Z',
                downloadUrl: 'https://example.com/photo.jpg',
                label: 'unchanged'
            }),
            compositeReviver(dateFieldReviver, urlFieldReviver)
        );

        expect(parsed.expiresOn).toBeInstanceOf(Date);
        expect(parsed.downloadUrl).toBeInstanceOf(URL);
        expect(parsed.label).toBe('unchanged');
    });
});
