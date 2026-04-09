//
//  AssistantAdminScreen.tsx
//  tower-staff
//
//  Created by Arne Engelland on 2026-04-01.
//

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './AssistantAdminScreen.scss';
import { ROOT_PATH } from '../Routes/paths';

export default function AssistantAdminScreen(props: {isOpen: boolean}) {
    return (
        <aside id='admin-aside' className={props.isOpen ? 'open' : 'closed'} aria-hidden={!props.isOpen}>
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
                <section className='assistant-admin-screen-content'>
                    <p>Dieser Bereich ist vorbereitet, aber noch leer.</p>
                </section>
            </div>
        </aside>
    );
}
