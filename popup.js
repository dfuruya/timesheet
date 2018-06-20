const log = chrome.extension.getBackgroundPage().console.log;
const queryOptions = { active: true, currentWindow: true };
let times;

const showTimesheetBtn = $('#show-timesheet');
const mainView = $('#main');
const loginBtn = $('#re-login');
const totalHoursDiv = $('#total-hours');
const submitBtn = $('#btn-submit');
const btnDefault = $('#btn-default');

const input = $('#input-a');
input.clockpicker({
    autoclose: true
});
const btnHours = $('#btn-hours');
const btnMinutes = $('#btn-minutes');

// sends a message to 'content'
function sendMessage(message, callback = function() {}) {
    chrome.tabs.query(queryOptions, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });    
}

function executeCode(code, callback = function() {}) {
    chrome.tabs.query(queryOptions, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, { code }, callback);
    });
}

function checkIfBilling() {
    chrome.tabs.query(queryOptions, function(tabs) {
        const activeTab = tabs[0];
        switchToBilling(activeTab.url);
    });
}

function switchToBilling(url) {
    if (isBillingPage(url)) {
        showTimesheetBtn.hide();
        mainView.show();
    }
}

function checkIfHome() {
    const message = {
        from: 'popup',
        subject: 'checkHome',
    };
    sendMessage(message, switchToHome);
}

function switchToHome(onStandardHome) {
    if (onStandardHome) {
        showTimesheetBtn.show();
        mainView.hide();
        loginBtn.hide();
    }
}

function checkIfLoggedIn() {
    const message = {
        from: 'popup',
        subject: 'checkSession',
    };
    sendMessage(message, switchToLogin);
}

function switchToLogin(sessionExpired) {
    if (sessionExpired) {
        showTimesheetBtn.hide();
        mainView.hide();
        loginBtn.show();
    }
}

function isBillingPage(url) {
    return url.indexOf('billing') > -1;
}

function setTotalHours(hours) {
    log('setTotalHours', hours);
    totalHoursDiv.text(hours);
    if (hours > 0) {
        submitBtn.show();
    }
}

function showSubmitReady() {
    const message = {
        from: 'popup', 
        subject: 'getTotalHours',
    };
    sendMessage(message, setTotalHours);
}




window.addEventListener('DOMContentLoaded', function() {
    checkIfHome();
    checkIfLoggedIn();
    checkIfBilling();
    showSubmitReady();
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        switchToBilling(changeInfo.url);
        showSubmitReady();
    }
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
    // Do whatever you want with the changes.
    log('changes: ', changes);
    const { totalHours } = changes;
    if (totalHours && totalHours.newValue > 0) {
        showSubmitReady();
    }
});

// chrome.webRequest.onCompleted.addListener(function(details) {
//     if (details.method === 'POST') count++;
//     if (count === 10) {
//         count = 0;
//         showSubmitReady();
//     }
// }, { urls: ["*://*.pro-unlimited.com/*"] });

chrome.storage.sync.get('totalHours', function(data) {
    log(`totalHours: ${JSON.stringify(data)}`);
    times = data;
});

showTimesheetBtn.click(function(e) {
    log('click showTimesheetBtn');
    const message = {
        from: 'popup',
        subject: 'showTimesheet',
    };
    sendMessage(message, switchToBilling);
});

btnDefault.click(function(e) {
    const message = {
        from: 'popup',
        subject: 'fillWeek',
    };
    sendMessage(message, showSubmitReady);
});

loginBtn.click(function(e) {
    const message = {
        from: 'popup',
        subject: 'login',
    };
    sendMessage(message, switchToBilling);
});

submitBtn.click(function(e) {
    const message = {
        from: 'popup', 
        subject: 'submitTimesheet',
    };
    sendMessage(message);
});


// Manual operations
btnHours.click(function(e) {
    // Have to stop propagation here
    e.stopPropagation();
    input.clockpicker('show')
        .clockpicker('toggleView', 'hours');
});

btnMinutes.click(function(e) {
    // Have to stop propagation here
    e.stopPropagation();
    input.clockpicker('show')
        .clockpicker('toggleView', 'minutes');
});


// chrome.tabs.executeScript(
//     tab.id, 
//     { code: `(async function() { 
//         // Do lots of things with await
//         let result = true;
//         chrome.runtime.sendMessage(result, function (response) {
//             console.log(response); // Logs 'true'
//         });
//     })()` }, 
//     async emptyPromise => {

//         // Create a promise that resolves when chrome.runtime.onMessage fires
//         const message = new Promise(resolve => {
//             const listener = request => {
//                 chrome.runtime.onMessage.removeListener(listener);
//                 resolve(request);
//             };
//             chrome.runtime.onMessage.addListener(listener);
//         });

//         const result = await message;
//         console.log(result); // Logs true
//     });