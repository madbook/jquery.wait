/**
 * jquery.wait - insert simple delays into your jquery method chains
 *
 * jquery.wait allows you to easily insert a delay into a chain of jquery
 * methods.  This allows you to use timeouts without uglifying your code and
 * without having to use a custom queue.
 *
 * example:
 *     // add a class to element #foo, then remove 5 seconds later
 *
 *     // without jquery.wait
 *      $('#foo').addClass('myClass');
 *      window.setTimeout(function(){
 *        $('#foo').removeClass('myClass');
 *      }, 5000);
 *
 *     // with jquery.wait
 *     $('#foo').addClass('myClass').wait(5000).removeClass('myClass');
 *
 * jquery.wait will work with any default jquery object methods, as well as any
 * methods provided by plugins loaded *before* jquery.wait.
 *
 * !important - if you are using jquery.wait to add/remove classes that controll
 * css transitions, the duration of the wait needs to be slightly longer than
 * the transition time. So, if in the example above the class .myClass added a
 * 5 second transition of some sort, i would need to make the wait time longer.
 * I recommend 100ms longer, though your needs may vary depending on the
 * complexity of the animation.
 *
 * If you are chaining jQuery transitions, it is better to use the default
 * jquery .delay method, which has the same syntax but works with jquery queues
 *
 * @author Matthew Lee matt@wahilacreative.com
 */

(function($){
  function jQueryDummy($real, delay, _fncQueue){
    var dummy = this;
    this.fncQueue = (!!_fncQueue) ? _fncQueue : [];
    this.delayCompleted = false;
    this.real = $real;

    this.timeoutKey = window.setTimeout(function(){
      dummy.performDummyQueueActions.call(dummy);
    }, delay);
  }

  jQueryDummy.prototype.addToQueue = function(fnc, arg){
    if (!this.delayCompleted || this.fncQueue.length > 0) {
      this.fncQueue.unshift({ fnc: fnc, arg: arg });
    }
    else {
      this.real[fnc].apply(this.real, arg);
    }
    return this;
  };

  jQueryDummy.prototype.performDummyQueueActions = function(){
    this.delayCompleted = true;

    var next;
    while (this.fncQueue.length > 0) {
      next = this.fncQueue.pop();
      // console.log('performing delayed function '+next.fnc+'('+next.arg+')');
      if (next.fnc === 'wait') {
        next.arg.push(this.fncQueue);
        this.real[next.fnc].apply(this.real, next.arg);
        break;
      } else {
        this.real[next.fnc].apply(this.real, next.arg);
      }
    }
  };


  $.fn.wait = function(delay, _queue) {
    return new jQueryDummy(this, delay, _queue);
  };

  for (var fnc in $.fn) {
    jQueryDummy.prototype[fnc] = (function(fnc){

      return function(){
        var arg = Array.prototype.slice.call(arguments);
        return this.addToQueue(fnc, arg);
      };

    })(fnc);
  }

})(jQuery);