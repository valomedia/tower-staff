//
//  AdminScreen.tsx
//  tower-staff
//
//  Created by Arne Engelland on 2026-04-01.
//

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPhone } from '@fortawesome/free-solid-svg-icons';
import './AdminScreen.scss';
import { AppContext } from './App';

/**
 * Admin panel route for assistant-only controls and operational information.
 *
 * The route is rendered inside the app shell so call state remains mounted while the
 * assistant views admin content.
 */
export default function AdminScreen() {
    /**
     * Shared ringing state used to surface an incoming-call shortcut while the admin panel is open.
     */
    const { isRinging } = useContext(AppContext);

    return (
        <div id='admin-screen' className='screen'>
            <div className='admin-screen'>
                <div className='admin-screen-header'>
                    <div>
                        <p className='eyebrow'>Admin</p>
                        <h1>Admin</h1>
                    </div>
                    <Link to='/' className='back-link'>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                        &nbsp;
                        Zurück
                    </Link>
                </div>
                {isRinging && (
                    <div className='incoming-call-notice' role='status' aria-live='polite'>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Eingehender Anruf</span>
                        <Link to='/' className='back-link'>
                            Zum Anruf
                        </Link>
                    </div>
                )}
                <section className='admin-screen-content'>
                    <p>Dieser Bereich ist vorbereitet, aber noch leer.</p>
                </section>
            </div>
        </div>
    );
}
