/*
*
*   General
*
*/

function log(...message) {
    console.log('CONTENT >', ...message);
}

function catString(array, separator = '') {
    return array.join(separator);
}


/*
*
*   Observers
*
*/

function observify(element, callback, config = observerConfig) {
    if (element instanceof HTMLElement) {
        const observer = new MutationObserver(callback, this);
        observer.observe(element, config);
        return observer;
    } else {
        throw new Error('Not a plain DOM element');
    }
}

function createObservers(divs, callback) {
    return divs.map(div => observify(div, callback));
}


/*
*
*   Events
*
*/


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


/*
*
*   DOM
*
*/

function cacheElements(list, type = 'native') {
    return list.map(id => (type === 'jquery') 
        ? $(`#${id}`)
        : document.getElementById(id));
}


/*
*
*   URL
*
*/

function goToUrl(url) {
    window.location.href = url;
}

function checkUrl(subStr) {
    return window.location.href.indexOf(subStr) > -1;
}



// const contentUtils = {
//     log,
//     catString,
//     observify,
//     createObservers,
//     dispatchEvent,
//     cacheElements,
//     goToUrl,
//     checkUrl,
// };

// export default contentUtils;
