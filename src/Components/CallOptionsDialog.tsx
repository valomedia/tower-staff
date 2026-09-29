/*
 * Copyright (c) 2023-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

//
//  CallOptionsDialog.tsx
//  tower-staff
//
//
//

import './CallOptionsDialog.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
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
            </h1>
            <SpeakerSelectionDropdown/>
            <MicrophoneSelectionDropdown/>
            <button className='primary' onClick={props.onClose}>
                <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>&nbsp;Fertig
            </button>
        </div>
    );
};
