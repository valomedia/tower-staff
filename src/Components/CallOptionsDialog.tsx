//
//  CallOptionsDialog.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-02.
//
//

import './CallOptionsDialog.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import MicrophoneSelectionDropdown from './MicrophoneSelectionDropdown';
import SpeakerSelectionDropdown from './SpeakerSelectionDropdown';

/**
 * The dialog box allowing the assistant to set various options for the call.
 *
 * @param props.onClose Callback to invoke when the close button on the dialog is pressed.
 */
export default function CallOptionsDialog(props: {onClose: () => void}) {
    return (
        <div id="call-options-dialog" className='dialog'>
            <h1>
                Anrufoptionen
                <button className='close-button' onClick={props.onClose}>
                    <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </button>
            </h1>
            <SpeakerSelectionDropdown/>
            <MicrophoneSelectionDropdown/>
        </div>
    );
};
