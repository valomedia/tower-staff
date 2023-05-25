//
//  MapsApi.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from '../Models/Coordinate';
import Size from '../Models/Size';
import Marker from '../Models/Marker';

const MapsApi = {

    /*
     * Get a static map image url.
     *
     * This generates a static image url for a simple map of a given size, with either a given center and zoom, or a
     * given set of colored markers (or both), and optionally a scale, format, or maptype.
     */
    staticMap(
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
            size: Size,
            scale?: 1 | 2,
            format?: "png8" | "png32" | "gif" | "jpg" | "jpg-baseline",
            maptype?: "roadmap" | "satellite" | "hybrid" | "terrain",
            markers: Marker[]
        }
    ) {
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
}

export default MapsApi;
