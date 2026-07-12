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
