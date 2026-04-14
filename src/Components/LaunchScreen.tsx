//
//  LaunchScreen.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faGear, faPhone, faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import * as TowerApi from '../Api/TowerApi';
import logoAnimated from '../Assets/logo-animated.svg';
import videoChatCalling from '../Assets/video-chat-calling.m4a';
import './LaunchScreen.scss';
import { AppContext } from '../Routes/App';
import { ASSISTANT_ADMIN_PATH, ROOT_PATH } from '../Routes/paths';

const ASSISTANCE_SESSION_MAXIMUM_DURATION_MS = 7_200_000;

/*
 * The screen presented to the user upon opening the app.
 */
export default function LaunchScreen() {
    const currentLocation = useLocation();

    const navigate = useNavigate();

    const isPresentingAssistantAdmin = currentLocation.pathname === ASSISTANT_ADMIN_PATH;

    /**
     * State shared throughout the app.
     */
    const {
        isOnCall,
        setIsOnCall,
        isPresentingCallOptionsDialog,
        setIsPresentingCallOptionsDialog,
        isCallingStackReady,
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
    const [isRinging, setIsRinging] = useState(false);

    /*
     * Whether the ringtone is enabled.
     */
    const [isRingtoneEnabled, setIsRingtoneEnabled] = useState(true);

    /*
     * The audio element for the ringtone.
     */
    const audioRef = useRef() as MutableRefObject<HTMLAudioElement>;

    /*
     * Join call.
     */
    const handleAccept = () => {
        setIsOnCall(true);
    };

    /*
     * Toggle ringtone.
     */
    const handleRingtoneToggle = () => {
        setIsRingtoneEnabled(!isRingtoneEnabled);
    };

    /*
     * Toggle the assistant admin interface.
     */
    const toggleAssistantAdmin = () => {
        navigate(isPresentingAssistantAdmin ? ROOT_PATH : ASSISTANT_ADMIN_PATH);
    };

    // Poll for users.
    useEffect(
        () => {
            const intervalId = window.setInterval(
                () => {
                    if (isConnecting) {
                        TowerApi
                            .assistanceToken()
                            .then(response => {
                                setUserToken(response.userToken);
                                setHasBackend(true);
                            })
                            .finally(() => setIsConnecting(false));
                    }
                    if (!isOnCall && hasBackend) {
                        TowerApi
                            .offerAssistance()
                            .then(offerAssistanceResponse => {
                                setIsRinging(!!offerAssistanceResponse.assistanceRequest);
                            })
                            .catch(() => setIsRinging(false));
                    }
                    if (isOnCall) {
                        setIsRinging(false);
                    }
                },
                2000
            );

            return () => window.clearInterval(intervalId);
        },
        [hasBackend, isConnecting, isOnCall, setUserToken]
    );

    // Trigger ringtone.
    useEffect(
        () => {
            if (isRinging && isRingtoneEnabled && !isOnCall) {
                if (audioRef.current.paused) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {
                        // Can't play sound, presumably because the user hasn't interacted with the page yet.
                        setIsRingtoneEnabled(false)
                    });
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
                    && (userToken?.expiresOn.getTime() || Infinity) < Date.now() + ASSISTANCE_SESSION_MAXIMUM_DURATION_MS
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
                            : isRinging ? 'Eine Nutzer:in benötigt Unterstützung!'
                                : hasBackend ? 'Warten auf Anfragen…'
                                    : isConnecting ? 'Verbindung wird hergestellt…'
                                        : 'Verbindung fehlgeschlagen!'
                    }
                </p>
                <button
                    id='accept-button'
                    className='primary'
                    disabled={!isRinging || !isCallingStackReady}
                    onClick={handleAccept}
                >
                    <FontAwesomeIcon icon={faPhone}/>
                    &nbsp;
                    Anfrage annehmen
                </button>
                <audio src={videoChatCalling} ref={audioRef} muted={isOnCall} loop></audio>
            </main>
            <footer>
                <button
                    id='assistant-admin-button'
                    className={isPresentingAssistantAdmin ? 'active' : 'inactive'}
                    onClick={toggleAssistantAdmin}
                >
                    <FontAwesomeIcon icon={faTableColumns}/>
                </button>
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
