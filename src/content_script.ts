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

// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     if (msg.color) {
//         console.log('Receive color = ' + msg.color);
//         document.body.style.backgroundColor = msg.color;
//         sendResponse('Change color to ' + msg.color);
//     } else {
//         sendResponse('Color message is none.');
//     }
// });

