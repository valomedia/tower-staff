//
//  DeviceSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import './Dropdown.scss';

/**
 * A dropdown menu.
 *
 * @param props.label The label to display above the dropdown menu.
 * @param props.options Options for the dropdown, each with a name to show the user, and a unique id.
 * @param props.selectedOption One of the IDs from `props.options`. Controls which option is selected.
 * @param props.onChange Callback invoked with the ID of the selected option, when the user changes the selection.
 */
export default function Dropdown(props: {
    label: string,
    options: {id: string, name: string}[],
    selectedOption?: {id: string, name: string},
    onSelectionChange: (deviceId?: string) => void
}) {return (
    <div className='dropdown'>
        <label>
            {props.label}
            <select value={props.selectedOption?.id} onChange={event => props.onSelectionChange?.(event.target.value)}>
                {props.options.map(device => <option value={device.id} key={device.id}>{device.name}</option>)}
            </select>
        </label>
    </div>
)}
