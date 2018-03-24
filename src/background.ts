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


// function polling() {
//     console.log('polling');
//     setTimeout(polling, 1000 * 30);
// }
//
// polling();

