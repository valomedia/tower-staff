//
//  AdminButton.tsx
//  tower-staff
//
//  Created by Arne Engelland on 2026-04-21.
//

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { useMatch, useNavigate } from 'react-router-dom';

/**
 * Properties for the admin panel toggle button.
 */
interface AdminButtonProps {

    /**
     * Whether the button should be disabled.
     */
    disabled?: boolean;

}

/**
 * Toggle button that navigates between the main assistant workflow and the admin panel.
 *
 * The button is shared by the launch and call screens so the admin panel can be opened
 * without changing the calling state owned by the app shell.
 */
export default function AdminButton(props: AdminButtonProps) {
    const adminRouteMatch = useMatch('/admin');

    const navigate = useNavigate();

    /**
     * Whether the admin panel is currently presented.
     */
    const isPresentingAdmin = !!adminRouteMatch;

    /**
     * Open the admin panel, or return to the main assistant workflow when it is already open.
     */
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
