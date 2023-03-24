// https://stackoverflow.com/a/6158050/1261964
// https://github.com/kangax/protolicious/blob/master/event.simulate.js

function simulateHtmlMouseEvent(element, eventName)
{
    var options = extendWith(simEvtDefaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in simEvtEventMatchers)
    {
        if (simEvtEventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extendWith(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extendWith(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var simEvtEventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var simEvtDefaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}

window.simulateHtmlMouseEvent = simulateHtmlMouseEvent;
