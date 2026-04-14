//
//  AssistantAdminScreen.tsx
//  tower-staff
//
//  Created by Arne Engelland on 2026-04-01.
//

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPhone } from '@fortawesome/free-solid-svg-icons';
import './AssistantAdminScreen.scss';
import { ROOT_PATH } from '../Routes/paths';
import { AppContext } from '../Routes/App';

export default function AssistantAdminScreen() {
    const { isRinging } = useContext(AppContext);

    return (
        <aside id='admin-aside'>
            <div className='assistant-admin-screen'>
                <div className='assistant-admin-screen-header'>
                    <div>
                        <p className='eyebrow'>Assistenten</p>
                        <h1>Admin</h1>
                    </div>
                    <Link to={ROOT_PATH} className='back-link'>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                        &nbsp;
                        Zurück
                    </Link>
                </div>
                {isRinging && (
                    <div className='incoming-call-notice' role='status' aria-live='polite'>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Eingehender Anruf</span>
                        <Link to={ROOT_PATH} className='back-link'>
                            Zum Anruf
                        </Link>
                    </div>
                )}
                <section className='assistant-admin-screen-content'>
                    <p>Dieser Bereich ist vorbereitet, aber noch leer.</p>
                </section>
            </div>
        </aside>
    );
}
