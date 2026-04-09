//
//  index.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-03-06.
//

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './Routes/App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './error-page';
import { ASSISTANT_ADMIN_CHILD_PATH, ROOT_PATH } from './Routes/paths';

const router = createBrowserRouter([
    {
        path: ROOT_PATH,
        element: <App/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: null
            },
            {
                path: ASSISTANT_ADMIN_CHILD_PATH,
                element: null
            }
        ]
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
