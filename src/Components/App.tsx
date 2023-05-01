//
//  App.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import { useEffect } from 'react';
import './App.scss';
import LaunchScreen from './LaunchScreen';
import CallScreen from './CallScreen';
import banner from '../Assets/banner.svg';

const App = () => {

    useEffect(() => {
        window.location.hash = "#launch-screen"
    });

    return (
        <div className='App'>
            <header>
                <img src={banner} alt='tower'/>
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
}

export default App;
