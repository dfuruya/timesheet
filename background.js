const log = chrome.extension.getBackgroundPage().console.log;
const HOSTNAME = 'prowand.pro-unlimited.com';

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: HOSTNAME },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.storage.sync.get(['totalHours'], function(result) {
    if (!result.totalHours) {
        chrome.storage.sync.set({totalHours: 0}, function() {
            log('totalHours bg: ', result.totalHours);
        });
    }
});

chrome.runtime.onMessage.addListener(
    function(msg, sender, sendResponse) {
        const popupWindows = chrome.extension.getViews({ type: 'popup' });
        if (popupWindows.length) { // A popup has been found
            // details is the object from the onMessage event (see 2)
            popupWindows[0].showSubmitReady(message, sendResponse);
        }
    }
);

// chrome.storage.sync.set('times', function(data) {
//     log(`data: ${data}`);
//     times = data.times;
//     startTimes = times.startTimes;
//     endTimes = times.endTimes;
//     breaks = times.breaks;
// });

// chrome.runtime.onMessage.addListener(function(msg, sender) {
//     // First, validate the message's structure
//     if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
//         // Enable the page-action for the requesting tab
//         chrome.pageAction.show(sender.tab.id);
//     }
// });
