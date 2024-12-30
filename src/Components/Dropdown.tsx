//
//  DeviceSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import './Dropdown.scss';

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
