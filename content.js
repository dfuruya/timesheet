const loginUrl = 'https://vms.sso.intuit.com/';
const allDays = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
// Options for the observer (which mutations to observe)
const observerConfig = { attributes: true, childList: true, subtree: true };

const totalHoursDivsIds = Object.keys(allDays)
    .map((item, index) => catString(['timeEntryTotalHours', index]));

const totalHoursDivs = cacheElements(totalHoursDivsIds);
let totalHoursObservers;
if (!totalHoursDivs.includes(null)) {
    totalHoursObservers = createObservers(totalHoursDivs, totalHoursCallback);
}

function createDefaultRow() {
    return {
        startHourM: '-1',
        startMinute: '0',
        startMeridiem: '0',
        endHourM: '-1',
        endMinute: '0',
        endMeridiem: '0',
        timeEntrySpanType: 'Labor',
        noBreakTaken1: false,
    };
}

// Callback function to execute when mutations are observed
function totalHoursCallback(mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type == 'childList') {
            log('A child node has been added or removed.');
        } else if (mutation.type == 'attributes') {
            log('The ' + mutation.attributeName + ' attribute was modified.');
            const addNewDiv = '#addNewDiv a';
            // dispatchEvent(addNewDiv, 'click');
            // observer.disconnect();
        }
    }
}


function onShowTimeSheetClick() {
    const billingType = $('#selectedBillingType');
    billingType.find('option[value="Time"]').prop('selected', true);
    dispatchEvent(billingType, 'change');

    const dateRange = $('#dateRangeString');
    dateRange.find('option:contains("Please select one")').next().prop('selected', true);
    dispatchEvent(dateRange, 'change');

    window.location = document.querySelector('#addNewDiv a').href;
}

function getTotalHours(divs) {
    let totalHours = 0;
    divs.forEach(div => {
        totalHours += parseFloat(div.innerText);
    });
    return totalHours;
}

function checkSession() {
    const expiredSessionSpan = $('span.body10bold');
    let text;
    if (expiredSessionSpan) {
        text = expiredSessionSpan.text();
    }
    const expectedText = `Your Session has Expired.`;
    return (expiredSessionSpan && text.indexOf(expectedText) > -1);
}


function scrapeTimes() {
    const days = document.querySelectorAll('[id^="billingDtls"]');
    const hours = [];
    days.forEach((day, i) => {
        const dayRows = [];
        const rows = day.querySelectorAll('.body11 select');
        rows.forEach(row => {
            const dayRow = {};
            const { id, value } = row;
            const lastDot = id.lastIndexOf('.');
            const [ index, fieldType ] = id.slice(lastDot - 1).split('.');
            const rowIndex = parseInt(index);
            dayRow[fieldType] = value;
            dayRows[rowIndex] = { ...dayRows[rowIndex], ...dayRow };
        });
        const dayInfo = {
            day: i,
            rows: dayRows,
        };
        hours.push(dayInfo);
    });
    return hours;
}


function onSubmitTimesheet() {
    const submitBtn = '#billingEditListingCommand input[type="submit"]';
    dispatchEvent(submitBtn, 'click');
}

function fillWeek() {
    const lastDay = 5;
    for (let i = 0; i < lastDay; i++) {
        fillDay(i);
    }
}

function getRowQuery(index, row, post) {
    const array = [
        `#billingDetailItems${index}`,
        `billingTimeSpans${row}`,
        post,
    ];
    const separator = '\\.';
    return catString(array, separator);
}

function getLunchQuery(index) {
    const array = [
        `#billingDetailItems${index}`,
        `noBreakTaken1`,
    ];
    const separator = '\\.';
    return catString(array, separator);
}

function getAddNewQuery(index) {
    const array = [
        '#billingDtls', index,
        ` a:contains('Add New')`,
    ];
    return catString(array);
}


function fillEntry(message) {
    const { hour, minutes, meridiem, index, row, postType } = message;
    const postFixes = [
        { 'HourM': hour },
        { 'Minute': minutes },
        { 'Meridiem': meridiem },
    ];
    postFixes.forEach(postfix => {
        const [ key ] = Object.keys(postfix);
        const post = `${postType}${key}`;
        const el = getRowQuery(index, row, post);
        $(el).val(postfix[key]).blur();
    });
}

