chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received from sidepanel:", request);

    // sending message to content script in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            return;
        }

        if (request.action === "startStream") {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startStream" }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError);
                } else {
                    console.log("Response from content script:", response);
                }
            });
        }
        if (request.action === "stopStream") {
            chrome.tabs.sendMessage(tabs[0].id, { action: "stopStream" }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError);
                } else {
                    console.log("Response from content script:", response);
                }
            });
        }
        if (request.action === "mediaStream") {
            console.log(request)
            chrome.tabs.sendMessage(tabs[0].id, { res: request.stream }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError);
                } else {
                    console.log("Response from content script:", response);
                }
            });
        }

        // chrome.tabs.sendMessage(tabs[0].id, { action: "test" }, function (response) {
        //     if (chrome.runtime.lastError) {
        //         console.error("Error sending message to content script:", chrome.runtime.lastError);
        //     } else {
        //         console.log("Response from content script:", response);
        //     }
        // });
    });

    sendResponse("Message received by background script");
});


