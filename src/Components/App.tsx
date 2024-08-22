//
//  App.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import { Context, createContext, Dispatch, SetStateAction, useState } from 'react';
import './App.scss';
import LaunchScreen from './LaunchScreen';
import CallScreen from './CallScreen';
import banner from '../Assets/banner.svg';

const App = () => {

    /**
     * Whether a call is ongoing.
     */
    const [isOnCall, setIsOnCall] = useState(false);

    return (
        <div className='App'>
            <AppContext.Provider value={{isOnCall, setIsOnCall}}>
                <header>
                    <img src={banner} alt='tower'/>
                </header>
                <main>
                    <LaunchScreen></LaunchScreen>
                    <CallScreen></CallScreen>
                </main>
            </AppContext.Provider>
        </div>
    );
}

/**
 * Context with app-wide state.
 */
export const AppContext: Context<{
    isOnCall: boolean,
    setIsOnCall: Dispatch<SetStateAction<boolean>>
}> = createContext({
    isOnCall: false as boolean,
    setIsOnCall: (_) => {}
});

export default App;
