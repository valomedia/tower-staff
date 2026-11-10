/*
 * Copyright (c) 2026 valo.media GmbH
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

// Preserve OS necessities, not inherited app endpoints, credentials or build flags.
const systemVariables = ['PATH', 'HOME', 'TMPDIR', 'TMP', 'TEMP', 'SystemRoot'];
process.env = {
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => systemVariables.includes(key))),
    CI: 'true',
    SKIP_DOTENV: 'true',
    BROWSER: 'none',
    HOST: 'localhost',
    PORT: '4173',
    HTTPS: 'false',
    PUBLIC_URL: '/',
    FAST_REFRESH: 'false',
    TOWER_PROXY_TARGET: '',
    REACT_APP_TOWER_API_ENDPOINT: '/api',
    REACT_APP_MAPS_API_KEY: '',
    REACT_APP_SOURCE_URL: 'https://example.invalid/source'
};

require('./start');
