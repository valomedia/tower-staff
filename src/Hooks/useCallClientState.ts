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
