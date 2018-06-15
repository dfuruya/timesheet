const log = console.log;
let totalHours;
const allDays = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
// Options for the observer (which mutations to observe)
const observerConfig = { attributes: true, childList: true, subtree: true };
const dateRangeDiv = document.getElementById('dateRangeDiv');

const totalHoursDivsIds = Object.keys(allDays).map((item, index) => catString(['timeEntryTotalHours', index]));
const totalHoursDivs = cacheElementsById(totalHoursDivsIds);

// const dateRangeObserver = createObserver(dateRangeDiv, dateRangeCallback);
const totalHoursDivsObservers = createTotalHoursObservers(allDays);

function createDefaultData() {
    return {
        startHour: '0',
        startMin: '0',
        startMeridiem: '0',
        endHour: '0',
        endMin: '0',
        endMeridiem: '0',
        type: 'Labor',
    };
}

function catString(array, separator = '') {
    return array.join(separator);
}

function cacheElementsById(list) {
    return list.map(id => document.getElementById(id));
}

function createTotalHoursObservers(days) {
    const totalHoursDivs = [];
    for (let i = 0; i < days; i++) {
        const id = catString(['timeEntryTotalHours', i]);
        const el = document.getElementById(id);
        if (el) {
            totalHoursDivs.push(el);
        }
    }

    if (totalHoursDivs.length) {
        return totalHoursDivs.map(div => createObserver(div, totalDivsCallback));
    }
}

function dispatchEvent(jqElement, event) {
    let dispatched;
    switch (event) {
        case 'click':
            dispatched = new MouseEvent(event);
            break;
        case 'blur':
            dispatched = new FocusEvent(event);
            break;
        case 'change':
            dispatched = new InputEvent(event);
            break;
        default:
            dispatched = null;
    }
    const el = (typeof jqElement === 'string') ? $(jqElement) : jqElement;
    el[0].dispatchEvent(dispatched);
}

function createObserver(el, callback, config = observerConfig) {
    if (el) {
        const observer = new MutationObserver(callback, this);
        observer.observe(el, config);
        return observer;
    }
}

// // Callback function to execute when mutations are observed
// function dateRangeCallback(mutationsList, observer) {
//     for (let mutation of mutationsList) {
//         if (mutation.type == 'childList') {
//             log('A child node has been added or removed.');
//         } else if (mutation.type == 'attributes') {
//             log('The ' + mutation.attributeName + ' attribute was modified.');
//             const addNewDiv = '#addNewDiv a';
//             dispatchEvent(addNewDiv, 'click');
//             observer.disconnect();
//         }
//     }
// }

function onShowTimeSheetClick() {
    const billingType = $('#selectedBillingType');
    billingType.find('option[value="Time"]').prop('selected', true);
    dispatchEvent(billingType, 'change');

    const dateRange = $('#dateRangeString');
    dateRange.find('option:contains("Please select one")').next().prop('selected', true);
    dispatchEvent(dateRange, 'change');

    window.location = document.querySelector('#addNewDiv a').href;
}

function getTotalHours(days) {
    totalHours = 0;
    for (let i = 0; i < days; i++) {
        const id = catString(['#timeEntryTotalHours', i]);
        const el = $(id);
        const hours = parseFloat(el.text());
        totalHours += hours;
    }
    return totalHours;
}

// function calcEnd(start, duration, pm) {
//     const [hours, minutes] = start.split(':');
//     const parsedHrs = parseInt(hours);
//     const parsedMinutes = parseInt(minutes);

//     if ((parseInt(hours) + duration) > 12) {

//     }
// }

// function fillRow(start, hours) {

// }

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

function getAddNewQuery(index) {
    const array = [
        '#billingDtls',
        index,
        ` a:contains('Add New')`,
    ];
    return catString(array);
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
    startHourM = getRowQuery(index, row, 'startHourM');
    endHourM = getRowQuery(index, row, 'endHourM');
    endMeridiem = getRowQuery(index, row, 'endMeridiem');
    $(startHourM).val('8');
    $(endHourM).val('4');
    $(endMeridiem).val('1');
    dispatchEvent(endMeridiem, 'blur');
}

// // Inform the background page that this tab should have a page-action
// chrome.runtime.sendMessage({
//     from: 'content',
//     subject: 'showPageAction',
// });

// Listen for messages from 'popup'
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    let data;
    if (msg.from === 'popup') {
        switch (msg.subject) {
            case 'getTotalHours':
                data = getTotalHours(allDays);
                break;
            case 'showTimesheet':
                onShowTimeSheetClick();
                data = 'billing';
                break;
            case 'fillWeek':
                fillWeek();
                data = 'billing';
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