//
//  MapComponent.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//


import Coordinate from '../Models/Coordinate';
import MapsApi from '../Api/MapsApi';
import './MapComponent.scss';
import Marker from '../Models/Marker';
import Size from '../Models/Size';

/*
 * The map showing the user's location.
 */
const MapComponent = ({ coordinate }: { coordinate: Coordinate }) => {

    return (
        <>
            <a href={MapsApi.searchUrl({query: coordinate}).toString()} target='_blank' rel="noopener noreferrer">
                <img
                        id='map-component'
                        src={
                            MapsApi
                                .staticMap({
                                    size: new Size({width: 400, height: 600}),
                                    markers: [new Marker({place: coordinate})]
                                })
                                .toString()
                        }
                        alt='A map of the current location of the user.'/>
            </a>
        </>
    );

}

export default MapComponent;
