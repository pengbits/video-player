
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <common>
    @package            lang
    @file		        function.js
    @author				dpaul
    @modified			11.07.12
    @desc               language augmentations related to Function
    -------------------------------------------------------------------------------------------- */  
    
    /**
     * Function
     * Language enhancements to Functions
    **/
    
    /**
     * Function#throttle(time) -> Function
     * Creates a new copy of the passed function that will only fire once per interval. (For example when setting a handler on window resizes, if you want to limit the flurry of activity that can be triggered).  
     *  
     * [http://groups.google.com/group/prototype-core/browse_thread/thread/175468ff3c0a70ed/b5c6c12e30744306](Function.throttle)
    **/
    
    Function.prototype.throttle = function(t) 
    {
        var timeout, fn = this
        return function() 
        {
            var scope = this, args = arguments
            timeout && clearTimeout(timeout)
            timeout = setTimeout(function() { fn.apply(scope, args) }, t * 1000)
        }
    }
    
    /* No surrender, No delete! */

