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
//  MapsApi.ts
//  tower-staff
//
//
//

import Coordinate from '../Models/Coordinate';
import ImageSize from '../Models/ImageSize';
import Marker from '../Models/Marker';

/*
 * Get a static map image url.
 *
 * This generates a static image url for a simple map of a given size, with either a given center and zoom, or a
 * given set of colored markers (or both), and optionally a scale, format, or maptype.
 */
export function staticMap(
    {
        center,
        zoom,
        size,
        scale = 1,
        format = "png8",
        maptype = "roadmap",
        markers
    }: {
        center?: Coordinate | string,
        zoom?: number,
        size: ImageSize,
        scale?: 1 | 2,
        format?: "png8" | "png32" | "gif" | "jpg" | "jpg-baseline",
        maptype?: "roadmap" | "satellite" | "hybrid" | "terrain",
        markers: Marker[]
    }
): URL {
    const url = new URL("https://maps.googleapis.com/maps/api/staticmap");

    // @ts-ignore
    url.searchParams.append("key", process.env.REACT_APP_MAPS_API_KEY);

    url.searchParams.append("size", size.toString());
    url.searchParams.append("scale", String(scale));
    url.searchParams.append("format", format);
    url.searchParams.append("maptype", maptype);
    if (center) {url.searchParams.append("center", center.toString());}
    if (zoom) {url.searchParams.append("zoom", String(zoom))}
    for (const marker of markers) {url.searchParams.append("markers", marker.toString());}
    return url
}

/*
 * Get a link to open Google Maps with a specific search.
 *
 * This generates an url that can be opened to launch maps with a map that has a pin for a specific location,
 * specified either as a coordinate or a string encoding a place name or street address.
 */
export function searchUrl({ query }: { query: Coordinate | string }): URL {
    const url = new URL("https://www.google.com/maps/search/");
    url.searchParams.append("api", "1");
    url.searchParams.append("query", query.toString());
    return url
}
