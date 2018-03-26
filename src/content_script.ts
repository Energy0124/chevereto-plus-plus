import * as $ from 'jquery';


chrome.storage.sync.get({
    chevereto_hostname: "http://localhost/"
}, function (items: { chevereto_hostname }) {
    let hostname = items.chevereto_hostname;
    let re = new RegExp(hostname, 'i');
    if (location.href.match(re)) {

//load inject
        let s = document.createElement('script');

        s.src = chrome.extension.getURL('inject.js');
        s.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);

//load caman
        let c = document.createElement('script');

        c.src = chrome.extension.getURL('caman.full.js');
        c.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(c);

        // console.log("chrome.runtime.onMessage.addListener(");

        chrome.runtime.onMessage.addListener(
            function (message, sender, sendResponse) {
                switch (message.type) {
                    case "upload":
                        // console.log(message.uploadQueue);
                        let uploadQueue = message.uploadQueue;
                        sendResponse("ok");
                        $("li[data-action=top-bar-upload]")[0].click();
                        //CHV.fn.uploader.add({}, urlvalues);
                        let urlvalues = uploadQueue.join(" ");
                        // console.log("url!!!!!:"+urlvalues);
                        document.addEventListener('addUrls', function () {
                            // do whatever is necessary
                            location.href = `javascript:CHV.fn.uploader.add({}, "${urlvalues}"); void 0`;
                            // console.log("set href 1")

                        });
                        location.href = `javascript:CHV.fn.uploader.add({}, "${urlvalues}"); void 0`;
                        // console.log("set href 2")
                        // console.log("try to add set href")
                        break;
                }
            }
        );


// Random unique name, to be used to minimize conflicts:
// let EVENT_FROM_PAGE = '__rw_chrome_ext_' + new Date().getTime();
        let EVENT_FROM_PAGE = "__rw_chrome_ext_1521921138510";
// let EVENT_REPLY = '__rw_chrome_ext_reply_' + new Date().getTime();
        let EVENT_REPLY = "__rw_chrome_ext_reply_1521921138510";
//


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
                            // console.log("got response 2");
                            // console.log(request.fid);
                            // console.log(request.data);
                            // Received message from background, pass to page
                            var event = document.createEvent('Events');
                            event.initEvent(EVENT_REPLY, false, false);
                            transporter.setAttribute('result', JSON.stringify(request.fid + "@" + request.data));
                            transporter.dispatchEvent(event);
                            sendResponse({farewell: "goodbye"});
                        }
                    });
                // Example of handling: Send message to background and await reply
                chrome.runtime.sendMessage({
                    type: 'page',
                    request: request
                }, function (data) {
                    // console.log("get reponse" + data);
                    // Received message from background, pass to page
                    // var event = document.createEvent('Events');
                    // event.initEvent(EVENT_REPLY, false, false);
                    // transporter.setAttribute('result', JSON.stringify(data));
                    // transporter.dispatchEvent(event);
                });
            }
        });
    }

});

