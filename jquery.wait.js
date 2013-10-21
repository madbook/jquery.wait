/**
 * jquery.wait - insert simple delays into your jquery method chains
 * @author Matthew Lee matt@wahilacreative.com
 */

(function($){
  // fake jQuery object that allows us to resolve the entire jQuery method
  // chain, pause, and resume execution later.
  function jQueryDummy($real, delay, _fncQueue){
    var dummy = this;
    this._fncQueue = (typeof _fncQueue === 'undefined') ? [] : _fncQueue;
    this._delayCompleted = false;
    this._$real = $real;

    if (typeof delay === 'number' && delay >= 0 && delay < Infinity) {
      // if a number between 0 and Infinity is given, set a timeout
      this.timeoutKey = window.setTimeout(function(){
        dummy._performDummyQueueActions();
      }, delay);
    } else if ((delay !== null) && (typeof delay === 'object') && (typeof delay.promise === 'function')) {
      // if a promise is given, use it
      delay.then(function () {
        dummy._performDummyQueueActions();
      });
    } else if (typeof delay === 'string') {
      // if we pass in a string, assume it is an event and bind it using `$.one`
      $real.one(delay, function () {
        dummy._performDummyQueueActions();
      });
    } else {
      // otherwise, just return the actual jQuery object and nothing will happen
      return $real;
    }
  }

  // when dummy functions are called, the name of the function and arguments are
  // put into a queue to execute later
  jQueryDummy.prototype._addToQueue = function(fnc, arg){
    this._fncQueue.unshift({ fnc: fnc, arg: arg });
    // if we've already finished the wait for some reason, just call them as
    // they get added
    if (this._delayCompleted) {
      return this._performDummyQueueActions();
    }
    return this;
  };

  // when the delay is finished
  jQueryDummy.prototype._performDummyQueueActions = function(){
    this._delayCompleted = true;

    var next;
    while (this._fncQueue.length > 0) {
      next = this._fncQueue.pop();

      // if we find another `wait` call in the queue, stop dequeing and pass the
      // remaining queued-up function calls to that wait call
      if (next.fnc === 'wait') {
        next.arg.push(this._fncQueue);
        return this._$real = this._$real[next.fnc].apply(this._$real, next.arg);
      }

      this._$real = this._$real[next.fnc].apply(this._$real, next.arg);
    }

    return this;
  };

  // creates dummy object that dequeues after a times delay OR promise
  $.fn.wait = function(delay, _queue) {
    return new jQueryDummy(this, delay, _queue);
  };

  //
  for (var fnc in $.fn) {
    // skip non-function properties or properties of Object.prototype
    if ((typeof $.fn[fnc] !== 'function') || !($.fn.hasOwnProperty(fnc))) {
      continue;
    }
    // create a dummy function that queues up a call
    jQueryDummy.prototype[fnc] = (function(fnc){
      return function(){
        var arg = Array.prototype.slice.call(arguments);
        return this._addToQueue(fnc, arg);
      };
    })(fnc);
  }

})(jQuery);