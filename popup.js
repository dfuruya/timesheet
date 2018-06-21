const chromeLogger = chrome.extension.getBackgroundPage().console.log;
const queryOptions = { active: true, currentWindow: true };
let times;

const showTimesheetBtn = $('#show-timesheet');
const mainView = $('#main');
const loginBtn = $('#re-login');
const totalHoursDiv = $('#total-hours');
const submitBtn = $('#btn-submit');
const btnDefault = $('#btn-default');



const inputA = $('#input-a');
const inputAConfig = {
    index: 0,
    row: 0,
    postType: 'start',
};
inputA.clockpicker(createClockConfig(inputA, inputAConfig, fillEntry));

const inputB = $('#input-b');
inputBConfig = {
    index: 0,
    row: 0,
    postType: 'end',
};
inputB.clockpicker(createClockConfig(inputB, inputBConfig, fillEntry));

const btnHours = $('#btn-hours');
const btnMinutes = $('#btn-minutes');



function createClockConfig(input, configs, callback) {
    const { index, row, postType } = configs;
    return {
        autoclose: true,
        afterDone: function() {
            const timeObj = parseTime(input.val());
            const query = { index, row, postType };
            log(timeObj, query);
            callback(timeObj, query);
        }
    };
}



function log(...message) {
    chromeLogger('POPUP >', ...message);
}

// sends a message to 'content'
function sendMessage(message, callback = function() {}) {
    chrome.tabs.query(queryOptions, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}

// function executeCode(code, callback = function() {}) {
//     chrome.tabs.query(queryOptions, function(tabs) {
//         chrome.tabs.executeScript(tabs[0].id, { code }, callback);
//     });
// }


function parseTime(time) {
    let meridiem = '0'; // default value (AM)
    let [hour, minutes] = time.split(':');
    hour = parseInt(hour);
    if (hour > 12) {
        hour -= 12;
        meridiem = '1';
    }
    if (hour === 0) {
        hour = 12;
    }
    hour = hour.toString();
    return { hour, minutes, meridiem };
}

function fillEntry(time, query) {
    const message = { ...formatMsg('fillEntry'), ...time, ...query };
    sendMessage(message, null);
}

function formatMsg(subject) {
    return { from: 'popup', subject };
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
    const message = formatMsg('checkHome');
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
    const message = formatMsg('checkSession');
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
    const message = formatMsg('getTotalHours');
    sendMessage(message, setTotalHours);
}

function scrapeTimesheet() {
    const message = formatMsg('scrapeTimesheet');
    sendMessage(message, saveTimes);
}

function saveTimes(data) {
    const { hours, totalHours } = data;
    if (totalHours > 0) {
        chrome.storage.sync.set({ hours }, function() {
            log('Saving:', hours);
        });
    }
}


window.addEventListener('DOMContentLoaded', function() {
    checkIfHome();
    checkIfLoggedIn();
    checkIfBilling();
    showSubmitReady();
    scrapeTimesheet();
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
    const { totalHours, hours } = changes;
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
    const message = formatMsg('showTimesheet');
    sendMessage(message, switchToBilling);
});

btnDefault.click(function(e) {
    const message = formatMsg('fillWeek');
    sendMessage(message, showSubmitReady);
});

loginBtn.click(function(e) {
    const message = formatMsg('login');
    sendMessage(message, switchToHome);
});

submitBtn.click(function(e) {
    const message = formatMsg('submitTimesheet');
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

/*
localStorage(?) format:

    {
        totalHours: 5,
        hours: [
            {
                day: 'monday',
                rows: [
                    {
                        startHourM: '-1',
                        startMinute: '0',
                        startMeridiem: '0',
                        endHourM: '-1',
                        endMinute: '0',
                        endMeridiem: '0',
                        timeEntrySpanType: 'Labor',
                        noBreakTaken1: false,
                    }
                    {
                        startHourM          => 
                        startMinute         => 
                        startMeridiem       => 
                        endHourM            => 
                        endMinute           => 
                        endMeridiem         => 
                        timeEntrySpanType   => 
                        noBreakTaken1       => 
                    }
                ]
            }, 
            {
                day: 'tuesday',
                rows: [],
            },
            {
                day: 'wednesday',
                rows: [],
            },
            {
                day: 'thursday',
                rows: [],
            },
            {
                day: 'friday',
                rows: [],
            },
            {
                day: 'saturday',
                rows: [],
            },
            {
                day: 'sunday',
                rows: [],
            },
        ]
    }


billingDetailItems0.noBreakTaken1
*/
