//
//  RouteErrorComponent.tsx
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-22.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { ErrorResponse, isRouteErrorResponse } from "react-router-dom";

/**
 * Display a route error.
 *
 * This will render an error that occurred during routing, which might be an ErrorResponse generated from a 4xx or 5xx
 * response, or a generic Error.
 *
 * @param error The error to display.
 */
export default function RouteErrorComponent({error}: {error: ErrorResponse|Error}) {

    return (
        <p>
            <i>{isRouteErrorResponse(error) ? `${error.status} – ${error.statusText}` : error.message}</i>
        </p>
    );

}
