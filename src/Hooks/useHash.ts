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
//  useHash.ts
//  tower-staff
//
//
//

import { useState, useCallback, useEffect } from 'react';

/*
 * A hook for the url fragment.
 */
export default function useHash (): [string, (newValue: string) => void] {
    const [hash, setHash] = useState(() => window.location.hash);
    const onHashChange = useCallback(() => { setHash(window.location.hash) }, []);

    useEffect(() => {
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    });

    return [
        hash,
        useCallback(
            (newValue: string) => {
                if (newValue !== hash) { window.location.hash = newValue }
            },
            [hash]
        )
    ];
}
