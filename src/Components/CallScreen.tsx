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
import joinResponse from '../Models/JoinResponse';

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
        </section>
    );
}

export default CallScreen;
