//
//  DataMessageTopic.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-19.
//
//


/*
 * The various messages that can be sent.
 */
enum DataMessageTopic {
    CapturePhotoRequest = "capture-photo-request",
    CapturePhotoResponse = "capture-photo-response",
    SwitchCameraRequest = "switch-camera-request",
    SwitchCameraResponse = "switch-camera-response",
    ToggleTorchRequest = "toggle-torch-request",
    ToggleTorchResponse = "toggle-torch-response",
    LocationRequest = "location-request",
    LocationResponse = "location-response",
    LocationEvent = "location-event",
    RestartVideoRequest = "restart-video-request",
    RestartVideoResponse = "restart-video-response",
    AssistantReadyEvent = "assistant-ready-event",
    AssistantBusyEvent = "assistant-busy-event"
}

export default DataMessageTopic;
