//
//  LaunchScreen.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import React, { useState } from 'react';
import logo from './logo.svg';
import './LaunchScreen.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

/*
 * The screen presented to the user upon opening the app.
 */
const LaunchScreen = () => {

    /*
     * Whether there is a user that can be assisted.
     *
     * This will become true, when the app is connected, and there is a user actively waiting.
     */
    const [hasCustomer,setHasCustomer] = useState(false);

    return (
        <section id='launch-screen'>
            <img src={logo} className='App-logo' alt='logo'/>
            <h1>Tower</h1>
            <p>Warten auf Anfragen…</p>
            <button className='accept-button' disabled={!hasCustomer}>
                <FontAwesomeIcon icon={faPhone}/>
                &nbsp;
                Anfrage annehmen
            </button>
        </section>
    );

}

export default LaunchScreen;
