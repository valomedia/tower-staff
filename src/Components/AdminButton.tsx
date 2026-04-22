//
//  AdminButton.tsx
//  tower-staff
//
//  Created by Arne Engelland on 2026-04-21.
//

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { useMatch, useNavigate } from 'react-router-dom';

export default function AdminButton(props: {disabled?: boolean}) {
    const adminRouteMatch = useMatch('/admin');

    const navigate = useNavigate();

    const isPresentingAdmin = !!adminRouteMatch;

    const toggleAdmin = () => {
        navigate(isPresentingAdmin ? '/' : '/admin');
    };

    return (
        <button
            id='admin-button'
            className={isPresentingAdmin ? 'active' : 'inactive'}
            onClick={toggleAdmin}
            disabled={props.disabled}
        >
            <FontAwesomeIcon icon={faTableColumns}/>
        </button>
    );
}
