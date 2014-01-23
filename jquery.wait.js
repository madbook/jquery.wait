/**
 * jquery.wait - insert simple delays into your jquery method chains
 * @author Matthew Lee matt@madleedesign.com
 */

(function ($) {
    function jQueryDummy ($real, delay, _fncQueue) {
        // A Fake jQuery-like object that allows us to resolve the entire jQuery
        // method chain, pause, and resume execution later.

        var dummy = this;
        this._fncQueue = (typeof _fncQueue === 'undefined') ? [] : _fncQueue;
        this._delayCompleted = false;
        this._$real = $real;

        if (typeof delay === 'number' && delay >= 0 && delay < Infinity)
            this.timeoutKey = window.setTimeout(function () {
                dummy._performDummyQueueActions();
            }, delay);

        else if (delay !== null && typeof delay === 'object' && typeof delay.promise === 'function')
            delay.then(function () {
                dummy._performDummyQueueActions();
            });

        else if (typeof delay === 'string')
            $real.one(delay, function () {
                dummy._performDummyQueueActions();
            });

        else
            return $real;
    }

    jQueryDummy.prototype._addToQueue = function(fnc, arg){
        // When dummy functions are called, the name of the function and
        // arguments are put into a queue to execute later

        this._fncQueue.unshift({ fnc: fnc, arg: arg });

        if (this._delayCompleted)
            return this._performDummyQueueActions();
        else
            return this;
    };

    jQueryDummy.prototype._performDummyQueueActions = function(){
        // Start executing queued actions.  If another `wait` is encountered,
        // pass the remaining stack to a new jQueryDummy

        this._delayCompleted = true;

        var next;
        while (this._fncQueue.length > 0) {
            next = this._fncQueue.pop();

            if (next.fnc === 'wait') {
                next.arg.push(this._fncQueue);
                return this._$real = this._$real[next.fnc].apply(this._$real, next.arg);
            }

            this._$real = this._$real[next.fnc].apply(this._$real, next.arg);
        }

        return this;
    };

    $.fn.wait = function(delay, _queue) {
        // Creates dummy object that dequeues after a times delay OR promise

        return new jQueryDummy(this, delay, _queue);
    };

    for (var fnc in $.fn) {
        // Add shadow methods for all jQuery methods in existence.  Will not
        // shadow methods added to jQuery _after_ this!
        // skip non-function properties or properties of Object.prototype

        if (typeof $.fn[fnc] !== 'function' || !$.fn.hasOwnProperty(fnc))
            continue;

        jQueryDummy.prototype[fnc] = (function (fnc) {
            return function(){
                var arg = Array.prototype.slice.call(arguments);
                return this._addToQueue(fnc, arg);
            };
        })(fnc);
    }
})(jQuery);