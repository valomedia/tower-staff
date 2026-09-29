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

import { searchUrl, staticMap } from './MapsApi';
import Coordinate from '../Models/Coordinate';
import ImageSize from '../Models/ImageSize';
import Marker from '../Models/Marker';

describe('MapsApi', () => {
    beforeEach(() => {
        process.env.REACT_APP_MAPS_API_KEY = 'maps-test-key';
    });

    it('builds a Google Static Maps URL with defaults and markers', () => {
        const url = staticMap({
            center: new Coordinate({latitude: 52.52, longitude: 13.405}),
            zoom: 13,
            size: new ImageSize({width: 640, height: 320}),
            markers: [
                new Marker({
                    style: {color: 'red'},
                    place: new Coordinate({latitude: 52.5, longitude: 13.4})
                }),
                new Marker({place: 'Berlin Hauptbahnhof'})
            ]
        });

        expect(url.origin + url.pathname).toBe('https://maps.googleapis.com/maps/api/staticmap');
        expect(url.searchParams.get('key')).toBe('maps-test-key');
        expect(url.searchParams.get('center')).toBe('52.52,13.405');
        expect(url.searchParams.get('zoom')).toBe('13');
        expect(url.searchParams.get('size')).toBe('640x320');
        expect(url.searchParams.get('scale')).toBe('1');
        expect(url.searchParams.get('format')).toBe('png8');
        expect(url.searchParams.get('maptype')).toBe('roadmap');
        expect(url.searchParams.getAll('markers')).toEqual([
            'color:red|52.5,13.4',
            'Berlin Hauptbahnhof'
        ]);
    });

    it('builds a Google Maps search URL for coordinates', () => {
        const url = searchUrl({query: new Coordinate({latitude: 52.52, longitude: 13.405})});

        expect(url.origin + url.pathname).toBe('https://www.google.com/maps/search/');
        expect(url.searchParams.get('api')).toBe('1');
        expect(url.searchParams.get('query')).toBe('52.52,13.405');
    });
});
