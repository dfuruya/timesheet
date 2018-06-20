const chromeLogger = chrome.extension.getBackgroundPage().console.log;
const HOSTNAME = 'prowand.pro-unlimited.com';
const defaultHours = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
};
const defaultStorage = {
    totalHours: 0,
    hours: defaultHours,
};

function log(...message) {
    chromeLogger('BACKGROUND >', ...message);
}

function clearStorage() {
    chrome.storage.sync.set(defaultStorage, function() {
        log('Resetting Storage');
        log('totalHours: ', result.totalHours);
        log('hours: ', result.hours);
    });    
}


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

chrome.storage.sync.get(null, function(result) {
    if (!result) {
        clearStorage();
    } else {
        log('existing storage: ', result);
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    log('receiving msg from content');
    const popupWindows = chrome.extension.getViews({ type: 'popup' });
    if (popupWindows.length) { // A popup has been found
        log('popup found');
        // details is the object from the onMessage event (see 2)
        popupWindows[0].showSubmitReady(msg, sendResponse);
    }
});

// chrome.runtime.onMessage.addListener(function(msg, sender) {
//     // First, validate the message's structure
//     if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
//         // Enable the page-action for the requesting tab
//         chrome.pageAction.show(sender.tab.id);
//     }
// });
