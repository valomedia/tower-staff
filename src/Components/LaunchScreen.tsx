//
//  LaunchScreen.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { useEffect, useState } from 'react';
import logo from '../Assets/logo.svg';
import './LaunchScreen.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import TowerApi from '../Api/TowerApi';

/*
 * The screen presented to the user upon opening the app.
 */
const LaunchScreen = () => {

    /*
     * Whether the application is still trying to reach the backend.
     */
    const [isConnecting, setIsConnecting] = useState(true);

    /*
     * Whether a connection with the backend has been established.
     */
    const [hasBackend, setHasBackend] = useState(false);

    /*
     * Whether there is a user that can be assisted.
     *
     * This will become true, when the app is connected, and there is a user actively waiting.
     */
    const [hasCustomer,setHasCustomer] = useState(false);

    /*
     * The name of the user seeking assistance.
     *
     * Once implemented, this will provide the assistant with the name of the user seeking assistance.
     */
    const [customerName, setCustomerName] = useState('Theo Test');

    useEffect(() => {
        TowerApi
            .index()
            .then(() => setHasBackend(true))
            .finally(() => setIsConnecting(false))

        setInterval(
            () => {
                if (hasBackend) {
                    TowerApi
                        .poll()
                        .then(() => setHasCustomer(true))
                        .catch(() => setHasCustomer(false))
                }
            },
            2000
        )
    })

    return (
        <section id='launch-screen'>
            <img src={logo} className='App-logo' alt='logo'/>
            <h1>Tower</h1>
            <p>
                {
                    hasCustomer ? `Neue Anfrage von ${customerName}`
                        : hasBackend ? 'Warten auf Anfragen…'
                            : isConnecting ? 'Verbindung wird hergestellt…'
                                : 'Verbindung fehlgeschlagen!'
                }
            </p>
            <button className='accept-button' disabled={!hasCustomer}>
                <FontAwesomeIcon icon={faPhone}/>
                &nbsp;
                Anfrage annehmen
            </button>
        </section>
    );

}

export default LaunchScreen;
