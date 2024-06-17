//
//  useHash.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-26.
//
//

import { useState, useCallback, useEffect } from 'react';

/*
 * A hook for the url fragment.
 */
const useHash = (): [string, (newValue: string) => void] => {
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

export default useHash;
