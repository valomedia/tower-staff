//
//  DeviceSelectionDropdown.tsx
//  tower-staff
//
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
    selectedOption?: string,
    onChange: (id?: string) => void
}) {return (
    <div className='dropdown'>
        <label>
            {props.label}
            <select value={props.selectedOption} onChange={event => props.onChange?.(event.target.value)}>
                {props.options.map(option => <option value={option.id} key={option.id}>{option.name}</option>)}
            </select>
        </label>
    </div>
)}
