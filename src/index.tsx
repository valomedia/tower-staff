//
//  index.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './Components/App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

reportWebVitals();
