//
//  CallScreen.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import { useEffect, useState } from 'react';
import './CallScreen.scss';
import useHash from '../Hooks/useHash';
import TowerApi from '../Api/TowerApi';
import CallController from '../Controllers/CallController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneSlash, faPhone, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';

/*
 * The in-call ui.
 */
const CallScreen = () => {

    /*
     * The current screen
     */
    const [hash, setHash] = useHash();

    /*
     * The controller for the current call.
     */
    const [callController, setCallController] = useState(null);

    useEffect(
        () => {
            if (hash === "#call-screen") {
                TowerApi
                    .join()
                    .then((joinResponse) => {
                        CallController(
                            joinResponse,
                            document.getElementsByTagName('audio')[0],
                            document.getElementsByTagName('video')[0]
                        )
                    })
                    .catch(() => setHash('#launch-screen'))
            }
        },
        [hash, setHash]
    );

    return (
        <section id='call-screen'>
            <video></video>
            <audio></audio>
            <footer>
                <button className="mute-input-button">
                    <FontAwesomeIcon icon={faMicrophoneSlash}/>
                </button>
                <button className="mute-output-button">
                    <FontAwesomeIcon icon={faVolumeXmark}/>
                </button>
                <button className="hangup-button">
                    <FontAwesomeIcon icon={faPhone}/>
                    &nbsp;
                    Auflegen
                </button>
            </footer>
        </section>
    );
}

export default CallScreen;
