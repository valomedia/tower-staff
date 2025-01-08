//
//  LaunchScreen.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import logoAnimated from '../Assets/logo-animated.svg';
import videoChatCalling from '../Assets/video-chat-calling.m4a';
import './LaunchScreen.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faGear, faPhone } from '@fortawesome/free-solid-svg-icons';
import * as TowerApi from '../Api/TowerApi';
import { AppContext } from '../Routes/App';

const ASSISTANCE_SESSION_MAXIMUM_DURATION_MS = 7_200_000;

/*
 * The screen presented to the user upon opening the app.
 */
export default function LaunchScreen() {

    /*
     * Whether a call is ongoing.
     */
    const {
        isOnCall,
        setIsOnCall,
        isPresentingCallOptionsDialog,
        setIsPresentingCallOptionsDialog,
        userToken,
        setUserToken
    } = useContext(AppContext);

    /*
     * Whether the application is still trying to reach the backend.
     */
    const [isConnecting, setIsConnecting] = useState(true);

    /*
     * Whether a connection with the backend has been established.
     */
    const [hasBackend, setHasBackend] = useState(false);

    /*
     * Whether there is a user waiting for an assistant to pick up.
     *
     * This will become true when the app is connected, and there is a user waiting for assistance or currently
     * receiving assistance.
     */
    const [isRinging,setIsRinging] = useState(false);

    /*
     * The name of the user seeking assistance.
     *
     * Once implemented, this will provide the assistant with the name of the user seeking assistance, or receiving
     * assistance.
     */
    const [customerName, setCustomerName] = useState<string|undefined>();

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
        setIsOnCall(true);
        setIsRinging(false);
    }

    /*
     * Toggle ringtone.
     */
    const handleRingtoneToggle = () => {
        setIsRingtoneEnabled(!isRingtoneEnabled);
    }

    // Poll for users.
    useEffect(() => {
        const intervalId = window.setInterval(
            () => {
                if (!isOnCall) {
                    if (isConnecting) {
                        TowerApi.assistanceToken()
                            .then(response => {
                                setUserToken(response.userToken);
                                setHasBackend(true);
                            })
                            .finally(() => setIsConnecting(false))
                    }
                    if (hasBackend) {
                        TowerApi
                            .offerAssistance()
                            .then(offerAssistanceResponse => {
                                if (offerAssistanceResponse.assistanceRequest) {
                                    setCustomerName(offerAssistanceResponse.assistanceRequest.user.username);
                                    setIsRinging(true);
                                } else {
                                    setIsRinging(false);
                                }
                            })
                            .catch(() => setIsRinging(false));
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
            if (isRinging && isRingtoneEnabled && !isOnCall) {
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
        [isRinging, isOnCall, isRingtoneEnabled]);

    // Refresh if a call comes in and the token is about to expire.
    useEffect(
        () => {
            // Refresh if our session is about to expire.
            if (isRinging
                && (userToken?.expiresOn.getTime() || 0) < Date.now() + ASSISTANCE_SESSION_MAXIMUM_DURATION_MS
            ) {window.location.reload();}
        },
        [isRinging, userToken?.expiresOn]
    );

    return (
        <div id='launch-screen' className='screen' hidden={isOnCall}>
            <main>
                <img src={logoAnimated} className='launch-screen-logo' alt='logo'/>
                <h1>Tower</h1>
                <p>
                    {
                        isOnCall ? 'Verbindung hergestellt'
                            : isRinging ? `Neue Anfrage von ${customerName || "Unbekannter Anrufer"}`
                                : hasBackend ? 'Warten auf Anfragen…'
                                    : isConnecting ? 'Verbindung wird hergestellt…'
                                        : 'Verbindung fehlgeschlagen!'
                    }
                </p>
                <button id='accept-button' disabled={!isRinging} onClick={handleAccept}>
                    <FontAwesomeIcon icon={faPhone}/>
                    &nbsp;
                    Anfrage annehmen
                </button>
                <audio src={videoChatCalling} ref={audioRef} loop></audio>
            </main>
            <footer>
                <button
                    id='call-options-button'
                    disabled={!hasBackend}
                    className={isPresentingCallOptionsDialog ? 'active' : 'inactive'}
                    onClick={() => setIsPresentingCallOptionsDialog(!isPresentingCallOptionsDialog)}
                >
                    <FontAwesomeIcon icon={faGear} />
                </button>
                <button
                    id='ringtone-toggle-button'
                    className={isRingtoneEnabled ? 'active' : 'inactive'}
                    onClick={handleRingtoneToggle}
                >
                    <FontAwesomeIcon icon={faBell}/>
                    &nbsp;
                    Klingelton ist <strong>{isRingtoneEnabled ? 'an' : 'aus'}</strong>
                </button>
            </footer>
        </div>
    );

}
