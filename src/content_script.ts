//load inject
let s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('inject.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

//load caman
let c = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
c.src = chrome.extension.getURL('caman.full.js');
c.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(c);

// Random unique name, to be used to minimize conflicts:
// let EVENT_FROM_PAGE = '__rw_chrome_ext_' + new Date().getTime();
let EVENT_FROM_PAGE = "__rw_chrome_ext_1521921138510";
// let EVENT_REPLY = '__rw_chrome_ext_reply_' + new Date().getTime();
let EVENT_REPLY = "__rw_chrome_ext_reply_1521921138510";
//
// let communication_script = document.createElement('script');
// communication_script.textContent = '(' + function (send_event_name, reply_event_name) {
//         // NOTE: This function is serialized and runs in the page's context
//         // Begin of the page's functionality
//         window['convertToDataUrl'] = function (string) {
//             sendMessage({
//                 type: 'toDataUrl',
//                 data: string
//             }, function (response) {
//                 alert('Background said: ' + response);
//             });
//         };
//
//         // End of your logic, begin of messaging implementation:
//         function sendMessage(message, callback) {
//             var transporter = document.createElement('dummy');
//             // Handles reply:
//             transporter.addEventListener(reply_event_name, function (event) {
//                 var result = this.getAttribute('result');
//                 if (this.parentNode) this.parentNode.removeChild(this);
//                 // After having cleaned up, send callback if needed:
//                 if (typeof callback == 'function') {
//                     result = JSON.parse(result);
//                     callback(result);
//                 }
//             });
//             // Functionality to notify content script
//             var event = document.createEvent('Events');
//             event.initEvent(send_event_name, true, false);
//             transporter.setAttribute('data', JSON.stringify(message));
//             (document.body || document.documentElement).appendChild(transporter);
//             transporter.dispatchEvent(event);
//         }
//     } + ')(' + JSON.stringify(/*string*/EVENT_FROM_PAGE) + ', ' +
//     JSON.stringify(/*string*/EVENT_REPLY) + ');';
// document.documentElement.appendChild(communication_script);
// communication_script.parentNode.removeChild(communication_script);


// Handle messages from/to page:
document.addEventListener(EVENT_FROM_PAGE, function (e) {
    var transporter = <any> e.target;
    if (transporter) {
        var request = JSON.parse(transporter.getAttribute('data'));

        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {

                // console.log(sender.tab ?
                //     "from a content script:" + sender.tab.url :
                //     "from the extension");
                if (request.greeting == "hello") {
                    // console.log(request.data);
                    // Received message from background, pass to page
                    var event = document.createEvent('Events');
                    event.initEvent(EVENT_REPLY, false, false);
                    transporter.setAttribute('result', JSON.stringify(request.data));
                    transporter.dispatchEvent(event);
                    sendResponse({farewell: "goodbye"});
                }
            });
        // Example of handling: Send message to background and await reply
        chrome.runtime.sendMessage({
            type: 'page',
            request: request
        }, function (data) {
            // Received message from background, pass to page
            // var event = document.createEvent('Events');
            // event.initEvent(EVENT_REPLY, false, false);
            // transporter.setAttribute('result', JSON.stringify(data));
            // transporter.dispatchEvent(event);
        });
    }
});