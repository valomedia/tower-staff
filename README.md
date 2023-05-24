# Tower Assistance

Web-App for the Tower assistants.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Usage

You can either run the app locally for development, or deploy to a webserver.  Either way you will need to supply an
API token for Google Maps by creating `.env.local` and adding `REACT_APP_MAPS_API_KEY` (you can of course supply
different keys, for testing, dev and prod, by adding them to `.env.test.local`, `.env.development.local` and
`.env.production.local`, respectively).

### Development

In order to run this app locally, execute `npm start`. In order to avoid issues with cross-origin requests during
development, the app is set to make all requests against the development server while running in development mode. The
development server is configured to proxy the requests intended for the backend as needed. If needed, you can modify
the backend the requests are send to by changing the value for the proxy-parameter in `package.json`. If the relative
path to the api on your backend-server is non-standard, you will also need to override `REACT_APP_TOWER_API_ENDPOINT`,
by creating `.env.development.local`.

### Deployment

In order to deploy this app, optionally override `REACT_APP_TOWER_API_ENDPOINT`, by creating `.env.production.local`,
then execute `npm run build` and upload the contents of the build directory to any webserver.

If you have set `REACT_APP_TOWER_API_ENDPOINT` to some relative path, make sure your server proxies those requests to
the actual backend. If you have instead configured it to reach out to the domain of the backend directly, make sure you
have correctly configured the backend to allow these cross-origin requests.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!
