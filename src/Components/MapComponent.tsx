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
//  MapComponent.tsx
//  tower-staff
//
//
//

import './MapComponent.scss';
import Coordinate from '../Models/Coordinate';
import * as MapsApi from '../Api/MapsApi';
import Marker from '../Models/Marker';
import ImageSize from '../Models/ImageSize';

/**
 * The map showing the user's location.
 *
 * @param coordinate The coordinate to show on the map.
 */
export default function MapComponent({ coordinate }: { coordinate: Coordinate }) {

    return (
        <div className='map'>
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
        </div>
    );

}
