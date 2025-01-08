# Tower Assistance

Web-App for the Tower assistants.

## Usage

You can either run the app locally for development or deploy to a webserver.  Either way you will need to supply an
API token for Google Maps by creating `.env.local` and adding `REACT_APP_MAPS_API_KEY` (you can supply different keys,
for testing, dev and prod, by adding them to `.env.test.local`, `.env.development.local` and `.env.production.local`,
respectively).

### Development

To run this app locally, execute `npm start`. To avoid issues with cross-origin requests during development, the app is 
set to make all requests against the development server while running in development mode. The development server is 
configured to proxy the requests intended for the backend as needed. If needed, you can modify the backend the requests 
are sent to by changing the value for the proxy-parameter in `package.json`. If the relative path to the api on your 
backend-server is non-standard, you will also need to override `REACT_APP_TOWER_API_ENDPOINT`, by creating 
`.env.development.local`.

### Deployment

To deploy this app, optionally override `REACT_APP_TOWER_API_ENDPOINT`, by creating `.env.production.local`, then
execute `npm run build` and upload the contents of the build directory to any webserver.

If you have set `REACT_APP_TOWER_API_ENDPOINT` to some relative path, make sure your server proxies those requests to
the actual backend. If you have instead configured it to reach out to the domain of the backend directly, make sure you
have correctly configured the backend to allow these cross-origin requests.

## Data Channel API

This app will communicate directly with the app of the caller (`tower-ios` or `tower-android`) using data channel 
messages. Each data channel message contains a UTF-8 encoded JSON object that has exactly one property. The key of the
property determines the type of the message; the value of the property must be an object whose contents are 
determined by the type of the message.

### `capturePhotoRequest`

This message is sent by `tower-staff` to instruct the app of the caller to take a photo. Its contents will always be an
empty object.

Message format:

```typescript
{capturePhotoRequest: {}}
```

### `capturePhotoResponse`

This message is sent by the app of the caller in response to a `capturePhotoRequest`. It contains the uuid that was 
used on the `photoDataEvent` messages with which the photo was transmitted.

If capturing the photo failed for whatever reason, an object describing the error is sent instead. The properties of 
this object are the same as the ones on the object sent in an `errorEvent`.

Message format:

```
{capturePhotoResponse: {uuid: string}}
```

Error format:

```
{capturePhotoResponse: {error: string, localizedError?: string}}
```

Example message:

```json
{"capturePhotoResponse": {"uuid": "571c9dbb-2887-4bfd-b334-ce6b8c2dbe3"}}
```

### `locationRequest`

This message is sent by `tower-staff` to instruct the app of the caller to start transmitting the caller's location.
Its contents will always be an empty object.

Message format:

```
{locationRequest: {}}
```

### `locationResponse`

This message is sent by the app of the caller in response to a `locationRequest`. Unless something went wrong, its
contents should be an empty object.

If getting the location failed immediately and permanently (this is usually the case because the user has previously
denied location permissions and cannot be prompted for them again), an object describing the error is sent instead.
The properties of this object are the same as the ones on the object sent in an `errorEvent`.

Message format:

```
{locationResponse: {}}
```

Error format:

```
{locationResponse: {error: string, localizedError?: string}}
```

### `switchCameraRequest`

This message is sent by `tower-staff` to instruct the app of the caller to switch to the other camera. Its contents 
will always be an empty object. The app is expected to start out on the world-facing camera and to switch between 
exactly one world-facing and one user-facing camera with each request.

Message format:

```
{switchCameraRequest: {}}
```

### `switchCameraResponse`

This message is sent by the app of the caller in response to a `switchCameraRequest`. Unless something went wrong, 
its contents should be an empty object.

If switching cameras failed for whatever reason, an object describing the error is sent instead. The properties of 
this object are the same as the ones on the object sent in an `errorEvent`.

Message format:

```
{switchCameraResponse: {}}
```

Error format:

```
{switchCameraResponse: {error: string, localizedError?: string}}
```

### `toggleTorchRequest`

This message is sent by `tower-staff` to instruct the app of the caller to toggle the flashlight on or off. Its 
contents will always be an empty object. When a `toggleTorchRequest` is received, the flashlight should stay on 
until the camera is changed, the call ends, or another `toggleTorchRequest` is received.

Message format:

```
{toggleTorchRequest: {}}
```

### `toggleTorchResponse`

This message is sent by the app of the caller in response to a `toggleTorchRequest`. Unless something went wrong, 
its contents should be an empty object.

If toggling the flashlight failed for whatever reason, an object describing the error is sent instead. The 
properties of this object are the same as the ones on the object sent in an `errorEvent`.

Message format:

```
{toggleTorchResponse: {}}
```

Error format:

```
{toggleTorchResponse: {error: string, localizedError?: string}}
```

### `errorEvent`

This message can be sent to `tower-staff` to indicate that an error has occurred that doesn't correspond to any
particular message. It contains an `error` string giving a description of the error, as well as optionally a
`localizedError` in the language the app of the caller is set to.

