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
//  useCallingStack.ts
//  tower-staff
//
//

import { useCallback, useEffect, useRef, useState } from 'react';
import { CallAgent } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { createStatefulCallClient, StatefulCallClient } from '@azure/communication-react';
import UserToken from '../Models/UserToken';

const ACS_ALREADY_DISPOSED = 40012;

const disposeCallClient = async (client?: StatefulCallClient) => {
    if (!client) { return; }

    try {
        await client.dispose();
    } catch (error) {
        if (
            typeof error === 'object'
                && error !== null
                && 'subCode' in error
                && error.subCode === ACS_ALREADY_DISPOSED
        ) { return; }

        console.error('Failed to dispose ACS calling stack.', error);
    }
};

/**
 * Hook for managing the ACS calling stack lifecycle for the current user token.
 *
 * This owns initialization, teardown, and forced recreation of the `StatefulCallClient` and `CallAgent`.
 */
export default function useCallingStack(userToken?: UserToken): {
    callClient?: StatefulCallClient,
    callAgent?: CallAgent,
    isCallingStackReady: boolean,
    resetCallingStack: () => Promise<void>
} {
    /**
     * The stateful call client for the app.
     */
    const [callClient, setCallClient] = useState<StatefulCallClient|undefined>();

    const [callAgent, setCallAgent] = useState<CallAgent|undefined>();

    const [isCallingStackReady, setIsCallingStackReady] = useState(false);

    const callClientRef = useRef<StatefulCallClient>();

    const callStackResetCounterRef = useRef(0);

    const recreateCallingStack = useCallback(async (token: UserToken) => {
        const resetCounter = ++callStackResetCounterRef.current;
        const previousCallClient = callClientRef.current;

        callClientRef.current = undefined;
        setIsCallingStackReady(false);
        setCallAgent(undefined);
        setCallClient(undefined);

        await disposeCallClient(previousCallClient);

        const nextCallClient = createStatefulCallClient({userId: token.user});
        callClientRef.current = nextCallClient;

        try {
            const deviceManager = await nextCallClient.getDeviceManager();
            await deviceManager.askDevicePermission({audio: true, video: false});

            const nextCallAgent
                = await nextCallClient.createCallAgent(new AzureCommunicationTokenCredential(token.token));

            if (resetCounter !== callStackResetCounterRef.current) {
                await disposeCallClient(nextCallClient);
                return;
            }

            setCallClient(nextCallClient);
            setCallAgent(nextCallAgent);
            setIsCallingStackReady(true);
        } catch (error) {
            console.error('Failed to initialize ACS calling stack.', error);

            if (callClientRef.current === nextCallClient) {
                callClientRef.current = undefined;
            }

            if (resetCounter === callStackResetCounterRef.current) {
                setCallClient(undefined);
                setCallAgent(undefined);
                setIsCallingStackReady(false);
            }

            await disposeCallClient(nextCallClient);
        }
    }, []);

    const resetCallingStack = useCallback(async () => {
        if (!userToken) { return; }

        await recreateCallingStack(userToken);
    }, [recreateCallingStack, userToken]);

    useEffect(
        () => {
            if (userToken) {
                void recreateCallingStack(userToken);
            } else {
                const previousCallClient = callClientRef.current;

                callStackResetCounterRef.current += 1;
                callClientRef.current = undefined;
                setIsCallingStackReady(false);
                setCallAgent(undefined);
                setCallClient(undefined);

                void disposeCallClient(previousCallClient);
            }
        },
        [recreateCallingStack, userToken]
    );

    useEffect(
        () =>
            () => {
                const activeCallClient = callClientRef.current;

                callStackResetCounterRef.current += 1;
                callClientRef.current = undefined;
                void disposeCallClient(activeCallClient);
            },
        []
    );

    return {callClient, callAgent, isCallingStackReady, resetCallingStack};
}
