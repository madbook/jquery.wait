# jquery.wait
===========

inline window.setTimeout

jquery.wait allows you to easily insert a delay into a chain of jquery
methods.  This allows you to use timeouts without uglifying your code and
without having to use a custom queue.

example:

    // add a class to element #foo, then remove 5 seconds later

    // without jquery.wait
     $('#foo').addClass('myClass');
     window.setTimeout(function(){
       $('#foo').removeClass('myClass');
     }, 5000);

    // with jquery.wait
    $('#foo').addClass('myClass').wait(5000).removeClass('myClass');

jquery.wait will work with any default jquery object methods, as well as any
methods provided by plugins loaded *before* jquery.wait.

## using with css transitions

if you are using jquery.wait to add/remove classes that controls
css transitions, the duration of the wait needs to be slightly longer than
the transition time. So, if in the example above the class .myClass added a
5 second transition of some sort, i would need to make the wait time longer.
I recommend 100ms longer, though your needs may vary depending on the
complexity of the animation.

If you are chaining jQuery transitions, it is better to use the default
jquery .delay method, which has the same syntax but works with jquery queues