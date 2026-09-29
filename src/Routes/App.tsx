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
//  App.tsx
//  tower-staff
//
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
