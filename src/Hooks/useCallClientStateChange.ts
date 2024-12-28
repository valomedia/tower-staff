//
//  useCallClientStateChange.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-27.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { CallClientState, useCallClient } from '@azure/communication-react';
import { useEffect, useState } from 'react';

export default function useCallClientStateChange() {

    const callClient = useCallClient();

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
