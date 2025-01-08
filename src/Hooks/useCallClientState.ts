//
//  useCallClientStateChange.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { CallClientState, useCallClient } from '@azure/communication-react';
import { useEffect, useState } from 'react';

/**
 * Hook that provides the `CallClientState`.
 *
 * This adds the state from the `StatefulCallClient` to the component state, causing it to be re-rendered whenever
 * the state changes.
 */
export default function useCallClientState() {

    const callClient = useCallClient();

    /**
     * The current state provided by the `StatefulCallClient`.
     */
    const [state, setState] = useState<CallClientState>(callClient.getState());

    useEffect(
        () => {
            callClient.onStateChange(setState);
            return () => callClient.offStateChange(setState);
        },
        [callClient]
    );

    return state;
}
