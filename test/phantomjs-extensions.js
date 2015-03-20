if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var FNOP = function () { };
        var instanceOfFNOP; try { instanceOfFNOP = this instanceof FNOP; } catch(e) { }
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fBound = function () {
                return fToBind.apply(instanceOfFNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}


if(!window.CustomEvent) {
    window.CustomEvent = function(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };

        var evt = document.createEvent('CustomEvent');

        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

        return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
}
