//
//  App.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import { Context, createContext, Dispatch, SetStateAction, useState } from 'react';
import './App.scss';
import LaunchScreen from '../Components/LaunchScreen';
import CallScreen from '../Components/CallScreen';
import banner from '../Assets/banner.svg';
import { CallAgentProvider, CallClientProvider } from '@azure/communication-react';
import UserToken from '../Models/UserToken';
import CallOptionsDialog from '../Components/CallOptionsDialog';
import useCallingStack from '../Hooks/useCallingStack';

const App = () => {

    /**
     * Whether a call is ongoing.
     */
    const [isOnCall, setIsOnCall] = useState(false);

    const [isPresentingCallOptionsDialog, setIsPresentingCallOptionsDialog] = useState(true);

    const [userToken, setUserToken] = useState<UserToken|undefined>();

    const {callClient, callAgent, isCallingStackReady, resetCallingStack} = useCallingStack(userToken);

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
