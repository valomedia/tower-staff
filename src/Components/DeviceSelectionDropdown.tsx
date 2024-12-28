//
//  DeviceSelectionDropdown.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import './DeviceSelectionDropdown.scss';
import { Dropdown } from '@fluentui/react';

export default function DeviceSelectionDropdown(props: {
    placeholder: string,
    label: string,
    devices: {id: string, name: string}[],
    selectedDevice?: {id: string, name: string},
    onSelectionChange: (deviceId?: string) => void
}) {
    return (
        <Dropdown
            placeholder={props.placeholder}
            label={props.label}
            options={props.devices.map(device => ({key: device.id, text: device.name}))}
            selectedKey={props.selectedDevice?.id}
            onChange={(_, option) => props.onSelectionChange?.(option?.key as string|undefined)}
        />
    )
}
