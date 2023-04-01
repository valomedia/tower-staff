//
//  App.tsx
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import React from 'react';
import logo from './logo.svg';
import './App.css';

const App = () => (
    <div className='App'>
        <header className='App-header'>
            <img src={logo} className='App-logo' alt='logo'/>
            <h1>Tower</h1>
        </header>
        <main>
            <p>
                Warten auf Anfragen…
            </p>
            <button className='accept-button'>
                Anfrage annehmen
            </button>
        </main>
    </div>
);

export default App;