function fillDay(index) {
    let row = 0;
    let addNew, timeEntrySpanType;
    let startHourM, startMinute, startMeridiem, endHourM, endMinute, endMeridiem;

    // Morning
    startHourM = getRowQuery(index, row, 'startHourM');
    endHourM = getRowQuery(index, row, 'endHourM');
    endMeridiem = getRowQuery(index, row, 'endMeridiem');
    $(startHourM).val('8');
    $(endHourM).val('12');
    $(endMeridiem).val('1');
    dispatchEvent(endMeridiem, 'blur');
    addNew = getAddNewQuery(index);
    dispatchEvent(addNew, 'click');
    row++;

    // Lunch
    startHourM = getRowQuery(index, row, 'startHourM');
    startMeridiem = getRowQuery(index, row, 'startMeridiem');
    endHourM = getRowQuery(index, row, 'endHourM');
    endMinute = getRowQuery(index, row, 'endMinute');
    endMeridiem = getRowQuery(index, row, 'endMeridiem');
    timeEntrySpanType = getRowQuery(index, row, 'timeEntrySpanType');
    $(startHourM).val('12');
    $(startMeridiem).val('1');
    $(endHourM).val('12');
    $(endMinute).val('30');
    $(endMeridiem).val('1');
    $(timeEntrySpanType).val('Lunch');
    dispatchEvent(timeEntrySpanType, 'blur');
    addNew = getAddNewQuery(index);
    dispatchEvent(addNew, 'click');
    row++;

    // Afternoon
    startHourM = getRowQuery(index, row, 'startHourM');
    startMinute = getRowQuery(index, row, 'startMinute');
    startMeridiem = getRowQuery(index, row, 'startMeridiem');
    endHourM = getRowQuery(index, row, 'endHourM');
    endMinute = getRowQuery(index, row, 'endMinute');
    endMeridiem = getRowQuery(index, row, 'endMeridiem');
    $(startHourM).val('12');
    $(startMinute).val('30');
    $(startMeridiem).val('1');
    $(endHourM).val('4');
    $(endMinute).val('30');
    $(endMeridiem).val('1');
    dispatchEvent(endMeridiem, 'blur');
}

function fillDayNoLunch(index) {
    let row = 0;
    let startHourM, startMinute, endMeridiem, noLunch;
    startHourM = getRowQuery(index, row, 'startHourM');
    endHourM = getRowQuery(index, row, 'endHourM');
    endMeridiem = getRowQuery(index, row, 'endMeridiem');
    noLunch = getLunchQuery(index);
    $(startHourM).val('8');
    $(endHourM).val('4');
    $(endMeridiem).val('1');
    $(noLunch).prop('checked', true);
    dispatchEvent(noLunch, 'blur');
}

// // Inform the background page that this tab should have a page-action
// chrome.runtime.sendMessage({
//     from: 'content',
//     subject: 'showPageAction',
// });

window.onload = function(event) {
    log('window loaded');
    const elements = cacheElements(totalHoursDivsIds);
    let totalHours = 0;
    if (elements.some(n => n !== null)) {
        totalHours = getTotalHours(elements);
    }
    chrome.storage.sync.set({ totalHours }, function() {
        log('totalHours content: ', totalHours);
    });

    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'checkTotal',
    });
};

// Listen for messages from 'popup'
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    let data;
    if (msg.from === 'popup') {
        const totalHours = cacheElements(totalHoursDivsIds);
        switch (msg.subject) {
            case 'getTotalHours':
                data = getTotalHours(totalHours);
                break;
            case 'showTimesheet':
                onShowTimeSheetClick();
                data = 'billing';
                break;
            case 'fillWeek':
                fillWeek();
                data = null;
                break;
            case 'fillEntry':
                fillEntry(msg);
                data = null;
                break;
            case 'checkHome':
                data = checkUrl('standard_home');
                break;
            case 'checkSession':
                data = checkSession();
                break;
            case 'scrapeTimesheet':
                data = {
                    hours: scrapeTimes(),
                    totalHours: getTotalHours(totalHours),
                };
                break;
            case 'login':
                goToUrl(loginUrl);
                data = 'standard_home';
                break;
            case 'submitTimesheet':
                onSubmitTimesheet();
                data = 'billing';
                break;
            default:
                data = null;
        }
    }
    response(data);
});