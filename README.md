# Tower Assistance

Web-App for the Tower assistants.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Usage

You can either run the app locally for development, or deploy to a webserver.

### Development

In order to run this app locally, you need to provide api credentials in `.env.development.local`, by setting the value
for `REACT_APP_BASIC_AUTH` to your username and password (for example `Aladdin:open sesame`). You might also need to
override the value for `REACT_APP_TOWER_API_ENDPOINT`. Afterward you can run the app locally using the command
`npm start`.

### Deployment

In order to deploy this app,  optionally configure the values in `.env` and `.env.production`, by adding overrides in
`.env.local` and `.env.production.local`, then run `npm run build` to build the app. Afterward you can upload the build
directory to any webserver. The backend expects the user to be pre-authorized through basic auth, so make sure to add
basic authentication to your server.

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
