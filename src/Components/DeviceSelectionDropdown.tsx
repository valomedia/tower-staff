//
//  DeviceSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import './DeviceSelectionDropdown.scss';

export default function DeviceSelectionDropdown(props: {
    placeholder: string,
    label: string,
    devices: {id: string, name: string}[],
    selectedDevice?: {id: string, name: string},
    onSelectionChange: (deviceId?: string) => void
}) {
    return (
        <div className='device-selection-dropdown'>
            <label>
                {props.label}
                <select onChange={event => props.onSelectionChange?.(event.target.value)}>
                    {props.devices.map(device =>
                        <option value={device.id} key={device.id} selected={props.selectedDevice?.id === device.id}>
                            {device.name}
                        </option>
                    )}
                </select>
            </label>
        </div>
    )
}
