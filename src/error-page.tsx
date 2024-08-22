//
//  error-page.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-22.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import './error-page.scss';
import RouteErrorComponent from './Components/RouteErrorComponent';
import isError from './Lib/isError';


/**
 * Error page shown for routing errors.
 *
 * This will usually show because the user manually navigated to an invalid location.
 *
 * @constructor
 */
export default function ErrorPage() {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div className='error-page'>
            <h1>Oops!</h1>
            <p>Ein unerwarteter Fehler ist aufgetreten.</p>
            {(isError(error) || isRouteErrorResponse(error)) && <><hr/><RouteErrorComponent error={error}/></>}
        </div>
    );

}
