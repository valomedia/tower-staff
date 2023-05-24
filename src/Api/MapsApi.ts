//
//  MapsApi.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from '../Models/Coordinate';

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
            size: {
                width: number,
                height: number
            },
            scale?: 1 | 2,
            format?: "png8" | "png32" | "gif" | "jpg" | "jpg-baseline",
            maptype?: "roadmap" | "satellite" | "hybrid" | "terrain",
            markers: {
                markerStyle?: { color?: string },
                markerLocation: Coordinate | string
            }[]
        }
    ) {
        const url = new URL("https://maps.googleapis.com/maps/api/staticmap");

        // @ts-ignore
        url.searchParams.append("key", process.env.REACT_APP_MAPS_API_KEY);

        url.searchParams.append("size", `${size.width}x${size.height}`);
        url.searchParams.append("scale", String(scale));
        url.searchParams.append("format", format);
        url.searchParams.append("maptype", maptype);
        if (center) {
            url.searchParams.append(
                "center",
                typeof center === "string" ? center : `${center.latitude},${center.longitude}`
            )
        }
        if (zoom) { url.searchParams.append("zoom", String(zoom)) }
        for (const marker of markers) {
            // eslint-disable-next-line no-mixed-operators
            const markerStyleString = marker.markerStyle && `color:${marker.markerStyle.color}|` || ""

            const markerLocationString = typeof marker.markerLocation === "string"
                ? marker.markerLocation
                : `${marker.markerLocation.latitude},${marker.markerLocation.longitude}`;

            url.searchParams.append("markers", markerStyleString + markerLocationString);
        }
        return url
    }
}

export default MapsApi;
