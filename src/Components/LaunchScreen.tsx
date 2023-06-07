//
//  LaunchScreen.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import logoAnimated from '../Assets/logo-animated.svg';
import videoChatCalling from '../Assets/video-chat-calling.m4a';
import './LaunchScreen.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPhone } from '@fortawesome/free-solid-svg-icons';
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
     * This will become true, when the app is connected, and there is a user waiting for assistance or currently being
     * assisted.
     */
    const [hasCustomer,setHasCustomer] = useState(false);

    /*
     * The name of the user seeking assistance.
     *
     * Once implemented, this will provide the assistant with the name of the user seeking assistance, or being
     * assisted.
     */
    const [customerName, setCustomerName] = useState('Theo Test');

    /*
     * Whether a call is ongoing.
     */
    const [isOnCall, setIsOnCall] = useState(false);

    /*
     * Whether the ringtone is enabled.
     */
    const [isRingtoneEnabled, setIsRingtoneEnabled] = useState(false);

    /*
     * The audio element for the ringtone.
     */
    const audioRef = useRef() as MutableRefObject<HTMLAudioElement>;

    /*
     * Join call.
     */
    const handleAccept = () => {
        window.location.hash = '#call-screen'
        setIsOnCall(true);
    }

    /*
     * Toggle ringtone.
     */
    const handleRingtoneToggle = () => {
        audioRef.current.muted = isRingtoneEnabled
        setIsRingtoneEnabled(!isRingtoneEnabled);
    }

    // Poll for users.
    useEffect(() => {
        const intervalId = window.setInterval(
            () => {
                if (window.location.hash === "#launch-screen") {
                    if (isConnecting) {
                        TowerApi
                            .index()
                            .then(() => setHasBackend(true))
                            .finally(() => setIsConnecting(false))
                    }
                    if (hasBackend) {
                        TowerApi
                            .poll()
                            .then(() => setHasCustomer(true))
                            .catch(() => {
                                setHasCustomer(false);
                                setIsOnCall(false);
                            })
                    }
                }
            },
            2000
        );
        return () => window.clearInterval(intervalId);
    });

    // Trigger ringtone.
    useEffect(
        () => {
            if (hasCustomer && !isOnCall) {
                if (audioRef.current.paused) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
            } else {
                if (!audioRef.current.paused) {
                    audioRef.current.pause();
                }
            }
        },
        [hasCustomer, isOnCall]);

    return (
        <section id='launch-screen'>
            <img src={logoAnimated} className='launch-screen-logo' alt='logo'/>
            <h1>Tower</h1>
            <p>
                {
                    isOnCall ? 'Verbindung hergestellt'
                        : hasCustomer ? `Neue Anfrage von ${customerName}`
                            : hasBackend ? 'Warten auf Anfragen…'
                                : isConnecting ? 'Verbindung wird hergestellt…'
                                    : 'Verbindung fehlgeschlagen!'
                }
            </p>
            <button className='accept-button' disabled={!hasCustomer || isOnCall} onClick={handleAccept}>
                <FontAwesomeIcon icon={faPhone}/>
                &nbsp;
                Anfrage annehmen
            </button>
            <audio src={videoChatCalling} ref={audioRef} muted loop></audio>
            <footer>
                    <button
                            id='ringtone-toggle-button'
                            className={isRingtoneEnabled ? 'active' : 'inactive'}
                            onClick={handleRingtoneToggle}>
                        <FontAwesomeIcon icon={faBell}/>
                        &nbsp;
                        Klingelton ist <strong>{isRingtoneEnabled ? 'an' : 'aus'}</strong>
                    </button>
            </footer>
        </section>
    );

}

export default LaunchScreen;
