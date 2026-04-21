//
//  App.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import { Context, createContext, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import './App.scss';
import LaunchScreen from '../Components/LaunchScreen';
import CallScreen from '../Components/CallScreen';
import banner from '../Assets/banner.svg';
import {
    CallAgentProvider,
    CallClientProvider,
    createStatefulCallClient,
    StatefulCallClient
} from '@azure/communication-react';
import UserToken from '../Models/UserToken';
import { CallAgent } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import CallOptionsDialog from '../Components/CallOptionsDialog';

const disposeCallClient = async (client?: StatefulCallClient) => {
    if (!client) { return; }

    try {
        await client.dispose();
    } catch (error) {
        if (
            typeof error === 'object'
                && error !== null
                && 'subCode' in error
                && error.subCode === 40012
        ) { return; }

        console.error('Failed to dispose ACS calling stack.', error);
    }
};

const App = () => {

    /**
     * Whether a call is ongoing.
     */
    const [isOnCall, setIsOnCall] = useState(false);

    const [isPresentingCallOptionsDialog, setIsPresentingCallOptionsDialog] = useState(true);

    /**
     * The stateful call client for the app.
     */
    const [callClient, setCallClient] = useState<StatefulCallClient|undefined>();

    const [userToken, setUserToken] = useState<UserToken|undefined>();

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

            const failedClientIsCurrent = callClientRef.current === nextCallClient;

            if (failedClientIsCurrent) {
                callClientRef.current = undefined;
            }

            if (resetCounter === callStackResetCounterRef.current) {
                setCallClient(undefined);
                setCallAgent(undefined);
                setIsCallingStackReady(false);
            }

            if (failedClientIsCurrent) {
                await disposeCallClient(nextCallClient);
            }
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

    return (
        <div id='app'>
            <AppContext.Provider value={{
                isOnCall,
                setIsOnCall,
                isPresentingCallOptionsDialog,
                setIsPresentingCallOptionsDialog,
                isCallingStackReady,
                userToken,
                setUserToken,
                resetCallingStack
            }}>
                <header>
                    <img src={banner} alt='tower'/>
                </header>
                <div>
                    <LaunchScreen></LaunchScreen>
                    {callClient && callAgent &&
                        <CallClientProvider callClient={callClient}>
                            <CallAgentProvider callAgent={callAgent}>
                                {isPresentingCallOptionsDialog &&
                                    <CallOptionsDialog onClose={() => setIsPresentingCallOptionsDialog(false)}/>
                                }
                                <CallScreen/>
                            </CallAgentProvider>
                        </CallClientProvider>
                    }
                </div>
            </AppContext.Provider>
        </div>
    );
};

/**
 * Context with app-wide state.
 */
export const AppContext: Context<{
    isOnCall: boolean,
    setIsOnCall: Dispatch<SetStateAction<boolean>>,
    isPresentingCallOptionsDialog: boolean,
    setIsPresentingCallOptionsDialog: Dispatch<SetStateAction<boolean>>,
    isCallingStackReady: boolean,
    userToken?: UserToken,
    setUserToken: Dispatch<SetStateAction<UserToken|undefined>>,
    resetCallingStack: () => Promise<void>
}> = createContext({
    isOnCall: false as boolean,
    setIsOnCall: _ => {},
    isPresentingCallOptionsDialog: false as boolean,
    setIsPresentingCallOptionsDialog: _ => {},
    isCallingStackReady: false as boolean,
    setUserToken: _ => {},
    resetCallingStack: async () => {}
});

export default App;
