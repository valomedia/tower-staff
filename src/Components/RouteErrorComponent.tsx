/*
 * Copyright (c) 2024-2026 valo.media GmbH
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
