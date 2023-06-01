//
//  DataMessageTopic.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-19.
//
//


/*
 * The various messages that can be sent.
 */
enum DataMessageTopic {
    SwitchCameraRequest = "switch-camera-request",
    SwitchCameraResponse = "switch-camera-response",
    ToggleTorchRequest = "toggle-torch-request",
    ToggleTorchResponse = "toggle-torch-response",
    LocationRequest = "location-request",
    LocationResponse = "location-response",
    LocationEvent = "location-event"
}

export default DataMessageTopic;
