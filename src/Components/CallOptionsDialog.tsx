//
//  CallOptionsDialog.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-02.
//
//

import './CallOptionsDialog.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FormEvent } from 'react';

/**
 * The dialog box allowing the assistant to set various options for the call.
 */
const CallOptionsDialog = ({onSubmit}: {onSubmit: () => void}) => {

    /*
     * Handle form submission.
     *
     * This is called when the user clicks the confirmation-button on the modal dialog and will call onSubmit with
     * the selected devices.
     */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page.
        e.preventDefault();

        onSubmit();
    }

    return (
        <div id="call-options-dialog" className='dialog'>
            <h1>Anrufoptionen</h1>
            <form onSubmit={handleSubmit}>
                <button type='submit' className='accept-button'>
                    Anruf beitreten
                    &nbsp;
                    <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
                </button>
            </form>
        </div>
    );
};

export default CallOptionsDialog;
