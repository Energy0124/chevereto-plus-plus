import * as $ from 'jquery';


$(function () {
    let uploadQueue = [];
    chrome.storage.sync.get(['uploadQueue'], function (result) {
        // console.log('Value currently is ' + result.uploadQueue);

        uploadQueue = result.uploadQueue;
        if (uploadQueue === undefined) {
            uploadQueue = [];
        }
        // console.log(uploadQueue);
        $("#queueCount").html(uploadQueue.length.toString());

        $("#queue").find("ul").html("");
        uploadQueue.forEach(function (element) {
            $("#queue").find("ul").append(`<li><a href="${element}">${element}</a></li>`)
        });

    });
    $('#option').click(() => {
        chrome.runtime.openOptionsPage();
    });

    $('#showUploadQueue').click(() => {
        $("#queue").slideToggle();
    });
    $('#clearQueue').click(() => {
        chrome.storage.sync.set({uploadQueue: []},
            function () {
                uploadQueue = [];
                let count = uploadQueue.length;
                chrome.browserAction.setBadgeText({text: '' + count});
                $("#queue").find("ul").html("");
                $("#queueCount").html(uploadQueue.length.toString());
                $("#queue").slideToggle();


            }
        );
    });
    $('#upload').click(() => {
        //for sending a message
        chrome.runtime.sendMessage({type: "openTab"}, function (response) {

        });


    });
    // const queryInfo = {
    //     active: true,
    //     currentWindow: true
    // };
    //
    // chrome.tabs.query(queryInfo, function (tabs) {
    //     $('#url').text(tabs[0].url);
    //     $('#time').text(moment().format('YYYY-MM-DD HH:mm:ss'));
    // });
    //


    // chrome.storage.onChanged.addListener(function (changes, namespace) {
    //     if ("uploadQueue" in changes) {
    //         let storageChange = changes["uploadQueue"];
    //         console.log('Storage key "%s" in namespace "%s" changed. ' +
    //             'Old value was "%s", new value is "%s".',
    //             "uploadQueue",
    //             namespace,
    //             storageChange.oldValue,
    //             storageChange.newValue);
    //
    //         // uploadQueue = storageChange.newValue;
    //         // count = uploadQueue.length;
    //         // chrome.browserAction.setBadgeText({text: '' + count});
    //     }
    //
    // });
    // $('#countUp').click(() => {
    //     chrome.browserAction.setBadgeText({text: '' + count++});
    // });
    //
    // $('#changeBackground').click(() => {
    //     chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    //         chrome.tabs.sendMessage(tabs[0].id, {
    //                 color: '#555555'
    //             },
    //             function (msg) {
    //                 console.log("result message:", msg);
    //             });
    //     });
    // });
});
