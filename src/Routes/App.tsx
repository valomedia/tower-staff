//
//  App.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import { Context, createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
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

    useEffect(
        () => {
            if (userToken && !callClient) {
                const callClient = createStatefulCallClient({userId: userToken.user});
                callClient.getDeviceManager().then(deviceManager => {
                    deviceManager.askDevicePermission({audio: true, video: false})
                });
                setCallClient(callClient);
                callClient.createCallAgent(new AzureCommunicationTokenCredential(userToken.token)).then(setCallAgent);
            }
        },
        [userToken, callClient]
    );

    return (
        <div id='app'>
            <AppContext.Provider value={{
                isOnCall,
                setIsOnCall,
                isPresentingCallOptionsDialog,
                setIsPresentingCallOptionsDialog,
                userToken,
                setUserToken
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
    userToken?: UserToken,
    setUserToken: Dispatch<SetStateAction<UserToken|undefined>>
}> = createContext({
    isOnCall: false as boolean,
    setIsOnCall: _ => {},
    isPresentingCallOptionsDialog: false as boolean,
    setIsPresentingCallOptionsDialog: _ => {},
    setUserToken: _ => {}
});

export default App;
