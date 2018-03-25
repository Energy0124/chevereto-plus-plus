/*
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type == 'page') {
        // let page_message = message.message;
        // Simple example: Get data from extension's local storage

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let image = document.createElement('img');
        image.onload = function () {
            context.drawImage(image, 0, 0);
            let result = canvas.toDataURL();
            // Reply result to content script
            sendResponse("testtest");
        };
        image.src = message.request.data;

    }
});
*/


chrome.storage.sync.get(['uploadQueue'], function (result) {
    console.log('Value currently is ' + result.uploadQueue);
    let uploadQueue = [];
    uploadQueue = result.uploadQueue;
    if (uploadQueue === undefined) {
        uploadQueue = [];
    }

    let count = uploadQueue.length;
    chrome.browserAction.setBadgeText({text: '' + count});

});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type == 'page') {
        var page_message = message.message;
        // Simple example: Get data from extension's local storage
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let image = document.createElement('img');
        let result = null;
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            result = canvas.toDataURL();
            // console.log(result);
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello", data: result}, function (response) {
                    // console.log(response.farewell);
                });
            });
            // Reply result to content script
            // sendResponse(result);
        };
        image.src = message.request.data;

        // Reply result to content script
        sendResponse(result);
    }
});

// The onClicked callback function.
function onClickHandler(info, tab) {

    let uploadQueue = [];
    chrome.storage.sync.get(['uploadQueue'], function (result) {
        console.log('Value currently is ' + result.uploadQueue);
        uploadQueue = result.uploadQueue;
        if (uploadQueue === undefined) {
            uploadQueue = [];
        }
        uploadQueue.push(info.srcUrl);
        chrome.storage.sync.set({uploadQueue: uploadQueue}, function () {
            console.log('Value is set to ' + uploadQueue);

            let count = uploadQueue.length;
            chrome.browserAction.setBadgeText({text: '' + count});
        });
    });


    // console.log("item " + info.menuItemId + " was clicked");
    // console.log("info: " + JSON.stringify(info));
    // console.log("tab: " + JSON.stringify(tab));

}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function () {

    let context = "image";
    let title = "Upload to Chevereto ";
    let id = chrome.contextMenus.create({
        "title": title, "contexts": [context],
        "id": "context" + context
    });


});
