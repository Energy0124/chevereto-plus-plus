import * as $ from 'jquery';

// Saves options to chrome.storage.sync.
function save_options() {
    let hostname = $("#chevereto_hostname").val();
    chrome.storage.sync.set({
        chevereto_hostname: hostname
    }, function () {
        // Update status to let user know options were saved.
        let status = $('#status');
        status.text('Options saved.');
        setTimeout(function () {
            status.text('');
        }, 1000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        chevereto_hostname: "http://localhost/"
    }, function (items: { chevereto_hostname }) {
        $('#chevereto_hostname').val(items.chevereto_hostname);

    });
}

$('#save').click(save_options);
$(restore_options); // document.addEventListener('DOMContentLoaded', restore_options);

