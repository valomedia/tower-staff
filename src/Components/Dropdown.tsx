/*
 * Copyright (c) 2024-2026 valo.media GmbH
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
