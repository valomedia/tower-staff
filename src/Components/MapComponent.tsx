//
//  MapComponent.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//


import Coordinate from '../Models/Coordinate';
import MapsApi from '../Api/MapsApi';
import './MapComponent.scss';

/*
 * The map showing the user's location.
 */
const MapComponent = ({ coordinate }: { coordinate: Coordinate }) => {

    return (
        <>
            <img
                    id='map-component'
                    src={
                        MapsApi
                            .staticMap({
                                size: {width: 400, height: 600},
                                markers: [
                                    { markerLocation: coordinate }
                                ]
                            })
                            .toString()
                    }
                    alt='A map of the current location of the user.'/>
        </>
    );

}

export default MapComponent;