Message format:

```
{errorEvent: {error: string, localizedError?: string}}
```

Example message:

```json
{"errorEvent": {"error": "User has been eaten by a grue."}}
```

### `holdEvent`

This message is sent by `tower-staff` to indicate the assistant has put the call on hold. Its contents will always 
be an empty object.

The app of the caller should handle this by indicating to the user that the call is being held. A reaction on the data 
channel is not necessary.

Message format:

```
{holdEvent: {}}
```

### `locationEvent`

This message should be sent to `tower-staff` to give an update on the location of the user. This means that either
new location data is available or a problem with determining the location was encountered after the
`locationResponse` had already been sent (for example, because the user was prompted for location permissions, but
chose to deny them).

If location data is available, the message must contain a `latitude` and `longitude`, and may optionally specify:

* `altitude` – The altitude above mean sea level, measured in meters.
* `horizontalAccuracy` – The radius of uncertainty for the `coordinate`, measured in meters
* `verticalAccuracy` – The estimated uncertainty for the `altitude`, measured in meters.
* `course` – The direction in which the device is traveling, measured in degrees and relative to due north.
* `courseAccuracy` – The accuracy of the `course` value, measured in degrees.

If location data is unavailable, the message must contain an object with a description of the error instead. The
properties of this object are the same as the ones on the object sent in an `errorEvent`.

Message format:

```
{locationEvent: {
    coordinate: {latitude: number, longitude:number},
    altitude?: number,
    horizontalAccuracy?: number,
    verticalAccuracy?: number,
    course?: number,
    courseAccuracy?: number
}}
```

Error format:

```
{locationEvent: {error: string, localizedError?: string}}
```

Example message:

```json
{"locationEvent": {
    "coordinate": {"latitude": 49.49706260016542, "longitude": 8.472043479813694},
    "altitude": 97.38567337036133,
    "horizontalAccuracy": 18.982590132457574,
    "verticalAccuracy": 30.705600000000008
}}
```

### `orientationEvent`

This message can be sent to `tower-staff` to indicate that the video being received must be rotated. It specifies a
`rotationAngle` of either 0, 90, 180, or 270 degrees. The video will then be rotated clockwise by the specified
amount. The rotation is set relative to the original orientation of the video, not to the last rotation set by
another `orientatonEvent`.

Message format:

```
{orientationEvent: {rotationAngle: 0|90|180|270}}
```

Example message:

```json
{"orientationEvent": {"rotationAngle":  90}}
```

### `photoDataEvent`

This message should be sent to `tower-staff` to transmit a chunk of data for a photo that has been requested by the
assistant. To allow for reassembly of the chunks into a complete image, the message contains the total `count` of
the chunks that belong to the image, the (zero-based) `index` of the chunk contained in the message, and a `uuid`
that is the same for all the chunks belonging to the same image.

Message format:

```
{photoDataEvent: {
    imageData: string,
    chunkingInfo: {
        index: number,
        count: number,
        uuid: string
    }
}}
```

Example message:

```json
{"photoDataEvent": {
    "imageData": "…",
    "chunkingInfo": {
        "index": 0,
        "count": 3,
        "uuid": "d135b40a-351d-40c0-bf60-a351c9e6930e"
    }
}}
```

### `resumeEvent`

This message is sent by `tower-staff` to indicate the assistant is resuming a held call. Its contents will always be 
an empty object.

The app of the caller should handle this by indicating to the user that the call is being resumed. To allow for this 
to happen through an audio signal, after sending this message `tower-staff` will wait a few seconds before actually 
reconnecting the assistant.

Message format:

```
{resumeEvent: {}}
```

### `userHelloEvent`

This message should be sent to `tower-staff` at the start of the call. It contains metadata on the user making the 
call and the app being used.

The `clientInfo` contains:

 * `identifier` – Identifier for the client the user is using.
 * `version` – Version number of the client the user is using.

The `userProfile` (if available) contains:

 * `firstName` – The given name of the user, if known.
 * `lastName` – The family name of the user, if known.
 * `gender` – The gender of the user (`"M"`, `"F"`, or `"X"`), if known.
 * `birthdate` – The birthdate of the user (formatted as YYYY-MM-DD), if known.
 * `phone` – The preferred phone number for calling the user, if known.
 * `email` – The preferred e-mail address for contacting the user, if known.

Message format:

```
{userHelloEvent: {
    clientInfo: {
        identifier: string,
        version: string
    },
    userProfile?: {
        firstName?: string,
        lastName?: string,
        gender?: "M"|"F"|"X",
        birthdate: string,
        phone: string,
        email: string
    }
}}
```

Example message:

```json
{"userHelloEvent": {
    "clientInfo": {
        "identifier": "media.valo.tower_android",
        "version": "1.0.0"
    },
    "userProfile": {
        "firstName": "Theo",
        "lastName": "Test",
        "gender": "M",
        "phone": "+49 152 28817386",
        "email": "theo.test@example.com"
    }
}}
```
