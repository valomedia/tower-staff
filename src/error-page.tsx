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
