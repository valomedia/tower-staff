//
//  MapComponent.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//


import Coordinate from '../Models/Coordinate';
import * as MapsApi from '../Api/MapsApi';
import Marker from '../Models/Marker';
import ImageSize from '../Models/ImageSize';

/*
 * The map showing the user's location.
 */
export default function MapComponent({ coordinate }: { coordinate: Coordinate }) {

    return (
        <>
            <a href={MapsApi.searchUrl({query: coordinate}).toString()} target='_blank' rel="noopener noreferrer">
                <img
                        id='map-component'
                        src={
                            MapsApi
                                .staticMap({
                                    size: new ImageSize({width: 400, height: 600}),
                                    markers: [new Marker({place: coordinate})]
                                })
                                .toString()
                        }
                        alt='A map of the current location of the user.'/>
            </a>
        </>
    );

}
