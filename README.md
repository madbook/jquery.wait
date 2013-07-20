# jQuery.wait

inline window.setTimeout

jQuery.wait allows you to easily insert a delay into a chain of jQuery
methods.  This allows you to use timeouts without uglifying your code and
without having to use a custom queue. You can also now delay execution inline
by passing a `promise` to `.wait()`.



## How is this different than `.delay()`?

The built-in `.delay()` method provided by jQuery uses the built-in queue 
implementation.  Queues in jQuery require one of two things:
    
- function calls in the queue must be *manually* dequeued *or*
- functions in the queue must support auto-dequeuing by calling the `.dequeue()` internally

This basically means that jQuery methods must opt-in to the queue.  Most common
jQuery methods do not do this, and thus ignore the queue completely.  Here's an
example.  Let's say we need to add a class to the body, wait 5 seconds, then 
remove it.  Without `.wait()`, that would look like this:

    $('body').addClass('foo').delay(5000).removeClass('foo');

This may *look* like it would do the right thing, but what actually happens is 
that the delay call is completely ignored.  Non-animation methods in jQuery
don't support queueing out of the box, so they are executed immediatly.  
jQuery.wait uses its own queueing implementation, allowing it to support *any*
jQuery method that returns a jQuery object, including methods of other plugins.



## Example 1 - Setting a Timeout Inline

Here is a trivial example of how `.wait()` can be used to pause execution using
a timeout.  I'll use the same example as above.  Here's what it looks like normally:  

     $('body').addClass('foo');
     
     window.setTimeout(function(){
       $('body').removeClass('foo');
     }, 5000);

Not exactly elegant.  The `.wait()` method allows us to define this timeout
**in-line** and keep things *nice and neat*.

    $('body').addClass('foo').wait(5000).removeClass('foo');



## Example 2 - Deferring Execution with a Promise
    
The `.wait()` method recently added support for creating a promise-based
delay inline.  To use the same example as above, without `.wait()` :

    var deferred = $.Deferred();
    var promise = deferred.promise();

    $('body').addClass('foo')
    promise.then(function () {
        $('body').removeClass('foo');
    });

As with the first example, having to break up the method chain is a little ugly.
With `.wait()`, we can keep it all in-line:

    var deferred = $.Deferred();
    var promise = deferred.promise();

    $('body').addClass('foo').wait(promise).removeClass('foo');



## Disclaimer - Using with CSS Transistions

If you are using `.wait()` to add/remove classes that controls
css transitions, the duration of the wait needs to be slightly longer than
the transition time. So, if in the example above the class `foo` added a
5 second transition of some sort, I would need to make the wait time longer.
I recommend 100ms longer, though your needs may vary depending on the
complexity of the animation.

If you are chaining jQuery transitions, it is better to use the built-in
`.delay()` method, which has the same syntax but works with jQuery queues.