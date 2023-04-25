//
//  App.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import React from 'react';
import './App.scss';
import LaunchScreen from './LaunchScreen';
import CallScreen from './CallScreen';

const App = () => (
    <div className='App'>
        <header>
            &nbsp;
        </header>
        <main>
            <LaunchScreen></LaunchScreen>
            <CallScreen></CallScreen>
        </main>
        <footer>
            &nbsp;
        </footer>
    </div>
);

export default App;
