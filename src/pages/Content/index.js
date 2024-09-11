console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

let mediaStream = null;

// Function to start media capture (request video and audio permissions)
function startMediaCapture() {
    console.log("Requesting permissions for video and audio...");

    navigator.permissions.query({ name: 'microphone' })
        .then((permissionObj) => {
            console.log(permissionObj.state);
        })
        .catch((error) => {
            console.log('Got error :', error);
        })

    navigator.permissions.query({ name: 'camera' })
        .then((permissionObj) => {
            console.log(permissionObj.state);
        })
        .catch((error) => {
            console.log('Got error :', error);
        })

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(function (stream) {
            console.log("Permissions granted, here is the stream: ", stream);
            localStorage.setItem("mediaStream", JSON.stringify(stream))
            chrome.runtime.sendMessage({ action: "mediaStream", stream: stream });

        })
        .catch(function (err) {
            console.error("Error accessing media devices: ", err);
        });
}

// Function to stop the media stream
function stopMediaCapture() {
    if (mediaStream) {
        // Stop all the tracks in the stream to end video/audio capture
        mediaStream.getTracks().forEach(function (track) {
            track.stop();
        });
        console.log("Media capture stopped.");
        mediaStream = null;
        chrome.runtime.sendMessage({ type: "mediaStreamStopped" });
    } else {
        console.log("No media stream to stop.");
    }
}

// Consolidated message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in content script:", request);

    if (request.action === "test") {
        sendResponse({ message: "Test message received in content script" });
    }

    if (request.action === "startStream") {
        startMediaCapture();
        sendResponse({ message: "Media capture started" });
    }

    if (request.action === "stopStream") {
        stopMediaCapture();
        sendResponse({ message: "Media capture stopped" });
    }
});

// Uncomment the line below to start media capture automatically
// startMediaCapture();

