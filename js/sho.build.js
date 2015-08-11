
    sho.$ = jQuery;



    /**
     * sho
     * top-level namespace
    **/

    /**
     * sho.base
     * bootstrapper for library. provides namespacing and module-loading functions
    **/


    var sho = sho || {}; sho.version = '6.11.1'; sho.timestamp = '08-10-2015 12:03 PM';
    (function(context)
    {
        var js_root = '/lib/js/',
        container_name = 'ROOT',
        base_path = '/lib/js/sho/base.js',
        base_path_production = '/' + container_name + base_path,
        base_path_regex = new RegExp('(/' + container_name +')*/lib/js/sho(\.min|\.build)*\.js'), // must contain  (/ROOT)*/lib/js/sho.*.js
        context_path = null,
        program_name = 'index.js',
        path_to_program = null,
        loaded_modules = {}
        ;

        /**
         * sho.provide(str) -> Object
         * non-destructively ensure a namespace, by converting a dot-deliminated string to it's value, or by creating an empty placeholder object at the specified location
         *
         *      log('lunch'); => null/undefined // lunch doesn't exist
         *      sho.provide('lunch.mexican.tacos');
         *      log([lunch, lunch.mexican, lunch.mexican.tacos]); => [{object},{object},{object}]
         *      var lunch.thai = {'pad-key-mow':'a type of yummy noodle'}
         *      sho.provide('lunch.thai'); // does nothing, because lunch.thai already exists
         *
        **/
        function provide(str)
        {
            var obj = window;
            var path = str.split('.'); for(var i=0;i<path.length;i++)
            {
                var node = path[i];
                obj [ node ] = obj [ node ] !== undefined ? obj [ node ] : {}
                obj = obj [ node ];
            }
        }
        /**
         * sho.require(str) -> null
         * load a module from the library
        **/
        function require(str)
        {
            var path = getModulePath(str);
            if(!loaded_modules[path])
            {
                loaded_modules[path] = true;

                document.write("\n\t"+'<script type="text/javascript" src="'+ (context_path || getContextPath()) + path +'"><\/script>');
            }
        }


        /**
         * sho.base.getContextPath(str) -> String
         * internal function. determines the context path (conditional prefix for the environment) to use when drawing script tags to the DOM.
        **/
        function getContextPath()
        {
            var s, src, matches, scripts = (document.getElementsByTagName('head')[0]).getElementsByTagName('script'), l = scripts.length;

            while(l>-1)
            {
                l--;
                s = scripts[l];
                src = s.src;
                matches = src && base_path_regex.exec(src);
                if(matches)
                {
                    context_path = (matches[1] || ''); break;
                }
            }
            return context_path;
        }

        /**
         * sho.base.getModulePath(str) -> String
         * internal function. returns the path to the module in the filesystem
        **/
        function getModulePath(str)
        {
            if(str.substr(0,2) == './') // local import
            {
                return getLocalPath() + str.substr(2).split('.').join('/') + '.js'
            }
            else if(str.substr(0,3) == '../') // up one
            {
                var p = getLocalPath(), tmp = p.split('/'), arr = tmp.slice(1,tmp.length-2);
                return '/' + arr.join('/') + '/' + str.substr(3).split('.').join('/') + '.js'
            }
            else
            {
                return js_root + str.split('.').join('/') + '.js'
            }

        }


        /**
         * sho.base.getLocalPath() -> String
         * internal function. return the path to the local codebase or 'project', for loading modules relative to the index.js, outside the lib
        **/
        function getLocalPath()
        {
            if (path_to_program) return path_to_program

            var path, s, src, matches, scripts = $$('head script[src]'), l = scripts.length;
            while(l>0)
            {
                l--;
                s = scripts[l];
                src = s.readAttribute('src');
                if(s.readAttribute('rel') == 'application' || (src.indexOf(program_name) == (src.length - program_name.length)))
                {
                    path = getPathFromSrc(src); break;
                }
            }

            if(path !== '') path_to_program = path.split('/'+container_name).join('');
            return path_to_program || ''

        }

        function getPathFromSrc(src)
        {
            var path = src.split('/'), discard = path.pop(); return path.join('/') + '/';
        }

		function getLoadedModules()
        {
             return _.keys(loaded_modules);
        }

        context['emptyFunction'] = function(){}; // replacement for sho.emptyFunction
        context['require'] = require;
        context['provide'] = provide;
        context['getContextPath'] = getContextPath;
        context['loaded_modules'] = loaded_modules;
        context['getLoadedModules'] = getLoadedModules;

    })(sho);


    if(typeof(window['console']) === 'undefined')
    {
        window['console'] = { 'log':sho.emptyFunction };
        window['log'] = sho.emptyFunction
    }

sho.loaded_modules['/lib/js/sho/base.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * sho.core
     * Bare-bones utilities such as a html console/logger and our hand-rolled Observer implementation
    **/

    sho.provide('sho.core');


	/**
	 * class sho.core.Logger
	 * a simple html console for logging
	**/
	!(function($){
	sho.core.Logger = function()
	{
	    var _body,
		_console,
		_xlong = false,
		_closer,
		_content,
		_listener,
		_stage = ['',
			'<div id="sho-console-container">',
    			'<div id="sho-console-wrap">',
    				'<div id="sho-console-content"></div>',
    				'<div id="sho-console-closer">x</div>',
    			    '<textarea id="sho-console-listener"></textarea>',
    			'</div>',
		   	'</div>',
		''].join(''),
		_listening = false,
		_position;
		key_map = ({ 38:'up', 39 : 'right', 40: 'down', 37: 'left' });
		cookie_store = 'sho_console_position';
		moveable_console_support = true; /* !isMobile */

		function build()
		{
		    _body = $('body');
		    _body.append(_stage)
	    	_console =  $('#sho-console-container');
			_content =  $('#sho-console-content');
	    	_closer =   $('#sho-console-closer');
			_closer.on('click', function(e){ sho.dom.trap(e); sho.core.Logger.close(); })
			_position = sho.util.Cookies.read(cookie_store) || 'bottom-right';//'top-left';
			_console[0].className = _position;

    		if(moveable_console_support)
			{
			    _listener = $('#sho-console-listener');
    		    _listener.on('keyup', onKeyUp);
    		    _listener.on('click', startListening);
		        _body.on('click', stopListening);
    		}

		}

        function log(str)
		{
			var str = arguments[0];
			var opts = arguments[1] || {};

		    if(!_console) build();
			show();
			addMessage(str);
		}

		function addMessage(str)
		{
		    _content.append(str +'<br />');
		}

		function show()
		{
			_console.show();
		}

		function hide()
		{
			clearOutput(); _console.hide();
		}

		function clearOutput()
		{
			_content.html('')
		}

		function startListening(e)
		{
		    _listener.addClass('aktiv');
		    _listening = true; e.preventDefault();
		}

		function stopListening(e)
		{
		    if(e.target.id && /^sho-console-/.test(e.target.id))
		    {
		    }
		    else
		    {
    		    _listener.removeClass('aktiv');
		        _listening = false;
		    }
		}

		function onKeyUp(e)
		{
		    var key = e.keyCode,
		        k = key_map[key] || '' ;

		    _listening && /up|down|left|right/.test(k) && moveConsole(k);
		}

		function moveConsole(dir)
		{
		    var lastP = _position;

		    if (dir == 'up' && _position.split('-')[0] == 'bottom'){
		        _position = 'top-'+_position.split('-')[1];
		    }
		    if (dir == 'down' && _position.split('-')[0] == 'top'){
		        _position = 'bottom-'+_position.split('-')[1];
		    }
		    if (dir == 'left' && _position.split('-')[1] == 'right'){
		        _position = _position.split('-')[0]+'-left';
		    }
		    if (dir == 'right' && _position.split('-')[1] == 'left'){
    		    _position = _position.split('-')[0]+'-right';
    		}

		    if(lastP == _position) return;

    		_console[0].className = _position;
    		lastP = _position;
    		sho.util.Cookies.write(cookie_store, _position);
    	}

		return {
			log:log,
			close:hide,
			hide:hide,
			show:show,
			clear:clearOutput
		}

	}();

	})(sho.$)

    window.log = function(str)
    {
        if(console)
        {
            var isIE = window.navigator.userAgent.match(/MSIE|Trident\//)
            if(console.debug && !isIE)
            {
                 console.debug(str);
            }
            else
            {
                console.log(str);
            }
        }
    }

    window.log_json = window.logJson = function(obj)
    {
        window.log(JSON.stringify(obj));
    }

    if(console && console.clear) console.clear();

sho.loaded_modules['/lib/js/sho/core/logger.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * mixin sho.core.Observable
     * A mix-in for providing an eventing systen to objects that need to publish changes to one or more subscribers.
     * This is really old and doesn't take advantage of native events that the browser gives us, should probably be phased out
     * for some combination of native browser events + Backbone. At the moment, this is only used in [[sho.ui.carousel.Carousel]]
    **/
	sho.core.Observable = {

	    NOTIFY_ON_SUBSCRIBE:true,

        /**
         * sho.core.Observable#subscribe(s) -> null
         * Add an object to the Observable class's list of subscribers
        **/
	    subscribe:function(s)
	    {
	        if(this.subscribers == undefined) {
	            this.subscribers = [];
	        }

	        this.subscribers.push(s);

	        if(this.NOTIFY_ON_SUBSCRIBE){
	            this.notifyWithOptionalCustomImplementation(s);
	        }
	    },

        /**
         * sho.core.Observable#unsubscribe(s) -> null
         * Remove an object to the Observable class's list of subscribers
        **/
	    unsubscribe:function(s)
	    {
	        for(var i=0; i<this.subscribers.length; i++)
	        {
	            if(s===this.subscribers[i])
	            {
	                this.subscribers.slice(i,1); break;
	            }
	        }
	    },

        /**
         * sho.core.Observable#notify() -> null
         * The generic notify method, just calls `update` on each subscriber in subscriber list
        **/
	    notify:function()
	    {
	        var s = this.subscribers.reverse(); for(var i=0; i<s.length; i++)
	        {
	            this.notifyWithOptionalCustomImplementation(s[i]);
	        }
	    },
        /**
         * sho.core.Observable#notifyWithOptionalCustomImplementation(subscriber) -> null
         * Used internally to support custom `notify` implementations. If simply pinging the subscribers doesn't appeal to you, and you want more of a push model,
         * where notify sends out an object containing the state, implement an `onNotify` method and it will be called against each subscriber.
        **/
	    notifyWithOptionalCustomImplementation:function(subscriber)
	    {
	        if(this.onNotify) this.onNotify(subscriber); /* implement onNotify for push model */
	        else subscriber.update();
	    }
	};

	sho.core.Observable.addSubscriber = sho.core.Observable.subscribe;
	sho.core.Observable.removeSubscriber = sho.core.Observable.unsubscribe;

sho.loaded_modules['/lib/js/sho/core/observable.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/core.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.lang
     * Language enhancements to javascript primitives and static helpers written with the aim of making javascript easier to work with.
     * Rather than tampering with the object prototypes, we generally use a static approach, so new methods to `String` are found in `sho.string.methodName`().
     * One notable exception to this approach is [[sho.lang.Chronic]], which contains functions related to date and time, that are automatically mixed into [[Date]]'s prototype.
    **/

    /**
     * sho.string
     * Language enhancements related to the String primitive, mostly concerned with dimensions and css shorthand
    **/

    /**
     * sho.object
     * Language enhancements related to the Object primitive.
    **/

    /**
     * sho.number
     * Language enhancements related to the Number primitive.
    **/

    sho.provide('sho.lang');


    /**
     * class Date
     * The native javascript Date object is injected with instance methods from [[sho.lang.Chronic]]
    **/

    /**
     * mixin sho.lang.Chronic
     * Utility functions related to date and time. These are added to the [[Date]] primitive's prototype automatically, where they are available as instance methods.
    **/

    sho.lang.Chronic = {

        /**
         * Date#getMeridian() -> String
         * Returns a string containing either 'PM' or 'AM', generated by inspecting the hour, if the meridian property has not been explicitly set.
        **/
        getMeridian:function()
        {
            if(this.meridian == null)
            {
                var h = this.getHours();
                this.meridian = h > 11 ? 'PM' : 'AM';
            }
            return this.meridian;
        },

        /**
         * Date#setMeridian() -> Null
         * set the meridian flag by passing either a string ('AM' or 'PM') or a number (0 for AM, 1 for PM)
        **/
        setMeridian:function(m) // AM || PM || 0 || 1
        {
            if(typeof m == 'number') m = m == 1 ? 'PM' : 'AM';
            this.meridian = m;
        },

        /**
         * Date#to24Hour() -> Number
         * convert the date to a 24 hour clock and return the hour.
        **/
        to24Hour:function()
        {
            var h = this.getHours();
            var m = this.getMeridian();
            if(m == 'PM' && h < 12) h += 12;
            if(m == 'AM' && h == 12) h = 0;
            return h;
        },

        /**
         * Date#to12Hour() -> Number
         * convert the date to a 12 hour clock and return the hour.
        **/
        to12Hour:function()
        {
            var h = this.getHours();
            if( h > 11) h -= 12;
            if( h < 1 ) h = 12;
            return h;
        }

    };
    _.extend(Date.prototype, sho.lang.Chronic);



sho.loaded_modules['/lib/js/sho/lang/chronic.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.object.toCssString(Object) -> String
     * Given an object containing dimensional properties, serializes into a semi-colon deliminated string (a CSS string):
     * sho.object.toCssString({ width : 40, height : 80 })
     * => 'width:40px;height:80px;'
     *
     * The following properties are supported:
     * - width
     * - height
     * - top
     * - right
     * - bottom
     * - left
     *
     * As well as converting to a string, will insert 'px' for each value found.
    **/

    sho.provide('sho.object');
    sho.object.toCssString = function(obj)
    {
        var css = '', prop, corners = ['width','height','top','right','bottom','left'];
        while(corners.length) {
            prop = corners.pop(); if(obj[prop] !== undefined) {
                css += prop + ':' + obj[prop] + 'px;';
            }
        }
        return css;
    }


    /**
     * sho.string.hexToRGB(string) -> Array
     * Given a string such as '#FFFFFF', returns an array or rgb values that define the color.
     * Aliased as sho.string.hexToRgb
     *
     * from http://www.javascripter.net/faq/hextorgb.htm:
     *
     *      R = hexToR("#FFFFFF");
     *      G = hexToG("#FFFFFF");
     *      B = hexToB("#FFFFFF");
     *
     *      function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
     *      function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
     *      function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
     *      function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
     *
    **/
    sho.provide('sho.string');
    sho.string.hexToRgb = sho.string.hexToRGB = (function(str)
    {
        var hex = (str.charAt(0)=="#" ? str.substring(1,7) : str),
            rgb = [
                parseInt((hex).substring(0,2),16),
                parseInt((hex).substring(2,4),16),
                parseInt((hex).substring(4,6),16)
            ]
        ;
        return rgb;
    })


    /**
     * sho.string.hexFromRgb(array, includeHash) -> String
     * Given an array of RGB values such as [255,255,255], return the hex equivalent
     *
     *      function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
     *      function toHex(n) {
     *      n = parseInt(n,10);
     *      if (isNaN(n)) return "00";
     *      n = Math.max(0,Math.min(n,255));
     *      return "0123456789ABCDEF".charAt((n-n%16)/16)
     *           + "0123456789ABCDEF".charAt(n%16);
     *      }
    **/
    sho.string.hexFromRgb = sho.string.hexFromRGB = (function(array, includeHash)
    {
        includeHash = includeHash == undefined ? true : includeHash;

        function toHex(n) {
            n = parseInt(n,10);
            if (isNaN(n)) return "00";
            n = Math.max(0,Math.min(n,255));
            return "0123456789ABCDEF".charAt((n-n%16)/16)
            + "0123456789ABCDEF".charAt(n%16);
        }

        return (includeHash ? '#' : '') + _.collect(array, function(segment){
            return toHex(segment)
        }).join('')
    })




sho.loaded_modules['/lib/js/sho/lang/css.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.string.toDimensions(String) -> Object
     * Takes a string in this format: `widthxheight` and returms an object containing 'width' and 'height' properties'.
     *
     * sho.string.toDimensions(420x200)
     * => {'width':420,'height':200}
    **/
    sho.string.toDimensions = function(str)
    {
        var arr = str.split('x'); return {
            'width':Number(arr[0]),
            'height':Number(arr[1])
        };
    }

    /**
     * sho.string.toBox(String) -> Object
     * Takes a string in css margins shorthand format (top-right-bottom-left) and returns an object containing the values as keys.
     *
     * sho.string.toBox('100 50 0 25')
     * => {'top':100,'right':50,'bottom':0,'left':25}
     *
    **/
    sho.string.toBox = function(str)
    {
        var trbl = str.split(' '); return {
            'top' : Number(trbl[0]),
            'right' : Number(trbl[1]),
            'bottom' : Number(trbl[2]),
            'left': Number(trbl[3])
        };
    }


    /**
     * sho.object.toPixels(Object) -> Object
     * Iterates over each dimensional property of an object and converts to a string ending in 'px'.
     *
     * sho.object.toPixels({'width':400})
     * => {'width':'400px'}
     *
    **/
    sho.object.toPixels = function(obj)
    {
        var pixels = {}, prop, corners = ['width','height','top','right','bottom','left'];
        while(corners.length) {
            prop = corners.pop(); if(obj[prop] !== undefined) {
                pixels[prop] = obj[prop] + 'px';
            }
        }
        return pixels;
    }

    sho.provide('sho.number');
    /**
     * sho.number.inRange(value,min,max) -> Number
     * Forces a number into the range specified
     *
     * sho.number.inRange(40,50,200) => 50
     *
    **/
    sho.number.inRange = function(value,min,max)
    {
        var v = value;
        if(v < min && min !== undefined) v = min;
        if(v > max && max !== undefined) v = max;
        return v
    }

    /**
     * sho.number.isInRange(value,min,max) -> Boolean
     * Returns true if the number is greater than or equal to the minimum supplied and less or equal to the maximum
     *
     * sho.number.isInRange(240,100,200) => false
     *
    **/
    sho.number.isInRange = function(value,min,max)
    {
        return value >= min && value <= max
    }


sho.loaded_modules['/lib/js/sho/lang/dimensions.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


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


sho.loaded_modules['/lib/js/sho/lang/function.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * sho.object.fromQueryString(String) -> Object
     * Parse a url-encoded string and return the object representation
     * http://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object/
    **/
    sho.object.fromQueryString = function(str)
    {

        var s = str,
            o = {}
        ;
        str.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) { o[$1] = $3; }
        );

        return o;
    }

    /**
     * sho.object.toQueryString(object[, EncodeKeyValuePairs = true]) -> String
     * Serialize an object in a format that can be used in GET requests
     * http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
    **/
    sho.object.toQueryString = function(obj, e)
    {
        var str = [];
        var uri_encode = (e !== false);

        for(var p in obj)
        {
            if (obj.hasOwnProperty(p))
            {
                str.push(['',
                    uri_encode ? encodeURIComponent(p) : p,
                    "=",
                    uri_encode ? encodeURIComponent(obj[p]) : obj[p]
                ].join(''))
            }
        }

        return str.join("&");
    }


sho.loaded_modules['/lib/js/sho/lang/object.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.string.toSlug(String) -> String
     * Create a slug from the string provided, suitable for using in URI requests. (a slug is a hyphenated, safe/escaped, lowercased version of a phrase).
     * (A port of rails to_slug plugin)
     *
     * sho.string.toSlug("3:10 to Yuma") => '3-10-to-yuma'
     *
    **/
    sho.string.toSlug = function(str)
    {


        var value = str.gsub(/[']+/, '')

        value = value.gsub(/\W+/, ' ')


        value = value.toLowerCase()

        value = value.gsub(' ', '-')

        return value
    }

    /**
     * sho.string.esc(html) -> String
     * Escape a snippet of markup so it can be displayed as source in the browser.
     *
    **/
    sho.string.esc = function(html)
    {
        return html.split('<').join('<br />&lt;')
    }

    /**
     * sho.string.debug(Object) -> String
     * Return a debug-oriented representation of an object, by using Object.toQueryString({}).
    **/
    sho.string.debug = function(obj)
    {
        obj = typeof obj == 'undefined' ? {'isUndefined':true} : obj;
        return Object.toQueryString(obj).split('&').join(' ')
    }

    /**
     * class String
     * The native javascript String object is only augmented with a single method. For more string-related functions, see [[sho.string]]
    **/

    /**
     * String#pad(length, string) -> String
     * Pad a string with leading zeros
     *
     * '3'.pad(2,'0') => '03'
     *
    **/
    String.prototype.pad = function(l, s)
    {
        return (l -= this.length) > 0
            ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, s.length) + this + s.substr(0, l - s.length)
            : this;
    };

    /**
     * sho.string.humanize(string) -> String
     * Convert underscores and hyphens to spaces. (Desluggify the text). Used for converting a url to a useable fragment in some analytics contexts.
     *
     * sho.string.humanize('so-badly-bad') => 'so badly bad'
    **/
    sho.string.humanize = function(str){
        return str.split('_').join(' ').split('-').join(' ') /* needs work since we can't do this: sho.string.gsub(str, /[-_]/, ' ') */
    };

    /**
     * sho.string.toClassName(string) -> String
     * Convert the hyphenated form of a string to it's capitalized camel-cased cousin.
     *
     * sho.string.toClassName('so-badly-bad') => 'SoBadlyBad'
    **/
    sho.string.toClassName = function(str){
        return sho.string.camelize(str, true);
    }

    /**
     * sho.string.toMethodName(string) -> String
     * Convert the hyphenated form of a string to it's camel-cased cousin, the standard for methodNames
     *
     * sho.string.toMethodName('make-it-happen') => 'makeItHappen'
    **/
    sho.string.toMethodName = function(str){
        return sho.string.camelize(str, false);
    }

    /**
     * sho.string.camelize(string) -> String
     * Convert hyphenate form of a string to it's camel-cased cousin, optionally capitalizing the first letter.
     *
     * sho.string.camelize('ice-coffee') => 'iceCoffee'
     * sho.string.camelize('ice-coffee', true) => 'IceCoffee'
     *
    **/
    sho.string.camelize = function(s, capitalize){
        var capitalize,
            string=s.replace('_','-'),
            c = _(string.split('-')).collect(function(frag){return frag[0].toUpperCase() + frag.substr(1) }).join('');
        return capitalize ? c : (c[0].toLowerCase() + c.substr(1));
    }

    /**
     * sho.string.underscore(string) -> String
     * Replace all hyphens with underscores.
     *
     * sho.string.underscore('ice-coffee') => 'ice_coffee'
     *
    **/
    sho.string.underscore = function(str){
        return str.split('-').join('_');
    }


    /**
     * sho.string.toArray(string) -> String
     * convert a whitespace delimminated string to an array of tokens (literally an underscore-enhanced array).
     *
     * sho.string.toArray("it's going down down down") => ["its","going","down","down","down']
     * sho.string.toArray("it's going down down down").each(function(token){ log(token); })
     *
    **/
    sho.string.toArray = function(string)
    {
        return _(string.split(' '));
    }

    /**
     * sho.string.capitalize(string) -> String
     * return a capitalized (sentence-cased) form of the string
    **/
    sho.string.capitalize = function(string)
    {
        return string.substr(0,1).toUpperCase() + string.substr(1).toLowerCase()
    }

sho.loaded_modules['/lib/js/sho/lang/string.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.number.toTwoDecimalPlaces(float) -> float
     * round to 2 decimal places
     *
    **/
    sho.number.toTwoDecimalPlaces = sho.number.to2DecimalPlaces = sho.number.toTwo = function(number)
    {
        return Math.floor(number * 100) / 100;

    }

    sho.number.toTimeCode = function(seconds)
    {
        var sec_num = parseInt(seconds, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return minutes+':'+seconds;
    }

sho.loaded_modules['/lib/js/sho/lang/number.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/lang.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.dom
     * Utility functions and constants related to dom querying/manipulation, events and data-attributes
    **/

    sho.provide('sho.dom');


    /**
     * sho.dom
     * Utility functions and constants related to dom manipulation and dom queries/selection.
    **/
    (function($,context)
    {

	    var _body,
	        _content,
	        _cache = {}
	    ;

        /**
         * sho.dom.normalize(property,elements) -> null
         * Normalize the height or width across a collection of elements, so that they are all set to the greatest value.
         * Useful for 'stretching' the shortest column in a set, for example.
         *
         *      // before
         *      <div class="col" style="height:150px;">a</div>
         *      <div class="col" style="height:100px;">b</div>
         *      <div class="col" style="height:250px;">c</div>
         *
         *      sho.dom.normalize('height', $('.col'));
         *
         *      // after
         *      <div class="col" style="height:250px;">a</div>
         *      <div class="col" style="height:250px;">b</div>
         *      <div class="col" style="height:250px;">c</div>
         *
        **/
    	function normalize(property, els)
		{
			if('height width min-height min-width minHeight minWidth'.indexOf(property) == -1) return false;

			var elements = $(els),
			    biggest = 0,
				val = 0,
				propertyName,
				isMinProperty = property.indexOf('min-') > -1
			;

			elements.each(function()
			{
			    propertyName = isMinProperty ? property.split('min-')[1] : property;
				val = $(this)[propertyName]();
				biggest = biggest > val ? biggest : val;
			});

			elements.each(function()
			{
			    if(isMinProperty)
			    {
			        $(this).css(property, biggest);
		        }
			    else
			    {
				    $(this)[property](biggest);
				}
			});
		}

        /**
         * sho.dom.getDimensionsWithoutPadding(element) -> Object
         * Return the element's pixel dimensions, with padding subtracted from the result
        **/
		function getDimensionsWithoutPadding(el)
        {
            var d = el.getDimensions(),
            dimensions = {};
            dimensions.height = d.height - Number(el.getStyle('paddingTop').gsub(/px/,'')) - Number(el.getStyle('paddingBottom').gsub(/px/,''));
            return dimensions;
        }

        /**
         * sho.dom.getElementPadding(element) -> Object
         * Extract the element's padding definitions and return in object form
         *
         *     .wibble { padding:50 100 0 25; }
         *
         *     sho.dom.getElementPadding($$('.wibble')[0]) => {'top':50,'right':100,'bottom':0,'left':25}
         *
         * Aliased as sho.dom.$P()
        **/
        function getElementPadding(el)
        {
            var p={};
            $w('top right bottom left').each(function(key){
                p[key]=(Number(el.getStyle(('padding-'+key).camelize()).gsub(/px/,'')));
            }); return p;
        }

        /**
         * sho.dom.getCachedElement(selector) -> ElementWrapperSet or Array
         * Leverage a cached element for commonly reused selectors. (Such as body, html .container) etc.
         * If the element has already been fetched, it will return the cached copy, avoiding the cost of a redundant dom query.
         * `Selector` is used loosely here, if the string passed is `body` or `html`, the body or html element is returned,
         * otherwise is is assumed to be a className.
         *
         * The most common forms of this call are aliased as sho.dom[element/className], so for example:
         *
         *      sho.dom.body();     // cached query or $('body')[0]
         *      sho.dom.html();     // cached query or $('html')[0]
         *      sho.dom.content();  // cached query or $('.content')[0]
        **/
        function getCachedElement(key)
        {
            if(!_cache[key]){
                _cache[key] = $(key == 'body' || key == 'html' ? key : '.'+key)/*[0]*/;
            }
            return _cache[key]
        }

        /**
         * sho.dom.setFullBleed(Boolean) -> Null
         * Toggles the presence of the html element's 'full-bleed' className on and off programatically.
         * (Pages with &lt;html class="full-bleed"&gt; have overflow:hidden, and do not render scrollbars).
        **/
        function setFullBleed(onoff)
        {
            (sho.dom.html())[onoff ? 'addClass' : 'removeClass']('full-bleed');
        }

        /**
         * sho.dom.getFullBleed() -> Boolean
         * Returns true if the html element contains the 'full-bleed' className.
         * (Pages with &lt;html class="full-bleed"&gt; have overflow:hidden, and do not render scrollbars).
        **/
        function isFullBleed()
        {
            return (sho.dom.html()).hasClass('full-bleed');
        }

        /**
         * sho.dom.getPageScroll() -> Number
         * Returns the viewport's `yOffset`. See Prototype API's entry on [document.viewport](http://api.prototypejs.org/dom/document/viewport/getScrollOffsets/) for more information.
         * todo: remove prototype dependency
        **/
        function getPageScroll()
        {
            return document.viewport.getScrollOffsets()[1];
        }

        /**
         * sho.dom.viewport() -> Object
         * Return an object containing the width and height of the viewport. Does not rely on prototype's [document.viewport](http://api.prototypejs.org/dom/document/viewport/getScrollOffsets/)
         * http://stackoverflow.com/questions/1766861/find-the-exact-height-and-width-of-the-viewport-in-a-cross-browser-way-no-proto
        **/
        function viewport()
        {
            var e = window;
            var a = 'inner';
            if (!('innerWidth' in window)){
                a = 'client';
                e = document.documentElement || document.body;
            }
            return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
        }

        /**
         * sho.dom.html() -> ElementWrapperSet
         * See [[sho.dom.getCachedElement]]
        **/

        /**
         * sho.dom.body() -> ElementWrapperSet
         * See [[sho.dom.getCachedElement]]
        **/

        /**
         * sho.dom.content() -> ElementWrapperSet
         * See [[sho.dom.getCachedElement]]
        **/

        _.extend(context, {
            'normalize' : normalize,
            'html' :    _.bind(getCachedElement, this, 'html'),
            'body' :    _.bind(getCachedElement, this, 'body'),
            'content':  _.bind(getCachedElement, this, 'content'),
            'getCachedElement' : getCachedElement,
            'setFullBleed' : setFullBleed,
            'isFullBleed' : isFullBleed,
            'viewport' : viewport
        });


    })(sho.$, sho.dom);

    sho.body = sho.dom.body
    /**
     * sho.dom.REDRAW_DELAY = 0.125
     * `sho.dom.REDRAW_DELAY = 0.125;`
     *
     * A global containing the amount of time to wait for the browser to 'repaint' before peforming some calculation or moving on to more code.
     * There many situations in which we have to introduce a micro-delay, to allow the browser to catch up, and this is often achieved by calling Function.delay() and providing some small fractional value in seconds.
     * This is a way to universalize the value.
    **/

    sho.dom.REDRAW_DELAY = 0.125;
    sho.dom.REDRAW_DELAY_ = sho.dom.REDRAW_DELAY * 1000; /* for use with _.delay */

    /**
     * sho.dom.SPACER = '/assets/images/lib/clear.png';
     * `sho.dom.SPACER = '/assets/images/lib/clear.png';`
     *
     * Path to a clear spacer image
    **/
    sho.dom.SPACER = '/assets/images/lib/clear.png';

    sho.bodyclasses = function(){
        return sho.dom.body().get(0).className
    }
sho.loaded_modules['/lib/js/sho/dom/help.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    /**
     * sho.dom.events
     * Provides a public event broadcast system by acting as a wrapper around Zepto's $(document).trigger.
     * Used to set and unset 'public' events. This version works without prototypejs.
     * it would be nice if we could normalize the differences between jquery/backbone and prototype's
     * event responder styles, but that seems to be more involved.
     *
     *      // in prototype, invoking this...
     *      $(document).fire('user:loaded', {'username':'fred' })
     *
     *      // results in this: *note how the passed data is stored in e.memo*
     *      myCallBack({'eventName':'user:loaded', 'memo':{..} })
     *
     *      // but, in backbone, invoking this...
     *      obj.trigger('user:loaded', {'username':'fred' })
     *
     *      // results in this, if the listener is generic
     *      myCallBack('user:loaded', {...})
     *
     *      // and this, if the listener was specific
     *      myCallBack({...})
     *
     * Note: the methods documented here are actually exported directly onto [[sho.dom]]
    **/
    !(function($){
    _.extend(sho.dom, {

        /**
         * sho.dom.events.bind(eventName, callback) -> Null
         * sho.dom.bind(eventName, callback) -> Null
         * Attaches the callback onto the document element for the event specified
         *
         * Aliased as sho.dom.bind
        **/
        bind : function(eventName, callback)
        {
            $(document).on(eventName, callback)
        },

        /**
         * sho.dom.events.unbind(eventName, callback) -> Null
         * sho.dom.unbind(eventName, callback) -> Null
         * Unset a listener set with sho.dom.bind()
         *
         * Aliased as sho.dom.unbind()
        **/
        unbind : function(eventName, callback)
        {
            $(document).off(eventName, callback)
        },

        /**
         * sho.dom.events.trigger(eventName, data) -> Null
         * sho.dom.trigger(eventName, data) -> Null
         * Invoke an event progromatically
         *
         * Aliased as sho.dom.trigger()
        **/
        trigger : function(eventName, data)
        {
            $(document).trigger(eventName, data)
        },

        /**
         * sho.dom.events.once(eventName, callback) -> Null
         * sho.dom.once(eventName, callback) -> Null
         * Adds an event handler to the document element that removes itself
         * the first time it runs, ensuring that the handler only fires once.
         *
         * Aliased as sho.dom.once
        **/
        once : function(eventName, callback)
        {
            $(document).one(eventName, callback)
        },

        /**
         * sho.dom.events.ready(function) -> Null
         * Platform-agnostic wrapper around jQuert/Zepto's $(document).ready
        **/
        ready : function(fn)
        {
            $(document).ready(fn)
        },

        trap:function(e)
        {
            e.stopPropagation(); e.preventDefault();
            return e;
        }

    });

    })(sho.$)

sho.loaded_modules['/lib/js/sho/dom/events.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide ('sho.dom.data');
    /**
     * sho.dom.data
     * A wrapper around read/write of html5 data-attributes.
     * Uses the native dataset property when available, and falls back to readAttribute in older browsers. (IE).
     * does not convert types, data-wibble="true" will return a string when accessed via sho.dom.data(el, 'wibble')
    **/

    !(function($){
    sho.dom.data = {

        /**
         * sho.dom.data#read(element, camelCasedProperty) -> String
         * Inspects the element provided, pulls out the data-attribute specified and returns the value.
         *
         *      <a href="#/wibble/" id="wibble" data-role="awesome">Let's get it popping</a>
         *      sho.dom.data.read($('wibble'), 'role') -> 'awesome'
        **/
        read : function(el, property)
        {
            return $(el).data(property)
        },

        /**
         * sho.dom.data#write(element, object) -> Element
         * Takes a hash of key-value pairs and stores them on the element provided.
         * Uses data-attribute if available, falling back to writeAttribute otherwise.
         *
         *      <a href="#/wibble/" id="wibble" data-role="awesome">Let's get it popping</a>
         *      var el = $('wibble');
         *      sho.dom.data.write(el, {'role':'kinda weak'});
         *      sho.dom.data.read(el, 'role'); // -> 'kinda weak'
         *
        **/
        write : function(el, hash)
        {
            _(hash).each(function(value,key){
                $(el).data(key,value);
            });
        }
    };


    })(sho.$)

sho.loaded_modules['/lib/js/sho/dom/data.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !(function()
    {
        var getOrientation =  function(){
            return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        },

        isPortrait = function(){
            return getOrientation() == 'portrait';
        },

        isLandscape = function(){
            return getOrientation() == 'landscape';
        },

        setOrientationHandlers = function()
        {

            if('onorientationchange' in window)
            {
                log('onorientationchange found');
                window.onorientationchange = onOrientationChange
            }
        },

        onOrientationChange = function()
        {
            log('orientation change');
            var orientation = getOrientation();
            sho.dom.trigger('orientation:change', orientation);

        };


        _.extend(sho.dom,
        {
           orientation : getOrientation,
           isPortrait : isPortrait,
           isLandscape : isLandscape
        });

        sho.dom.ready(setOrientationHandlers);

    })();

sho.loaded_modules['/lib/js/sho/dom/orientation.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
	/**
	* sho.dom.html5support() -> null
	* creates an html5 element so it will be recognized by IE < 10
	* being used as a temporary patch for the message boards which load the login in an iframe, needs to support the <section> element
	**/

	sho.dom.ready(
		function(){
			window.setTimeout(addElements, 1000);
		}
	)

	function addElements(){
		if(sho.$('.ie9').length > 0 || sho.$('.chr').length > 0){
			_.each(['section'], function(ele){
				document.createElement(ele);
			})
		}
	}
sho.loaded_modules['/lib/js/sho/dom/html5support.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/dom.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.env
     * contains classes and helpers related to the device/browser and server environment
    **/

    sho.provide('sho.env');


    /**
     * sho.env
     * contains classes and helpers related to the device/browser and server environment
    **/

    /**
     * class sho.env.UserAgent
     * Wrapper around the browser's user-agent, provides information about browser type and platform
     * Do not instantiate directly, rather use one of the convenience methods for browser or platform
    **/
    sho.env.UserAgent = klass({

    	_browser : {},
    	_platform : {},

    	initialize:function()
    	{
    		this.detect();
    	},

    	detect:function()
    	{
    		var ua = navigator.userAgent.toLowerCase(),
    		v = 0,
    		check = function(r){
    	    	return r.test(ua);
    	    },
    	    isOpera = check(/opera/),
    		isChrome = check(/chrome/),
    		isChromeFrame = check(/chromeframe/),
    	    isWebKit = check(/webkit/),
            isSafari = !isChrome && check(/safari/) && check(/version/),
			isChromeIOS = !isChrome && check(/safari/) && check(/crios/),
            isGecko = !isWebKit && check(/gecko/),
            isIE = !isOpera && (check(/msie/) || isGecko && check(/trident/)),
    		isFireFox = isGecko && check(/firefox/),

            isIPad = check(/(ipad).*os\s([\d_]+)/),
            isIPhone = !isIPad && check(/(iphone\sos)\s([\d_]+)/),
            isAndroid = check(/(android)\s+([\d.]+)/),

            androidVersion = parseFloat(ua.slice(ua.indexOf("android")+8)),
            isAndroidOS3OrLess = (isAndroid && (androidVersion <= 3)),
            isAndroidOS4 = (isAndroid && (androidVersion >= 4)),
            isAndroidStock = (isAndroidOS4 && isWebKit && isSafari && !isChrome),

            isMobile = check(/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/) && check(/mobile/) && !check(/tablet/), // undo false positive for facebook app browser-pane
            isTablet = isIPad || (isAndroid && !check(/mobile/)),
            isDesktop = !isMobile && !isTablet,
            isIOS = (isIPad || isIPhone),
    		isIOS4OrLess = isIOS && check(/OS [1-4].+ like Mac OS X/i),
    		isIOS5 = isIOS && check(/OS [5].+ like Mac OS X/i),
            isFacebookApp = isIOS && check(/fban\/fbforiphone/),
            isTouchDevice = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
            ;
            /**
             * sho.env.UserAgent#_browser -> Object
             * (private) object containing the results of the browser detection routine. Use sho.env.browser() to access.
             *
             *      name                the full name of the browser, ie 'FireFox'
             *      key                 2-3 character short-form name of the browser, ie 'ff'
             *      version             browser version number
             *      shortName           key + version number, ie 'ff12'
             *      family              browser type, 'opera','webkit','gecko','ie'
             *      isOpera             true | null
             *      isChrome            true | null
             *      isChromeFrame       true | null
             *      isWebKit            true | null
             *      isSafari            true | null
             *      isIE                true | null
             *      isGecko             true | null
             *      isFireFox           true | null
             *      isAndroidStock      true | null
             *
            **/

            if(isOpera)
            {
                this._browser={ 'name':'opera','key':'opr', version:v, isOpera:true, family:'opera' };
            }
            if(isChrome && !isChromeFrame)
            {
                v = ua.match(/chrome\/(\d{1,4})/)[1];
                this._browser={ 'name':'chrome','key':'chr', version:v, isChrome:true, family:'webkit' };
                this._browser['isChrome'+v]=true;
            }
            if(isFireFox)
            {
                v = ua.match(/firefox\/(\d{1,4})/)[1];
                this._browser={ 'name':'firefox','key':'ff', version:v, isFireFox:true, family:'gecko' };
                this._browser['isFireFox'+v]=true;
            }
            if(isSafari)
            {
                v = check(/applewebkit\/4/) ? 2 : ua.match(/version\/(\d)/)[1];
                this._browser={ 'name':'safari','key':'saf', version:v, isSafari:true, family:'webkit'};
                this._browser['isSafari'+v]=true;
            }
            if(isChromeIOS)
            {
                v = ua.match(/crios\/(\d)/)[1];
                this._browser={ 'name':'chrome','key':'chr', version:v, isChrome:true, family:'webkit'};
                this._browser['isChrome'+v]=true;
            }
            if(isIE)
            {
                v = !isGecko ?
                    (ua.match(/msie\s(\d+)/)[1])
                    :
                    (ua.match(/rv:(\d+)/)[1])
                ;

                isGecko = false;
                this._browser={ 'name':'internet explorer','key':'ie', version:v, isIE:true, family:'ie' };
                this._browser['isIE'+v]=true;
            }
            if(isAndroidStock)
            {
                v = ua.match(/applewebkit\/(\d)/)[1];
                this._browser={ 'name': 'Android Stock', 'key': 'ads', version:v, isAndroidStock:true, family:'webkit'};
            }

            this._browser.shortName = this._browser.key + this._browser.version;
            /**
             * sho.env.UserAgent#_platform -> Object
             * (private) object containing the results of the browser/platform detection specific to device/operating system. Use sho.env.platform() to access.
             *
             *      isWindows           true | null
             *      isWinXP             true | null
             *      isWin7              true | null
             *      isWinVista          true | null
             *      isMac               true | null
             *      isLinux             true | null
             *      ipad                true | null
             *      iphone              true | null
             *      android             true | null
             *      mobile              true | null
             *      tablet              true | null
             *      desktop             true | null
             *      iOS                 true | null
             *      iOS4OrLess          true | null
             *      iOS5                true | null
             *      facebookApp         true | null
             *
            **/
            var isWindows = check(/windows|win32/),
            isWinXP = isWindows && check(/windows nt 5.1/),
            isWin7 = isWindows && check(/windows nt 6.1/),
            isWinVista = isWindows && check(/windows nt 6.0/), // unconfirmed
            isMac = check(/macintosh|mac os x/),
            isLinux = check(/linux/);

            if(isWindows){
                this._platform = _.extend({},{
                    'name':'windows',
                    'os':'win'
                },
                (isWinXP ? {'winXP':true, 'version':'winXP'} : {}),
                (isWin7 ? {'win7':true, 'version':'win7'} : {}),
                (isWinVista ? {'winVista':true,'version':'winVista'} : {})
                );
            }
            if(isMac){
                this._platform = {
                    'name':'macintosh',
                    'os':'mac'
                }
            }
            if(isLinux){
                this._platform = {
                    'name':'linux',
                    'os':'nix'
                }
            }
            if(isDesktop) this._platform.key = 'desktop';
            if(isTablet)  this._platform.key = 'tablet';
            if(isMobile)  this._platform.key = 'mobile';


            _.extend(this._platform, {
                'ipad' : isIPad,
                'iphone' : isIPhone,
                'android' : isAndroid,
                'mobile' : isMobile,
                'tablet' : isTablet,
                'desktop' : isDesktop,
    			'iOS' : isIOS,
    			'iOS4OrLess' : isIOS4OrLess,
    			'iOS5' : isIOS5,
    			'isAndroidOS3OrLess' : isAndroidOS3OrLess,
    			'isAndroidOS4' : isAndroidOS4,
    			'facebookApp' : isFacebookApp,
                'touchDevice' : isTouchDevice
            });
    	},

    	browser:function()
    	{
    		return this._browser;
    	},

    	platform:function()
    	{
    	    return this._platform;
    	},

    	isTouchDevice:function()
    	{
            return (('ontouchstart' in window)
               || (navigator.MaxTouchPoints > 0)
               || (navigator.msMaxTouchPoints > 0));
    	}
    });

    /**
     * sho.env.UserAgent.factory() -> Object
     * singleton-style constructor for the UserAgent. Returns a cached instance if it is not the first time being invoked
    **/
    sho.env.UserAgent.factory = function()
    {
    	if(!sho.env.UserAgent.instance) sho.env.UserAgent.instance = new sho.env.UserAgent();
    	return sho.env.UserAgent.instance
    };

    /**
     * sho.env.browser() -> Object
     * convenience method, instantiates [[sho.env.UserAgent]] and fetches its _browser object
    **/

    /**
     * sho.env.platform() -> Object
     * convenience method, instantiates [[sho.env.UserAgent]] and fetches its _platform object
    **/
    sho.env.browser =  function(){ return sho.env.UserAgent.factory().browser(); };
    sho.env.platform = function(){ return sho.env.UserAgent.factory().platform(); };

    /**
     * sho.env.UserAgent.isMobile() -> Boolean
     * true if sho.env.UserAgent.platform().mobile is true.<br />Aliased as sho.isMobile() and sho.env.isMobile()
     **/

    /**
     * sho.env.UserAgent.isTablet() -> Boolean
     * true if sho.env.UserAgent.platform().tablet is true. (if isIpad or (isAndroid and !isMobile)).<br />Aliased as sho.isTablet() and sho.env.isTablet()
     **/

    /**
     * sho.env.UserAgent.isDesktop() -> Boolean
     * true if isTablet and isMobile are false.<br />Aliased as sho.isDesktop() and sho.env.isDesktop()
     **/

    /**
     * sho.env.UserAgent.isIphone() -> Boolean
     * true if sho.env.UserAgent.platform().iphone is true.<br />Aliased as sho.isIphone() and sho.env.isIphone()
     **/

    /**
     * sho.env.UserAgent.isIpad() -> Boolean
     * true if sho.env.UserAgent.platform().ipad is true.<br />Aliased as sho.isIpad() and sho.env.isIpad()
     **/

    /**
     * sho.env.UserAgent.isIos() -> Boolean
     * true if sho.env.UserAgent.platform().ios is true.<br />Aliased as sho.isIos() and sho.env.isIos()
     **/

    /**
     * sho.env.UserAgent.iOS4OrLess() -> Boolean
     * true if sho.env.UserAgent.platform().iOS4OrLess is true.<br />Aliased as sho.iOS4OrLess() and sho.env.iOS4OrLess()
     **/

    /**
     * sho.env.UserAgent.iOS5() -> Boolean
     * true if sho.env.UserAgent.platform().ios5 is true.<br />Aliased as sho.isIOS5() and sho.env.isIOS5()
     **/

    /**
     * sho.env.UserAgent.isAndroid() -> Boolean
     * true if sho.env.UserAgent.platform().android is true.<br />Aliased as sho.isAndroid() and sho.env.isAndroid()
     **/

    /**
     * sho.env.UserAgent.isFacebookApp() -> Boolean
     * true if sho.env.UserAgent.platform().facebookApp is true.<br />Aliased as sho.isFacebookApp() and sho.env.isFacebookApp()
     **/

    (function(){
        _('mobile tablet desktop iphone ipad iOS iOS4OrLess iOS5 android facebookApp touchDevice'.split(' ')).each(function(platform){
     	    var methodName = sho.string.camelize('is-'+platform),               // isIpad
     	    fn = function(){ return !!(sho.env.platform()[platform]); };        // sho.env.platform().ipad
     	    sho.env[methodName] = sho[methodName] = fn;                         // sho.env.isIpad(), sho.isIpad() => true || false
        });
    }());

    sho.supportsPositionFixed = function(){ return !sho.isIOS4OrLess() }

sho.loaded_modules['/lib/js/sho/env/useragent.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    /**
     * class sho.env.Tagger
     * Decorates the DOM with useful classnames pertaining to useragent and platform. Created automatically at startup
     * For example, browsing the homepage with Chrome on a Mac reveals the following
     *
     *      // before:
     *      <html lang="en" class="full-bleed no-js">...
     *      // after:
     *      <html lang="en" class="full-bleed js mac webkit chr chr18">...
     *
    **/
	!(function($){
    sho.env.Tagger = function()
	{
		function initialize()
		{
		    var platform = sho.env.platform(),
		    browser = sho.env.browser(),
		    tablet_classnames = [],
            mobile_classnames = [],
            platform_classnames = [],
            classnames = []
            ;

		    if(platform.tablet)
		    {
		        tablet_classnames.push('tablet');

		        tablet_classnames.push('orientation-'+ sho.dom.orientation());

		        if(platform.android && platform.tablet) tablet_classnames.push('android');
		        if(platform.ipad)
		        {
		            tablet_classnames.push('ipad');
		            if(platform.iOS5) tablet_classnames.push('ios-5');
		            if(platform.iOS4OrLess) tablet_classnames.push('ios-4');
		        }
            }

            if(platform.mobile)
            {
                mobile_classnames.push('mobile');
                if(platform.iphone) mobile_classnames.push('iphone');
                if(platform.android) mobile_classnames.push('android');
            }

            platform_classnames = [platform.os] // formerly platform.key
            if(platform.os == 'win') platform_classnames.push(platform.version); // win7,winXP or winVista

            platform_classnames.push(platform.touchDevice ? 'touch' : 'no-touch');

		    classnames = _(['js',platform_classnames,tablet_classnames,mobile_classnames,browser.family,browser.key,browser.key+browser.version]).flatten();
		    sho.dom.html().removeClass('no-js');

		    sho.env.isDesktop() && (sho.dom.html().removeClass('mobile').addClass('desktop'))

		    sho.dom.html().addClass(classnames.join(' '));
		}

		function addOrientationClass(orient)
		{
		    sho.dom.html().removeClass('orientation-landscape').removeClass('orientation-portrait').addClass('orientation-'+orient);
		}

		return {
			init:initialize,
			addOrientationClass: addOrientationClass
		}

	}();

	sho.dom.ready(function(){
	    sho.env.Tagger.init();
	    sho.dom.bind('orientation:change', sho.env.Tagger.addOrientationClass);
	})


	})(sho.$)

sho.loaded_modules['/lib/js/sho/env/tagger.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.env.ServerInfo
     * Utility class containing information about the server environment
     * There is a 3 stage sequence in determing the server (LOCAL, DEV, QA, POSTING, LIVE, or UNKNOWN), the first time the class is accessed:
     *
     *  * Look to see if the server_name is exposed as a psuedo-global at `sho.server_name`
     *  * Look for the presence of a meta tag such as `<meta name="spring-environment-server" content="DEV">`
     *  * Resort to inspecting to the `window.location.hostname` object
    **/
	sho.env.ServerInfo = klass({

	    _KLASS_ : 'sho.env.ServerInfo',

	    asset_context : null,    // production || development
		server_name : null,      // LOCAL, DEV, QA, POSTING, LIVE, UNKNOWN

		initialize:function()
		{
		    this.detectServerName()
		},

		detectServerName:function()
		{
		    while(!this.server_name)
		    {
		        if(sho.server_name)
    		    {
    		        this.server_name = sho.server_name; break;
    		    }
    		    var meta = sho.$('meta[name=spring-environment-server]').attr('content'); if(meta){
    		        this.server_name = meta; break;
    		    }
    		    var h = window.location.hostname,
    		        check = (function(pattern){
    		            return (h.match(pattern) || []).length
    		        })
    		    ;
    		    if(check(/(\d+\.\d+\.\d+\.\d+)|(localhost)/)) this.server_name = 'LOCAL'; break;
    		    if(check(/dev|qa|posting|www/)) this.server_name = (h.match(/dev|qa|posting|www/)[0]).toUpperCase().split('WWW').join('LIVE'); break;
    		    this.server_name = 'UNKNOWN';
    		}

		}

	});

	sho.env.ServerInfo.factory = function()
	{
		if(!sho.env.ServerInfo._instance) sho.env.ServerInfo._instance = new sho.env.ServerInfo();
		return sho.env.ServerInfo._instance
	};

	sho.env.serverName = function(){
	    var svr = sho.env.ServerInfo.factory();
	    return svr.server_name
    };

	(function(){
	    _('local dev qa posting live unknown'.split(' ')).each(function(server){
      	    var methodName = sho.string.camelize('is-'+server),
    	    fn = function(){ return sho.env.serverName().toLowerCase() == server };
    	    sho.env[methodName] = fn;
    	});
    }())

    /**
     * sho.env.ServerInfo.isLocal() -> Boolean
     * true if running on local development environment.
    **/

    /**
     * sho.env.ServerInfo.isDev() -> Boolean
     * true if running on http://dev.sho.com.
    **/

    /**
     * sho.env.ServerInfo.isQa() -> Boolean
     * true if running on http://qa.sho.com.
    **/

    /**
     * sho.env.ServerInfo.isPosting() -> Boolean
     * true if running on http://posting.sho.com
    **/

    /**
     * sho.env.ServerInfo.isLive() -> Boolean
     * true if running on http://www.sho.com aka LIVE
    **/

    /**
     * sho.env.ServerInfo.isUnknown() -> Boolean
     * true if server environment could not be determined
    **/






sho.loaded_modules['/lib/js/sho/env/serverinfo.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.env.Utils
     * Performs utilities that are affected by the environment in which they are operating.
     *
    **/
    !(function($){
    sho.env.Utils = function()
    {
    	function getAbsoluteUrlForPath(path, protocol_, env_)
    	{
    	    var out,
    	        env=        sho.env.serverName(),
    	        protocol=   'http://',
    	        subdomain,
    	        domain =    ".sho.com"
    	    ;

    	    if((arguments.length > 1) && protocol_ && /https*/.test(protocol_))
    	    {
    	        protocol = protocol_;
    	    }

    	    if((arguments.length > 2) && env_ && /LOCAL|DEV|QA|POSTING|LIVE|WWW|ADMIN/.test(env_))
    	    {
    	        env = env_;
    	    }


            if( env == 'LIVE' || env == 'WWW' )
    	    {
    	        if(protocol == 'https://')
    	        {
    	            subdomain = 'secure';
    	        }
    	        else
    	        {
    	            subdomain = 'www';
    	        }

    	    }

            else if (env == 'DEV' || env == 'QA' || env == 'POSTING')
            {
                subdomain = env.toLowerCase()
    	    }

    	    else if ( env == 'LOCAL' )
    	    {
    	        domain = "localhost:8080";
    	        subdomain = '';
    	    }

    	    if(!sho.env.isLive() && protocol == 'https://')
    	    {
    	        protocol = 'http://';
    	    }

            out = protocol + subdomain + domain + path;
    	    return out;
    	}


    	return {
    		getAbsoluteUrl:getAbsoluteUrlForPath
    	}

    }();

    })(sho.$)

sho.loaded_modules['/lib/js/sho/env/utils.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/env.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.util
     * misc utility classes and helpers
    **/

    sho.provide('sho.util');


    /**
     * class sho.util.Cookies
     * Static utility class for reading/writing of cookies
    **/

	sho.util.Cookies = function()
	{

        /**
         * sho.util.Cookies.write(name,value,days) -> Null
         * Write a cookie, optionally supplying a duration in days.
         * Todo: check overwrite logic...
        **/
	    function write(name,value,days)
    	{
			if (days)
			{
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		}
        /**
         * sho.util.Cookies.read(name) -> String
         * Read a cookie and return the value
        **/
		function read(name)
		{
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		}
        /**
         * sho.util.Cookies.clear(name) -> null
         * Delete a cookie. Aliased as sho.util.Cookies.erase
        **/
		function erase(name)
		{
			write(name,"",-1);
		}

        return {
            write:write,
            read:read,
            erase:erase,
            clear:erase
        }
	}()

sho.loaded_modules['/lib/js/sho/util/cookies.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/util.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * sho.order
     * the main namespace for order/aquisition functionality
    **/

    sho.provide('sho.order');

    sho.provide('sho.order.providers');
    sho.order.providerData = sho.order.providers = [
    {
		name:'Adams Cable TV',
		category:'Cable2',
		url:'http://www.adamscable.com/premium.php',
		url_hd:'http://www.adamscable.com/premium.php'
	},
	{
		name:'Advanced Cable TV',
		category:'Cable2',
		url:'http://www.advancedcable.net/premium.html',
		url_hd:'http://www.advancedcable.net/premium.html'
	},
	{
		name:'Allegiance Communications',
		category:'Cable2',
		url:'http://www.allegiance.tv/index.php',
		url_hd:'http://www.allegiance.tv/'
	},
	{
		name:'Antietam Cable TV',
		category:'Cable2',
		url:'http://www.antietamcable.com/ ',
		url_hd:'http://www.antietamcable.com/digitaltv/hdtv.html '
	},
	{
		name:'Armstrong',
		category:'Cable2',
		url:'http://www.armstrongonewire.com/television/premium-channels.aspx',
		url_hd:'http://www.armstrongonewire.com/television/premium-channels.aspx'
	},
	{
		name:'Astound',
		category:'Cable2',
		url:'http://www.astound.net',
		url_hd:'http://www.astound.net'
	},
	{
		name:'ATMC ',
		category:'Cable2',
		url:'http://www.atmc.net/res/cable-premiummovies.aspx',
		url_hd:'http://www.atmc.net/res/cable-premiummovies.aspx'
	},
	{
		name:'AT&amp;T U-verse',
		category:'Telco',
		url:'https://www.att.com/olam/loginAction.olamexecute?pId=U_PassThru_UcomShowtime',
		url_hd:'https://www.att.com/olam/loginAction.olamexecute?pId=U_PassThru_UcomShowtime'
	},
	{
		name:'Atlantic Broadband',
		category:'Cable2',
		url:'http://atlanticbb.com/for-home/tv/premium-channels',
		url_hd:'http://www.atlanticbb.com/pop_findservices.asp?site=atlantic'
	},
	{
		name:'Baja Broadband',
		category:'Cable2',
		url:'http://www.bajabroadband.com/',
		url_hd:'http://www.bajabroadband.com/'
	},
	{
		name:'BendBroadband',
		category:'Cable2',
		url:'http://www.bendbroadband.com/residential/index.asp?adct=2',
		url_hd:'http://www.bendbroadband.com/residential/index.asp?adct=2'
	},
	{
		name:'Blue Ridge Communications',
		category:'Cable2',
		url:'http://www.brctv.com/tv/showtimetmc',
		url_hd:'http://www.brctv.com/tv/showtimetmc'
	},
	{
		name:'Bresnan',
		category:'Cable2',
		url:'http://www.bresnan.com/',
		url_hd:'http://www.bresnan.com/hd101/'
	},
	{
		name:'Bright House Networks',
		category:'Cable1',
		url:'http://www.mybrighthouse.com/corporate.aspx',
		url_hd:'http://www.mybrighthouse.com/areas_we_serve/default.aspx'
	},
	{
		name:'Broadstripe',
		category:'Cable2',
		url:'http://www.broadstripe.com/',
	},
	{
		name:'Buckeye Cablevision',
		category:'Cable2',
		url:'http://orderservices.buckeyecablesystem.com/',
		url_hd:'http://www.buckeyecablesystem.com/hd/'
	},
	{
		name:'BVU (Bristol VA Utilities)',
		category:'Cable2',
		url:'http://www.bvu-optinet.com/',
		url_hd:'http://www.bvu-optinet.com/'
	},
	{
		name:'Cable One',
		category:'Cable2',
		url:'http://www.cableone.net/Pages/default.aspx',
		url_hd:'https://www.cableone.net/FYH/Pages/cabletvservices.aspx'
	},
	{
		name:'CenturyLink Prism',
		category:'Cable2',
		url:'http://www.centurylink.com/prismtv/#index.html',
		url_hd:'http://www.centurylink.com/prismtv/#index.html'
	},
	{
		name:'Charter',
		category:'Cable1',
		url:'https://www.charter.com/browse/browse-bundles/bundles?cmp=rdo_showtime',
		url_hd:'https://connect.charter.com/showtime2/'
	},
	{
		name:'Choice Cable TV',
		category:'Cable2',
		url:'http://www.choicecable.com',
		url_hd:'http://www.choicecable.com'
	},
	{
		name:'Cincinnati Bell Fioptics',
		category:'Cable2',
		url:'http://www.cincinnatibell.com/fioptics',
		url_hd:'http://www.cincinnatibell.com/fioptics	'
	},
	{
		name:'Click Network',
		category:'Cable2',
		url:'http://www.click-network.com/',
		url_hd:'http://www.clickcabletv.com/CableTV/ClickHDTV/tabid/69/Default.aspx'
	},
	{
		name:'Comcast Xfinity',
		category:'Cable1',
		url:'http://www.comcast.com/Corporate/Learn/DigitalCable/showtime.html',
		url_hd:'http://www.comcast.com/Corporate/Learn/DigitalCable/showtime.html'
	},
	{
		name:'Comporium Communications',
		category:'Cable2',
		url:'http://www.comporium.com/',
		url_hd:'http://www.comporium.com/'
	},
	{
		name:'Consolidated Communications',
		category:'Cable2',
		url:'http://www.consolidated.com/merger/?from=cci&return=%2F',
		url_hd:'http://www.surewest.com/DigitalTV/'
	},
	{
		name:'Cox',
		category:'Cable1',
		url:'http://ww2.cox.com/residential/tv/premium-channels.cox',
		url_hd:'http://ww2.cox.com/residential/tv/premium-channels.cox'
	},
	{
		name:'DIRECTV',
		category:'Sat',
		url:'http://www.directv.com/sho',
		url_hd:'http://www.directv.com/sho'
	},
	{
		name:'DIRECTV Puerto Rico',
		category:'Sat',
		url:'http://www2.directvpr.com/programacion/showtime',
		url_hd:'http://www2.directvpr.com/programacion/showtime'
	},
	{
		name:'DISH',
		category:'Sat',
		url:'http://www.mydish.com/upgrades/premiums/showtime/',
		url_hd:'http://www.mydish.com/upgrades/premiums/showtime/'
	},
	{
		name:'Docomo Pacific',
		category:'Cable2',
		url:'http://www.docomopacific.com/',
		url_hd:'http://www.docomopacific.com/'
	},
	{
		name:'Eatel Video',
		category:'Cable2',
		url:'http://www.eatel.com/page.cfm?pid=18&tmp=2CA&menu=tv',
		url_hd:'http://www.eatel.com/page.cfm?pid=18&tmp=2CA&menu=tv'
	},
	{
		name:'Fidelity',
		category:'Cable2',
		url:'http://www.fidelitycommunications.com/',
		url_hd:'http://www.fidelitycommunications.com/cabletv/contentServer.php?cid=1197929116'
	},
	{
		name:'Frankfort Plant Board',
		category:'Cable2',
		url:'http://www.fewpb.com',
		url_hd:'http://www.fewpb.com/CableTelecom/HighDefinitionTV.aspx'
	},
	{
		name:'GCI',
		category:'Cable2',
		url:'http://www.gci.com/',
		url_hd:'http://www.gci.com/for-home/cable-tv-and-entertainment'
	},
	{
		name:'Google Fiber',
		category:'Cable2',
		url:'http://www.google.com/fiber/myfiber',
		url_hd:'http://www.google.com/fiber/myfiber'
	},
	{
		name:'Grande Communications',
		category:'Cable2',
		url:'http://www.grandecom.com/',
		url_hd:'http://www.grandecom.com/explore/cable/grande.php'
	},
	{
		name:'Hargray',
		category:'Cable2',
		url:'http://www.hargray.com/',
		url_hd:'http://www.hargray.com/'
	},
	{
		name:'HTC ',
		category:'Cable2',
		url:'http://www.htcinc.net/',
		url_hd:'http://www.htcinc.net/'
	},
	{
		name:'Innovative Cable TV',
		category:'Cable2',
		url:'http://www.innovativecable.com',
		url_hd:'http://www.innovativecable.com'
	},
	{
		name:'Inter-Mountain Cable',
		category:'Cable2',
		url:'http://www.imctv.com',
		url_hd:'http://imctv.com/digital_tv_hd.php'
	},
	{
		name:'Liberty Cablevision of PR',
		category:'Cable2',
		url:'http://www.libertypr.com/',
		url_hd:'http://www.libertypr.com/television/high-definition.aspx'
	},
	{
		name:'MCTV',
		category:'Cable2',
		url:'http://www.massilloncabletv.com/premium.php',
		url_hd:'http://www.massilloncabletv.com/premium.php'
	},
	{
		name:'Mediacom',
		category:'Cable1',
		url:'http://www.mediacomcable.com/home.html',
	},
	{
		name:'Mediastream',
		category:'Cable1',
		url:'http://www.mediastreamus.com',
		url_hd:'http://www.mediastreamus.com'
	},
	{
		name:'Metrocast',
		category:'Cable2',
		url:'http://www.metrocast.com/premium_channels.cfm',
		url_hd:'http://www.metrocast.com/premium_channels.cfm'
	},
	{
		name:'Midcontinent Communications',
		category:'Cable2',
		url:'http://www.midcocomm.com/',
		url_hd:'http://www.midcocomm.com/cable/hd/'
	},
	{
		name:'Mid-Hudson Cable',
		category:'Cable2',
		url:'http://www.mhcable.com',
		url_hd:'http://www.mhcable.com'
	},
	{
		name:'NewWave Communications',
		category:'Cable2',
		url:'http://www.newwavecom.com/premium-channels/',
		url_hd:'http://www.newwavecom.com/premium-channels/'
	},
	{
		name:'Northland Cable Television',
		category:'Cable2',
		url:'http://northlandcommunications.com/',
		url_hd:'http://northlandcommunications.com/services/cable/default.asp?atype=&area=&office=&rtCtr='
	},
	{
		name:'Optimum',
		category:'Cable1',
		url:'http://optimum.com/digital-cable-tv/movie-channels/showtime.jsp',
		url_hd:'http://www.optimum.com/order/triple_play.jsp'
	},
	{
		name:'RCN',
		category:'Cable1',
		url:'http://www.rcn.com/digital-cable-tv/digital-extras/premium-channels?bid=showtime-order-landing-pick-your-provider-rcn',
		url_hd:'http://www.rcn.com/digital-cable-tv/digital-extras/premium-channels?bid=showtime-order-landing-pick-your-provider-rcn'
	},
	{
		name:'Service Electric Broadband Cable',
		category:'Cable2',
		url:'http://www.secable.com/index.php',
		url_hd:'http://www.secable.com/sparta/enhanced-cable.html'
	},
	{
		name:'Service Electric Cablevision',
		category:'Cable2',
		url:'http://www.secv.com',
		url_hd:'http://www.secv.com/prod_hdtv.html'
	},
	{
		name:'Service Electric Cable TV',
		category:'Cable2',
		url:'http://www.sectv.com/',
		url_hd:'http://www.sectv.com/LV/hdtv.html'
	},
	{
		name:'Shentel',
		category:'Cable2',
		url:'http://www.shentel.net ',
		url_hd:'http://www.shentel.net '
	},
	{
		name:'Suddenlink',
		category:'Cable2',
		url:'http://www.suddenlink.com/television/',
		url_hd:'http://www.suddenlink.com/contact-us/'
	},
	{
		name:'Time Warner Cable',
		category:'Cable 1',
		url:'http://www.timewarnercable.com/en/residential-home/tv/premium-channels.html',
		url_hd:'http://www.timewarnercable.com/en/residential-home/tv/premium-channels.html'
	},
	{
		name:'Verizon FiOS',
		category:'Telco',
		url:'http://www22.verizon.com/home/fiostv/premiumchannels/',
		url_hd:'http://www22.verizon.com/home/fiostv/premiumchannels/'
	},
	{
		name:'Wave',
		category:'Cable2',
		url:'http://www.wavebroadband.com/',
		url_hd:'http://www.wavebroadband.com/art.php?id=hdtv'
	},
	{
		name:'Wave Vision',
		category:'Cable2',
		url:'http://www.wavevision.com/',
		url_hd:'http://www.wavevision.com'
	},
	{
		name:'WOW - Wide Open West',
		category:'Cable2',
		url:'http://www.wowway.com/',
		url_hd:'http://www.wowway.com/'
	},
	{
		name:'Zito Media',
		category:'Cable2',
		url:'http://www.zitomedia.com',
		url_hd:'http://www.zitomedia.com'
	}];
sho.loaded_modules['/lib/js/sho/order/providers.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.provide('sho.order.AffiliateTracking');
sho.order.AffiliateTracking = {

    'defaultURL' : 'https://4886848.fls.doubleclick.net/activityi;src=4886848;type=',

    'floodlight_tracking' : {
        '92' : [ // apple
            {
                'type' :        'showt0',
                'category' :    'shoco000'
            }
        ],
        '93' : [ // roku
            {
                'type' :        'showt0',
                'category' :    'shoco001'
            }
        ],
        '94' : [ // sony
            {
                'type' :        'showt0',
                'category' :    'shoco003'
            }
        ],
        '95' : [ // hulu
            {
                'type' :        'showt0',
                'category' :    'shoco002'
            }
        ],
        'tv_providers' : [ // default/traditional tv providers
            {
                'type' :        'showt0',
                'category' :    'shoco00'
            }
        ]
    },

    trackAndRedirectToAffiliate : function(id, url)
    {
        this.makeFloodLightImpression(id);
        _.delay(this.redirect, 750, url);
    },

    makeFloodLightImpression:function(id)
    {
        var data = (this.floodlight_tracking[id] ? this.floodlight_tracking[id] : this.floodlight_tracking['tv_providers']);

        _.each(data, function(impression) {
            var type = impression.type,
                cat =  impression.category,
                url = (impression.url ? impression.url : this.defaultURL),
                axel = Math.random() + "",
    		    a = axel * 10000000000000
    		;
    		sho.dom.body().append(['',
    		    '<iframe src="', url, type, ';', 'cat=', cat,';ord=1;num=', a ,
    		        '?" width="1" height="1" frameborder="0" style="display:none">',
    		    '</iframe>',
    		''].join(''));
        }, this);
    },

    redirect:function(url)
    {
        window.top.location.href = url;
    }
}

sho.loaded_modules['/lib/js/sho/order/affiliatetracking.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/order.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * sho.analytics
     * namespace for analytics/page tracking.
    **/



/**
 * class sho.analytics.PageTracker
 * Wrapper around OmniTure SiteCatalyst library code. Provides single integration point for
 * performing analytics. The PageTracker is designed to be framework-independent and can be loaded
 * outside of the sho library for vendor contexts.
 *
 * For instructions on how to set up analytics see the [Analytics Readme](/sho/analytics/readme/showtime)
**/

var sho = sho || {}; sho.analytics = sho.analytics || {};

sho.analytics.PageTracker = function(cfg)
{
    this._KLASS_ = 'sho.analytics.PageTracker';
    this.debug = cfg.debug || false;
    this.console = cfg.console || 'console'; // 'html|console'
    if(cfg.platform !== undefined) this.platform = cfg.platform; // desktop|tablet|mobile'
    this.no_scode_error_msg = 'Error: Omniture\'s s_code.js is missing. Please add it to the <body> tag.';
    this.data = {};
    this.terminal = false;
    this.isAuth = false;
    this.terminal_style = [
		'position:fixed',
		'left:0',
		'bottom:0',
		'z-index:999999',
		'padding:4px 8px 4px 8px',
		'font-family:\'Courier New\', Courier, monospace',
		'font-size:11px',
		'background:#e1e1e1',
		'color:#000',
		'width:100%',
		'height:1em',
		'line-height:1em',
		'text-align:left',
		'border-top:1px solid #CCC'
	];
	this.closer_style = [
        'position:fixed',
        'font-weight:bold',
	    'border:#333 solid 2px',
        'text-align:center',
        'cursor:pointer',
        'height:1em',
        'width:1em',
        'bottom:2px',
        'right:12px'
    ];
    this.custom_insight_variable_map = {
        'subscriptions' :           37,
        'gender':                   38,
        'is_showtime_subscriber':   39,
        'is_authenticated':         40,
        'is_gamified':              41
    };

    if (!window.omniture_rsid) {
        window.omniture_rsid = "cbsshocom,cbsshoglobal";
    }
	this.omniture_rsid = window.omniture_rsid; // global variable set in layout_loader.jsp; production: 'cbsshocom'; // dev: 'cbsdevshowtimenet'

    this.init();
};

sho.analytics.PageTracker.prototype = {

    init:function()
    {
        if(this.ensureSCode()) this.populate();
    },

    populate:function()
    {
        this.platformKey = this.getPlatform();
        this.readMetaTags();
        this.buildTrackingObject();
    },

    ensureSCode:function()
    {
        if(!this.sCodeInDocument())
        {
            alert(this.no_scode_error_msg); return false;
        }
        else
        {
            return true;
        }
    },

    getPlatform:function()
    {

        var platform, key;

        if(sho.env && sho.env.platform) platform = sho.env.platform().key;
        else platform = 'unknown';

        switch (this.platform || platform) {
           case 'desktop':
              key = 'd:';
              break;

           case 'mobile':
              key = 'm:';
              break;

           case 'tablet':
              key = 't:';
              break;

           default:
              key = 'u:';
              break;
        }
        return key;
    },

    sCodeInDocument:function()
    {
        return (typeof s !== 'undefined');
    },

    readMetaTags:function()
    {
        var i,
            metas = document.getElementsByTagName('meta'),
            length = metas.length,
            page=false,
            props=false,
            name = ''
        ;

        for(i=0; i<length; i++)
        {
            name = metas[i].getAttribute('name');
            if(name == 'page-tracking') page = metas[i].getAttribute('content');
            if(name == 'page-tracking-custom-insight-vars') props = metas[i].getAttribute('content');
            if(page && props) break;
        }
        this.data.page = page;
        this.data.props = props;
    },

    buildTrackingObject:function()
    {
        if(!this.data.page) return false;

        s.pageName = this.data.page;
        s.eVar20="D=pageName"; // sets to dynamic variable in image request
        s.hier1 = this.data.page;
        s.linkTrackVars="eVar20,eVar52,events"
        s.linkTrackEvents="event3"

        if(this.platform) s.channel = this.platform;

        var i=1, sProps = this.data.page.split(':'); while(sProps.length)
        {
            this.setCustomInsightVariable(i, sProps.shift()); i++;
        }

        if(this.data.props)
        {
            var pair='', collection = this.data.props.split(',');
            for(i=0; i<collection.length; i++)
            {
                pair = collection[i];
                if(pair.indexOf('=') > - 1)
                {
                    this.setCustomInsightVariable(pair.split('=').shift(), pair.split('=').pop());
                }

            }
        }

        if(sho.util && sho.util.Cookies)
        {
            var c = sho.util.Cookies,

            isAuth = c.read('sho_user_authenticated') == 'true',

            explicitUnknown = (function(property) {
                if(property == undefined || property == null || property.match(/undefined|null/)) {
                    return isAuth ? 'unknown' : 'anonymous';
                }
                else {
                    return property
                }
            }),

            subs = explicitUnknown(c.read('sho_user_subscriptions'));
            this.setCustomInsightVariable(37, (subs == '' || subs == 'unknown') ? 'none' : subs);                              // '24,56', none, anonymous
            this.setCustomInsightVariable(38, explicitUnknown(c.read('sho_user_gender')));              // 'male', 'female', 'unknown', 'anonymous'
            this.setCustomInsightVariable(39, explicitUnknown(c.read('sho_user_showtime_subscriber'))); // 'true','false','unknown','anonymous'
            this.setCustomInsightVariable(40, isAuth);                                                  // true,false
            this.setCustomInsightVariable(41, explicitUnknown(c.read('sho_user_is_gamified')));         // 'true','false','unknown','anonymous'
        }

        this.setCustomInsightVariable(42, s.getPreviousValue(s.pageName,'s_ppn')); //prop42: prev page name
        var ppv = s.getPercentPageViewed(s.pageName); //get array of data on prev page % viewed

        if( ppv && typeof ppv=='object' && ppv[0] == s.prop42 ) { //if ppv array returned and prev page id matches prev page name
            this.setCustomInsightVariable(43, (ppv[1] + '|' + ppv[2])); //prop43: prev page max and initial % viewed, delimited by "|".
            this.setCustomInsightVariable(44, (ppv[4] + 'x' + ppv[5])); //prop44: viewport width x height in CSS pixels
            this.setCustomInsightVariable(45, (ppv[6] + 'x' + ppv[7])); //prop45: display width x height in real pixels
            this.setCustomInsightVariable(46, ppv[8]); //prop46: pixel density, i.e. number of virtual pixels per real pixel
            this.setCustomInsightVariable(47, ppv[9]); //prop47: device orientation: initial and final (final only present if rotation occurred)
        }

        this.isAuth = (isAuth ? 'true' : 'false'); // strings needed for proper eVar tracking
    },

    addCustomEvents:function()
    {
        for (var i=0, j=arguments.length; i < j; i++){
           s.events = (s.events != '' ? s.events + ',' : '') + 'event' + arguments[i];
           s.linkTrackEvents = (s.linkTrackEvents != '' ? s.linkTrackEvents + ',' : '') + 'event' + arguments[i];
        }
    },

    setCustomEVar:function(index, value)
    {
        var eVar = 'eVar' + index;
        s[eVar] = value;
        s.linkTrackVars += ',' + eVar;
        this.trace(eVar + ': ' + value);
    },

    setCustomInsightVariable:function(index,value)
    {
        s['prop' + index ] = value;
    },

    getCustomInsightVariable:function(index)
    {
        return s['prop' + index ];
    },

    resetVariables:function()
    {
        s.events = '';
        s.linkTrackEvents='';
        s.linkTrackVars='';
    },


    /**
     * sho.analytics.PageTracker#trackPageView([CustomParams]) -> null
     * Make a page-level impression. By default, the PageTracker will inspect the dom for custom meta tags containing the impression data.
     * Alternatively, you can provide a [config object](/sho/analytics/readme/showtime) to shape the impression at runtime.
     *
    **/
    trackPageView:function()
    {
        if(arguments.length > 0) this.trackPageViewWithCustomParameters(arguments[0])
        else this._trackPageView();
    },

    trackPageViewWithCustomParameters:function(cfg)
    {
        this.data.page = cfg.page;
        this.data.props = cfg.props;
        this.buildTrackingObject();
        this._trackPageView();
    },

    _trackPageView:function()
    {
        s.events = '';
        s.linkTrackEvents='';
        this.addCustomEvents(3);

        s.linkTrackVars="events,eVar20,eVar52,eVar53";
        this.setCustomEVar(15,this.isAuth);

	    var s_code=s.t(); if(s_code) document.write(s_code);

        if(this.debug) {
            this.trace(s.pageName);
        }

        this.resetVariables();
    },

    /**
     * sho.analytics.PageTracker#trackClick([CustomParams]) -> null
     * Capture an in-page custom link. By default, the PageTracker will inspect the dom for custom meta tags containing the impression data.
     * Alternatively, you can provide a [config object](/sho/analytics/readme/showtime) to shape the impression at runtime.
    **/
    trackClick:function(cfg)
    {
        this._trackClick(cfg || {});
    },

    _trackClick:function(cfg)
    {
        var page = cfg.page || this.data.page // || document.location.pathname,
            click = cfg.click,
            linkId = ''
        ;
        if(!page || click == '' || click == undefined) return

        linkId = this.platformKey + page + ':'+ click;

        var s=s_gi(this.omniture_rsid);

        s.events = '';
        s.linkTrackEvents='';

		s.tl ( true, 'o', linkId );

        if(this.debug) this.trace(linkId);
    },

    /**
     * sho.analytics.PageTracker#trackEvent([CustomParams]) -> null
     * Capture an in-page custom event. By default, the PageTracker will inspect the dom for custom meta tags containing the impression data.
    **/
    trackEvent:function(cfg)
    {
        this._trackEvent(cfg || {});
    },

    _trackEvent:function(cfg)
    {
        var page = cfg.page || this.data.page,
        context = cfg.eventContext,
        label = cfg.eventLabel,
        el = cfg.element;

        if(label == '' || label == undefined) return;

        if (!context) {
            var contextEl = sho.$(el).closest('[data-event-context]');
            if (!contextEl) return;
            context = sho.dom.data.read(contextEl, 'eventContext');
        }

        if (!context) return;

        var s=s_gi(this.omniture_rsid);

        s.events = '';
        s.linkTrackEvents='';
        s.linkTrackVars='eVar20,events';

        this.setCustomEVar(6,context); // cta context/location string
        this.setCustomEVar(51,label); // cta label/text string
        if(cfg.providerId) this.setCustomEVar(100,cfg.providerId); // set provider ID for order links

        this.addCustomEvents(63); // default cta event

        if(cfg.customEvent) {
            var customEvents = [];
            cfg.customEvent = cfg.customEvent.toString();

            if (cfg.customEvent.indexOf(',') > -1) {
                customEvents = cfg.customEvent.split(',');
            }
            else { customEvents[0] = cfg.customEvent; }

            _.each(customEvents, function(value) {
              this.addCustomEvents(value);
            }, this);
        }

        s.tl(true,'o');

        if(this.debug) {
            this.trace('custom events: ' + s.events);
        }

        s.events = '';
        s.linkTrackEvents='';
        s.linkTrackVars='';
    },

    /**
     * sho.analytics.PageTracker#trackForm([CustomParams]) -> null
     * work in progress, currently only called in order announcement page JS, no data behaviors yet
    **/
    trackForm:function(cfg)
    {
        this._trackForm(cfg || {});
    },

    _trackForm:function(cfg)
    {
        var formName = cfg.name,
        formEvent = cfg.event;

        if(formEvent == '' || formEvent == undefined) return;

        var s=s_gi(this.omniture_rsid);

        s.events = '';
        s.linkTrackEvents='';
        s.linkTrackVars='eVar20,events';

        this.setCustomEVar(80,formName);

        switch(formEvent) {
            case 'submit':
                this.addCustomEvents(102);
                break;
            case 'success':
                this.addCustomEvents(103);
                break;
            case 'error':
                this.addCustomEvents(104);
                break;
        }

        s.tl ( true, 'o' );

        if(this.debug) {
            this.trace('custom events: ' + s.events);
        }

        this.resetVariables();
    },

    trace:function(str)
    {
        if(this.console == 'console' && window.console && window.console.log)
        {
            console.log('|pagetracker| '+str);
        }
        else
        {
            if(!this.terminal)
            {
                this.drawTerminal(str);
            }
            else
            {
                this.terminal.innerHTML = str
            }
        }
    },

    drawTerminal:function(str)
    {
        var container = document.createElement('div'),
            text = document.createTextNode(str),
            closer = document.createElement('div'),
            body = (!!sho.body ? sho.body() : document.getElementsByTagName('body')[0])
        ;
        body.appendChild(container);
        container.appendChild(text);
        closer.appendChild(document.createTextNode('x'));
        closer.style.cssText = this.closer_style.join(' !important;');
        closer.onclick = function(e){ body.removeChild(this.parentNode); }
        container.appendChild(closer);
        container.id = 'sho-analytics-page-tracker';
        container.style.cssText = this.terminal_style.join(' !important;');
        this.terminal = container;
    }

};

/**
 * sho.analytics.getTracker([config]) -> Klass
 * A singleton-style constructor and convenience alias, meant to mimic the google analytics api. Returns an instance of the PageTracker.
 * This method accepts an optional config object which can be used to [set the debugging mode](/sho/analytics/readme/showtime) or force a refresh of the impression data. (A reload)
 *
 *      var t = sho.analytics.getTracker();
 *      var t = sho.analytics.getTracker({
 *      	'debug' : true,
 *      	'console' : 'html',
 *          'platform' : sho.env.getPlatform(),
 *          'reload' : true
 *      });
**/
sho.analytics.getTracker = sho.analytics.getPageTracker = (function(cfg)
{
    var cfg = cfg || {};

    if(sho.analytics._page_tracker_ == null)
    {
        sho.analytics._page_tracker_ = new sho.analytics.PageTracker(cfg);
    }
    else
    {
        if(cfg.debug !== undefined)     sho.analytics._page_tracker_.debug = cfg.debug;
        if(cfg.console !== undefined)   sho.analytics._page_tracker_.console = cfg.console;
        if(cfg.platform !== undefined)  sho.analytics._page_tracker_.platform = cfg.platform;
        if(cfg.reload)                  sho.analytics._page_tracker_.populate()
    }
    return sho.analytics._page_tracker_;
})

/**
 * sho.analytics.getData() -> Object
 * Accessor for the PageTracker's internal data hash. Used for debugging, when you want to inspect the current state of the tracker.
**/
sho.analytics.getData = (function(){
    return sho.analytics.getPageTracker().data
})


sho.loaded_modules['/lib/js/sho/analytics/pagetracker.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	sho.provide('sho.analytics');

	sho.analytics.campaign = function($)
	{
        var campaignValue;

        function initialize()
        {
            var queryParams = getQueryParams();

            campaignValue = (queryParams['s_cid'] ? queryParams['s_cid'] : getCampaignCookie());

            if(campaignValue) updateLinks();
        }

        function getCampaignCookie()
        {
            return sho.util.Cookies.read('gvo_campaign');
        }

        function getQueryParams()
        {
            var vars = [], hash;
                var q = document.URL.split('?')[1];
                if(q != undefined){
                    q = q.split('&');
                    for(var i = 0; i < q.length; i++){
                        hash = q[i].split('=');
                        vars.push(hash[1]);
                        vars[hash[0]] = hash[1];
                    }
            }

            return vars;
        }

        function updateLinks()
        {
            var links = $('a[href*="showtime.com"]');

            $.each(links, function(i, link){
                var contains_s_cid = /s_cid/.test(link.href);
                if (contains_s_cid) return false; // s_cid already present in link, so move on

                var contains_any_param = /\?.+\=/.test(link.href);

                var op = (contains_any_param ? '&' : (/com\/$/.test(link.href) ? '?' : '/?'));

                link.href += op + 's_cid=' + campaignValue;
            });
        }

        return {
            init:initialize
        }

	}(sho.$)

	sho.dom.ready(sho.analytics.campaign.init);
sho.loaded_modules['/lib/js/sho/analytics/campaign.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/analytics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.provide('sho.ui');
    sho.provide('sho.ui.mobile');


    /**
     * sho.social
     * namespace for social functionality
    **/

    sho.provide('sho.social');


    /**
     * sho.social.components
     * namespace for social components
    **/

    sho.provide('sho.social.components');


    /**
     * sho.social.helpers.components.renderComponents(el) -> el
     * Given a container element, render the social sharing components that are marked up inside.
     * this is lifted from the video overlay player, which has similar challenges.
     *
     * expects this markup:
     *
     * <div class="some-parent-container">
     *      <div class="share-components group social-sharing">
     *          <div class="share-component twitter first">
     *              <a href="https://twitter.com/share" class="twitter-share-button" data-count="none" data-url="{{shareUrl}}">Tweet</a>
     *           </div>
     *          <div class="share-component">
     *              <div class="google-plus" data-href="{{shareUrl}}">g</div> // placeholder only
     *          </div>
     *      	<div class="share-component fb">
     *      		<div id="video-fb-like" class="fb-like" data-href="{{shareUrl}}" data-send="false" data-layout="button_count" data-show-faces="false" data-font="arial"></div>
     *          </div>
     *      </div>
     * </div>
     *
     * css styles for this are in /lib/css/sho/social.css, which are most likely shared with the video player and order page.
    **/

    !function($)
    {
        sho.social.components.view = sho.social.components_view = ['',

            '<div class="share-components group social-sharing">',
                '<div class="share-component twitter first">',
                    '<a href="https://twitter.com/share" class="twitter-share-button" data-count="none" data-text="{{shareText}}" data-url="{{shareUrl}}">Tweet</a>',
                 '</div>',
                '<div class="share-component">',
                    '<div class="google-plus" data-href="{{shareUrl}}">g+1</div>', // placeholder only
                '</div>',
    			'<div class="share-component fb">',
    				'<div id="video-fb-like" class="fb-share-button" data-href="','{{shareUrl}}','" data-send="false" data-type="button_count" data-show-faces="false" data-font="arial"></div>',
                '</div>',
            '</div>',

        ''].join('');

        sho.social.components.render = sho.social.renderComponents = (function(el, data)
        {
            var container = $(el).find('.social-sharing'),
            fbElement,
            googElement,
            data = data || {}
            ;

            if(!_.any(container)) return false

            twttr && twttr.widgets && twttr.widgets.load();

            fbElement = container.find('.share-component.fb').get(0);
            fbElement && FB && FB.XFBML && FB.XFBML.parse(fbElement);

            googElement = container.find('.google-plus').get(0);
            if(!gapi || !googElement) return el;

            gapi.plusone.render(googElement, {
                'annotation' : 'none',
                'size'  :  'medium',
                'href'  :  (data.href || sho.dom.data.read(googElement, 'href') || 'http://www.sho.com'),
                'count' :  false,
                'callback' : (function(data){
                    if(data && data.state == 'on') sho.dom.trigger('google:plus_one:on', data)
                })
            });

            return el
    	})

	}(sho.$)

sho.loaded_modules['/lib/js/sho/social/components/helper.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/social/components.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.social.shareable
     * namespace for shareable functionality (send-as-email functionality)
    **/
    sho.provide('sho.social.shareable');

    sho.social.shareable.Model = Backbone.Model.extend({

        _KLASS_  : 'sho.social.shareable.Model',

        attributes : {
            recipientEmailAddresses : null,     // email of recipient, comma-delimmed list
            senderEmailAddress      : null,     // email of sender
            shareUrl                : null,     // the url to share, passed as hidden input
            message                 : null,     // the bodytext of the email, optional
            subject                 : null      // custom subject, also optional
        },

        validates_presence_of : [               // let's get it!
            'recipientEmailAddresses',
            'senderEmailAddress',
            'shareUrl'
        ],

        url : function(){
            return '/rest/share'
        },

        isNew:function()
        {
            return true;
        },

        parse:function(resp, xhr)
        {
            return resp.shareEmailForm
        },

        onSend:function(model,resp)
        {
            if(resp.success)
            {
                this.trigger('success');
            }
            else
            {
                if(resp.VALIDATION_ERROR)
                {
                    this.trigger('error', {}, // <-- need this empty psuedo-event object
                        this.collectServerErrors(resp.VALIDATION_ERROR)
                    );
                }
                if(resp.SYSTEM_ERROR) // this is testable locally when not using tunnel for send-mail, as email will fail
                {
                    var sysError = {
                        'isSystemError' : true,
                        'message' : resp.SYSTEM_ERROR //'Connection to Server failed'
                    };

                    this.trigger('error', sysError, [sysError])
                }
            }
        },

        validate:function(attrs)
        {
            var th=this, errors=[];  _(this.validates_presence_of).each(function(field){
                if(["",undefined].include(attrs[field])){
                    errors.push({
                        'field':    field,
                        'message':  'This can\'t be empty'  // "senderEmailAddress can't be empty" is actually less useful for us.. (was (field+' can\'t be blank'))
                    });
                }
            });
            if(errors.length) log('|shareable| validate failed '+errors.length+' errors');
            if(errors.length) return errors;
        },

        collectServerErrors:function(errors)
        {
            log('|shareable| server errors found:`'+errors.length+'`');
            return errors.collect(function(e){
                return {
                    'field':    e.field,
                    'message':  (/InValid Email Address Entered/.test(e.defaultMessage) ? 'This is invalid' : e.defaultMessage)
                }
            })
        },

        send:function(attrs, opts)
        {
            attrs = !!attrs && _.isObject(attrs) ? attrs : this.attributes;

            opts = opts || {};
            opts.success = opts.success || this.onSend.bind(this);


            this.save( _.pick(attrs, _.keys(this.attributes)), opts);
        }
    });


    sho.provide('sho.social.models')
    sho.social.models.Shareable = sho.social.shareable.Model;

    sho.provide('sho.social.Shareable');
    sho.social.Shareable.send = function(attrs, opts){
        var email = new sho.social.shareable.Model();
        email.send(attrs,opts);
    }



sho.loaded_modules['/lib/js/sho/social/shareable/model.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/social/shareable.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.social.livefyre
     * namespace for livefyre integration
    **/
    sho.provide('sho.social.livefyre');



    sho.social.livefyre.SDK = klass({

        _KLASS_ : 'sho.social.livefyre.SDK',

        livefyre_cfg : {
	          "collectionMeta" : "eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJ0aXRsZSI6IlRoZSBCb3JnaWFzIiwidXJsIjoiaHR0cDpcL1wvd3d3LnNoby5jb21cL3Nob1wvdGhlLWJvcmdpYXNcL3NvY2lhbGl6ZSIsInRhZ3MiOiJUaGUgQm9yZ2lhcywgQ29tbXVuaXR5LCBTb2NpYWxpemUsIFNvY2lhbCBNZWRpYSIsImNoZWNrc3VtIjoiMmZiNTRlMzAzYzBhNjE4OTJhNTRmZjc2ZGFhNThhYWYiLCJhcnRpY2xlSWQiOiI3NTRfMF8wIn0.lUHhmKzzIDe4bRDcpnFrMUifw9qhxKN6dGCJ5k4ifq0"
	        , "checksum" : "2fb54e303c0a61892a54ff76daa58aaf"
	        , "siteId" : "309979"
	    },

	    livefyre_comment_stream_el : "livefyre-comments",

        initialize:function(cfg)
        {
            if(!fyre || !fyre.conv) return

            _.extend(this, {
                'articleId' : cfg.articleId,
                'useDelegate' :  false,//(cfg.delegate || cfg.delegate == undefined),
                'commentStream' : (cfg.commentStream || cfg.commentStream == undefined)
            });

            this.useDelegate && this.initDelegate();
            this.initSDK();

        },

        initDelegate:function()
        {
		    sho.social.livefyre.getDelegate();
        },

        initSDK:function()
        {
            log('|sdk| commentStream=`'+ this.commentStream+'`');

            var cfg = _.extend({},
                this.livefyre_cfg,
                {'articleId':this.articleId},
                (this.commentStream ? {'el':this.livefyre_comment_stream_el} : {})
            ),
            sdk = {'app':'sdk'},
            useDelegate = this.useDelegate,
            conv = fyre.conv.load(
                {
                    "network": "sho.fyre.co"//,
                },
                [cfg,sdk],
                (function(widget,sdk){

                    sho.dom.trigger('livefyre:ready', sdk );

                    if(useDelegate) sho.social.livefyre.getDelegate().onReady(widget)
                })
            );
        }


    });

    /**
     * sho.social.livefyre.getDelegate(cfg) -> klass
     * Static, singleton-style constructor for SDK. Creates an instance of the SDK if one does not already exist,
     * otherwise returns the instance.
    **/
    sho.social.livefyre.getSDK = function(cfg)
    {
       var k = '_SDK_';
       if(!sho.social.livefyre[k]){ sho.social.livefyre[k] = new sho.social.livefyre.SDK(cfg || {}) }
       return sho.social.livefyre[k]
    };
sho.loaded_modules['/lib/js/sho/social/livefyre/sdk.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/social/livefyre.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.social.gigya
     * namespace for gigya integration
    **/
    sho.provide('sho.social.gigya');


    /**
     * sho.social.gigya.connectionmanager
     * namespace for gigya social connection manager widget
    **/
    sho.provide('sho.social.gigya.connectionmanager');


    /**
     * class sho.social.gigya.connectionmanager.Model
     * model for connectionmanager
    **/

    sho.social.gigya.connectionmanager.Model = Backbone.Model.extend({

        _KLASS_ : 'sho.social.gigya.connectionmanager.Model',

        labels : {
            'connected' : 'Account : Linked',
            'not_connected' : 'Account : Not Linked'
        },

        initialize : function(cfg)
        {
            log('hello from '+this._KLASS_);
            _.extend(this, {
                'connections' : {},
                'fn' : {
                    'loadConnections' : _.bind(this.loadConnections, this),
                    'onApi' : _.bind(this.onApi, this)
                }
            })

            this.loadConnections();
        },

        loadConnections:function()
        {
            this.api('socialize', 'getUserInfo');
        },

        setConnection:function(opts)
        {
            this.connections[opts.providerName] = opts.connected;
            this.trigger('connection:changed', opts);
        },

        addOrRemoveConnection:function(operation, provider)
        {
            this.api('socialize', (operation+'Connection'), {'provider':provider})
        },

        api:function(module, method, opts)
        {
            if(!gigya || !gigya[module]) return false;

            log('|manager| api => gigya.'+module+'#'+method + ' '+(JSON.stringify(opts||{})));

            opts = opts || {};
            opts.callback = opts.callback || this.fn.onApi;
            gigya[module][method].call(gigya[module], opts)
        },

        onApi:function(xhr)
        {
            var th=this,
                success = xhr.errorCode == 0,
                operation = xhr.operation,
                providerList,
                provider,
                userName
            ;
            if(success)
            {
                if(/(add|remove)Connection/.test(operation))
                {
                    provider = xhr.requestParams.provider;
                    userName = this.getUserNameFromIdentity(provider, xhr.user);

                    this.setConnection({
                        'providerName' : provider,
                        'connected' :    operation.split('Connection')[0] == 'add',
                        'username' :     userName
                    })
                }

                if(operation == 'getUserInfo')
                {
                    providerList = xhr.user.providers || []; _.each(providerList, function(provider){
                        th.setConnection({
                            'providerName' : provider,
                            'connected' :    true,
                            'username' :     th.getUserNameFromIdentity(provider, xhr.user)
                        });
                    });

                    log('|manager| providers= '+ providerList.join(', '));
                }
            }
            else
            {
                log(xhr);
                log('error: problem w/ gigya, while attempting '+operation);
            }
        },

        getUserNameFromIdentity:function(provider, data)
        {
            if(!data.identities || !data.identities[provider]) return false;

            return data.identities[provider].email || data.identities[provider].nickname;
        }

    });


sho.loaded_modules['/lib/js/sho/social/gigya/connectionmanager/model.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($){
    /**
     * class sho.social.gigya.connectionmanager.View
     * view class for weapper around api calls to manage social connections w/ gigya
    **/

    sho.social.gigya.connectionmanager.View = klass({

        _KLASS_ : 'sho.social.gigya.connectionmanager.View',

        initialize : function(cfg)
        {

            _.extend(this, {
                'container' : $(cfg.container),
                'model' : cfg.model,
                'fn' : {
                    'onConnectionClicked' : _.bind(this.onConnectionClicked, this),
                    'updateProviderState' : _.bind(this.updateProviderState, this)
                }
            })

            this.setHandlers();
        },

        setHandlers:function()
        {
            this.container.on('click', '.add-connection',       this.fn.onConnectionClicked);
            this.container.on('click', '.remove-connection',    this.fn.onConnectionClicked);
            this.model.bind('connection:changed',               this.fn.updateProviderState);
        },


        updateProviderState:function(e)
        {
            var k = e.providerName == 'googleplus' ? 'google' : e.providerName,
                el = this.getElementFromProvider(k)          // log('|view| updateProviderState el='+el+' isConnected='+isConnected);
            ;
            if(e.connected)
            {
                el.addClass('connected');
                this.updateLabel(el, e)
            }
            else
            {
                el.removeClass('connected');
                this.updateLabel(el, e)
            }
        },

        updateLabel:function(el, e)
        {
            el.find('.connection-status').html(['',
                'Account: ',
                (
                    e.connected ?
                            (e.username ? e.username : 'Linked') : 'Not Linked'
                ),
            ''].join(''))
        },


        onConnectionClicked:function(e)
        {
            sho.dom.trap(e);

            var el =        e.currentTarget,
                operation = /(add|remove)-connection/.exec(el.className)[1],
                provider =  this.getProviderFromElement($(el).parent().get(0))
            ;

			var upperCaseProvider = provider.split('')[0].toUpperCase() + provider.slice(1);

            if(operation == 'add')
            {
                this.model.addOrRemoveConnection('add', provider)
            }
            else
            {
                sho.ui.Modal({
					'type'    : 'confirm',
        		    'title'   : 'Unlink Account',
        		    'message' : 'Are you sure you want to unlink your '+upperCaseProvider+' account from your Showtime account?',
        		    'submit'  : {
        		        'label' : 'Unlink Account',
        		        'click' : _.bind(this.model.addOrRemoveConnection, this.model, 'remove', provider)
        		    }
        		});
            }
        },

        getProviderFromElement:function(el)
        {
            return sho.dom.data.read(el, 'provider')
        },

        getElementFromProvider:function(provider)
        {
            return this.container.find('li.provider-'+provider)
        }

    });

    }(sho.$)

sho.loaded_modules['/lib/js/sho/social/gigya/connectionmanager/view.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.social.gigya.connectionmanager.Widget
     * wrapper around api calls to manage social connections w/ gigya
    **/
    sho.social.gigya.connectionmanager.Widget = klass({

        _KLASS_ : 'sho.social.gigya.connectionmanager.Widget',

        initialize : function(cfg)
        {

            this.model = new sho.social.gigya.connectionmanager.Model({});
            this.view =  new sho.social.gigya.connectionmanager.View({
                'container' : cfg.container,
                'model' : this.model
            });
        }



    });

    sho.social.gigya.ConnectionManager = sho.social.gigya.connectionmanager.Widget;

sho.loaded_modules['/lib/js/sho/social/gigya/connectionmanager/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/social/gigya/connectionmanager.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.social.gigya.tests
     * namespace for gigya social connection manager widget
    **/
    sho.provide('sho.social.gigya.tests');



    !function($){
    /**
     * class sho.social.gigya.tests.Suite
     * workspace for simple gigya api tests
    **/

    sho.social.gigya.tests.Suite = klass({

        _KLASS_ : 'sho.social.gigya.tests.Suite',

        initialize : function(cfg)
        {
            log('hello from '+this._KLASS_);

            var c = $(cfg.container);
            _.extend(this, {
                'container' : c,
                'left' : c.find('.left'),
                'terminal' : c.find('.right pre'),
                'fn' : {
                    'onApi' : _.bind(this.onApi, this),
                    'callMethod' : _.bind(this.callMethod, this)
                }
            })

            this.initMenu()
        },

        initMenu:function()
        {
            this.left.append('<div id="api-inspector"></div>');
            var options = [
				"addConnection - facebook",
				"addConnection - twitter",
                "addConnection - google",

				"removeConnection - facebook",
				"removeConnection - twitter",
                "removeConnection - google",

				"getUserInfo",
				"showAddConnectionsUI"
			],
                menu = new sho.ui.menu.DropDown({
				id:'api-inspector-obj',
				container:'api-inspector',
				title:'Select a Method',
				labels:_.collect(options,function(o){
				    return o.replace(/facebook/,'fb').replace(/twitter/,'tw').replace(/google/,'g+');
				}),
				values:options,
                onSelect:this.fn.callMethod
			});
        },

        callMethod:function(m)
        {
            var method,
                provider,
                opts = {}
            ;
            if(/(add|remove)Connection/.test(m))
            {
                method = m.split(' - ')[0];
                provider = m.split(' - ')[1];
                opts = { 'provider':provider };
            }
            else
            {
                method = m;
                opts = { 'includeAllIdentities':true }
            }
            this.api(method, opts);
        },

        api:function(method, opts)
        {
            var module = 'socialize';
            if(!gigya || !gigya[module]) return false;

            log('|manager| api => gigya.'+module+'#'+method + ' '+(JSON.stringify(opts||{})));

            opts = opts || {};
            opts.callback = opts.callback || this.fn.onApi;
            gigya[module][method].call(gigya[module], opts)
        },

        onApi:function(xhr)
        {
            var th=this,
                success = xhr.errorCode == 0,
                operation = xhr.operation,
                providerList,
                provider,
                userName,
                output
            ;
            log('operation: '+operation);
            log('success: '+success);
            log(xhr);

            output = [
                'success: ', success, "\n",
                'operation: ', this.linkify(operation), "\n",
                '-------------------------------------------------------------------',"\n",
                JSON.stringify(xhr, undefined, 2)
            ].join("")
            this.terminal.html(output)

        },


        linkify:function(method)
        {
            var url = 'http://developers.gigya.com/020_Client_API/010_Socialize/socialize.'+method;
            return '<a href="'+ url + '" target="_blank">' + method + '</a>';
        }

    });


    }(sho.$)

sho.loaded_modules['/lib/js/sho/social/gigya/tests/suite.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/social/gigya/tests.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/social/gigya.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.social.collection
     * namespace for social collection component
    **/
    sho.provide('sho.social.collection');



    /**
     * class sho.social.collection.Model
     * component for rendering a social collection, which is one or more livefyre-backed tweet-like pieces of content.
    **/

    !function($)
    {

    sho.social.collection.Model = Backbone.Model.extend({

        '_KLASS_' : 'sho.social.collection.Model',

        'include_author' : true,

        initialize:function(cfg)
        {
            _.extend(this, {
                'attributes': {
                    'siteId'     : '309979',                        // this was passed by as cfg.siteId before, but hard-coding for now

                    'articleId'    : cfg.articleId,                 // 'series_season_episode_role'  323_0_0 or 323_7_0_cast
                    'maxItems'     : Number(cfg.maxItems),          // number of items to cap at
                    'displaySize'  : Number(cfg.displaySize),       // how many are actually shown at once
                    'displayMode'  : cfg.displayMode,               // show all items at once or rotate though them? (either 'polling' or 'static'?
                    'refresh'      : Number(cfg.refresh * 1000),    // rate to cycle through articles
                    'index'        : 0,                             // pointer to current article
                    'items'        : [],                            // data goes here,
                    'theme'        : cfg.theme                      // 'collapsed' or 'expanded'

                },
                'fn' : {
                    'onSDKReady'  :  _.bind(this.onSDKReady, this),
                    'onSDKError'  :  _.bind(this.onSDKError, this),
                    'tick' :         _.bind(this.tick, this)
                }
            });

            sho.dom.bind('livefyre:ready', this.fn.onSDKReady)

            if(cfg.standalone)
            {
                var sdk = sho.social.livefyre.getSDK({
                    'articleId' : this.get('articleId'),
                    'commentStream' : false
                });
            }
        },

        onSDKReady:function(e,sdk)
        {
            this.collection = sdk.getCollection({
    			"siteId" : this.get('siteId'), // "309979",
    			"articleId" : this.get('articleId') // 323_0_0
    		});


    		var th = this;
    		this.collection.getInitialData(
		        function(data)
		        {
		            th.trigger('fyre:initialdata:ready', data);
		        },
		        function(e)
		        {
		            th.trigger('fyre:error', e)
		        }
		    );
	    },

        trigger:function(eventName, e)
        {

            if(eventName == 'fyre:initialdata:ready')
            {
                this.set({'items' : this.cleanUpItems(this.getItems(e)) },{'silent':true });
                this.trigger('ready');
                if(this.get('displayMode') == 'polling')
                {
                    this.start();
                }
            }

            Backbone.Model.prototype.trigger.call(this, eventName, e);
        },

        getItems:function(data,maxDisplay)
        {
            var stream = data['public'],
                items = [],
                max = this.get('maxItems'),
                i
            ;


            for(var k in stream) // tweet-58976876986968769679@twitter.com in {}
            {

                if(stream.hasOwnProperty(k))
                {
                    i = stream[k]; if(i.content && i.content.createdAt && i.content.bodyHtml !== undefined)
                    {
                        items.push(stream[k])
                    }
                }
            }

            return items.slice(0,max-1);
        },

        cleanUpItems:function(raw)
        {
            var data, th=this, clean = _.collect(raw, function(item)
            {
                if(item)
                {
                    data = {};
                    data.date = new Date(item.content.createdAt * 1000).toString('M/d/yyyy HH:mm');

                    if(item.content.bodyHtml)
                    {
                        data.body = {'html': item.content.bodyHtml };
                    }

                    if(th.include_author && item.content.authorId)
                    {
                        data.author = th.getAuthorData(item.content.authorId);
                    }

                    return data;
                }
            })

            return clean;
        },

        getAuthorData:function(id)
        {
            return this.collection.getAuthor(id);
        },

        onSDKError:function(e)
        {
            log('an error occurred');
        },


        start:function()
        {
            this.interval = setInterval(this.fn.tick, this.get('refresh'))
        },

        stop:function()
        {
            clearInterval(this.interval)
        },

        tick:function()
        {
            var idx = this.get('index');
            idx++;
            if(idx > this.attributes.items.length-1) idx = 0;
            this.set({'index':idx});
        },

        getVisibleItems:function()
        {
            return this.get('items').slice(this.get('index'),this.get('index')+this.get('displaySize'))
        }

    });

    }(sho.$)

sho.loaded_modules['/lib/js/sho/social/collection/model.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * class sho.social.collection.View
     * component for rendering a social collection, which is one or more livefyre-backed tweet-like pieces of content.
    **/

    !function($)
    {

    sho.social.collection.View = Backbone.View.extend({

        '_KLASS_' : 'sho.social.collection.View',

        'templates' : {
            'theme_collapsed' : {

                'parent' : [
                    '{{#items}}',
                        '{{> item}}',
                    '{{/items}}',
                ''].join(''),

                'item' : ['',
                    '<div class="social-collection-item">',

                        '{{#date}}',
                        '<div class="social-collection-item-date">',
                            '{{date}}',
                        '</div>',
                        '{{/date}}',

                        '{{#body.html}}',
                            '{{{body.html}}}',
                        '{{/body.html}}',

                        '{{#author}}',
                            '<img class="social-collection-item-author-avatar" src="{{author.avatar}}" />',
                             '<div class="social-collection-item-author-display-name">',
                                '<a href="{{author.profileUrl}}">{{author.displayName}}</a>',
                             '</div>',
                        '{{/author}}',

                    '</div>',
                ''].join('')

            },

            'theme_expanded' : {

                'parent' : [
                    '{{#items}}',
                        '{{> item}}',
                    '{{/items}}',
                ''].join(''),

                'item' : ['',
                    '<div class="social-collection-item">',
                        '{{#author}}',
                            '<img class="social-collection-item-author-avatar" src="{{author.avatar}}" />',
                        '{{/author}}',

                        '{{#author}}',
                             '<div class="social-collection-item-author-display-name">',
                                '<a href="{{author.profileUrl}}">@{{author.displayName}}</a>',
                             '</div>',
                        '{{/author}}',

                        '{{#body.html}}',
                            '{{{body.html}}}',
                        '{{/body.html}}',

                        '{{#date}}',
                        '<div class="social-collection-item-date">',
                            '{{date}}',
                        '</div>',
                        '{{/date}}',

                    '</div>',
                ''].join('')

            }
        },

        initialize:function(cfg)
        {
            this.el = cfg.content;
            this.model = cfg.model;
            this.model.bind('all', _.bind(this.update, this));
        },

        update:function(eventName,e)
        {
            if(eventName == 'ready') this.theme = this.model.get('theme');
            if(eventName == 'ready' || eventName == 'change:index') this.render(this.model.getVisibleItems());
            if(eventName == 'fyre:error') this.renderError()
        },

        render:function(data)
        {
            var template = this.templates['theme_'+this.theme];
            $(this.el).html(Mustache.to_html(template.parent, {'items':data}, template));
        },

        renderError:function()
        {
            $(this.el).html(['<span class="livefyre-error">',
                '<p>Error loading content</p>',
            '</span>'].join(''))
        }

    });

    }(sho.$)
sho.loaded_modules['/lib/js/sho/social/collection/view.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * class sho.social.collection.Widget
     * component for rendering a social collection, which is one or more livefyre-backed tweet-like pieces of content.
    **/

    !function($)
    {

    sho.social.collection.Widget = klass({

        '_KLASS_' : 'sho.social.collection.Widget',

        data_attr : {
            'articleId'    : undefined,      // 'series_season_episode_role'  323_0_0 or 323_7_0_cast
            'maxItems'     : 5,              // number of items to cap at
            'displaySize'  : 1,              // how many are actually shown at once
            'displayMode'  : 'polling',      // show all items at once or rotate though them? (either 'polling' or 'static'?
            'refresh'      : 6,              // refresh rate, in seconds
            'standalone'   : false,          // do we need to get our own sdk connection instance?,
            'theme'        : 'collapsed'     // 'collapsed' or 'expanded'
        },

        klasses : {
            'view' :  sho.social.collection.View,
            'model' : sho.social.collection.Model
        },

        initialize:function(cfg)
        {
            var k,val,th=this;

            this.container = cfg.container;
            this.content =   $('.social-collection-content', cfg.container)[0];

            _.each(this.data_attr, function(v,k)
            {
                val = sho.dom.data.read(th.container, k);
                if(val !== undefined) th.data_attr[k] = val;
            })

            log('hello from '+this._KLASS_+': '+this.data_attr.articleId);

            if(!sho.env.isDesktop() && this.data_attr.standalone)
            {
                 sho.social.livefyre.getSDK({
                    'articleId' : this.data_attr.articleId,
                    'commentStream' : true,
                    'delegate' : true
                });
                this.data_attr.standalone = false;
            }

            this.model = new this.klasses.model(this.data_attr)
            this.view =  new this.klasses.view({
                'content':this.content,
                'model':this.model
            });
        }

    });

    }(sho.$)


sho.loaded_modules['/lib/js/sho/social/collection/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/social/collection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.social.stream
     * namespace for social stream component
    **/

    sho.provide('sho.social.stream');



    /**
     * class sho.social.stream.Widget
     * A component for rendering a social stream, which is a livefyre-backed dataset of tweet-like pieces of content,
     * as well as a commentbox for adding to the stream. There are integration points with the account system, for which
     * livefyre delegate is used to attach various callbacks. Reworking this to decouple the livefyre init routine from the stream itself,
     * which will enable it to play nice with other livefyre components in the same page.
    **/

    !function($)
    {

    sho.social.stream.Widget = klass({

        '_KLASS_' : 'sho.social.stream.Widget',

		initialize : function(cfg)
	    {
			if($(cfg.container).hasClass('toggle-social-stream')) {
				return;
			}

			_.extend(this, {
                'fn' : {},
                'container' : cfg.container,
                'articleId' : sho.dom.data.read(cfg.container, 'articleId') // use data-attributes to mark up container with article id...
            });

            sho.social.livefyre.getSDK({
                'articleId' : this.articleId,
                'commentStream' : true,
                'delegate' : true
            });
		}

    });

    }(sho.$)

    sho.ui.SocialStream = sho.ui.mobile.SocialStream = sho.social.stream.Widget;

sho.loaded_modules['/lib/js/sho/social/stream/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * class sho.social.stream.Comments
     * Needs documentations
    **/

    !function($)
    {

    sho.social.stream.Comments = klass({

        '_KLASS_' : 'sho.social.stream.Comments',

        initialize:function(cfg)
        {
            _.extend(this, {
                'collection': cfg.collection || null,
                'el'        : cfg.el,
                'widget'    : null,
                'auth'      : cfg.auth || false
            });

            if ( this.collection ) this.loadCurrentCollection();
        },

        loadCurrentCollection : function()
        {
            var cfg = _.extend({}, {
                'siteId': '309979',
                'el'    : this.el
            }, this.collection);

    		var customStrings = {
    		    likeButton: "Vote",
    		    unlikeButton: "Remove Vote"
    		};

            if(!this.widget) {
                var info = {"network": "sho.fyre.co", "strings" : customStrings};
                if( this.auth ) info.authDelegate = sho.social.livefyre.getDelegate().remoteAuthDelegate;
                fyre.conv.load( info, [cfg], _.bind(this.onWidget, this));
            } else {
                this.widget.changeCollection( cfg );
            }
        },

        onWidget : function( widget )
        {
            this.widget = widget;
            if( this.auth ) sho.social.livefyre.getDelegate().onReady(widget);

            this.widget.on('initialRenderComplete', _.bind(this.onInitialRenderComplete, this));
        },

        onInitialRenderComplete: function(data)
        {
            if( this.collection['sortBy'] ) {
                var clName = '.fyre-stream-sort-' + this.collection['sortBy'];
                sho.$(clName)[0].click(); // prefers native js
            }
        },

        setCollection: function( collection )
        {
            this.collection = collection;
            this.loadCurrentCollection();
        }


    });

    }(sho.$)

    sho.ui.Comments = sho.ui.mobile.Comments = sho.social.stream.Comments;

sho.loaded_modules['/lib/js/sho/social/stream/comments.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/




    !function($){

    sho.ui.ToggleBar = klass({

        '_KLASS_' : 'sho.ui.ToggleBar',

        'defaults' : {
            'activeClass' : 'aktiv'
        },

        initialize : function(cfg)
        {
            _.extend(this, {
                'container' : $(cfg.container),
                'activeClass' : cfg.active || this.defaults.activeClass,
                'delegate' : cfg.delegate || null,
                'selectedIndex' : cfg.initialSelectionIndex || 0,
                'fn' : {
                    'onClick' : _.bind(this.onClick, this)
                }
            });

            this.toggles = this.container.find('li');
            _.each(this.toggles, function (el, index) {
                $(el).data('index', index);
            });

            this.container.on('click', 'li', this.fn.onClick);

            this.highlightWithIndex(this.selectedIndex);
        },

        onClick:function(e)
        {
            this.setSelected($(e.currentTarget).data('index'))
        },

        setSelected:function(index)
        {
            if (index != this.selectedIndex) {
                this.selectedIndex = index;
                this.highlightWithIndex(this.selectedIndex);
                if (this.delegate) this.delegate(this.toggles[this.selectedIndex]);
            }
        },

        highlightWithIndex:function(index)
        {
            this.toggles.removeClass(this.activeClass);
            $(this.toggles[index]).addClass(this.activeClass);
        },

        item:function(index) {
            return this.toggles[index];
        }

    })

    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/togglebar.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    /**
     * class sho.social.stream.ToggleWidget
     * Needs documentation
    **/

    !function($)
    {

    sho.social.stream.ToggleWidget = klass({

        '_KLASS_' : 'sho.social.stream.ToggleWidget',

		initialize : function(cfg)
	    {
			_.extend(this, {
                'fn' : {},
                'container' : cfg.container,
                'togglebar' : new sho.ui.ToggleBar({
                    container: $('.sho-togglebar')[0],
                    delegate: _.bind(this.onToggleBarChange, this),
                })
            });
            var t = $(this.togglebar.item(0));
            this.comments = new sho.social.stream.Comments({
                'collection'    : {
                    'articleId'     : t.data('articleId'),
                    'checksum'      : t.data('checksum'),
                    'collectionMeta': t.data('collectionMeta')
                },
                'el' : 'livefyre-comments',
                'auth' : true
            });

			this.postingElements = $(".fyre-editor");
		},

        onToggleBarChange : function(el)
        {
            var t = $(el);
            var c = {
                'articleId'     : t.data('articleId'),
                'checksum'      : t.data('checksum'),
                'collectionMeta': t.data('collectionMeta'),
                'sortBy'        : t.data('sortBy')
            };

			if(t.data('allowPosting') == true) {
				$(this.container).removeClass("disallow-posting");
			}
			else { $(this.container).addClass("disallow-posting"); }

            this.comments.setCollection(c);
        }

    });

    }(sho.$)

    sho.ui.ToggleSocialStream = sho.ui.mobile.ToggleSocialStream = sho.social.stream.ToggleWidget;

sho.loaded_modules['/lib/js/sho/social/stream/toggle-widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/social/stream.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/social.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.video
     * the main namespace for video player and screening room code.
    **/

    /**
     * Backbone
     * Namespace used by the Backbone microframework, which underpins the video player and schedules sections.
    **/

    /**
     * class Backbone.Model
     * Namespace used by the Backbone microframework, which underpins the video player and schedules sections.
    **/

    /**
     * class Backbone.View
     * Namespace used by the Backbone microframework, which underpins the video player and schedules sections.
    **/

    /**
     * class Backbone.Router
     * Namespace used by the Backbone microframework, which underpins the video player and schedules sections.
    **/

    sho.provide('sho.video');


    /**
     * sho.video.brightcove
     * A package containg all the [brightcove](http://brightcove.com) integration points.
    **/

    sho.provide('sho.video.brightcove');


    /**
     * class sho.video.brightcove.Experience < Backbone.Model
     * A wrapper around the [brightcove](http://brightcove.com) experience implementation which serves as a single integration point for the api.
     *
     * The bc experience comes in two flavors: flash/legacy api (full featured), and smart api
     * (not all features are supported, but is supposed to work on ipad/iphone 'out of the box').
     *
     * These links are the primary references outside of the api documentation:
     *
     * - [article 1](http://support.brightcove.com/en/docs/using-javascript-flash-only-player-api)
     * - [article 2](http://support.brightcove.com/en/docs/dynamically-loading-videos-using-smart-player-api)
     * - [article 3](http://support.brightcove.com/en/docs/coding-solution-using-hybrid-both-player-apis)
     *
     * To use the full api, you must have these javascript assets in place:
     *
     *          <script src="http://admin.brightcove.com/js/BrightcoveExperiences.js" />
     *          <script src="http://admin.brightcove.com/js/APIModules_all.js" />
     *
     * or combined as:
     *
     *          <script src="http://admin.brightcove.com/js/BrightcoveExperiences_all.js" />
     *
     * For the smart api, you only need this:
     *
     *          <script src="http://admin.brightcove.com/js/BrightcoveExperiences.js" />
     *
     * In our implementation, the desktop version of the site gets the flash api, tablet and mobile get the smart api,
     * and a platform-specific conditional call to sho.vendor.load() is used to decide which resource to load.
     *
     * Internally, some pretty rough client-side detection is used to set a flag for the api type. (see getApiType() below)
     *
     * Note: we are still plagued by either an orphaned listener or IE-specific flash.externalInterface behavior,
     * after closing the player, a js error will throw on an interval, in IE8 and 9:
     *
     * in IE9 the error is : `“SCRIPT5007: Unable to set value of the property ‘display’: object is null or undefined”`,
     * which is a documented externalInterface issue. we don't call this directly, but it must be called somwhere in the bc stack. Folks are talking about this on
     * [msdn.microsoft.com](http://msdn.microsoft.com/en-us/library/gg622942%28v=VS.85%29.aspx) and
     * [stackoverflow.com](http://stackoverflow.com/questions/7523509/script5007-unable-to-get-value-of-the-property-setreturnvalue-object-is-null)
     *
    **/
    sho.video.brightcove.Experience = Backbone.Model.extend({

        _KLASS_ : 'sho.video.brightcove.Experience',

        player_name : 'sho_video_player_experience_swf',
        status : 'init',
        api_type : null, //'smart_api' || 'flash_api',

        /**
         * sho.video.brightcove.Experience.media_events = []
         *
         * An array of brightcove api events we are interested in. The abbreviated/simple form is used here,
         * but they are converted to the full form when registerring the event listener.
        **/
        media_events : $w('BEGIN CHANGE PROGRESS COMPLETE ERROR PLAY SEEK_NOTIFY STOP BUFFER_BEGIN BUFFER_COMPLETE'), // BEGIN BUFFER_BEGIN BUFFER_COMPLETE'),

        /**
         * sho.video.brightcove.Experience#params_base -> {}
         * Object containing the flash parameters that are used to build up the object element that brightcove will decorate
        **/
        params_base : {
            width : "100%",
            height : "100%",
            wmode: "opaque",//"transparent",
            bgcolor : "#000000",
            isVid : "true",
            isSlim : "true",
            dynamicStreaming : "true",
            videoSmoothing: "false",
            includeAPI : "true",
            playerLocation : "sho.com",
            templateLoadHandler : 'sho.video.brightcove.onTemplateLoaded',
            templateErrorHandler : 'sho.video.brightcove.onTemplateError'
        },

        /**
         * sho.video.brightcove.Experience#params_smart_api-> {}
         * Object containing the flash parameters specific to the smart player
        **/
        params_smart_api : {
            'width' : '640',
            'height' :  '360'
        },

        /**
         * sho.video.brightcove.Experience#params_host-> {}
         * Object containing the flash parameters specific to the brightcove player associated with each host
        **/

        params_host : {
        'DEV' : {
                'full': {
                    playerID : "1834581245001",
                    playerKey : "AQ~,AAAAB_0P_tk,Ddi_5nC928ziBHzBRJIR96p9JZ851fP0"
                },
                'short' : {
                    playerID : "1834581231001",
                    playerKey : "AQ~,AAAAAAAA9pg,GnOHJwU2r3tDIuVz90YeiG5J_HfJuxMI"
                }
            }
        ,
        'QA' : {
                'full': {
                    playerID : "1834581246001",
                    playerKey : "AQ~,AAAAB_0P_tk,Ddi_5nC928wwFlhqSZHwFHxIX54ZPlki"
                },
                'short' : {
                    playerID : "1834581232001",
                    playerKey : "AQ~,AAAAAAAA9pg,GnOHJwU2r3ueiBgxWckHJ2AHCqHp3plr"
                }
            }
        ,
        'LIVE' : {
                'full': {
                    playerID : "1429816787001",
                    playerKey : "AQ~~,AAAAB_0P_tk~,Ddi_5nC928yxbKZObaO5oJYEuix40pni"
                },
                'short' : {
                    playerID : "1425943638001",
                    playerKey : "AQ~~,AAAAAAAA9pg~,GnOHJwU2r3sVVaVR9-ojJyTn0w9ZSn9c"
                }
            }
        },

        /**
          * sho.video.brightcove.Experience.brightcove_error_map = {}
          *
          *      0	UNKNOWN	There was an unidentifiable issue that prevents load or playback
          *      1	DOMAIN_RESTRICTED	The player is not allowed to be viewed on the requesting domain
          *      2	GEO_RESTRICTED	The player may not be viewed in the current geography
          *      3	INVALID_ID	The ID provided for the player is not for a currently active player
          *      4	NO_CONTENT	There was no programmed content in the player
          *      5	UNAVAILABLE_CONTENT	There was an error loading the video content
          *      6	UPGRADE_REQUIRED_FOR_VIDEO	An upgrade to the Flash Player is required to view the content
          *      7	UPGRADE_REQUIRED_FOR_PLAYER	An upgrade to the Flash Player is required to load the player
          *      8	SERVICE_UNAVAILABLE	There was an error connecting to the backend on initial load
        **/
        brightcove_error_map : {
            '2': 'The video you are trying to watch cannot be viewed from your current country or location'
        },

        fn : {}, // storage for bound callbacks that need to be unset at a later time.

        array_object_stub : [{}], // used in ternary operators where we don't know if we have a bona-fide cc object

        /**
         * new sho.video.brightcove.Experience([cfg])
         * Creates the Experience instance, kicking off the startup routine.
        **/
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'api_type' : this.getApiType(),
                'player_type' : cfg.player_type || 'short',
                'display_mode' : sho.video.default_display_mode || 'actual_size', // 'actual_size' || 'scale_to_fit'
                'ipad_dimensions' : {
                    'actual_size' : {
                        'portrait' : sho.string.toDimensions('768x946'),
                        'landscape' : sho.string.toDimensions('1024x645') // was '1024x690'
                    },
                    'scale_to_fit' : {
                        'portrait' : sho.string.toDimensions('1682x946'),
                        'landscape' : sho.string.toDimensions('1227x690')
                    }
                }
            });

            this.fn.createExperience = this.createExperience.bind(this);

            this.set({'playing':false},{'silent':true});
        },

        /**
         * sho.video.brightcove.Experience#getParams() -> {}
         * Merges the base params with those specific to the host and either the full or short-form player and returns the result
        **/
        getParams:function()
        {
            var host = sho.env.serverName() || 'LIVE';
            if(host == 'POSTING') host = 'LIVE';
            if(host == 'LOCAL') host = 'DEV';

            return _.extend({},
                this.params_base,
                this.params_host[host][this.player_type],
                this['params_'+this.player_type],
                this.isSmartAPI() ? (sho.isIpad() ? (this.ipad_dimensions[this.display_mode][sho.dom.orientation()]) : this.params_smart_api) : {}
            );
        },

        /**
         * sho.video.brightcove.Experience#createExperience() -> null
         * Iterate over params to build and deploy the flash object
        **/
        createExperience:function()
        {
            if(brightcove && this.container)
            {
                var params = this.getParams();
                this.container.update(([

    		        '<object id="', this.player_name, '">',                                 // <object id="sho_global_video_player">
    			        _.keys(params).collect(function(k){                                 //     <param value="1325689458001" name="playerID">
    			            return ['<param name="', k ,'" value="', params[k], '">']       //     <param value="AQ~~,AAAAAAAA9pg~,GnOHJwU2r3sNlKltTiYDvpSZHFNypxse" name="playerKey">
    			        }),                                                                 //     <param value="onTemplateLoaded" name="sho.video.brightcove.onTemplateLoaded">
    		        '</object>'                                                             // </object>

    		    ]).flatten().join(''));

    		    brightcove.createExperience($(this.player_name), this.container, true);
    		}

        },

        /**
         * sho.video.brightcove.Experience#onTemplateLoaded() -> null
         * Respond to brightcove:api_ready event 1/2
        **/
        onTemplateLoaded:function()
        {
            if(!this.player && this.api_type !== null)
            {
                this.api =  (this.api_type == 'smart_api' ? brightcove.api.getExperience(this.player_name) : brightcove.getExperience(this.player_name));
                _.extend(this, {
                    'player' :      this.api.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER),
                    'experience' :  this.api.getModule(brightcove.api.modules.APIModules.EXPERIENCE),
                    'content' :     this.api.getModule(brightcove.api.modules.APIModules.CONTENT),
                    'captions' :    this.api.getModule(brightcove.api.modules.APIModules.CAPTIONS)
                });

                this.fn.onTemplateReady = this.onTemplateReady.bind(this);
                this.experience.addEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, this.fn.onTemplateReady);

                if(this.isFlashAPI())
                {
                    this.fn.onMediaLoad = this.onMediaLoad.bind(this);
                    this.content.addEventListener(BCContentEvent.MEDIA_LOAD, this.fn.onMediaLoad);
                }

                this.trigger('template:loaded');
            }
        },


        /**
         * sho.video.brightcove.Experience#onTemplateReady() -> null
         * Respond to brightcove:api_ready event 2/2
        **/
        onTemplateReady:function(e)
        {
            this.experience.removeEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, this.fn.onTemplateReady);

            this.fn.onMediaEvent = this.onMediaEvent.bind(this);

            if(this.isFlashAPI())
            {
                this.media_events.push('MUTE_CHANGE');
                this.media_events.push('VOLUME_CHANGE');
            }

            var th = this;
            this.media_events.each(function(eventName) {
                th.player.addEventListener(th.getEventNameAlias(eventName), th.fn.onMediaEvent)
            });

            if(this.isFlashAPI()) this.view_changer = this.experience.getElementByID("viewChanger");

            this.fn.onCurrentVideoReady = this.onCurrentVideoReady.bind(this);
            this.fn.onLoadDFXPSuccess =   this.onLoadDFXP.bind(this, 'success');
            this.fn.onLoadDFXPError =     this.onLoadDFXP.bind(this, 'error');

            this.captions.addEventListener('dfxpLoadSuccess', this.fn.onLoadDFXPSuccess);
            this.captions.addEventListener('dfxpLoadError', this.fn.onLoadDFXPError);

            this.trigger('template:ready');
        },

        /**
         * sho.video.brightcove.Experience#onTemplateError(e) -> Null
         * Responder for the brightcove onTemplateError ready event. Called when the player doesn't load successfully.
         * This could be the result of any number of errors, but the geo-lockout is the case we are most interested in, as the others will be caught by onMediaEvent.
         * Additionally, it seems there is a false-positive noContent error thrown on every play, perhaps due to the way we chain the experience calls..
         * See brightcove_error_map above
        **/
        onTemplateError:function(e)
        {
            this.trigger('error', this.brightcove_error_map[e.code] || e.errorType);
        },

        /**
         * sho.video.brightcove.Experience#getEventNameAlias(eventName) -> String
         * Convert the brightcove typed constant or volume event to equivalent event in our naming scheme.
         *
         *      BEGIN => brightcove.api.events.MediaEvent['BEGIN'] => 'mediaBegin'
         *      MUTE_CHANGE => mediaMuteChange
         *
         * Note: this is hyper-complicated and could be greatly simplified by abandoning the 'typed' constants alltogether!
        **/
        getEventNameAlias:function(eventName)
        {
            return brightcove.api.events.MediaEvent[eventName] || brightcove.api.events.CaptionsEvent[eventName] || this.getVolumeEventName(eventName);
        },

        /**
         * sho.video.brightcove.Experience#getVolumeEventName(eventName) -> String
         * Brightcove Smart API event names are 'typed' constants, *object literals that equate to strings*, but Flash API event names are just simple strings.
         * This method smoothes out this discrepancy..
         *
         *      exp.getVolumeEventName(brightcove.api.events.MediaEvent.SEEK_NOTIFY) => 'mediaSeekNotify'
         *      exp.getVolumeEventName('mediaMuteChange') => 'mediaMuteChange'
         *
        **/
        getVolumeEventName:function(str)
        {
            return ('MEDIA_'+str).dasherize().toLowerCase().camelize()
        },


        /**
         * sho.video.brightcove.Experience#loadVideoById(id) -> Null
         * Load a video into the player by supplying a brightcove title id.
         * Note: we use __loadVideoById()__, Brightcove uses __loadVideoByID()__
        **/
        loadVideoById:function(id)
        {

            if(this.player)
            {
                if(this.api_type == 'flash_api'){
                    this.content.getMediaAsynch(id);
                }
                else{
                    this.player.loadVideoByID(id)
                }
            }
            else
            {
               this.trigger("error","loadVideoByID called but player module doesn't exist yet");
            }
        },


        /**
         * sho.video.brightcove.Experience#onMediaLoad(event) -> Null
         * Callback for getMediaAsynch
        **/
        onMediaLoad:function(e)
        {
            if(e.media && e.media.id) this.player.loadVideo(e.media.id);
            else this.trigger("error","no media found for this title");
        },


        /**
         * sho.video.brightcove.Experience#onMediaEvent(event) -> Null
         * All-purpose responder for the media events we are monitoring. Finesses the name of the event, captures duration
         * and position since asyncronous getters are such a hassle, and proxies the event over to sho.video.brightcove.Experience's subscribers.
        **/
        onMediaEvent:function(e)
        {
            this.duration = e.duration;
            this.position = e.position;
            e.progress = e.position / e.duration;

            var eventName = e.type.gsub(/media/,'media:').toLowerCase().gsub(/seeknotify/,'seek_notify').gsub(/(mute|volume)change/,'#{1}_change');

            this.trigger(eventName,e);
        },

        /**
         * sho.video.brightcove.Experience#onEmbedCodeReceived(event) -> Null
         * Callback for the ready-state of the embed snippet, which is async
        **/
        onEmbedCodeReceived:function(e)
        {
            this.set({ 'embedCode' : e.snippet },{ 'silent':true });
            this.trigger('embed_code_ready', e);
        },


        /**
         * sho.video.brightcove.Experience#resize(Dimensions) -> Null
         * In html mode, the video footprint is set with pixels, rather than 100%x100%, so we need an explicit resize method.
         * It would appear that setting the dimensions of the smart api's iframe achieves the desired result *most* of the time,
         * but it does fail frequently enough to be an issue. Since the scaling is happening regardless of the iframe dimensions and the properties
         * passed through as object params, it may be that this is an ipad issue, ie, we need to force a repaint.
         *
         * This is mostly remedied by the passing in of ipad landscape/portrait dimensions at startup (see params_smart_api_ipad above), in fact,
         * we could probably do away with the resize method alltogether, if it weren't for the need to support orientation changes.
         *
         * Interestingly enough, orientation changes trigger the proper resize!
        **/
        resize:function(dimens)
        {
            if(this.isFlashAPI() && !sho.env.browser().isIE) return;

            $(this.player_name).setStyle(sho.object.toPixels(dimens));
        },


        stop:function()
        {
            if(this.isSmartAPI())
            {
                this.player.seek(0);
                this.player.pause(true);
            }
            else
            {
                if(this.player) this.player.stop();
            }
        },

        play:function()
        {
            this.player.play();
        },

        pause:function(isPaused)
        {
            this.player.pause(isPaused)
        },

        getDuration:function()
        {
            return this.duration
        },

        getPosition:function()
        {
            return this.position
        },

        seek:function(secs)
        {
            this.player.seek(secs)
        },

        mute:function(isMuted)
        {
            this.player.mute(isMuted);
        },

        isMuted:function()
        {
            return this.player.isMuted();
        },

        setVolume:function(v)
        {
            this.player.setVolume(v);
        },

        getVolume:function()
        {
            return this.player.getVolume()
        },

        onDisplayModeChanged:function(mode)
        {
            if(this.isFlashAPI() && this.view_changer) this.view_changer.callSWFMethod('onDisplayModeChange', mode);
        },


        getEmbedCode:function()
        {
            return ''
        },


        loadDFXP:function(url)
        {
            var rel = url.split('http://www.sho.com')[1];

            this.trigger('dfxp:loading')
            this.captions.loadDFXP(rel);
        },

        onLoadDFXP:function(e, evnt)
        {
            if (e == 'success' && this.isSmartAPI()) this.captions.setCaptionsEnabled(false);
            this.trigger('dfxp:load:'+e);
        },

        getClosedCaptions:function()
        {
            if(!this.player || !this.player.getCurrentVideo) return {};

            var cc = (this.player.getCurrentVideo(this.fn.onCurrentVideoReady) || {'captions':this.array_object_stub}).captions;
            return (cc || this.array_object_stub)[0]; // extract cc object from array wrapper. (would we ever have more than one?)
        },

        onCurrentVideoReady:function(video)
        {
            var cc = (video.captions || this.array_object_stub)[0];
            this.trigger('current_video:ready', cc);
        },

        getClosedCaptionsEnabled:function()
        {
            return this.captions.getCaptionsEnabled()
        },

        setClosedCaptionsEnabled:function(cc)
        {
            this.captions.setCaptionsEnabled(cc);
        },

        showClosedCaptionsOptions:function()
        {
            this.captions.showOptions(true); // this param seems to be ignored but erring on safe side..
        },

        destroyExperience:function()
        {
            var th=this;
            this.media_events.each(function(eventName){
                th.player.removeEventListener(th.getEventNameAlias(eventName), th.fn.onMediaEvent);
            });

            this.captions.removeEventListener('dfxpLoadSuccess', this.fn.onLoadDFXPSuccess);
            this.captions.removeEventListener('dfxpLoadError', this.fn.onLoadDFXPError);

            if(this.isFlashAPI())
            {
                this.content.removeEventListener(BCContentEvent.MEDIA_LOAD, this.fn.onMediaLoad);

                this.experience.unload();
            }

            _.extend(this, {
                'api' : null, 'player' : null, 'experience' : null
            });
        },

        destroy:function()
        {
            this.player && this.destroyExperience();        // unset brightcove listeners and remove swf
            this.unbind();                                  // remove all callbacks pointed this way.
        },


        getApiType:function()
        {
            if(this.api_type == null) this.api_type = (sho.isTablet() || sho.isMobile()) ? 'smart_api' : 'flash_api';
            return this.api_type
        },

        isSmartAPI:function()
        {
            return this.getApiType() == 'smart_api';
        },

        isFlashAPI:function()
        {
            return this.getApiType() == 'flash_api';
        },

        getPlayerType:function()
        {
            return this.player_type
        },

        setPlayerType:function(type)
        {
            if((this.player_type == type) || !type.match(/short|full/)) return;

            this.player_type = type;
            this.destroyExperience();
            this.trigger('teardown');
            this.fn.createExperience.delay(1);
        },

        isFullEpisodePlayer:function()
        {
            return this.player_type == 'full'
        }

    })

    $w('onTemplateLoaded isSmartAPI isFlashAPI').each(function(method){
        sho.video.brightcove[method] = function(){
            var experience = sho.video.getExperience(), m = experience[method];
            return m.apply(experience, arguments)
        }
    })

    sho.video.brightcove.onTemplateError = function(e)
    {
        var t = (e || {}).errorType; if(t !== 'geoRestricted') return;
        log(['|exprnc| static method call: onTemplateError ',e]);
        sho.video.getExperience().onTemplateError(e);
    }

    /**
     * sho.video.brightcove.onTemplateLoaded(e) -> Null
     * Responder for the brightcove onTemplateLoaded ready event. Since the callback reference is set as an object parameter,
     * we lose the instance reference. Exposing this method statically on sho.video.brightcove gives us a hook back.
    **/

    /**
     * sho.video.brightcove.onTemplateError(e) -> Null
     * Static alias. Calls onTemplateError on the instance.
    **/

    /**
     * sho.video.brightcove.isSmartAPI() -> Boolean
     * Static accessor for the isSmartAPI method on the instance. Returns true if api_type == 'smart_api'
    **/

    /**
     * sho.video.brightcove.isFlashAPI() -> Boolean
     * Static accessor for the isFlashAPI method on the instance. Returns true if api_type == 'flash_api'
    **/
sho.loaded_modules['/lib/js/sho/video/brightcove/experience.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/video/brightcove.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.video.player
     * The namespace for overlay video player
    **/

    sho.provide('sho.video.player');

    sho.video.tweens =
    {
        deefault : {
            'duration' : 0.5,
            'transition' : 'easeOutQuad'
        },

        graded_animation_map : {
            'webkit' : {
                'dock' : ['focus','blur','open','close'],
                'controls' : ['focus','blur'],
                'tabs' : ['focus','blur'] // focus really means activate/select a tab
            },
            'firefox' : {
                'dock' : ['focus','blur'],
                'controls' : ['focus','blur'],
                'tabs' : []
            },
            'internet explorer' : {} // zilch
        },

        isSupported : function(klass, tween){
            var m = sho.video.tweens.graded_animation_map,
                b = sho.env.browser().name,
                supported = !!(m[b][klass] && m[b][klass].include(tween))
            ;

            return supported;

        }

    };

    _.extend(sho.video.tweens.graded_animation_map, {
        'safari' : sho.video.tweens.graded_animation_map.webkit,
        'chrome' : sho.video.tweens.graded_animation_map.webkit
    });



sho.loaded_modules['/lib/js/sho/video/player/tweens.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.video.player.models
     * Namespace for the model in the video player MVC setup
    **/

    sho.provide('sho.video.player.models');

        sho.video.player.models.Stage = Backbone.Model.extend({

            _KLASS_ : 'sho.video.player.models.Stage',

            attributes : {
                'natural' : '',         // video footprint at natural size
                'adjusted' : '',        // target dimensions and left/top offsets
                'display_mode' : ''     // how to scale the video footprint on resize. 'scale_to_fit' || 'actual_size'
            },

            defaults : {
                'dimensions' : '1280x720',
                'display_mode' : 'actual_size' // 'scale_to_fit'
            },

            fn : {},

            initialize:function(cfg)
            {
                this.set({
                    'natural' : sho.string.toDimensions(cfg.dimensions || this.defaults.dimensions),
                    'display_mode' : cfg.display_mode || this.defaults.display_mode
                },{
                    'silent':true
                });

                this.setHandlers();
            },

            setHandlers:function()
            {
                this.fn.update = this.update.bind(this);
                Event.observe(window, 'resize', this.fn.update);
            },

            destroy:function()
            {
                Event.stopObserving(window, 'resize', this.fn.update);
            },

            update:function()
            {
                var natural = this.get('natural'),
                    display_mode = this.get('display_mode'),
                    target = document.viewport.getDimensions(),
                    sx = target.width / natural.width,
                    sy = target.height / natural.height,
                    s = {}
                ;

                if(display_mode == 'scale_to_fit')
                {
                    if(sx > sy)
                    {
                        s.height = Math.round(natural.height * sx);
                        s.width = target.width;
                        s.top = Math.round(0-(s.height - target.height)/2)
                        s.left = 0;
                    }
                    else
                    {
                        s.height = target.height;
                        s.width = Math.round(natural.width * sy);
                        s.left = Math.round(0-(s.width - target.width)/2)
                        s.top = 0;
                    }
                }

                if(display_mode == 'actual_size')
                {
                    _.extend(s, {'left':0,'top':0}, target);
                }

                this.set({'adjusted':s},{'silent':true});
                this.trigger('resize', s);
            }

        });

        sho.video.default_display_mode = sho.video.player.models.Stage.prototype.defaults.display_mode;


sho.loaded_modules['/lib/js/sho/video/player/models/stage.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


        /**
         * class sho.video.player.models.Video < Backbone.Model
         * Model class for a REST-backed video object.
        **/

        sho.video.player.models.Video = Backbone.Model.extend({

            _KLASS_ : 'sho.video.player.models.Video',

            base_url : '/rest/video/titles',
            stub_url : '/!/video/title.js',
            full_episode_stub_url : '/!/video/full-episode.js',
            closed_captions_stub_url : '/!/video/cc-test-',

            always_use_stub_url : false,


            /**
             * sho.video.player.models.Video#url() -> String
             * Returns the url for the JSON representation of the video object, which takes the form `base_url +'/' + id + '/' + title-slug`.
             *
             * if `sho.video.always_use_stub_url` (psuedo-global) or `this.always_use_stub_url` (set in class definition) are found to be true,
             * this function will instead return a static string, (the path to a flattened file/fixture), which can be used to help speed up local development.
            **/
            url:function()
            {
                var url;

                if((this.always_use_stub_url || sho.video.always_use_stub_url))
                {
                    url = this.stub_url;

                    if(this.attributes.id == window.test_full_episode.id)
                    {
                        url = this.full_episode_stub_url;
                    }

                    if((window.test_closed_captions || []).collect(function(v){return v.id;}).join(' ').indexOf(this.attributes.id) !== -1)
                    {
                        url = this.closed_captions_stub_url + this.attributes.id + '.js';
                    }
                }
                else
                {
                    url = ([this.base_url,this.get('id'),(this.slug || 'slug-not-provided')].join('/'));
                }
                return url;
            },

            /**
             * sho.video.player.models.Video#trigger(eventName, arguments) -> Event
             * A custom implementation of Backbone.Model.trigger, allowing us to pay special attention to changes to the 'data' property..
             * This could potentially go into a new backbone-centric 'base model' class.
            **/
            trigger:function(e, args)
            {
                if(e.match(/change:data/))
                {
                    var payload = this.get('data') || {};
                    _.extend(this.attributes, payload.video || {});

                    this.relatedVideoList = payload.relatedVideoList;
                }

                Backbone.Model.prototype.trigger.call(this, e, args)
            },

            /**
             * sho.video.player.models.Video#fetch(options) -> Event
             * Extend Backbone.Model.fetch, in order to add a pre and post event
            **/
            fetch:function(opts)
            {
                this.trigger('loading');
                log('|model| url=`'+this.url()+'`');

                var th=this,
                    opts = (opts || {'success':false}),
                    fn = opts.success
                ;
                opts.success = function(model, response)
                {
                    th.trigger('loaded');
                    if(fn) fn.call(this, model, response);
                }

                Backbone.Model.prototype.fetch.call(this, opts)
            },

            /**
             * sho.video.player.models.Video#isFullEpisode() -> Boolean
             * Returns true if the video has a typeCode that matches the flag for Full Episodes, defined in [[sho.video.types]]
            **/
            isFullEpisode:function()
            {
                return this.get('typeCode') == sho.video.types.FULL_EPISODE
            },

            /**
             * sho.video.player.models.Video#getVideoType() -> String
             * Returns either 'full' or 'short', depending on the videos' typeCode.
            **/

            getVideoType:function()
            {
                return this.isFullEpisode() ? 'full' : 'short'
            }
        });

        /**
         * sho.video.types = {}
         * A hash of static constants that map to video type-codes in VAMS. These could be expanded to include more video types, but the
         * primary purpose is to distinguish full episodes from short form, a crucial distinction since a different Brightcove account is used for each type.
         *
         * `sho.video.types.FULL_EPISODE = 'ful'`
         *
        **/
        sho.video.types = {
            'FULL_EPISODE' : 'ful'
        };



sho.loaded_modules['/lib/js/sho/video/player/models/video.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

        sho.provide('sho.video.player.models.player');
        sho.video.player.models.player.Base = {

            _KLASS_ : 'sho.video.player.models.Player',

            public_events : ['video:loading','video:loaded','video:error','shareable:success','clipboard:copied','experience:media:finish_line'],

            fn : {}, // catch-all for bound callbacks

            initialize:function(cfg)
            {
                var th = this;
                this.setBenchMark('player:init');

                this.video = new sho.video.player.models.Video();
                this.video.bind('all', function(eventName){
                    th.trigger('video:'+eventName);
                });

                this.bc_experience = cfg.bc_experience;
                this.bc_experience.bind('all', function(eventName,e){
                    th.trigger('experience:'+eventName,e);
                });

                this.stage = new sho.video.player.models.Stage();
                this.stage.bind('resize', function(e){
                    th.trigger('stage:resize', e)
                });
                this.stage.bind('change:display_mode', function(e){
                    th.trigger('stage:change:display_mode', e)
                });

                this.set({
                    'volume':1,
                    'cc':'DISABLED',
                    'cc_ui':'HIDDEN',
                    'playing':false,
                    'muted':this.getInitialIsMuted(),
                    'sleeping':false,
                    'sleepDisabled':false,
                    'loading':false,
                },{
                    'silent':true
                });

                this.sleep_wake_supported = (sho.isDesktop() && !sho.video.disable_sleeping && !sho.video.use_flash_sleep_wake_events);
                this.setSleepWakeHandlers();

            },

            getInitialIsMuted:function()
            {
                var inital = this.cookie_mute_settings && sho.util.Cookies.read(this.cookie_mute_store) == 'true'; return inital;
            },

            trigger:function(eventName, e)
            {
                if(!!this.event_responders[eventName]){
                    for(var i=this.event_responders[eventName].length-1; i>-1; i--){
                        var responder = this.event_responders[eventName][i],
                            fn = typeof responder == 'string' ? this[responder] : responder
                        ;
                        fn.apply(this, arguments);
                    }
                }

                Backbone.Model.prototype.trigger.call(this, eventName, e);

                if(this.public_events.include(eventName)) sho.dom.trigger('video_player:'+eventName, e);
            },

            destroy:function()
            {
                this.video.unbind('all');
                if(this.sleep_wake_supported) ($$('body')[0]).stopObserving('mousemove',this.fn.resetSleepCheck);
                this.unbind('all');
                this.stage.destroy();
            },


            setBenchMark:function(label)
            {
                this.benchmarks = this.benchmarks || [];
                this.benchmarks.push({'label':label,'timestamp':new Date()});
            },

            getBenchMark:function()
            {
                var b = this.benchmarks.shift(); // this needs to be destructive, not just access..
                return b;
            },

            getRating:function(){
                return (this.video.get('rating') || 'unknown-rating').toLowerCase();
            },

            getRestrictedAge:function(){
                return (this.video.get('ageGate') || '0');
            },

            isMatureContent:function()
            {
                return !!(this.getRestrictedAge() > 0);
            },

            getTitle:function(){
                return this.video.get('contextualTitle') || this.video.get('title');
            },

            getDescription:function(){
                return this.video.get('longDescription') || 'Not Available';
            },

            getRelatedVideos:function(){
                return this.video.relatedVideoList;
            },

            getVideoType:function(){
                return this.video.getVideoType()
            },

            getVideoSeriesId:function(){
                return (this.video.get('seriesId') || 0).toString()
            },

            getVideoSeasonNumber:function(){
                return (this.video.get('seasonNum') || 0).toString()
            },

            getVideoEpisodeId:function(){
                return (this.video.get('episodeId') || 0).toString()
            },

            getVideoId:function(){
                return (this.video.get('id') || 0).toString()
            },

            isFullEpisode:function(){
                return this.video.isFullEpisode()
            },

            getAdjustedStageSize:function(){
                return this.stage.get('adjusted');
            },

            getViewportSize:function(){
                return this.stage.get('viewport');
            },

            getDisplayMode:function(){
                return this.stage.get('display_mode');
            },

            setDisplayMode:function(mode){
                this.stage.set({'display_mode':mode});
                this.stage.update();
            },

            getCustomFields:function(){
                return this.bc_experience.getCustomFields()
            }

        };

sho.loaded_modules['/lib/js/sho/video/player/models/player/base.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.models.player.Net = {

        event_responders : {
            'experience:template:ready' : 'onTemplateReady',
            'video:loading' : (function(){
                this.set({'loading':true},{'silent':true});
            }),
            'video:loaded' : (function(){
                this.set({'loading':false},{'silent':true});
                this.validateVideo();
            }),
            'video:validation:success' : 'loadVideoIntoExperience'
        },

        recovering_from_teardown : false, // should this flag be moved to the bc_experience itself?

        onTemplateReady:function()
        {
            if(!this.recovering_from_teardown)
            {
                this.stage.update();
                this.trigger('ready');
            }
            else
            {
                this.validateVideo();
            }
        },

        loadVideoIntoExperience:function()
        {
            if(this.video.getVideoType() !== this.bc_experience.getPlayerType())
            {
                this.recovering_from_teardown = true;
                this.setBenchMark('teardown');
                this.bc_experience.setPlayerType(this.video.getVideoType());
            }
            else
            {
                this.recovering_from_teardown = false;
                this.video.get('vendorId') || this.trigger('video:error', 'Title does not have a valid vendorId')
                this.video.get('vendorId') && this.bc_experience.loadVideoById(this.video.get('vendorId'));
            }

        },

        loadVideoById:function(id)
        {
            this.bc_experience.stop();
            this.video.attributes = {'id':id}; // clear current video
            this.video.fetch({});
        }

    };



sho.loaded_modules['/lib/js/sho/video/player/models/player/net.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.models.player.Audio = {

        cookie_mute_settings : true,
        cookie_mute_store : 'video_player_muted',

        event_responders : {

            'experience:media:begin' :          'setInitialMute',
            'experience:media:mute_change' :    'onMuteChange',
            'experience:media:volume_change' :  (function(){
                this.set({'volume':this.bc_experience.getVolume()})
            })
        },

        setInitialMute:function(eventName){
            if(this.get('muted')) this.bc_experience.mute(true);
        },

        onMuteChange:function(){
            var m = this.bc_experience.isMuted(); this.set({'muted':m});
            if(this.cookie_mute_settings) sho.util.Cookies.write(this.cookie_mute_store, m);
        },

        mute:function(isMuted){
            this.bc_experience.mute(isMuted);
        },

        isMuted:function(){
            return this.get('muted');
        },

        setVolume:function(v){
            this.bc_experience.setVolume(v);
        },

        getVolume:function(){
            return this.bc_experience.getVolume()
        }

    };



sho.loaded_modules['/lib/js/sho/video/player/models/player/audio.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.models.player.Playback = {

        cookie_mute_settings : true,
        cookie_mute_store : 'video_player_muted',
        tiny_seek_on_media_start : true,                    // this is a workaround for the apparent flakiness of the onProgress event;
        event_responders : {
            'experience:media:begin' :  (function(){
                if(this.tiny_seek_on_media_start) this.seek(0.05);
                sho.video.trackPlay();
            }),
            'experience:media:play' :   (function(){
                this.set({'playing':true});
            }),
            'experience:media:stop' :   (function(){
                this.set({'playing':false})
            }),
            'experience:media:change' : (function(){
                this.stage.update();    // trigger resize for benefit of the smart player
            }),
            'experience:media:complete' : (function(){
                this.wake();
                this.set({
                    'finish_line_crossed' : false, 'videoComplete': true
                });
            }),
            'experience:media:progress' : (function(eventName,e)
            {
                if(e.progress > 0.95 && !this.get('finish_line_crossed'))
                {
                    this.bc_experience.trigger('media:finish_line');            // trigger artificial experience event for crossing the 95% mark
                    this.set({'finish_line_crossed':true},{'silent':true});
                }
            })
        },

        isPlaying:function(){
            return this.get('playing');
        },

        play:function(){
            this.bc_experience.play()
        },

        pause:function(){
            this.bc_experience.pause(true);
        },

        stop:function(){
            this.bc_experience.stop();
        },

        togglePlaying:function(){
            this.bc_experience.pause(this.isPlaying())
        },

        getVideoDuration:function(){
            return this.bc_experience.getDuration();
        },

        seek:function(timeInSeconds)
        {
            if(this.get('videoComplete'))
            {
                console.log('|player.model.playback| video finished');
                this.play(); this.set({'videoComplete':false},{'silent':true})
            }

            this.bc_experience.seek(timeInSeconds)
        }
    }

sho.loaded_modules['/lib/js/sho/video/player/models/player/playback.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.models.player.Display = {

        event_responders : {
            'stage:resize' : 'onStageResize',
            'stage:change:display_mode' : 'onDisplayModeChanged',
            'experience:media:change' : (function(){
                (function(mode){
                    sho.video.getExperience().onDisplayModeChanged(mode); }).delay(1, this.getDisplayMode())
            })
        },

        onDisplayModeChanged:function(eventName,e)
        {
            var displayMode = (e && e.attributes) ? e.attributes.display_mode : sho.video.default_display_mode;
            this.bc_experience.onDisplayModeChanged(displayMode);
        },

        onStageResize:function(eventName, e)
        {
            this.bc_experience.resize({ 'width':e.width,'height':e.height });
        }



    };



sho.loaded_modules['/lib/js/sho/video/player/models/player/display.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

        sho.video.player.models.player.Sharing = {

            shareable_base_path : 'http://www.sho.com',

            event_responders : {
                'video:change' : 'resetShareable'
            },

            sendEmail:function(attrs)
            {



                if(!this.shareable)
                {
                    var th=this;
                    this.shareable = new sho.social.models.Shareable(attrs);
                    this.shareable.bind('error', function(model, error, opts){  th.trigger('shareable:error', error);   });
                    this.shareable.bind('success', function(model){ th.trigger('shareable:success'); });
                    this.trigger('shareable:loading');
                    this.shareable.send();
                }
                else
                {
                    this.shareable.attributes = attrs;
                    this.trigger('shareable:loading');
                    this.shareable.send(attrs);
                }

            },

            getContentUrl:function()
            {
                var url = this.video.get('url');
                return url ? this.shareable_base_path + url : window.location.toString();
            },

            getEmbedCode:function()
            {
                return ['',
                    '<iframe ',
                    	'frameborder="0" ',
                    	'width="480" ',
                    	'height="270" ',
                    	'scrolling="no" ',
                    	'src="http://link.brightcove.com/services/player/bcpid',this.getEmbedPlayerId(),'/?bctid=',
                    	    this.video.get('vendorId'),
                    	,'&autoStart=false">',
                    '</iframe>',
                ''].join('')
            },

            getEmbedPlayerId:function()
            {
                return this.isFullEpisode() ? '3671166870001' : '3671166871001'
            },

            getShareableAttributes:function()
            {
                return !!this.shareable ? this.shareable.attributes : {}
            },

            resetShareable:function()
            {
                if(this.shareable) this.shareable.clear({'silent':true})
            }

        };



sho.loaded_modules['/lib/js/sho/video/player/models/player/sharing.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.video.player.models.player.AgeGating = {

        event_responders : {
            'video:loaded' : 'clearDOB',
            'video:validation:underage' : 'setLockoutCookie'
        },

        valid_format_for_date_of_birth : new RegExp(/\d{1,2}-\d{1,2}-\d{4}/),
        cookie_key : 'sho_video_player_lockout',
        always_flag_as_sensitive : false,

        /**
         * sho.video.player.models.Player#validateVideo() -> Null
         * This method contains a try:catch block that runs through all the neccesary checks that each video must clear before playback can begin.
         *
         *      1. Is the video sensitive? (TV-MA+ rating)
         *      2. Is the user authenticated? (All registered users are assummed to be 18+)
         *      3. Do we know the user's age?
         *      4. If the age has come back from an age-gate form, is it in the right format?
         *      5. Is the user is under age for the video? (if so, drop a lockout cookie)
         *      6. Is the user locked out?
         *
        **/
        validateVideo:function()
        {
            try
            {
                this.checkForSensitiveContent();
                this.trigger('video:validation:success');
            }
            catch(e)
            {
                if(e instanceof sho.errors.AgeGateError)
                {
                    this.trigger('video:validation:' + e.message);
                }
                else
                {
                    console.log(e.stack || e);
                }
            }
        },

        checkForSensitiveContent:function()
        {
            if(this.always_flag_as_sensitive || this.isMatureContent()) this.checkForAuthenticatedUser()
        },

        checkForAuthenticatedUser:function()
        {
            if(!sho.accounts.isAuthenticated()) this.checkUserAge()
        },

        checkUserAge:function()
        {
            this.checkForLockout();
            this.checkForUnknownAge();
            this.checkDOBFormat();
            this.checkForUnderageUser();
        },

        checkForLockout:function(){
            if(this.getLockoutCookie()) throw new sho.errors.AgeGateError('lockout')
        },

        checkForUnknownAge:function(){
            if(!this.get('dob')) throw new sho.errors.AgeGateError('unknown_age');
        },

        checkDOBFormat:function(){
            if(!this.valid_format_for_date_of_birth.test(this.get('dob'))) throw new sho.errors.AgeGateError('invalid_dob');
        },

        checkForUnderageUser:function(){
            var restricted_age = this.getRestrictedAge();
            var user = Date.parse(this.get('dob')),
            at_least_this_old = Date.today().add({ years: -restricted_age});
            if(user.compareTo(at_least_this_old) > 0) // returns -1 if user < at_least_this_old, 1 if reverse
            {
                throw new sho.errors.AgeGateError('underage');
            }
        },

        clearDOB:function()
        {
            this.unset('dob');
        },

        getLockoutCookie:function()
        {
            return !!sho.util.Cookies.read(this.cookie_key);
        },

        setLockoutCookie:function()
        {
            sho.util.Cookies.write(this.cookie_key,true,2); // 2 days
            this.trigger('video:validation:lockout');
        },

        setDateOfBirth:function(attrs)
        {
            this.set({'dob':[attrs.day,attrs.month,attrs.year].join('-')});
            this.validateVideo();
        }


    };

    sho.provide('sho.errors');
    sho.errors.AgeGateError = function(msg){ this.message = msg; }
    sho.errors.AgeGateError.prototype = new Error();

    sho.clearLockout = function()
    {
        sho.util.Cookies.clear('sho_video_player_lockout'); return true
    }



sho.loaded_modules['/lib/js/sho/video/player/models/player/agegating.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

        sho.video.player.models.player.Sleep = {

            event_responders : {
                'video:loaded' : 'fireInitialSleepIfUsingFlashEvents',
                'change:sleeping' : 'onWakeSleep'
            },

            setSleepWakeHandlers:function()
            {
                if(!this.sleep_wake_supported) return; // this is set in base.js

                this.fn.resetSleepCheck = this.resetSleepCheck.bind(this);
                ($$('body')[0]).observe('mousemove', this.fn.resetSleepCheck);
                this.fn.onSleepCheck = this.sleep.bind(this);
                this.setSleepCheck();
            },

            fireInitialSleepIfUsingFlashEvents:function()
            {
                if(sho.video.use_flash_sleep_wake_events) this.set({'sleeping':true})
            },

            setSleepCheck:function()
            {
                this.sleep_wake_interval = setInterval(this.fn.onSleepCheck, 1000 * 5)
            },

            resetSleepCheck:function()
            {
                this.set({'sleeping':false});
                clearInterval(this.sleep_wake_interval);
                this.setSleepCheck();
            },

            onWakeSleep:function(eventName,e)
            {
                this.trigger('player:' + (e.attributes.sleeping ? 'sleep':'wake'));
            },

            canSleep:function()
            {
                return !this.get('loading') && !this.get('sleepDisabled')
            },

            sleep:function(){
                this.canSleep() && this.set({'sleeping':true});
            },

            wake:function(){
                this.set({'sleeping':false});
            },

            disableSleeping:function()
            {
                this.set({'sleepDisabled':true });
            },

            enableSleeping:function()
            {
                this.set({'sleepDisabled':false })
            }

        };

sho.loaded_modules['/lib/js/sho/video/player/models/player/sleep.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.models.player.ClosedCaptions = {

        event_responders : {
            'experience:current_video:ready' : 'onCurrentVideoReady',
            'change:cc' : 'onCaptionsEnabledDisabled',
            'change:cc_ui' : 'onCaptionsUIVisibilityChanged',
            'experience:dfxp:load:error' : 'onDFXPLoadError',
            'experience:dfxp:load:success' : 'onDFXPLoadSuccess',
            'video:change' : 'resetClosedCaptions'
        },

        relativize_dfxp_urls : false,

        hasClosedCaptions:function()
        {
            return !!this.getClosedCaptionsURL()
        },

        getClosedCaptionsURL:function()
        {
            var k = 'cc_url';                                                               // log(k+' is set? '+this.has(k));

            return this.has(k) ? this.get(k) : (function(captions)
            {
                this.attributes[k] = captions.URL;
                return captions.URL;

            }).call(this, this.bc_experience.getClosedCaptions());
        },

        onCurrentVideoReady:function(e, captions) // only used by smart API
        {
            this.set({'cc_url':captions.URL || false })
            this.hasClosedCaptions() && this.bc_experience.loadDFXP(captions.URL);
        },

        onDFXPLoadError:function(e, evnt)
        {
        },

        onDFXPLoadSuccess:function()
        {
        },

        getClosedCaptionsEnabled:function()
        {
            return this.get('cc') == 'ENABLED';
        },

        setClosedCaptionsEnabled:function(cc)
        {
            this.set({'cc': (cc ? 'ENABLED':'DISABLED')});
        },

        onCaptionsEnabledDisabled:function(e, evnt)
        {
            this.bc_experience.setClosedCaptionsEnabled(evnt.attributes.cc == 'ENABLED')
        },

        resetClosedCaptions:function()
        {
            this.attributes.cc = false;
            this.attributes.cc_url = undefined;
        },


        showClosedCaptionsOptions:function()
        {
            log('|cc| showClosedCaptionsOptions');
            this.bc_experience.showClosedCaptionsOptions()
        }

    };



sho.loaded_modules['/lib/js/sho/video/player/models/player/closedcaptions.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


        /**
         * class sho.video.player.models.Player
         * This class defines the model in the model-view-controller setup. There is quite a lot of complex functionality so it
         * is broken up into individual modules to keep things manageable, but all methods and properties are ultimately copied onto the model class itself.
         *
         * Each module also has the oppurtunity to set event listeners, which are related to the specific area of focus, but are set
         * on the resulting model class. For example, in the AgeGating mix-in:
         *
         *      event_responders : {
         *          'video:loaded' : 'clearDOB',
         *          'video:validation:underage' : 'setLockoutCookie'
         *      },
         *
         * For each pair in the hash, the key is the event name, and the value is the method name to be invoked in the model scope. In some instances,
         * an inline function definition is supplied, instead of a method name.
        **/

        sho.video.player.models.Player = Backbone.Model.extend((function(model_scope){

            var klass_template = {};
            var event_responders = {};
            _.each('Base Net Audio Playback Display Sharing AgeGating Sleep ClosedCaptions'.split(' '), function(module){

                _.extend( klass_template, model_scope[module]);

                _.keys(model_scope[module].event_responders || {}).each(function(e){
                    event_responders[e] = event_responders[e] || [];
                    event_responders[e].push(model_scope[module]['event_responders'][e]);
                })
            });

            _.extend( klass_template, {'event_responders':event_responders});

            return klass_template

        }(sho.video.player.models.player)));

sho.loaded_modules['/lib/js/sho/video/player/models/player.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/video/player/models.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.video.player.views
     * Namespace for the views in the video player MVC setup
    **/

    sho.provide('sho.video.player.views');

    sho.video.player.views.TabbedComponent = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.TabbedComponent',

        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'innerCntr' : this.el,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'data' : {}
            });

            this.build();
            this.setHandlers();
        },

        build:function()
        {
            this.container.insert(this.innerCntr);
        },

        setHandlers:function()
        {
        },

        activate:function() // called by tabs on reveal
        {
            this.render();
        },

        deactivate:function() // called by tabs on hide
        {
        },

        render:function(data)
        {
            this.innerCntr.update(Mustache.to_html(this.template, (data || this.data), (this.partials || this.views || {})));
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/tabbedcomponent.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.About = sho.video.player.views.TabbedComponent.extend({

        _KLASS_ : 'sho.video.player.views.About',

        className : 'video-player-about',

        template : '<p>{{{description}}}</p>', // 3x curlies prevents html markup from being escaped

        height : 160,

		orderBannerToken : '[order_banner]',

		orderBannerLink : '/sho/order/home',

		orderBanner : '<p class="order-banner">'+
					  '<a href="#">ORDER SHOWTIME</a> '+
					  'and you can get <strong>$25 CASH BACK!</strong><sup>*</sup>'+
					  '<a class="learn-more" href="#"><img class="arrow" src="/assets/images/order/doubleRed.png" />LEARN MORE</a>'+
					  '</p>',

		description : null,

		 events : {
	            'click p.order-banner a' : 'onOrderBannerClick'
	        },

        render:function()
        {
            this.description = this.model.getDescription();

			if (this.description.include(this.orderBannerToken)) {
				this.description = this.description.replace(this.orderBannerToken, this.orderBanner)
			}

			sho.video.player.views.TabbedComponent.prototype.render.call(this, {
                'description' : this.description
            });
        },

		onOrderBannerClick:function()
        {
			var t = sho.analytics.getTracker(); t.debug = true;
			t.trackClick({ 'click' : 'player:about:link_order' });

			window.location.href = this.orderBannerLink;
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/about.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.video.player.views.share');
    sho.video.player.views.share.ShareComponent = Backbone.View.extend({

        _KLASS_ :  'sho.video.player.views.share.ShareComponent',

        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'innerCntr' : this.el,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'data' : {}
            });

            this.setHandlers();
        },

        setHandlers:function()
        {
        },

        render:function(data)
        {
            var renderAttrs = _.extend({}, (data||{}), this.model.getShareableAttributes());
            this.innerCntr.update(Mustache.to_html(this.template,renderAttrs));
        }

    });
sho.loaded_modules['/lib/js/sho/video/player/views/share/sharecomponent.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.share.Social = sho.video.player.views.share.ShareComponent.extend({

        _KLASS_ :  'sho.video.player.views.share.Social',

        template : [
            '<h2>Share</h2>',
            '<div class="share-components group social-sharing">',
                '<div class="share-component twitter first">',
                    '<a href="https://twitter.com/share" class="twitter-share-button" data-count="none" data-url="{{shareUrl}}" data-text="{{videoTitle}}">Tweet</a>',
                 '</div>',
                '<div class="share-component">',
                    '<div class="google-plus">g</div>', // placeholder only
                '</div>',
				'<div class="share-component fb">',
					'<div id="video-fb-like" class="fb-share-button" data-href="','{{shareUrl}}','" data-send="false" data-type="button_count" data-show-faces="false" data-font="arial"></div>',
                '</div>',
            '</div>'
        ].join(''),

        setHandlers:function()
        {
            this.fn={};
            this.fn.renderSocialComponents = this.renderSocialComponents.bind(this);
        },

        render:function(data)
        {
            sho.video.player.views.share.ShareComponent.prototype.render.call(this, data);

            this.fn.renderSocialComponents.delay(sho.dom.REDRAW_DELAY, data);
        },

        renderSocialComponents:function(data)
        {
            twttr.widgets.load();

            FB.XFBML.parse(this.$('.share-component.fb')[0]);

            if(gapi)
            {
                gapi.plusone.render( this.$('.google-plus')[0], {
                    'annotation' : 'none',
                    'size' : 'medium',
                    'href' : data.shareUrl, // 'http://www.sho.com',
                    'count' : false,
                    'callback' : (function(data){
                        if(data && data.state == 'on') sho.dom.trigger('google:plus_one:on', data)
                    })
                });
            }
		}


    });
sho.loaded_modules['/lib/js/sho/video/player/views/share/social.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.share.Link = sho.video.player.views.share.ShareComponent.extend({

        _KLASS_ :  'sho.video.player.views.share.Link',

        template : [
            '<h2>',
                'Link Share',
                '<span class="feedback">&nbsp;</span>',
            '</h2>',
            '<form action="#">',

            '<span {{#clipboard_supported}}class="nested-button"{{/clipboard_supported}} id="share-link-wrap">',
                '<label for="linkShare">Share this link through email or IM:</label>',
                '<b><input name="linkShare" type="text" value="{{shareUrl}}" /></b>',
                '{{#clipboard_supported}}',
                '<a href="#" class="button" id="share-link-button">Copy</a>',
                '{{/clipboard_supported}}',
            '</span>',

            '{{#embed_supported}}',
            '<span {{#clipboard_supported}}class="nested-button"{{/clipboard_supported}} id="share-embed-wrap">',
                '<label for="embedCode">Copy and paste this embed code:</label>',
                '<b><input name="embedCode" type="text" value="{{embedCode}}" /></b>',
                '{{#clipboard_supported}}',
                '<a href="#" class="button" id="share-embed-button">Copy</a>',
                '{{/clipboard_supported}}',
            '</span>',
            '{{/embed_supported}}',

            '</form>'
        ].join(''),


        button_dimensions : {'width':53,'height':22},

        fn : {},

        setHandlers:function()
        {
            if(window.clipboardData && window.clipboardData.setData)
            {
                this.clipboard_mode = 'JS';
                this.clipboard_supported = true;
            }
            else if(sho.isDesktop() && !!ZeroClipboard) // previously this was if(!!ZeroClipboard && !sho.isIpad()), which broke entire component on ipad
            {
                this.clipboard_mode = 'Flash';
                this.clipboard_supported = true;
            }
            else
            {
                this.clipboard_supported = false;
            }

            if(this.clipboard_supported)
            {
                var method = 'init'+this.clipboard_mode+'Clipboard';
                this.fn.initClipboard = this[method].bind(this)
            }
        },

        render:function(data)
        {
            this.determineEmbedSupport();  // we don't draw the embed-code functionality for tv-ma videos

            sho.video.player.views.share.ShareComponent.prototype.render.call(this, _.extend(data, {
                'clipboard_supported' : this.clipboard_supported,
                'embed_supported': this.embed_supported,
            }));

            this.clipboard_supported && this.fn.initClipboard.delay(sho.dom.REDRAW_DELAY);
        },

        determineEmbedSupport:function()
        {
            if(this.model.isMatureContent())
            {
                this.embed_supported = false;
                this.linkables = ['link']
            }
            else
            {
                this.embed_supported = true
                this.linkables = ['embed','link']
            }
        },

        initJSClipboard:function()
        {
            this.fn.copyToClipboard = this.copyToClipboard.bind(this);
            $$('#share-link-button, #share-embed-button').invoke('observe', 'click', this.fn.copyToClipboard);
        },


        initFlashClipboard:function()
        {
            var th=this;
            _.each(this.linkables, function(key)
            {
                var container = th.innerCntr.select('#share-'+key+'-wrap')[0],
                    button = th.innerCntr.select('#share-'+key+'-button')[0],
                    clipboard = new ZeroClipboard.Client()
                ;

                clipboard.setHandCursor(true);
                clipboard.setCSSEffects(false);
                clipboard.setText(th.getClippingText(key));
                clipboard.button = button;

                container.insert(clipboard.getHTML(th.button_dimensions.width,th.button_dimensions.height));

                clipboard.addEventListener('complete', function(){
                    th.updateFeedback(key+' copied successfully');
                    th.model.trigger('clipboard:copied', key);
                });
                clipboard.addEventListener('mouseOver', function(c){
                    c.button.addClassName('over');
                });
                clipboard.addEventListener('mouseOut', function(c){
                    c.button.removeClassName('over');
                });

                th[key] = {'clipboard':clipboard};
                window[key+'_clipboard'] = clipboard;
            });

        },

        copyables:function()
        {
            return this.embed_supported ? ['embed','link'] : ['link']
        },


        copyToClipboard:function(e)
        {
            var el = e.findElement('a'), key = el.id.gsub(/share-|-button/,'');
            window.clipboardData.setData('text', this.getClippingText(key));
            this.model.trigger('clipboard:copied', key);
            this.updateFeedback(key+' copied successfully');
        },

        deactivate:function()
        {
            if(this.clipboard_supported) {
                this['destroy'+this.clipboard_mode+'Clipboard']();
            }
        },

        destroyFlashClipboard:function()
        {
            var th=this;
            _.each(this.linkables, function(key)
            {
                if(th[key].clipboard && th[key].clipboard.movie)
                {
                    th[key].clipboard.movie.remove();
                    th[key].clipboard = null;
                }
            });
        },

        destroyJSClipboard:function()
        {
            $$('#share-link-button, #share-embed-button').invoke('stopObserving', 'click', this.fn.copyToClipboard);
        },

        updateFeedback:function(msg)
        {
            (this.innerCntr.select('.feedback')[0]).update(' / ' + msg);
        },

        getClippingText:function(kind)
        {
            return kind == 'link' ? this.model.getContentUrl() : this.model.getEmbedCode()
        }



    });
sho.loaded_modules['/lib/js/sho/video/player/views/share/link.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.share.Email = sho.video.player.views.share.ShareComponent.extend({

        _KLASS_ :  'sho.video.player.views.share.Email',

        template : [
            '<h2>',
                'Email It',
                '{{#feedback}}<span class="feedback{{#hasErrors}} errors{{/hasErrors}}"> / {{feedback}}</span>{{/feedback}}',
            '</h2>',

            '<form action="#" method="post" {{#loading}}class="loading"{{/loading}}>',
            '<table>',
            	'<tr class="sender-recipient">',
            		'<td{{#errors.senderEmailAddress}} class="error"{{/errors.senderEmailAddress}}>',
            		    '<label for="senderEmailAddress">Your Email</label><br />',
            			'<b><input id="senderEmailAddress" name="senderEmailAddress" type="text" value="{{senderEmailAddress}}"/></b>',
            		'</td>',
            		'<td width="2%">',
            		'</td>',
            		'<td{{#errors.recipientEmailAddresses}} class="error"{{/errors.recipientEmailAddresses}}>',
            			'<label for="recipientEmailAddresses">Friend\'s Email(s)</label><br />',
            			'<b><input id="recipientEmailAddresses" name="recipientEmailAddresses" type="text" value="{{recipientEmailAddresses}}"/></b>',
            		'</td>',
            	'</tr>',
            	'<tr>',
            		'<td colspan="3">',
            			'<label for="subject">Subject</label><br />',
            			'<b><input id="subject" name="subject" type="text" value="{{subject}}"/></b>',
            		'</td>',
            	'</tr>',
            	'<tr>',
            		'<td colspan="3">',
            			'<label for="message">Message: (Optional)</label><br />',
            			'<b><textarea id="message" name="message">{{message}}</textarea></b>',
            		'</td>',
            	'</tr>',
            	'<tr>',
            		'<td colspan="3">',
            			'<a href="#" class="button submit">Send</a>',
            			'{{#loading}}<u class="spinner">Loading...</u>{{/loading}}',
            		'</td>',
            	'</tr>',
            	'<input id="shareUrl" name="shareUrl" type="hidden" value="{{shareUrl}}"/>',
            '</table>',
            '</form>'
        ].join(''),

        events : {
            'click .submit' : 'sendEmail'
        },

        fn : {},

        setHandlers:function()
        {

            this.fn.onLoading = this.render.bind(this, {'loading' : true, 'hasErrors' : false, 'errors' : [] });
            this.model.bind('shareable:loading', this.fn.onLoading)

            this.fn.onSuccess = this.render.bind(this, {'loading' : false, 'hasErrors' : false, 'errors' : [], 'feedback' : 'Your message has been sent successfully' });
            this.model.bind('shareable:success', this.fn.onSuccess);

            var th =this;
            this.model.bind('shareable:error', (function(errors){
                th.render({
                    'errors': th.collectErrors(errors || []),
                    'hasErrors' : (errors || []).length > 0,
                    'feedback':'Please check the information below:',
                    'loading' : false
                });

            }));
        },


        collectErrors:function(list)
        {
            return (list.inject({}, function(errors, e){
                errors[e.field] = e.message; return errors;
            }));
        },

        sendEmail:function(e)
        {
            var form = Event.findElement(e,'a').up('form'); Event.stop(e);
            this.controller.sendEmail(form.serialize(true)); // prototypejs' serialize method accepts an option to cast to object literal, by passing true here.
        }

    });
sho.loaded_modules['/lib/js/sho/video/player/views/share/email.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.Share = sho.video.player.views.TabbedComponent.extend({

        _KLASS_ : 'sho.video.player.views.Share',

        className : 'video-player-share',
        height : 254,
        url : '/rest/share', // path to sharing action
        share_panes : ['social','link','email'],

        build:function()
        {
            this.container.insert(this.innerCntr.update(this.share_panes.collect(function(kind){
                return ['',
                '<div class="share-pane '+kind+'">',
                    '<span></span>',
                '</div>'];
            }).flatten().join('')));

            var th=this,k='',klass={};

            this.innerCntr.select('.share-pane').each(function(el){
                k = el.className.gsub(/share-pane\s/,'');
                klass = sho.video.player.views.share[k.capitalize()]; (th[k] = new klass({
                    'container' : th.innerContainer,
                    'el' : el.down(), // => <span>
                    'model' : th.model,
                    'controller' : th.controller
                }))
            })
        },

        render:function()
        {
            var initialRenderAttrs = {
                'shareUrl' : this.model.getContentUrl(),
				'videoTitle' : this.model.getTitle(),
                'embedCode' :  this.model.getEmbedCode(),
                'hasErrors' : false,
                'feedback' : null
            };

            this.social.render(initialRenderAttrs);
            this.link.render(initialRenderAttrs);
            this.email.render(initialRenderAttrs);
        },

        deactivate:function()
        {
            this.link.deactivate();
        }

    });


sho.loaded_modules['/lib/js/sho/video/player/views/share.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.RelatedVideos = sho.video.player.views.TabbedComponent.extend({

        _KLASS_ : 'sho.video.player.views.RelatedVideos',

        className : 'group related-videos-inner',

        events : {
            'click' : 'selectVideo'
        },

        template : [

            '{{#videos}}',
            '<div class="video" data-video-id="{{id}}">',
                '<span class="thumb">',
                    '<img src="http://www.sho.com{{image.path}}" />',
                '</span>',
                '<span class="title">',
                    '{{contextualTitle}}',
                '<span>',
            '</div>',
            '{{/videos}}',
            '{{^videos}}',
            'There are no related Videos for this title.',
            '{{/videos}}'

        ].join(''),

        first_render : true,
        standard_num_videos : 10,
        width : 2000, // 200px thumb * 10 videos (todo: make this dynamic, some titles have fewer than 10, for example: 16532
        height : 180,
        thumb_width : 200,
        step_size : 100,

        fn : {},


        setHandlers:function()
        {
            this['set'+ (sho.isTablet() ? 'Tablet' : 'Desktop')+'Handlers'].call(this);
        },

        setTabletHandlers:function()
        {
            this.fn.initIScroll = this.initIScroll.bind(this);
        },

        setDesktopHandlers:function()
        {
            this.fn.mouseEnter = this.setGlideHandlers.bind(this);
            this.innerCntr.observe('mouseenter', this.fn.mouseEnter);

            this.fn.mouseLeave = this.unsetGlideHandlers.bind(this)
            this.innerCntr.observe('mouseleave', this.fn.mouseLeave);

            this.fn.onresize = this.setViewportWidth.bind(this)
            this.model.bind('stage:resize', this.fn.onresize);
            this.setViewportWidth();
        },

        setGlideHandlers:function()
        {
            this.isAnimating = false;
            this.innerCntr._left = this.innerCntr._left || 0;
            this.fn.mouseMove = this.mouseMove.bind(this);
            this.innerCntr.observe('mousemove', this.fn.mouseMove);
            this.fn.onGlideInterval = this.onGlideInterval.bind(this);
            this.glideItvl =  setInterval(this.fn.onGlideInterval, 41 );
        },

        unsetGlideHandlers:function()
        {
            clearInterval(this.glideItvl);
            this.innerCntr.stopObserving('mousemove', this.fn.mouseMove);
        },


        setViewportWidth:function(e)
        {
            this.viewportWidth = document.viewport.getWidth()
        },

        mouseMove:function(e)
        {
            if(this.width < this.viewportWidth && this.innerCntr._left == 0) return;    // nothing to glide!

            var x = e.pageX, w = this.viewportWidth, pan = x/w;

            if((pan < 0.33 || pan > 0.66))
            {
                this.isAnimating = true;
                this.force = 0.5 - pan;
                this.direction = pan < 0.33 ? 'right':'left';
            }
            else
            {
                this.isAnimating = false;
                this.force = 0;
            }
        },

        onGlideInterval:function()
        {
            if(this.isAnimating)
            {
                var step = this.step_size * this.force,

                left = this.innerCntr._left + step,

                offset = this.viewportWidth-this.width,

                canGlide = (this.direction == 'left' && (offset<left)) || (this.direction == 'right' && left <= 0)
                ;

                left = canGlide ? left : (this.direction == 'left' ? offset : 0);

                this.innerCntr.setStyle({'left':left+'px'})._left = left;
            }
        },


        selectVideo:function(e)
        {
            e.preventDefault(); var el = Event.findElement(e, '.video'); if(el){
                this.controller.loadRelatedVideo(el.readAttribute('data-video-id'))
            }
        },

        render:function()
        {
            this.data.videos = this.model.getRelatedVideos();                               // populate the view with data
            this.width = this.data.videos.length * this.thumb_width;                        // calculate width now that data is available
            this.innerCntr.setStyle(sho.object.toPixels({'width':this.width, 'left':0 }));  // apply width to container and remove any left-over glide styles
            this.innerCntr._left = 0;

            sho.video.player.views.TabbedComponent.prototype.render.call(this);             // call super();
            if(sho.isTablet()) this.fn.initIScroll.delay(sho.dom.REDRAW_DELAY);             // init scroller if neccesary
        },


        initIScroll:function()
        {
            if(this.scroller) this.scroller.destroy();

            this.scroller = new iScroll(this.container, {
                'vScroll'    : false,   // disable vertical scrolling
                'vScrollbar' : false,   // no vertical scrollbar indicator
                'hScrollbar' : false,   // no horizontal scrollbar indicator
                'momentum'   : true,    // breaks if set to false
                'bounce'     : false    // causes layout issues if set to true
            });
        }



    })


sho.loaded_modules['/lib/js/sho/video/player/views/relatedvideos.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.Tabs = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Tabs',

        className : 'tabs tabs-outer',

        item_config : [{
            'klass' : 'related-videos',
            'title' : 'Related Videos'
        },{
            'klass' : 'share',
            'title' : 'Share'
        },{
            'klass' : 'about',
            'title' : 'About'
        }],

        klass_names : {
            'toggle' :  'tab-toggle',
            'body' :    'tab-body',
            'tab' : 'tab',
            'activeItem' : 'aktiv'
        },

        right_to_left : true,

        template : [
        '<div class="tabs-head {{#right_to_left}} rtl{{/right_to_left}}">',
            '<ul class="inline">',
                '{{#item_config}}',
                '<li class="tab tab-toggle" id="tab-toggle-{{klass}}"><a href="#"><b>{{title}}</b></a></li>',
                '{{/item_config}}',
            '</ul>',
        '</div>',
        '<div class="tabs-body">',
            '{{#item_config}}',
            '<div class="tab tab-body {{klass}}" id="tab-body-{{klass}}"></div>',
            '{{/item_config}}',
        '</div>'
        ].join(''),


        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'innerCntr' : this.el,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'items' : {}
            });

            this.build();
            this.setHandlers();
        },

        build:function()
        {
            this.container.insert(this.innerCntr);
            this.innerCntr.insert(Mustache.to_html(this.template, this));
        },

        setHandlers:function()
        {
            this.collectElements('toggle');
            this.collectElements('body');
            this.item_keys = _.keys(this.items);
            this.innerCntr.observe('click', this.click.bind(this));
        },

        collectElements:function(key)
        {
            var th=this;
            this.innerCntr.select('.'+this.klass_names[key]).each(function(el)
            {
                var k=el.id.gsub(th.klass_names[key]+'-','');
                th.items[k] = th.items[k] || {};
                th.items[k][key] = el;
                th.items[k].aktiv = false;
                if(key == 'body') { el.setStyle({'height':'0px'}) }//el.hide(); //el.setStyle({'height':'0px'});
            })
        },

        click:function(e)
        {
            e.stop();

            var el = e.findElement('.'+this.klass_names.toggle);
            el && this.activateTab(el.id.gsub(this.klass_names.toggle+'-',''));
        },

        activateTab:function(tab)
        {
            if(this.last_tab && this.last_tab !== tab)
            {
                this.blur(this.last_tab);
            }

            if(!this.items[tab].aktiv)
            {
                this.focus(tab);
                this.last_tab = tab;
            }
            else
            {
                this.toggle(tab);
                this.last_tab = null;
            }

            sho.video.trackClick(tab);
        },

        activateComponent:function(t)
        {
            this.items[t].aktiv = true;
            (this.getComponent(t) || this.initComponent(t)).activate();

            this.trigger('tabs:activated', {
                'tab' : this.getComponent(t)
            });
        },

        initComponent:function(t)
        {
            var k = t.capitalize().camelize(), klass = sho.video.player.views[k]
            ;
            return this.setComponent(t, new klass({
                'container' : this.getBody(t),
                'model' : this.model,
                'controller' : this.controller
            }))
        },

        deactivateComponent:function(t)
        {
            this.items[t].aktiv = false;
            if(this.getComponent(t))
            {
                this.getComponent(t).deactivate();
            }
        },

        getTab:function(id){
            return this.items[id];
        },

        getToggle:function(id){
            return this.items[id].toggle
        },

        getBody:function(id){
            return this.items[id].body
        },

        getComponent:function(id){
            return (this.items[id] || {'component':null}).component
        },

        setComponent:function(id, cmp){
            this.items[id].component = cmp;
            return this.items[id].component;
        },

        reset:function()
        {
            this.last_tab = null;

            var th=this;
            this.item_keys.each(function(t){
                th.getBody(t).setStyle({'height':'0px'});
                th.deactivateComponent(t);
                th.getToggle(t).removeClassName(th.klass_names.activeItem);
            })
        },


        focus:function(tab)
        {
            this.activateComponent(tab);
            this.tween('focus', tab);
        },

        blur:function(tab)
        {
            this.deactivateComponent(tab);
            this.tween('blur', tab);
        },

        toggle:function(tab)
        {
            this.blur(tab);
            this.trigger('tabs:collapsed')
        },

        tween:function(mode, tab)
        {
            var toggle = this.getToggle(tab),
                body = this.getBody(tab),
                height = this.getComponent(tab).height,
                isTween = sho.video.tweens.isSupported('tabs', mode)
            ;

            if(mode == 'focus')
            {
                toggle.addClassName(this.klass_names.activeItem);

                if(isTween){
                    body.morph('height:'+height+'px', sho.video.tweens.deefault);
                } else {
                    body.setStyle({'height':height+'px'});
                }
            }

            else
            {
                toggle.removeClassName(this.klass_names.activeItem);

                if(isTween) {
                    body.setStyle({
                        'borderBottom':'#2A2A2A solid 1px'
                    }).morph(''+
                        'height:0;', _.extend({
                            'after':(function(t){
                                t.element.setStyle({'border':'none'})
                            })
                        }, sho.video.tweens.deefault)
                    );

                } else {
                    body.setStyle({'height':0+'px'});
                }
            }

        }


    })


sho.loaded_modules['/lib/js/sho/video/player/views/tabs.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.Dock = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Dock',

        toggle_height : 32,
        fn:{},

        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container, // div.video-player-dock
                'model' : cfg.model,
                'controller' : cfg.controller,
                'tweening' : false,
                '_open' : false
            });

            this.build();
            this.setHandlers();
        },

        build:function()
        {
            this.tabs = new sho.video.player.views.Tabs({
                'container' : this.container,
                'model' : this.model,
                'controller' : this.controller
            })
        },

        setHandlers:function()
        {
            this.fn.update = this.update.bind(this);
            this.model.bind('all', this.fn.update);
            this.tabs.bind('all', this.fn.update);
            this.fn.afterTween = this.afterTween.bind(this);
        },

        update:function(eventName,e)
        {
            if(['video:loading','video:changed'].include(eventName)){
                this.tabs.reset();
                this.close();
                window.dock = this;
            }
            if('tabs:activated' == eventName){
                this.open(e);
            }
            if('tabs:collapsed' == eventName){
                this.close();
            }
            if('player:wake' == eventName){
                this.focus();
            }
            if('player:sleep' == eventName){
                this.blur();
            }
            if('experience:media:complete' == eventName){
                if(!this._open) this.activateTab('related-videos');
            }
        },

        open:function(e)
        {
            this.tween('open', e.tab.height + this.toggle_height);
            this.model.disableSleeping();
            this._open = true;
        },

        close:function()
        {
            this.tween('close', this.toggle_height);
            this.model.enableSleeping();
            this._open = false;
        },

        focus:function()
        {
            this.tween('focus');
        },

        blur:function()
        {
            this.tween('blur');
        },

        tween:function(mode, height)
        {
            var t={},
            c = $j(this.container);

            if(mode == 'focus')                         t.opacity=1;
            if(mode == 'blur')                          t.opacity=0;
            if(mode == 'open' || mode == 'close')       t.height=height;
            if(this.tweening && mode == 'blur') return  // prevent the loss of controls when mouse idles out in middle of a tween

            if(sho.video.tweens.isSupported('dock',mode))
            {
                c.animate(t,sho.video.tweens.deefault.duration * 1000, 'linear', this.fn.afterTween );
            }
            else
            {
                c.css(t); // jQuery css() method doesn't require 'px' for width/height!
            }
        },

        afterTween:function(mode)
        {
            this.tweening = false;

        },

        activateTab:function(t)
        {
            this.tabs.activateTab(t);
        }


    })

sho.loaded_modules['/lib/js/sho/video/player/views/dock.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.BaseControl = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.controls.BaseControl',

        className : 'control',
        render_on_startup : true,

        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'controller' : cfg.controller,
                'model' : cfg.model
            });

            this.build();
            this.setHandlers();
            if(this.render_on_startup) this.render();
        },

        build:function()
        {
            this.container.insert(this.el);
        },

        setHandlers:function()
        {
            this.model.bind('all', this.render.bind(this));
        },

        render:function()
        {
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls/basecontrol.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.controls.TimeDisplay = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.TimeDisplay',

        className : 'control piped time-display',


        build:function()
        {
            _.extend(this, {
                'current' : this.make('span', {'class':'time-display-current'}, '00:00'),
                'duration' : this.make('span', {'class':'time-display-duration'}, '00:00')
            });
            this.el.insert(this.current);
            this.current.insert({'after':' / '});
            this.el.insert(this.duration);

            sho.video.player.views.controls.BaseControl.prototype.build.apply(this);
        },

        setHandlers:function()
        {
            this.model.bind('all', this.render.bind(this));
        },

        render:function(eventName, e)
        {
            if(e && typeof e.position == 'number')
            {
                this.current.update(sho.number.toTimeCode(e.position));
                this.duration.update(sho.number.toTimeCode(e.duration));
            }
            return this;
        }
    })




sho.loaded_modules['/lib/js/sho/video/player/views/controls/timedisplay.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.controls.Timeline = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.Timeline',

        className : 'control timeline',
        render_on_startup : false,
        margins : {
            'left':36,
            'right':248 //214
        },
        height:26,

        fn : {},

        build:function()
        {
            this.el.insert(['',
           		'<div class="timeline-position"><span class="timeline-title">&nbsp;</span></div>',
           		'<div class="timeline-cursor" style="display:none"><span>.</span></div>',
            ''].join(''));

            _.extend(this, {
                'position' : this.el.select('.timeline-position')[0],
                'title' : this.el.select('.timeline-title')[0],
                'cursor' : this.el.select('.timeline-cursor')[0]
            });

            sho.video.player.views.controls.BaseControl.prototype.build.apply(this);
        },

        setHandlers:function()
        {
            if(sho.video.brightcove.isSmartAPI()) this.margins.right = 123; /* was 63*/

            this.fn.render = this.render.bind(this);
            this.model.bind('experience:media:progress', this.fn.render);
            this.model.bind('experience:media:seek_notify', this.fn.render);

            this.fn.updateTitle = this.updateTitle.bind(this);
            this.model.bind('experience:media:change', this.fn.updateTitle);

            this.fn.onMouseDown = this.onMouseDown.bind(this);
            this.fn.onMouseUp = this.onMouseUp.bind(this);
            this.fn.seekIfInBounds = this.seekIfInBounds.bind(this);
            this.el.observe('mousedown', this.fn.onMouseDown);
            (sho.video.getOuterContainer()).observe('mouseup', this.fn.onMouseUp);
        },

        render:function(e)
        {
            var progress = (e ? (e.progress) : 0);
            this.updatePositionBar(progress);
        },

        updateTitle:function()
        {
            this.title.update(this.model.getTitle())
        },

        onMouseDown:function(e)
        {
            e.stop();
            this.cursor.show();
            this.seekIfInBounds(e); //seek is always fired here
            (sho.video.getOuterContainer()).observe('mousemove', this.fn.seekIfInBounds);
        },

        onMouseUp:function(e)
        {
            (sho.video.getOuterContainer()).stopObserving('mousemove', this.fn.seekIfInBounds);
            this.cursor.hide();
        },


        seekIfInBounds:function(e)
        {
            var win = document.viewport.getDimensions(),
            bounds = {
                'left' : this.margins.left-1,
                'top' : win.height - this.height,
                'right' : win.width - (this.margins.right+1),
                'bottom' : win.height
            };
            if(!e.clientY) return;

            if((e.clientX > bounds.left && e.clientX < bounds.right) && (e.clientY > bounds.top && e.clientY < bounds.bottom))
            {
                var s = (e.clientX - bounds.left) / (bounds.right - bounds.left);
                this.controller.seek(s)
            }
        },

        updatePositionBar:function(factor) /* 0 - 1 */
        {
            this.position.setStyle({ 'width' : (factor * 100).toFixed(2) +'%' });
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls/timeline.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.controls.Volume = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.Volume',

        className : 'control piped audio-volume',

        build:function()
        {
            this.el.insert([
            '<div class="audio-volume-inner">',
				'<div class="audio-volume-indicator">.',
					'<div class="audio-volume-cursor">.</div>',
				'</div>',
		    '</div>'
            ].join('')); _.extend(this, {
                'inner' : this.el.select('.audio-volume-inner')[0],
                'indicator' : this.el.select('.audio-volume-indicator')[0]
            });

            sho.video.player.views.controls.BaseControl.prototype.build.apply(this);
        },

        setHandlers:function()
        {
            this.model.bind('change:volume', this.render.bind(this));
            this.inner.observe('mousedown', this.onMouseDown.bind(this));
            (sho.video.getOuterContainer()).observe('mouseup', this.onMouseUp.bind(this));
        },

        render:function()
        {
            var v = Math.round(this.model.get('volume') * 100);
            this.indicator.setStyle({'width':v +'%' });
        },

        onMouseDown:function(e)
        {
            this.scrubIfInBounds(e);
            (sho.video.getOuterContainer()).observe('mousemove', this.scrubIfInBounds.bind(this)); e.stop();
        },

        scrubIfInBounds:function(e)
        {
            if(e.findElement('.audio-volume-inner')){
                var x = e.offsetX || e.layerX, // webkit || firefox
                    w = this.inner.getWidth(),
                    fx = (Math.floor(x/w*100))/100,
                    fx = fx > 9.94 ? 1 : fx
                ;
                this.controller.setVolume(fx)
            };
        },

        onMouseUp:function(e)
        {
            (sho.video.getOuterContainer()).stopObserving('mousemove');
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls/volume.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.controls.MuteUnmute = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.MuteUnmute',

        className : 'control piped audio-mute-unmute',

        events : {
            "click" : "toggleIsMuted"
        },

        setHandlers:function()
        {
            this.model.bind('change:muted', this.render.bind(this));
        },

        render:function()
        {
            this.el.className = this.className +(this.model.isMuted() ? ' muted' : '');
        },

        toggleIsMuted:function()
        {
            this.controller.toggleIsMuted();
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls/muteunmute.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.controls.ClosedCaptions = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.ClosedCaptions',

        className : 'control piped closed-captions',

        events : {
            "click .cc"     : "toggleClosedCaptions",
            "click .cc-ui"  : "hideShowClosedCaptionsUI"
        },

        setHandlers:function()
        {
            var th=this;

            _.each([
                'experience:media:change',
                'experience:dfxp:load:error',
                'change:cc',
                'change:cc_url',
                'change:cc_ui'
            ]
            ,
            function(e){
                th.model.bind(e, th.render.bind(th, e));
            })

        },

        render:function(eventName)
        {
            var k = '';
            if(this.model.hasClosedCaptions())                  k += ' captions-exist';
            if(this.model.getClosedCaptionsEnabled())           k += ' captions-enabled';
            if(eventName == 'experience:dfxp:load:error')       k += ' captions-error';


            this.el.update('<span class="cc">.</span><span class="cc-ui">.</span>');
            this.el.className = this.className + k;
        },

        toggleClosedCaptions:function()
        {
            this.hasCaptions() && this.controller.toggleClosedCaptions();
        },

        hideShowClosedCaptionsUI:function()
        {
            this.hasCaptions() && this.controller.showClosedCaptionsOptions(); // this.controller.toggleClosedCaptionsUIVisibility()
        },

        hasCaptions:function()
        {
            return this.el.hasClassName('captions-exist');
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls/closedcaptions.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.controls.PlayPause = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.PlayPause',

        className : 'control play-pause',

        events : {
            "click" : "togglePlaying"
        },

        setHandlers:function()
        {
            this.model.bind('change:playing', this.render.bind(this));
        },

        render:function()
        {
            this.el.className = this.className + ' '+(this.model.isPlaying() ? 'playing' : 'paused');
            return this;
        },

        togglePlaying:function()
        {
            this.controller.togglePlaying();
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls/playpause.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.Controls = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Controls',

        /**
         * class sho.video.player.views.Controls < Backbone.View
         * Wrapper around the player controls
        **/

        /**
         * new sho.video.player.views.Controls(cfg)
         * Create an instance of the Controls view class, which wraps the individual controls
         * that are housed in an absolutely-positioned container in the bottom of the viewport.
        **/
        initialize:function(cfg)
        {
            /**
             * sho.video.player.views.Controls.controls = []
             * A list of control elements to build up the ui. note that the smart player doesn't have volume controls.
             * they are absolutely positioned, so insertion order should not matter, meaning we can remove
             * the offending flash-only controls from this list at startup.
            **/

            this.controls = $w('play-pause timeline closed-captions time-display mute-unmute volume');

            sho.video.brightcove.isFlashAPI() || this.controls.splice(-2,2);

            cfg.container.insert([
            '<div class="video-player-controls video-player-controls-outer">',
                '<div class="video-player-controls-inner"></div>',
            '</div>'].join(''));

            _.extend(this, {
                'controller' : cfg.controller,
                'container' :  cfg.container.select('.video-player-controls')[0],
                'innerCntr' :  cfg.container.select('.video-player-controls-inner')[0],
                'outerTitle' : cfg.title
            });

            var th=this, key='', klass=''; this.controls.each(function(k)
            {
                key = k.capitalize().camelize();
                klass = sho.video.player.views.controls[key];

                this[key] = new klass({
                    'model' : th.model,
                    'controller' : th.controller,
                    'container' : th.innerCntr
                });
            })

            this.setHandlers();
        },

        setHandlers:function()
        {
            this.model.bind('player:wake', this.focus.bind(this));
            this.model.bind('player:sleep', this.blur.bind(this));
            this.blurrables = [this.container, this.outerTitle];
        },

        focus:function()
        {
            this.tween('focus');
        },

        blur:function()
        {
            this.tween('blur');
        },

        tween:function(mode)
        {
            if(sho.video.tweens.isSupported('controls', mode))
            {
                $j(this.blurrables).fadeTo(
                    sho.video.tweens.deefault.duration * 1000,
                    (mode == 'blur' ? 0 : 1)
                );
            }
            else
            {
                this.blurrables.invoke('setStyle', {
                    'display' : (mode == 'blur' ? 'none' : 'block')
                })
            }
        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/controls.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.BenchMarker = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.BenchMarker',

        initialize:function(cfg)
        {
            _.extend(this, {
                'fn' : {},
                'stealthmode' : true, //!(sho.env.isDev() || sho.env.isLocal()),
                'container' : cfg.container,
                'model' : cfg.model
            });

            if(!this.stealthmode) this.build();
            this.setHandlers();
        },

        build:function()
        {
            this.container.update(['',
            '<table width="100%" border="1">',
                '<tbody>',
                    '<tr>',
                    '<th width="48%">event</th>',
                    '<th width="40%">duration</th>',
                    '<th width="8%"><a class="closer" href="#">X</a></th>',
                    '</tr>',
                '</tbody>',
            '</table>',
            ''].join(''));

            this.table = this.container.select('table tbody')[0];
        },

        setHandlers:function()
        {
            this.fn.update = this.update.bind(this);
            this.fn.click = this.click.bind(this);

            this.model.bind('experience:template:ready', this.fn.update);
            this.model.bind('video:loaded', this.fn.update);
            this.stealthmode || this.container.observe('click', this.fn.click);
        },

        update:function()
        {
            var b = this.model.getBenchMark(),
                t = new Date(),
                d = t - b.timestamp,
                duration = d / 1000;
            ;
            this.print(b.label,duration);
        },

        print:function(e,duration)
        {
            if(!this.stealthmode && this.table)
            {
                this.table.insert({
                    'bottom':['<tr><td>', e,'</td><td colspan="2">', duration,'</td></tr>'].join('')
                })
            }
            else
            {
                console.log('|player| '+e+' : '+duration);
            }
        },

        click:function(e)
        {
            e.stop(); if(e.findElement('a.closer')) this.destroy();
        },

        destroy:function()
        {
            this.model.unbind('experience:template:ready', this.fn.update);
            this.model.unbind('video:loaded', this.fn.update);
            this.container.stopObserving('click');
            this.container.remove();
            this.container = null;
        }

    })

sho.loaded_modules['/lib/js/sho/video/player/views/benchmarker.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.video.player.views.AgeGate = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.AgeGate',

        className : 'docked video-player-age-gate',

        template : ['',

        	'<form action="#" id="video-player-age-gate-form" class="{{#has_errors}}errors{{/has_errors}}">',
        	    '{{^lockout}}',
        		'<fieldset>',
        		'<p class="feedback">',
        			'{{feedback}}',
        		'</p>',
        		'<p>',                                                  // clear() only works in desktop???
        			'<input name="month" type="text" size="2" value="MM" onfocus="this.clear();" />',"\n",
        			'<input name="day" type="text" size="2" value="DD" onfocus="this.clear();" />',"\n",
        			'<input name="year" type="text" size="4" value="YYYY" onfocus="this.clear();" />',"\n",
        		'</p>',
        		'<p>',
        			'<a href="#" class="button submit">Submit</a>',
        		'</p>',
        		'</fieldset>',
        		'{{/lockout}}',

        		'{{#lockout}}',
        		'<p class="lockout-message">',
        			'We\'re sorry. You are ineligible to watch this video.<br />',
        			'<a href="#" class="button cancel">Okay</a>',
        		'</p>',
        		'{{/lockout}}',
        	'</form>',
            '<div class="video-player-closer">&nbsp;</div>'

        ].join(''),

        events : {
            'click .submit' :               'submitDateOfBirth',
            'click .cancel' :               'goodbye',
            'click .video-player-closer' :  'goodbye'                   // extra closer to abort age-gate
        },

        fn : {},

        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'innerCntr' : this.el,
                'dimensions' : (sho.isIpad() ? sho.string.toDimensions('425x175') : sho.string.toDimensions('350x150')),
                'data' : {
                    'marginTop' : 50,
                    'feedback' : 'Please enter your date of birth to watch this video:',
                    'lockout' : cfg.lockout
                }
            });


            this.build();
        },

        build:function()
        {
            this.container.insert(this.el);
            this.setHandlers();
            this.render();
        },

        setHandlers:function()
        {
            this.fn.centerVertically = this.centerVertically.bind(this);
            this.fn.renderWithError = this.render.bind(this, {
                'has_errors' : true, 'feedback' : 'That is not a valid date of birth'
            });
            this.fn.renderLockout = this.render.bind(this, {
                'lockout' : true
            });

            this.model.bind('stage:resize', this.fn.centerVertically);
            this.model.bind('video:validation:invalid_dob', this.fn.renderWithError );
            this.model.bind('video:validation:lockout', this.fn.renderLockout );
        },

        render:function(data)
        {
            this.innerCntr.update(Mustache.to_html(this.template, _.extend({}, this.data, (data || {})) ));
            this.centerVertically();
        },

        centerVertically:function()
        {
            var form = (this.innerCntr.select('form')[0]);
            form.setStyle({'marginTop' : this.getMarginTop()+'px' });
        },

        getMarginTop:function()
        {
            var h = this.model.getAdjustedStageSize().height,
            t = Math.floor((h - this.dimensions.height) / 2);
            return t;
        },

        submitDateOfBirth:function(e)
        {
            e.preventDefault();
            var dob=$('video-player-age-gate-form').serialize(true);
            this.controller.submitDateOfBirth(dob);
        },

        goodbye:function(e)
        {
            Event.stop(e);
            this.innerCntr.hide(); // give user a little immediate feedback since getPlayer().destroy seems to take a few seconds
            sho.video.getPlayer().destroy();
        },

        destroy:function()
        {
            this.model.unbind('stage:resize', this.fn.centerVertically);
            this.model.unbind('video:validation:invalid_dob', this.fn.renderWithError);
            this.model.unbind('video:validation:lockout', this.fn.renderLockout);
            if(this.container) this.innerCntr.remove();
        }

    })

sho.loaded_modules['/lib/js/sho/video/player/views/agegate.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.video.player.views.Player
     * Master view class for the overlay video player
    **/

    sho.video.player.views.Player = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Player',

        view : ['',
        '<div class="video-player video-player-outer loading">',
            '<div class="video-player-inner">',
                '<div class="video-player-stage" id="video-player-stage">',
                    '<div class="video-player-experience" id="video-player-experience">',
                    '</div>',
                '</div>',
                '<div class="video-player-dock video-player-dock-outer">',
        		'</div>',
                '<div class="video-player-title">&nbsp;</div>',
                '<div class="docked video-player-load-mask">&nbsp;</div>',
                '<div class="video-player-closer">&nbsp;</div>',
                '<div class="video-player-bench-marker">&nbsp;</div>',
            '</div><!-- END video-player-inner -->',
        '</div><!-- END video-player-outer -->',
        ''].join(''),

        fn : {},

        loading_message_for_title : 'Loading Video...',


        /**
         * new sho.video.player.views.Player(cfg)
         * Creates an instance of the player view
        **/
        initialize:function(cfg)
        {
            _.extend(this, {
                'ui' : {},
                'model' : cfg.model,
                'onContainerReady': cfg.onContainerReady || Prototype.emptyFunction
            });

            this.build.bind(this).delay(sho.dom.REDRAW_DELAY);
        },

        /**
         * sho.video.player.views.Player#build() -> Null
         * Calls the subroutines that insert the player into the DOM.
        **/
        build:function()
        {
            this.drawContainer();
            this.applyIpadStyles();
            this.initControls();
            this.initDock();
            this.setHandlers();
        },

        /**
         * sho.video.player.views.Player#drawContainer() -> Null
         * Inserts the skeleton template view into the body. Iterates over the lists of regions
         * that make up the ui and saves references to each. Calls onContainerReady on completion.
        **/
        drawContainer:function()
        {
            var th=this, key='';
            $$('body')[0].insert(this.view); $w('outer inner stage closer experience title dock load-mask bench-marker').each(function(region){
                th.ui[region.camelize()] = $$('.video-player-'+region)[0];
            });

            this.onContainerReady(this.ui.experience);
        },

        /**
         * sho.video.player.views.Player#initControls() -> Null
         * Creates the controls view instance
        **/
        initControls:function()
        {
            this.controls = new sho.video.player.views.Controls({
                'model' : this.model,
                'controller' : this.controller,
                'container' : this.ui.inner,
                'title' : this.ui.title
            });
        },

        /**
         * sho.video.player.views.Player#initDock() -> Null
         * Creates the dock view instance
        **/
        initDock:function()
        {
            if(window.dummy_player) this.ui.stage.id = 'fpo-stage'; // for debug purposes only, while we work on tabs
            this.dock = new sho.video.player.views.Dock({
                'model' : this.model,
                'controller' : this.controller,
                'container' : this.ui.dock
            })
        },

        /**
         * sho.video.player.views.Player#initBenchMarker() -> Null
         * Creates the optional benchmarker, which logs load-times to the browser.
        **/
        initBenchMarker:function()
        {
            this.benchMarker = new sho.video.player.views.BenchMarker({
                'model' : this.model,
                'container' : this.ui.benchMarker
            })
        },

        /**
         * sho.video.player.views.Player#setHandlers() -> Null
         * Subsribes the view to all model events, and sets the dom listeners related to closing the player
        **/
        setHandlers:function()
        {
            this.model.bind('all', this.update.bind(this))

            this.ui.closer.observe('click', (function(e){ e.stop();
                sho.video.getPlayer().close();
            }));

            this.ui.outer.observe('click', (function(e){
                e.stop();
            }));
        },

        /**
         * sho.video.player.views.Player#applyIpadStyles() -> Null
         * iPad 4.x workaround: temporarily enforce fullbleed styles if the page is long enough to need them
        **/
        applyIpadStyles:function()
        {
            if(sho.supportsPositionFixed()) return;
            this.removeFullBleed = !sho.dom.isFullBleed();
            this.lastScroll = sho.dom.getPageScroll();
            window.scrollTo(0,0);
            sho.dom.setFullBleed(true);
        },

        /**
         * sho.video.player.views.Player#removeIpadStyles() -> Null
         * if there were iPad 4.x workaround fixes deployed, restore the page to its original state
        **/
        removeIpadStyles:function()
        {
            this.lastScroll && window.scrollTo(0,this.lastScroll);
            this.removeFullBleed && sho.dom.setFullBleed(false);
        },



        /**
         * sho.video.player.views.Player#update(eventName,e) -> Null
         * All-purpose callback for events coming from the model. Most of the player interface is broken up
         * into individual components, so the actions take here are primarily related to the outer wrapper, displaying the loader, age gate etc.
        **/
        update:function(eventName, e)
        {
            if(['template:loaded','video:loading'].include(eventName)) {
                this.loadMask(true, {'className':'loaded' });
            }

			if(eventName == 'video:validation:success'){
				this.loadMask(false);
			}

            if(['video:loading','experience:media:play'].include(eventName)){
                this.updateTitle();
            }

            if(eventName == 'stage:resize'){
                this.ui.stage.setStyle(sho.object.toPixels(e))
            }

            if(['video:validation:unknown_age','video:validation:lockout'].include(eventName)){
                this.loadMask(false);
                this.drawAgeGate(eventName.match(/lockout/));
            }

            if(eventName =='video:validation:success'){
                this.removeAgeGate();
            }

            if(eventName == 'player:sleep')
            {
                this.tween('closer:blur')
            }

            if(eventName == 'player:wake')
            {
                this.tween('closer:focus');
            }

            if(eventName == 'experience:media:bufferbegin')
            {
                this.loadMask(true, {'className':'buffering' })
            }

            if(eventName == 'experience:media:buffercomplete')
            {
                this.loadMask(false, {'className':'buffering' })
            }

            if(sho.video.noisy_logging && !eventName.match(/^change|media:|resize/)) log('|player| '+eventName );

            if(eventName.match(/dfxp|cc/)) log('|player| '+eventName);
        },


        /**
         * sho.video.player.views.Player#drawAgeGate(lockout) -> Null
         * Draw the utility modal used in age-gated content
        **/
        drawAgeGate:function(lockout)
        {
            if(this.ageGate) return;
            this.ageGate = new sho.video.player.views.AgeGate({
                'container' : this.ui.inner,
                'model' : this.model,
                'controller' : this.controller,
                'lockout' : lockout
            })
        },

        /**
         * sho.video.player.views.Player#removeAgeGate() -> Null
         * Remove the utility modal used in age-gated content
        **/
        removeAgeGate:function()
        {
            if(this.ageGate) this.ageGate.destroy();
            this.ageGate = null;
        },


        /**
         * sho.video.player.views.Player#destroy() -> Null
         * Unset lisnters and remove the player view from the DOM
        **/
        destroy:function()
        {
            this.removeIpadStyles();
            this.ui.outer.stopObserving('click');
            this.ui.outer.remove();
        },

        /**
         * sho.video.player.views.Player#updateTitle() -> Null
         * Updates the title element in the player
        **/
        updateTitle:function()
        {
            if(this.ui.title) this.ui.title.update(this.model.getTitle());
        },


        tween:function(m)
        {
            var mode = m.gsub(/closer:/,''),
                t = {'opacity': (mode =='focus' ? 1 : 0)}
            ;

            if(sho.video.tweens.isSupported('controls', mode)){
                $j(this.ui.closer).animate(t, sho.video.tweens.deefault.duration * 1000);
            }
            else {
                this.ui.closer.setStyle(t);
            }
        },

        activateTab:function(t)
        {
            this.dock.activateTab(t);
        },

        getOuterContainer:function()
        {
            return this.ui.outer;
        },

        loadMask:function(isMasked, opts)
        {
            var opts = (opts || {'className':'loading'});

            if(isMasked)
            {
                this.ui.loadMask.show();
                this.ui.outer.addClassName(opts.className);
            }
            else
            {
                this.ui.loadMask.hide();
                this.ui.outer.removeClassName(opts.className);
            }

        }

    })


sho.loaded_modules['/lib/js/sho/video/player/views/player.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/video/player/views.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.video.player.controllers
     * Namespace for the controller in the video player mvc setup
    **/

    sho.provide('sho.video.player.controllers');


        /**
         * class sho.video.player.controllers.Player < Backbone.Router
         * controller class for video player
        **/

        sho.video.player.controllers.Player = Backbone.Router.extend({

            _KLASS_ : 'sho.video.player.controllers.Player',

            fn : {},

            /**
             * new sho.video.player.controllers.Player(cfg)
             * create the player controller, storing a reference to the model and setting event listeners.
            **/
            initialize:function(cfg)
            {
                this.model = cfg.model;
                this.setHandlers();
            },

            /**
             * sho.video.player.controllers.Player#setHandlers() -> Null
             * Sets event listeners for the controller. Currently,this is limited to space-bar keypresses, which trigger a play/pause.
            **/
            setHandlers:function()
            {
                this.fn.playPauseOnSpaceBar = this.playPauseOnSpaceBar.bind(this);
                $$('body')[0].observe('keypress', this.fn.playPauseOnSpaceBar);
            },

            /**
             * sho.video.player.controllers.Player#playPauseOnSpaceBar() -> Null
             * Callback for the spacebar key-press event
            **/
            playPauseOnSpaceBar:function(e)
            {
                if(e.keyCode == '32' && !e.findElement('input,textarea'))
                {
                    this.togglePlaying();
                }
            },

            /**
             * sho.video.player.controllers.Player#destroy() -> Null
             * The controller's shutdown routine. Removes the spacebar key-press listener.
            **/
            destroy:function()
            {
                $$('body')[0].stopObserving('keypress', this.fn.playPauseOnSpaceBar);
            },

            /**
             * sho.video.player.controllers.Player#loadVideo(videoId) -> Null
             * Loads a video into the model.
            **/
            loadVideo:function(id)
            {
                this.model.loadVideoById(id);
            },

            /**
             * sho.video.player.controllers.Player#loadRelatedVideo(videoId) -> Null
             * Called when the user clicks on a video in the related videos tab. Functionally equivalent to [[sho.video.player.controllers.Player#loadVideo]],
             * this is broken out in case we ever want to add different behaviors around this event.
            **/
            loadRelatedVideo:function(id)
            {
                this.loadVideo(id);
            },

            /**
             * sho.video.player.controllers.Player#togglePlaying() -> Null
             * Toggle the model's playing state. (Play/Pause).
            **/
            togglePlaying:function()
            {
                this.model.togglePlaying();
            },

            /**
             * sho.video.player.controllers.Player#seek(factor) -> Null
             * Change the current position of the video during playback. Expects a value from 0 - 1, rather than a time in mins:seconds
            **/
            seek:function(factor)
            {
                var duration = this.model.getVideoDuration();
                if(duration && factor)
                {
                    var timeInSeconds = duration * factor;
                    this.model.seek(timeInSeconds);
                }
            },

            /**
             * sho.video.player.controllers.Player#play() -> Null
             * Start/resume video playback by calling play on the model.
            **/
            play:function()
            {
                this.model.play();
            },


            /**
             * sho.video.player.controllers.Player#pause() -> Null
             * pause video playback by calling pause on the model.
            **/
            pause:function()
            {
                this.model.pause();
            },

            /**
             * sho.video.player.controllers.Player#stop() -> Null
             * stop video playback by calling stop on the model.
            **/
            stop:function()
            {
                this.model.stop();
            },

            /**
             * sho.video.player.controllers.Player#toggleIsMuted() -> Null
             * Toggle the player sound on and off
            **/
            toggleIsMuted:function()
            {
                this.model.mute(!this.model.isMuted());
            },

            /**
             * sho.video.player.controllers.Player#setVolume(volume) -> Null
             * Set volume level
            **/
            setVolume:function(v)
            {
                this.model.setVolume(v);
            },

            /**
             * sho.video.player.controllers.Player#getVolume() -> Number
             * Get the volume level
            **/
            getVolume:function()
            {
                return this.model.getVolume();
            },

            /**
             * sho.video.player.controllers.Player#getClosedCaptionsEnabled() -> Null
             * Return true if closed captions is enabled, false otherwise. =:captions
            **/
            getClosedCaptionsEnabled:function()
            {
                return this.model.getClosedCaptionsEnabled()
            },

            /**
             * sho.video.player.controllers.Player#setClosedCaptionsEnabled(cc) -> Null
             * enable or disable closed captions by setting the model state.
            **/
            setClosedCaptionsEnabled:function(cc)
            {
                this.model.setClosedCaptionsEnabled(cc)
            },

            /**
             * sho.video.player.controllers.Player#toggleClosedCaptions() -> Null
             * Toggle closed captions on or off.
            **/
            toggleClosedCaptions:function()
            {
                this.model.setClosedCaptionsEnabled(!this.model.getClosedCaptionsEnabled());
            },

            /**
             * sho.video.player.controllers.Player#toggleClosedCaptionsUIVisibility() -> Null
             * Hide/show the brightcove ui for changing the closed captions options.
            **/
            toggleClosedCaptionsUIVisibility:function()
            {
                return false; // not implemented
            },

            /**
             * sho.video.player.controllers.Player#showClosedCaptionsOptions() -> Null
             * show the brightcove ui for changing the closed captions options.
            **/
            showClosedCaptionsOptions:function()
            {
                this.model.showClosedCaptionsOptions();
            },

            /**
             * sho.video.player.controllers.Player#setDisplayMode(mode) -> Null
             * Set the player display mode, by passing either 'actual_size' or 'scale_to_fit'. =:display
            **/
            setDisplayMode:function(mode)
            {
                this.model.setDisplayMode(mode);
            },

            /**
             * sho.video.player.controllers.Player#sendEmail(attributes) -> Null
             * Trigger the action to send a video as an email, this is called by the form in the share panel. =:share
            **/
            sendEmail:function(attrs)
            {
                this.model.sendEmail(attrs);
            },

            /**
             * sho.video.player.controllers.Player#submitDateOfBirth(attr) -> Null
             * Set the date of birth for the user. Used in age-gating for videos that are rated TV-MA+.
            **/
            submitDateOfBirth:function(attrs)
            {
                this.model.setDateOfBirth(attrs);
            },

            /**
             * sho.video.player.controllers.Player#clearHash() -> Null
             * Clear the window's hash value. Useful for when the video title page redirects to the screening room and triggers a video play.
            **/
            clearHash:function()
            {
                window.location.hash = '';
            }

        })

sho.loaded_modules['/lib/js/sho/video/player/controllers/player.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/video/player/controllers.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.video.player.statics
     * Module of static methods (class methods) which form the public interface for interacting with the player.
     * They are mixed into `sho.video`, so `sho.video.statics.getExperience()` can be accessed as `sho.video.getExperience()`, for example
    **/

    sho.video.statics =
    {
        noisy_logging : false,

        getExperience:function(){
            return sho.video.getPlayer().getExperience()
        },

        getOuterContainer:function(){
            return sho.video.getPlayer().view.getOuterContainer()
        },

        getModel:function()
        {
            return sho.video.getPlayer().model
        },


        /**
         * sho.video.load(cfg) -> VideoPlayer
         * This method is the workhorse for the public api. It creates the player, and passes the call to load the clip as the success callback.
         * Additionally, the calling code can supply an optional callback for the ready event, or for an error event.
         * The ready event is only fired once, for the first time the player is created. The error event can fire if there is a failure in the brightcove api or if
         * there is a network error when fetching the video model's json. We're not using these callbacks much in production.
         *
         *      sho.video.load({
         *           'id': '14797', // vams id
         *           'ready' : (function(player){
         *               log('the player is ready');
         *           }),
         *           'error' : (function(e){
         *               log('something went wrong:' + e);
         *           })
         *      });
         *
        **/
        load : function(params)
        {
            if(!params || !params.id || !Number(params.id)) return false;

            var p = sho.video.getPlayer({
                'ready' : sho.video.attachCallback(params.ready, (function(player){
                    player.loadVideoById(params.id)
                })),
                'error' : sho.video.attachCallback(params.error, (function(e){
                    sho.video.displayError(e);
                    sho.video.destroy.delay(sho.dom.REDRAW_DELAY);
                }))
            });

            sho.dom.trigger('video_player:created');
            return p;
        },

        /**
         * sho.video.getPlayer(cfg) -> VideoPlayer
         * Provides singleton-style access to video player. If a player instance exists it will be returned, otherwise a new player is created.
        **/
        getPlayer:function(opts)
        {
            var opts = opts || {};


            if(sho.video.playerExists() && sho.video.playerIsValid() )
            {
                if(opts.ready && typeof opts.ready == 'function')
                {
                    opts.ready(sho.video._player_);
                }
            }
            else
            {
                sho.video._player_ = new sho.video.Player(opts);
            }
            return sho.video._player_;
        },

        attachCallback:function(clientCallback, playerCallback)
        {
            return function(player_or_error)
            {
                playerCallback(player_or_error);

                if(clientCallback && typeof clientCallback == 'function'){
                    clientCallback(player_or_error);
                }
            }
        },

        /**
         * sho.video.playerExists() -> Boolean
         * Returns true if a player has already been created.
        **/
        playerExists:function(){
            return !!sho.video._player_;
        },

        /**
         * sho.video.playerIsValid() -> Boolean
         * Returns true if the player does not have any errors
        **/
        playerIsValid:function(){
            return !sho.video._player_.hasErrors()
        },

        /**
         * sho.video.destroy() -> Null
         * Safely destroy the player, without knowing if it exists.
        **/
        destroy:function(){
            if(sho.video.playerExists()) sho.video.getPlayer().destroy();
        },

        /**
         * sho.video.setDisplayMode(mode) -> Boolean
         * Set the display mode to either *actual_size* or *scale_to_fit*. The third option, *fullscreen*, happens within the flash layer and we don't need to manage it.
        **/
        setDisplayMode:function(mode){
            sho.video.getPlayer().controller.setDisplayMode(mode); return true;
        },

        displayError:function(e)
        {
            sho.ui.Error({
                'message' : 'An error has occurred while attempting to play your video:<br />' + (e || 'Unknown Error')
            });
        },

        sleepWake:function(sleep_or_wake)
        {
            if(sho.video.use_flash_sleep_wake_events && !sho.video.disable_sleeping){
                sho.video.getModel()[sleep_or_wake]();
            }
            return true;
        },


        trackClick:function(str)
        {
            sho.video.trackWithDelay('click', 'player:'+str.gsub(/-/,'_'));
        },

        trackPlay:function()
        {
            sho.video.trackWithDelay('page', 'video:player:'+ sho.video.getModel().getTitle().toLowerCase().gsub(/:/,''));
        },

        trackWithDelay:function(type, str)
        {
            var method = type == 'click' ? 'trackClick' : 'trackPageView',  // set the type of impression to record
                cfg = (type == 'click' ? {'reload':true} : {}),             // click events have to be reloaded, since the tracker will have been used to track a video impression
                impression = {}                                             // impression is a simple hash where the key is either 'click' or 'trackPageView'
            ;   impression[type] = str;

            (function(t){ t[method](impression); }).delay(1, sho.analytics.getTracker(cfg));
        }

    };

    _.extend(sho.video, sho.video.statics, {
        'sleep' : sho.video.statics.sleepWake.curry('sleep'),
        'wake' : sho.video.statics.sleepWake.curry('wake')
    });

sho.loaded_modules['/lib/js/sho/video/player/statics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    /**
     * sho.video.minimum_flash_version = '9.0.115'
     * The minimum flash version required for video playback.
    **/
    sho.video.minimum_flash_version = '9.0.115';

    /**
     * class sho.video.player.Player
     * The wrapper class for the video player, sets up MVC triangle.
     * Aliased as sho.video.Player.
    **/
    sho.video.player.Player = Class.create({

        _KLASS_ : 'sho.video.player.Player',

        callbacks : {},

        /**
         * new sho.video.player.Player(cfg)
         * Instantiate a video player instance. This is not called directly in practice, there is a singleton-style setup
         * that makes use of sho.video.getPlayer().
         *
         * Internally, the constructor does the following:
         *
         * 1. Collects callbacks and initializes the experience instance
         * 2. Checks for minimum version of Flash (if on Desktop)
         * 3. Initializes the Model,Controller,and View, passing an onContainerReady callback to View
         * 4. Passes the container element to the experience when onContainerReady fires, and calls createExperience
         *
        **/
        initialize:function(cfg)
        {
            _.extend(this, {
                'errors' : [],
                'bc_experience' : new sho.video.brightcove.Experience({}),
                'callbacks' : {
                    'ready' : cfg.ready || sho.emptyFunction,
                    'error' : cfg.error || sho.emptyFunction
                }
            });

            try
            {
                if(sho.isDesktop()) this.checkForFlash();

               sho.video.use_flash_sleep_wake_events = false; //sho.env.browser().isFireFox && !sho.video.disable_sleeping;

                this.model = new sho.video.player.models.Player({
                    'bc_experience' : this.bc_experience
                });
                this.model.bind('ready', this.callbacks.ready.curry(this));

                this.model.bind('video:error', this.callbacks.error);
                this.model.bind('experience:error', this.callbacks.error);

                this.controller = new sho.video.player.controllers.Player({
                    'model' : this.model
                });

                this.view = new sho.video.player.views.Player({
                    'model' : this.model,
                    'onContainerReady' : this.onContainerReady.bind(this)
                });
                this.view.controller = this.controller

            }
            catch(e)
            {
                if(e instanceof sho.errors.FlashPlayerNotFoundError)
                {
                    this.errors.push(e.message);
                    this.callbacks.error(e.message)
                }
                else
                {
                    console.log(e.stack /* good browsers */ || e /* ie */);
                }
            }
        },

        onContainerReady:function(el)
        {
            this.bc_experience.container = el;
            this.bc_experience.createExperience();
        },

        /**
         * sho.video.player.destroy() -> null
         * Close the player and nullify the model,view,controller and experience instance properties.
         * Aliased in sho.video.statics as sho.video.destroy()
         *
         * fires video_player:destroyed
        **/
        destroy:function()
        {
            (this.bc_experience && this.bc_experience.destroy());   this.bc_experience = null;
            (this.model && this.model.destroy());                   this.model = null;
            (this.view && this.view.destroy());                     this.view = null;
            (this.controller && this.controller.destroy());         this.controller = null;

            sho.dom.trigger('video_player:destroyed');
            this.destroySelf();
        },

        destroySelf:function()
        {
            sho.video._player_ = null;
        },

        /**
         * sho.video.player.close() -> null
         * Close the player and nullify the model,view,controller and experience instance properties.
         * (Handle a shutdown initiated by clicking on the closer button). This can only be called against the player instance, there is no static counterpart
         *
         * fires video_player:closed
        **/
        close:function()
        {
            this.destroy();
        },


        /**
         * sho.video.player.loadVideoById(id) -> Null
         * Calls loadVideoById on player.model, which triggers an ajax load of the video specified by the id param.
        **/
        loadVideoById:function(id)
        {
            this.model.loadVideoById(id);
        },

        checkForFlash:function()
        {
            if(!swfobject|| !swfobject.hasFlashPlayerVersion(sho.video.minimum_flash_version)) {
                throw new sho.errors.FlashPlayerNotFoundError()
            }
        },

        getExperience:function()
        {
            return this.bc_experience
        },

        hasErrors:function()
        {
            return this.errors.length > 0
        }

    })

    sho.errors.FlashPlayerNotFoundError = function(msg){ this.message = 'Flash player version '+sho.video.minimum_flash_version+' or higher is required.' ; }
    sho.errors.FlashPlayerNotFoundError.prototype = new Error();

    sho.video.Player = sho.video.player.Player;
sho.loaded_modules['/lib/js/sho/video/player/player.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/video/player.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/video.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.behaviors');

	sho.behaviors.Base = klass({

	    _KLASS_ : 'sho.behaviors.Base',

	    initialize:function()
	    {
	        this.fn = {};
	        this.fn.click = _.bind(this.click, this);
	        this.applyBehaviors();
	    },

	    applyBehaviors:function(el)
	    {

	        var th=this;

	        sho.$(el || sho.dom.body()).find(sho.behaviors.attrList()).on('click', function(e) {
	            var evt = e;
	            if(e.target != this && sho.$(e.target).attr('data-click-id') && sho.$(this).attr('data-click-id')) {
	                if (sho.dom.data.read(e.target,'clickId') != sho.dom.data.read(this,'clickId')) {
	                    return;
	                }
	                else {
	                    th.fn.click(evt);
	                }
	            }
	            else {
	                th.fn.click(evt);
	            }
	    });
	},

	removeBehaviors:function(el)
	{
	    sho.$(el || sho.dom.body()).find(sho.behaviors.attrList()).off('click', this.fn.click)
	},

	click:function(e)
	{
	    var el = e.currentTarget; // was e.delegateTarget || e.target;
	    sho.behaviors.method(sho.dom.data.read(el,'behavior'))(el,e);
	}

	});

	_.extend(sho.behaviors, {

	init : function(){
	    sho.behaviors._instance = new sho.behaviors.Base(); return sho.behaviors._instance;
	},

	instance : function(){
	    return sho.behaviors._instance || sho.behaviors.init()
	},

	add : function(key, callback){
	    sho._behaviors = sho._behaviors || {};
	    sho._behaviors[key] = callback;
	    return sho.behaviors;
	},

	list : function(){
	    return _.keys(sho._behaviors || {})
	},

	any : function(){
	    return _.any(sho.behaviors.list());
	},

	attrList : function(){
	    return sho.behaviors.any() && _.collect(sho.behaviors.list(), function(k){
	        return '[data-behavior="'+k+'"]'
	    }).join(', ')
	},

	apply : function(el){
	    sho.behaviors.instance().applyBehaviors(el);
	},

	remove : function(el){
	    sho.behaviors.instance().removeBehaviors(el);
	},

	method : function(key){
	    return sho._behaviors[key] || (function(){ return false; });
	},

    track : function(el){
        var t = sho.analytics.getTracker({
            'reload':true,  // reset page data
            'debug':true
        });

        if(!sho.dom.data.read(el, 'eventLabel')) {
            t.trackClick({ 'click' : sho.dom.data.read(el, 'clickId') }); // standard custom link tracking
        }
        else {
            t.trackEvent({
                'eventContext' : sho.dom.data.read(el, 'eventContext'),
                'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
                'providerId' : sho.dom.data.read(el, 'providerId'),
                'customEvent' : sho.dom.data.read(el, 'eventId'),
                'customLink' : sho.dom.data.read(el, 'clickId')
            });
        }
    }

	});

	sho.dom.ready(sho.behaviors.init);
sho.loaded_modules['/lib/js/sho/behaviors/base.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.behaviors.add('modal', (function(el, e){

		sho.dom.trap(e);

		var insertContent = function(){
			sho.ui.modals.instance().ui.content.insert( {'bottom': $($(sho.dom.data.read(el, 'modalCntid')).cloneNode(true))} )
		}
		sho.ui.Modal({
			'height': sho.dom.data.read(el, 'modalHeight'),
	        'width' : sho.dom.data.read(el, 'modalWidth'),
	        'title' : sho.dom.data.read(el, 'modalTitle'),
			'content' : function(){
				insertContent.delay(sho.dom.REDRAW_DELAY)
			}
		});
    }));
sho.loaded_modules['/lib/js/sho/behaviors/modals.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.behaviors.add('portal', (function(el, e){

		sho.dom.trap(e);

		sho.ui.Portal({
			'height': sho.dom.data.read(el, 'modalHeight'),
	        'width' : sho.dom.data.read(el, 'modalWidth'),
	        'title' : sho.dom.data.read(el, 'modalTitle'),
			'url'   : el.readAttribute('href')
		});

		sho.analytics.getTracker({ 'debug':true }).trackClick({ 'click' : sho.dom.data.read(el, 'clickId') });

    }));
sho.loaded_modules['/lib/js/sho/behaviors/portals.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($)
    {
        sho.behaviors.add('confirm', (function(el, e){

    		sho.dom.trap(e);

    		var title =   sho.dom.data.read(el, 'title'),
    		submitLabel = sho.dom.data.read(el, 'submitLabel'),
    		clickId =     sho.dom.data.read(el, 'clickId')
    		;
            sho.analytics.getTracker().trackClick({
                'click' : clickId
            });

            sho.ui.Modal({
    		    'type'    : 'confirm',
    		    'title'   : title,
    		    'message' : $('.confirm-message', el).html(),
    		    'submit'  : {
    		        'label'      : submitLabel || title,
    		        'url'        : $(el).attr('href'),
    		        'method'     : 'GET', // always use GET for now..
    		        'clickId'    : clickId.replace(/alert|modal/,'confirmation'), // use of prototype regex assumes desktop-only!
    		        'closeModal' : true
    		    }
    		});

        }));

    }(sho.$)
sho.loaded_modules['/lib/js/sho/behaviors/confirm.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.behaviors.add('developer-tools', (function(el, e){

        sho.dom.trap(e); sho.ui.Modal({'type':'developer-tools'});

    }));
sho.loaded_modules['/lib/js/sho/behaviors/developertools.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.behaviors.add('play-video', (function(el, e){


        sho.dom.trap(e);

        sho.video.load({
            'id': sho.dom.data.read(el, 'videoId')
        });

        sho.behaviors.track(el);
    }));


	sho.behaviors.add('play-mobile-video', (function(el, e){


	    sho.dom.trap(e);

		var cfg = {};
		cfg.videoAgeGate = sho.dom.data.read(el, 'videoAgeGate');

    	sho.behaviors.track(el);

        var mobileUrl = sho.dom.data.read(el, 'mobileUrl');
		cfg.videoUrl = (mobileUrl ? mobileUrl : $(el).attr('href'));

		if(!sho.accounts.isAuthenticated() && cfg.videoAgeGate > 0) {
			var ageGate = new sho.ui.mobile.AgeGate({
				'container' : $('body'),
				'videoUrl': cfg.videoUrl,
				'videoAgeGate' : cfg.videoAgeGate
			});
		}
        else {
            window.location.href = cfg.videoUrl;
        }
	}));





sho.loaded_modules['/lib/js/sho/behaviors/videoplayback.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.behaviors.add('track-click', function(el, e){

        var t = sho.analytics.getTracker({
            'reload':true,  // reset page data
            'debug':true
        });

        t.trackClick({ 'click' : sho.dom.data.read(el, 'clickId') });
    });

    sho.behaviors.add('track-event', function(el, e){

        sho.analytics.getTracker({ 'reload':true, 'debug':true }).trackEvent({
            'eventContext' : sho.dom.data.read(el, 'eventContext'),
            'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
            'providerId' : sho.dom.data.read(el, 'providerId'),
            'customEvent' : sho.dom.data.read(el, 'eventId'),
            'element' : el
        });
    });

    sho.behaviors.add('track-navigation', function(el, e){

        var customEvents = sho.dom.data.read(el, 'eventId');
        if (customEvents) {
            customEvents += ',39';
        }
        else {
            customEvents = 39;
        }

        sho.analytics.getTracker({ 'reload':true, 'debug':true }).trackEvent({
            'eventContext' : sho.dom.data.read(el, 'eventContext'),
            'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
            'customEvent' : customEvents,
            'element' : el
        });
    });

    sho.behaviors.add('track-anytime', function(el, e){
        sho.analytics.getTracker({ 'reload':true, 'debug':true }).trackEvent({
            'eventContext' : sho.dom.data.read(el, 'eventContext'),
            'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
            'providerId' : sho.dom.data.read(el, 'providerId'),
            'customEvent' : 108,
            'element' : el
        });
    });

    sho.behaviors.add('track-streaming', function(el, e){
        sho.analytics.getTracker({ 'reload':true, 'debug':true }).trackEvent({
            'eventContext' : sho.dom.data.read(el, 'eventContext'),
            'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
            'providerId' : sho.dom.data.read(el, 'providerId'),
            'customEvent' : 107,
            'element' : el
        });
    });

    sho.behaviors.add('track-provider', function(el, e){

        sho.dom.trap(e);

        var providerId = sho.dom.data.read(el, 'providerId');
        if (!providerId) return;

        sho.analytics.getTracker({ 'reload':true, 'debug':true }).trackEvent({
            'eventContext' : sho.dom.data.read(el, 'eventContext'),
            'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
            'providerId' : providerId,
            'customEvent' : 100,
            'element' : el
        });

        sho.order.AffiliateTracking.trackAndRedirectToAffiliate(providerId,el.getAttribute("href"))
    });

    sho.behaviors.add('track-click-to-call', function(el, e){


        sho.analytics.getTracker({ 'reload':true, 'debug':true }).trackEvent({
            'eventContext' : sho.dom.data.read(el, 'eventContext'),
            'eventLabel' : sho.dom.data.read(el, 'eventLabel'),
            'customEvent' : 101,
            'element' : el
        });

    });
sho.loaded_modules['/lib/js/sho/behaviors/tracking.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


 	!function($)
    {
    sho.behaviors.add('provider-select', (function(el, e){

		sho.dom.trap(e);

		var categoryID = sho.dom.data.read(el, 'providerCategory');
		if (!categoryID) return;

        new sho.ui.modals.ProviderSelect({
                'relatedTarget' : el,
        		'title' : 'Select a Provider<span class="hidden-xs"> Below</span>',
        		'categoryID' : categoryID,
                'classNames' : 'provider-select'
        });
    }));

    }(sho.$)
sho.loaded_modules['/lib/js/sho/behaviors/providerselect.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/behaviors.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/





    !function($){

    sho.ui.Accordion = klass({

        '_KLASS_' : 'sho.ui.Accordion',

        'defaults' : {
            'toggleClass' : 'toggle',
            'panelClass' : 'panel',
            'activeClass' : 'aktiv'
        },

        initialize : function(cfg)
        {
            _.extend(this, {
                'container' : $(cfg.container),
                'toggleClass' : cfg.toggle || this.defaults.toggleClass,
                'panelClass' :   cfg.panel || this.defaults.panelClass,
                'activeClass' : cfg.active || this.defaults.activeClass,
                'fn' : {
                    'onClick' : _.bind(this.onClick, this)
                }
            });

            this.toggles = _.collect(this.container.find('.'+this.toggleClass), function(el,i){
                return $(el).data('index', i);
            });

            this.panels = _.collect(this.container.find('.'+this.panelClass), function(el){
                return $(el).data('height', $(el).height());
            });

            this.collapseAll();
            this.container.on('click', '.'+this.toggleClass, this.fn.onClick);
        },

        onClick:function(e)
        {
            this.toggle($(e.currentTarget).data('index'))
        },

        collapseAll:function()
        {
            _.each(this.panels, function(el){
                el.height(0)
            })
        },

        toggle:function(i)
        {
            var panel = $(this.panels[i]),
                toggle = $(this.toggles[i]),
                k =  this.activeClass
            ;
            this.animate(panel, (!panel.hasClass(k) ? 'expand' : 'collapse')).toggleClass(k);
            toggle.toggleClass(k);
        },

        animate:function(el, mode)
        {
            return el.animate({
                'height' : (mode == 'expand' ? el.data('height') : 0)
            });
        }



    })

    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/accordion.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.ui.Calendar = Class.create({

        _KLASS_ : 'sho.ui.Calendar',

        day_labels_shortest : $w('S M T W T F S'),
        day_labels_short : $w('Sun Mon Tue Wed Thu Fri Sat'),
        use_month_controls : false,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'date' : cfg.date || Date.today(),
                'selected' : cfg.selected || Date.today(),
                'ui' : {
                    'container' : cfg.container
                },
                'events' : {
                    'onChange' : cfg.onChange || Prototype.emptyFunction,
                    'onChangeScope' : cfg.onChangeScope || window
                }
            })

            if(this.ui.container) this.render()
            this.setHandlers();
        },

        render:function()
        {
            this.ui.container.update(this.toStr());
        },

        setHandlers:function()
        {
            var th=this; this.ui.container.observe('click', (function(e)
            {
                var el = e.findElement('td.cal-day, th.cal-control.prev-month, th.cal-control.next-month');
                if(el)
                {
                    var klass = el.className.split(' ').last(), method = ('set-'+klass).camelize();
                    th[method](el.innerHTML);
                }
            }))
        },

        toStr:function()
        {
            var klass = this.use_month_controls ? ' has-month-controls' : '',
            html = (['',
            '<table border="1" class="cal', klass, '">',
                '<tr class="cal-controls">',
                    (this.use_month_controls ? '<th class="cal-control prev-month">&nbsp;</th>' : ''),
                    '<th class="cal-control title" colspan="',(this.use_month_controls ? 5 : 7 ),'">', this.date.toString("MMMM yyyy"), '</th>',
                    (this.use_month_controls ? '<th class="cal-control next-month">&nbsp;</th>' : ''),
                '</tr>',
                '<tr class="cal-header">',
                this.getHeader(),
                '</tr>',
                this.getBody(),
            '</table>',
            ''])

            return html.flatten().join('');
        },

        getHeader:function()
        {
            return this.day_labels_shortest.collect(function(d){
                return ['<th class="cal-day-of-week">',d,'</td>']
            })
        },

        getBody:function()
        {
            var body=[],
                week=0,
                dayOfWeek=0,
                dayOfMonth=0,
                cell='',
                daysInMonth = this.date.getDaysInMonth(),
                startingDay = this.date.clone().moveToFirstDayOfMonth().getDay(),
                today = Date.today(),
                isToday = false,
                isSelected = false
            ;

            for(week=0; (week<10 && dayOfMonth < daysInMonth); week++)
            {
                body.push('<tr>');

                for(dayOfWeek=0; dayOfWeek<7; dayOfWeek++)
                {
                    cell = '<td></td>';

                    if(dayOfMonth < daysInMonth && (week > 0 || dayOfWeek >= startingDay))
                    {
                        isToday = (dayOfMonth == (today.getDate()-1) && this.date.getMonth() == today.getMonth()),
                        isSelected = this.selected && (dayOfMonth == this.selected.getDate()-1 && this.date.getMonth() == this.selected.getMonth()),
                        cell = '<td class="'+ (isSelected ? 'aktiv ' : '') + (isToday ? 'today ' : '') +'cal-day">'+ (dayOfMonth+1) + '</td>';
                        dayOfMonth++
                    }
                    body.push(cell);
                }

                body.push('</tr>');
            }
            return body;
        },

        setDate:function(date)
        {
            this.date = date; this.renderAndNotify();
        },

        setSelectedDate:function(date) // attach a stylistic hook to a day of the month, without altering the actual daterange of the month
        {
            this.selected = date; this.render();
        },

        setCalDay:function(digit)
        {
            this.date = new Date(this.date.getFullYear(),this.date.getMonth(),Number(digit));
            this.renderAndNotify();
        },

        setPrevMonth:function()
        {
            this.date.add(-1).months();
            this.renderAndNotify();
        },

        setNextMonth:function()
        {
            this.date.add(+1).months();
            this.renderAndNotify();
        },

        renderAndNotify:function()
        {
            this.render();
            this.events.onChange.call(this.events.onChangeScope, this.date);
        },

        destroy:function()
        {
            this.ui.container.stopObserving();
        }

    });


sho.loaded_modules['/lib/js/sho/ui/calendar.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


	/**
	 * class sho.ui
     * Parent container class for other sho.ui sub classes
	**/

    /**
     * sho.ui.carousel
     * namespace for the carousel component
    **/

    /**
     * class sho.ui.carousel.Carousel
     * Parent class for the carousel component. Aliased as sho.ui.Carousel
    **/

    sho.provide('sho.ui.carousel');

    sho.provide('sho.ui.carousel.model');
    sho.ui.carousel.model.Audio = {

        /**
         * sho.ui.carousel.Model#mute() -> null
         * Mute the audio in the carousel.
        **/
        mute:function()
        {
            if(this.muted) return;

            this.status = 'video_mute';
            this.muted = true;
            this.notify();
        },

        /**
         * sho.ui.carousel.Model#unmute() -> null
         * Mute the audio in the carousel.
        **/
        unmute:function()
        {
            if(!this.muted) return;

            this.status = 'video_unmute';
            this.muted = false;
            this.notify();
        },

        /**
         * sho.ui.carousel.Model#toggleSound() -> null
         * Toggles the audio in the carousel on and off
        **/
        toggleSound:function()
        {
            if(this.muted) this.unmute(); else this.mute();
        },

        /**
         * sho.ui.carousel.Model#muteOnStartup() -> Boolean
         * Called by Flash externalInterface if the muted state is cookied
        **/
        muteOnStartup:function()
        {
            this.mute(); return true
        }
    }

sho.loaded_modules['/lib/js/sho/ui/carousel/model/audio.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.ui.carousel.model.Base = {

        _KLASS_ : 'sho.ui.carousel.Model',

        subscribers :   [],   //  for Observable

        index :         0,
        panelIn :       null,
        panelOut :      null,
        intvl:          null,
        numPanels :     null,
        status :        null,   // init start next stop play_video set_panel,
        videoPath :     null,
        firstVideo:     true,
        hideTextBlock:  false,
        hasFlash:       false,
        muted:          false,
		filmStripOpen:  null,

        export_to_global_scope : true,
        export_to_global_scope_as : 'MODEL',

        /**
         * new sho.ui.carousel.Model(cfg)
         * Constructor for the model class. Accepts a config object with the following properties:
         * - speed(number): Amount of time to show each panel, in seconds
         * - params(object): Parameters object, contains anything that was set in the URL
        **/

        initialize:function(cfg)
        {
            _.extend(this,{
                'status' : 'init',
                'speed' : cfg.speed,
                'params' : cfg.params,
				'transition' : cfg.transition,
                'data' : {
                    'ctas' : {} // default calls-to-action are registered on the model and stored in this hash
                }
            });

            if(cfg.params.firstPanel && Number(cfg.params.firstPanel)){
                this.index = sho.ui.carousel.getPanelByPromotionId(Number(cfg.params.firstPanel)) || 0;
            }
            if(this.export_to_global_scope){
                window.sho.ui.carousel[this.export_to_global_scope_as] = this;
            }
        },

        /**
         * sho.ui.carousel.Model#onNotify(subscriber) -> Null
         * Implement the push-style notification scheme provided by the Observable mixin
        **/

        onNotify:function(subscriber)
        {

            subscriber.update({
                'eventName' : 'model:' + this.status,
                'index' : this.index,
                'panelIn' : this.panelIn,
                'panelOut' : this.panelOut,
                'hideTextBlock' : this.hideTextBlock,
                'muted' : this.muted,
                'videoPath' : this.status == 'play_video' ? this.videoPath : ''
            })
        }

    }

sho.loaded_modules['/lib/js/sho/ui/carousel/model/base.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.ui.carousel.model.Metadata = {

        default_cta_url_attribute : 'data-default-cta-url',
        default_cta_type_attribute : 'data-default-cta-type',
        panel_id_attribute : 'data-promotion-id',

        setDefaultCallToAction:function(idx, cta)
        {
            this.data.ctas['cta-'+idx] = cta;
        },

        getDefaultCallToAction:function(idx)
        {
            return this.data.ctas['cta-'+idx];
        }
    }

sho.loaded_modules['/lib/js/sho/ui/carousel/model/metadata.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.ui.carousel.model.Playback = {

        'clock' : 				[],
        'panel_tween_length' : 	1.5,
        'tweening' :  			false,
        'video_player_active' : false,

        start:function()
        {
            if(this.video_player_active || this.isSinglePanel()) return;
            this.status = 'start'; this.notify();
            this.startClock();
        },

        startClock:function()
        {
            if(this.numPanels < 1) return;
            this.clear();
            this.intvl = setInterval(this.next.bind(this), this.frequency());
        },

        stop:function()
        {
            this.status = 'stop';
            this.clear();
            this.notify();
        },

        pause:function()
        {
            if(this.isPaused() || this.isSinglePanel()) return;

            log('|model| pause playback because the user is likely on verge of clicking something...');
            this.status = 'pause';
            this.clear();
            this.notify();

            this.intvl = setTimeout( _.bind(this.clearUnpauseDelay, this), this.frequency())
            this.delayPause = true;

        },

        clearUnpauseDelay:function()
        {
            this.clear();
            this.delayPause = false;
        },

        unpause:function()
        {
            if(!this.isPaused()) return

            log('|model| unpause '+(this.delayPause ? 'with':'without')+ ' standard delay')
            if(!this.delayPause)
            {
                this.clear()
                this.next();
                this.startClock()
            }
            else
            {
                this.start()
            }

        },

        next:function()
        {
            this.status = 'next';
            this.panelOut = this.index;
            this.index++; if(this.index > this.numPanels-1) this.index = 0;
            this.panelIn = this.index;
            this.notify();
        },

        prev:function()
        {
            this.status = 'prev';
            this.panelOut = this.index;
            this.index--; if(this.index < 0) this.index = this.numPanels - 1;
            this.panelIn = this.index;
            this.notify();
        },

        setPanel:function(p)
        {
            if(this.status == 'play_video'){ this.stopVideo(); }
            if(this.index == p) return;

            this.status = 'set_panel';
            this.panelOut = this.index;
            this.index = p;
            this.panelIn = p;
            this.clear();
            this.notify();
            this.start.bind(this).delay(this.speed);
        },

        setTweening:function(t)
        {
            this.tweening = t;
        },

        clear:function()
        {
            if(this.intvl) clearInterval(this.intvl);
        },

        frequency:function()
        {
            return (this.speed + this.panel_tween_length) * 1000;
        },

        isPaused:function()
        {
            return this.status == 'pause';
        },

        isSinglePanel:function()
        {
            return this.numPanels < 2
        },

        onVideoPlayerCreated:function()
        {
            this.video_player_active = true;
            this.stop();
        },

        onVideoPlayerDestroyed:function()
        {
            this.video_player_active = false;
            this.stop();
            this.start();
        }

    }

sho.loaded_modules['/lib/js/sho/ui/carousel/model/playback.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.ui.carousel.model.Video = {

        playVideo:function(video)
        {
            if(!this.hasFlash) return
            this.clear();
            this.status = 'play_video';
            this.videoPath = video.path;
            this.hideTextBlock = video.hidetext;
            this.notify();
        },

        stopVideo:function()
        {
            this.status = 'stop_video';
            this.videoPath = '';
            this.notify();
        },

        videoBegin:function()
        {
            this.status = 'video_begin';
            this.was_playing_video = true;
            this.notify();

            return true; // don't leave Flash ExtInterface hanging...
        },

        videoComplete:function()
        {
            this.status = 'video_complete';
            this.notify();
            this.start();

            return true;
        }

    }

sho.loaded_modules['/lib/js/sho/ui/carousel/model/video.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.carousel.Model
     * Model for carousel component.
     * This class was getting too complex so we broke it up into modules which are mixed-in.
     * The modules must be required before this class in the package loader.
     * Some of these circular dependancies betwen Panel + Model would probably be resolved
     * by allowing the model to maintain references to the panels... The panel view is currently
     * handling too much logic related to video playback...
    **/

    sho.ui.carousel.model_template = {};

    _.each('Base Audio Playback Video Metadata Observable'.split(' '), function(module){
        _.extend(sho.ui.carousel.model_template, sho.ui.carousel.model[module] || sho.core[module])
    });

    sho.ui.carousel.Model = Class.create(sho.ui.carousel.model_template);

sho.loaded_modules['/lib/js/sho/ui/carousel/model.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.carousel.TextBlock
     * Wrapper around the large text-callouts in each panel. The texblock contains a headline and a
     * call-to-action list. At startup, the copy is inspected to find the best possible fit (largest font size)
     * for the amount of text, and it is set into an invisible bounding box.
     *
     *      Rules for Headline:
     *      ------------------------
     *      2-3 lines -> 65px (large)
     *      4 lines -> 50px (medium)
     *      5+lines -> 45px (small)
     *
     * If a single word is too wide for the bounding box, (ie "californication") apply progressively
     * smaller font sizes until it fits (but never smaller than 45px).
     *
     * This is the dom structure for a typical Text-block:
     *
     *      <div class="text-block align-vert">
     *      	<span class="options tunein">Fridays at 9PM</span>
     *      	<span class="title">When We Left the Earth</span>
     *      	<span class="options more-info">
     *      		<a href="#" class="video">Watch a Preview</a>
     *      		<a href="#" class="details">More Info</a>
     *      	</span>
     *      </div>
     *
    **/

    sho.ui.carousel.TextBlock = Class.create({

        _KLASS_ : 'sho.ui.carousel.TextBlock',

        model:null,
        stage:null,
        container:null, /* divElement */
        title:null,     /* string */
        alignment:null, /* vert | horiz */

        text_bounds:{ 'width':450 },
        font_size:{     /* hash of font-size names and values. Actually, line-height is more relevant here. */
            'large' : 55,
            'medium' : 42,
            'small' : 39
        },
        max_num_lines : 5,
        initial_title_style_delay : sho.dom.REDRAW_DELAY * 10,   // was 4
        show_debug_styles : false,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'model' : cfg.model,
                'stage' : cfg.stage,
                'index' : cfg.index,
                'typeSize' : cfg.typeSize,
                'sizes' :  ['_END_','small','medium','large'],
                'alignment' : cfg.container.className.match(/align-(.+)/)[1], // potential 'align-horiz' option?
                'ui' : {
                    'container' : cfg.container,
                    'innerCnt' : cfg.container.select('.title')[0]
                }
            });

            this.title = this.sanitizeTitle(this.ui.innerCnt.innerHTML);

            this.hide();
            this.explodeTitle();
            this.wrap();

            if (this.typeSize != '') {
                this.styleTitle.bind(this, this.typeSize).delay(sho.dom.REDRAW_DELAY);
            }
            else {
                this.styleTitle.bind(this,'large').delay(sho.dom.REDRAW_DELAY);
            }

            this.model.addSubscriber(this);
            this.stage.addSubscriber(this);
        },

        wrap:function()
        {
            this.ui.container.setStyle({'width':this.text_bounds.width+'px'});
            if(this.show_debug_styles) this.ui.container.addClassName('debug')
        },

        explodeTitle:function()
        {
            this.ui.innerCnt.update('<u>'+ this.title.gsub(/\s/,'</u> <u>') + '</u>');
        },

        styleTitle:function(size)
        {
            var n = 100;
            if(size !== '_END_')
            {
                this.setFont(size);
                n = this.getNumberOfLines(size);
            }

            if(((n < 3 || (n == 4 && size == 'medium') || (n == 5 && size == 'small')) && !this.longestWordIsWiderThanContainer()) || (size == '_END_'))
            {
                this.cacheDimensions();
                this.alignVertically(this.stage.current());
				this.status = 'ready';
            }

            else
            {
                this.styleTitle.bind(this).delay(sho.dom.REDRAW_DELAY, this.sizes.pop());
            }
        },

        longestWordIsWiderThanContainer:function()
        {
            var w = this.text_bounds.width;
            return (this.ui.innerCnt.select('u').any(function(el){ return el.getWidth() > w }))
        },

        getNumberOfLines:function(size)
        {
            var height = this.ui.innerCnt.getHeight(), // subtract padding ?
            sizePixels = this.font_size[size],
            numLines = Math.floor(height/sizePixels)
            ;
            return numLines;
        },

        setFont:function(size)
        {
            this.ui.container.addClassName('font-'+size);
        },

        cacheDimensions:function()
        {
            this.ui.container._height = this.ui.container.getHeight();
        },

        alignVertically:function(stage)
        {
            if(this.ui.container._height)
            {
                var offset = stage.height - this.ui.container._height,
                    top = Math.round(offset / 2) + stage.top
                ;
                this.ui.container.setStyle(sho.object.toPixels({'top':top }));
            }
        },

        sanitizeTitle:function(title)
        {
            return title; // process manual <br /> here
        },

        alignVerticallyAndfocus:function()
        {
            this.alignVertically(this.stage.current());
            this.focus();
        },

        show:function()
        {
            this.ui.container.style.visibility = 'visible';
        },

        hide:function()
        {
            this.ui.container.style.visibility = 'hidden';
        },

        focus:function()
        {
			this.ui.container.style.display = 'none';
			this.show();

			if (this.status == 'ready') {
				$j(this.ui.container).fadeIn(500, function() {
				});
			}
			else { this.focus.bind(this).delay(sho.dom.REDRAW_DELAY); }
        },

        blur:function()
        {
			$j(this.ui.container).fadeOut(500, function() {
			});
        },

        update:function(e)
        {

            if(e.eventName == 'model:init')
            {
                if(this.index == e.index)
                {
                    this.focus.bind(this).delay(this.initial_title_style_delay);
                }
            }

            if(['model:next','model:set_panel'].include(e.eventName))
            {
                if(this.index == e.index)
                {
                    this.focus.bind(this).delay(this.model.panel_tween_length);
                }
                if(this.index == e.panelOut)
                {
                    this.blur();
                }
            }

            if(e.eventName == 'model:video_begin' && this.index == e.index)
            {
                if(e.hideTextBlock) this.hide();
            }

            if(e.eventName == 'stage:resize')
            {
                this.alignVertically(e.stage);
            }

        }


    });

sho.loaded_modules['/lib/js/sho/ui/carousel/textblock.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.ui.carousel.FlashPanel
     * Wrapper around the piece of flash that allows us to play streaming video in the background of the carousel.
    **/

    sho.ui.carousel.FlashPanel = Class.create({

        _KLASS_ : 'sho.ui.carousel.FlashPanel',

        model:null,
        container:null, /* <div class="flash-panel"></div> */
        innerContainer:null, /* <div class="flash-panel-inner"></div> */
        stage:null,
        flash:false,
        playing:false,
        showCrossHairs:false, // show registration marks in flash?
        height:null,

        flash_id : 'carousel-flash-panel',
        flash_wrapper_id : 'carousel-panel-swf',
        flash_source : '/assets/flash/lib/carousel/flashpanel_v6.swf',
        video_buffer_time : 3,
        minimum_flash_version_supported : '10.0.0',


        initialize:function(cfg)
        {
            Object.extend(this, {
                'model' : cfg.model,
                'container' : cfg.container,
                'stage' : cfg.stage,
                'showCrossHairs' : cfg.showCrossHairs || this.showCrossHairs
            });

            this.model.addSubscriber(this);
            if(swfobject && swfobject.hasFlashPlayerVersion(this.minimum_flash_version_supported))
            {
                this.drawInnerContainer();
                this.drawFlash();
            }
        },

        drawInnerContainer:function()
        {
            this.container.update([
                '<div class="flash-panel-inner">',
                    '<div class="', this.flash_wrapper_id, '" id="', this.flash_wrapper_id, '">',
                    '</div>',
                '</div>',

				'<img class="flash-img" src="/assets/images/lib/clear_1024x640.png" ',
				    'style="position:absolute; top:0; left:0; width:100%; height:100%; cursor:pointer;',
				'" />'

            ].join(''));
            this.innerContainer = this.container.select('.flash-panel-inner')[0];
        },

        drawFlash:function()
        {
            swfobject.embedSWF(this.flash_source, this.flash_wrapper_id,
                "100%",
                "100%",
                this.minimum_flash_version_supported,
                "/assets/flash/lib/expressInstall.swf",
                {
                    'bufferTime':this.video_buffer_time,
                    'videoBeginCallback':'sho.ui.carousel.MODEL.videoBegin',
                    'videoEndCallback' : 'sho.ui.carousel.MODEL.videoComplete',
                    'setIsMuteCallback' : 'sho.ui.carousel.MODEL.muteOnStartup',
                    'dev' : this.showCrossHairs,
                    'host' : 'akamai'
                },                                              // flashvars
                { 'wmode' : 'transparent' },                    // params
                { 'id' : this.flash_id },                       // attributes
                this.onEmbed.bind(this)
            );
        },

        onEmbed:function(e)
        {
            this.flash = $(this.flash_id);
            this.model.hasFlash = true;
        },

        update:function(e)
        {
            if(e.eventName == 'model:play_video')
            {
                this.show();
                this.playVideo(e.videoPath);
            }

            if(['model:stop_video','model:set_panel'].include(e.eventName))
            {
                this.stopVideo();
            }

            if(e.eventName == 'model:video_complete')
            {
                this.playing = false;
            }

            if(e.eventName.match(/model:video_(mute|unmute)/))
            {
                this[e.eventName.split('model:video_')[1]]();
            }

            if(e.eventName == 'model:next' && this.model.was_playing_video)
            {
                this.blur();
            }

			if(e.eventName == 'model:set_panel' && this.model.was_playing_video)
			{
				this.blur();
			}
        },

        playVideo:function(path)
        {

			if(this.flash && !this.playing)
            {
                if(!this.flash.playByPath)
				{
					this.model.start();
                } else {
					this.flash.playByPath(path);
	                this.playing = true;
                }

            }
        },

        stopVideo:function()
        {
            if(this.flash && this.playing)
            {
                this.playing = false;
                this.flash.stop();
            }
        },

        mute:function()
        {
            if(this.flash) this.flash.mute();
        },

        unmute:function()
        {
            if(this.flash) this.flash.unmute();
        },

        show:function()
        {
            this.container.setStyle({'left':'0px'});
            this.container.style.visibility = 'visible';
        },

        hide:function()
        {
            this.container.style.visibility = 'hidden';
        },

        focus:function()
        {
            this.show();
            this.tween('focus');
        },

        blur:function()
        {
            this.show();
            this.tween('blur');
        },

        tween:function(mode)
        {

			var th = this;

			if (this.model.transition == 'slide') {
				var w = this.stage.getWidth();
				this.container.setStyle(sho.object.toPixels({
					      left: (mode == 'focus' ? w : 0 )
    		    }))

				var leftOffset = (mode == 'focus' ? 0 : 0-w ); leftOffset += 'px';

				$j(this.container).animate({
				    left: leftOffset
				  }, (this.model.panel_tween_length*1000), function() {
				    th.onTweenEnd(mode);
				  });

			}

			if (this.model.transition == 'fade') {
				if (mode == 'focus') {
					this.container.style.display = 'none';	// set up for opacity tween
					$j(this.container).stop(true,true).fadeIn((this.model.panel_tween_length*1000), function() {
						th.onTweenEnd(mode);
				    });
				}
				if (mode == 'blur') {
					$j(this.container).stop(true,true).fadeOut((this.model.panel_tween_length*1000), function() {
						th.onTweenEnd(mode);
						th.container.style.display = 'block';
				 	});
				}
			}
        },

        onTweenEnd:function(mode)
        {
            if(mode == 'blur' && !this.playing) this.hide();

            this.container.setStyle({'left':'0px'});
			this.model.was_playing_video = false;
        }
    });


sho.loaded_modules['/lib/js/sho/ui/carousel/flashpanel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.carousel.Panel
     * The panel view. A panel instance is created for each div with a classname of 'panel' that is found in the carousel container
     *
     *      <div class="panel"
     *          data-default-cta-url="/sho/movies/titles/136760/the-twilight-saga-new-moon"
     *          data-default-cta-type="link"
     *          data-panel-index="0"
     *          data-promotion-id="59149">
     *          	<img src="http://www.sho.com/...home/panels/twilight_1024x640.jpg">
     *      		<div class="text-block align-vert">
     *      			<span class="title">The Twilight Saga: New Moon<\/span>
     *      			<span class="options more-info">
     *      				<a href="/sho/video/titles/13054/new-moon" class="video">
     *                          Watch Trailer
     *                      <\/a>
     *      				<a href="/sho/movies/titles/136760/the-twilight..." class="more">
     *                          Learn More
     *                      <\/a>
     *      			<\/span>
     *      		<\/div>
     *      <\/div>
    **/

    sho.ui.carousel.Panel = Class.create({

        _KLASS_ : 'sho.ui.carousel.Panel',
        base_id : 'carousel-panel-',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'parent' : cfg.parent,
                'model' : cfg.model,
                'stage' : cfg.stage,
                'index' : cfg.index,
                'image' : (cfg.container.select('img')[0]),
                'video' : sho.ui.Carousel.videoForPanel(cfg.index),     // this returns a video config object if a video is associated with the panel, false otherwise
                'container' : cfg.container,
                'typeSize' : cfg.typeSize,
                'apply_delay_to_video_start' : !sho.env.browser().isFireFox // ff seems to be the only browser that doesn't benefit from a small delay
            });
            this.container.id = this.base_id + this.index;
            if(this.index !== this.model.index) this.hide();
            this.collectPanelMetadata();
            this.subcribeToEvents();
            this.initTextBlock();
        },

        collectPanelMetadata:function()
        {
            this.model.setDefaultCallToAction(this.index, {
                'url' : this.container.readAttribute(this.model.default_cta_url_attribute), // using sho.dom.data would make these less awkward
                'type' : this.container.readAttribute(this.model.default_cta_type_attribute)
            });
        },

        subcribeToEvents:function()
        {
            this.stage.addSubscriber(this);
            this.model.addSubscriber(this);
        },

        initTextBlock:function()
        {
            this.textBlock = new sho.ui.carousel.TextBlock({
                'model' : this.model,
                'stage' : this.stage,
                'index' : this.index,
                'container' : this.container.select('.text-block')[0],
                'typeSize' : this.typeSize
            });

			this.title = this.textBlock.title.gsub('\'','&#39;');
        },

        update:function(e)
        {

            if(e.eventName =='model:init' && this.video && this.index == 0 && e.index == 0)
            {
                     var fn = this.onTweenEnd.bind(this, 'focus'); fn.delay(1.5);
            }

            if(e.eventName =='model:video_begin' && this.index == e.index)
            {
                this.hide.bind(this).delay(sho.dom.REDRAW_DELAY);
            }

            if(['model:next','model:set_panel'].include(e.eventName))
            {
                if(this.index == e.panelIn)
                {
                    this.focus();
                }
                else if(this.index == e.panelOut && !this.model.was_playing_video)
                {
                    this.blur();
                }
                else
                {
                    this.hide();
                }
            }

            if(e.eventName =='stage:resize')
            {
                this.image.setStyle(sho.object.toPixels(e.stage))
            }

        },

        show:function()
        {
            this.container.style.visibility = 'visible';
        },

        hide:function()
        {
            this.container.style.visibility = 'hidden';
        },

        focus:function()
        {
            this.show();
            this.tween('focus');
        },

        blur:function()
        {
            this.show();
            this.tween('blur');
        },

        tween:function(mode)
        {
			var th = this;

			if (this.model.transition == 'slide') {

				var w = this.stage.getWidth();
				this.container.setStyle(sho.object.toPixels({
					      left: (mode == 'focus' ? w : 0 )
    		    }))

				var leftOffset = (mode == 'focus' ? 0 : 0-w ); leftOffset += 'px';
				$j(this.container).stop().animate({
				    left: leftOffset
				  }, (this.model.panel_tween_length*1000), function() {
				    th.onTweenEnd(mode);
				  });

			}

			if (this.model.transition == 'fade') {
				if (mode == 'focus') {
					this.container.style.display = 'none';	// set up for opacity tween
					$j(this.container).stop(true,true).fadeIn((this.model.panel_tween_length*1000), function() {
						th.onTweenEnd(mode);
				    });
				}
				if (mode == 'blur') {
					$j(this.container).stop(true,true).fadeOut((this.model.panel_tween_length*1000), function() {
						th.onTweenEnd(mode);
				 	});
				}
			}
        },

        onTweenEnd:function(mode)
        {
            if(mode == 'blur') this.hide();
            if(mode == 'focus' && this.video) this.model.playVideo(this.video);
            this.model.setTweening(false);
        }

    });

sho.loaded_modules['/lib/js/sho/ui/carousel/panel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.carousel.Thumb
     * An individual thumb in the horizontal group of thumbs that is the Carousel's 'filmstrip'.
    **/

    sho.ui.carousel.Thumb = Class.create({

        _KLASS_ : 'sho.ui.carousel.Thumb',

        parent:null,
        model:null,
        container:null, /* <div class="docked carousel-thumb" /> */
        view : new Template(['',
            '<div id="#{id}" class="thumb #{pinkie}#{last}" style="',
                'width:#{width}; ',
            '">',
                '<div class="thumb-inner" style="background-image: url(#{src});">',
                    '<div class="thumb-indicator"></div>',
                    '<div class="title">',
                        '<b>#{title}</b>',
                    '</div>',
                '</div>',
            '</div>',
        ''].join("\n")),

        thumb_source_dimensions : '192x120',
        thumb_height : 90,
        thumb_width : 144,
        image_ratio : 0.625, // 90/144
        base_id : 'carousel-thumb-',

        indicator_styles : {
            aktiv_expanded  : 'height:6px;',
            aktiv_collapsed : 'height:3px;',
            idle_expanded   : 'height:6px;',
            idle_collapsed  : 'height:0px;'
        },

        expanded : true,

        initialize:function(cfg)
        {
            _.extend(this, {
                'ui':          {},                             // container for cached elements
                'aktiv':       false,                          // inactive at startup
                'model':       cfg.model,                      // sho.ui.carousel.Model
                'parent':      cfg.parent,                     // sho.ui.carousel.Filmstrip
                'index':       cfg.index,                      // Number
                'id':          this.base_id + cfg.index,       // 'div-id-prefix+index'
                'title':       (cfg.title || '&nbsp;').stripTags(),    // 'Quantum of Solace'  strip potential <br> tags
                'width':       cfg.width,                      // '68.3%'
                'useShims':    cfg.useShims,                   // IE requires a different approach for scaling thumbs
                'last' :       cfg.last ? ' last'  : ''        // a css hook for pseudo-selectors in IE
            })
            ;
            this.src = this.getSrc(cfg.src || '');

            this.build();
            this.model.addSubscriber(this);
        },

        getSrc:function(src)
        {
            return src.gsub(/(\d{1,4}x\d{1,4})\.(\D{3})/,this.thumb_source_dimensions + '.#{2}');
        },

        build:function()
        {
            this.parent.ui.innerCnt.insert({
                'bottom' : this.view.evaluate(this)
            });

            this.ui.container = this.parent.ui.innerCnt.select('.thumb:last-child')[0];
            this.ui.innerCnt = (this.ui.container.select('.thumb-inner')[0]);
            this.ui.indicator = this.ui.container.select('.thumb-indicator')[0];
            if(this.useShims) this.drawShim();
        },

        drawShim:function()
        {
            this.parent.ui.container.addClassName('shimmed');
            this.ui.container.setStyle({
                'overflow':'hidden'         // why?
            });
            this.ui.innerCnt.setStyle({
               'background':'none'          // we moved the bg graphic into innerCnt for more accurate margins
            });

            this.ui.innerCnt.insert({'top':'<div class="shim"><div class="shim-inner"></div></div>'});
            this.ui.shim = (this.ui.innerCnt.select('.shim-inner')[0]);
            this.ui.shim.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\',sizingMethod=\'scale\')';
        },


        update:function(e)
        {
            var state = '';

            if(['model:start','model:next','model:set_panel','filmstrip:focus','filmstrip:blur'].include(e.eventName))
            {
                if(this.index == this.model.index)
                {
                    state = 'aktiv_';
                    this.ui.container.addClassName('aktiv');
                }
                else
                {
                    state = 'idle_';
					this.ui.container.removeClassName('aktiv');
                }

                if(e.eventName.match(/filmstrip:(.+)/))
                {
                    this.expanded = (e.eventName.match(/filmstrip:(.+)/)[1] == 'blur' )
                }

                state += this.expanded ? 'expanded' : 'collapsed'

                if(!this.useShims) {
                    this.ui.indicator.morph( this.indicator_styles[state], {
                        duration : 0.33
                    })
                }
            }

        },

        updateShim:function(width)
        {
            var h,w,l,t,s={};

            if(width > this.thumb_width)
            {
                h = Math.floor(width * (this.thumb_height / this.thumb_width));
                t = 0 - (Math.round((h - this.thumb_height) / 2));
                s.top = t;
                s.left = 0;
                s.width = width;
                s.height = h;
            }
            else
            {
                l = Math.round((width - this.thumb_width) / 2);
                s.top = 0;
                s.left = l;
                s.width = this.thumb_width;
                s.height = this.thumb_height
            }

            this.ui.shim.setStyle(sho.object.toPixels(s));
        }

    });


    sho.ui.carousel.Thumb.base_id = sho.ui.carousel.Thumb.prototype.base_id;

sho.loaded_modules['/lib/js/sho/ui/carousel/thumb.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.ui.carousel.FilmStrip
     * Component that provides the ability to select a panel, in the form of a horizontal strip of thumbnails
    **/

    sho.ui.carousel.FilmStrip = klass({

        _KLASS_ : 'sho.ui.carousel.FilmStrip',

        'fullbleed':      true,
        'height_closed':  6,
        'height_open':    90,
        'status':         'init',
        'tween_length':   0.5,
        'minimum_panels': 4,
   	    'filmstrip_delay_percent' : .90,
        'custom_width_when_less_than_minimum' : '20%',
        'klass_names' : {
            'custom_width' : 'custom-width',
            'innerCnt' : 'carousel-filmstrip-inner'
        },

        initialize:function(cfg)
        {
            var b=sho.env.browser(),isIE=b.isIE,useShims=b.isIE && b.version < 9;

            _.extend(this, {
                'stage' : cfg.stage,
                'model' : cfg.model,
                'panels' : cfg.panels,
                'fullbleed' : cfg.fullbleed || this.fullbleed,
                'useShims' : !!useShims,
				'filmStripOpenAtStartup' : cfg.filmStripOpenAtStartup,
                'ui' : {
                   container : cfg.container,
                   bounds : cfg.bounds
                }
            });
            this.ui.container.insert({'bottom':'<div class="'+ this.klass_names.innerCnt +'"></div>'});
            this.ui.innerCnt = this.ui.container.select('.' + this.klass_names.innerCnt)[0];
            this.thumbs = [];
            this.build();

			if(this.useShims) { this.height_open = 87; }

			if(this.filmStripOpenAtStartup) {
				this.ui.container.addClassName('start-open');
			}

        },

        build:function()
        {
            this.drawThumbs();
            this.setHandlers();
        },

        drawThumbs:function()
        {
            var th=this,
                w,
                width,
                len = this.panels.length,
                panels=this.panels,
                klaus
            ;

            if(this.useCustomWidth())
            {
                this.ui.container.addClassName(this.klass_names.custom_width);
                width = this.custom_width_when_less_than_minimum;
            }
            else
            {
                w = 100 / len;
                width = w+'%';
            }

            panels.each(function(p,idx)
            {
                klaus = !p.pinkie ? 'Thumb' : 'Pinkie'; th.thumbs.push(new sho.ui.carousel[klaus]({
                    'parent' :  th,
                    'model' :   th.model,
                    'index' :   idx,
                    'width' :   width,
                    'title' :   p.title,
                    'src' :     (p.image || {}).src,
                    'useShims': th.useShims,
                    'pinkie' :  p.pinkie,
                    'last' :    p.pinkie || (p.index == len-1)
                }));
            });
        },

        setHandlers:function()
        {
            var fn = this.onEnter.bind(this);
            ([this.ui.container,this.ui.bounds]).invoke('observe','mouseenter', fn);

            this.model.addSubscriber(this);
            if(this.useShims) this.stage.addSubscriber(this);
        },

        onEnter:function()
        {
            this.update({ 'eventName' : 'filmstrip:focus' });
        },

        update:function(e)
        {

            if(e.eventName == 'model:init')
            {
                if(!this.filmStripOpenAtStartup)
                {
					this.close();
				}
				else {
					this.update({ 'eventName' : 'filmstrip:focus' });
				}
            }

            if(e.eventName == 'model:start')
            {
                if(!this.filmStripOpenAtStartup) { this.blur(); }
            }

			if(e.eventName == 'model:next')
            {
				if(sho.$(this.ui.container).ismouseover() && this.filmStripOpenAtStartup)
				{
					this.filmStripOpenAtStartup = false; return;
				}
				else if(this.filmStripOpenAtStartup )
				{
				    this.blur(); this.filmStripOpenAtStartup = false;
				}
            }

            if(e.eventName == 'model:set_panel' || e.eventName == 'filmstrip:focus')
            {
                if(this.status !== 'open') this.focus();
            }

            if(e.eventName == 'filmstrip:blur')
            {
                if(this.status !== 'closed' && !this.filmStripOpenAtStartup) this.blur();
            }

            if(e.eventName == 'stage:resize' && this.useShims)
            {
                var twidth = this.getThumbWidth(e.stage, this.thumbs.length);
                this.thumbs.each(function(t){ t.updateShim(twidth); })
            }
        },

        open:function()
        {
            this.ui.container.setStyle({ height : this.height_open + 'px' });
            this.status = 'open'
        },

        close:function()
        {
            this.ui.container.setStyle({ height : this.height_closed + 'px' });
            this.status = 'closed';
        },

        focus:function()
        {
            this.tween('open');
            this.withEachThumb(function(t){
                t.update({ eventName : 'filmstrip:focus' });
            })
			this.model.filmStripIsOpen = true;
        },

        blur:function()
        {
            this.tween('closed');
			this.ui.container.toggleClassName('aktiv');
            this.withEachThumb(function(t){
                t.update({ eventName : 'filmstrip:blur' });
            })
			this.model.filmStripIsOpen = false;

        },

        tween:function(mode, delay)
        {
            this.ui.container.morph(sho.object.toCssString({
                height : this['height_'+mode]
            }), {
                transition : 'easeInOutExpo',
                duration : this.tween_length,
                delay : delay || 0,
                after : this.onTweenEnd.bind(this,mode)
            });
        },

        onTweenEnd:function(mode)
        {
            this.status = mode;
        },

        getThumbWidth:function(stage, numberOfThumbs)
        {
            if(!this.useCustomWidth())
            {
                return Math.floor(stage.viewport.width / numberOfThumbs);
            }
            else
            {
                var percentToPixels = Number(this.custom_width_when_less_than_minimum.gsub('%', '')) / 100, // 20% -> .20
                    pixels = Math.round(percentToPixels * stage.viewport.width)
                ;
                return pixels
            }

        },

        useCustomWidth:function()
        {
            var len = this.panels.length;
            return len < this.minimum_panels
        },

        withEachThumb:function(fn)
        {
            this.thumbs.each(fn);
        }


    });

sho.loaded_modules['/lib/js/sho/ui/carousel/filmstrip.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.ui.carousel.Stage = Class.create(Object.extend({

        _KLASS_ : 'sho.ui.carousel.Stage',
        subscribers : [],

        carousel:null,      // <sho.ui.carousel.Carousel>
        dimensions:null,    // { width:number, height:number }
        minimum:null,       // { width:number, height:number }
    	margins:null,       // { top:10,right:0,bottom:50,left:0 }
    	stage:null,

    	set_document_container_constraints:false,

        initialize:function(cfg)
        {
            Object.extend(this, cfg);
            this.setConstraints();
            this.setHandlers();
        },

        setConstraints:function()
        {
            if(this.set_document_container_constraints && this.minimum.width && this.minimum.height){
                $$('.container').invoke('setStyle', {
                    'minWidth' : this.minimum.width+'px',
                    'minHeight' : this.minimum.height+'px'
                })
            }
        },

        setHandlers:function()
        {
            window.onresize = this.update.bind(this); this.update();
        },

        update:function()
        {
            var th=this,
                natural = this.dimensions,
                viewport = document.viewport.getDimensions(),
                w = sho.number.inRange(viewport.width, this.minimum.width),
                h = sho.number.inRange(viewport.height, this.minimum.height),
                target = {
                    'width' :  w - this.margins.right - this.margins.left,
                    'height' : h - this.margins.top - this.margins.bottom
                },
                sx = target.width / natural.width,
                sy = target.height / natural.height,
                s = {}
            ;

            if (target.height > this.maximum.height) { target.height = this.maximum.height; }

            s.viewport = viewport;

            if(sx > sy)
            {
                	if (target.width <= this.maximum.width) {
	                	s.height = Math.round(natural.height * sx);
	                	s.width = target.width;
					}
					else {
						s.height = Math.round(natural.height * (this.maximum.width/natural.width));
						s.width = this.maximum.width;
					}
                s.top = Math.round(0-(s.height - target.height)/2)
                s.left = 0;
            }
            if(sy > sx)
            {
                s.height = target.height;
                s.width = Math.round(natural.width * sy);
                s.left = Math.round(0-(s.width - target.width)/2)
                s.top = 0;
            }

            s.visibleWidth = target.width;
            s.visibleHeight = target.height;

            this.stage = s;
            this.notify();
        },

	    onNotify:function(subscriber)
	    {
	        subscriber.update({
	            'eventName':'stage:resize',
                'stage' : this.stage
            })
	    },

	    getWidth:function()
	    {
	        return this.stage.width;
	    },

	    getHeight:function()
	    {
	        return this.stage.height;
	    },

	    getDimensions:function()
	    {
	        return {
	            'width' : this.stage.width,
	            'height' : this.stage.height,
	            'visibleWidth' : this.stage.visibleWidth,
	            'visibleHeight':this.stage.visibleHeight
	        }
	    },

	    current:function()
	    {
	        return this.stage
	    }

    }, sho.core.Observable ));

sho.loaded_modules['/lib/js/sho/ui/carousel/stage.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	!function($)
	{

    sho.ui.carousel.View = klass({

        _KLASS_ :   'sho.ui.carousel.View',
        base_id :   'carousel-panel-',
		cookie_key: 'sho_carousel_filmstrip',

        initialize:function(cfg)
        {
            _.extend(this, {
                'model' :       cfg.model,
                'container' :   cfg.container,
                'content' :     cfg.content,
                'dimensions' :  cfg.dimensions,
                'minimum' :     cfg.minimum,
				'maximum' :     cfg.maximum,
                'margins' :     cfg.margins,
                'thumbnails' :  cfg.thumbnails,
                'panels' :      [],
                'queue' : [],
				'filmStripOpenAtStartup' : cfg.filmStripOpenAtStartup,
				'typeSize' :    cfg.typeSize,
				'fn' : {}
            });

            this.initStage();
            this.initPanels();
            this.initFilmStrip();
            this.initFlashPanel();
            this.initAudioControls();
            this.setHandlers();

            var nudge = _.bind(sho.dom.trigger, window, 'stickyfooter:update');
            _.delay(nudge, sho.dom.REDRAW_DELAY_);
        },

        initStage:function()
        {
            this.stage = new sho.ui.carousel.Stage({
                'dimensions' : this.dimensions,
                'minimum' : this.minimum,
				'maximum' : this.maximum,
                'margins' : this.margins
            });

            this.stage.addSubscriber(this);
        },

        initPanels:function()
        {
            var th=this; $(this.content).find('.panel').each(function(i)
            {
                th.panels.push( new sho.ui.carousel.Panel({
                    'model' : th.model,
                    'parent' : th,
                    'index' : i,
                    'container' : this,
                    'stage' : th.stage,
                    'typeSize' : th.typeSize
                }));
            });
            this.model.numPanels = this.panels.length;
        },

        initFilmStrip:function()
        {
            if(this.panels.length > 1 && this.thumbnails)
            {
                this.filmstrip = new sho.ui.carousel.FilmStrip({
                    'model' :   this.model,
                    'stage' :   this.stage,
                    'panels' :  this.panels,
                    'container' : $(this.container).find('.carousel-filmstrip').get(0),
                    'bounds' :    $(this.container).find('.carousel-filmstrip-bounds').get(0),
					'filmStripOpenAtStartup' : this.filmStripOpenAtStartup,
                });
            }
            else
            {
                this.filmstrip = { 'update' : sho.emptyFunction };
				$(this.container).find('.carousel-filmstrip, .carousel-filmstrip-bounds').hide();
            }
        },

        initFlashPanel:function()
        {
            this.flashPanel = new sho.ui.carousel.FlashPanel({
                'model' : this.model,
                'stage' : this.stage,
                'container' : $(this.container).find('.flash-panel').get(0)
            });
        },

        initAudioControls:function()
        {
            this.audioControls = new sho.ui.carousel.AudioControls({
                'model' : this.model,
                'container' : this.content
            })
        },

        setHandlers:function()
        {
            this.container.observe('click', this.click.bindAsEventListener(this));

            this.fn.onMouseMove =   _.bind(this.onMouseMove.throttle(0.125), this);
            $(this.content).on('mousemove', '.text-block, .panel, .flash-img', _.bind(this.mouseMove,  this));
            $(this.container).on('mouseleave', _.bind(this.onMouseLeave, this));
        },


        mouseMove:function(e)
        {
            this.queue.push(e.currentTarget.className.split(' ')[0])//$(e.currentTarget).hasClass('text-block') ? 'text' : 'panel')
            this.fn.onMouseMove();
        },

        onMouseMove:function()
        {
            var q = [this.queue.pop(),this.queue.pop()].join(' '); this.queue= []; // can't use [].splice here...

            this.update({
                'eventName' : (q.match(/text/) ? 'textblock:focus' : 'content:focus')
            })
        },

        onMouseLeave:function(e)
        {
            this.update({'eventName':'view:blur'})
        },

        click:function(e)
        {
            var eventName=null, el = e.findElement('.thumb, .video, .more, .carousel-audio-controls .toggle, .panel, .flash-img');

            if(el)
            {
                if(el.hasClassName('toggle'))       eventName = 'toggle_sound';
                if(el.hasClassName('thumb'))        eventName = 'set_panel';
                if(el.hasClassName('pinkie'))       eventName = 'pinkie:click';
                if(el.hasClassName('panel'))        eventName = 'default_call_to_action';
                if(el.hasClassName('flash-img'))    eventName = 'default_call_to_action:flash_panel';

                if(eventName)
                {
                    e.stop(); this.update({
                        'eventName' : 'view:'+eventName,
                        'element' : el
                    })
                }
            }
        },

        update:function(e)
        {
            if(e.eventName == 'stage:resize')
            {
                var w = e.stage.visibleWidth;
				this.content.setStyle(sho.object.toPixels({
				    'width'  : w <= this.maximum.width ? w : this.maximum.width,
				    'height' : e.stage.visibleHeight
				}));
            }

            if(e.eventName == 'textblock:focus')
            {
                this.model.pause();
            }

            if(e.eventName == 'view:blur' || e.eventName == 'content:focus')
            {
                this.model.unpause()
                this.filmstrip.update({'eventName':'filmstrip:blur'})
            }

            if(e.eventName == 'view:set_panel'){
                this.setPanel(e.element);
            }

            if(e.eventName == 'view:toggle_sound'){
                this.model.toggleSound();
            }

            if(e.eventName == 'view:default_call_to_action'){
                this.defaultCallToActionClick(e.element);
            }

            if(e.eventName == 'view:default_call_to_action:flash_panel'){
                var panel = this.panels[this.model.index],
                    el = panel.container
                ;
                this.defaultCallToActionClick(el)
            }
        },

        defaultCallToActionClick:function(el)
        {
            var cta = this.model.getDefaultCallToAction(this.panelIndexFromElement(el,'panel'));

            if(cta && cta.type == 'video')
            {
                log('default call-to-action video clicked, but this is not yet implemented');
            }
            if(cta && cta.type == 'link' && !!cta.url)
            {
                window.location = cta.url;
            }
        },

        setPanel:function(el)
        {
            if(!this.model.tweening) this.model.setPanel(this.panelIndexFromElement(el,'thumb'));
        },

        panelIndexFromElement:function(el,type)
        {
            var prefix = type == 'thumb' ? sho.ui.carousel.Thumb.base_id : this.base_id;
            return Number(el.id.gsub(prefix,''))
        },

		getFilmStripCookie:function()
        {
            return !!sho.util.Cookies.read(this.cookie_key);
        },

		setFilmStripCookie:function()
        {
            sho.util.Cookies.write(this.cookie_key,true);
        }
    });


    }(sho.$)












sho.loaded_modules['/lib/js/sho/ui/carousel/view.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * mixin sho.ui.carousel.Videos
     * Module related to the carousel's video-panel capabilities, for example the  pairing of flash videos with panels.
     * The functions defined here are mixed in to sho.ui.Carousel, where they are accessible as static (class) methods.
     *
     * In the jsp/html layer, the panels are available as a data collection, and in addition to iterating over this in order
     * to draw the panel markup, it is used to build up the call to registerVideo inline:
     *
     *    	<script type="text/javascript">
     *    	    sho.ui.Carousel.registerVideo({
     *    	    	'path' : '/15002/carouselpanels/408_1_0_car_bse',
     *    	    	'autostart' : true,
     *    	    	'position' : 4,
     *    	    	'hidetext' : true
     *    	    });
     *    	<\/script>
     *
     * Note that panels are zero-indexed, while position is not. *For the third panel in the set, use a position property of 2*
    **/


    sho.ui.carousel.Videos = {

        videos : [],

        /**
         * sho.ui.carousel.registerVideo(cfg) -> Null
         * register a single video, for example, in an inline script along with panel markup
        **/
        registerVideo : function(v)
        {
            this.videos.push(this.sanitizeVideo(v))
        },

        /**
         * sho.ui.carousel.registerVideos(Array) -> Null
         * register multiple videos at once
        **/
        registerVideos : function(videos)
        {
            var th=this, updated = ([this.videos, videos.collect(function(v){
                return th.sanitizeVideo(v)
            }) ]).flatten();
            this.videos = updated;
        },

        /**
         * sho.ui.carousel.sanitizeVideo(cfg) -> Object
         * Called internally to ensure the typing of properties passed in video config
        **/
        sanitizeVideo : function(v)
        {
            return {
                'path' : v.path.gsub(/http:\/\/cnetsho\.vo\.llnwd\.net\//,'/mp4:/'),
                'autostart' : Boolean(v.autostart),
                'position' : v.position,
                'hidetext' : Boolean(v.hidetext)
            };
        },

        /**
         * sho.ui.carousel.videoForPanel(idx) -> Object
         * Get the video for a given panel (position)
        **/
        videoForPanel : function(idx)
        {
            var video = false;
            for(var v=0; v<this.videos.length; v++){
                if (Number(this.videos[v].position-1) == Number(idx)){
                    video = this.videos[v]; break;
                }
            }
            return video;
        }
    }



sho.loaded_modules['/lib/js/sho/ui/carousel/videos.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.ui.carousel.AudioControls = Class.create({

        _KLASS_ : 'sho.ui.carousel.AudioControls',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'model' : cfg.model,
                'ui' : { 'container' : cfg.container }
            });

            this.build();
            this.model.addSubscriber(this);
        },

        build:function()
        {
            this.ui.container.insert({ 'bottom':(['',
             '<div class="carousel-audio-controls sound-on" style="display:none;">',
                '<a href="#" class="control toggle">Sound On/Off</a>',
            '</div>',
            '']).join('') });
            this.ui.innerCntr = this.ui.container.select('.carousel-audio-controls')[0]
        },


        update:function(e)
        {

            if(e.eventName == 'model:play_video')
            {
                this.show();
            }

            if(e.eventName == 'model:video_complete')
            {
                this.hide();
            }

            if(e.eventName == 'model:video_mute')
            {
                this.ui.innerCntr.removeClassName('sound-on').addClassName('sound-off');
            }

            if(e.eventName == 'model:video_unmute')
            {
                this.ui.innerCntr.removeClassName('sound-off').addClassName('sound-on');
            }

        },

        show:function()
        {
            this.ui.innerCntr.show();
        },

        hide:function()
        {
            this.ui.innerCntr.hide();
        }

    });


sho.loaded_modules['/lib/js/sho/ui/carousel/audiocontrols.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


	!function($){

    sho.ui.carousel.Carousel = klass({

        defaults:{
            'speed' : 8,
            'autostart' : true,
            'fullbleed' : true,
            'thumbnails' : true,
			'transition' : 'slide',
			'filmStripOpenAtStartup' : true,
			'typeSize' : null    // fontSize is reserved
        },

        initialize:function(cfg)
        {
            _.extend(this, this.defaults, cfg);

            var fragment = window.location.search.match(/\?(p|panel)=(\d+)/), params = fragment ? {
                'firstPanel' : fragment[2]
            } : {};

			var panelDelay = sho.ui.carousel.getPanelDelay();
			this.speed = (panelDelay > 0 ? panelDelay : this.speed);

            this.model = new sho.ui.carousel.Model({
                'speed' : this.speed,
				'transition' : cfg.transition ? cfg.transition : this.defaults.transition,
                'params' : params
            });

            this.view = new sho.ui.carousel.View({
                'model' :       this.model,
                'container' :   cfg.container,
                'content' :     $('.carousel-content').get(0),
                'dimensions' :  sho.string.toDimensions(cfg.dimensions),
                'minimum' :     sho.string.toDimensions(cfg.minimum),
				'maximum' :     sho.string.toDimensions(cfg.maximum),
                'margins' :     sho.string.toBox(cfg.margins),
                'thumbnails' :  this.thumbnails,
				'filmStripOpenAtStartup' : this.filmStripOpenAtStartup,
				'typeSize' :    cfg.typeSize ? cfg.typeSize : null
            });

            sho.dom.bind('video_player:created',    _.bind(this.model.onVideoPlayerCreated, this.model));
            sho.dom.bind('video_player:destroyed',  _.bind(this.model.onVideoPlayerDestroyed, this.model));

            this.autostart && this.view.panels.length > 1 && this.model.start();
        }

    });

    sho.ui.carousel.getPanelByPromotionId = function(id)
    {
        var el =    $('.carousel-content .panel[data-promotion-id='+id+']').get(0),
            idx =   !!el ? Number(sho.dom.data.read(el, 'panel-index')) : null ; return idx
    }

    sho.ui.carousel.getPanelDelay = function()
    {
        var el =    $('.carousel-content .panel').get(0),
            delay = !!el ? Number(sho.dom.data.read(el, 'panel-duration')) : null ; return delay;
    }

    _.extend(sho.ui.carousel.Carousel, sho.ui.carousel.Videos );

    sho.ui.Carousel = sho.ui.carousel.Carousel;

    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/carousel/carousel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui/carousel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.provide('sho.ui.carouselremix');

    !function($)
    {

    sho.ui.carouselremix.Widget = klass({

        _KLASS_ : 'sho.ui.carouselremix.Widget',

        'defaults' : {
            'duration' : 6
        },

        'ratio' : 9/16,
        'controls_height' : 80,

        initialize:function(cfg)
        {
            var c = $(cfg.container),

            fragment = window.location.search.match(/\?(p|panel)=(\d+)/),
            panelId = fragment ? fragment[2] : 0
            ;
            _.extend(this, {
                'container'      : c,
                'controls'       : c.find('.carousel-rmx-controls'),
                'footers'        : c.find('.carousel-rmx-footer'),
                'indicator'      : c.find('.panel-indicator'),
                'nextPrevCntrls' : c.find('.carousel-rmx-next-prev'),
                'duration'       : (sho.ui.carouselremix.getPanelDelay() || (cfg.duration || this.defaults.duration)) * 1000,
                'startSlide'     : (sho.ui.carouselremix.getPanelIndexFromPromotionId(panelId)),
                'length'         : c.find('.panel').length
                ,
                'fn' : {
                    'onSwipe'     : _.bind(this.onSwipe, this),
                    'onReady'     : _.bind(this.onReady, this),
                    'nextPrev'    : _.bind(this.nextPrevClicked, this),
                    'adjustMask' :  _.bind(this.adjustMask, this),
                    'adjustControls' : _.bind(this.adjustControls, this),
                    'onPanelClick' :     _.bind(this.onPanelClick, this)
                }
            });

            this.initSwipe();
            this.drawMask();
            this.setHandlers();

            this.adjustHeadline();
            this.adjustFooters();
            this.adjustControls();
        },


        initSwipe:function()
        {
            this.swipe = Swipe(this.container.get(0), {
                'startSlide' : this.startSlide,
                'auto' : this.duration,
                'continuous' : true,
                'ready' : this.fn.onReady,
                'callback' : this.fn.onSwipe,
                'setPixels' : true
            });

            if(this.startSlide != 0){
                this.onSwipe(this.startSlide);
            }
        },

        drawMask:function()
        {
            this.mask = $('<div class="carousel-remix-shim">&nbsp;</div>').insertAfter(this.container);
        },

        setHandlers:function()
        {
            this.nextPrevCntrls.on('click','a', this.fn.nextPrev);

            this.container.on('click','.panel', this.fn.onPanelClick);

            $(window).resize(this.fn.adjustControls);
        },

        onReady:function()
        {
            this.container.parent().removeClass('loading');
        },

        adjustHeadline:function()
        {
            var base_width = 220; _(this.container.find('.panel')).each(function(el){
                var headline =  $(el).find('.carousel-rmx-footer-head h4'),
                    txtWidth =  headline.width(),
                    head =      $(headline.parent()),
                    container=  $(head.parent()),
                    offset =    base_width - txtWidth
                ;

                head.width(txtWidth);

                if(headline.height() > container.height()) container.height(headline.height());

                container.css({'padding-left':(txtWidth+20+20)})
            })
        },

        adjustFooters:function()
        {
            sho.dom.normalize('min-height', this.footers);
        },

        adjustControls:function()
        {
            var w = this.container.width(),
                h = ((Math.floor(w * this.ratio )*100)/100),
                t = h - this.controls_height
            ;
            this.controls.css({'top':t})
            this.adjustMask({
                'width' : w,
                'height' :h
            })
        },

        adjustMask:function(dimens)
        {
            this.mask.css({'left':(dimens.width-1 )})
        },

        onSwipe:function(idx, el)
        {
            idx = !!idx ? idx : 0;
            if(idx >= this.length) idx = (idx % this.length);
            this.indicator.find('li').removeClass('aktiv').eq(idx).addClass('aktiv')
        },

        onSwipeEnd:function()
        {
        },

        nextPrevClicked:function(e)
        {
            sho.dom.trap(e);

            var mode =  e.currentTarget.className,
            method =    sho.string.toMethodName(mode+'-and-resume')
            fn =        this.swipe[method]
            ;
            fn.call(this.swipe);
        },


        onPanelClick:function(e)
        {
            var el  = e.currentTarget,
                url = sho.dom.data.read(el, 'defaultCtaUrl')
            ;
            if(url)
            {
                window.location = url;
            }
        }



    });

    }(sho.$)

    sho.ui.CarouselRemix = sho.ui.carouselremix.Widget;


sho.loaded_modules['/lib/js/sho/ui/carouselremix/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($, context)
    {
        var getPropertyIfElement = function(selector, property)
        {
            var el = $(selector);
            return _.any(el) ? Number(sho.dom.data.read(el, property)) : null
        }

        _.extend(context, {

            'getPanelIndexFromPromotionId' : (function(id){
                return getPropertyIfElement('.carousel-rmx .panel[data-promotion-id='+id+']', 'panel-index')
            }),

            'getPanelDelay' : (function(id){
                return getPropertyIfElement('.carousel-rmx .panel:first-child', 'panel-duration')
            })

        })

    }(sho.$, sho.ui.carouselremix)
sho.loaded_modules['/lib/js/sho/ui/carouselremix/statics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/carouselremix.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.layouts');


    sho.ui.layouts.ColumnManager = Class.create({

        _KLASS_ : 'sho.ui.layouts.ColumnManager',

        klass_names : {
            'columns' : ['c1','c2','c3','c4','col-1','col-2','col-3','col-4']
        },

        initialize:function(cfg)
        {
            Object.extend(this, {
                'klass_names' : cfg.klass_names || this.klass_names,
                'margins' : sho.string.toBox(cfg.margins),
                'ui' : { 'container' : cfg.container }
            })
            this.setHandlers();
        },

        setHandlers:function()
        {
            this.ui.columns = this.ui.container.select('.' + this.klass_names.columns.join(', .'));
            var f=this.normalizeColumnHeights.bind(this);
            Event.observe(window, 'resize', f); f.delay(sho.dom.REDRAW_DELAY);
        },

        normalizeColumnHeights:function()
        {
            var outerHeight=document.viewport.getDimensions().height, innerHeight=outerHeight - this.margins.top - this.margins.bottom;

            sho.dom.normalize('height', this.ui.columns);

            var th=this, h=0, height=0; this.ui.columns.each(function(el)
            {
                h = el.getHeight();
                height = h < innerHeight ? innerHeight : h;
                el.setStyle({'height':height+'px'})
            })
        }

    });


sho.loaded_modules['/lib/js/sho/ui/layouts/columnmanager.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui/layouts.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.ui.login
     * namespace for login components
    **/

    sho.provide('sho.ui.login');


    /**
     * class sho.ui.login.SocialSignonBox
     * Wrapper around social sign-on gigya component.
    **/
    !function($){
    sho.ui.login.SocialSignonBox = klass({

        _KLASS_ : 'sho.ui.login.SocialSignonBox',

        cfg : {},

        defaults : {
            'enabledProviders' :   "facebook, twitter, googleplus",
    		'redirectURL' : '/sho/accounts/link-accounts',
    		'authFlow' : 'popup',
			'redirectMethod': 'post'
        },

        /**
         * new sho.ui.login.SocialSignonBox(cfg)
         * Constructor for the social signon box component. Accepts a config object containing the container element and optional redirectURL for the context
        **/
        initialize:function(cfg)
        {
            _.extend(this, this.defaults, {
                'redirectURL' : (cfg.redirectURL || sho.dom.data.read(cfg.container, 'redirectUrl') || this.defaults.redirectURL),
                'authFlow'    : (cfg.authFlow ||    sho.dom.data.read(cfg.container, 'authFlow')    || this.defaults.authFlow),
                'container'   : cfg.container,
                'callback'    : (this.onLogin)
            });

            if(this.authFlow == 'redirect')
            {
                 this.redirectURL = sho.env.Utils.getAbsoluteUrl(this.redirectURL, 'https://');
            }

			this.providers = this.enabledProviders.split(', ');

			var th=this;
			var eventType = sho.isDesktop() == true ? 'click': 'tap';
			var html = _.flatten([
				'<ul id="loginUL">',
				_.map(this.providers, function(p){
					return	'<li><a name="'+ p +'"><img src="/assets/images/accounts/social_connections/36x36/social_icon_'+ p +'_36x36.png" alt="'+ p.toUpperCase() +'" /></a></li>'
				}),
				'</ul>'
			]).join('');

			$(this.container).prepend(html)

			_.each($('#loginUL li a'),function(link){
				$(link).on(eventType, _.bind(th.onClick, th));
			});
        },

		onClick: function(e){
			gigya.socialize.login({
				'provider': e.currentTarget.name,
				'authFlow' : this.authFlow,
				'redirectMethod' : this.redirectMethod,
				'redirectURL' : this.redirectURL,
				'callback': this.onLogin
			});
		},

		onLogin: function(response)
        {
        }

    });

   }(sho.$)

sho.loaded_modules['/lib/js/sho/ui/login/socialsignonbox.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui/login.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.menu');



    sho.ui.menu.DropDown = Class.create({

         max_items : 20, // trigger for scrolling modal treatment -  currently not in use
         max_char_length_xwide : 20, // long labels need special classname to increase width
         max_char_length_xxwide : 30,
         longestLabel : '',

    	 initialize:function(p)
    	 {
    		if( typeof p == "undefined" ){
    			alert( 'Must define params for DropDownMenu!' ); return; }
    		this.on = false;
    		this.container = p.container;
    		this.id = p.id;
    		this.title = p.title;
    		this.labels = p.labels;
    		this.values = p.values;
    		this.onSelect = p.onSelect || p.onselect;
    		this.onSelectScope = p.onSelectScope || p.onselectScope;
    		this.keepSelectionVisible = p.keepSelectionVisible || false;
    		this.selectedIndex = p.selectedIndex !== undefined ? p.selectedIndex : -1;
    		if(this.selectedIndex > - 1) this.title = this.labels[this.selectedIndex];

    		this.menu = new Template(['',
    		'<div class="dd-menu#{classnames}" id="#{id}">',
    	    	'<div class="dd-title"><a href="#">#{title}</a></div>',
        			'<div class="dd-content-wrap-outer">',
    				'<div class="dd-content-wrap">',
    			    	'<div class="dd-content">',
        					'<ul>#{options}</ul>',
        				'</div>',
    				'</div>',
    			'</div>',
    		'</div>',
    		''].join(''));

		    this.fn = {};

		    this.checkLabelLengths();
    		this.buildOptions();
    		this.drawMenu();
    		this.setHandlers();
    	},

    	checkLabelLengths:function()
    	{
    		this.longestLabel = this.labels.slice(0).sort(function(a, b) { return b.length - a.length; })[0];
    	},

    	buildOptions:function()
    	{
    		this.options = '';

    		for( var i=0; i<this.values.length; i++){ // if i == selectedIndex and this.keepSelectionVisible apply classname 'disabled'
    			this.options += '<li><a href="#" rel="'+this.values[i]+'">'+ this.labels[i] +'</a></li>';
    		}

    	},

    	drawMenu:function()
    	{
    	    this.container = ( typeof 	this.container == 'string' ) ? $(	this.container ) : this.container;

    	    var classnames =+ this.longestLabel.length > this.max_char_length_xwide ? ' xwide' : classnames;
    	    classnames =+ this.longestLabel.length > this.max_char_length_xxwide ? ' xxwide' : classnames;

    		this.container.insert({ bottom:
    		    this.menu.evaluate({
    			    id:this.id,
    				title:this.title,
    				options:this.options,
    				classnames:classnames
    			})
    		});
    	},

    	setHandlers:function()
    	{
    		if( typeof this.id !== 'string' ){ alert( 'Must supply unique id as string!' ); return; }

    		var optclick = this.optionClick.bindAsEventListener(this);
    		$(this.id).select('li a').invoke('observe','click', optclick);

    		var ttlclick = this.titleClick.bindAsEventListener(this);
    		Event.observe(($(this.id).select('.dd-title a')[0]),'click', ttlclick);

			this.fn.collapse = this.collapse.bindAsEventListener(this);
		    ($$('body')[0]).observe('click', this.fn.collapse);
    	},

    	optionClick:function(e)
    	{
    		var a = Event.findElement(e, 'a'); Event.stop(e);
    		if( this.keepSelectionVisible) { this.showSelection(a); }
    		this.toggle();

    		var key = ($(a).readAttribute('rel'));

    		var onselect = this.onSelect.bind( this.onSelectScope );
    		onselect(key);
    	},

    	showSelection:function(a)
    	{
    		var label = $(this.id).select('div.dd-title > a')[0];
    		label.innerHTML = a.innerHTML;
    	},

    	toggle:function()
    	{
    		if( this.on ){ $(this.id).removeClassName('aktiv'); this.on = false; }
    		else { $(this.id).addClassName('aktiv'); this.on = true; }
    	},

    	titleClick:function(e)
    	{
    		this.toggle();
    		Event.stop(e);
    	},

    	collapse:function(e)
    	{
    		$$('#'+this.id).invoke('removeClassName','aktiv'); this.on = false;
    	},

    	destroy:function()
    	{
    	    $$('body')[0].stopObserving('click', this.fn.collapse);
    	}

    });


sho.loaded_modules['/lib/js/sho/ui/menu/dropdown.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.ui.menu.MultiColumn = Class.create({

        _KLASS_ : 'sho.ui.menu.MultiColumn',
        max_char_length_xwide : 20, // long labels need special classname to increase width
        max_char_length_xxwide : 30,
        longestLabel : '',

        menu : new Template(['',
		'<div class="dd-menu dd-multi-col #{classNames}" id="#{id}">',
	    	'<div class="dd-title"><a href="#">#{title}</a></div>',
			'<div class="dd-content-wrap">',
		    	'<div class="dd-content clearfix">',
					'#{content}',
				'</div>',
			'</div>',
		'</div>',
		''].join('')),

	    collapse_on_body_click : true,
	    keep_selection_visible : true,
	    default_num_columns : 6,
	    default_width : 600,
	    default_height : 120,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'id' : cfg.id || 'a-unique-dd-identifier',
                'title' : cfg.title,
                'numberOfColumns' : Number(cfg.columns || this.default_num_columns),
                'labels' : cfg.labels || [],
                'values' : cfg.values || [],
                'selectedIndex' : cfg.selectedIndex,
                'onSelect' : cfg.onSelect || Prototype.emptyFunction,
                'classNames' : cfg.classNames || cfg.klassnames || [],
                'width' : cfg.width || this.default_width,
                'height' : cfg.height || this.default_height,
                'ui' : {
                    'container' : $(cfg.container)
                }
            });

			this.checkLabelLengths();
			this.options = this.labels.zip(this.values);
            this.classNames.push('x'+this.numberOfColumns);
            this.classNames.push(this.longestLabel.length > this.max_char_length_xwide ? 'xwide' : '');
			this.classNames.push(this.longestLabel.length > this.max_char_length_xxwide ? 'xxwide' : '');
            this.build();
        },

    	checkLabelLengths:function()
    	{
    		this.longestLabel = this.labels.slice(0).sort(function(a, b) { return b.length - a.length; })[0];
    	},

        build:function()
        {
            this.ui.container.insert({
                'bottom': this.menu.evaluate({
                    'title' : this.title,
                    'id' : this.id,
                    'classNames' : this.classNames.join(' '),
                    'content' : this.getColumns(this.options)
                })
            })

            this.setHandlers();
            if(this.selectedIndex !== undefined) this.updateTitle();
        },

        getOptions:function(options)
        {
            return (['',
            '<ul>',
                options.collect(function(pair,idx){
                    return '<li><a rel="'+pair[1]+'">'+pair[0]+'</a></li>'
                }),
            '</ul>',
            '']).flatten().join('')
        },

        getColumns:function()
        {
            var optCount = Math.ceil(this.options.length / this.numberOfColumns);

            var content='', th=this; this.options.eachSlice(optCount, function(opts){
                content += '<div class="dd-column">';
                content += th.getOptions(opts)
                content += '</div>'
            })

            return content;
        },


        setHandlers:function()
        {
            this.ui.innerCnt = this.ui.container.select('.dd-menu#'+this.id)[0];
            this.ui.title = this.ui.innerCnt.select('.dd-title a')[0];
            this.ui.content = this.ui.innerCnt.select('.dd-content')[0];

            if(this.collapse_on_body_click) $$('body')[0].observe('click', this.close.bind(this))

            this.ui.innerCnt.observe('click', this.click.bindAsEventListener(this))

            if(sho.env.browser().isIE)
            {
                (this.ui.content.select('.dd-column:last-child')[0]).addClassName('last')
            }
        },

        click:function(e)
        {
            var el = e.findElement('.dd-title, .dd-content li a'); if(el)
            {
                if(!el.className.match(/dd-title/))
                {
                    if(this.keep_selection_visible) this.ui.title.update(el.innerHTML);
                    this.onSelect(el.readAttribute('rel'));

                }

                this.toggle(); e.stop();
            }

        },

        toggle:function()
    	{
    		if(this._open) this.close();
    		else this.open();
    	},

    	open:function()
    	{
		    this.ui.innerCnt.addClassName('aktiv'); this._open = true;
		},

		close:function()
    	{
		    this.ui.innerCnt.removeClassName('aktiv'); this._open = false;
		},

		updateTitle:function()
		{
		    this.ui.title.update(this.labels[this.selectedIndex]);
		}



    });

sho.loaded_modules['/lib/js/sho/ui/menu/multicolumn.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	sho.provide('sho.accounts.user');
    sho.ui.menu.AccountsMenu = Class.create({

        _KLASS_ : 'sho.ui.menu.AccountsMenu',

        ui : {},
    	fn : {},

		initialize:function(cfg)
        {
            this.ui.container = cfg.container;
            this.fn.update = this.update.bind(this);
            this.setHandlers();

			if(!sho.accounts.allowAuth()) {
				jQuery("a#login").hide();
				return;
			}

		    if(sho.accounts.isAuthenticated()) this.drawMenu();
        },

        setHandlers:function()
        {
            sho.dom.bind('user:loaded',               this.fn.update);
            sho.dom.bind('user:authenticate:success', this.fn.update);
            sho.dom.bind('user:authenticate:error',   this.fn.update);
            sho.dom.bind('user:loaded:authenticated', this.fn.update);
            sho.dom.bind('user:login:success',        this.fn.update);
            sho.dom.bind('user:logout:loading',       this.fn.update);
            sho.dom.bind('user:logout:success',       this.fn.update);


        },

        drawMenu:function()
        {
            var labels=[''+
    		        'My Settings',
    		        'Log Out'
    		    ],
    		    values=[''+
    		        '/sho/accounts/users/edit',
    		        'USER_LOGOUT'
    		    ]
		    ;

		    this.ui.container.update('');
            this.menu = new sho.ui.menu.DropDown({
        		id:'my-sho-dd',
    		    container:this.ui.container.id,
    		    title:'My Account',
    		    labels:labels,
    		    values:values,
    		    onSelect:this.onSelect,
    		    onSelectScope:this
    		});
        },

        onSelect:function(selection)
        {
            if(selection == 'USER_LOGOUT') {
                sho.analytics.getTracker({
                    'reload':true,
                    'debug':true
                }).trackEvent({
                    'eventContext' : 'global navigation',
                    'eventLabel' : 'log out',
                    'customEvent' : '39,106'
                });

                sho.accounts.logout();
            }
            else {
                sho.analytics.getTracker({
                    'reload':true,
                    'debug':true
                }).trackEvent({
                    'eventContext' : 'global navigation',
                    'eventLabel' : 'my settings',  // had to hard-code this for now, since sho.ui.menu.DropDown may not send back the value
                    'customEvent' : '39'
                });

                window.location = selection;
            }
        },

        update:function(e)
        {
            if(e.type == 'user:loaded:authenticated' || e.type == 'user:authenticate:success'){
                this.drawMenu();
            }

            if(e.type == 'user:logout:loading'){
                this.ui.container.update('<p>Goodbye!</p>').addClassName('loading');
            }

            if(e.type == 'user:logout:success'){
                this.ui.container.update('<p><a data-behavior="track-click" data-click-id="navigation:login" id="login" href="/sho/accounts/login">Log In</a></p>').removeClassName('loading');
			}
        },

        destroy:function()
        {
            this.ui.container.stopObserving('click');
            sho.dom.unbind('user:loaded',               this.fn.update);
            sho.dom.unbind('user:loaded:authenticated', this.fn.update);
            sho.dom.unbind('user:login:success',        this.fn.update);
            sho.dom.unbind('user:logout:loading',       this.fn.update);
            sho.dom.unbind('user:logout:success',       this.fn.update);
        }
    });



sho.loaded_modules['/lib/js/sho/ui/menu/accountsmenu.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.ui.menu.OrderProviders = sho.order.ProviderDropDown = klass(_.extend({

        _KLASS_ : 'sho.ui.menu.OrderProviders',

    	initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
			    'providerLabels' : [],
			    'providerValues' : [],
			    'fn' : {
			        'trackAndRedirectToAffiliate' : _.bind(this.trackAndRedirectToAffiliate, this)
			    }
			})

			if (sho.order.providerData)
			{
			    var th=this; _.each(sho.order.providerData, function(p,idx)
    			{
                    th.providerLabels.push(p.name);
                    th.providerValues.push(idx); // can't pass complex objects here, only string literals, so providerValues.push(p) won't work;
                });

		        this.menu = new sho.ui.menu.MultiColumn({
            		id:         'order-provider-dd',
            		container:  this.container,
            		title:      'Choose your TV Provider',
    				columns:    4,
            		labels:     this.providerLabels,
            		values:     this.providerValues,
    				onSelect:   this.fn.trackAndRedirectToAffiliate
            	});

    	    }
        }


    }, sho.order.AffiliateTracking));


sho.loaded_modules['/lib/js/sho/ui/menu/orderproviders.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui/menu.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.ui.modals
     * Namespace for Modal components. sho.ui.modal provides an abstraction layer around creating modals (aka dialog boxes and overlay/lightboxes).
     *
     * API goals
     * ---------
     * - Provide a consistent interface for the creation and management of absolutely-positioned, modal style containers.
     * - Support different ways to build up the modal contents, ie by passing in html content as a string, and (pointing to remote urls (iframe style)
     * - Ability to update width and height programatically.
     * - Ensure modals are always centered vertically and horizontally in browser window.
     * - Only one Modal should be allowed at any given time.
     * - Clicking on the document body or anywhere outside the modal should close the modal.
     *
     * Sub classes/types of Modal
     * --------------------------
     * There will likely be several different types of modals that are implemented. Additionally, you should be able to create custom modal types by either passing config options, or by subclassing the modal class and creating your own.
     *
    **/

    sho.provide('sho.ui.modals');


    /**
     * class sho.ui.modals.Base
     * Base modal class. Provides core functionality such as resize, auto-centering, hide/show and eventing to all Modal components
    **/

    sho.ui.modals.Base = Class.create({

        _KLASS_ : 'sho.ui.modals.Base',

        /**
         * sho.ui.modals.Base#defaults -> Object
         * these will be carried down the inheritence chain and extended with runtime configs
        **/
        defaults : {
            'width' : 600,
            'height' : 600,
            'title' : null,
            'content' : null,
            'url' : null,
            'dataSrc' : null,
            'shader' : true,
            'events' : {},
			'backUrl' : null,
			'theme' : 'default'
        },

        /**
         * sho.ui.modals.Base#modal -> Template
         * Defines the outer structure of the modal.
        **/
        modal:new Template([
        '#{shader}',
        '<div class="modal-outer #{classNames}">',
            '<div class="modal-inner">',
                '<div class="modal-tbar">',
                    '<div class="modal-title">#{title}</div>',
                    '#{pagination}',
                    '<div class="modal-closer">&nbsp;</div>',
                '</div>',
                '<div class="modal-content">',
                    '#{content}',
                '</div>',
            '</div>',
        '</div>'
        ].join("\n")),

        tbar_height : 32,
        bottom_border_height : 7,
        minimum_top : 50,
		contentSize :{
			height: undefined,
			width: undefined
		},
		init_outterHeight : undefined,
		fn:{},

        /**
         * new sho.ui.modals.Base(cfg)
         * Constructor for the modal. Semi-private function because in practice, one of the singleton-style convenience methods will be called instead.
        **/
        initialize:function(cfg)
        {
            this.overrideDefaults(cfg);
            this.build();
        },

        /**
         * sho.ui.modals.Base#overrideDefaults(cfg) -> Null
         * Copies properties from the modal defaults constant, and the runtime config, onto the modal instance.
         * This provides a powerful way to customize the modal, both at runtime, and by setting defaults on a subclass.
        **/
        overrideDefaults:function(cfg)
        {
            _.extend(this, _.extend(this.defaults, cfg));
        },

        /**
         * sho.ui.modals.Base#build() -> Null
         * Construct up the modal's DOM structure and insert into the bottom of the body.
        **/
		build:function()
        {
            var cls = [];
            cls.push(this.type);                                            // class="modal dialog..."
            if(this.classNames) cls.push(this.classNames);
            this.theme = this.theme || this.defaults.theme || 'default'     // store here for use in setBoxStyles below
            cls.push('modal-theme-'+this.theme);                            // modal-theme-metro, modal-theme-default
            var classNames = cls.join(' ');

            this.justOpened = true;
            this.ui = this.ui || {};
            $$('body')[0].insert({
                'bottom' : this.modal.evaluate({
					'title' : (!!this.backUrl ? ('<a class="modal-back-link" href="' + this.backUrl + '">back</a>') : (this.title || '')),
                    'shader' : ((this.shader !== 'false' && this.shader !== false) ? '<div class="modal-shader"></div>' : ''),
                    'pagination' : (!!this.pagination ? '<div class="modal-pagination"></div>' : ''),
                    'classNames' : classNames,
                    'content' : this.getContent()
                })
            });

            this.setHandlers();
            this.refresh();
        },

        /**
         * sho.ui.modals.Base#getContent() -> String
         * Accessor for the modal's content. Can be either a static string or a function that returns a string.
        **/
        getContent:function()
        {
            if(!this.content) return '';
            return typeof this.content == 'function' ? this.content() : this.content
        },

        /**
         * sho.ui.modals.Base#setHandlers() -> Null
         * Collects pointers to useful DOM elements in the modal and sets event listeners
        **/
        setHandlers:function()
        {
            var th = this; $w('shader outer inner tbar title pagination closer content').each(function(el){
                th.ui[el] = ($$('.modal-'+el) || [null])[0];
				if(sho.isTablet() && el == "inner"){
					$$('.modal-'+el)[0].observe('touchstart',function(ev){
						ev.cancelBubble = true;
					});
				}
            });

            _.delay(function(){ th.justOpened = false; }, sho.dom.REDRAW_DELAY_)

            if(!this.ui.shader) this.ui.shader = {'show':sho.emptyFunction,'hide':sho.emptyFunction,'remove':sho.emptyFunction}

            this.ui.closer.observe('click', function(e){
                e.stop(); th.update({
                    'eventName' : 'modal:close'
                })
            })

            if(this.ui.pagination)
            {
                this.ui.pagination.observe('click', function(e){
                    th.update({
                        'eventName' : 'modal:paginate',
                        'event' : e
                    })
                });
            }

            this.ui.content.observe('click', function(e){
                th.update({
                    'eventName' : 'modal:click',
                    'event' : e
                })
            })

            if(!sho.supportsPositionFixed())
            {
                this.fn.refresh = this.refresh.bind(this);
                window.addEventListener && window.addEventListener('scroll', this.fn.refresh, false);
            }

        },

        unsetHandlers:function()
        {
            ([this.ui.closer,this.ui.content,
                (this.ui.pagination || {'stopObserving':sho.emptyFunction })
            ]).invoke('stopObserving','click');
            sho.supportsPositionFixed() || window.removeEventListener('scroll', this.fn.refresh);
        },


        /**
         * sho.ui.modals.Base#update(e) -> Null
         * Respond to an event (for example, a click inside the modal contents, or a browser resize), and update the ui.
        **/
        update:function(e)
        {

            if(e.eventName == 'body:click' || e.eventName == 'modal:close')
            {
                if(this.justOpened) return;
                this.close();
                this.proxyEvent('close');
            }

            if(e.eventName == 'window:resize')
            {
                this.refresh();
            }

            if(e.eventName == 'modal:click' || e.eventName == 'modal:paginate' || e.eventName == 'modal:hover')
            {
                this.proxyEvent(e.eventName.gsub(/modal:/,''), e);
            }
        },

        proxyEvent:function(eventName, eventObj)
        {
            if(this.events)
            {
                if(this.events[eventName])
                {
                    if(typeof this[this.events[eventName]] == 'function')
                    {
                        this[this.events[eventName]].call(this, eventObj)
                    }
                }
            }
        },

        /**
         * sho.ui.modals.Base#refresh() -> Null
         * The main workhorse function for updating the ui. This is called in response to both modal-specific events, and global window resizes.
         *
         * it would seem there was a desire to disable the outerHeight method in event of resize and use a cached value instead,
         * but i can't imagine how this is a good idea ????
         *
         * additionally, the implementation here is deeply flawed because the inner content is styled larger than intended,
         * and hidden from view by the outer content, at least if there is a titlebar which is ALL the time!
        **/
        refresh:function()
        {

			var th=this,
                ybounds = document.viewport.getHeight(),
        		xbounds = document.viewport.getWidth(),
        		yoffset = !sho.supportsPositionFixed() ? document.viewport.getScrollOffsets()[1] : 0,
        		left = Math.floor(( xbounds - this.width) / 2),

				t =  Math.floor((ybounds - this.outerHeight()) / 2) + yoffset,

				top = sho.supportsPositionFixed() ? (t > this.minimum_top ? t : this.minimum_top) : this.minimum_top;
    		;

            this.setBoxStyles('outer', { 'left' : left, 'top' : top });
            this.setBoxStyles('inner');
            this.setBoxStyles('content');
        },



        /**
         * sho.ui.modals.Base#setContent([htmlText]) -> Null
         * Update the Modal's inner content. Override this in subclasses to hook into the modal event cycle.
         * Aliased as sho.ui.modals.Base.html().
        **/
        setContent:function(html)
        {
            this.ui.content.update(html || this.content || '');

        },

        html:function(html)
        {
            this.setContent(html);
        },

        /**
         * sho.ui.modals.Base#hide() -> Null
         * Hide the modal without removing it from the dom.
        **/
        hide:function()
        {
            this.ui.outer.hide();
            this.ui.shader.hide();
        },

        /**
         * sho.ui.modals.Base#show() -> Null
         * Make the modal visible.
        **/
        show:function()
        {
            this.ui.outer.show();
            this.ui.shader.show();
        },

        /**
         * sho.ui.modals.Base#close() -> Null
         * Hide the modal, and clear it's content, without removing it from the dom
        **/
        close:function()
        {
            this.ui.content.update('')
            this.hide();
        },

        /**
         * sho.ui.modals.Base#selfDestruct() -> Null
         * Generally called immediately after instantation, this will set a timeout to dismiss the modal after 2.7 seconds
        **/
        selfDestruct:function()
        {
             _.delay(function(){
                 sho.ui.modals.instance().close();
            }, 2700)
        },

        /**
         * sho.ui.modals.Base#destroy() -> Null
         * Unset all listeners and remove the modal from the DOM.
        **/
        destroy:function()
        {
            this.unsetHandlers();
            this.ui.outer.remove();
            this.ui.shader.remove();
        },

        /**
         * sho.ui.modals.Base#resize(Object) -> Null
         * Update the width and height of the modal container, and trigger a refresh.
        **/
        resize:function(cfg)
        {
			this.width = cfg.width;
            this.height = cfg.height;
            this.refresh();
        },

        /**
         * sho.ui.modals.Base#setTitle(String) -> Null
         * Set the text shown in the optional titlebar
        **/
        setTitle:function(t)
        {
            if(this.ui.title) this.ui.title.update(t);
        },


        setBoxStyles:function(region, extraStyles)
        {
            this.ui[region].setStyle(sho.object.toPixels(_.extend({
                'height': (this.theme == 'metro' ? (region == 'content' ? this.height : this.outerHeight()) : this.height),
                'width' : this.width
            }, (extraStyles || {}))));
        },

        outerHeight:function()
        {
            var h=this.height + this.tbar_height; // was if(!!title), but addition of back-button means we ALWAYS draw title chrome
            if(!!this.bottomBorder) h += this.bottom_border_height;
            return h
        }


    });

    sho.ui.modals.tbar_height = sho.ui.modals.Base.prototype.tbar_height;
	sho.ui.modals.contentSize = sho.ui.modals.Base.prototype.contentSize;

sho.loaded_modules['/lib/js/sho/ui/modals/base.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * class sho.ui.modals.FlashMessage < sho.ui.modals.Base
     * This modal handles our late-game decision to treat flash messages as modals, similar to Dialog
    **/
    sho.ui.modals.FlashMessage = Class.create( sho.ui.modals.Base, {

        _KLASS_ : 'sho.ui.modals.FlashMessage',

        'defaults': {
            'width' : 380,
            'height' : 70,
            'theme' : 'metro'
        },

        content:function()
        {
            return (['<p>',this.message,'</p>'].join(''))
        }

    });

sho.loaded_modules['/lib/js/sho/ui/modals/flashmessage.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($)
    {

        /**
         * class sho.ui.modals.Login < sho.ui.modals.Base
         * Recode of iframe-based login modal, uses xhr to provide a more responsive login flow w/ less resize glitches
        **/

        sho.ui.modals.Login = Class.create( sho.ui.modals.Base, {

            _KLASS_ : 'sho.ui.modals.Login',

            'defaults': {
                'title' : 'Log In',
                'width' : 667,
                'height' : 242, //275, // was 242, 251
                'theme' : 'metro'
            },
            'view' : ['',

                '<div class="left">',
                    '{{> form}}',
                '</div>',

                '<div class="right">',
                    '<h4>Quick log in with your social ID</h4>',
                    '<div class="social-signon-box" id="socialSignOnBox"></div>',
                '</div>',

                '<div class="or-divider"><em></em></div>',

            ''].join(''),

            'form' : ['',

                '<form id="loginform" action="#" method="POST">',
                '<fieldset>',
                    '<span class="errors">',
                    '</span>',
                    '<span class="input-email">',
                	    'Email',
                	    '<input type="text" ',
                	        'name="email" ',
                			'id="email" ',
                		'/>',
                	'</span>',
                    '<span class="input-password">',
                    	'Password',
                		'<input name="password" ',
                		    'id="password" ',
                			'type="password" ',
                		'/>',
                	'</span>',
                '</fieldset>',

                '<fieldset class="shim-right">',
                    '<span>',
                		'Remember Me:',
                		'<input id="remember-me" name="_spring_security_remember_me" class="checkbox remember-me" type="checkbox" />',
                    '</span>',
                	'<span class="forgot-register">Forget your password? ',
                		'<a href="/sho/accounts/reset-password/enter-email"',
                		    'data-behavior="track-click" ',
                    		'data-click-id="login:password_reset"',
                        '>',
                			'Reset Password',
                		'</a>',

                		'<br />Not a user? ',

                		'<a href="/sho/accounts/users/register" ',
                		    'data-behavior="track-click" ',
                    		'data-click-id="login:registration"',
                    	'>',
                		    'Register Now!',
                		'</a>',
                	'</span>',
                	'<div>',
                	    '<input type="submit" id="login" value="log in" />',
                	'</div>',
                	'<a class="anytime-link" href="http://www.showtimeanytime.com/?s_cid=sho_info_login#/home" data-behavior="track-click" data-click-id="login:showtime anytime">Trying to log in to Showtime Anytime?</a>',

               '</fieldset>',
               '</form>',

                ''].join(''),


            'content' : (function(){
               return Mustache.to_html(this.view, {}, {
                   'form' : this.form
               })
            }),


            setHandlers : function($super)
            {
                $super()

                _.extend(this.fn, {
                    'onSubmit' : _.bind(this.onSubmit, this),
                    'onSuccess': _.bind(this.onSuccess, this),
                    'onAuthenticationError'  : _.bind(this.onAuthenticationError, this),
                    'onValidationError' : _.bind(this.onValidationError, this)
                })

                this.ui.form = $(this.ui.content).find('form').submit(this.fn.onSubmit);
                this.ui.errors = this.ui.form.find('.errors');

                this.ui.rememberMe = this.ui.form.find('.remember-me').uniform();

                sho.dom.bind('user:authenticate:success', this.fn.onSuccess)
                sho.dom.bind('user:authenticate:error', this.fn.onAuthenticationError)
                sho.dom.bind('user:validation:error', this.fn.onValidationError)

                sho.behaviors.apply(this.ui.form)

                new sho.ui.login.SocialSignonBox({
                    'authFlow' : 'popup',
                    'redirectURL' : '/sho/accounts/link-accounts', //'/sho/accounts/link-accounts?auth_context=modal',
            		'container' : ($(this.ui.content).find('.social-signon-box').get(0)),
                })
            },

            onSubmit: function(e)
            {
                sho.dom.trap(e);

                this.data = {
                    'email' :      (this.ui.form.find('#email').val()),
                    'password' :   (this.ui.form.find('#password').val()),
                    'rememberMe' : (this.ui.rememberMe.is(':checked'))
                    }

                sho.accounts.authenticate(this.data);
                this.track('login:log_in');
            },

            onSuccess:function(e, data)
            {
                this.track('login:success');
				sho.ui.modals.close();
            },

            onAuthenticationError:function(e, error)
            {
                this.showError(error.message)
                this.track('login:authentication:error');
                this.tagEmptyFieldsWithError(true);
            },

            onValidationError:function(e, error)
            {
                this.showError(error.message)
                this.track('login:validation:error');
                this.tagEmptyFieldsWithError()
            },

            tagEmptyFieldsWithError:function(reset)
            {
                var th=this,
                    el,
                    klass
                ;
                _.each(['email','password'], function(k)
                {
                    klass = 'input-'+k;
                    el = th.ui.form.find('.'+klass).get(0);
                    el.className =  (th.data[k] !== '' || reset) ? klass : klass+' has-error';
                })
            },

            showError:function(message)
            {
                this.ui.errors.html(message).css({'display':'block'});
                this.resize({
                    width : this.defaults.width,
                    height : this.defaults.height + 25
                })
            },

            unsetHandlers:function($super)
            {
                $super();
                this.unsetUserHandlers();
            },

            unsetUserHandlers:function()
            {
                sho.dom.unbind('user:authenticate:success', this.fn.onSuccess);
                sho.dom.unbind('user:authenticate:error', this.fn.onError);
                sho.dom.unbind('user:validation:error', this.fn.onError);
                this.ui.form.off('submit')
            },

            close:function($super)
            {
                this.unsetUserHandlers();
                $super();
            },

            track:function(str)
            {
                sho.analytics.getTracker().trackClick({
                    'click':str
                })
            }



        });

    }(sho.$)

sho.loaded_modules['/lib/js/sho/ui/modals/login.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.modals.Dialog < sho.ui.modals.Base
     * Modal for displaying a a dialog-style modal w/ okay/cancel buttons that serve as links
    **/
    sho.ui.modals.Dialog = Class.create( sho.ui.modals.Base, {

        _KLASS_ : 'sho.ui.modals.Dialog',

        markup : new Template([
            '<div id="sho-ui-dialog">',
    			'<h3>#{message}</h3>',
    			'<ul>#{buttons}<ul>',
    		'</div>'
        ].join('')),

    	buttonTmp: new Template(
    		'<li><a href="#{url}" class="button">#{label}</a></li>'
    	),

    	buttonHTML: function(btn){
    		var html = btn.collect(function(b){
    			return  this.buttonTmp.evaluate( {'label': Object.keys(b)[0], 'url': Object.values(b)[0]} );
    		},this).join('');
    		return html
    	},

    	setLinkHandlers: function(){
    		var links = this.ui.dialog.select('.button');
    		var th = this;
    		if(links){
    			links.each(function(x){
    				if (x.readAttribute('href') == 'close') x.observe('click', function(e){e.stop(); th.close()})
    			})
    		}
    	},

        initialize:function(cfg)
        {
    		this.overrideDefaults(cfg);
            this.ui = {};
            var th = this, buttonHTML;
    		var dm = document.viewport.getDimensions();
    		var wt = (dm.width -cfg.width)/2;
    		var ht = (dm.height -cfg.height)/2;

            if(this.message && typeof this.message == 'string' && this.buttons && typeof this.buttons == 'object' )
            {
                buttonHTML = this.buttonHTML(cfg.buttons);
    			this.content = this.markup.evaluate({
                    'message' : this.message,
    				'buttons' : buttonHTML,
                    'width' : this.width,
                    'height' : this.height
                });

                this.build();
    			this.setBoxStyles('outer', { 'left' : wt, 'top' : ht });
                this.ui.dialog = $('sho-ui-dialog');
    			this.setLinkHandlers();
            }
            else
            {
                log('Error: must provide cfg.buttons to '+this._KLASS_);
            }

        }

    });

sho.loaded_modules['/lib/js/sho/ui/modals/dialog.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.modals.DeveloperTools < sho.ui.modals.Base
     * Utility modal, used to display build information.
    **/
    sho.ui.modals.DeveloperTools = Class.create( sho.ui.modals.Base, {

        _KLASS_ : 'sho.ui.modals.DeveloperTools',

        'defaults': {
            'title' : 'Developer Tools',
            'width' : 350,
            'height' : 225,
        },

        content:function()
        {
            return ['',
            '<dl>',
                '<dt>Javascript</dt>',
                    '<dd>',
                        '<span>',sho.version, '</span>',
                        '<span>',sho.timestamp, '</span>',
                    '</dd>',
                '<dt>CSS</dt>',
                    '<dd class="build-css">',
                        '<span id="sho-css-build-version"></span>',
                        '<span id="sho-css-build-timestamp"></span>',
                    '</dd>',
                '<dt>Platform</dt>',
                    '<dd class="build-platform">',
                        '<span>desktop</span>',
                        '<span>mobile</span>',
                    '</div>',
            '</dl>',
            ''].join('')
        },

        build:function($super)
        {
            $super();

            this.injectCssInfo();
            this.injectPlatformInfo();
        },

        injectCssInfo:function()
        {
            var supportsWatermark = !sho.env.browser().isIE;
            this.ui.content.select('.build-css span').each(function(el,idx){
                supportsWatermark && el.update(el.getStyle('content').gsub(/'|"/,''));          // #sho-css-build-version { content:'6.0.
            });
        },

        fetchJavaBuildInfo:function()
        {
            var th=this;
            new Ajax.Request('/rest/environment/information',{
                'method' : 'GET',
                'onSuccess' : (function(ajx){
                    th.injectJavaInfo(ajx.responseJSON || {'data':null})
                }),
                'onFailure' : (function(){
                    th.injectJavaInfo({'data':{'error':true}})
                })
            })
        },

        injectJavaInfo:function(json)
        {
            var version = json.data.version || 'Unknown',
                isError = json.data.error;
            (this.ui.content.select('.build-java')[0]).update(isError ? 'Error' : version);
        },

        injectPlatformInfo:function()
        {
            var platform = sho.util.Cookies.read('ak_platform') || 'desktop',
                fn = this.setPlatform.bind(this)
            ;
            (this.ui.content.select('.build-platform span')).each(function(el){
                el.setStyle(el.innerHTML == platform ? {'background':'green'}:{'background':'none'});
                el.observe('click', fn);
            })
        },

        setPlatform:function(e)
        {
            e.stop();

            var platform = e.findElement().innerHTML,
                path = window.location.pathname,
                isFixture = path.match(/^\/!/),
                target = !isFixture ?
                    path
                    :
                    path.gsub(/(html|mobile.html)$/, (platform == 'desktop' ? '' : platform+'.') + 'html')
                ;

            sho.util.Cookies.write('ak_platform', platform);
            window.location = target;
        }


    });

sho.loaded_modules['/lib/js/sho/ui/modals/developertools.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.modals.Error < sho.ui.modals.Base
     * Standard error modal for any case where we have to bubble up an exception. The modal that is displayed is 450x200 and has a red outline.
     * There are two main ways to use the Error Modal:
     *
     * Provide a 'message' property to the cfg object. It will be displayed in the modal as is.
     *
     *      sho.ui.Error({
     *          'message' : 'An error has occurred while attempting to play your video')
     *      });
     *
     * Provide a 'url' and 'net'=true properties to the cfg object and let the Error modal generate the messaging for you.
     * (Useful for ajax scenarios where the message is always the same).
     *
     *      sho.ui.Error({
     *          'net' : true,
     *          'url' : 'http://sho.com/rest/bad/json'
     *      })
     *
    **/
    sho.ui.modals.Error = Class.create( sho.ui.modals.Base, {

        _KLASS_ : 'sho.ui.modals.Error',

        'defaults': {
            'title' : 'Error',
            'classNames' : 'error',
            'width' : 450,
            'height' : 200,
            'net' : false
        },

        content:function()
        {
            return (['<p>',this.getMessage(),'</p>'].join(''))
        },

        getMessage:function()
        {
            var m;

            if(this.net)
            {
                m = 'An error has occurred while accessing ';
                m += this.url ? ['<a target="_blank" href="', this.url, '">', this.url, '</a>'].join('') : 'an unknown url'

            }
            else
            {
                m = this.message || 'Unknown Error';
            }

            return m;
        }

    });

sho.loaded_modules['/lib/js/sho/ui/modals/error.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.modals.Confirm < sho.ui.modals.Base
     * Modal for displaying a quick 'are you sure' confirmation screen, used to protect links w/ potentially destructive effects ('remove my device, unsubscribe')
     *
     *      // Provide a 'message' property to the cfg object. It will be displayed above the buttons:
     *
     *      sho.ui.Modal({
     *          'type' : 'confirm',
     *          'message' : 'Are you sure?'
     *      });
     *
     *      // For a more elaborate example, look at behaviors/confirm.js
     *
     *      el = $(a[data-behavior="confirm"]);
     *      sho.ui.Modal({
     *          'type'    : 'confirm',
     *          'title'   : title,
     *          'message' : $('.confirm-message', el).html(),
     *          'submit'  : {
     *              'label'     : submitLabel || title,
     *              'url'       : $(el).attr('href'),
     *              'method'    : 'GET', // always use GET for now
     *              'clickId'   : clickId.replace(/alert|modal/,'confirmation')
     *          }
     *      });
    **/
    sho.ui.modals.Confirm = Class.create( sho.ui.modals.Base, {

        _KLASS_ : 'sho.ui.modals.Confirm',

        'defaults': {
            'title' : 'Confirm',
            'width' : 380,
            'height' : 185,
            'message' : 'Are you sure?',
            'events' : {
                'click' : 'onClick'
            },
            'submit' : {},
            'theme' : 'metro'
        },

        content:function()
        {
            return (['',
		        '<p class="confirm-message">',
		            this.message,
		        '</p>',
		        '<p class="confirm-buttons">',
		            '<a href="#" class="button" data-selection="cancel">Cancel</a>',
    	            '<a href="#" class="button" data-selection="submit">', this.submitText(),'</a>',
    	        '</p>',
		    ''].join(''))
        },

        submitText:function()
        {
            return this.submit.label || 'Okay';
        },

        onClick:function(e)
        {
            var el = e.event.findElement('.button');
            sho.dom.trap(e.event);

            if(!!el)
            {
                var select = sho.dom.data.read(el,'selection');

                if(select == 'submit')
                {
                    this.onSubmit();
                }
                else
                {
                    this.close();
                }
            }
        },

        onSubmit:function()
        {

            var s = this.submit;
            if(s.url)
            {
                if(!s.method || s.method == 'GET' || s.method == 'get')
                {
                    if(s.closeModal)
                    {
                        this.close();
                    }

                    if(s.clickId)
                    {
                        sho.analytics.getTracker().trackClick({
                            'click' : s.clickId
                        });
                    }

                    window.location = s.url;
                }
            }
            else if(s.click)
            {
                s.click.call(window); this.close();
            }

        }



    });

sho.loaded_modules['/lib/js/sho/ui/modals/confirm.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    /**
     * class sho.ui.modals.Portal < sho.ui.modals.Base
     *
     * For complex page flows that take place in a modal, ie in accounts, we resort to using an iframe.
     * The modal in this case is purely presentational, and it makes more sense to let the form submission happen naturally than to have to serialize every request.
     *
     * To use this style, supply a url param and ommit the content option.
     *
     *      sho.ui.Portal({
     *          'title' : 'Google that for me',
     *          'width' : 800,
     *          'height' : 400,
     *          'url' : 'http://google.com'
     *      });
     *
     * When using this approach you may need to adjust the Portal from inside the loaded page. To do this, access the window.top property and get a reference to the modal with the instance() method:
     *
     *
     * 	    sho.ui.Portal({
     *    	    'title' : 'Remote Page Example',
     *    	    'width' : 400,
     *    	    'height' : 400,
     *    	    'url' : '/sho/modals/remote'
     *    	});
     *
     * 	------ in remote page <script>..</script> ---
     *
     * 	    var modal = window.top.sho.ui.modals.instance();
     * 	    modal.resize({width:600, height:600})
     *
     *
    **/
    sho.ui.modals.Portal = Class.create( sho.ui.modals.Base, {

        _KLASS_ : 'sho.ui.modals.Portal',
    	contentSize: {},

        iframe : new Template([
            '<iframe name="sho-ui-portal-iframe" id="sho-ui-portal-iframe" width="#{width}" height="#{height}" ',
                'src="#{url}" scrolling="no" frameborder="0">',
        	'</iframe>'
        ].join('')),

        initialize:function(cfg)
        {

        	this.overrideDefaults(cfg);
            this.ui = {};
    		this.theme = 'metro';  //making border consistent around all portals
            if(this.url && typeof this.url == 'string')
            {
                this.content = this.iframe.evaluate({
                    'url' : this.url,
                    'width' : this.width,
                    'height' : this.height
                });

                this.build();
                this.ui.iframe = $('sho-ui-portal-iframe');
            }
            else
            {
                log('Error: must provide cfg.url to '+this._KLASS_);
            }
        },

    	resize:function($super, cfg)
    	{
    		$super(cfg);
    		this.ui.iframe.writeAttribute({width: cfg.width, height: cfg.height }); //resizes original iframe	element
    	}

    });

sho.loaded_modules['/lib/js/sho/ui/modals/portal.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($)
    {
        sho.ui.modals.Share = Class.create( sho.ui.modals.Base, {

            _KLASS_ : 'sho.ui.modals.Share',

            'defaults': {
                'title' : 'Share',
                'width' : 575,
                'height' : 485,
                'height_with_errors' : 1000,
                'theme' : 'metro',
                'orderBanner' : false,
                'subject' : '$50 Cash Back Offer from Showtime'
            },

            'view' : ['',
                '<div class="email-share">',
                    '{{#orderBanner}}',
                        '<div class="email-share-h1">Share with your friends: <em>{{{subject}}}</em></div>',
                    '{{/orderBanner}}',

                        '<div class="email-share-h2">Share</div>',

                    '{{ >social}}',
                    '<div class="or-divider order-divider-horiz">',
                    '</div>',
                    '<div class="email-share-form">',
                        '{{ >form}}',
                    '</div>',
                '</div>',
            ''].join(''),



            'form' : [
                '<div class="email-share-h2">',
                    'Email to Friends',
                '</div>',
                '<div class="email-share-h2{{#hasErrors}} errors{{/hasErrors}}">',
                    '<em class="confirm">{{#feedback}}{{feedback}}{{/feedback}}</em>',
                '</div>',

                '<form action="#" method="post" {{#loading}}class="loading"{{/loading}}>',
                '<table>',
                	'<tr class="sender-recipient">',
                		'<td{{#errors.senderEmailAddress}} class="error"{{/errors.senderEmailAddress}}>',
                		    '<label for="senderEmailAddress">',
                		        'Your Email',
                		        '{{#errors.senderEmailAddress}} {{errors.senderEmailAddress}}{{/errors.senderEmailAddress}}',
                		        '*',
                		    '</label>',
                		    '<br />',
                		    '<b>',
                		        '<input id="senderEmailAddress" name="senderEmailAddress" type="text" value="{{senderEmailAddress}}"/>',
                		    '</b>',
                		'</td>',
                		'<td width="2%">',
                		'</td>',
                		'<td{{#errors.recipientEmailAddresses}} class="error"{{/errors.recipientEmailAddresses}}>',
                			'<label for="recipientEmailAddresses">',
                			    'Friend\'s Email(s)',
                    		    '{{#errors.recipientEmailAddresses}} {{errors.recipientEmailAddresses}}{{/errors.recipientEmailAddresses}}',
                    		    '*',
                			'</label>',
                			'<br />',
                			'<b>',
                			    '<input id="recipientEmailAddresses" name="recipientEmailAddresses" type="text" value="{{recipientEmailAddresses}}"/>',
                			'</b>',
                		'</td>',
                	'</tr>',
                	'<tr>',
                		'<td colspan="3">',
                			'<label for="subject">Subject</label><br />',
                			'<b><input id="subject" name="subject" type="text" value="{{subject}}"/></b>',
                		'</td>',
                	'</tr>',
                	'<tr>',
                		'<td colspan="3">',
                			'<label for="message">Message</label><br />',
                			'<b><textarea id="message" name="message">{{message}}</textarea></b>',
                		'</td>',
                	'</tr>',
                	'<tr>',
                	    '<td colspan="3">',
                	    'Note: * indicates a required Field',
                	    '</td>',
                    '</tr>',
                	'<tr>',
                		'<td colspan="3">',
                			'<a href="#" class="button submit">Submit</a>',
                			'{{#loading}}<u class="spinner">Loading...</u>{{/loading}}',
                		'</td>',
                	'</tr>',
                	'<input id="shareUrl" name="shareUrl" type="hidden" value="{{shareUrl}}"/>',
                '</table>',
                '</form>'
            ].join(''),


            'content' : (function(){
                return this.getTemplate(this.defaults)
            }),


            setHandlers : function($super)
            {
                $super()

                _.extend(this.fn, {
                    'onSubmit' : _.bind(this.onSubmit, this),
                    'render' :   _.bind(this.render, this),
                    'renderSocialComponents' : _.bind(sho.social.renderComponents, window, this.ui.content)
                })

                $(this.ui.content).on('click', '.submit', this.fn.onSubmit)

                this.shareable = new sho.social.models.Shareable();
                this.shareable.bind('all', this.fn.render);

                _.delay(this.fn.renderSocialComponents, sho.dom.REDRAW_DELAY_)// this.ui.content);
            },

            render:function(eventName, e, errors)
            {
                if(!eventName.match(/loading|error|success/)) return;

                var attrs = _.clone(this.shareable.attributes); attrs.orderBanner = this.orderBanner;

                if(eventName == 'loading')
                {
                    _.extend(attrs, {
                        'loading' : true,
                        'hasErrors' : false,
                        'errors' : []
                    });
                }

                if(eventName == 'error'){
                    _.extend(attrs, {
                        'loading' : false,
                        'hasErrors' : (errors || []).length > 0,
                        'errors':   this.collectErrors(errors || []),
                        'feedback': 'Please check the information below:'
                    });
                    if(e.isSystemError) attrs.feedback = e.message
                }

                if(eventName == 'success'){
                    _.extend(attrs, {
                        'loading'  : false,
                        'hasErrors': false,
                        'errors'   : [],
                        'feedback' : 'Your message has been sent successfully'
                    });
                }

                this.setContent(this.getTemplate(attrs));

                _.delay(this.fn.renderSocialComponents, sho.dom.REDRAW_DELAY_);

                this.resize({
                    'width'  :  this.width,
                    'height' :  this.defaults.height + (eventName == 'loading' ? 0 : 20)
                })
            },

            collectErrors:function(list)
            {
                var humanizeError = (function(str){
                    return str.split('This ').join('')
                });
                return (list.inject({}, function(errors, e){
                    errors[e.field] = humanizeError(e.message); return errors;
                }));
            },

            getTemplate:function(attrs)
            {
                return Mustache.to_html(this.view, (attrs || {}), {
                    'form' :     this.form,
                    'social' :   sho.social.components_view
                })
            },

            onSubmit: function(e)
            {
                sho.dom.trap(e);

                this.shareable.set(this.formAttributes(), {silent:true});
                this.shareable.send();
            },

            formAttributes:function()
            {
                var el = $(this.ui.content).find('form');

                return el.get(0).serialize(true);
            },

            unsetHandlers:function($super)
            {
                $super();
                this.unsetUserHandlers();
            },

            unsetUserHandlers:function()
            {
                $(this.ui.content).off('click', '.submit');
            },

            close:function($super)
            {
                this.unsetUserHandlers();
                $super();
            }

        });

    }(sho.$)

sho.loaded_modules['/lib/js/sho/ui/modals/share.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.schedules.views.modals');  //
    sho.provide('sho.accounts');                //
    sho.provide('sho.accounts.views');          //
    sho.provide('sho.gamify.modals');          //

    /**
     * sho.ui.modals.create(cfg) -> Klass
     * Singleton-style constructor for the Modal. If a modal exists this methods destroys and closes it before creating the new instance.
     * The simplest form is aliased as sho.ui.Modal, there are other convenience aliases that will prefill the 'type' config option, which
     * can be used to denote a specific modal subclass.
     *
     * 	    var m = sho.ui.modals.create({
     * 	        'type' : 'base',
     * 	        'title' : 'Hello World',
     * 	        'width' : 400,
     * 	        'height' : 400,
     * 	        'content' : 'I am a modal'
     * 	    });
    **/

    sho.ui.modals.create = function(cfg)
    {
        if(sho.ui.modals._instance)
        {
            sho.ui.modals._instance.destroy();
            sho.ui.modals._instance.close();
        }
        else
        {
            Event.observe(window, 'resize', sho.ui.modals.fire.curry({ 'eventName' : 'window:resize' }));

            $$('body')[0].observe('click', function(e){
                (!e.findElement('.modal-outer')) && sho.ui.modals.onBodyClick()
            });

            sho.env.isIpad() && $$('body')[0].addEventListener('touchstart', sho.ui.modals.onBodyClick, false)
        }

        var k = (cfg.type || 'base').capitalize().camelize(); // accounts-modal => AccountsModal

        var klass = sho.ui.modals[k] || sho.schedules.views.modals[k] || sho.accounts.views[k] || sho.accounts[k] || sho.gamify.modals[k]
        sho.ui.modals._instance = (!!klass ? new klass(cfg) : false);
        return sho.ui.modals._instance;
    };


    /**
     * sho.ui.modals.instance() -> Klass
     * Returns the modal instance if it exists, otherwise returns false. A quirk of this implementation is that
     * even after calling destroy on a modal intance, the object reference is still stored in sho.ui.modals._instance, and would be returned, which is generally *not* what we want.
     * The workaround is to always set sho.ui.modals._instance to false in the static destroy method that will be called.
    **/
    sho.ui.modals.instance = function()
    {
        return sho.ui.modals._instance || false;
    }

    /**
     * sho.ui.modals.close() -> Null
     * Safely close any modal that is open. Does nothing if there is no active modal.
    **/
    sho.ui.modals.close = function()
    {
        if(sho.ui.modals.instance()) sho.ui.modals.instance().close()
    }

    /**
     * sho.ui.modals.destroy() -> Null
     * Safely destroy any modal that is open. Does nothing if there is no active modal.
    **/
    sho.ui.modals.destroy = function()
    {
        if(!sho.ui.modals.instance()) return;

        sho.ui.modals._instance.destroy();      // unset handlers and remove dom elements
        sho.ui.modals._instance = false;        // ensure future calls to instance() return false
    }

    /**
     * sho.ui.modals.fire(event) -> Null
     * Fire an event that will be proxied to the modal instance
    **/
    sho.ui.modals.fire = function(e)
    {
        if(sho.ui.modals.instance()) sho.ui.modals.instance().update(e)
    }

    /**
     * sho.ui.modals.onBodyClick() -> Null
     * Called when a user clicks anywhere outside the modal contents
    **/
    sho.ui.modals.onBodyClick = function()
    {
        sho.ui.modals.fire({ 'eventName' : 'body:click' });
    }

    sho.ui.Modal = function(cfg)
    {
        return sho.ui.modals.create(cfg)
    }

    !function(){
        sho.string.toArray('dialog portal error confirm message login share').each(function(k){
            sho.ui[k.capitalize()] = function(cfg){     // sho.ui.Dialog = fn()
                cfg=cfg ||{};
                cfg.type = k;                           // cfg.type = 'dialog'
                return sho.ui.Modal(cfg);
            }
        })
    }()

    /**
     * sho.ui.Modal(cfg) -> Modal
     * Convenience alias for creating an instance of [[sho.ui.modals.Base]]
    **/

    /**
     * sho.ui.Dialog(cfg) -> Dialog
     * Convenience alias for creating an instance of [[sho.ui.modals.Dialog]]
    **/

	/**
     * sho.ui.Message(cfg) -> Message
     * Convenience alias for creating an instance of [[sho.ui.modals.Message]]
    **/

    /**
     * sho.ui.Portal(cfg) -> Portal
     * Convenience alias for creating an instance of [[sho.ui.modals.Portal]]
    **/

    /**
     * sho.ui.Error(cfg) -> ErrorModal
     * Convenience alias for creating an instance of [[sho.ui.modals.Error]]
    **/

    /**
     * sho.ui.Share(cfg) -> ErrorModal
     * Convenience alias for creating an instance of [[sho.ui.modals.Share]]
    **/

sho.loaded_modules['/lib/js/sho/ui/modals/statics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



/**
* class sho.ui.modals.Responsive
* Modal class for new responsive (desktop/mobile) implementation
* Clean slate, does not extend from sho.ui.modals.Base
**/
!function($)
{
    sho.ui.modals.Responsive = klass({

        _KLASS_ : 'sho.ui.modals.Responsive',

        /**
        * sho.ui.modals.Responsive#defaults -> Object
        * these will be carried down the inheritence chain and extended with runtime configs
        **/
        defaults : {
            options : {
                backdrop: true,
                keyboard: true,
                show: true
            }
        },

        backdrop:null,
        isShown:null,
        scrollbarWidth:0,
        supportTransitions:false,
        modal: null,
        $element: null,

        /**
        * sho.ui.modals.Responsive#modalTemplate
        * Defines the outer structure of the modal.
        **/
        modalTemplate:([
            '<div class="timber-modal fade">',
                '<div class="timber-modal-dialog">',
                    '<div class="timber-modal-content clearfix {{classNames}}">',
                        '<div class="timber-modal-header">',
                            '<div class="timber-modal-close" data-dismiss="modal"></div>',
                            '<h3 class="h3 timber-modal-title">{{{title}}}</h3>',
                        '</div>',
                    '<div class="timber-modal-body">',
                        '{{content}}',
                    '</div>',
                '</div>',
            '</div>'
        ].join("\n")),

        /**
        * new sho.ui.modals.Responsive(cfg)
        **/
        initialize:function(cfg)
        {
            _.extend(this, this.defaults, cfg);

            this.$relatedTarget = $(this.relatedTarget);
            this.$body = sho.dom.body();

            this.supportTransitions = this.transitionEnd();

            this.build();
        },

        build:function()
        {
            this.modal = Mustache.to_html(this.modalTemplate, this);
            this.$body[0].insert(this.modal);
            this.$element = $(this.modal);
            this.toggle();
        },

        toggle:function()
        {
            return this.isShown ? this.hide() : this.show(this.modal)
        },

        show:function()
        {
            var th = this;

            if (this.isShown) return;

            this.isShown = true;
            this.checkScrollbar();
            this.$body.addClass('timber-modal-open');
            this.setScrollbar();

            this.$element.on('click.dismiss.timber.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

            this.backdrop(function () {

                if (!th.$element.parent().length) {
                    th.$element.appendTo(th.$body) // don't move modals dom position
                }

                th.$element.show().scrollTop(0);
                th.$element.addClass('in');
                th.enforceFocus();

                $(document.body).trigger('shown:timber:modal');
            })
        },

        hide:function (e) {

            if (e) e.preventDefault();

            e = $.Event('hide.timber.modal');
            this.$element.trigger(e);

            if (!this.isShown || e.isDefaultPrevented()) return;

                this.isShown = false;
                this.$body.removeClass('timber-modal-open');
                this.resetScrollbar();

            $(document).off('focusin.timber.modal')

            this.$element
            .removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.timber.modal');

            this.hideModal();
        },

        updateContent:function(content)
        {
            this.container.removeClass("loading").html(content);
        },

        enforceFocus:function ()
        {
            $(document)
            .off('focusin.timber.modal') // guard against infinite focus loop
            .on('focusin.timber.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger('focus');
                }
            }, this));
        },

        hideModal:function ()
        {
            var th = this;
            this.$element.remove();
            this.backdrop(function () {
                th.$element.trigger('hidden.timber.modal');
            })
        },

        removeBackdrop:function ()
        {
            this.$backdrop && this.$backdrop.remove();
            this.$backdrop = null;
        },

        backdrop:function (callback)
        {
            var th = this;
            var animate = this.$element.hasClass('fade') ? 'fade' : '';

            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate; // doesn't exist yet

                this.$backdrop = $('<div class="timber-modal-backdrop ' + animate + '" />').appendTo(this.$body);

                this.$element.on('click.dismiss.timber.modal', $.proxy(function (e) {
                    if (e.target !== e.currentTarget) return
                        this.options.backdrop == 'static'
                        ? this.$element[0].focus.call(this.$element[0])
                        : this.hide.call(this)
                }, this));

                if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow

                this.$backdrop.addClass('in');

                if (!callback) return;

                doAnimate ?
                this.$backdrop
                .one('transitionEnd', callback)
                .emulateTransitionEnd(150) :
                callback();

            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass('in');

                var callbackRemove = function () {
                    th.removeBackdrop()
                    callback && callback()
                }
                $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                .one('transitionEnd', callbackRemove)
                .emulateTransitionEnd(150) :
                callbackRemove();

            } else if (callback) {
                callback();
            }
        },

        checkScrollbar:function ()
        {
            if (document.body.clientWidth >= window.innerWidth) return;
            this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar();
        },

        setScrollbar:function ()
        {
            var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
            if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
        },

        resetScrollbar:function ()
        {
            this.$body.css('padding-right', '');
        },

        measureScrollbar:function ()
        {
            var scrollDiv = document.createElement('div');
            scrollDiv.className = 'timber-modal-scrollbar-measure';
            this.$body.append(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            this.$body[0].removeChild(scrollDiv);
            return scrollbarWidth;
        },

        transitionEnd:function ()
        {
            var el = document.createElement('transition');

            var transEndEventNames = {
              WebkitTransition : 'webkitTransitionEnd',
              MozTransition    : 'transitionend',
              OTransition      : 'oTransitionEnd otransitionend',
              transition       : 'transitionend'
            };

            for (var name in transEndEventNames) {
              if (el.style[name] !== undefined) {
                return { end: transEndEventNames[name] };
              }
            }

            return false; // explicit for ie8
          }

    });
}(sho.$)



sho.loaded_modules['/lib/js/sho/ui/modals/responsive.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


!function($)
{
    sho.ui.modals.ProviderSelect = sho.ui.modals.Responsive.extend({

        _KLASS_ : 'sho.ui.modals.ProviderSelect',
        providerMap : {},
        providers : [],
        providersListService : '/rest/order/provider/data',
        providersList : '',
        container : null,
        clickToCall : false,

        contentTemplate:([
                '<h5 class="h5 provider-select__call">Don\'t see your provider? <br class="visible-xs"/><span class="provider-select__call__cta">',
                '{{#clickToCall}}<a target="_blank" href="tel:+18664657469" ',
                'data-behavior="track-click-to-call" data-event-id="101" ',
                'data-event-context="order:view all providers:top" data-event-label="call 1866465SHOW">',
                '{{/clickToCall}}',
                'Call 1-866-465-SHOW',
                '{{#clickToCall}}</a>{{/clickToCall}}',
                '</span></h5>',
                '<ul class="provider-select__list">',
                '{{{list}}}',
                '</ul>',
                '<h5 class="h5 provider-select__call pull-left">Don\'t see your provider? <br class="visible-xs"/><span class="provider-select__call__cta">',
                '{{#clickToCall}}<a target="_blank" href="tel:+18664657469" ',
                'data-behavior="track-click-to-call" ',
                'data-event-context="order:view all providers:bottom" data-event-label="call 1866465SHOW">',
                '{{/clickToCall}}',
                'Call 1-866-465-SHOW',
                '{{#clickToCall}}</a>{{/clickToCall}}',
                '</span></h5>',
                '<button type="button" data-dismiss="modal" class="btn btn-flat btn-sm btn-primary">Close Window</button>',
        ].join("")),

        build:function()
        {
            this.trackEvent();

            this.clickToCall = sho.isMobile(); // only draw tel: link in mobile context
            this.modal = Mustache.to_html(this.modalTemplate, this);
            this.$element = $(this.modal);
            this.container = this.$element.find(".timber-modal-body").addClass("loading");

            $(document).on('shown:timber:modal', $.proxy(function () {
                this.checkProviderCache();
            }, this));

            this.toggle();
            this.trackPage();
        },

        trackEvent:function()
        {
            if(!this.relatedTarget) return;

            var context = sho.dom.data.read(this.relatedTarget, 'eventContext'),
            label = sho.dom.data.read(this.relatedTarget, 'eventLabel');

            if (label == null | label == '') return;

            sho.analytics.getTracker({
                'reload':true,
                'debug':true
            }).trackEvent({
                'eventContext' : sho.dom.data.read(this.relatedTarget, 'eventContext'),
                'eventLabel' : sho.dom.data.read(this.relatedTarget, 'eventLabel'),
            });
        },

        trackPage:function()
        {
            sho.analytics.getTracker({
                'reload':true,
                'debug':true
            }).trackPageView({
            	    page : 'order:view all providers'
            })
        },

        checkProviderCache:function()
        {
            if($.isEmptyObject(sho.ui.providerMap)) {
                this.getProviders();
            }
            else { // providers already cached
                this.providerMap = sho.ui.providerMap;
                this.parseProviders();
            }
        },

        getProviders:function()
        {
            var th = this;
            $.ajax({
              type: 'GET',
              url: this.providersListService,
              dataType: 'json',
                success: function(response){
                  th.providerMap = response.data.categoryMap[th.categoryID].providerAlphaMap;
                  sho.ui.providerMap = th.providerMap;
                  th.parseProviders();
              },
              error: function(xhr, type){
                th.container.removeClass("loading").html('<h5 class="h5">Sorry, there was an error loading the provider list.</h5>');
              }
            })
        },

        parseProviders:function()
        {
            var th = this;
            $.each(th.providerMap, function(key,value) {
                if (value.length < 1) return; // remove letters with no associated providers

                th.providersList += '<li class="provider-select__list__divider">' + key + '</li>';

                $.each(value, function(index, provider) {
                    th.providersList += ([
                        '<li><a data-behavior="track-provider" ',
                        ' href="',
                        provider.externalUrl,
                        '" data-provider-id="',
                        provider.providerId,
                        '" data-event-context="order:view all providers" data-event-label="provider select">',
                        provider.providerName,
                        '</a></li>'
                    ].join(""))
                });
            });

            Mustache.parse(th.contentTemplate);  // optional, speeds up future uses
            this.updateContent(Mustache.render(th.contentTemplate, {list: th.providersList, clickToCall: th.clickToCall}));

            sho.behaviors.apply(this.$element); // set handlers for data-behaviors in modal

            setTimeout( function(){ // due to unscrollable modal after second open, strange isn't it?
                  th.$element.css('overflow-y', 'scroll');
            },500);
        }
    });
}(sho.$);

sho.ui.providerMap = sho.ui.modals.ProviderSelect.prototype.providerMap;


sho.loaded_modules['/lib/js/sho/ui/modals/providerselect.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.oldShare = (function(){
        sho.ui.Portal({
			'title' : "Order Showtime : Share",
			'width' : 575,
			'height' : 485,
			'url' : "/sho/share/order/form?url=http://www.sho.com/sho/order/home"
		});
    })

sho.loaded_modules['/lib/js/sho/ui/modals.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.provide('sho.ui.iframecheck');


	sho.provide('sho.ui.iframetool');

	sho.ui.iframetool = function()
	{
		var iFrame, curr_dimensions, w, modal, resizedDimensions, validateInputs, innerCnt;
		function parentLog(msg){ // for testing only: used to call the log in the parent window
			window.top.sho.core.Logger.log(msg);
		}

		function getFrameContent()
		{
			w = this;
			if(w.top !== w.self)
			{
				iFrame = $$('body')[0];
				if(w.top && w.top.sho && w.top.sho.ui && w.top.sho.ui.modals && w.top.sho.ui.modals.instance()){
					 modal = w.top.sho.ui.modals.instance();
				} else {return}

				if(iFrame)
				{
					if(! iFrame.descendants().any(function(i_form){
						return i_form.nodeName.toLowerCase() == 'form'
						})
					) return;

					modal.ui.iframeContent = iFrame.descendants().detect(function(ds){
						return  ds.hasClassName('container') || ds.descendants().detect(function(child){
							return child.nodeName.toLowerCase() == 'form';
						});
					});
					innerCnt = modal.ui.iframeContent; // shortcut for modal.ui.iframeContent
					curr_dimensions = innerCnt.getDimensions();
					addFormHandlers(); // add submit event handler for forms with front end validation
					checkDimensionChange();
				}
			}
		}

		function checkDimensionChange(){
			if(modal.contentSize.height == undefined){
				if(innerCnt.descendants().any(function(sp){
					return sp.className.indexOf('error') != -1
				})) {
					modal.resize(curr_dimensions);
				}
			}
			if(curr_dimensions.height != innerCnt.getDimensions()['height']) {
				modal.contentSize = curr_dimensions;
				modal.resize(curr_dimensions);
			}
		}

		function addFormHandlers(){
			forms = iFrame.select('form').length ? iFrame.select('form') : null;
			if(forms != null) {
				forms.each(function(x){
					validateInputs = x.getInputs().any(function(n){ return n.hasClassName('required')});
					if(validateInputs) x.observe('submit', function(){
						getResizedDim()
					});
				});
			}
		}

		function getResizedDim(){
			resizedDimensions = modal.ui.iframeContent.getDimensions();
			if(resizedDimensions.height != curr_dimensions.height) modal.resize(resizedDimensions);
		}

		function ie_ResizePatch(){
			if(resizedDimensions.height != innerCnt.getDimensions()['height']) {
				modal.resize({width: curr_dimensions['width'], height: innerCnt.getDimensions()['height']});
			}
		}


		return {
			getFrameContent: getFrameContent,
			getResizedDim: 	 getResizedDim
		}

	}()




sho.loaded_modules['/lib/js/sho/ui/iframecheck/iframetool.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/iframecheck.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.nav');

    sho.ui.nav.DockedNav = Class.create({

        _KLASS_ : 'sho.ui.nav.DockedNav',


        kind : '', // 'primary' || 'series'
        status : 'init', // closed, open,
        activeItem : null,

        offsetTop : 0,
        height : {
            'open' : 0,
            'closed' : 0
        },

        klass_names : {
            'item' : 'nav-item',
            'body' : 'nav-content',
            'column' : 'nav-col',
            'callout' : 'callout',
            'promo' : 'nav-promo',
            'no-drawer' : 'no-drawer'
        },

        body_padding : {
            top : 15,
            bottom : 15
        },

        tween_len : 0.5,

        initialize : function(cfg)
        {
            _.extend(this, {
                'items' : [],
                'subscribers' : [],
                'kind' : cfg.kind || '',
                'ui' : { container : cfg.container },
                'height' : { closed : Number(cfg.container.getStyle('height').gsub(/px/,'')), open : 0 }
            });

            this.calculateOffsetTop();
            this.collectItems();
            this.collectContent();
        },

        collectItems:function()
        {
            var th=this;
            this.ui.container.select('.nav-item')
                .reject(function(el){ return el.hasClassName('no-drawer')})
            .each(function(el,idx){
                el.observe('click', th.click.bindAsEventListener(th,idx));
                th.items.push({ li : el })
            });
        },

        collectContent:function()
        {
            var th=this; this.items.each(function(i){

                i.body = th.ui.container.select('#' + th.klass_names.body+'-'+i.li.id)[0];
                i.body._height = i.body.getHeight();

                var normalized = '.'+th.klass_names.callout +' > ul, .' + th.klass_names.promo;
                i.body.select(normalized).invoke('setStyle', {
                    height : (i.body._height - th.body_padding.top - th.body_padding.bottom) + 'px'
                })

            });
        },

        click:function(e,idx)
        {
            e.stop();

            if(this.activeItem !== this.items[idx])
            {
                 this.activeItem = this.items[idx];
                 this.setActiveItem();
            }
            else
            {
                this.toggle();
            }
        },

        setActiveItem:function()
        {
            var th=this;
            this.items.each(function(i){
                if(i == th.activeItem) th.focus(i);
                else th.blur(i);
            });
        },

        unsetActiveItem:function()
        {
            this.activeItem = null; this.setActiveItem();
        },

        toggle:function()
        {
            if(this.status == 'open') this.close();
            else this.open();
        },

        blur:function(i)
        {
            [i.li,i.body].invoke('removeClassName','aktiv');
            i.body.setStyle({display:'none'});
        },

        focus:function(i)
        {
            i.body.setStyle({display:'block'});
            [i.li,i.body].invoke('addClassName','aktiv');
            this.open();
        },


        open:function()
        {
            this.height.open = this.height.closed + this.activeItem.body._height;
            this.tween({
                height : this.height.open
            });
            this.status = 'open';
            if(this.notify) this.notify();
        },

        close:function()
        {
            this.tween({
                height : this.height.closed
            });
            this.unsetActiveItem.bind(this).delay(this.tween_len);
            this.status = 'closed';
            if(this.notify) this.notify();
        },

        slideTo:function(top)
        {
            this.tween({ top : top });
        },

        tween:function(t)
        {
            this.ui.container.morph(sho.object.toCssString(t), {
                transition : 'easeInOutExpo',
                duration : this.tween_len,
                position : 'parallel'
            });
        },

        onTweenEnd:function(s)
        {
            this.status = s; // restore status to pre-tween state
        },

        onNotify:function(s)
        {
            s.update({
                eventName : this.kind+'_nav:'+this.status.gsub(/closed/,'close'),
                top : this.getOffsetTop(),
                height : this.height
            })
        },

        getOffsetTop:function()
        {
            if(sho.isIOS4OrLess || !this.offsetTop) this.calculateOffsetTop();
            return this.offsetTop;
        },

        calculateOffsetTop:function()
        {
            this.offsetTop = Number(this.ui.container.getStyle('top').gsub(/px/,''));
        }

    },sho.core.Observable);


sho.loaded_modules['/lib/js/sho/ui/nav/dockednav.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

        sho.ui.nav.Navigator = Class.create({

            _KLASS_ : 'sho.ui.nav.Navigator',


            initialize : function(cfg)
            {
                this.nav = {}; this.fn = {};
                this.fn.initDockedNav = this.initDockedNav.bind(this);
                cfg.container.select('.nav').each(this.fn.initDockedNav)
                this.setHandlers();
            },

            initDockedNav:function(el)
            {
                var matches = el.className.match(/nav-(primary|secondary)/), kind = matches && matches[1] ? matches[1] : null;
                kind && (this.nav[kind] = new sho.ui.nav.DockedNav({
                    'container':el,
                    'kind': kind
                }));
            },

            setHandlers:function()
            {
                if(this.nav.primary) ($$('body')[0]).observe('click', this.click.bind(this))
                this.nav.primary && this.nav.primary.addSubscriber(this);
                this.nav.secondary && this.nav.secondary.addSubscriber(this);
            },

            click:function(e)
            {
                var el = e.findElement(); if(!el.up('div.nav-primary,div.nav-secondary')){
                    this.update({ 'eventName' : 'stage:click' });
                }
            },

            update:function(e)
            {

                if(e.eventName == 'primary_nav:open')
                {
                    if(!this.nav.secondary) return
                    this.nav.secondary.close();
                    this.nav.secondary.slideTo(e.top + e.height.open);
                }

                if(e.eventName == 'primary_nav:close')
                {
                    if(!this.nav.secondary) return
                    this.nav.secondary.slideTo(e.top+e.height.closed);
                }

                if(e.eventName == 'secondary_nav:open')
                {
                    if(this.nav.primary) this.nav.primary.close();
                    if(this.nav.secondary) this.nav.secondary.slideTo(e.top);
                }

                if(e.eventName == 'stage:click' )
                {
                    if(this.nav.primary) this.nav.primary.close();
                    if(this.nav.secondary) this.nav.secondary.close();
                }

            },

            hasPrimaryNav:function()
            {
                return !! this.nav.primary;
            },

            hasSeriesNav:function()
            {
                return !! this.nav.secondary;
            },

            getComponent:function(key)
            {
                return this.nav[key];
            }

        });

        sho.ui.nav.Navigator.prototype.hasSecondaryNav = sho.ui.nav.Navigator.prototype.hasSeriesNav;

sho.loaded_modules['/lib/js/sho/ui/nav/navigator.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/nav.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    !function($){

    sho.ui.SearchBox = klass({

        _KLASS_ : 'sho.ui.SearchBox',

        initialize:function(cfg)
        {
            $(cfg.container).on('submit', _.bind(this.onSubmit, this));
        },

        onSubmit:function(e)
        {
            var t = sho.analytics.getTracker();
            t.trackClick({
            	click : 'navigation:search'
            });

            sho.dom.trigger('searchbox:submitted');
        }
    });

   }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/searchbox.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.ui.Paginator = Class.create({

        _KLASS_ : 'sho.ui.Paginator',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'records' : cfg.records || [],
                'currentPage' : Number(cfg.currentPage) || 1,
                'itemsPerPage' : cfg.itemsPerPage || 10,
                'ui' : {
                    'container' : cfg.container
                }
            })

            if(this.ui.container) this.render();

        },


        getCurrentPage:function()
        {
            return this.currentPage || 1;
        },

        getNumPages:function()
        {
            return Math.ceil(this.records.length / this.itemsPerPage)
        },

        setCurrentPage:function(p)
        {
            this.currentPage = p;
            this.render();
        },

        getNextPage:function()
        {
            var p = (this.getCurrentPage()+1); return p > this.getNumPages() ? 1 : p;
        },

        getPreviousPage:function()
        {
            var p = (this.getCurrentPage()-1); return p == 0 ? this.getNumPages() : p;
        },

        render:function()
        {
            if(!this.ui.container || !this.records.any() || this.getNumPages() == 1) return

            var current = this.getCurrentPage();

            this.ui.container.update([
                '<span class="prev">Previous</span>',
                ($R(1,this.getNumPages())).collect(function(p){
                    return '<span class="page' + (p==current ? ' aktiv' : '') +'">'+(p)+'</span>'
                }),
                '<span class="next">Next</span>'
            ].flatten().join(''));
        },

        paginate:function()
        {
            var c = this.getCurrentPage(),
                rangeIn = (c-1) * this.itemsPerPage,
                rangeOut = c * this.itemsPerPage;
            ;
            return (this.records.slice(rangeIn, rangeOut))
        }

    });



sho.loaded_modules['/lib/js/sho/ui/paginator.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.provide('sho.ui.schedules');


    /**
     * sho.ui.schedules
     * namespace for schedule-specific components in sho.ui
    **/

    /**
     * sho.ui.schedules.ontonight
     * an admittedly verbose namespace for the ontonight ticker
    **/

    /**
     * class sho.ui.schedules.ontonight.Ticker
     * Global component. Displays tonight's primte-time airings in a docked container in the footer.
     *
     * The markup for this component is basically a linearized definition list, with overflow set to hidden to mask the trailing items from view.
     * In the event of a server error, the definition list is not returned, only an error message.
     *
     *       <div class="docked on-tonight">
     *      	<div class="on-tonight-inner">
     *      		<b class="on-tonight-title">Tonight on Showtime<\/b>
     *      		<dl>
     *      			<dt>9:00 <em>et/pt<\/em><\/dt>
     *      			<dd><a href="#">Nurse Jackie<\/a><\/dd>
     *      			<dt>9:30 <em>et/pt<\/em><\/dt>
     *      			<dd><a href="#">United States of Tara<\/a><\/dd>
     *      			<dt>10:00 <em>et/pt<\/em><\/dt>
     *      			<dd><a href="#">Nurse Jackie<\/a><\/dd>
     *      			<dt>10:30 <em>et/pt<\/em><\/dt>
     *      			<dd><a href="#">United States of Tara<\/a><\/dd>
     *      		<\/dl>
     *      	<\/div>
     *      <\/div>
     *
     *      or:
     *
     *      <div class="docked on-tonight">
     *      	<div class="on-tonight-inner">
     *              <p class="schedule-error">Sorry!<\/p>
     *           <\/div>
     *      <\/div>
     *
     * The javascript layer is responsible for panning the schedule content in and out of view, which on the desktop, is done by observing
     * mouse movement inside the container. On the ipad, it is more of an actual *ticker*, automatically flicking through the items on an
     * interval rather than responding to user input.
     *
     * The component works different on the search page, which is vendor-hosted and has only static markup.
     * On search.sho.com, the schedule data is loaded via ajax and the markup is rendered by the component itself. This behavior is triggered
     * by the presence of 'dataSrc'='remote' in the config.
    **/

	sho.provide('sho.ui.schedules.ontonight');
    sho.ui.schedules.ontonight.Ticker = Class.create({

        _KLASS_ : 'sho.ui.schedules.ontonight.Ticker',

        ui:{},
        bounds:null,
        fn:{},
        url : '/sho/json/schedules/on-tonight',
        dataSrc : 'local',
        simulate_latency : true,
        title : 'Tonight on Showtime',

        programEntry : new Template(['',
            '<dt>#{when} <em class="etpt">ET/PT</em></dt>',
    	    '<dd><a href=":#{url}">#{title}</a></dd>',
        ''].join('')),

        initialize:function(cfg)
        {
            var innerCntr = ($$('.on-tonight-inner')[0]);

	        if($('search-page')) this.dataSrc = 'remote';

            if(innerCntr && innerCntr.select('dl').any())
            {
                _.extend(this, {
                   'url' : cfg.url || this.url,
                   'title' : cfg.title || this.title,
				   'elWidths' : [],
				   'tick_index' : 1,
                   'ui' : {
                       'container' : cfg.container,
                       'innerCnt' :  innerCntr,
                       'title' :     innerCntr.select('b')[0],
                       'content' :   innerCntr.select('dl')[0]
                   }
                });


				fn = this.setWidth.bind(this); fn.delay(sho.dom.REDRAW_DELAY * 2);
            }
        },


        setWidth : function()
        {
			var th = this,
            width = this.ui.content.select('dt,dd a').inject(0, function(w, el){
				if(el.tagName == 'DT') th.elWidths.push(w);
                return w + el.getWidth();
            });
            this.elWidths.push(width);
			this.ui.content.setStyle({'width' : (width+20)+'px'});
            this.setBounds(width);
        },



        setBounds : function(w)
        {
            var i = this.ui.innerCnt.getLayout();
            this.bounds = {
                left :  i.get('margin-left'),
                right : i.get('margin-right'),
                contentWidth : w
            };
            this.setHandlers();
        },

        setHandlers:function()
        {
            if(sho.isTablet()) this.setupAutoPlay()
            else this.setupGlider();
        },

        setupAutoPlay:function()
        {
            this.fn.tick = this.tick.bind(this);
            this.tick_itvl = setInterval(this.fn.tick, 8000)
        },

        tick:function()
        {
            this.slide(0 - this.elWidths[this.tick_index]);
            this.tick_index++;
            if(this.tick_index == this.elWidths.length)
            {

                clearInterval(this.tick_itvl);

                (function(th,l)
                {
                    th.ui.content.setStyle({'left':l+'px'})
                    th.tick_index = 0;
                    th.setupAutoPlay();

                }).delay(1, this, this.ui.innerCnt.getWidth());
            }

        },

        setupGlider:function()
        {
            var th=this;

            this.fn.mouseMove = this.ui.innerCnt.on('mousemove', this.onMouseMove.bind(this).throttle(0.125));

            this.ui.innerCnt.on('mouseenter', function(e){
                th.fn.mouseMove.start()
            });
            this.ui.innerCnt.on('mouseleave', function(e){
                th.fn.mouseMove.stop()
            });
        },

        onMouseMove:function(e)
        {
			var x = e.pointerX() - this.bounds.left,
                visibleWidth = this.ui.innerCnt.getWidth(),
                contentWidth = this.ui.content.getWidth(),
                offset = contentWidth - visibleWidth,
                pos = Math.floor((x/visibleWidth) * 100)
            ;

            if(x > 0 && offset > 0)
            {
                if(pos > 0 && pos < 26)
                {
                    this.update({ 'eventName' : 'ticker:shift_left', 'offset' : offset });
                }
                if(pos > 75 && pos < 101)
                {
                    this.update({ 'eventName' : 'ticker:shift_right', 'offset' : offset });
                }
            }
        },

        update:function(e)
        {
			if(e.eventName == 'ticker:shift_left')      this.slide(0);
            if(e.eventName == 'ticker:shift_right')     this.slide(0 - Math.abs(e.offset));
        },

        slide:function(l)
        {
            this.ui.content.morph('left:'+l+'px', {'duration' : 0.75 });
        }

    });













sho.loaded_modules['/lib/js/sho/ui/schedules/ontonight/ticker.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui/schedules.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.popups');


	sho.ui.popups.modal_config = sho.ui.popups.modal_config || {};

	sho.ui.popups.Manager = Class.create({

		_KLASS_ : 'sho.ui.popups.Manager',

		cookie_key : 'sho_global_popup',

		modal_config : {
		    'type' : 'portal',
		    'width' : 600,
		    'height': 400,
		    'url' : '/sho/notices/1-modal'
		},

		initialize:function()
        {
            var fn =        sho.ui.popups.modal_config['beforeOpenPopUp'] || (function(){return true});
            var proceed =   fn() && !this.getPopUpCookie();

            proceed && this.openPopUp()
        },

        openPopUp:function()
        {
            if(!sho.ui.popups.enabled) return;

            var cfg = _.extend({}, this.modal_config, (sho.ui.popups.modal_config || {}));

            sho.ui.Modal(cfg);

            this.setPopUpCookie();
        },

        getPopUpCookie:function(){
            return !!sho.util.Cookies.read(this.cookie_key);
        },

        setPopUpCookie:function(){
            sho.util.Cookies.write(this.cookie_key,true); // only valid for length of session
        },


	});

	sho.ui.popups.clearCookie=function(){
	    sho.util.Cookies.clear(sho.ui.popups.Manager.prototype.cookie_key);
	}
sho.loaded_modules['/lib/js/sho/ui/popups/manager.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/popups.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.messages');

    sho.ui.messages.Flash = klass({

	    _KLASS_ : 'sho.ui.messages.Flash',

        initialize:function(cfg)
        {
            var c =     sho.$(cfg.container).remove(),
            t =         sho.dom.data.read(c, 'message-type'),       // 'error','success','info'
            type =      t == 'error' ? 'error' : 'flash-message',   // set modal type to flash-message, unless it's an error
            message=    sho.dom.data.read(c, 'message-text')
            tracking=   sho.dom.data.read(c, 'message-tracking')
            ;

            sho.ui.Modal({
                'type' : type,
                'message' : message,
            })
        },

	});



sho.loaded_modules['/lib/js/sho/ui/messages/flash.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/messages.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


	sho.ui.Loader = klass({

		initialize:function()
        {
            this.items = {};
            this.deferred = [];

            this.initComponents()

            this.initDeferred();

            this.popupManager = new sho.ui.popups.Manager();

            this.notificationManager = new sho.ui.notifications.Manager();

            if(!sho.supportsPositionFixed()) this.patchAbsPositionedElements.bind(this).delay(sho.dom.REDRAW_DELAY, $$('.docked'));

            sho.accounts.getUser();

        },

        initComponents:function()
        {
            var th=this, elements = sho.$('[data-component]')
            ;
            _.each(elements, function(el)
            {
                var cmp =   sho.dom.data.read(el, 'component'),
                    klaus = eval(cmp),
                    key =   cmp.split('.').join('-').toLowerCase(),
                    defer = sho.dom.data.read(el, 'defer')
                ;

                if(klaus && typeof klaus == 'function')
                {
                    if(defer)
                    {
                        th.deferred.push({
                            'el' : el,
                            'klass' : klaus,
                            'key' : key,
                            'eventName' : defer
                        })
                    }
                    else
                    {
                        th.registerComponent(key, new klaus({
                            'container' : el
                        }));
                    }
                }
            })
        },

        initDeferred:function()
        {
            var th=this;

            _.each(this.deferred, function(cfg)
            {
                sho.dom.bind(cfg.eventName, function()
                {
                    th.registerComponent(cfg.key, new cfg.klass({
                        'container' : cfg.el
                    }))
                })
            })
        },

		patchAbsPositionedElements:function(els)
		{
		    if(!els.length) return;
		    sho.ui.tablet.ScotchTape.stick(els.reject(function(el){
		        return el.className.match(/carousel-filmstrip/) // this was given a className of 'docked' early on, but we don't want it treated in the same way
		    }));
		},

		registerComponent:function(key, object)
        {
            this.items[key] = this.items[key] || [];
            this.items[key].push(object);
        },

        getComponent:function(key)
        {
            var set = this.items[key] || [false];
            return set.length == 1 ? set[0] : set
        }
	});


	sho.ui.getComponent = function(key){
	    return sho.ui.Loader.getInstance().getComponent(key)
	}

	sho.ui.getComponentFromClass = function(klass){

        var k,key,component;

	    if( _.isFunction(klass))
	    {
	        if(!!klass.prototype && !!klass.prototype._KLASS_)
	        {
	            k = klass.prototype._KLASS_;
	        }
	        else
	        {
	            return false
	        }
	    }
	    else
	    {
	        k = klass;
	    }
	    if(!k) return false

	    key = k.toLowerCase().replace(/\./g,'-');
	    component = sho.ui.getComponent(key);
	    return component;
	}

	sho.ui.Loader.getInstance = function()
	{
	    if(!sho.ui._loader_instance_) sho.ui._loader_instance_ = new sho.ui.Loader();
		return sho.ui._loader_instance_;
	}

	sho.dom.ready(sho.ui.Loader.getInstance);


sho.loaded_modules['/lib/js/sho/ui/loader.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.ui.placeholder = function()
{
	function initialize()
    {
		$j('.nav-search [placeholder]').focus(function() {
		  var input = $j(this);
		  if (input.val() == input.attr('placeholder')) {
		    input.val('');
		    input.removeClass('placeholder');
		  }
		}).blur(function() {
		  var input = $j(this);
		  if (input.val() == '' || input.val() == input.attr('placeholder')) {
		    input.addClass('placeholder');
		    input.val(input.attr('placeholder'));
		  }
		}).blur().parents('form').submit(function() {
		  $j(this).find('[placeholder]').each(function() {
		    var input = $j(this);
		    if (input.val() == input.attr('placeholder')) {
		      input.val('');
		    }
		  })
		});
   	}

    return {
        init:initialize
    }

}()

document.observe('dom:loaded', sho.ui.placeholder.init );
sho.loaded_modules['/lib/js/sho/ui/placeholder.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


/**
 * class sho.ui.InTheStore
 *
**/

sho.ui.InTheStore = klass({

    _KLASS_ : 'sho.ui.InTheStore',
    theme : 'black',
    store : {},
    randomize : true,
    title : 'In The Store',
	isSports : 'false',
    loadCount : 10,
    displayCount : 3,
    imageSize : 140,
    tracking : '',
    template : [
            '<h2>{{ title }}</h2>',
            '<ul class="store-items">',
            '{{#store.products}}',
                '<li class="clearfix">',
                    '<a data-behavior="track-click" data-click-id="shop:{{ id }}" href="{{ url }}">',
                        '<img src="{{ thumbnailImg }}"/>',
                    '</a>',
                    '<p><a data-behavior="track-click" data-click-id="shop:{{ id }}" href="{{ url }}">{{ name }}</a></p>',
                    '{{#hasSalePrice}}',
                        '<p><span class="strikethrough">${{ retailPrice }}</span> <span class="sale-price">${{ salePrice }}</span></p>',
                    '{{/hasSalePrice}}',
                    '{{^hasSalePrice}}',
                    '<p>${{ salePrice }}</p>',
                    '{{/hasSalePrice}}',
                '</li>',
            '{{/store.products}}',
            '<li class="store-link"><span class="raquo">&raquo;</span> <a data-behavior="track-click" data-click-id="shop:more" href="{{ store.view.url }}">Shop More {{ store.view.name }}</a></li>',
            '</ul>',
    ].join(''),

	initialize : function(cfg)
    {
        var c = $(cfg.container), storeView = sho.dom.data.read(c, 'storeView'), isSeriesSpecific = true;

        if (storeView.search('showtime_dvds') >= 0) { isSeriesSpecific = false; }

        _.extend(this, {
            'container' : c,
            'storeView' : sho.dom.data.read(c, 'storeView'),
            'theme' : sho.dom.data.read(c, 'storeTheme'),
            'tracking' : sho.dom.data.read(c, 'store-tracking'),
            'randomize' : (!isSeriesSpecific) ? false : this.randomize,
            'title' : (!isSeriesSpecific) ? 'Featured DVDs' : this.title,
            }
        );

        this.getStoreData();
    },

    getStoreData : function()
    {
        var th=this;
        $j.ajax({
          url: 'http://store.sho.com/products.php?format=json&v=' + this.storeView + '&thumbnailImgSize=' + this.imageSize + '&cnt=' + this.loadCount,
          dataType: 'jsonp',
          jsonp : 'callback',
          jsonpCallback: 'jsonp1',
          cache: true,
          success: function(data){
            th.store = data;
            th.processStoreData();
          }
        });
    },

    processStoreData : function()
    {
        if (this.randomize) { this.randomizeProducts(); }

        this.store.products = $(this.store.products).slice(0,this.displayCount);

        var th=this;

        $j.each(this.store.products, function(key, product) {
           product.hasSalePrice = false;
           if(product.retailPrice != product.salePrice) { product.hasSalePrice = true; }

           if (th.tracking) {
               product.url = product.url + "&ecid="+th.tracking+"&pa="+th.tracking;
           }

           product.name = th.sanitizeProductName(product.name);

        });

        this.store.view.url = this.store.view.url + "&ecid="+this.tracking+"&pa="+this.tracking;

        this.store.view.name = $j('<span/>').html(this.store.view.name).text();

		if (this.storeView == 'showtime_shows_boxing') { this.isSports = true; }

			if (this.isSports == true) {
				this.store.view.name = 'Sports';
			}

        this.renderStoreData();

        sho.dom.trigger('stickyfooter:update');
    },

    sanitizeProductName : function(productName)
    {
        var entities= {
            '&#8220;': '"',
            '&#8221;': '"',
            '&#8217;': '\'',
            '&#8216;': '\''
          };

          for (var prop in entities) {
            if (entities.hasOwnProperty(prop)) {
              productName = productName.replace(new RegExp(prop, "g"), entities[prop]);
            }
          }
          return productName;
    },

    renderStoreData : function()
    {
        $j(this.container).append(Mustache.to_html(this.template, this));
    },

    randomizeProducts : function()
    {
         var i = this.store.products.length;
         if ( i == 0 ) return false;
         while ( --i ) {
             var j = Math.floor( Math.random() * ( i + 1 ) );
             var tempi = this.store.products[i];
             var tempj = this.store.products[j];
             this.store.products[i] = tempj;
             this.store.products[j] = tempi;
         }
    }

});
sho.loaded_modules['/lib/js/sho/ui/inthestore.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    !function($)
    {

    sho.ui.Flexbox = klass({

        '_KLASS_' : 'sho.ui.Flexbox',

        'minimum' :     sho.string.toDimensions('800x400'),
		'maximum' :     sho.string.toDimensions('1600x1200'),

        initialize:function(cfg)
        {

            _.extend(this, {
                'container' :   $(cfg.container),
                'margins' :     sho.string.toBox(cfg.margins || '0 0 0 0'),
                'dimensions' :  sho.string.toDimensions(cfg.dimensions),
                'noisy_logging' : (cfg.noisy_logging !== undefined ? cfg.noisy_logging : false),
                'fn' : {
                    'update' : _.bind(this.update, this)
                }
            })

            $(window).on('resize', this.fn.update);
            this.update();
        },

        update:function()
        {
            var w = sho.number.inRange(sho.dom.viewport().width,  this.minimum.width, this.maximum.width),
                h = sho.number.inRange(sho.dom.viewport().height, this.minimum.height, this.maximum.height),
                target = {
                    'width' :   w  - (this.margins.left + this.margins.right),
                    'height' :  h - (this.margins.top  + this.margins.bottom),
                },
                natural = this.dimensions,
                sx = target.width / natural.width,
                sy = target.height / natural.height,
                s = {}
            ;

            this.noisy_logging && log('viewport     ' + JSON.stringify(sho.dom.viewport()));
            this.noisy_logging && log('constraints  ' + JSON.stringify({'width':w,'height':h}));
            this.noisy_logging && log('margins      ' + JSON.stringify(this.margins));
            this.noisy_logging && log('target       ' + JSON.stringify(target));


            if(sx > sy)
            {
                s.width = Math.round(target.height * (natural.width / natural.height));
                s.height = target.height;
                s.marginLeft = s.marginRight = 'auto'; //Math.round((target.width - s.width) / 2);
            }
            else
            {
                s.width = target.width;
                s.height = Math.round(target.width * (natural.height / natural.width));
                s.marginTop = Math.round((target.height - s.height) / 2);
            }

            this.noisy_logging && log('style        ' + JSON.stringify(s));

            this.container.css(s).parent().css({
                'paddingTop' : this.margins.top,
                'paddingBottom' : this.margins.bottom,
                'paddingLeft' : this.margins.left,
                'paddingRight' : this.margins.right
            })
        }
    })

    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/flexbox.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.photogallery');

    !function($)
    {

    sho.ui.photogallery.Drawer = klass({

        '_KLASS_' : 'sho.ui.photogallery.Drawer',

        step_size : 100,

        initialize:function(cfg)
        {
            var c=$(cfg.container); _.extend(this, {
                'container' : c,
                'innerCntr' : c.find('.photo-gallery-thumbs-inner'),

                'fn' : {
                    'over' :        _.bind(this.over, this),
                    'out' :         _.bind(this.out, this),
                    'focus' :       _.bind(this.animate, this, 'focus'),
                    'blur' :        _.bind(this.animate, this, 'blur'),

                    'resize' :      _.bind(this.setWidths, this),

                    'mouseMove' :   _.bind(this.mouseMove, this),
                    'onGlideInterval' : _.bind(this.onGlideInterval, this)
                }
            })
            this.setWidths();
            this.setHandlers();
            this.peek()
        },

        setHandlers:function()
        {
            this.innerCntr.mouseenter(this.fn.over);
            this.innerCntr.mouseleave(this.fn.out);
            $(window).on('resize', this.fn.resize);
        },

        peek:function()
        {
            _.delay(this.fn.focus, 1000); // focus just animates without clearing interval set below
            this.itvl = setTimeout(this.fn.out, 3000);
        },


        over:function()
        {
            clearTimeout(this.itvl);
            this.animate('focus')
        },

        out:function()
        {
            clearTimeout(this.itvl)
            this.itvl = setTimeout(this.fn.blur, 500);
        },

        animate:function(mode)
        {
            log('|anim| '+mode)
            this.innerCntr.animate({
                'padding-top':(mode == 'focus' ? 0 : 84),
                'duration' : 400
            },
                _.bind(this.onComplete, this, mode)
            )
        },

        onComplete:function(mode)
        {
            var method = (mode == 'focus' ? 'setGlideHandlers' : 'unsetGlideHandlers'),
                fn = this[method]
            ;
            fn.call(this)
        },

        setGlideHandlers:function()
        {
            this.isAnimating = false;
            this.innerCntrLeft = this.innerCntrLeft || 0;
            this.innerCntr.on('mousemove', this.fn.mouseMove);
            this.glideItvl = setInterval(this.fn.onGlideInterval, 41 );
        },

        unsetGlideHandlers:function()
        {
            clearInterval(this.glideItvl);
            this.innerCntr.off('mousemove', this.fn.mouseMove);
        },

        setWidths:function()
        {
            this.viewportWidth = sho.dom.viewport().width;

            if(this.viewportWidth > this.innerCntr.data('width'))
            {
                this.innerCntr.width(this.viewportWidth)
            }
            else
            {
                this.innerCntr.width(this.innerCntr.data('width'))
            }
        },

        mouseMove:function(e)
        {
            if(this.innerCntr.width() <= this.viewportWidth && this.innerCntrLeft == 0) return;    // nothing to glide!
            var x = e.clientX, w = this.viewportWidth, pan = x/w;


            if((pan < 0.33 || pan > 0.66))
            {
                this.isAnimating = true;
                this.force = 0.5 - pan;
                this.direction = pan < 0.33 ? 'right':'left';
            }
            else
            {
                this.isAnimating = false;
                this.force = 0;
            }
        },

        onGlideInterval:function()
        {
            if(this.isAnimating) this.updateDrawer()
        },

        updateDrawer:function()
        {

            var step = this.step_size * this.force,

            left = this.innerCntrLeft + step,

            offset = this.viewportWidth-this.innerCntr.width(),

            canGlide = (this.direction == 'left' && (offset<left)) || (this.direction == 'right' && left <= 0)
            ;

            left = canGlide ? left : (this.direction == 'left' ? offset : 0);


            this.innerCntr.css({'left':left});
            this.innerCntrLeft = left;
        }



    })

    }(sho.$)

sho.loaded_modules['/lib/js/sho/ui/photogallery/drawer.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    !function($)
    {

    sho.ui.photogallery.Widget = klass({

        '_KLASS_' : 'sho.ui.photogallery.Widget',

        initialize:function(cfg)
        {
            this.container = $(cfg.container);

            this.initFlexBox();
            this.initDrawer();
            sho.dom.trigger('photogallery:image:viewed')
        },

        initDrawer:function()
        {
            _.each(this.container.parent().find('.photo-gallery-thumbs'), function(el){
                new sho.ui.photogallery.Drawer({
                    'container' : el
                })
            })
        },

        initFlexBox:function()
        {
            new sho.ui.Flexbox({
				'container' : this.container.find('img'),
				'dimensions' : '800x600',
				'margins' : '50 85 138 85'
			})
        }
    })

    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/photogallery/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui/photogallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($){

    sho.ui.MultiView = klass({

        '_KLASS_' : 'sho.ui.MultiView',

        'defaults' : {
            'initial' : 'images'
        },

        initialize : function(cfg)
        {

            var k = 'multi-view-state',
                c = $(cfg.container)
            ;
            _.extend(this, {
                'container' : c,
                'id' : c.attr('id'),
                'initialState' : c.data('initialState') || this.defaults.initial,
                'active' :  null,

                'controls' : {
                    'view' : c.find('.view-toggle')
                },

                'states' : _.collect(c.find('.'+k), function(el){
                    return {
                        'key' : el.className.split(k+' is-')[1],
                        'el' :  $(el)
                    }
                }),

                'fn' : {
                    'onViewToggleClick' : _.bind(this.onViewToggleClick, this)
                }

            });

            this.setInitialState()
            this.setHandlers();
        },

        setHandlers:function()
        {
            if(!_.any(this.controls.view)) return;

            this.controls.view.on('click', '.view-mode', this.fn.onViewToggleClick)
        },

        onViewToggleClick:function(e)
        {
            sho.dom.trap(e);

            var el = e.currentTarget,
                mode = el.className.match(/view-mode\s(.+)/)[1]
            ;
            this.setState(mode);
        },

        setInitialState : function()
        {
			var state = this.read(), hasState = false;

			_.each(this.states, function(cfg){
				if(cfg.key == state) hasState = true;
			});

			this.setState(hasState ? state : this.initialState);
			this.container.removeClass('is-loading');

        },

        setState:function(key)
        {
            if(key !== this.active)
            {
                var klass = 'aktiv'; _.each(this.states, function(cfg){
                    if(cfg.key == key)
                    {
                        cfg.el.addClass(klass)
                    }
                    else
                    {
                        cfg.el.removeClass(klass)
                    }
                })

                this.write(key);
                this.active = key;
                this.tagContainer(key);
            }

            var fn = _.bind(sho.dom.trigger, window, 'stickyfooter:update'); fn();
            _.delay(fn, 1000)
        },

        tagContainer:function(mode)
        {
            this.container.removeClass(_.inject(this.states, function(classStr,cfg){
                return classStr + 'is-' + cfg.key +' '
            },'')).addClass('is-'+mode);
        },

        read:function()
        {
            return sho.util.Cookies.read(this.getId())
        },

        write:function(value)
        {
            sho.util.Cookies.write(this.getId(), value)
        },

        getId:function()
        {
            return 'sho_multi_view_' + sho.string.underscore(this.id || sho.dom.body().get(0).className.split(' ').pop())
        }


    })

    }(sho.$)

sho.loaded_modules['/lib/js/sho/ui/multiview.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    !function($){

    sho.ui.MediaGallery = klass({

        '_KLASS_' : 'sho.ui.MediaGallery',

        'row_klass' : 'galleri-row',

        initialize : function(cfg)
        {
            var c = $(cfg.container); _.extend(this, {
                'container' :   c,
                'has_rollover' : c.data('has-rollover'),
                'has_overlay' :  c.data('has-overlay'),
                'wrap_titles' :  c.data('title-wrap'),
                'format' : c.data('format'),
                'numUnits' : null,
                'unit_factor' : 1
                ,
                'fn' : {
                    'wrap' : _.bind(this.wrap, this),
                    'adjustLandscapeItems' : _.bind(this.adjustLandscapeItems, this),
                    'toggleOverlay' : _.bind(this.toggleOverlay, this)
                }
            })

            this.is_mixed = this.format == 'mixed';


            this.decorateWithMetaElement();
            this.setHandlers();
        },

        decorateWithMetaElement:function()
        {
            if(!this.wrap_titles && !this.is_mixed) return;
            var el = this.container.find('.item:first-child');
            el.append('<em class="metadata"></em>');

            if(this.is_mixed) this.unit_factor = el.hasClass('landscape') ? 2 : 1;
            this.meta = el.find('.metadata');
        },

        setHandlers:function()
        {
            if(this.wrap_titles)
            {
                this.wrap();
                $(window).on('resize', this.fn.wrap);
            }

            if(this.has_overlay)
            {
                this.container.on('click','.more-info', this.fn.toggleOverlay)
            }
        },

        wrap:function()
        {
            var n = this.getNumUnits() * this.unit_factor;

            if(this.numUnits !== n)
            {
                this.numUnits = n;
                this.applyWrap()
                _.delay(this.fn.adjustLandscapeItems, sho.dom.REDRAW_DELAY_);
            }
            else
            {
                this.adjustLandscapeItems()
            }

        },

        applyWrap:function()
        {
            var row_klass = 'galleri-row',
                c = this.container,
                items = c.find('.item').detach(),
                sorter = !this.is_mixed ? this.inGroupsOf : this.inGroupsOfForMixedCollection
            ;
            c.find('.'+row_klass).remove();

            _.each(sorter(items, this.numUnits), function(row){
                  c.append($('<div class="'+row_klass+'" />')
                    .append(row)
                )
            });
        },

        inGroupsOf:function(arr, chunk)
        {
            var i, j, temparray = [];
            for (i = 0, j = arr.length; i < j; i += chunk){
                temparray.push(arr.slice(i, i + chunk));
            }
            return temparray
        },

        inGroupsOfForMixedCollection:function(items, chunk)
        {
            var t=0,
                i=0,
                len = items.length,
                item,
                isLandscape,
                step,
                row = [],
                gallery = []
            ;

            while(t<len)
            {
                item = items[t];

                isLandscape = $(item).hasClass('landscape');

                step = isLandscape ? 2 : 1;

                var title = $(item).find('.item-titlebar a').html().toLowerCase().substring(0,15); while(title.length < 15) title += ' ';

                if((i + step) > chunk)
                {
                    gallery.push(row);
                    row = [item];
                    i=step;
                }
                else
                {
                    row.push(item)
                    i += step;
                }

                t++
            }

            if(_.any(row)) {
                gallery.push(row);

            }
            return gallery

        },

        getStep:function(item)
        {
            return $(item).hasClass('landscape') ? 2 : 1;
        },

        getNumUnits:function()
        {
            var top = this.meta.css('top'),
                n =   Number((top || '').split('px')[0])
            ;
            return n;
        },

        adjustLandscapeItems:function()
        {
            if(!this.is_mixed) return

            var h = (this.container.find('.item.portrait img').filter(':first').height())
            this.container.find('.item.landscape > a').height(h)
        },

        toggleOverlay:function(e)
        {
            sho.dom.trap(e);

            var el = $(e.currentTarget).parents('.item').find('.item-overlay');
            el.toggle()
        }

    })


    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/mediagallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.ScheduleDateSelect
     *
    **/


    !function($){

    sho.ui.ScheduleDateSelect = klass({

        dayLabels : $w('SU MO TU WE TH FR SA'),
        selectedDate : null,
        linkPrefix : null,
        months : null,
        _KLASS_ : 'sho.ui.ScheduleDateSelect',

    	initialize : function(cfg)
        {
            Object.extend(this, {
                'ui' : {
                    'container' : cfg.container,
                    'datePicker' : $('.schedule-date-picker', cfg.container),
                    'dateControls' : $('.schedule-date-controls', cfg.container),
                    'scheduleCalendars' : $('.schedule-calendars-wrapper', cfg.container)
                },
                'todaysDate' : Date.today(),
            })

            var selectedDate = sho.dom.data.read(this.ui.container, 'schedule-date').split(' ')[0];
            this.selectedDate = Date.parse(selectedDate);
            this.linkPrefix = sho.dom.data.read(this.ui.container, 'schedule-link-prefix');

            this.months = [
                Date.today().moveToFirstDayOfMonth(),
                Date.today().add({ months: 1 }).moveToFirstDayOfMonth(),
            ];

            this.showControls();
            this.buildCalendars();
            this.setHandlers();
        },

        hasPrevious : function()
        {
            return (this.selectedDate > this.todaysDate);
        },

        hasNext : function()
        {
            return !!(this.selectedDate.getTime() < Date.today().add({ months: 1 }).moveToLastDayOfMonth().getTime());
        },

        showControls: function()
        {
            if (this.hasPrevious()) {
                $('.schedule-date-controls-prev', this.ui.dateControls).addClass('active');
            }
            if (this.hasNext()) {
                $('.schedule-date-controls-next', this.ui.dateControls).addClass('active');
            }
        },

        buildCalendars: function()
        {
            $.each(this.months, function(i,month) {
              this.ui.scheduleCalendars.append(this.toStr(month));
            }.bind(this));
        },

        setHandlers : function()
        {
            var th=this;
            this.ui.datePicker.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                th.toggleCalendars();
                th.ui.datePicker.toggleClass('aktiv');

                $(document).on('click', function(e){
                    if(th.ui.scheduleCalendars.has(e.target).length === 0){
                         th.ui.scheduleCalendars.hide();
                         th.ui.datePicker.removeClass('aktiv');
                    }
                });
            });
    	},

        toggleCalendars: function()
        {
            this.ui.scheduleCalendars.toggle();
        },

        toStr:function(month)
        {
            html = (['',
            '<div class="schedule-calendar">',
                '<div class="schedule-calendar-title">',
                month.toString('MMMM'),
                ' ',
                month.getFullYear(),
                '</div>',
                '<div class="schedule-calendar-inner">',
                '<div class="schedule-calendar-days">',
                this.getHeader(),
                '</div>',
                this.getBody(month),
                '</div>',
            '</div>',
            ''])

            return html.flatten().join('');
        },

        getHeader:function()
        {
            return this.dayLabels.collect(function(d){
                return ['<div>',d,'</div>']
            })
        },

        getBody:function(date)
        {
            var body = [],
                week =0 ,
                dayOfWeek = 0,
                dayOfMonth = 0,
                cell = '',
                month = this.makeTwoDigit(date.getMonth()+1),
                year = date.getFullYear(),
                daysInMonth = date.getDaysInMonth(),
                startingDay = date.clone().moveToFirstDayOfMonth().getDay(),
                isTodayOrLater = false,
                isSelected = false
            ;

            for(week=0; (week<10 && dayOfMonth < daysInMonth); week++)
            {
                body.push('<div class="schedule-calendar-week">');

                for(dayOfWeek=0; dayOfWeek<7; dayOfWeek++)
                {
                    cell = '<div></div>';

                    if(dayOfMonth < daysInMonth && (week > 0 || dayOfWeek >= startingDay))
                    {
                        isTodayOrLater = (dayOfMonth >= (this.todaysDate.getDate()-1) && date.getMonth() == this.todaysDate.getMonth() || date >= this.todaysDate),
                        isSelected = this.selectedDate && (dayOfMonth == this.selectedDate.getDate()-1 && date.getMonth() == this.selectedDate.getMonth()),
                        cell = (['',
                            '<div class="'+ (isSelected ? 'selected ' : '') + '">',
                            (isTodayOrLater && !isSelected ? '<a href="' + this.linkPrefix + '/date/' + month + '-' + this.makeTwoDigit(dayOfMonth+1) + '-' + year + '">' : '<span>'),
                            (dayOfMonth+1),
                            (isTodayOrLater && !isSelected ? '</a>' : '</span>'),
                            '</div>',
                        ''])

                        cell.flatten().join('');
                        dayOfMonth++;
                    }
                    body.push(cell);
                }
                body.push('</div>');
            }
            return body;
        },

        makeTwoDigit:function(num)
        {
            return ("0" + num).slice(-2);
        }
    })
    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/scheduledateselect.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.ui.StickyHeader
     *
    **/


    !function($){

    sho.ui.StickyTableHeader = klass({

        _KLASS_ : 'sho.ui.StickyTableHeader',

    	initialize : function(cfg)
        {
            $(cfg.container).stickyTableHeaders();
        }
    })
    }(sho.$)
sho.loaded_modules['/lib/js/sho/ui/stickytableheader.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($){

    sho.ui.StickyHeader = klass({

        _KLASS_ : 'sho.ui.StickyHeader',

    	initialize : function(cfg)
    	{
    	    var c =  $(cfg.container); _.extend(this, {

    	        'container' : c,
    	        'offsetTop' : c.offset().top,

    	        'origCSS' :  {
    	            'position' : c.css('position'),
    	            'top' : c.css('top')
    	        },

    	        'stickyCSS' : {
    	            'position' : 'fixed',
    	            'top' : 0   // this assumes only one sticky header at a time, and always pinned to abs top..
    	        },

    	        'fn' :{
    	            'onScroll' :  _.bind(this.onScroll, this)
    	        }
    	    });

    	    $(window).on('scroll', this.fn.onScroll);
    	},

    	onScroll:function(e)
    	{
    	    this.setStickyMode( sho.dom.body().scrollTop() > this.offsetTop )
    	},

    	setStickyMode:function(sticky)
    	{
    	    var el=this.container,style;

    	    if(sticky)
    	    {
    	        style = this.stickyCSS;
    	        el.addClass('sticky');
    	    }
    	    else
    	    {
    	        style = this.origCSS;
    	        el.removeClass('sticky');
    	    }

    	    _.each(style, function(value,property){
    	        el.css(property, value);
    	    })
    	}

    });

    }(sho.$);

    sho.ui.mobile.StickyHeader = sho.ui.StickyHeader;

sho.loaded_modules['/lib/js/sho/ui/stickyheader.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($){

    sho.ui.SeeItReminder = klass({

        '_KLASS_' : 'sho.ui.SeeItReminder',

        'host' : 'https://see.it',
        'width' : 350,
        'height' : 350,
        'title' : 'Set Reminder',

        initialize : function(cfg)
        {
            var c = $(cfg.container); _.extend(this, {
                'container' :   c,
                'path' :        c.data('path'),
                'title' :       c.data('title') || this.title,

                'fn' : {
                    'showReminderEmbed' : _.bind(this.showReminderEmbed, this)
                }
            });

            this.setHandlers();
        },

        setHandlers:function()
        {
            this.container.on('click', this.fn.showReminderEmbed);
        },


        showReminderEmbed:function(e)
        {
            sho.dom.trap(e);


            if(sho.env.isMobile())
            {
                window.location = this.url()
            }
            else
            {
                sho.ui.Portal({
                    title : this.title,
                    width : this.width,
                    height : this.height,
                    url : this.url()
                })
            }

        },

        url:function()
        {
            return this.host + '/'+ this.path + '/embedded/remind'
        }
    })

    }(sho.$);


    sho.ui.mobile.SeeItReminder = sho.ui.SeeItReminder;
sho.loaded_modules['/lib/js/sho/ui/seeitreminder.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


!function($){

    sho.ui.Viewport = klass({

        _KLASS_ : 'sho.ui.Viewport',
        defaults : {
            'offset' : '30%'
        },

        initialize:function(cfg)
        {
            var c = cfg.container,
            offset = sho.dom.data.read(c, 'viewportOffset'),
            toggleClass = sho.dom.data.read(c, 'viewportClass'),
            tracking = sho.dom.data.read(c, 'clickId');

            _.extend(this, {
                    'container' : c,
                    'offset' : offset ? offset : this.defaults.offset,
                    'toggleClass' : toggleClass,
                    'tracking' : tracking
                }
            );

            if (this.toggleClass) this.container.addClass(this.toggleClass);

            var th=this,
            waypoint = new Waypoint({
              element: th.container,
              handler: function() {
                    if (th.toggleClass) th.container.removeClass(th.toggleClass);

                    if (th.tracking) {
                        var t = sho.analytics.getTracker({
                            'reload':true,  // reset page data
                            'debug':true
                        });
                        t.trackClick({ 'click' : th.tracking });
                    }

                    this.disable();
                    Waypoint.refreshAll();
              },
              offset: th.offset
            });
        }
    });


    sho.ui.Viewport.brightcovePlayers = [];

    sho.ui.Viewport.brightcove =
    {
        onTemplateLoad : function(experienceID){

            sho.ui.Viewport.brightcovePlayers.push(experienceID);

            var bcExp = brightcove.getExperience(experienceID);
            var modExp = bcExp.getModule(APIModules.EXPERIENCE);
            var modVP = bcExp.getModule(APIModules.VIDEO_PLAYER);

            modExp.addEventListener(BCExperienceEvent.TEMPLATE_READY, function(){
                sho.ui.Viewport.brightcove.onTemplateReady(experienceID)
            }, false);

            modVP.addEventListener(BCMediaEvent.BEGIN, function(){
                sho.ui.Viewport.brightcove.onBeginEventFired(experienceID)
            }, false);
        },

        onBeginEventFired : function(experienceID){


            var players = sho.ui.Viewport.brightcovePlayers;
            $.each(sho.ui.Viewport.brightcovePlayers, function(index, id) {
                if (id != experienceID) {
                  var otherPlayer = brightcove.getExperience(id);
                  var otherVideoPlayer = otherPlayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
                  if (otherVideoPlayer.isPlaying()) {
                      setTimeout(function(){otherVideoPlayer.pause();},1000);
                  }
                }
            });
        },

        onTemplateReady : function(experienceID){

            var bcExp = brightcove.getExperience(experienceID);
            var modVP = bcExp.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
            var container = $('#' + experienceID + '-wrapper');

            container.addClass('template-ready');


            container.waypoint({
                handler: function() {
                    modVP.play();
                    this.disable();
                    setTimeout(function(){Waypoint.refreshAll()},1000);
                },
                offset: '65%',
                triggerOnce: true }, modVP, experienceID);

            container.waypoint({
                handler: function() {
                    modVP.pause();
                    this.disable();
                    setTimeout(function(){
                        modVP.pause(); // double check!!
                        Waypoint.refreshAll()
                    },2000);
                },
                offset: '-45%' }, modVP);

            container.waypoint({
                handler: function(direction) {
                    if (direction === 'down') return;
                    this.disable();
                    if (modVP.isPlaying()) modVP.pause();
                },
                offset: '70%' }, modVP);
        }
    };

}(sho.$)
sho.loaded_modules['/lib/js/sho/ui/viewport.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($){

	sho.ui.TruncatedText = klass({

	    _KLASS_ : 'sho.ui.TruncatedText',

	    'toggle_labels' : {
			'more':'Read More',
			'less':'Read Less'
		},

		'toggle_view' : ['',

			'<a class="cta abbrev-section--{{mode}}" data-mode="{{mode}}" href="#">',
				'{{label}}', ' ',
				'{{#iconClass}}',
					'<i class="icon {{iconClass}}">&nbsp;</i>',
				'{{/iconClass}}',
			'</a>',

		''].join(''),


	    initialize : function(cfg)
	    {
	        var c = $(cfg.container); _.extend(this, {
	            'container' :   	c,
	            'toggle' :      	c.find('.text-truncated__read-more'),
	            'body' :        	c.find('.text-truncated__body'),
	            'breakpoint' :  	c.data('truncate-breakpoint'),
	            'labels' :      	(c.data('labels') || this.toggle_labels).split(','),
				'restore_focus':	c.data('restore-focus')

	        });

	        if(!this.toggle) throw new Error('Must mark up truncated text with a read more toggle element');
	        if(!enquire) throw new Error('Truncated Text requires enquirejs');

	        _.bindAll(this, 'setBreakpoint','applyBehaviors','removeBehaviors','truncate','untruncate','unlock','onClick');

	        _.delay(this.setBreakpoint, sho.dom.REDRAW_DELAY_);

	    },

	    setBreakpoint:function()
	    {
            if(this.breakpoint)
            {
	            var query = "screen and (max-width: "+(this.breakpoint+'').replace('px','') +"px)";
	            enquire.register(query, {
	                match:      this.applyBehaviors,
    	            unmatch:    this.removeBehaviors
    	        })
	        }
	    },


	    applyBehaviors:function()
	    {
	        log('|truncate| match:applyBehaviors');
	        this.truncate();
	        this.toggle.show();
	        this.toggle.on('click', this.onClick);
	    },

	    removeBehaviors:function()
	    {
	        log('|truncate| unmatch:removeBehaviors');

	        this.untruncate()
	        this.toggle.off('click', this.onClick);
	        this.toggle.hide();
	    },

		onClick:function(e)
		{
			sho.dom.trap(e);

			if(!this.isLocked())
			{
				this.lock();
				this.toggleTruncation()
			}
		},

		toggleTruncation:function(e)
	    {
	        if(this.truncated)
	        {
	            this.untruncate()
	        }
	        else
	        {
	            this.truncate()
	        }
	    },

	    truncate:function()
	    {
	     	this.truncated = true;
	        this.container.addClass('is-truncated')
			this.restore_focus && this.restoreFocus();
			this.setToggle('more');

			_.delay(this.unlock, sho.dom.REDRAW_DELAY_);
	    },

	    untruncate:function()
	    {
	        this.truncated = false;
			this.setScroll();
    	    this.container.removeClass('is-truncated');
			this.setToggle('less');

			_.delay(this.unlock, sho.dom.REDRAW_DELAY_);
	    },

		setToggle:function(mode)
		{
			var iconClass;
			if(mode.match(/more|less/)) iconClass = 'icon--carat-'+ (mode == 'less' ? 'up' : 'down');
			if(mode == 'loading') iconClass = 'icon--loading';

			html = Mustache.to_html(this.toggle_view, {

				'label': 		this.getLabel(mode),
				'mode': 		mode,
				'iconClass': 	iconClass
			});

			this.toggle.html(html);
		},

		restoreFocus:function()
		{
			var el = sho.dom.body();

			if(el.scrollTo) // jQuery plugin in desktop stack only...
			{
				el.scrollTo(this.getScroll(), 500);
			}
			else
			{
				window.scrollTo(0,this.getScroll())
			}
		},

	    getLabel:function(k)
	    {
	        return this.toggle_labels[k];
	    },

		setScroll:function()
		{
			this._y = window.scrollY;
		},

		getScroll:function()
		{
			return this._y;
		},

		isLocked:function()
		{
			return !!this._locked;
		},

		lock:function()
		{
			this._locked = true
		},

		unlock:function()
		{
			this._locked = false
		}






	});

    }(sho.$);


	sho.ui.mobile.TruncatedText = sho.ui.TruncatedText;
sho.loaded_modules['/lib/js/sho/ui/truncatedtext.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.provide('sho.ui.forms');


	!function($){

	sho.ui.forms.PreventMultipleSubmit = klass({

	    '_KLASS_' : 'sho.ui.forms.PreventMultipleSubmit',

	    'first_submit': true,

	    initialize : function(cfg)
	    {
	        _.extend(this, {
	            'container' : $(cfg.container),
	            'fn' : {
	                'onSubmit' : _.bind(this.onSubmit, this)
	            }
	        });

	        this.container.submit(this.fn.onSubmit)
	    },

	    onSubmit:function(e)
	    {
            if(!this.first_submit)
			{
            	sho.dom.trap(e)
                log("| prevent multiple form submissions |")
                return false;
            }
           	else
			{
               	this.first_submit = false;
           	}
	    }

	})

	}(sho.$)
sho.loaded_modules['/lib/js/sho/ui/forms/preventmultiplesubmit.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/forms.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


	/**
	 * sho.ui.abbrev
	 * namespace for login components
	**/

	sho.provide('sho.ui.abbrev');


	!function($){
	sho.ui.abbrev.IsAbbreviated = {

		'toggle_labels' : 		{
			'more':'View More',
			'less':'View Less',
			'loading':'Loading'
		},

		'toggle_view' : ['',

			'<a class="cta abbrev-section--{{mode}}" data-mode="{{mode}}" href="#">',
				'{{label}}', ' ',
				'{{#iconClass}}',
					'<i class="icon {{iconClass}}">&nbsp;</i>',
				'{{/iconClass}}',
			'</a>',

		''].join(''),


		setHandlers:function()
		{
	        this.toggle.on('click', this.onClick);
		},

		unsetHandlers:function()
		{
	        this.toggle.off('click', this.onClick);
		},

		onClick:function(e)
		{
			sho.dom.trap(e);

			if(!this.isLocked())
			{
				this.lock();
				this.toggleTruncation()
			}
		},

		toggleTruncation:function()
		{
			if(this.truncated)
	        {
	            this.untruncate()
	        }
	        else
	        {
				this.truncate()
	        }
	    },


		truncate:function()
	    {
	     	this.truncated = true;
			this.truncate_();
			this.restore_focus && this.restoreFocus();

			_.delay(this.unlock, sho.dom.REDRAW_DELAY_);
	    },

		truncate_:function(){
			log('define in subclass');
		},

	    untruncate:function()
	    {
		    this.truncated = false;
			this.setScroll();
			this.untruncate_();

			_.delay(this.unlock, sho.dom.REDRAW_DELAY_);
	    },

		untruncate_:function(){
			log('define in subclass');
		},

		setToggle:function(mode)
		{
			var iconClass;
			if(mode.match(/more|less/)) iconClass = 'icon--carat-'+ (mode == 'less' ? 'up' : 'down');
			if(mode == 'loading') iconClass = 'icon--loading';

			html = Mustache.to_html(this.toggle_view, {

				'label': 		this.getLabel(mode),
				'mode': 		mode,
				'iconClass': 	iconClass
			});

			this.toggle.html(html);
		},

		getLabel:function(k)
	    {
	        return this.toggle_labels[k];
	    },


		restoreFocus:function()
		{
			var el = sho.dom.body();

			if(el.scrollTo) // this jQuery plugin only exists in desktop stack ...
			{
				el.scrollTo(this.getScroll(), 500);
			}
			else
			{
				window.scrollTo(0,this.getScroll())
			}
		},

		setScroll:function()
		{
			this._y = window.scrollY || window.pageYOffset
		},

		getScroll:function()
		{
			return this._y;
		},


		isLocked:function()
		{
			return !!this._locked;
		},

		lock:function()
		{
			this._locked = true
		},

		unlock:function()
		{
			this._locked = false
		}

	};

	}(sho.$);
sho.loaded_modules['/lib/js/sho/ui/abbrev/isabbreviated.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



	!function($){

	sho.ui.abbrev.TextBlock = klass( _.extend({},

		sho.ui.abbrev.IsAbbreviated, {

	    _KLASS_ : 'sho.ui.abbrev.TextBlock',

	    initialize : function(cfg)
	    {
	        var c = $(cfg.container); _.extend(this, {
	            'container' :   	c,
	            'toggle' :      	c.find('.text-truncated__read-more'),
	            'body' :        	c.find('.text-truncated__body'),
	            'breakpoint' :  	c.data('truncate-breakpoint'),
	            'labels' :      	(c.data('labels') || this.toggle_labels).split(','),
				'restore_focus': 	true,	//, c.data('restore-focus'),

	        });

	        _.bindAll(this, 'setBreakpoint','applyBehaviors','removeBehaviors','truncate','untruncate','unlock','onClick');
			if(!this.isTruncatable())	return false;
			if(!this.toggle) 			throw new Error('Must mark up truncated text with a \'read more\' toggle element');
	        if(!enquire) 				throw new Error('Truncated Text requires enquirejs');
        	if(this.breakpoint) 		_.delay(this.setBreakpoint, sho.dom.REDRAW_DELAY_);

	    },

		isTruncatable:function()
		{
			return this.body.find('p').size() > 1;
		},

	    setBreakpoint:function()
	    {
	        var query = "screen and (max-width: "+(this.breakpoint+'').replace('px','') +"px)";
            enquire.register(query, {
            	match:      this.applyBehaviors,
	         	unmatch:    this.removeBehaviors
	    	})
	    },


	    applyBehaviors:function()
	    {
	        this.truncate();
	        this.toggle.show();
			this.setHandlers();
	    },

	    removeBehaviors:function()
	    {
	        this.untruncate()
	        this.toggle.hide();
			this.unsetHandlers()
	    },

	    truncate_:function()
	    {
			this.setToggle('more');
	     	this.container.addClass('is-truncated')
		},

	    untruncate_:function()
	    {
			this.setToggle('less');
	        this.container.removeClass('is-truncated');
		}

	}));

	}(sho.$);

	sho.ui.TruncatedText = sho.ui.mobile.TruncatedText = sho.ui.abbrev.TextBlock;
sho.loaded_modules['/lib/js/sho/ui/abbrev/textblock.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



	!function($){

	sho.ui.abbrev.Section = klass( _.extend({},

		sho.ui.abbrev.IsAbbreviated, {

	    '_KLASS_': 'sho.ui.abbrev.Section',

		'row_class': 	null, // 'fighter-videos.row',
		'item_class': 	null, // 'fighter-history__event',


	    initialize : function(cfg)
	    {
	        var c = $(cfg.container); _.extend(this, {

	            'container': 		c,
				'toggle': 			c.siblings('a[data-behavior="view-all"]'),
				'url_': 			(c.data('url')||'').replace(/^\/sho/,'/rest'),
				'useStubs': 		window.location.pathname.match(/^\/\!/),
				'restore_focus': 	true,	//, c.data('restore-focus'),
				'initialItems': 	Number(c.data('itemsInitial')),
				'maxItems': 		Number(c.data('itemsMax')),
				'totalItems': 		Number(c.data('itemsTotal')),
				'truncated': 		true

	        });

			_.bindAll(this, 'onClick','unlock','onReady','onError');
			this.setHandlers();
		},


		fetch:function()
		{
			if(!this.root) throw new Error('must define a root node containing the View All content');

			$.ajax({
				'type': 	'GET',
				'url' : 	this.url(),
				'dataType': 'json',
				'success' : this.onReady,
				'error' : 	this.onError
			});
		},

		onReady:function(xhr)
		{
			if(xhr.data)
			{
				var data = 	eval('xhr' + '.' + this.root);

				if(data && _.any(data))
				{
					this.items = Array.prototype.slice.call(data, this.initialItems, (this.maxItems || this.totalItems));

					this.render();
					this.apply_behaviors && sho.behaviors.apply(this.container);

					this.setToggle('less');
					_.delay(this.unlock, sho.dom.REDRAW_DELAY_);
				}
				else
				{
					this.onError();
				}
			}
			else
			{
				this.onError();
			}

		},

		onError:function(xhr)
		{
			xhr && log(xhr);
			throw new Error('An error has occurred.');
		},

		render:function(items)
		{
			log('implement render() in subclass');
			log(items);
		},

		truncate_:function()
		{
			this.setToggle('more');
			var extras = this.getExcessItems();
			sho.behaviors.remove(extras);
			$(extras).remove();
		},

		untruncate_:function()
		{
			this.setToggle('loading');
			this.fetch();
		},


		url:function()
		{
			return !this.useStubs ? this.url_ : this.url_.replace(/^\/rest/,'/!') + '.js';
		}

	}))

	}(sho.$)
sho.loaded_modules['/lib/js/sho/ui/abbrev/section.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/abbrev.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.ui.notifications');


    !function($)
    {
        sho.ui.notifications.Manager = klass({

            _KLASS_ : 'sho.ui.notifications.Manager',
		    cookie_key : 'sho_global_notifications',
            height: 0,

            template:([
                        '<div class="notification clearfix {{classNames}}">',
                            '<div class="notification-header">',
                                '<div class="notification-close">X</div>',
                                '<div class="notification-title">{{title}}</div>',
                            '</div>',
                            '<div class="notification-content">',
                                '{{{content}}}',
                            '</div>',
                        '</div>',
            ].join("\n")),

            initialize:function(cfg)
            {
                var fn =  sho.ui.notifications.config['beforeNotification'] || (function(){return true});
                var proceed = (fn() && !this.getNotificationCookie() && !!sho.ui.notifications.config);
                this.body = sho.dom.body();

                proceed && this.buildNotification();
            },

            buildNotification:function()
            {
                _.extend(this, (sho.ui.notifications.config || {}));

                if(!sho.ui.notifications.enabled) return;

                this.html = Mustache.to_html(this.template, this);
                $(this.body).append(this.html);
                this.notification = $('.notification')[0];

                this.height = $(this.notification).height();
                $(this.notification).css('bottom', -this.height);

                setTimeout($.proxy(this.showNotifcation, this), 1000);

                $(".notification-close").click(this.hideNotification.bind(this));

                $(".notification-cookie").click(this.setNotificationCookie.bind(this));
            },

            showNotifcation:function()
            {
                $(this.notification).addClass('active');
            },

            hideNotification:function()
            {
                $('.notification').hide();

                this.setNotificationCookie();
            },

            getNotificationCookie:function(){
                return !!sho.util.Cookies.read(this.cookie_key);
            },

            setNotificationCookie:function(){
                sho.util.Cookies.write(this.cookie_key,true,20*365); // expire in 20 years
            }

            });
    }(sho.$)

	sho.ui.notifications.clearCookie=function(){
	    sho.util.Cookies.clear(sho.ui.notifications.Manager.prototype.cookie_key);
	}
sho.loaded_modules['/lib/js/sho/ui/notifications/manager.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/ui/notifications.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/ui.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/




	/**
	 * class sho.accounts.User
	 * Model for representing a User in the accounts system. Wraps the REST actions for accessing user details and invoking a logout
	**/

	!(function($){
    sho.accounts.User = klass({

        _KLASS_ : 'sho.accounts.User',

        url_base : '/rest/accounts/security/',

        urls : {
            'read' :    'context',
            'write' :   'login',
            'destroy' : 'logout'
        },


        initialize:function()
        {
			if (!sho.accounts.allowAuth()) { return; }

            this.data = {};
            this.sync('read');
        },

        sync:function(operation, data)
        {

            var th  = this,
                url = this.url_base + this.urls[operation]
            ;
            if(operation !== 'write')
            {
                $.ajax({
                    'url':url,
    				'dataType': 'json',
    				'cache':false, // force uncached request in IE
    				'success': (function(data, status, xhr) {
    					var callback = sho.string.camelize('on-'+operation);
                        th[callback](data);
    				})
    			})
			}
			else
			{
			    $.post(url, data, function(xhr){
			        th.onAuthenticate(xhr);
			    })
			    .fail(function(){
			        th.trigger('authenticate:error', {
                        'message' : 'A server error has occurred'
                    })
			    })
			}

        },

        extractUser:function(xhr)
        {
            this.data = xhr.data.user ? _.extend({'isAuthenticated':true}, xhr.data.user) : {};
            this.cookieUserState();
        },

        onRead : function(xhr)
        {
            this.extractUser(xhr);
            this.trigger('loaded', this.data);
            this.isAuthenticated() && this.trigger('loaded:authenticated', this.data);
        },

        onDestroy:function(xhr)
        {
            this.data = {};
            this.cookieUserState();
            this.trigger('logout:success');
        },

        authenticate:function(cfg)
        {
            if( _.isEmpty(cfg.email) || _.isEmpty(cfg.password))
            {
                this.trigger('validation:error', {
                    'message' : 'Email and password are required'
                })
            }
            else {
                this.sync('write', {
                    'email' :  cfg.email,
                    'password': cfg.password,
                    '_spring_security_remember_me' : !!cfg.rememberMe
                })
            }
        },

        onAuthenticate:function(xhr)
        {
            this.extractUser(xhr);

            if(this.isAuthenticated())
            {
                this.trigger('authenticate:success', this.data);
            }
            else
            {
                this.trigger('authenticate:error', {
                    'message' : 'You have entered an invalid email or password'
                })
            }
        },

        logout:function()
        {
            this.trigger('logout:loading');
		    this.sync('destroy');
		    sho.analytics.getTracker().trackClick({
            	click : 'navigation:log out'
            });
        },

        trigger:function(eventName, e)
        {
			sho.dom.trigger('user:'+eventName, e);
        },

        reload:function()
        {
            this.sync('read');
        },

        muteGamificationNotifications:function()
        {
            sho.util.Cookies.write(this.gamificationNotificationCookieName, "false", 1825);
        },

        cookieUserState:function(property)
        {
            var th=this,
                method,
                value,
                getterMap = {
                    'isAuthenticated': 'authenticated',
                    'isGamified': 'is_gamified',
                    'isShowtimeSubscriber' : 'showtime_subscriber',
                    'getSubscriptions' : 'subscriptions',
                    'getGender':'gender'
                }
            ;
            _.each(getterMap, function(name,method){
                value =     th[method].call(th);
                th.setCookie(name, value)
            })
        },

        setCookie:function(property, value)
        {
            var c=  sho.util.Cookies,
                k=  'sho_user_'+property
            ;
            if(!_.contains([null,undefined], value) && (c.read(k) == value.toString()))
            {
            }
            else
            {
                c.write(k, value);

            }
        },

        getSubscriptions:function()
    	{
    	    return this.data.subscriptionIdSet
    	},

        hasSubscription:function(id)
        {
            return _.indexOf(this.getSubscriptions(), id) > -1;
        },

        getUserName:function(){
            return this.data.username
        },

        getGender:function(){
            var gender = this.data.gender, map = { 'F':'female', 'M':'male' };
            return !_.contains([undefined,null], gender) ?  map[gender] : null
        },

        isShowtimeSubscriber:function(){
            return this.data.subscribeToShowtime;
        },


        isAuthenticated:function(){
            return !!this.data.isAuthenticated
        },

        isGamified:function(){
            return this.data.isGamificationParticipant == 'YES';
        },

		getUserId:function() {
			return this.data.userId
		},

	    getEmail:function() {
			return this.data.email
		},

        getToken:function(key){
	        return (this.data.tokenMap) ? this.data.tokenMap[key] : null;
	    },

    	getLiveFyreToken:function() {
    		return this.getToken('socialize')
    	},

    	getGamificationToken:function(){
    	    return this.getToken('gamification')
    	},

        shouldShowNotifications:function() {
            if(this.isAuthenticated()) {
                if (this.data.isGamificationParticipant == "YES") return true;
                if (this.data.isGamificationParticipant == "NO") return false;
            }
            return !this.gamificationNotificationsMuted();
        },

        gamificationNotificationsMuted:function() {
            return ( sho.util.Cookies.read('GAMIFICATION_NOTIFICATIONS') == "false" );
        }
    })

    })(sho.$);

sho.loaded_modules['/lib/js/sho/accounts/user.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.accounts
     * namespace for accounts code
    **/

    !(function(context,$)
	{

		/**
		 * sho.accounts.getUser(function) -> object
	 	 * Provide singleton-style access to User object
	    **/
		context.getUser = (function(){
			if(!sho.accounts.userExists()){ sho.accounts._user_ = new sho.accounts.User(); }
            return sho.accounts._user_;
        });

        /**
         * sho.accounts#userExists() -> Boolean
         * utility method used in the singleton setup - returns true of a user instances already exists
        **/
        context.userExists = (function(){
            return !!(sho.accounts._user_);
        })

		/**
		 * each(Array, function) -> function
	 	 * Create static aliases for commonly used user object methods
		**/
        _.each(['isAuthenticated',
        'authenticate',
        'isShowtimeSubscriber',
        'isGamified',
        'isShowtimeSubscriber',
        'getUserName',
        'getGender',
        'getUserId',
        'getLiveFyreToken',
        'getGamificationToken',
        'getCurrentAvailablePoints',
        'shouldShowNotifications',
        'getSubscriptions',
        'hasSubscription'],
        function(method)
        {
                context[method] = (function(params){
                    return sho.accounts.getUser()[method](params);
                })
        });

		/**
		 * sho.accounts.login(function) -> Null
	 	 * Convenience alias to redirect user to login page
	 	 * previously, this would open the login modal (it's not really possible to log the user in via a method call)
	    **/
        context.login = (function()
        {
            window.location = "/sho/accounts/login";
        });

		/**
		 * sho.accounts.logout(function) -> Null
	 	 * Logout is async, must subcribe to logout event to make use of this
	    **/
        context.logout = (function(opts){
            if(!sho.accounts.isAuthenticated()) return true;
            else sho.accounts.getUser().logout();
        });

		/**
		 * sho.accounts.refresh(function) -> Null
	 	 * Invoke a reload of the user object (ie after logging in via portal)
		**/
        context.refresh = context.reload = (function(){
            if(sho.accounts.userExists()) sho.accounts.getUser().reload()
            else sho.accounts.getUser();
        });

		/**
		 * sho.accounts.allowAuth() -> Boolean
		 * returns true if authentication is supported in the environment.
	 	 * (we only allow authentication functionality and login link display on *.sho.com, localhost and 129.*.*.* and 10.0.2.2)
		**/
        context.allowAuth = (function(){
			var h = window.location.host,
			whitelist = /sho.com|localhost|^129\.\d+\.\d+\.\d|^10.0.2.2/,
			canAuth = whitelist.test(h);
			;
			return canAuth;
        });

		/**
		 * sho.dom.ready(function) -> Null
	 	 * On protected pages, listen for user logout event, and redirect user to home page when it occurs
		 * On protected pages, listen for user logout event, and redirect user to home page when it occurs
		 * Protected pages have the following meta element: <meta name="spring-protected-page" content="true" />
		**/
       	sho.dom.ready(function()
       	{
       		if( _.any($('meta[name=spring-protected-page][content=true]')))
       	    {
       	        sho.dom.bind("user:logout:success", function(){
       				 window.location = "/sho/home"
       			});
       	    }

			/**
 			 * check for auto-pop of accounts modal
			**/
       	    var l = window.location.toString(), h = window.location.hash.toString();
       	    if(h.length && h.indexOf('/login') > -1) {
       	         sho.accounts.login();
       	    }
        });

        /**
         * sho.accounts.guid() -> String
         * Returns a unique string that bears some resemblence to a guid, for example: "8f15c6d7-e372-ea69-4c83-1e765a0f0582"
         * http://note19.com/2007/05/27/javascript-guid-generator/
        **/
        var S4 = function(){
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
        }
        context.guid = (function(){
            return 'ANONYMOUS_'+ (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        })

	})(sho.accounts, sho.$);

sho.loaded_modules['/lib/js/sho/accounts/base.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.accounts.nitro
     * Namespace for integration points with BunchBall, a vendor that provides gamification services via the Nitro platform.
    **/

    sho.provide('sho.accounts.nitro');


	sho.accounts.nitro.Notifications = function($,nitro)
	{
	    var nitro_events_for_opt_in_notifications = [
	          'photogallery_launch',
	          'socialize_post',
	          'content_share',
	  		'twitter_follow',
	  		'facebook_like',
	  		'video_complete_promo',
	  		'video_complete_episode'
	    ];

	    var tags_for_opt_in_notifications = [
	          'seriesId:323',
	          'seriesId:804',
	          'seriesId:1003223'
	    ];

	    var nitro_action_event = 'nitro:action';

	    var notification_interval = 5000;

	    var opt_in_notification_name = "Sho www - Opt In";

	    function init()
	    {
	          var isActive = true;
	          window.onfocus = function(){ isActive = true; };
	          window.onblur = function(){ isActive = false; };

	          if(sho.env.platform().key != 'desktop') { return; }

	          var instance = sho.accounts.nitro.getInstance();

	          sho.dom.bind(nitro_action_event, (function(event, call){

	              if(sho.accounts.isGamified() || !call.tags || $('.nitro-notify').length > 0) { return; }

	              var tagsArray = call.tags.split(',');

	              _.each(tagsArray, function(eventName){
	                  if ($.inArray(eventName, nitro_events_for_opt_in_notifications) >= 0) {
	                      _.each(tagsArray, function(eventName){
	                          if ($.inArray(eventName, tags_for_opt_in_notifications) >= 0 && !!sho.accounts.shouldShowNotifications()) {
	                              instance.nitro.showNotificationsByName(opt_in_notification_name);
	                          }
	                      });
	                  }
	              });

	          }));

	          if(!!sho.accounts.isGamified())
	          {
	              if(sho.gamify && sho.gamify.disable_notification_loop) return;

	              var notifier = setInterval(function() {
	                  if(isActive) { instance.showPendingNotifications(); }
	              }, notification_interval);
	          }

	    }

	 return {
	       'init' : init
	 }

	}(sho.$, sho.accounts.nitro.getInstance)


sho.loaded_modules['/lib/js/sho/accounts/nitro/notifications.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * class sho.accounts.nitro.Connection
     * Wrapper around nitro connection (Bunchball integration point).
    **/

    sho.accounts.nitro.Connection = klass({

        _KLASS_ : 'sho.accounts.nitro.Connection',

        unauthenticated_user : {
            'id':'shotestuser'
        },

        callbacks : [],


        cfg : {
            'apiKey':'b5b18ae6c9894ccc9ab4bd45736a6e96',
            'debug':false   /* if set to true, we get a "Invalid Error: ts" alert when security is set to medium */
        },

        cfg_host : {
            'DEVELOPMENT' : {
                'server':"http://sandbox.bunchball.net/nitro/json/"
            },
            'PRODUCTION' : {
                'server':"http://showtime.nitro.bunchball.net/nitro/json/"
            },
        },

        notifer : null,
        notification_interval : 5000,


        /**
         * new sho.accounts.nitro.Connection(cfg)
         * creates a new connection instance. In practice, this method is not called directly,
         * instead, we use the singleton-style accessor defined in statics.
        **/
        initialize:function(cfg)
        {
            if(typeof Nitro === 'undefined') {
                return;
            }

            this.setInitalMetaData(cfg.metadata);

            this.setUser(cfg.user);


            _.extend(this.cfg,
                this.cfg_host[( /LIVE|POSTING/.test(sho.env.serverName()) ? 'PRODUCTION' : 'DEVELOPMENT')],
                {
                    'metadata' : _.extend(this.metadata, cfg.metadata || {})
                }
            );

            this.nitro = new Nitro(this.cfg);
            if(this.noisy_logging || sho.accounts.nitro.noisy_logging) console.log('|nitro| created connection. user=`'+this.cfg.userId+'` ');

            _.delay(function(){
                sho.dom.trigger('nitro:init') }, sho.dom.REDRAW_DELAY_);

        },

        /**
         * sho.accounts.nitro.Connection#setUser(user) -> Null
         * Sets the user object that is associated with the Nitro Connection. _
         * If you supply null or false, no action is taken and anonymous user will be set on the Nitro side.
         * Was: If you supply null or false, sho.accounts.nitro.Connection.unauthenticated_user is used instead.
        **/
        setUser:function(user)
        {

            if(user && user.isGamificationParticipant == 'YES')
            {
                this.user = user;
                this.cfg.userId = user.id
            }
            else
            {
                this.user = null;
                this.cfg.userId = null;
            }
            this.cfg.sessionKey = false
        },

        /**
         * sho.accounts.nitro.Connection#callAPI(config, callback, scope) -> Null
         * make a Nitro API call and supply a callback
        **/
        callAPI:function(cfg, callback, scope)
        {
            if(!_.isObject(cfg)) throw new Error('Passing string params to nitro.callAPI is deprecated. Use a cfg object');

            var callback = callback || cfg.callback,
                scope = scope || cfg.scope || window
            ;
            this.callbacks.push({
                'target' : scope,
                'method' : (typeof callback == 'string' ? scope[callback] : callback) || sho.emptyFunction,
                'token' : this.timeStamp()
            });

            var method =    cfg.method,     // 'user.logAction'
                tags =      cfg.tags,       // 'page_view'
                meta =      cfg.metadata,   // 'seriesId:323,category:series' or {'seriesId:323','category':'series'}
                metadata,
                metadataStr,
                call,
                callStr
            ;
            metadata = _.isString(meta) ? sho.accounts.nitro.parseMetaStr(meta) : meta;

            metadata = cfg.inherit_metadata +'' !== 'false' ? _.extend({}, this.metadata, metadata) : metadata;

            call = _.omit(cfg, 'callback','scope','inherit_metadata','include_metadata','include_tags','tags','metadata','only_if_gamified');

            if(cfg.include_metadata) call.metadata = this.metadataStr(metadata)

            if(cfg.include_tags && cfg.include_metadata)  call.tags = tags + ',' + call.metadata;
            if(cfg.include_tags && !cfg.include_metadata) call.tags = tags;

            sho.dom.trigger('nitro:action', call);


            callStr = sho.object.toQueryString(call, false);

            if(this.nitro)
			{
				if(cfg.only_if_gamified && !sho.accounts.isGamified())
				{
					return false;
				}
				else
            	{
	                this.nitro.callAPI(callStr, "sho.accounts.nitro.processResult", _(this.callbacks).last().token);

	                if(this.noisy_logging || sho.accounts.nitro.noisy_logging)
	                {
	                    console.log("\n"+'|nitro| callAPI[method=`'+ cfg.method +'` include_tags=`'+!!cfg.include_tags+'`, include_metadata=`'+ !!cfg.include_metadata + '`] ' + "\n" + callStr)
	                }
				}
            }
        },


        /**
         * sho.accounts.nitro.Connection#logAction(tags) -> Null
         * Alias for callAPI({'method':'user.logAction'}), with the config option to include tags+metadata set to true
         * We will swap this out for user.clientLogAction which is the method that must be used in the mixed-security model,
         * however, before doing so, note that all the actions must have low-security checked in the console.
        **/
        logAction:function(cfg, callback, scope)
        {
            cfg.method = 'user.logAction';
            cfg.include_tags = true;
            cfg.include_metadata = true
			cfg.only_if_gamified = true;
            this.callAPI(cfg, callback, scope);
        },

        clientLogAction:function(cfg, callback, scope)
        {
            cfg.method = 'user.clientLogAction';
            cfg.include_tags = true;
            cfg.include_metadata = true;
            this.callAPI(cfg, callback, scope);
        },


        /**
         * sho.accounts.nitro.Connection#processResult(data, token) -> Null
         * Global callback handler for the response coming back from Nitro. Delegates to the registered callback for the api request.
        **/
        processResult:function(data, token)
        {
            var c,i=this.callbacks.length;
            while(i--)
            {
                c = this.callbacks[i]; if(token == c.token) // token match!
                {
                    c.method.call(c.target, data);   // invoke the callback.. should we dig down into data.Nitro for the client?
                    this.callbacks.splice(i,1);      // remove callack from list
                    break;
                }

            }
        },



        showPendingNotifications:function()
        {
            this.nitro.showPendingNotifications()
        },

        showNotificationsByName:function(name)
        {
            this.nitro.showNotificationsByName(name)
        },

        /**
         * sho.accounts.nitro.Connection#getUserId(callback, scope) -> Null
         * request the userId associated with the Nitro connection.
        **/
        getUserId:function(callback)
        {
            this.nitro.getUserId(callback);
        },

        /**
         * sho.accounts.nitro.Connection#timeStamp() -> String
         * returns a timestamp in the form of number of seconds since unix epoch.
        **/
        timeStamp:function()
        {
            return new Date().getTime() + ""
        },

        /**
         * sho.accounts.nitro.Connection#setInitalMetaData() -> Null
         * Populate the default/baseline metadata that will be passed along with all Nitro API requests
        **/
        setInitalMetaData:function(cfg)
        {
            this.metadata = _.extend({}, {
                'platform' : sho.env.platform().key,
                'product' : 'shocom'
            },
            sho.accounts.nitro.parseMeta(),
            (cfg || {})
            )
        },

        /**
         * sho.accounts.nitro.Connection#setMetaData(object) -> Null
         * Set the metadata that will be passed along with all Nitro API requests
        **/
        setMetaData:function(m)
        {
            _.extend(this.metadata, m || {});
        },

        /**
         * sho.accounts.nitro.Connection#setMetaData(object) -> Null
         * Get a copy of the metadata that will be passed along with all Nitro API requests
        **/
        getMetaData:function()
        {
            return this.metadata;
        },

        /**
         * sho.accounts.nitro.Connection#metadataStr(meta) -> Null
         * Utility method for converting the metadata hash to the format Nitro expects
        **/
        metadataStr:function(meta)
        {
            return _.collect((meta || this.metadata), function(val,key){
                return key+':'+val;
            }).join(',')
        }

    });

sho.loaded_modules['/lib/js/sho/accounts/nitro/connection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    (function(context,$)
    {
        var meta_props = 'series-id season-number episode-number title-id category'.split(' '),

        /**
         * sho.accounts.nitro.getInstance(cfg) -> Klass
         * Singleton-style constructor for the nitro connection. Aliased as nitro() internally, as a convenience.
        **/
        nitro = context.getInstance = function(cfg)
        {
			if(!sho.accounts.allowAuth()) { return; }

            var k = '_nitro_connection_';

            if(!sho.accounts.nitro[k]){ sho.accounts.nitro[k] = new sho.accounts.nitro.Connection(cfg || {}); }
            return sho.accounts.nitro[k]
        }
        ;
        _.extend(context, {
            /**
             * sho.accounts.nitro.hasInstance
             * returns true if the nitro connection has been created
            **/
            'hasInstance' : (function(){
                return !!sho.accounts.nitro['_nitro_connection_'];
            }),

            /**
             * sho.accounts.nitro.anonymous_user_id = 'NITRO_showtime_anon_user'
             * the anonymous user id that is used to keep achievements from showing up in the gallery,
             * for users that haven't opted in to gamification
            **/
            'anonymous_user_id' : 'NITRO_showtime_anon_user',

            /**
             * sho.accounts.nitro.callAPI(params,callback,scope) -> Null
             * Convenience method for getting an instance of sho.accounts.nitro.Connection and invoking callAPI on it.
            **/
            'callAPI' : (function(params, callback, scope){
                nitro().callAPI(params, callback, scope);
            }),

            /**
             * sho.accounts.nitro.processResult(data,token) -> Null
             * Static callback for Nitro API call response.
             * Proxies the response over to the instance of sho.accounts.nitro.Connection.
            **/
            'processResult' : (function(data, token){
                nitro().processResult(data, token);
            }),

            /**
             * sho.accounts.nitro.parseMeta() -> Object
             * Iterate over all meta-tags that are found in the format `<meta name="nitro-[key]" />`,
             * and build up an object of key value pairs
            **/
            'parseMeta' : (function()
            {
                return _.inject(context.metaTags(), function(tag,el)
                {
                    var name = $(el).attr('name').split('nitro-')[1], // IE didn't like split on regex (was string.split(/^nitro-/))
                        val =  $(el).attr('content'),
                        key = sho.string.camelize(name)
                    ;
                    tag[key] = val; return tag;

                }, {})

            }),

            /**
             * sho.accounts.nitro.parseMetaStr() -> Object
             * Parse a colon-deliminated meta string in the format 'seriesId:323,seasonNumber:1'
             * and build up an object of key value pairs
            **/
            'parseMetaStr' : (function(str)
            {
                return _.inject((str||'').split(','), function(tag,pair)
                {
                    var key,val,matches = pair.match(/\s*([^:]+):([^:]+)\s*/);
                    if(!matches) return tag;

                    key = matches[1]; val = matches[2];
                    tag[key] = val; return tag;

                }, {});
            }),

            /**
             * sho.accounts.nitro.metaTags() -> WrapperSet
             * Returns a wrapper set of metatag elements that have the 'nitro-' prefix.
            **/
            'metaTags' : (function(){
                return $( _.collect(meta_props, function(p){
                    return 'meta[name=nitro-'+p+']';
                }).join(','))
            }),

            /**
             * sho.accounts.nitro.isGamified() -> Boolean
             * Returns true if the user has opted in to the gamification program
            **/
            'isGamified' : (function(){
                return sho.accounts.isGamified()
            }),

            /**
             * sho.accounts.nitro.getPointsBalance() -> Object
             * Returns the points balance associated with user (literally, the contents of the gamification object nested inside the user JSON in memory)
            **/
            'getPointsBalance' : (function(){
                var user =  sho.accounts.getUser().data,
                    data =  user.gamification || {},
                    pts =   data.pointsBalance || {
                        'lifetimeBalance' : 0,
                        'points' : 0
                    }
                ;
                return pts
            }),

            /**
             * sho.accounts.nitro.getCurrentPointsBalance() -> Number
             * Returns the current points  associated with user
            **/
            'getCurrentPointsBalance' : (function(){
                return sho.accounts.nitro.getPointsBalance().points
            }),

            /**
             * sho.accounts.nitro.getLifetimePointsBalance() -> Number
             * Returns the lifetime points  associated with user
            **/
            'getLifetimePointsBalance' : (function(){
                return sho.accounts.nitro.getPointsBalance().lifetimeBalance
            })
        })


    })(sho.accounts.nitro, sho.$)


sho.loaded_modules['/lib/js/sho/accounts/nitro/statics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !(function(nitro,workspace)
    {
        workspace.noisy_logging = true;
        var nitro_events = {

            'user:register': 				        'profile_register',
            'user:newsletter:subscribe':            'profile_newsletters',
           	'user:interest': 						'profile_interests',
			'user:profile:about':		 			'profile_about',
			'user:profile:avatar': 					'profile_avatar',
			'user:profile:location': 				'profile_location',
			'user:profile:update':                  'profile_update',

            'photogallery:opened':                  'photogallery_launch',
            'photogallery:image:viewed':            'photogallery_view',

            'socialize:post':                       'socialize_post',
            'content:shared':                       'content_share',
    		'twitter:follow':                       'twitter_follow',

    		'order:coupon_redeem':			        'order-coupon_redeem',

    		'game:started':                         'game_start',
    		'game:ended':                           'game_score',

    		'searchbox:submitted':                  'site_search'

        };

        var genericCallback = (function(xhr){
           if(sho.accounts.nitro.noisy_logging) console.log(JSON.stringify(xhr))
        });




        var isFollow = (function(url){
            return /(http|https):\/\/www.facebook.com/.test(url);
        }),

        isVideo = (function(url){
            return /\/sho\/video\/titles/.test(url);
        });


        sho.dom.bind('facebook:like', function(e,url){

            log('|facebook:like| url='+url+' isFollow='+isFollow(url) +' isVideo='+isVideo(url));

            if(isVideo(url))    sho.dom.trigger('video_player:facebook:like');
            else                nitro().logAction({ 'tags': (isFollow(url) ? 'facebook_like':'content_share') });
        })


        sho.dom.bind('twitter:tweet', function(e,twittrEvent){

            log(twittrEvent);
            log(twittrEvent.target);
            log(twittrEvent.target && twittrEvent.target.src);

            var src = unescape(twittrEvent.target.src + ''),
                url = /&url=(.+)/.test(src) ? src.split('&url=')[1] : ''
            ;

            log('|twitter:tweet| url='+url+' isVideo='+isVideo(url));

            if(isVideo(url))    sho.dom.trigger('video_player:twitter:tweet');
            else                nitro().logAction({ 'tags': 'content_share' });
        })

        sho.dom.bind('google:plus_one:on', function(e,data){

            var url = data.href;

            log('|google:plus_one:on| url='+ url+' isVideo='+isVideo(url));

            if(isVideo(url))    sho.dom.trigger('video_player:google:plus_on:on')
            else                nitro().logAction({ 'tags': 'content_share' })
        })



        workspace['logVideoAction'] = function(tags)
        {
            if(!sho.video.playerExists()) return; // not likely, except in console-driven tests
            var model = (sho.video.getModel()),
            type =      (model.isFullEpisode() ? 'episode' : 'promo'),
            tags =      (/video_(watch|complete)/.test(tags) ? (tags + '_' + type) : tags),
            call =      {
                'tags' : tags,
                'metadata' : {}
            };

            _.each(['seriesId','seasonNumber','episodeId','id'], function(k)
            {
                var method = sho.string.toMethodName('get-video-'+k);
                var value = model[method].call(model);
                k = k == 'episodeId' ? 'titleId' : k; // rename to Nitro's liking...
                k = k == 'id' ? 'videoId' : k; // rename to Nitro's liking...
                if(!!value) call.metadata[k]=value;
            })

            workspace.deferredLogAction(call);
        }



    })(sho.accounts.nitro.getInstance, sho.accounts.nitro)

sho.loaded_modules['/lib/js/sho/accounts/nitro/actions.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/accounts/nitro.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.provide('sho.accounts.email');


    sho.provide('sho.accounts.email.signupwidget');


    !function($)
    {

    sho.accounts.email.signupwidget.UNDERAGE_COOKIE_KEY = 'SHO_UNDERAGE_USER';

    sho.accounts.email.signupwidget.Model = Backbone.Model.extend({

        '_KLASS_' : 'sho.accounts.email.signupwidget.Model',

        attributes : {
            'pubAttrId' :           null,   // 2
            'pubTitle':         null,   // 'Homeland'
            'state' :           null,   // 'init

            'email':            null,   // "oil@gang.com"

            'birthdateDate':    null,   // "26"
            'birthdateMonth':   null,   // "12"
            'birthdateYear':    null,   // "1969"
            'acceptsTerms':     null    // 'on'/true
        },

        statics : {
            'termsUrl':         '/sho/about/terms',
            'privacyUrl':       '/sho/about/privacy',
			'videoServicesUrl': '/sho/about/video-services'

        },

        validates_presence_of : {
            'email':			'Please enter an email',
            'pubAttrId':        'Pub Attribute Id can\'t be blank',
            'birthdateDate':	'Please enter a birthdate',
            'birthdateMonth':	'Please enter a birthdate',
            'birthdateYear': 	'Please enter a birthdate',
            'acceptsTerms': 	'Please accept the Terms and Conditions'
        },

        validates_format_of : {


            'email':			(function(email){
                if( !/@/.test(email)    ||
                    /^@/.test(email)    ||
                    /@$/.test(email)    ||
                    ((email || '').split('@').length > 2) ||
                    !sho.number.isInRange(email.length,3,256)
                ) return false;
                  return true;
            }),
            'birthdateDate':	/\b\d{1,2}\b/,      // birthdate helper function will normalize '1' as '01' here
            'birthdateMonth':	/\b\d{1,2}\b/,      // ..
            'birthdateYear': 	/\b\d{4}\b/         // must supply 4 digit year
        },

        error_list_order : ['all','email','birthdate','acceptsTerms'],

        url : '/api/accounts/newsletter/subscription',


        initialize:function()
        {
            _.extend(this, {
                'fn': {
                    'onSend' :  _.bind(this.onSend, this),

                    'onError':  _.bind(this.onSend, this, {
                        'success' : false,
                        'responseString' : 'A server error has occurred'
                    })
                }
            });

            this.set(this.statics, {silent:true});

            log('|model| id:'+this.get('pubAttrId')+ ' title:'+this.get('pubTitle'));
        },

        init:function()
        {
            var state;

            if(sho.accounts.isAuthenticated())
            {
                if(sho.accounts.hasSubscription(this.get('pubAttrId')))
                {
                    state = 'subscribed';
                }
                else
                {
                    this.removeValidation()
                    state = 'authenticated';
                }
            }
            else
            {
                if(!this.isUnderage())
                {
                    state = 'form';
                }
                else
                {
                    state = 'hidden';
                }
           }

           this.attributes.state = state;

           this.trigger('ready', {attributes:this.attributes});
        },

        removeValidation:function()
        {
            this.validates_presence_of = {};
            this.validates_format_of = {};


        },


        validate__:function(attrs)
        {
            var th=this,
                errors=[],
                isEmpty = (function(v){
                    return v == '' || v == undefined ;
                })
            ;

            _.each(this.validates_presence_of, function(message,field){
                if(isEmpty(attrs[field]))
                {
                    errors.push({
                        'field'   : field,
                        'message' : message || 'This can\'t be blank'
                    })
                }
            });

            _.each(this.validates_format_of, function(format,field){

                var isFormatted = _.isFunction(format) ? format : (function(v){
                    return format.test(v)
                });

                if(!isEmpty(attrs[field]) && !isFormatted(attrs[field]))
                {
                    errors.push({
                        'field'   : field,
                        'message' : 'Please enter a valid ' +field
                    })
                }

            });


            if(errors.length) log('|signupwidget| validate failed: '+errors.length+' fields were impromperly formatted or blank');
            if(errors.length) return this.formatErrors(errors);
        },

        formatErrors:function(raw)
        {
            var isBirthFieldError = (function(e){
                return /^birthdate/.test(e.field || '');
            }),

            errors =        _.reject(raw, isBirthFieldError),

            birthError =    _.find(raw, isBirthFieldError)

            if(birthError)  errors.push({'field':'birthdate','message': 'Please enter a valid birthdate' });

            return {
                'hasErrors' :   true,
                'list' :        this.sortErrorList(errors),
                'map' :         _.inject(errors, function(map,e){
                    map[e.field || 'all'] = e.message;
                    return map;
                }, {})
            }
        },

        sortErrorList:function(list)
        {
            var match, ordered = [];

            _.each(this.error_list_order, function(field){
                match = _.find(list, function(error){
                    return error.field == field
                });

                if(match) ordered.push(match)
            })
            return ordered;
        },


        send:function(form)
        {



            var errors,
                data={},
                isAnonymous = !sho.accounts.isAuthenticated()
            ,

            attrs = (isAnonymous ? form : {'email':sho.accounts.getUser().getEmail()});

            this.set(attrs, {silent:true});

            if(isAnonymous) data.birthdate = this.birthdate(attrs)

            _.extend(data, _.pick(this.attributes, ['pubAttrId','email']));

            errors = this.validate__(this.attributes);

            if(errors)
            {
                this.attributes.state = 'error';
                this.trigger('error', {'attributes':this.attributes}, errors)
            }

            else
            {
                this.set({'state':'loading'});
                log('|send| POST to '+this.url+'...');
                $.ajax({
                    'type':     'POST',
                    'url':      this.url,
                    'data':     data,
                    'success':  this.fn.onSend,
                    'error' :   this.fn.onError
                })
            }
        },



        onSend:function(xhr)
        {
            if(xhr.success)
            {
                this.set({'state':'success'});
            }
            else
            {
                if(xhr.responseString == 'User is under age')
                {
                    this.set({'state':'ineligible'});
                }
                else
                {
                    var msg = ( xhr.responseString ) ? xhr.responseString.replace('User has','You have') : xhr.errorType.itemList.item[0];
                    this.set({'state':'error'});
                    var errors= this.formatErrors([{
                        'field' : 'all',
                        'message' : msg
                    }]);

                    this.trigger('error',
                        {'attributes':this.attributes},
                        errors
                    );
                }
            }
        },


        reset:function(attrs)
        {
            this.clear();

            this.set(attrs);
            this.init()
        },

        birthdate:function(attrs)
        {
            var str = [attrs.birthdateMonth, attrs.birthdateDate, attrs.birthdateYear].join('/')
            return str !== '//' ? str : '';
        },

        isUnderage:function()
        {
            var c = sho.util.Cookies.read(sho.accounts.email.signupwidget.UNDERAGE_COOKIE_KEY);
            return c && c !== 'false'
        }



    });

    }(sho.$);

sho.loaded_modules['/lib/js/sho/accounts/email/signupwidget/model.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($)
    {

        sho.accounts.email.signupwidget.View = klass({

            '_KLASS_' : 'sho.accounts.email.signupwidget.View',

            strings : {

                'authenticated' : {
                    title:      'Keep up with {{pubTitle}}. Subscribe to email updates with one click.',
                    submit:     'Get Email Updates'
                },

                'form' :        {
                    title:      'Sign up for {{pubTitle}} email updates',
                    submit:     'Sign Up',
                    disclaimerText: ['',
						'I have read and agree to the <a href="{{termsUrl}}"> Terms of Use</a>, <a href="{{privacyUrl}}"> Privacy Policy</a>, ',
						'and <a href="{{videoServicesUrl}}">Video Services Policy</a>.',
						' I agree to receive updates, alerts and promotions from Showtime.',
					''].join('')
                },

                'success' :     {
                    title:      'Thank you for signing up for {{pubTitle}} email updates',
                    body:       'Check your inbox for the latest news, videos, sneak peeks, and more.'
                },

                'error' : {
                    title:      'Sign up for {{pubTitle}} email updates',
                    submit:     'Sign Up',
                },

                'ineligible' :        {
                    title:      'Sign up for {{pubTitle}} email updates',
                    body:       'We\'re sorry, but you are ineligible for registering on sho.com'
                }
            },

            templates : {

                'hidden' :  '',         // if underage cookie is found on startup, module is hidden
                'subscribed' :  '',     // if user is already suscribed to newsletter, module is hidden

                'loading' : ['',
                        '<div class="title"></div>',
                        '<div class="email-signup-widget__load-mask">Loading...</div>',
                ''].join(''),

                'authenticated' : ['',

                    '<div class="title">{{> title}}</div>',
                    '<form name="email-signup-widget-form"action="/api/accounts/newsletter/subscription" method="POST">',
                        '<input type="submit" class="btn submit" value="{{>submit}}">',
                    '</form>',

                ''].join(''),


                'form' : ['',
                    '<div class="title">{{> title}}</div>',
                    '<form name="email-signup-widget-form"action="/api/accounts/newsletter/subscription" method="POST">',
                    	'{{#errors.hasErrors}}',
                    		'<span class="label error-msg">',
    	                		'{{#errors.list}}',
    	                        '{{message}}<br />',
    	                        '{{/errors.list}}',
                        	'</span>',
                        '{{/errors.hasErrors}}',

                    	'<span class="label {{^errors.hasErrors}}label-top-spacer{{/errors.hasErrors}} {{#errors.map.email}}error{{/errors.map.email}}">Email</span>',
                        '<input class="input-box input-box-email{{#errors.map.email}} error-border{{/errors.map.email}}" type="email" name="email" placeholder="name@example.com" value="{{email}}">',

                        '<span class="label{{#errors.map.birthdate}} error{{/errors.map.birthdate}}">Date of Birth</span>',
                        '<div class="email-signup-dob-wrapper group">',
                        '<div class="dob-select-wrapper">',
                    	'<select class="dob-select{{#errors.map.birthdate}} error-border{{/errors.map.birthdate}}" name="birthdate_month">',
                    		'<option>MM</option>',
							'{{#getSelectMonth}}{{birthdateMonth}}{{/getSelectMonth}}',
                    	'</select>',
                        '</div>',
                        '<div class="dob-select-wrapper dob-select-middle">',
                    	'<select class="dob-select {{#errors.map.birthdate}} error-border{{/errors.map.birthdate}}" name="birthdate_date">',
							'<option>DD</option>',
							'{{#getSelectDate}}',
								'{{birthdateDate}}',
							'{{/getSelectDate}}',
						'</select>',
                        '</div>',
                        '<div class="dob-select-wrapper">',
                    	'<select class = "dob-select select-yyyy {{#errors.map.birthdate}} error-border{{/errors.map.birthdate}}" name="birthdate_year">',
							'<option>YYYY</option>',
							'{{#getSelectYear}}',
								'{{birthdateYear}}',
							'{{/getSelectYear}}',
						'</select>',
                        '</div>',
                        '</div>',
                        '<span class="checkterms-wrapper">',

                            '<span class="check {{#acceptsTerms}}checked{{/acceptsTerms}} {{#errors.map.acceptsTerms}} has-error{{/errors.map.acceptsTerms}}">',
                                '<input class="check-box" type="checkbox" name="accepts_terms" {{#acceptsTerms}}checked{{/acceptsTerms}}>',
                            '</span>',
                            '<span class="terms">{{> disclaimerText}} </span>',
                        '</span>',

                        '<input type="submit" class="btn submit clear" value="{{> submit}}">',
                    '</form>',

                ''].join(''),

                'success' :     ['',

                    '<div class="title">{{> title}}</div>',
                    '<span class="body">{{> body}}</span>',

                ''].join(''),

                'ineligible' :  ['',
                    '<div class="title">{{ > title}}</div>',
                    '<span class="body error">{{> body}}</span>',
                ''].join(''),

                'error' :       null // we alias form as error below

            },

            'section_header' : '<h3 class="section-header gradient">Email Sign Up</h3>',

            initialize : function(cfg)
            {
                _.extend(this, {
                    'model' : cfg.model,
                    'controller' : cfg.controller,
                    'container' : $(cfg.container),
					'includeHeader' : cfg.includeHeader,
                    'fn' : {
                        'update' :  _.bind(this.update, this),
                        'onSubmit' : _.bind(this.onSubmit, this),
                        'toggleCheck' : _.bind(this.toggleCheck, this)

                    }
                })

                this.templates.error = this.templates.form;
                this.strings.error =   this.strings.form;
                this.container.html('');
                this.setHandlers();
				window.view=this;
            },

            setHandlers:function()
            {
                this.model.bind('all', this.fn.update);
                this.container.on('click',' .submit', this.fn.onSubmit);
                this.container.on((sho.env.isDesktop() ? 'click':'tap'),' .check',  this.fn.toggleCheck)
            },

            update:function(eventName, e, errors)
            {

                if(eventName.match(/change:state|ready|error/))
                {
                    var attrs = _.extend({}, e.attributes, {'errors': errors});
                    this.render(attrs);
                    this.controller.track(attrs.state)
                }
            },

			render : function(attrs)
            {


				log('|view| includeHeader? `'+this.includeHeader+'`');

                var output,

				year = new Date().getFullYear(),

				helpers = {
					getSelectMonth : _.bind(this.getSelect, this, 0, 12),
					getSelectDate  : _.bind(this.getSelect, this, 0, 31),
					getSelectYear  : _.bind(this.getSelect, this, year-100, year, true)
				},

				view =          this.templates[attrs.state],
                partials =      this.strings[attrs.state] || {},
				object = 		_.extend({}, attrs, helpers),
                html =          Mustache.to_html(view, object, partials)
				;
                if(!/subscribed|hidden/.test(attrs.state))
                {
                    output = ['',
                        ((!sho.env.isDesktop() && this.includeHeader) ? this.section_header : '' ),
                        '<div class="email-signup-widget-line"></div>',
                        '<div class="email-signup-widget-inner">',
                            html,
                        '</div>',
                    ''].join('')
                }
                else
                {
                    output = '';
                }

                this.container.html(output);
            },


			getSelect:function(start,end,reverse)
			{
				return function(text, render)
				{
					var value = 	Number(render(text)),
						daterange = _.range(start,end)
					;

					html = _.collect(daterange, function(i)
					{
						var date = i+1;
						return (['',
							'<option ', (value == date ? ' selected' : ''), ' value="', date, '">',
								(date+'').pad(2,'0'), // '2' -> '02'
							'</option>',
						''].join(''))
					});
					return (reverse ? html.reverse() : html).join('');
				}
			},

            onSubmit: function(e)
            {
                sho.dom.trap(e);
                this.model.send(this.formAttributes());
            },

            toggleCheck:function(e)
            {
                sho.dom.trap(e);
                var wrapper=   $(e.currentTarget),
                    el=        wrapper.find('input').get(0)
                ;
                el.checked = !el.checked;
                wrapper.toggleClass('checked');


            },

            formAttributes:function()
            {
                var th=this, el = this.container.find('form'),

                form = _.inject(el.serializeArray(), function(attrs, input){
                    var key =       sho.string.camelize(input.name); // birthdate_month => birthdateMonth
                    attrs[key] =    input.value;
                    return attrs
                },{});

                if(! _.has(form, 'acceptsTerms')) form.acceptsTerms = false; return form;
            }
        })

    }(sho.$);
sho.loaded_modules['/lib/js/sho/accounts/email/signupwidget/view.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($)
    {

        sho.accounts.email.signupwidget.Widget = klass({

            '_KLASS_' : 'sho.accounts.email.signupwidget.Widget',

            initialize : function(cfg)
            {
                _.extend(this, {
                    'pubTitle' : $(cfg.container).data('pub-title'),
                    'pubAttrId' :    $(cfg.container).data('pub-attr-id'),
					'includeHeader' : $(cfg.container).data('include-header')
                });

                this.model = new sho.accounts.email.signupwidget.Model({
                    'pubAttrId' : this.pubAttrId,
                    'pubTitle' : this.pubTitle
                });

                this.view = new sho.accounts.email.signupwidget.View({
					'includeHeader' : this.includeHeader,
                    'container' : cfg.container,
                    'model' : this.model,
                    'controller' : {
                        'track' : this.track
                    }
                });

                this.setHandlers();
                this.model.init();

            },

            track:function(state)
            {
                if (state != 'success') return;
                sho.analytics.getTracker().trackClick({
                    'click' : 'emailmod:'+state
                });
            },

            setHandlers:function()
            {
                var fn = _.bind(this.reset, this);
                sho.dom.bind('user:logout:success', fn);
                sho.dom.bind('user:authenticate:success', fn);
            },

            reset:function(e)
            {
                log('|widget| resetting for `'+e+'`');
                this.model.reset({
                    pubTitle: this.pubTitle,
                    pubAttrId : this.pubAttrId
                });
            }

        })

    }(sho.$);

    sho.accounts.email.SignUpWidget = sho.accounts.email.signupwidget.Widget;
sho.loaded_modules['/lib/js/sho/accounts/email/signupwidget/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/accounts/email/signupwidget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/accounts/email.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


	/**
     * sho.accounts
     * namespace for accounts code
    **/

	/**
	 * class sho.accounts.Utils
	**/
	sho.accounts.Utils = Class.create({

		/**
		 * sho.accounts.Utils._KLASS_ -> String
		**/

		_KLASS_ : 'sho.accounts.Utils',

		/**
		 * sho.accounts.Utils#birthdayInputHelper() -> null
		 * If an input field has more than the specified amount of characters, delete the extra characters on the 'blur' event.
		 * Clears the default value of a input on the 'focus' event
		**/
		birthdayInputHelper: function(){
			var inputs = $$('#DOB-fieldWrapper input'), placeVals= $w('MM DD YYYY');
			inputs.each(function(x,i){
				if(x.readAttribute('readonly') == 'readonly' || x.readAttribute('readonly') == 'true' || x.readAttribute('readonly') != null ) return

				x.observe('blur',function(e){	//keyup:  causing problems in Safari and FF
					if($F(x).length > 2 && i!= 2) {
						x.setValue($F(x).substr(0,2));
					} else x.setValue($F(x).substr(0,4));
				})
				if(sho.isIOS5()) {
					x.observe('focus', selectMe.bind(x));
				}
			});

			function selectMe(){
				var th = this;
				if(placeVals.any(function(pv){ return pv == th.readAttribute('placeholder')})) {
					th.clear();
				} else {
					(function() { th.select() }).defer();
				}
			}
		},

		/**
		 * sho.accounts.Utils#toggleProviderSelect() -> null
		 * in users/new and users/edit page, this funciton will toggle the visibility of the subscriber <select> pull down
		 * based on the 'yes' and 'no' radio button's value
		**/
		toggleProviderSelect: function()
		{
			var selectWrapper = $('tvProvider'), providerSelect = $('userSelectedProvider');
			if($$('input[name^="subscribeToShowtime"]')[0].getValue() == "true" ) {
				selectWrapper.show();
			} else selectWrapper.hide();

			var suscribeRadios = $$('input[name^="subscribeToShowtime"]').each(function(radio){
				radio.observe('click', function(e){
					if($F(this) == 'true') {
						selectWrapper.show()//appear()
					} else {
						selectWrapper.hide()//fade()
					}
				});
			});
		},
		/**
		 * sho.accounts.Utils#openSelectAvatarModal() -> null
		 * opens the sho avatar modal window
		**/
		openSelectAvatarModal: function(){
			var th = this;
			var chooseAvatarLinks = [ {ele: $('imgSelectAvatar')}, {ele: $('selectAvatar')}	].each(function(x){
				x.ele.observe('click',function(e){
					e.stop();
					sho.ui.modals.create({
					    'type' : 'avatar-modal'
					});
				});
			});
		},

		/**
		 * sho.accounts.Utils#showUploadAvatar() -> null
		 * toggles the visibility of the upload avatar file input
		**/
		showUploadAvatar: function(){
			var inputWrapper = $('custom-input-wrapper').show();
			var position;
			var addLink = $('addMyAvatar').observe('click', function(e){
				position = (inputWrapper.getStyle('top') ==  '0px') ? '-60px':'0px';
				inputWrapper.morph('top:'+ position +';',{
					duration: .3,
					propertyTransitions: { top: 'easeInOutBack' },
					before: function(){
						e.target.toggleClassName('subtract');
					}
				});
			});
		},

		/**
		 * sho.accounts.Utils#aboutUserErrorCSS() -> null
		 * adds error class to the wrapper element of the textarea for the about section
		**/
		aboutUserErrorCSS: function(){
			var child, parent;
			child = $$('.textAreaPadding')[0].down('textarea'); parent = child.up('.textAreaPadding');
			if(child.hasClassName('error')) {child.removeClassName('error'); parent.addClassName('error')
			} else if(!child.hasClassName('error') && parent.hasClassName('error')) parent.removeClassName('error')
		}

	});


sho.loaded_modules['/lib/js/sho/accounts/utils.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	/**
     * sho.accounts
     * namespace for accounts code
    **/

	/**
	 *  class sho.accounts.AvatarModal < sho.ui.modals.Base
	 *  Builds and adds handlers for the avatar model in a user's profile: create and update page
	 **/
	sho.accounts.AvatarModal = Class.create(sho.ui.modals.Base, {

		_KLASS_ : 'sho.accounts.AvatarModal',

		avatarContainer: new Template(
			'<div id="chooseAvatarModal" class="act_inner">'+
				'<div class="avatar_wrapper" id="slider1">#{ul_slices}</div>'+
				'<section>'+
					'<a class="button" rel="cancel">cancel</a>'+
					'<a class="button" rel="okay">okay</a>'+
					'<p id="avatarName"></p>'+
					'<p id="avatarSelectionMsg"></p>'+
					'<div id="avatar_pagination"></div>'+
				'</section>'+
			'</div>'),

		avatarList: new Template('<ul>#{li}</ul>'),

		avatarTemplate : new Template('<li id="#{id}" path="#{path}" title="#{label}"><img src="#{path}" width="50" height="50" alt="#{label}" /></li>'),

		pageLinks: new Template('<li><a href="\##{pgNum}">#{pgNum}</a></li>'),

		avatar_json_url :  '/rest/accounts/avatars',

		data: null,

		currentSelection: null,

		current_selected_ID: null,

		dimensions: null,

		defaults: {
			height: 253,
			width: 590,
			title: 'Select an Avatar',
			content: '<p class="loading">Loading...</p>'
		},

		loadAvatarJSON: function(){
			var req = new Ajax.Request( this.avatar_json_url, {
			  method: 'get',
			  onSuccess: this.onAvatarDataLoad.bind(this)
			});
		},

		onAvatarDataLoad: function(transport) {
			var th=this;
		    this.data = Object.values(transport.responseText.evalJSON()); if(!this.data.length) return;
		    var avatars = this.data[0].pluck('imageSize_50').flatten(); if(!avatars.length) return;
			var pageNumber = [];
			var list = avatars.eachSlice(27,function(slice){
				return slice.collect(function(li){
					return th.avatarTemplate.evaluate(li)
				})
			}).collect(function(uls){
				return th.avatarList.evaluate({li: uls})
			}).join('').replace(/,/g, '');

			this.setContent(this.avatarContainer.evaluate({ul_slices: list, pageLinks: pageNumber.join('')}));
			this.getModalElements();

			$j('#slider1').bxSlider({
				infiniteLoop: false,
				controls: false,
				pager: true,
				pagerSelector: $j('#avatar_pagination'),
				pagerActiveClass: 'currentPg'
			});
		},

		refresh: function($super){
			$super();
			this.loadAvatarJSON();
		},

		update:function($super, e){
			$super(e); // for standard modal events ie close and body click
            if(e.eventName == 'modal:click') this.avatarClickHandler(e.event.findElement('li'));
			if(e.eventName == 'modal:hover') this.avatarHoverHandler(e.event.findElement('li'));
        },

		avatarClickHandler: function(li){
			if(!li) return
			if(this.currentSelection) this.currentSelection.removeClassName('selected');
			li.addClassName('selected');
			this.current_selected_ID = li.readAttribute('id');
			this.newPath = li.readAttribute('path');
			this.currentSelection = li;
			this.avatarName.update(li.readAttribute('title')).morph('opacity:50',{
				transition: 'easeInOutExpo',
				duration: 1
			});
			if(!this.message.empty()) this.message.fade();
		},

		avatarHoverHandler: function(li){
			if(!li) return;
			if(li.readAttribute('title') != null) var title = li.readAttribute('title');
			this.avatarName.update(title).morph('opacity:50',{
				transition: 'easeInOutExpo',
				duration: 1
			});
		},

		getModalElements: function(){
			var th = this;
			if(!($('avatarName')) || !($('avatarSelectionMsg')) || !($('avatarId'))) return;
			this.avatarName = $('avatarName');
			this.message = $('avatarSelectionMsg');
			this.hiddenInput = $('avatarId');
			this.profileAvatar = $('myAvatar');
			this.currentAvatarId = this.profileAvatar.readAttribute('rel');
			this.defaultPath = this.profileAvatar.readAttribute('src');
			this.list = $$('#chooseAvatarModal ul li');
			this.cancelBtn = $$('.button[rel^="cancel"]')[0].observe('click',function(){
				th.close();
			});
			this.okBtn = $$('.button[rel^="okay"]')[0].observe('click',function(e){
				e.stop();
				if(th.newPath != undefined) {
					th.profileAvatar.writeAttribute('src', th.newPath);
					if(th.current_selected_ID != null) th.hiddenInput.writeAttribute('value', th.current_selected_ID);
					th.close();
				} else {
					th.message.update('You have not selected an avatar.');
					th.message.appear();
				}
			});
		}

	});


sho.loaded_modules['/lib/js/sho/accounts/avatarmodal.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


	/**
     * sho
     * top-level namespace
    **/

	/**
	 * sho.accounts.nitroTagger(jQuery) -> functions
	 * Collection of functions to tag pages and events in accounts using the Nitro API
	**/
	sho.accounts.nitroTagger = function($)
	{

		/**
		 * sho.accounts.nitroTagger#init() -> null
		 * Initialize function that calls the addEventHandlers() method
		**/
		function initialize(){
			addEventHandlers();
		}

		function addEventHandlers(){
		}

		/**
		 * sho.accounts.nitroTagger.tagNewsLetter() -> null
		 * If the user has checked any of the newsletters, Nitro tags will be added for each newsletter
		**/
		function tagNewsLetter(){
			var seriesId;
			var checkboxes = $$('input[name^="userSelectedNewsletters"]').filter(function(i){
				return i.checked;
			}).each(function(index){
				seriesId = $(index).attr('data-series-id') || 0;
				sho.accounts.nitro.getInstance().logAction({'tags':'profile_newsletters','metadata':'seriesId:'+seriesId})
			});
		}

		/**
		 * sho.accounts.nitroTagger.tagProfileUpdate() -> null
		 * If the user has filled in any of the profile fields or chosen an avatar, Nitro tags will be added for updating the profile
		**/
		function tagProfileUpdate(event){
			if($('#about').length > 0) if($('#about').val().length >=1) sho.dom.trigger('user:profile:about');
			if($('#location').length > 0) if($('#location').val().length > 2) sho.dom.trigger('user:profile:location');
			if($('#avatarId').length > 0) if($('#avatarId').val() != "" || $F($$('input[name^="customAvatar"]')[0]).length > 0) sho.dom.trigger('user:profile:avatar');
		}

		/**
		 * sho.accounts.nitroTagger.tagRegistration() -> null
		 * When the user has completed the registration process, Nitro tags will be added for registration
		 * If the user has subscribed to any newsletters, Nitro tags will be added for newsletter subscription
		 * Note: registration is also considered a profile update, so Nitro tags will also be added for profile update upon registration
		**/
		function tagRegistration(c){
			if(c.has_newsletters && c.send_emails) sho.dom.trigger('user:newsletter:subscribe');
			if(c.has_location) sho.dom.trigger('user:profile:location');
			if(c.has_avatar) sho.dom.trigger('user:profile:avatar');
			if(c.has_about) sho.dom.trigger('user:profile:about');
			sho.dom.trigger('user:register');
			sho.dom.trigger('user:login:success');
		}

		function tagLogin(){
			sho.dom.trigger('user:login:success');
		}

		return {
			init: initialize,
			tagRegistration: tagRegistration,
			tagLogin: tagLogin
		}

	}(sho.$)




	/**
	 * sho.accounts.nitroTagger#tagRegistration({object containing bollean values for the various account properties }) -> null
	 * This function is called from /accounts/views/confirmation/confirmed.jsp
	 * If the user has completed registration, Nitro tags will be added for it's correlating action
	 * This function also adds Nitro tags if the user has chosen to subscribe to any newsletters
	 * A list of account properties is passed in as hash:
	 * - has_newsletters,
	 * - has_about,
	 * - has_location,
	 * - has_avatar,
	 * - has_custom_avatar,
	 * - has_gender,
	 * - send_emails
	**/

sho.loaded_modules['/lib/js/sho/accounts/nitrotagger.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/accounts.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.provide('sho.schedules')
    sho.schedules.concerns =
    {
        image_prefix : 'http://www.sho.com',
        use_short_urls_in_modals : true,
        generic_image_path : {
            'portrait' : 'http://www.sho.com/site/image-bin/images/0_0_0/0_0_0_00_138x207.jpg',
            'landscape' : 'http://www.sho.com/site/image-bin/images/0_0_0/0_0_0_00_200x150.jpg'
        },
        ajax_loading_text : 'Loading Data...',

        getFragment:function(url)
        {
            return url.gsub(/sho\/(schedules\/)*(on-demand|ondemand|comedy|reality-docs|movies)*(\/)*/,'');
        },

        generateTitleUrl:function(title)
        {
			return ['/sho/schedules/titles', (title.id || title.episode.id), sho.string.toSlug(title.title || 'Unknown Title')].join('/')
        },

        restify:function(url)
        {
            return url.gsub(/^\/sho\//,'/rest/');
        },

        shoify:function(url)
        {
            return url.gsub(/^\/rest\//,'/sho/');
        },

        getOnDemandAvailability:function(item)
        {
             return ((item.onDemand || {'status':''}).status.gsub(/_/,' ').toLowerCase());
        },

        getAnytimeAvailability:function(item)
        {
            return ((item.anyTime || {'status':''}).status.gsub(/_/,' ').toLowerCase());
        },

        removeVendorTrailerLinks:function()
        {
            $j("[href^='http://www.totaleclips.com']").each(function (index, el) {

                $(el).remove(); return;

            });
        }

    }
    ;

    Object.extend(sho.schedules, sho.schedules.concerns);

sho.loaded_modules['/lib/js/sho/schedules/concerns.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.schedules.models')


    sho.schedules.models.BaseModel = Class.create({

        _KLASS_ : 'sho.schedules.models.BaseModel',

        base_url : null,
        root_node : 'data',
        noisy_logging : true,

        initialize:function(cfg)
        {

            Object.extend(this, cfg);

            if(this.dataSrc == 'remote')
            {
                if(this.autoload !== false)
                {
                    this.fetch({});
                }
            }
            else
            {
                this.localLoad();
            }

        },

        url:function()
        {
            return false;
        },

        fetch:function(params)
        {
            var url = params.url || this.url();
            if(this.noisy_logging) log('|fetch| ' + url);

            if(url)
            {
                var req = new Ajax.Request( url, {
                    method : params.method || 'GET',
                    onSuccess : this.onLoad.bind(this),
                    onFailure : this.error.bind(this, {
                        'message':'connection error',
                        'url' : url
                    })
                })
            }

        },

        onLoad:function(transport)
        {
            var json = transport.responseText.evalJSON();
            this.getPayload(json);
            this.ready();
        },

        localLoad:function()
        {
            if(this.localStore)
            {
                if(sho.schedules[this.localStore])
                {
                    this.getPayload(sho.schedules[this.localStore]);
                    this.ready.bind(this).delay(sho.dom.REDRAW_DELAY); // data island requires a little simulated latency
                }
                else
                {
                    log('Error: data not found in localStore:`sho.schedules.'+ this.localStore+ '`');
                }
            }
            else
            {
                log('Error: localLoad was called but cfg.localStore was not provided');
            }
        },

        getPayload:function(json)
        {
            if(this.is_paginated) this.getPagination(json);
            this.data = this.root_node ? eval('json.'+this.root_node) : json;
        },

        getPagination:function(json)
        {
            this.pagination = this.params.pagination || json.pagination || {};
            if(!this.pagination.pagesAvailable) this.pagination.pagesAvailable = json.pagination.pagesAvailable || 0;
        },

        error:function(errorObj)
        {
            this.view.update({
                'eventName' : 'model:error',
                'error' : errorObj
            });
        },

        ready:function()
        {
            if(typeof this.data !== 'undefined')
            {
                this.view.update({
                    'eventName' : this.modelName()+':loaded'
                });
            }
            else
            {
                this.error({
                    'message':'bad JSON',
                    'url' : this.url()
                });
            }
        },

        destroy:function()
        {
        },

        modelName:function()
        {
            return this._KLASS_.gsub(/sho\.(schedules|movies|comedyrealitydocs)\.models\.((grid|ondemand)\.)*/,'').toLowerCase();
        }


    });

sho.loaded_modules['/lib/js/sho/schedules/models/basemodel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.models.CompoundModel = Class.create({

        _KLASS_ : 'sho.schedules.models.CompoundModel',

        initialize:function(cfg)
        {
            log('hello from '+this._KLASS_)
        },

        getDetail:function()
        {
            return this.detail;
        },

        setDetail:function(cfg)
        {
            if($w('title episode series channel about airing-list slide-show').include(cfg.kind))
            {
                var klass = (cfg.kind.capitalize()).camelize();
                this.view.update({
                    'eventName' : 'detail:loading',
                    'kind' : cfg.kind
                });

                this.clearDetail(); this.detail = new sho.schedules.models[klass](Object.extend(cfg, {
                    'view' : this.view
                }));
            }

            if(cfg.kind == 'share') // share doesn't need a model, or a share:loading event...
            {
                this.view.update({
                    'eventName' : 'detail:share',
                    'kind' : cfg.kind,
                    'shareUrl' : this.detail.data.url,
                    'backUrl' : cfg.backUrl
                })
                this.back_url = null;
            }
        },

        clearDetail:function()
        {
            if(this.detail && this.detail.destroy) this.detail.destroy();
        },

        closeDetail:function()
        {
            this.clearDetail();
            this.view.update({
                'eventName' : 'detail:closed'
            })
        },

        getCollection:function()
        {
            return this.collection && !!this.collection.data.length ? this.collection.data : []
        },

        setCollection:function(c)
        {
            this.view.update({'eventName' : 'collection:loading'})
            if(this.collection && this.collection.destroy) this.collection.destroy();
            this.collection = c;
        }

    });


sho.loaded_modules['/lib/js/sho/schedules/models/compoundmodel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.AiringList = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.AiringList',

        base_url : '/rest/schedules/airings', //base_url : '/sho/json/schedules/titles',
        always_use_stub_url : false,
        stub_url : '/sho/json/schedules/_airings_/135794/inglourious-basterds',
        title : null, // '3:10 to Yuma',
        slug : null, // '3-10-to-yuma',
        id : null, // 8707897,
        dataSrc : 'remote',

        url:function()
        {
            return this.always_use_stub_url ? this.stub_url : [this.base_url,this.id,this.slug].join('/');
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/models/airinglist.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Series = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.Series',

        base_url : '/rest/schedules/ondemand/series',
        stub_url : '/!/schedules/ondemand/series/754.js',

        always_use_stub_url : false,
        dataSrc : 'remote',
        use_short_form : true,

        selectedIndex : 0,
        activeTitle : null,
        titles_per_page : 12,

        url:function()
        {
            return this.always_use_stub_url ? this.stub_url : [this.base_url,this.id,this.slug].join('/');
        },

        setSelectedEpisode:function(i)
        {

            if(!this.activeTitle)
            {
                this.activeTitle = new sho.schedules.models.Episode({
                    'autoload' : false,
                    'view' : this.view
                });
            }

            if(this.data.pageItemList[i])
            {
                this.selectedIndex = i;
                this.view.update({
                    'eventName' : 'episode:loading',
                    'selectedIndex' : i
                });
                var url = sho.schedules.generateTitleUrl({
                    'id':this.data.pageItemList[i].id
                })
                this.activeTitle.fetch({
                    url : sho.schedules.restify(this.use_short_form ? url+'/short' : url)
                })
            }
        },

        getSelectedEpisode:function()
        {
            var e;
            if(this.activeTitle)
            {
                e = this.activeTitle.data;
            }
            else
            {
                e = this.data.episode;
            }

            return e;
        },

        setCurrentPage:function(page)
        {
            this.getPaginator().setCurrentPage(page);

            this.view.update({
                'eventName' : 'page:changed'
            })
        },

        getCurrentPage:function()
        {
            return this.getPaginator().getCurrentPage()
        },

        getPaginatedList:function()
        {
            if(!this.paginator) this.initPaginator();
            return this.paginator.paginate()
        },

        getPaginator:function()
        {
            return this.paginator || this.initPaginator()
        },

        initPaginator:function()
        {
            this.paginator = new sho.ui.Paginator({
                'container' : sho.ui.modals.instance().ui.pagination, // yuck!
                'records' : this.data.pageItemList,
                'itemsPerPage' : this.titles_per_page
            })
            ;
            return this.paginator
        }


    });

    sho.schedules.models.Series.titles_per_page = sho.schedules.models.Series.prototype.titles_per_page;


sho.loaded_modules['/lib/js/sho/schedules/models/series.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Title = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.Title',

        base_url : '/rest/schedules/titles', //base_url : '/sho/json/schedules/titles',
        stub_url : '/!/schedules/titles/red.js',

        always_use_stub_url : false,
        dataSrc : 'remote',
        root_node : 'data.show',
        use_short_form : true,
        noisy_logging : false,

        title : null, // '3:10 to Yuma',
        slug : null, // '3-10-to-yuma',
        id : null, // 8707897,

        url:function()
        {
            return this.always_use_stub_url ? this.stub_url : this.shortenUrl([this.base_url,this.id,this.slug].join('/'));
        },

        shortenUrl:function(url)
        {
            return this.use_short_form ? url + '/short' : url;
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/models/title.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Episode = Class.create(sho.schedules.models.Title, {

        _KLASS_ : 'sho.schedules.models.Episode',

        base_url : '/rest',
        stub_url : '/!/schedules/titles/gigalos.js',

        always_use_stub_url : false,
        dataSrc : 'remote',

        seriesName : null,
        episodeNumber : null,
        seasonNumber : null,

        url:function()
        {
            return this.always_use_stub_url ? this.stub_url : this.shortenUrl([this.base_url,this.seriesName,'season',this.seasonNumber,'episode',this.episodeNumber].join('/'));
        }
    });

sho.loaded_modules['/lib/js/sho/schedules/models/episode.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Channel = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.Channel',

        title : null,               // 'Showtime Next'
        id : null,                  // 23
        desc : null,                // "Celebrating women on and behi...
        dataSrc : 'local',          // no second request here
        localStore : 'channels',    // => sho.schedules.channels

        localLoad:function()
        {
            var th=this; this.data = sho.schedules[this.localStore].find(function(c){
                return c.id == th.id;
            })

            this.ready.bind(this).delay(sho.dom.REDRAW_DELAY);
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/models/channel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.models.Gallery = Class.create(sho.schedules.models.CompoundModel, {

        _KLASS_ : 'sho.schedules.models.Gallery',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'view' : cfg.view,
                'dataSrc' : cfg.dataSrc,
                'category' : cfg.category,
                'params' : cfg.params,
                'galleryType' : cfg.galleryType
            });

        },


        setSeries:function(cfg)
        {
            this.setDetail(cfg);
        },

        setSelectedEpisode:function(seriesId, seriesSlug, idx)
        {
			var currentModal = sho.ui.modals.instance();
            if (currentModal.type == 'schedules-share') {
            	this.detail = null;
            }
            if(this.detail)
            {
                this.detail.setSelectedEpisode(idx);
            }
            else
            {
                this.setDetail({
                    'kind' : 'series',
                    'slug' : seriesSlug,
                    'id' :  seriesId,
                    'selectedIndex' : idx
                })

            }
        },

        setCurrentPageInEpisodeList:function(seriesId, seriesSlug, page)
        {
			if(this.detail)
            {
                this.detail.setCurrentPage(page);
            }
            else
            {
                this.setDetail({
                    'kind' : 'series',
                    'slug' : seriesSlug,
                    'id' :  seriesId,
                    'currentPage' : page
                })
            }
        },

        getCollection:function()
        {
            this.collection.data = this.collection.data || [];
            return this.collection.data.collect(function(i)
            {
                return Object.extend(i, {
                    'title' : i.displayTitle || i.title,
                    'format' : (i.image || {'orientationType':'unknown' }).orientationType.toLowerCase()
                })
            });
        },

        setViewMode:function(mode, opts)
        {
            opts = opts || {};
            this.viewMode = mode;
            sho.util.Cookies.write('gallery_view_mode', mode);

            if(!opts.silent) this.view.update({
                'eventName':'view_mode:changed',
                'viewMode' : mode
            });
        },

        getViewMode:function()
        {
            return this.viewMode;
        },

        setGenre:function(cfg)
        {

            if(!cfg || !Number(cfg.id))
            {
                 this.removeGenre();
            }
            else
            {
                this.setCollectionType({
                    'genre': { 'id':cfg.id, 'slug':cfg.slug },
                    'type':'genre'
                });
            }
        },

        removeGenre:function()
        {
            this.params = {};
            this.setCollectionType({'type':'ondemand'});
        },

        setCollectionType:function(cfg)
        {
            var k = this._KLASS_.match(/(.+)\.Gallery/)[1] + '.Collection', klass = eval(k);

            if(cfg.type !== this.galleryType)
            {
                this.galleryType = cfg.type;
                this.params = cfg;
                this.view.update({ 'eventName':'gallery:type_changed','type':cfg.type });
            }

            if((this.galleryType == 'a-to-z' && this.params['char'] !== cfg['char']) ||
               (this.galleryType == 'genre' && this.params.genre && this.params.genre.id && this.params.genre.id !== cfg.genre.id))
            {
                this.params = cfg;
                this.view.update({ 'eventName':'gallery:params_changed', 'params':this.params })
            }

            this.setCollection( new klass({
                'category' : this.category || 'movies',
                'view' : this.view,
                'dataSrc' : 'remote', // changing the gallery type or parameters triggers a request
                'galleryType' : this.galleryType,
                'params' : this.params
            }));

        },

        setCurrentPageInCollection:function(page)
        {
            if(this.collection)
            {
                this.collection.setCurrentPage(page);
            }
            else
            {
                log('setCurrentPageInCollection called but collection was not found!');
            }
        }

    });


sho.loaded_modules['/lib/js/sho/schedules/models/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Paginateable = {

        paginatedUrl:function(url)
        {
            var url = [url,'page',(this.pagination || {'pageNumber':1}).pageNumber].join('/');
            return url;
        },

        getCurrentPage:function()
        {
            return this.pagination.pageNumber;
        },

        setCurrentPage:function(p)
        {
            if(p == this.pagination.pageNumber) return;

            this.pagination.pageNumber = p;
            this.view.update({ 'eventName':'page:changed' });
            this.fetch({});
            this.view.update({ 'eventName' : this.modelName()+':loading' })
        },

        getNumPages:function()
        {
            return this.pagination.pagesAvailable;
        },

        getNumPagesInRange:function()
        {
            return this.pagination.endRange
        },

        getEndRange:function()
        {
            return this.pagination.endRange
        },

        getStartRange:function()
        {
            return this.pagination.startRange
        },

        getNextPage:function()
        {
            var p = (this.getCurrentPage()+1); return p > this.getNumPages() ? 1 : p;
        },

        getPreviousPage:function()
        {
            var p = (this.getCurrentPage()-1); return p == 0 ? this.getNumPages() : p;
        }

    }

sho.loaded_modules['/lib/js/sho/schedules/models/paginateable.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Collection = Class.create(sho.schedules.models.BaseModel, Object.extend({

        _KLASS_ : 'sho.schedules.models.Collection',

        always_use_stub_url : false,

        base_urls : {
            'stub' : '/sho/json/schedules/on-demand',
            'real' : '/rest/schedules/ondemand'
        },

        localStore : 'collection_data',
        root_node : 'data.pageItemList',
        is_paginated : true,

        getBase:function()
        {
            return this.base_urls[this.always_use_stub_url ? 'stub' : 'real']
        },

        url:function()
        {
            var u = [this.getBase()];
            if(this.category)
            {
                u.push(sho.string.toSlug(this.category));
            }
            if(this.params)
            {
                if(this.params.genre && this.params.genre.id) // zero is 'all movies', do we need to check for that here?
                {
                    u.push(this.params.genre.id);
                    u.push(this.params.genre.slug);
                }
            }
            return this.paginatedUrl(u.join('/'));
        }


    }, sho.schedules.models.Paginateable));


sho.loaded_modules['/lib/js/sho/schedules/models/collection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.About = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.About',

        dataSrc : 'local',
        localStore : 'ondemand_promotional_data'


    });

sho.loaded_modules['/lib/js/sho/schedules/models/about.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.models.Grid = Class.create(sho.schedules.models.CompoundModel, {

        _KLASS_ : 'sho.schedules.models.Grid',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'view' : cfg.view,
                'dataSrc' : cfg.dataSrc,
                'params' : cfg.params,
                'date' : cfg.params.date,
                'slices' : []
            });

            this.slices.push(new sho.schedules.models.Slice({
                'view' : this.view,
                'dateStr' : this.params.date || null,
                'rendered' : true
            }));

            this.date = this.slices.first().dateString();
        },

        setDate:function(date, flush)
        {
            var dateStr = typeof dateStr == 'string' ? date : date.toString(sho.schedules.slice_date_format);
            if(dateStr !== this.date)
            {
                this.date = dateStr;
                if(flush !== false) this.clearSlices();
                this.loadSlice(new sho.schedules.models.Slice({
                    'view' : this.view,
                    'dateStr' : dateStr
                }))

                this.view.update({ 'eventName' : 'grid:date_changed' })
            }

        },

        loadSlice:function(s)
        {
            this.slices.push(s); s.fetch({});  // no autoload in slice
            this.view.update({
                'eventName' : 'slice:loading'
            })
        },

        prevDay:function()
        {
            if(!this.numSlices()) return;

            var prev = this.slices.first().dateObject().add(-1).days();
            this.setDate(prev.toString(sho.schedules.slice_date_format));
        },

        nextDay:function()
        {
            if(!this.numSlices()) return;

            var nxt = this.slices.last().dateObject().add(1).days();
            this.setDate(nxt.toString(sho.schedules.slice_date_format));
        },

        clearSlices:function()
        {
            this.slices.each(function(s){ s.destroy(); }); this.slices = [];
        },

        addNextDay:function()
        {
            var d=this.slices.last().dateObject().clone().add(1).days(),
            next = new sho.schedules.models.Slice({
                'dateObj' : d,
                'view' : this.view
            });

            if(this.numSlices() > 1)
            {
                this.date = d.toString(sho.schedules.slice_date_format); // need to update the master date to reflect the slider changes
                var s = this.slices.shift(); s.destroy();
                this.view.update({'eventName':'grid:shift_slices'});
            }

            this.loadSlice(next);
            this.view.update({'eventName':'grid:add_slice' });
        },

        getDate:function(opts)
        {
            var s, opts = opts || {};

            if(!this.slices.length) return null;
            s = (opts.position && (opts.position == 'last' || opts.position == 'next')) ? this.slices.last() : this.slices.first();
            return s.dateObject();
        },

        getDates:function()
        {
            return this.slices.collect(function(s){ return s.dateObject() });
        },


        setLocalTime:function()
        {
            var t=new Date(),
                isToday = this.getDate().toString('M-d-yyyy') == t.toString('M-d-yyyy'),
                time = isToday ? t : this.getDate()
            ;
            this.view.update({
                'eventName' : 'grid:local_time_set',
                'time' : {
                    'hour' : time.getHours(),
                    'minutes' : time.getMinutes()
                }
            })
        },


        numSlices:function()
        {
            return this.slices.length;
        },

        getSlices:function()
        {
            return this.slices;
        },

        getPendingSlices:function()
        {
            return this.slices.select(function(s){ return s.rendered !== true });
        },

        hasPendingSlices:function()
        {
            return this.getPendingSlices().length > 0
        },

        logSlices:function()
        {
            log('slices in cache: '+this.slices.collect(function(s){return '`'+s.dateString()+'`'}).join(', '));
        }

    });


sho.loaded_modules['/lib/js/sho/schedules/models/grid.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Slice = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.Slice',

        base_url : '/rest/schedules/index',
        stub_url : '/sho/json/schedules',

        always_use_stub_url : false,
        dataSrc : 'remote',
        new_json_format : true,

        date_format : 'MM-dd-yyyy', /* mike's format 'yyyyMMdd' */
        dateStr : null, /* date str 06-16-2011 */
        dateObj : null, /* Date primitive */
        autoload : false,

        initialize:function($super, cfg)
        {
            $super(cfg);

            if(!cfg.dateStr && !cfg.dateObj)
            {
                this.dateObj = this.dateObj || Date.today();
                this.dateStr = this.dateObj.toString(this.date_format)
            }
        },

        url:function()
        {
            return this.always_use_stub_url ? this.stub_url+'?day='+ this.dateString() : [this.base_url, this.dateString()].join('/');
        },

        getChannels:function()
        {
            return (this.new_json_format ? this.data.linearChannelSet : this.data) || []
        },

        destroy:function()
        {
            this.view = null; // avoid circular references in orphaned instances.... right?
        },

        dateString:function()
        {
            return this.dateStr || this.dateObj.toString(this.date_format)
        },

        dateObject:function()
        {
            return this.dateObj || Date.parse(this.dateStr);
        }

    });

    sho.schedules.slice_date_format = sho.schedules.models.Slice.prototype.date_format;

sho.loaded_modules['/lib/js/sho/schedules/models/slice.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.SlideShow = Class.create(sho.schedules.models.BaseModel, {

        _KLASS_ : 'sho.schedules.models.SlideShow',

        dataSrc : 'local',
        root_node : false,
        localStore : 'product_image_list',

        index : 0,

        getCurrentImage:function()
        {
            return this.data[this.index];
        },

        getIndex:function()
        {
            return this.index;
        },

        getDisplayIndex:function()
        {
            return this.index + 1;
        },

        getNextImageIndex:function()
        {
            return (this.index+1 == this.data.length) ? 0 : this.index + 1
        },

        getPreviousImageIndex:function()
        {
            return this.index-1 == -1 ? this.data.length-1 : this.index -1
        },

        getNumImages:function()
        {
            return this.data.length
        },

        setIndex:function(i)
        {
            this.index = i;
            this.view.update({
                'eventName':'slideshow:image_changed'
            })
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/models/slideshow.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.models.Product = Class.create(sho.schedules.models.CompoundModel, {

        _KLASS_ : 'sho.schedules.models.Product',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'view' : cfg.view,
                'id' : cfg.params || 0,
                'slug' : cfg.slug || ''
            });
        }

    });


sho.loaded_modules['/lib/js/sho/schedules/models/product.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/schedules/models.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.schedules.views')


    sho.schedules.views.CompoundView = Class.create({

        _KLASS_ : 'sho.schedules.views.CompoundView',

        initialize:function(cfg)
        {
            _.extend(this, {
                'format' : cfg.format,
                'useMarkup' : cfg.useMarkup,
                'galleryType' : cfg.galleryType,
                'includeGenresInListView' : cfg.includeGenresInListView,
                'ui' : {}
            });

            var els,key,th=this;
            ['head','body','galleri','footer'].each(function(k){
                els = (cfg.container.select('.'+k)); if(_.any(els)){
                    key = k == 'galleri' ? 'body' : k;
                    th.ui[key] = els[0]
                }
            })
            this.build();
        },

        build:function()
        {
            if(!this.useMarkup) this.ui.body.update('');
            this.initControls.bind(this).delay(sho.dom.REDRAW_DELAY);
            this.setHandlers();
        },

        initControls:function()
        {
        },

        setHandlers:function()
        {
            var fn=this.click.bind(this);
            ([this.ui.body,this.ui.head,this.ui.footer]).invoke('observe','click', fn);
        },

        click:function(e){
            this.update({
                'eventName':'view:click',
                'event' : e
            })
        },

        update:function(e)
        {

            if(e.eventName == 'view:click')
            {
                var el = e.event.findElement('a'); if(el && !el.hasClassName('no-hijack'))
                {
                    this.controller.navigate(sho.dom.data.read(el, 'url') || el.readAttribute('href'));
                    e.event.stop();
                }
            }

            if(['title:loading','series:loading','detail:loading','channel:loading'].include(e.eventName))
            {
                this.drawEmptyModal(e.kind == 'episode' ? 'title' : e.kind);
            }

            if(['title:loaded','series:loaded','detail:loaded','about:loaded','channel:loaded','airinglist:loaded'].include(e.eventName))
            {
                this.setModalDataAndRender();
            }

            if(e.eventName == 'model:error')
            {
                sho.ui.Error({
                    'message' : e.error.message,
                    'net' : !!e.error.net,
                    'url' : e.error.url
                })
            }

            if(e.eventName == 'detail:share')
            {

               var detail= sho.schedules.views.Modal({
                    'type' :        'schedules-share',
                    'parent' :      this,
                    'backUrl' :     e.backUrl,
                    'shareUrl' :    'http://www.sho.com' + e.shareUrl,
                })
            }

            if(e.eventName == 'detail:closed')
            {
                sho.ui.modals.destroy();
            }

        },

        setModalDataAndRender:function()
        {
            var detail = sho.ui.modals.instance();
            detail.data = this.model.getDetail().data;
            detail.model = this.model;
            detail.render();

			if (detail.selectedIndex) {
				this.model.setSelectedEpisode(detail.model.detail.id, detail.model.detail.slug, detail.selectedIndex);
			}
        },

        drawEmptyModal:function(kind)
        {
            sho.schedules.views.Modal({
                'type' : kind == 'airing-list' ? 'airing-list' : kind+'-info',
                'parent' : this, // this is handy for when we need access to the controller, ie resetting state on close
                'content' : '<p class="loading">'+sho.schedules.ajax_loading_text+'</p>'
            });
        },

        render:function()
        {
            log('|compoundview| implement render() in subclass')
        }




    });

sho.loaded_modules['/lib/js/sho/schedules/views/compoundview.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.schedules.views.ondemand')

    !function($)
    {

    sho.schedules.views.ondemand.GalleryMenu = klass({

        _KLASS_ : 'sho.schedules.views.ondemand.GalleryMenu',

        initialize:function(cfg)
        {
            var el = $(cfg.select).hide();

            _.extend(this, {
                'selectedIndex' : el.get(0).selectedIndex,
                'el' :            el,
                'container' :     el.parent().get(0),
                'options' :       el.find('option'),
                'values' :        [],
                'labels' :        []
            })

            this.parseOptions()
            this.drawMenu();
       },

       parseOptions:function()
       {
           var th=this;

           _.each(this.options, function(el){
               th.labels.push($(el).text());
               th.values.push($(el).val());
           })
       },

       drawMenu:function()
       {
            this.menu = new sho.ui.menu.MultiColumn({
        		'container' :  this.container,
        		'columns' :    4,
        		'title' :      'All Movies',
        		'labels' :     this.labels, //['foo','wibble'],
        		'values' :     this.values, // ['foo','wibble'],
        		'keepSelectionVisible' : true,
        		'selectedIndex' : this.selectedIndex,
        		'onSelect':(function(url){
        		    window.location = url
        		})
        	});
        },

    })


    }(sho.$)
sho.loaded_modules['/lib/js/sho/schedules/views/ondemand/genremenu.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.views.ondemand.Gallery = Class.create(sho.schedules.views.CompoundView, {

        _KLASS_ : 'sho.schedules.views.ondemand.Gallery',

        regions :  $w('head footer'),
        controls : {},

        fn : {},

        update:function($super, e)
        {

            $super(e);

            if(['episode:loading','episode:loaded','page:changed'].include(e.eventName))
            {
				if(sho.ui.modals.instance()) { sho.ui.modals.instance().update(e); }
            }

        }



    });

sho.loaded_modules['/lib/js/sho/schedules/views/ondemand/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.ondemand.GalleryItem = Class.create({

        _KLASS_ : 'sho.schedules.views.ondemand.GalleryItem',

        item : new Template([
        '<div class="item #{klasses}" style="width:#{width}px;">',
    		'<div class="art">',
    	    	'<a class="#{redirect}" data-url="#{dataUrl}" href="#{url}">',
    	    	    '<b class="flag">#{availability}</b>',
        		    '<img class="#{klasses}" src="',
        		        sho.dom.SPACER,
        		        '" data-image-src="#{image}" style="width:#{width}px; height:#{height}px;"',
        		    '/>',
        		'</a>',
    		'</div>',
    		'<div class="title" style="width:#{width}px;">',
    		    '<a class="#{redirect}" data-url="#{dataUrl}" href="#{url}">',
    		        '#{title}',
    		    '</a>',
    		'</div>',
    	'</div>'
    	].join('')),

        json_dimensions : {
            'portrait' : '182x273',
            'landscape' : '564x423'
        },

        best_asset_dimensions : {
            'portrait' : '200x300',
            'landscape' : '284x213' // 400x300
        },

        initialize:function(cfg)
        {
            Object.extend(this, {
                'id' : cfg.id,
                'type' : (cfg.type || 'unknown').toLowerCase(),
                'title' : cfg.title,
                'format' : cfg.format,
                'featured' : ['true',true].include(cfg.isFeatured),
                'redirect' : ['true',true].include(cfg.redirect),
                'url' : cfg.url,
                'width' : cfg.width,
                'height' : cfg.height,
                'onDemand' : cfg.onDemand,
                'anyTime' : cfg.anyTime
            });

            this.availability = sho.schedules.getOnDemandAvailability(this);
            this.image = this.getBestImage(this.getImagePath(cfg.image));
        },

        toStr:function()
        {
            return this.item.evaluate({
                'klasses' : [this.availability.gsub(/\s/,'-'),(this.featured ? ['featured',this.format] : [this.format])].flatten().join(' '),
                'url' : this.url,
                'redirect' : this.redirect ? 'no-hijack' : '',
                'image' : this.image,
                'title' : this.title,
                'width' : this.width,
                'height' : this.height,
                'availability' : this.availability,
                'dataUrl' : (this.type == 'series' ? this.url : sho.schedules.generateTitleUrl({
                   'id' : this.id,
                   'title' : this.title
                }))
            });
        },


        getBestImage:function(path)
        {
            return path.split(this.json_dimensions[this.format]).join(this.best_asset_dimensions[this.format]);
        },

        getImagePath:function(img)
        {
            return (!!img ? sho.schedules.image_prefix + img.path : sho.schedules.generic_image_path[this.format])
        }



    });

sho.loaded_modules['/lib/js/sho/schedules/views/ondemand/galleryitem.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.ondemand.GalleryItemSpacer = Class.create({

        _KLASS_ : 'sho.schedules.views.ondemand.GalleryItemSpacer',

        item : new Template([
        '<div class="item spacer" style="width:#{width}px;">',
    		'<div class="art" style="height:#{height}px;">',
        	'</div>',
    		'<div class="title" style="width:#{width}px;">',
    		    '<b>&nbsp;</b>',
    		'</div>',
    	'</div>'
    	].join('')),


        initialize:function(cfg)
        {
            Object.extend(this, {
                'width' : cfg.width,
                'height' : cfg.height
            });

        },

        toStr:function()
        {
            return this.item.evaluate({
                'width' : this.width,
                'height' : this.height
            });
        }





    });

sho.loaded_modules['/lib/js/sho/schedules/views/ondemand/galleryitemspacer.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.views.modals.BaseModal = Class.create(sho.ui.modals.Base, {

        _KLASS_ : 'sho.schedules.views.modals.BaseModal',


        setHandlers:function($super)
        {
            $super();

            sho.dom.bind('login_modal:opened', _.bind(this.resetState, this))
        },

        resetState:function()
        {
            if(this.controllerPresent()) this.parent.controller.navigate('/index');
        },

        click:function(e)
        {
            var el = e.event.findElement('.calls-to-action a.share, .calls-to-action a.video');
            if(el && this.controllerPresent()) this.callToActionClick(el.className, e.event)
        },

        callToActionClick:function(action, e)
        {
            e.stop();

            if(action == 'video')
            {
                this.navigate(this.data.video.url);
            }
            if(action == 'share')
            {
                this.parent.controller.back_url = window.location.hash.toString(); // leave '#' in there!
    			if (this.parent.controller.back_url.include('/page/') && !this.parent.controller.back_url.include('/episodes/') && this.selectedIndex) {
    				this.parent.controller.back_url += ('/episodes/' + this.selectedIndex);
    			}
                this.navigate(sho.schedules.generateTitleUrl(this.data)+'/share')
            }
        },

        navigate:function(path)
        {
            if(this.controllerPresent()) this.parent.controller.navigate(path);
        },

        controllerPresent:function()
        {
            return this.parent && this.parent.controller
        }



    });

sho.loaded_modules['/lib/js/sho/schedules/views/modals/basemodal.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.Renderer = {

        renderThumbnail:function()
        {
            return (!!this.data.image ?
                sho.schedules.image_prefix + this.data.image.path :
                sho.schedules.generic_image_path[this.format])
            ;
        },

        convertThumbnailToLandscape:function(thumbnail)
        {
            return  Object.extend(sho.string.toDimensions('200x150'),{
                'path' : thumbnail.path.gsub(/138x207\.jpg/, '200x150.jpg'),
                'orientationType':'LANDSCAPE'
            })
        },

        renderGenres:function()
        {
            var th=this, genres = this.data.genreSet || [];
            if(this.data.type !== 'MOVIE' || !genres.any()) return '';

            return 'Genre: ' + (genres.collect(function(g){
                return (g.url == null ? g.value : th.genreEntry.evaluate(g))
            }).join('<em class="pipe">|</em>'))+'<br />';
        },

        renderSchedule:function(key)
        {
            var entry = {
                'label' : this.ways_to_watch[key].label
            };

            if(key == 'nextOn')
            {
                if(!!this.data[key]) {
                    entry.value = this[this.ways_to_watch[key].template].evaluate(this.data[key]);
                }
                else
                {
                    entry.value = 'Not Currently Available';
                }

                return this.scheduleEntry.evaluate(entry);
            }

           if(key == 'onDemand')
            {
                if(!!this.data[key] && this.data[key].isAvailable) {
                    entry.value = 'Available Now';
                }
                else
                {

                	if(!!this.data[key] && this.data[key].startDate != '') {
                        entry.value = 'Available on ' + this.data[key].startDate;
                    }

                	else {
                		entry.value = 'Not Available';
                	}
                }

                return this.scheduleEntry.evaluate(entry);
            }

            if(key == 'online')
            {
                var services = ['streaming','anyTime'];

                    _.each(services, function(service) {
                    entry[service] = {};
                    if(this.data[service] && this.data[service].isAvailable) {
                            entry[service].value = 'Available Now';
                            if (service== 'anyTime') {
                            	entry[service].link = '<br /><a data-behavior="track-anytime" data-event-context="ways to watch" data-event-label="watch now" class="more-info" href="' + this.data[service].url + '">Watch Now</a>';
                            }
                            else {
                            	entry[service].link = '<br /><a data-behavior="track-streaming" data-event-context="ways to watch" data-event-label="watch now" class="more-info" href="' + this.data[service].url + '?i_cid=int-default-1006' + '">Watch Now</a>';
                            }

                    }
                    else {
                        if (this.data[service] && this.data[service].startDate != '') {
                            entry[service].value = 'Available on ' + this.data[service].startDate;
	                            if (service== 'anyTime') {
	                                entry[service].link = '<br /><a  data-behavior="track-event" data-event-context="ways to watch" data-event-label="learn more: anytime" class="more-info" href="/sho/showtime-anytime">Learn More</a>';
	                            }
	                            else {
	                            entry[service].link = '<br /><a  data-behavior="track-event" data-event-context="ways to watch" data-event-label="learn more: showtime" class="more-info" href="/sho/order/5/ott">Learn More</a>';
	                            }
                        }
                        else {
                            entry[service].value = 'Not Available';
	                            if (service== 'anyTime') {
	                                entry[service].link = '<br /><a  data-behavior="track-event" data-event-context="ways to watch" data-event-label="learn more: anytime" class="more-info" href="/sho/showtime-anytime">Learn More</a>';
	                            }
	                            else {
	                            entry[service].link = '<br /><a  data-behavior="track-event" data-event-context="ways to watch" data-event-label="learn more: showtime" class="more-info" href="/sho/order/5/ott">Learn More</a>';
	                            }
                        }
                    }
                }, this);

                return this.onlineScheduleEntry.evaluate(entry);
            }
        },

        renderVideo:function()
        {
            return !this.data.video ? '' : ([
                '<a class="video" ',
                    'data-behavior="play-video" data-video-id="', this.data.video.id, '" ', // new style data-attr
                    'href="', this.data.video.url, '">',
                    (this.use_dynamic_video_title ? this.data.video.title : this.static_video_title),
                '</a>'
            ]).join('')
        }




    };

sho.loaded_modules['/lib/js/sho/schedules/views/modals/renderer.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.OnDemandInfo = Class.create(sho.schedules.views.modals.BaseModal, {

        _KLASS_ : 'sho.schedules.views.modals.OnDemandInfo',

        defaults : {
            'classNames' : ['about-on-demand'],
            'width' : 600,  // was 800 for original copy
            'height' : 192,  // was 216 for original copy
            'events' : {
                'click' : 'click',
                'close' : 'resetState'
            },
            'title' : 'About On Demand'
        },

        view : new Template(['',
        '<div class="on-demand-copy left">',
            '#{body}',
        '</div>',
        '<div class="on-demand-video right">',
            '<div class="on-demand-video-inner">',
                '<h4><a href="#{video.url}" data-video-id="#{video.id}">#{video.title}</a></h4>',
                '<a href="#{video.url}" data-video-id="#{video.id}"><img src="#{video.image}" /></a>',
            '</div>',
        '</div>'
        ].join('')),

        render:function()
        {
            if(!this.data || !this.data.video) return;

            this.setContent(this.view.evaluate({
                'body' : this.data.body,
                'video' : this.data.video
            }))
        },

        click:function(e)
        {
            var el = e.event.findElement('.on-demand-video a'); if(el){
                 e.event.stop(); sho.video.load({
                     'id' : sho.dom.data.read(el, 'videoId')
                 })
            }
        }
    });

    sho.schedules.views.modals.AboutInfo = sho.schedules.views.modals.OnDemandInfo;

sho.loaded_modules['/lib/js/sho/schedules/views/modals/ondemandinfo.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.TitleInfo = Class.create( sho.schedules.views.modals.BaseModal,

        Object.extend(sho.schedules.views.modals.Renderer, // mix-in json-adapter functions common to both title and series-info
        {

        _KLASS_ : 'sho.schedules.views.modals.TitleInfo',

        use_dynamic_video_title : false,
        static_video_title : 'Preview',

        defaults : {
            'width' : 486, // was 486,
            'height' : 350, // was 341,
            'events' : {
                'close' : 'resetState',
                'click' : 'click'
            }
        },

        view : new Template([
            '<div class="title-info-inner #{klasses}">', // could have passed these through modal.base as cfg.classNames
              	'<div class="title-info-head">',
                  	'<div class="art"><a href="#{url}"><img src="#{image}" /></a></div>',
                    '<div class="title-info-overview">',
              		    '<div class="title"><a href="#{url}">#{title}</a></div>',
              		    '<p class="desc">',
              		        '#{description}',
              		    '</p>',
              		    '<p class="meta">',
              		        '#{genres}',
              		        'Rating: #{rating}<br />',
              		        'Duration: #{duration}',
              		    '</p>',
              		    '<div class="calls-to-action">',
              		        '#{video}',
                            '<a class="disclosure" href="#{url}">More Info</a>',
              		    '</div>',
          	        '</div>',
              	'</div>',
         	    '<div class="title-info-schedule">',
              	    '<div class="group ways-to-watch">#{schedule}</div>',
              	'</div>',
				'<div class="on-demand-disclaimer">Availability of Showtime On Demand titles may vary by TV service provider.</div>',
          	'</div>'
        ].join('')),

        ways_to_watch : {
            'nextOn' : {
                'label' : 'On TV', 'template' : 'linearScheduleEntry'
            },
            'online' : {
                'label' : 'Online', 'template' : 'onlineScheduleEntry'
            },
            'onDemand' : {
                'label' : 'On Demand', 'template' : 'onDemandScheduleEntry'
            }
        },

        scheduleEntry : new Template([
        '<u>',
            '<h3>#{label}</h3>',
            '#{value}',
            '#{anyTimeLink}',
        '</u>'
        ].join('')),

        onlineScheduleEntry : new Template([
        '<u>',
            '<h3>Online</h3>',
            '<h4>Showtime</h4>',
            '#{streaming.value}',
            '#{streaming.link}',
            '<br>',
            '<h4>Showtime Anytime</h4>',
            '#{anyTime.value}',
            '#{anyTime.link}',
        '</u>'
        ].join('')),

        linearScheduleEntry : new Template('#{date}, #{time} <br />on <span class="channel-name">#{channel.name}</span>'),
        onDemandScheduleEntry : new Template('#{startDate} - #{endDate}'),
        genreEntry : new Template('<a href="#{url}">#{value}</a>'),

        fallback_data : {
            'title' : 'Unknown Title',
            'description' : 'Description Unavailable',
            'orientationType' : 'PORTRAIT',
            'url' : '#'
        },

        render:function()
        {
            if(!this.data) return
            this.format = (this.data.image ? (this.data.image.orientationType || this.fallback_data.orientationType) : this.fallback_data.orientationType).toLowerCase();
            this.setContent(this.toStr());
            this.adjustSize.bind(this).delay(sho.dom.REDRAW_DELAY); // in base modal

        },

        toStr:function()
        {
            var url = (this.data.url || sho.schedules.generateTitleUrl(this.data))
            ;
            return (sho.schedules.views.modals.TitleInfo.prototype.view.evaluate({
                'klasses' : this.format,
                'url' : ((url.indexOf('/sports/events') == -1) ? url + '#/index' : url), // SITE-6487
                'title' : this.data.displayTitle || this.data.title || this.fallback_data.title,
                'description' : ((this.data.isUpcoming && this.data.episodeNumber) ? this.data.shortDescription : (this.data.mediumDescription || this.data.description || this.fallback_data.description)),
                'rating' : this.data.rating,
                'duration' : !!this.data.episode.lengthMinutes ? this.data.episode.lengthMinutes + ' Mins' : 'Unknown',
                'image' : this.renderThumbnail(),
                'genres' : this.renderGenres(),
                'video' : this.renderVideo(),
                'schedule' : ([
                    this.renderSchedule('nextOn'),
                    this.renderSchedule('online'),
                    this.renderSchedule('onDemand')
                ]).join('')
            }))
        },

        adjustSize:function()
        {
            var title = (this.ui.content.select('.title-info-inner') || [false])[0]; if(!title) return;
            var height = title.getHeight();
            var innerHeight = this.height - sho.ui.modals.tbar_height - 18;

            if(height < innerHeight)
            {
                title.setStyle({ 'height' : innerHeight + 'px' })
            }
            else if(height > innerHeight)
            {
                this.resize({ 'height' : height + sho.ui.modals.tbar_height, 'width' : this.width })
            }
        }

    }));

    sho.schedules.views.modals.TitleInfo.toStr = sho.schedules.views.modals.TitleInfo.prototype.toStr;

sho.loaded_modules['/lib/js/sho/schedules/views/modals/titleinfo.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.SeriesInfo = Class.create(sho.schedules.views.modals.BaseModal,

        Object.extend(sho.schedules.views.modals.Renderer, // mix-in json-adapter functions common to both title and series-info
        {

        _KLASS_ : 'sho.schedules.views.modals.SeriesInfo',

        use_dynamic_video_title : false,
        static_video_title : 'Preview',

        defaults : {
            'width' : 984, // might want to decrease this to fit better into ipad's 1024 canvas
            'height' : 437, // room for 12 entries in table, plus table header, plus titlebar, updated to 437(prevent disclaimer from overlapping when box is bigger) from 396 (prev 369 to accomodate extra padding for titles)
            'pagination' : true,
            'events' : {
                'close' : 'resetState',
                'click' : 'click',
                'paginate' : 'click'
            }
        },

        view : new Template([
            '<div class="series-info group">',
            	'<div class="series-schedule">',
                '<table width="100%">',
            	    '<tr class="header">',
         			'<th>Title</th>',
         			'<th>Starts</th>',
         			'<th>Ends</th>',
         		'</tr>',
            	'#{schedule}',
         		'</table>',
            	'</div>',
            	'#{title-info}',
            '</div>'
        ].join('')),

        schedule_shim : ['<tr class="shim">',
    	    '<td>&nbsp;</td>',
            '<td>&nbsp;</td>',
    	    '<td>&nbsp;</td>',
    	'</tr>'].join(''),

    	klass_names : {
    	    'shim' : 'shim'
    	},

        fallback_data : {
            'title' : 'Unknown Title',
            'description' : 'Description Unavailable',
            'format' : 'landscape',
            'url' : '#/series'
        },

        update:function($super, e)
        {
            $super(e);

            if(e.eventName == 'episode:loading')
            {
                this.ui.content.select('.title-info-inner').invoke('update','<p class="loading">'+sho.schedules.ajax_loading_text+'</p>');
                this.updateSelectedTitle(e.selectedIndex);
            }

            if(e.eventName == 'episode:loaded' || e.eventName == 'page:changed')
            {
                this.render();
                this.updatePagination(e);
            }

        },


        click:function($super, e)
        {
            $super(e);

            var url='', el = e.event.findElement('tr, span.page, span.next, span.prev');

            if(el && !el.className.match(/header|shim/))
            {
                url = Backbone.history.getFragment().gsub(/\/(episodes|page)\/(\d+)/,'');

                if(el.className.match(/(page|next|prev)/))
                {
                    if(['next','prev'].include(el.className))
                    {
                        var page = el.className, fn = ('get-'+page+'-page-in-episode-list').camelize();
                        this.parent.controller[fn](url);
                    }
                    else
                    {
                        url += '/page/'+ el.innerHTML.toLowerCase()
                        this.parent.controller.navigate(url);
                    }
                }
                else // episode selection click
                {
		            var series = this.model.getDetail();
					var currentPage = series.getCurrentPage();
					if (currentPage > 1) {
						url += ('/page/' + currentPage);
					}


                    url += el.className.split(' ').last().gsub(/index-/,'/episodes/');
                    log('|seriesinfo| ep select called, controller.navigate(`'+url+'`)');
                    this.parent.controller.navigate(url);
                }

                e.event.stop();
            }
        },


        render:function()
        {
            if(!this.data || !this.model) return;

            this.selectedIndex = this.model.getDetail().selectedIndex;

            this.setContent(this.view.evaluate({
                'schedule' : this.drawSchedule(),
                'title-info' : this.drawTitleInfo()
            }));
            sho.behaviors.apply(this.ui.content);
            this.adjustSize.bind(this).delay(sho.dom.REDRAW_DELAY);
        },

        drawSchedule:function()
        {
            var th=this,
                series = this.model.getDetail(),
                pageOffset = (series.getCurrentPage()-1) * sho.schedules.models.Series.titles_per_page
            ;
            return series.getPaginatedList().collect(function(t,i){
                var klasses = [],
                    index = i + pageOffset
                ;
                klasses.push(index % 2 == 0 ? 'alt' : '');
                klasses.push(index == th.selectedIndex ? 'aktiv' : '');
                klasses.push('index-'+ index)
                return ['',
                    '<tr class="', klasses.join(' ') , '">',
                    '<td>',
                        '<b>',t.title,'</b>',
                    '</td><td>',
                        t.startDate,
                    '</td><td>',
                        t.endDate,
                    '</td></tr>',
                ''].join('')
            }).join('');
        },

        drawTitleInfo:function()
        {
            this.format = 'landscape';

            var t = this.model.getDetail().getSelectedEpisode();
            if (!t) { return; }

            var premiereDate = t.originalAirTimeString ? new Date(t.originalAirTimeString): false;
            var showShortDesc = !premiereDate ? true: (new Date() < premiereDate);

            Object.extend(this.data, {
                'url' :         t.url || this.fallback_data.url,
                'title' :       t.displayTitle || t.title || this.fallback_data.title,
                'description' : (showShortDesc ? t.shortDescription : t.mediumDescription) || t.description ||  this.fallback_data.description,   //t.mediumDescription || t.description || this.fallback_data.description,
                'rating' :      t.rating,
                'duration' :    t.lengthMinutes,
                'image':        t.image,
                'thumbnailImage' : this.convertThumbnailToLandscape(t.image), // this.convertThumbnailToLanscape(t.thumbnailImage),
                'genreSet':     t.genreSet,
                'trailer':      t.trailer,
                'onDemand':     t.onDemand,
                'nextOn':       t.nextOn,
                'anyTime':      t.anyTime,
                'streaming':    t.streaming
            });

            return sho.schedules.views.modals.TitleInfo.toStr.call(this,this.data);
        },

        updateSelectedTitle:function(idx)
        {
            this.ui.content.select('.series-schedule tr').invoke('removeClassName','aktiv');
            this.ui.content.select('.series-schedule tr.index-'+idx).invoke('addClassName','aktiv');
        },

        adjustSize:function()
        {
            var title = (this.ui.content.select('.title-info-inner') || [false])[0],
            schedule = (this.ui.content.select('.series-schedule') || [false])[0]
            target = this.height - sho.ui.modals.tbar_height;

            if(title && schedule)
            {
                title._height = title.getHeight();
                schedule._height = schedule.getHeight();

                if(title._height < target)
                {
                    title.setStyle({'height': (target-18)+'px' });
                }

                if(schedule._height < target)
                {
                    this.drawShim(schedule, (target - schedule._height));
                }
            }
        },

        drawShim:function(schedule, offset)
        {
            (schedule.select('tr:last-child')[0]).insert({
                'after' : this.schedule_shim
            }).next().setStyle({
                'height' : offset+'px'
            })
        },

        updatePagination:function(e)
        {
		   if (e.eventName == 'page:changed') { return; }
           var series = this.model.getDetail();
		   var currentPage = series.getCurrentPage();
		   if(currentPage || series.selectedIndex)
			{
				var intendedPage = Math.ceil((series.selectedIndex+1) / sho.schedules.models.Series.titles_per_page);
				if (currentPage != intendedPage) {
					series.setCurrentPage(intendedPage);
				 }
			}
        }

    }));

sho.loaded_modules['/lib/js/sho/schedules/views/modals/seriesinfo.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.ChannelInfo = Class.create(sho.schedules.views.modals.BaseModal, {

        _KLASS_ : 'sho.schedules.views.modals.ChannelInfo',

        defaults : {
            'width' : 300,
            'height' : 300,
            'events' : {
                'close' : 'resetState'
            }
        },

        view : new Template([
            '<div class="channel-info-inner #{klasses}">',
              	'<p>#{desc}</p>',
          	'</div>'
        ].join('')),

        render:function()
        {
            if(!this.data) return;

            this.setTitle(this.data.title);
            this.setContent(this.view.evaluate(this.data))
        }
    });

sho.loaded_modules['/lib/js/sho/schedules/views/modals/channelinfo.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.AiringList = Class.create(sho.schedules.views.modals.BaseModal, {

        _KLASS_ : 'sho.schedules.views.modals.AiringList',

        max_num_airings : 13,

        defaults : {
            'width' : 375,
            'height' : 510,
            'events' : {
                'close' : 'resetState'
            }
        },

        airing:new Template([
        '<div class="entry group #{klasses}">',
            '<div class="airing-when">#{date}, #{time}</div>',
            '<div class="airing-channel">#{channel.name}</div>',
        '</div>'
        ].join('')),

        render:function()
        {
            if(!this.data) return;

            var th=this,
            out = ['',
            '<div class="airing-list-inner">',
                '<h3>',this.data.title,':</h3>',
					'<h4>Upcoming Airings <span>(All Times ET/PT):</span></h4>',
                this.data.airingList.splice(0,this.max_num_airings).collect(function(a,idx){
                    return th.airing.evaluate(Object.extend(a, {
                        'klasses' : (idx % 2 == 0 ? 'alt' : '')
                    }));
                }),
            '</div>'
            ];

            this.setContent(out.flatten().join(''));
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/views/modals/airinglist.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.AiringListAlternate = Class.create(sho.schedules.views.modals.BaseModal, {

        _KLASS_ : 'sho.schedules.views.modals.AiringListAlternate',

        max_num_airings : 10,

        defaults : {
            'width' : 500,
            'height' : 200,
            'events' : {
                'close' : 'resetState'
            }
        },

        airing:new Template([
        '<div class="entry group #{klasses}">',
            '<div class="airing-when">#{date}, #{time}</div>',
            '<div class="airing-channel">#{channel.abbreviation}</div>',
        '</div>'
        ].join('')),

        tbar_height: 62,

        render:function()
        {
            if(!this.data) return;

            var th=this,
            out = ['',
            '<div class="airing-list-inner">',
                '<h3>Upcoming Airings for</h3>',
                '<h2>',this.data.title,'</h2>',
				'<h4>All Times ET/PT</h4>',
                this.data.airingList.splice(0,this.max_num_airings).collect(function(a,idx){
                    return th.airing.evaluate(Object.extend(a, {
                        'klasses' : (idx % 2 == 0 ? 'alt' : '')
                    }));
                }),
            '</div>'
            ];

            this.setContent(out.flatten().join(''));
            this.trackPageView();
        },

        resizeHeight:function(content)
        {
            var h = content.outerHeight();
            h += this.tbar_height;
            this.resize({
                'width' : 500,
                'height' : h,
            });
        },

        trackPageView:function()
        {
            var page = sho.analytics.getData().page;
            var pageElements = page.split(':');
            pageElements.length = 2;
            sho.analytics.getTracker().trackPageView({
                'page':([pageElements.join(':'), this.data.title.toLowerCase().replace(":", "-"), 'all airings'].join(':'))
            })
        },

    });

sho.loaded_modules['/lib/js/sho/schedules/views/modals/airinglistalternate.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.SlideShow = Class.create(sho.schedules.views.modals.BaseModal, {

        _KLASS_ : 'sho.schedules.views.modals.SlideShow',

        defaults : {
            'width' : 300,
            'height' : 300,
            'events' : {
                'close' : 'resetState',
                'click' : 'click'
            }
        },

        view : new Template(['',
        '<div class="slideshow-inner" style="',
                'background-image:url(#{path});',
                'height:#{height}px',
            '">',
            '<div class="slideshow-controls group">',
                '<div class="slideshow-control left previous" style="height:#{height}px">&nbsp;</div>',
                '<div class="slideshow-control right next" style="height:#{height}px">&nbsp;</div>',
            '</div>',
            '<div class="slideshow-caption">#{caption}</div>',
        '</div>',
        ''].join('')),

        caption_height : 22,

        render:function()
        {
            var i = this.model.getCurrentImage();
            this.resize({
                'width' : i.width,
                'height' : i.height
            });
            this.setTitle(this.model.getDisplayIndex() + '/' + this.model.getNumImages());
            this.setContent.bind(this).delay(sho.dom.REDRAW_DELAY, this.view.evaluate({
                'path' : i.path,
                'height' : this.height,
                'caption' : !!i.legalLine ? ('<b>'+i.legalLine+'</b>') : ''
            }));
            this.adjustHeights.bind(this).delay(sho.dom.REDRAW_DELAY);
        },

        adjustHeights:function()
        {
            var h = {'height':this.height+'px'};
            this.ui.content.select('.slideshow-control').invoke('setStyle', h)
        },


        click:function(e)
        {
            var el = e.event.findElement('.slideshow-control'); if(el)
            {
                var fn = ('get-' + (el.className.split(' ').last()) + 'ImageIndex').camelize();
                var i = this.model[fn](); i++;
                this.parent.controller.navigate('/images/'+i);
            }
        }




    });

sho.loaded_modules['/lib/js/sho/schedules/views/modals/slideshow.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.modals.SlideShowAlternate = Class.create(sho.schedules.views.modals.BaseModal, {

        _KLASS_ : 'sho.schedules.views.modals.SlideShowAlternate',

        defaults : {
            'width' : 800,
            'height' : 645,
            'events' : {
                'close' : 'resetState',
                'click' : 'click'
            }
        },

        view : new Template(['',
        '<div class="slideshow-inner" style="',
                'background-image:url(#{path});',
                'height:#{height}px',
            '">',
            '<div class="slideshow-controls group">',
                '<div class="slideshow-control left previous" style="height:#{height}px">&nbsp;</div>',
                '<div class="slideshow-control right next" style="height:#{height}px">&nbsp;</div>',
            '</div>',
            '<div class="slideshow-caption">#{caption}</div>',
        '</div>',
        ''].join('')),

        index : 0,
        imageList : [],
        vertical_padding: 45,

        render:function(i)
        {
            this.index = (i == null ? this.index : i);
            this.imageList = (!this.imageList.length ? sho.schedules.product_image_list : this.imageList);

            this.resize({
                'width' : this.imageList[this.index].width,
                'height' : this.imageList[this.index].height + this.vertical_padding
            });
            this.setTitle((this.getDisplayIndex()) + '/' + this.imageList.length);
            this.setContent.bind(this).delay(sho.dom.REDRAW_DELAY, this.view.evaluate({
                'path' : this.imageList[this.index].path,
                'height' : this.imageList[this.index].height,
                'caption' : !!this.imageList[this.index].legalLine ? ('<b>'+this.imageList[this.index].legalLine+'</b>') : ''
            }));

            this.trackPageView();
        },

        click:function(e)
        {
            var el = e.event.findElement('.slideshow-control'); if(el)
            {
                var fn = ('get-' + (el.className.split(' ').last()) + 'ImageIndex').camelize();
                this.render(this[fn]());
            }
        },

        trackPageView:function()
        {
            var page = sho.analytics.getData().page;
            var pageElements = page.split(':');
            pageElements.length = 3;
            sho.analytics.getTracker().trackPageView({
                'page':([pageElements.join(':'),'images',this.getDisplayIndex()].join(':'))
            })
        },

        getDisplayIndex:function()
        {
            return this.index + 1;
        },

        getNextImageIndex:function()
        {
            return (this.index+1 == this.imageList.length) ? 0 : this.index + 1
        },

        getPreviousImageIndex:function()
        {
            return this.index-1 == -1 ? this.imageList.length-1 : this.index -1
        }

    });
sho.loaded_modules['/lib/js/sho/schedules/views/modals/slideshowalternate.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function(this_,that_)
    {


        var defaults = {
            'width':        485, //that_.defaults.width,
            'height':       400, //that_.defaults.height,
            'theme':        'metro',
            'orderBanner':  false,

            'events' : {
                'close' : 'resetState'
            }
        };

        sho.schedules.views.modals.Share = Class.create( _.extend({}, // <-- empty object to avoid polluting ingredients

            this_,
            that_, {

                '_KLASS_' : 'sho.schedules.views.modals.Share',
                'defaults' : defaults
            })
        )

        sho.schedules.views.modals.SchedulesShare = sho.schedules.views.modals.Share;

    }(sho.schedules.views.modals.BaseModal.prototype, sho.ui.modals.Share.prototype)
sho.loaded_modules['/lib/js/sho/schedules/views/modals/share.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	sho.schedules.views.modals.PrintableSchedule = Class.create(sho.schedules.views.modals.BaseModal,{

		_KLASS_ : 'sho.schedules.views.modals.PrintableSchedule',

		defaults: {
			height: 270,
			width: 640,
			title: 'printable schedules',
			content: '<p class="loading">Loading...</p>',
			'events' : {
                'close' : 'resetState'
            },
			date: new Date(),
			file_path: '/documents/schedules/'
		},

		currentMonthTemplate: new Template('<li><span>#{channel}</span><a href="#{link}">This Month</a></li>'),
		currentAndNextMonthTemplate: new Template('<li><span>#{channel}</span><a href="#{link1}">This Month</a> <a href="#{link2}">Next Month</a></li>'),
		channelListTemplate: new Template(
			'<div id="printable_sched" class="clearfix">'+
				'<h3>All schedules are downloadable PDFs.</h3>'+
				'<ul class="col1"> #{col1} </ul>'+
				'<ul> #{col2} </ul>'+
			'</div>'
		),

		pad: function(n){
			return n<10 ? '0'+n : n;
		},

		getPdfName: function(channel, nextMonth) {
			var	month = this.defaults.date.getMonth() +1;
			var year = this.defaults.date.getFullYear();
			if(nextMonth) {
				return [this.file_path, channel, "_", (month == 12 ? ++year : year), "_" , (month == 12 ? '01' : this.pad(++month)), '.pdf' ].join('');
			} else {
				return [this.file_path, channel, "_", year, "_" , this.pad(month), '.pdf' ].join('');
			}
		},

		buildChannelList: function(){
			var th = this, li, col1 = [], col2= [],	chList = [$w('ALL SHO SH2 SH3 SHB SHX'), $w('NXT WOM FAM FLX TMC TM2')];
			var uploadDay = (this.defaults.date.getUTCDate() >= 15) ? 2: 1;
			chList.each(function(list,i){
				list.each(function(ch){
					col = (i == 0) ? col1 : col2;
					li = uploadDay == 2 ? th.currentAndNextMonthTemplate.evaluate({channel: ch, link1: th.getPdfName(ch, false), link2: th.getPdfName(ch,true)}) : th.currentMonthTemplate.evaluate({channel: ch, link: th.getPdfName(ch, false)});
					col.push(li);
				})
			})
			this.setContent(this.channelListTemplate.evaluate({ "col1": col1.join(''), "col2": col2.join('') }));
		},

		refresh: function($super){
			$super();
			this.buildChannelList();
		}


	});


sho.loaded_modules['/lib/js/sho/schedules/views/modals/printableschedule.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.provide('sho.schedules.views.grid')
    sho.schedules.views.grid.Slider = Class.create({

        _KLASS_ : 'sho.schedules.views.grid.Slider',

        klass_names : {
            'handle' : 'grid-slider-handle',
            'track' : 'grid-slider-track'
        },

        initialize:function(cfg)
        {
            Object.extend(this, {
                'parent' : cfg.parent,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'lastValue' : 0,
                'ui' : {
                    'track' : cfg.container.select('.'+this.klass_names.track)[0],
                    'handle' : cfg.container.select('.'+this.klass_names.handle)[0]
                }
            });

            this.build();
        },

        build:function()
        {
            this.slider = new Control.Slider(
                this.ui.handle, this.ui.track,
			    {
        			onSlide : this.onSlide.bind(this),
        			onChange : this.onChange.bind(this)
    			}
    		);


    		if(this.lastValue !== undefined && this.lastValue !== 1)
    		{
    		    this.slider.setValue(this.lastValue);
    		    this.onSlide(this.lastValue)
    		}
        },

        onSlide:function(factor)
        {
            this.parent.update({
                'eventName' : 'slider:changed',
                'factor' : factor
            })
        },

        onChange:function(factor)
        {
            this.lastValue = factor;
            if(factor == 1) this.controller.addNextDay();
        },

        getValue:function()
        {
            return this.slider.value;
        },

        setValue:function(v)
        {
            this.slider.setValue(v);
        },

        destroy:function()
        {
            this.slider.dispose();
        },

        reset:function()
        {
            this.lastValue = this.getValue();
            if(this.lastValue == 1) this.lastValue = 0.5;   // jump to meridian

            this.destroy();
            this.build.bind(this).delay(sho.dom.REDRAW_DELAY);
        }


    });

sho.loaded_modules['/lib/js/sho/schedules/views/grid/slider.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.views.grid.Slice = Class.create({

        _KLASS_ : 'sho.schedules.views.grid.Slice',

        pixels_per_minute : 4,
        minimum_duration_for_display : 15,
        klass_names : { 'below_minimimum_duration' : 'minimized' },
        draw_debug_styles : false,

        show : new Template(['',
        '<li style="width:#{minutesInPixels}px;" class="#{klasses}">',
            '<a href="#{url}" class="no-hijack">',
                '<span class="title">#{showTitle}</span>',
                '<span class="airtime">#{time}</span>',
            '</a>',
        '</li>',
        ''].join('')),

        fn : {},

        initialize:function(cfg)
        {
            Object.extend(this, {
                'model' : cfg.model,
                'parent' : cfg.parent,
                'ui' : {
                    'container' : cfg.container
                }
            })

            this.fn.renderChannel = this.renderChannel.bind(this);
            this.fn.renderShow = this.renderShow.bind(this);
            this.build()
        },

        build:function()
        {
            this.ui.container.removeClassName('place-holder').select('.loading-msg').invoke('remove');
            this.ui.container.insert(this.model.getChannels().collect(this.fn.renderChannel).join(''));
            sho.schedules.views.grid.truncateTitles(this.ui.container);
            this.model.rendered = true;
        },

        renderChannel:function(channel,idx)
        {
            return (['<ul class="', (idx % 2 == 0 ? '' : 'alt'), '">', channel.showAiringList.collect(this.fn.renderShow), '</ul>']).flatten().join('')
        },

        renderShow:function(s)
        {
            s.visibleMinutes = this.getVisibleMinutes(s);
            s.klasses = this.getClassNames(s);
            s.minutesInPixels = this.minutesInPixels(s.visibleMinutes);
            return this.show.evaluate(s)
        },

        getVisibleMinutes:function(s)
        {
            var v = s.minutes;
            if(s.scheduleEdge)
            {
                if(s.scheduleEdge.position == 'BEGINNING')
                {
                    v = s.scheduleEdge.minutesAfter;
                }
                if(s.scheduleEdge.position == 'END')
                {
                    v = s.scheduleEdge.minutesBefore;
                }
            }
            return v;
        },

        minutesInPixels:function(mins)
        {
            return (mins * this.pixels_per_minute) - 1
        },

        getClassNames:function(s)
        {
            var klasses = [];
            if(s.scheduleEdge && this.draw_debug_styles)
            {
                klasses.push('edge-' + (s.scheduleEdge.position || '').toLowerCase());
            }
            if(s.visibleMinutes < this.minimum_duration_for_display)
            {
                klasses.push(this.klass_names.below_minimimum_duration)
            }
            return klasses.join(' ');
        }

    });

    Object.extend( sho.schedules.views.grid.Slice, {
        'place_holder' : ['',
            '<div class="grid-slice place-holder">',
                '<div class="grid-legend"></div>',
                '<p class="loading-msg">', sho.schedules.ajax_loading_text,'</p>',
            '</div>'
        ].join('')
    });


sho.loaded_modules['/lib/js/sho/schedules/views/grid/slice.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.views.grid.DatePicker = Class.create({

        _KLASS_ : 'sho.schedules.views.grid.DatePicker',

        cal_container_id : 'date-picker-calendar-container',
        title_height : 20,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'model' : cfg.model,
                'controller' : cfg.controller,
                'calendars' : [],
                'dates' : [Date.today(),Date.today().add(1).months()], // sets up initial range for the two calendars
                'ui' : {
                    'container' : cfg.container
                }
            })
            ;
            this.setHandlers();
            this.updateNextPrevControls.bind(this).delay(sho.dom.REDRAW_DELAY); // model needs a little time to populate the date object
            window.date_picker = this; // export to global scope for debugging
        },

        setHandlers:function()
        {
            this.ui.title = this.ui.container.select('.date-picker-control.title.toggle-cal')[0];
            this.ui.prev =  this.ui.container.select('.date-picker-control.prev-day')[0];
            this.ui.next =  this.ui.container.select('.date-picker-control.next-day')[0];
            this.ui.container.observe('click', this.click.bind(this));
        },

        click:function(e)
        {
            var el = e.findElement('.date-picker-control'); if(!el || el.hasClassName('disabled')) return;

            this.update({
                'eventName' : 'date_picker:' + (el.className.split(' ').last().gsub(/-/,'_')),
                'el' : el
            });
        },

        update:function(e)
        {

            if(e.eventName == 'view:click')
            {
                var el = e.event.findElement('div.date-picker-control'); if(!el) this.close();
            }

            if(e.eventName == 'date_picker:next_day')
            {
                this.controller.nextDay();
            }

            if(e.eventName == 'date_picker:prev_day')
            {
                this.controller.prevDay();
            }

            if(e.eventName == 'grid:date_changed' || e.eventName == 'grid:meridian_check')
            {
                this.updateHeader(e.date)
                this.setSelectedInCalendars(e.date);
                if(e.eventName == 'grid:date_changed') this.close();
            }

            if(e.eventName == 'date_picker:toggle_cal')
            {
                this.toggleCalendar(e.el);
            }
        },

        updateHeader:function(date)
        {
            this.ui.title.update(date.toString("ddd MMM d"));
            this.updateNextPrevControls(date)
        },

        updateNextPrevControls:function(date)
        {
            date = date || this.model.getDate();
            this.toggleControl('prev', this.disableDateChange('prev', date));
            this.toggleControl('next', this.disableDateChange('next', date));
        },

        setSelectedInCalendars:function(date)
        {
            this.calendars.each(function(c){
                c.setSelectedDate((c.date.getMonth() == date.getMonth() ? date : null));
            })
        },

        toggleCalendar:function(el)
        {
            if(!this.calendars.any())
            {
                this.buildCalendars(el.cumulativeOffset());
            }
            else
            {
                this.destroyCalendars();
            }
        },

        buildCalendars:function(offsets)
        {
            $$('body')[0].insert((['',
                '<div id="', this.cal_container_id,'" ',
                    'style="top:', (offsets[1]+this.title_height), 'px; left:', offsets[0], 'px;"',
                '>',
                    '<div class="col left"></div>',
                    '<div class="col right"></div>',
                '</div>',
            '']).join(''));

            var th=this; this.calendars = $(this.cal_container_id).select('.col').collect(function(el,idx){

                return new sho.ui.Calendar({
                    'container' : el,
                    'date' : th.dates[idx],
                    'onChange' : th.onDateChange,
                    'onChangeScope' : th,
                    'selected' : (function(){
                        var d=th.model.getDate(),
                            m=d.getMonth(),
                            t=Date.today().getMonth()
                        ;
                        return (idx == 0 && (m == t) || idx == 1 && (m  > t)) ? d : null

                    })()

                });
            });
        },

        onDateChange:function(date)
        {
            this.controller.navigate('/sho/schedules/date/' + date.toString(sho.schedules.slice_date_format));
        },


        disableDateChange:function(modifier, date)      // check to see if the date change operation would create a date that is out of window
        {
            var d = date.clone().add(modifier == 'next' ? 1 : -1).days(),
                check = modifier == 'next' ? 'dateIsAfterRange' : 'dateIsBeforeRange'
            ;   return this[check](d);
        },

        dateIsBeforeRange:function(prev)
        {
            var start = this.dates[0];
            var sameYear = prev.getYear() == start.getYear();
            return prev.getMonth() < start.getMonth() && sameYear;
        },

        dateIsAfterRange:function(next)
        {
            var end = this.dates[1];
            var sameYear = next.getYear() == end.getYear();
            return next.getMonth() > end.getMonth() && sameYear;
        },

        destroyCalendars:function()
        {
            this.calendars.each(function(c){c.destroy(); })
            this.calendars = [];
            $$('#'+ this.cal_container_id).invoke('remove');
        },

        toggleControl:function(ctrl, disable)
        {
            this.ui[ctrl][disable ? 'addClassName':'removeClassName']('disabled');
        },

        destroyCal:function(){ this.destroyCalendars(); },

        close:function(){ this.destroyCalendars(); }


    });


sho.loaded_modules['/lib/js/sho/schedules/views/grid/datepicker.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.views.grid.Grid = Class.create(sho.schedules.views.CompoundView, {

        _KLASS_ : 'sho.schedules.views.grid.Grid',

        pixels_per_minute : 4,
        slice_width : 5760, /* 24 hours at 4px per minute */
        margins : {
            'top' : 175,
            'bottom' : 64
        },
        fn : {},

        initControls:function()
        {
            var controlsCntr = sho.isTablet() ? this.ui.footer : this.ui.head;

            this.slider = new sho.schedules.views.grid.Slider({
                'container' : controlsCntr.select('.grid-slider-wrap')[0],
                'controller' : this.controller,
                'parent' : this,
                'model' : this.model
            });

            this.datePicker = new sho.schedules.views.grid.DatePicker({
                'container' : controlsCntr.select('.grid-date-select')[0],
                'controller' : this.controller,
                'model' : this.model
            });

            if(sho.isTablet())
            {
                this.moveDisclaimerToSecondaryNav(controlsCntr);
            }
        },

        moveDisclaimerToSecondaryNav:function(cntr)
        {
            ($$('.nav-secondary .inline.util')[0]).insert({
                'bottom' : ['<li><b>', cntr.select('.disclaimer')[0].remove().innerHTML, '</b></li>'].join('')
            })

        },

        setHandlers:function($super)
        {
            $super();

            this.fn.reset = this.reset.bind(this);
            Element.observe(window, 'resize', this.update.bind(this, { 'eventName' : 'window:resized' }).throttle(0.125));
            this.refresh.bind(this, false).delay(sho.dom.REDRAW_DELAY);

            this.ui.pane = this.ui.body.select('.grid-pane')[0];
            this.ui.data = this.ui.body.select('.grid-data')[0];

            sho.schedules.views.grid.truncateTitles.delay(sho.dom.REDRAW_DELAY, this.ui.data);

        },

        update:function($super, e)
        {
            $super(e);


            if(e.eventName == 'view:click')
            {
                this.datePicker.update(e);
            }

            if(e.eventName == 'slider:changed')
            {
                this.slidePane(e.factor);
                this.updatePickerIfCrossingMeridian(e.factor);
            }

            if(e.eventName == 'grid:date_changed' /* deprecated || e.eventName == 'grid:prev_day' || e.eventName == 'grid:next_day'*/)
            {
                this.updateDatePicker(e);
                this.clearSlices();
                this.insertEmptySlice();
                this.fn.reset.delay(sho.dom.REDRAW_DELAY);
            }

            if(e.eventName == 'grid:add_slice')
            {
                this.insertEmptySlice();
            }

            if(e.eventName == 'slice:loading' || e.eventName == 'window:resized')
            {
                this.refresh();
            }

            if(e.eventName == 'slice:loaded')
            {
                this.populateEmptySlices();
            }

            if(e.eventName == 'episode:loaded')
            {
                this.setModalDataAndRender();
            }

            if(e.eventName == 'grid:shift_slices')
            {
                this.removeFirstSlice();
                this.updateDatePicker(e);
            }

            if(e.eventName == 'grid:local_time_set')
            {
                var left = ((e.time.hour * 60) + e.time.minutes) * this.pixels_per_minute,
                f = left / (this.sliceWidth() - this.ui.pane.getWidth());
                this.slider.setValue(f);
                this.updatePane(left);
            }
        },

        reset:function()
        {
            this.updatePane(0);
            this.slider.setValue(0);
        },

        slidePane:function(factor)
        {
            this.updatePane(Math.floor(factor * (this.sliceWidth() - this.ui.pane.getWidth())));
        },

        updatePane:function(left)
        {
            this.ui.data.setStyle({
                'left' : (0-left) + 'px'
            })
        },

        refresh:function(resetSlider)
        {
            if(resetSlider !== false) this.slider.reset()

            this.ui.data.setStyle(sho.object.toPixels({'width': this.sliceWidth() }))


            var h = document.viewport.getHeight() - this.margins.top - this.margins.bottom;
            this.ui.body.setStyle({
			    'overflow-x': 'auto'
            })

        },

        updateDatePicker:function(e)
        {
            this.datePicker.update({
                'eventName' : e.eventName,
                'date':(e.date || this.model.getDate())
            });
        },

        clearSlices:function()
        {
            this.ui.data.select('.grid-slice').invoke('remove');
        },

        insertEmptySlice:function(cfg)
        {
            this.ui.data.insert({'bottom' : sho.schedules.views.grid.Slice.place_holder });
        },

        removeFirstSlice:function()
        {
            this.ui.data.select('.grid-slice')[0].remove();
        },

        populateEmptySlices:function()
        {
            var th=this,
                el = this.ui.data.select('.place-holder')[0],
                model = this.model.getPendingSlices()[0]
            ;
            var slice = new sho.schedules.views.grid.Slice({
                'model' : model,
                'parent' : th,
                'container' : el
            });
        },

        updatePickerIfCrossingMeridian:function(factor)
        {
            if(this.model.numSlices() > 1)
            {
                var date = factor > 0.49 ? this.model.getDate({'position':'next'}) : this.model.getDate();
                this.updateDatePicker({
                    'date': date,
                    'eventName' : 'grid:meridian_check'
                });
            }

        },


        sliceWidth:function()
        {
            return this.slice_width * (this.model.numSlices())
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/views/grid/grid.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.views.grid.truncateTitles = function(container){

        container.select('li:not(.minimized) a').select(function(el)
        {
            var dim = el.getDimensions();
            el._width = dim.width;
            el._height = dim.height;
            el._title = el.select('.title')[0];

            return el._height < el._title.getHeight()

        }).each(function(el){

            el.addClassName('truncated');

            el._title.innerHTML = '<em>'+ el._title.innerHTML.gsub(/\s/,'</em> <em>') + '</em>';

            sho.schedules.views.grid.truncateTitle(el);
        })

    };

    sho.schedules.views.grid.truncateTitle = function(el)
    {
        var tokens = el._title.select('em');

        if(tokens.length)
        {
            var t = tokens.last();

            if(el._title.getHeight() > el._height)
            {
                t.remove(); sho.schedules.views.grid.truncateTitle(el); //.delay(sho.dom.REDRAW_DELAY, el);
            }
            else
            {
                var w = t.getWidth() - 14; if(w > 0)
                {
                    t.setStyle({'width':w+'px'});
                }
                else
                {
                    t.remove();
                }

                el._title.insert({'bottom':'<em>...</em>'});
            }
        }
    }

sho.loaded_modules['/lib/js/sho/schedules/views/grid/helper.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.schedules.views.Product = Class.create({

        _KLASS_ : 'sho.schedules.views.Product',

        useMarkup : true,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'ui' : { 'container' : cfg.container }
            });

            this.setHandlers();
        },


        setHandlers:function()
        {
           this.ui.container.observe('click', this.click.bind(this));
        },

        click:function(e){
            this.update({
                'eventName':'view:click',
                'event' : e
            })
        },

        update:function(e)
        {

            if(e.eventName == 'view:click')
            {
                var el = e.event.findElement('.disclosure.all-airings, .product-art a'); if(el)
                {
                    e.event.stop(); this.controller.navigate(el.readAttribute('href').gsub(/^#/,''), e.event);
                }
            }

            if(e.eventName == 'detail:loading')
            {
                if(e.kind == 'airing-list')
                {
                    sho.schedules.views.Modal({
                        'type' : e.kind,
                        'parent' : this,
                        'content' : '<p class="loading">'+sho.schedules.ajax_loading_text+'</p>'
                    });
                }
            }

            if(e.eventName == 'detail:closed')
            {
                sho.ui.modals.destroy();
            }

            if(e.eventName == 'airinglist:loaded')
            {
                var detail = sho.ui.modals.instance();
                detail.data = this.model.getDetail().data;
                detail.render();
            }

			if(e.eventName == 'slideshow:loaded')
            {
                var model = this.model.getDetail(); if(!model || model.data.length < 1) return;

                var detail = sho.schedules.views.Modal({
                    'type' : 'slide-show',
                    'model' : this.model.getDetail(),
                    'parent' : this
                });
                detail.render();
            }

            if(e.eventName =='slideshow:image_changed')
            {

                var detail = sho.ui.modals.instance();
                detail.render();
            }
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/views/product.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.views.Modal = function(cfg)
    {
        return sho.ui.modals.create(cfg);
    }

sho.loaded_modules['/lib/js/sho/schedules/views.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.schedules.controllers');


    sho.schedules.analytics_map = {

        'show_title' :              (function(id,slug){
            return [this.getTrackingBase(), 'info', sho.string.humanize(slug), 'preview']
        }),

        'show_airings' :            (function(id,slug){
            return [this.getTrackingBase(), 'info', sho.string.humanize(slug), 'all airings']
        }),

        'set_image' :               (function(idx){
            idx = (idx>0) ? idx : 1; // start indexing at 1 instead of 0
            var page = sho.analytics.getData().page; // movies:info:24 hour party people(:all airings|images)*
            return [this.getTrackingBase(), 'info', page.split(':').splice(2,1), 'images', Number(idx)]
        }),

        'show_share_options' :      ['schedules', 'share'],

        'show_channel' :            (function(id,slug){
            return ['schedules','channels', sho.string.humanize(slug)]
        }),

        'about_on_demand' :         ['schedules','on demand','about'],

        'set_od_movie_genre' :      (function(id,slug){
            return ['schedules','on demand', sho.string.humanize(slug)]
        }),

        'show_series' :             (function(id,slug){
            return ['schedules','on demand','series', sho.string.humanize(slug)]
        }),

        'show_episode' :             (function(seriesName,seasonNumber,episodeNumber){
            return ['series', sho.string.humanize(seriesName), 'info', seasonNumber, episodeNumber, 'preview']
        }),

        'set_movie_genre' :         (function(id,slug){
            return ['movies','genre', sho.string.humanize(slug)]
        }),

        'set_movie_atoz_character': (function(c){
            return ['movies','genre', c]
        })

    };

    sho.schedules.analytics_map.show_images = sho.schedules.analytics_map.set_image.curry(0);

    sho.schedules.controllers.analytics = {}; _.extend(sho.schedules.controllers.analytics, {

        analytics_map : sho.schedules.analytics_map,

        getImpression:function(key, params)
        {
            if(!this.analytics_map[key]) return false;
            var arr = typeof this.analytics_map[key] !== 'function' ? this.analytics_map[key] : this.analytics_map[key].apply(this, params);
            return arr.length ? arr.join(':') : false;
        },

        getTrackingBase:function()
        {
            return typeof this.tracking_base == 'function' ? this.tracking_base.apply(this) : (this.tracking_base || 'unknown')
        },

        trackRoute:function()
        {
            var args = [].slice.apply(arguments),        // http://javascriptweblog.wordpress.com/2011/01/18/javascripts-arguments-object-and-beyond/
                route = args.shift().split('route:')[1], // route:show_title => show_title
                str = this.getImpression(route, args)
            ;
            if(str)
            {
                sho.analytics.getPageTracker({'reload':true}).trackPageView({ 'page' : str });
            }
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/controllers/analytics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.controllers.BaseController = _.extend({

        _KLASS_ : 'sho.schedules.controllers.BaseController',

        tracking_base : 'schedules',
        fn : {},

        initialize:function(cfg)
        {
            this.model = cfg.model;
            this.initSharedRoutes();
            this.initGalleryRoutes();
            this.initGridRoutes();
            this.initComedyRealityDocsRoutes();
            this.setRouteCallbacks();
            this.initHistory();
        },

        initSharedRoutes:function()
        {
            this.route('/titles/:ns_show_id/:title',        'show_title',           this.showTitle);
            this.route('/titles/:ns_show_id/:title/share',  'show_share_options',   this.showShareOptions);
            this.route('/video/titles/:video_id/:title',    'redirect_to_video',    this.redirectToVideo);
            this.route('/index',                            'index',                this.index);
        },

        initGalleryRoutes:function()
        {},

        initGridRoutes:function()
        {},

        initMoviesRoutes:function()
        {},

        initComedyRealityDocsRoutes:function()
        {},

        initHistory:function()
        {
            if(!Backbone.history.start()) this.navigate('/index');
        },

        setRouteCallbacks:function()
        {
            this.bind('all', function(eventName){
                if(eventName !== 'route:redirect_to_video') sho.video.destroy(); // close any player thay may be open when clicking the back button
                sho.schedules.controllers.analytics.trackRoute.apply(this, arguments);                          // perform analytics
            });

            sho.dom.bind('video_player:closed', this.onVideoClose.bind(this));
        },

        index:function()
        {
            sho.ui.modals.destroy();
        },

        navigate:function(url)
        {
            var fragment = url == '/index' ? url : sho.schedules.getFragment(url);
            fragment && Backbone.Router.prototype.navigate.call(this, fragment, true );
        },

        showTitle:function(id, slug)
        {
            this.model.setDetail({
                kind : 'title',
                id : id,
                slug : slug
            })
        },

        showShareOptions:function(id, slug)
        {
            this.model.setDetail({
                kind : 'share',
                backUrl : this.back_url || '/index'
            })
        },

        redirectToVideo:function(id, slug)
        {
            sho.video.load({ 'id' : id });
        },

        onVideoClose:function()
        {
            this.navigate(this.back_url||'/index');
        }

    },

    sho.schedules.controllers.analytics);

sho.loaded_modules['/lib/js/sho/schedules/controllers/basecontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.controllers.GridController = Backbone.Router.extend(Object.extend(sho.schedules.controllers.BaseController, {

        _KLASS_ : 'sho.schedules.controllers.GridController',


        initGridRoutes:function()
        {
            this.route('/channels/:id/:channel_slug',       'show_channel',         this.showChannel);
            this.route('/date/:date',                       'set_date',             this.setDate);
            this.route('/:series_name/season/:season_nbr/episode/:episode_nbr',
                                                            'show_episode',         this.showEpisode);
        },

        showEpisode:function(seriesName,seasonNumber,episodeNumber)
        {
            this.model.setDetail({
                kind : 'episode',
                seriesName : seriesName,
                seasonNumber : seasonNumber,
                episodeNumber : episodeNumber
            })
        },

        showChannel:function(id, slug)
        {
            this.model.setDetail({
                'kind' : 'channel',
                'id' : id
            })
        },

        setDate:function(date)
        {
            this.model.setDate(date);
        },

        snapToLocalTime:function()
        {
            this.model.setLocalTime();
        },

        addNextDay:function()
        {
            this.model.addNextDay();
        },

        nextDay:function()
        {
            this.model.nextDay();
        },

        prevDay:function()
        {
            this.model.prevDay();
        }

    }));

sho.loaded_modules['/lib/js/sho/schedules/controllers/gridcontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.controllers.GalleryController = Object.extend(
        Object.clone(sho.schedules.controllers.BaseController), // leave BaseController in pristine condition with Object.clone()
    {

        _KLASS_ : 'sho.schedules.controllers.GalleryController',

        initGalleryRoutes:function()
        {
            this.route('/about',                            'about_on_demand',          this.aboutOnDemand);

            this.route('/series/:series_id/:series_title',  'show_series',              this.showSeries);

            this.route('/series/:series_id/:series_title/episodes/:episode_number',
                                                            'set_selected_episode',     this.setSelectedEpisode);

            this.route('/series/:series_id/:series_title/page/:page_number',
                                                            'set_current_page',         this.setCurrentPageInEpisodeList);

			this.route('/series/:series_id/:series_title/page/:page_number/episodes/:episode_number',
                                                            'set_current_page_and_selected_episode', this.setCurrentPageAndSelectedEpisode);

            this.route('/sports/:series_id/:series_title',  'show_series',              this.showSeries);

            this.route('/sports/:series_id/:series_title/episodes/:episode_number',
                                                            'set_selected_episode',     this.setSelectedEpisode);

            this.route('/sports/:series_id/:series_title/page/:page_number',
                                                            'set_current_page',         this.setCurrentPageInEpisodeList);

            this.route('/sports/:series_id/:series_title/page/:page_number/episodes/:episode_number',
                                                            'set_current_page_and_selected_episode', this.setCurrentPageAndSelectedEpisode);

            this.route('/index/page/:page_number',          'set_page_in_collection',   this.setCurrentPageInCollection);
            this.route('/airings/:ns_shows_id/:title',      'show_airings',             this.showAirings);



        },

        index:function()
        {
            sho.schedules.controllers.BaseController.index.apply(this);
        },

        showSeries:function(id, slug)
        {
            this.model.setDetail({
                kind : 'series',
                id : id,
                slug : slug
            })
        },

        showAirings:function(id, slug)
        {
            this.model.setDetail({
                'kind' : 'airing-list',
                'id' : id,
                'slug' : slug
            })
        },

        setSelectedEpisode:function(seriesId, seriesSlug, episodeNbr)
        {
			this.model.setSelectedEpisode(seriesId, seriesSlug, Number(episodeNbr));
        },

        setCurrentPageInEpisodeList:function(seriesId, seriesSlug, page)
        {
			this.model.setCurrentPageInEpisodeList(seriesId, seriesSlug, Number(page));
        },

        setCurrentPageAndSelectedEpisode:function(seriesId, seriesSlug, page, episodeNbr)
        {
			this.model.setSelectedEpisode(seriesId, seriesSlug, Number(episodeNbr));
        },

        getNextOrPreviousPageInEpisodeList:function(mode, baseurl)
        {
            var p = this.model.getDetail().paginator['get'+mode+'Page']();
            this.navigate([ baseurl, 'page', p].join('/'));
        },

        getNextPageInEpisodeList:function()
        {
            this.getNextOrPreviousPageInEpisodeList('Next', arguments[0])
        },

        getPrevPageInEpisodeList:function()
        {
            this.getNextOrPreviousPageInEpisodeList('Previous', arguments[0])
        },

        setOnDemandMovieGenre:function(id, slug)
        {
            this.model.setGenre({
               'id' : id,
               'slug' : slug
            });
        },

        aboutOnDemand:function()
        {
            this.model.setDetail({
                'kind' : 'about'
            })
        },

        setViewMode:function(mode)
        {
            this.model.setViewMode(mode);
        },

        setCurrentPageInCollection:function(page)
        {
            this.model.setCurrentPageInCollection(Number(page));
        },

        getNextOrPreviousPageInCollection:function(mode, baseurl)
        {
            if(this.model.collection)
            {
                var p = this.model.collection['get'+mode+'Page']();
                this.navigate([ baseurl, 'page', p].join('/'));
            }
            else
            {
                log('get next/prev called when model.collection is null!');
            }
        },

        getNextPageInCollection:function()
        {
            this.getNextOrPreviousPageInCollection('Next', arguments[0])
        },

        getPrevPageInCollection:function()
        {
            this.getNextOrPreviousPageInCollection('Previous', arguments[0])
        }

    });


sho.loaded_modules['/lib/js/sho/schedules/controllers/gallerycontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.controllers.OnDemandController = Backbone.Router.extend(Object.extend(sho.schedules.controllers.GalleryController, {

        _KLASS_ : 'sho.schedules.controllers.OnDemandController',

        index:function()
        {
            sho.schedules.controllers.BaseController.index.apply(this);
        }

    }));


sho.loaded_modules['/lib/js/sho/schedules/controllers/ondemandcontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.controllers.ProductController = Backbone.Router.extend(Object.extend(sho.schedules.controllers.BaseController, {

        _KLASS_ : 'sho.schedules.controllers.ProductController',


        tracking_base : 'movies', //naively assume all products are movies for now...

        initialize:function(cfg)
        {
            this.model = cfg.model;
            this.route('/airings/:ns_shows_id/:title',  'show_airings', this.showAirings);
            this.route('/images',                       'show_images',  this.showImages);
            this.route('/images/:image_index',          'set_image',    this.setImage);
            this.route('/index',                        'index',        this.index);
            this.setRouteCallbacks();
            this.initHistory();
        },


        initHistory:function()
        {
            var initialRoute = Backbone.history.start(); if(!initialRoute)
            {
                this.navigate('/index');
            }
        },

        showAirings:function(id, slug)
        {
            this.model.setDetail({
                'kind' : 'airing-list',
                'id' : id,
                'slug' : slug
            })
        },

        showImages:function()
        {
            this.model.setDetail({
                'kind' : 'slide-show'
            });

            sho.dom.trigger('photogallery:opened');
        },

        setImage:function(i)
        {
            var idx = Number(i)-1;
            if(this.model.getDetail())
            {
                this.model.getDetail().setIndex(idx);
            }
            else
            {
                this.showImages() // should be able to pass in the index and jump to appropriate photo here
            }
        }

    }));


sho.loaded_modules['/lib/js/sho/schedules/controllers/productcontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/schedules/controllers.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.Gallery = Class.create({

        _KLASS_ : 'sho.schedules.Gallery',

        'model_class' : 'sho.schedules.models.Gallery',
        'view_class' : 'sho.schedules.views.ondemand.Gallery',
        'controller_class' : 'sho.schedules.controllers.OnDemandController',
        'include_genres_in_list_view' : false,

        initialize:function(cfg)
        {
            _.extend(this, {
                'id' : cfg.id || null,
                'category' : cfg.category,
                'dataSrc' : cfg.dataSrc,
                'container' : cfg.container,
                'params' : cfg.params,
                'galleryType' : cfg.galleryType
            });

            this.initView();
            this.initModel();
            this.initController();
        },

        initView:function()
        {
            var klass =  eval(this.view_class); this.view = new klass({
                'container' : this.container,
                'useMarkup' : true, // fundamental shift towards in-page galleries
                'galleryType' : this.galleryType,
            });
        },

        initModel:function()
        {
            var klass = eval(this.model_class); this.model = new klass({
                'category' : this.category,
                'view' : this.view,
                'dataSrc' : this.dataSrc,
                'params' : this.params,
                'pagination' : this.pagination,
                'galleryType' : this.galleryType
            })
            this.view.model = this.model;
        },

        initController:function()
        {
            var klass = eval(this.controller_class); this.controller = new klass({
                'model' : this.model
            });
            this.view.controller = this.controller;

        },

        navigate:function(url)
        {
            this.controller.navigate(url);
        }
    });


sho.loaded_modules['/lib/js/sho/schedules/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.schedules.Grid = Class.create({

        _KLASS_ : 'sho.schedules.Grid',

        initialize:function(cfg)
        {
            _.extend(this, {
                'dataSrc' : cfg.dataSrc,
                'container' : cfg.container,
                'params' : cfg.params
            });

            this.initView(); this.initModel(); this.initController();
        },

        initView:function()
        {
            this.view = new sho.schedules.views.grid.Grid({
                'container' : this.container,
                'useMarkup' : true // initial page of grid data is in-page.
            });
            window.view = this.view;
        },

        initModel:function()
        {
            this.model = new sho.schedules.models.Grid({
                'view' : this.view,
                'dataSrc' : this.dataSrc,
                'params' : this.params
            });
            this.view.model = this.model;
            window.model = this.model;
        },

        initController:function()
        {
            this.controller = new sho.schedules.controllers.GridController({
                'model' : this.model
            });
            this.view.controller = this.controller;
            this.controller.snapToLocalTime.bind(this.controller).delay(sho.dom.REDRAW_DELAY);
            window.controller = this.controller
        }

    });

sho.loaded_modules['/lib/js/sho/schedules/grid.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.schedules.Product = Class.create({

        _KLASS_ : 'sho.schedules.Product',

        initialize:function(cfg)
        {
            this.container = cfg.container;
            this.initView();this.initModel();this.initController();

             if(sho.env.browser().isIE) { sho.schedules.concerns.removeVendorTrailerLinks(); }
        },

        initView:function()
        {

            this.view = new sho.schedules.views.Product({
                'container' : this.container
            });
        },

        initModel:function()
        {
            this.model = new sho.schedules.models.Product({
                'view' : this.view
            })
            this.view.model = this.model;
        },

        initController:function()
        {
            this.controller = new sho.schedules.controllers.ProductController({
                'model' : this.model
            });
            this.view.controller = this.controller
        }

    });


sho.loaded_modules['/lib/js/sho/schedules/product.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/schedules.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.movies');

    sho.provide('sho.movies.concerns')
    sho.movies.concerns =
    {

        'pages_in_range' : 10,  // set in spring-config/business.xml
        'items_in_page' : 20,   // ''
        'include_genres_in_list_view' : true, // set staticly across the board, for now. bugzilla #561763

        getAiringsUrl:function(url)
        {
            return url.gsub(/sho\/(movies|reality-docs|comedy)\/titles/,'sho/airings')
        },

        getGenrePseudoUrl:function(url)
        {
            return url.gsub(/sho\/movies/,'sho/movies/genre');
        }

    }
    ;

    Object.extend(sho.movies, sho.movies.concerns);

sho.loaded_modules['/lib/js/sho/movies/concerns.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.movies.models');

    sho.movies.models.Collection = Class.create(sho.schedules.models.BaseModel, Object.extend({

        _KLASS_ : 'sho.movies.models.Collection',

        base_url : '/rest/movies',
        always_use_stub_url : false,
        stub_url : '/!/movies/action.js',
        localStore : 'collection_data',
        root_node : 'data.pageItemList',
        noisy_logging : false,
        is_paginated : true,


        url:function()
        {
            var url = [this.base_url];
            if(this.galleryType == 'genre')
            {
                url.push(this.params.genre.id);
                url.push(this.params.genre.slug);
            }
            if(this.galleryType == 'all-movies')
            {
                url.push('all-movies');
            }
            if(this.galleryType == 'a-to-z')
            {
                url.push('a-to-z');
                url.push(this.params['char']);
            }
            return this.always_use_stub_url ? this.stub_url : this.paginatedUrl(url.join('/'));

        }

    }, sho.schedules.models.Paginateable))


sho.loaded_modules['/lib/js/sho/movies/models/collection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.movies.models.Gallery = Class.create(sho.schedules.models.Gallery, {

        _KLASS_ : 'sho.movies.models.Gallery',

        initCollection:function()
        {
            var k = this._KLASS_.match(/(.+)\.Gallery/)[1] + '.Collection', klass = eval(k);

            this.collection = new klass({
                'category' : this.category,
                'view' : this.view,
                'dataSrc' : this.dataSrc,
                'params' : this.params,
                'pagination' : this.pagination,
                'galleryType' : this.galleryType
            })
        }


    });


sho.loaded_modules['/lib/js/sho/movies/models/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/movies/models.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	sho.provide('sho.movies.views');


    sho.movies.views.GalleryControl = Class.create({

        _KLASS_ : 'sho.movies.views.GalleryControl',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'parent' : cfg.parent,
                'ui' : { 'container' : cfg.container }
            });

            this.build();
            this.setHandlers();
        },

        build:function()
        {
        },

        setHandlers:function()
        {
            var th=this; this.ui.innerCnt.observe('click', function(e){
                th.update({
                    'eventName':'click',
                    'event' : e
                });
            })
        },


        update:function(e)
        {

            if(e.eventName == 'collection:loading')
            {
                this.ui.innerCnt.hide();
            }

            if(e.eventName == 'collection:loaded')
            {
                this.ui.innerCnt.show();
            }
        }



    });

sho.loaded_modules['/lib/js/sho/movies/views/gallerycontrol.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.movies.views.ViewToggle = Class.create(sho.movies.views.GalleryControl, {

        _KLASS_ : 'sho.movies.views.ViewToggle',

        mode : 'grid',

        build:function()
        {
            this.ui.container.insert({
            'bottom' : ['',
                '<div class="left gallery-control view-toggle">',
                    '<span class="view-mode images aktiv">images</span>',
                    '<span class="view-mode list">list</span>',
                '</div>',
            ''].join('')
            });
            this.ui.innerCnt = (this.ui.container.select('.view-toggle')[0]);
        },


        update:function($super, e)
        {
            $super(e);

            if(e.eventName == 'click')
            {
                var el = e.event.findElement('.view-mode'); if(el)
                {
                    e.event.stop();
                    this.parent.controller.navigate('/index/' + el.className.match(/\s(images|list)/)[1]);
                }
            }

            if(['view_mode:changed','collection:loaded'].include(e.eventName))
            {
                this.highlightActive(e.viewMode)
            }
        },

        highlightActive:function(mode)
        {
            this.ui.innerCnt.select('.view-mode').invoke('removeClassName','aktiv').find(function(el){
                return el.hasClassName(mode);
            }).addClassName('aktiv');
        }



    });

sho.loaded_modules['/lib/js/sho/movies/views/viewtoggle.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.movies.views.Paginator = Class.create(sho.movies.views.GalleryControl, {

        _KLASS_ : 'sho.movies.views.Paginator',


        build:function()
        {
            this.ui.container.insert({ 'bottom' : '<div class="right gallery-control pagination"></div>'});
            this.ui.innerCnt = this.ui.container.select('.pagination')[0];
            this.render();
        },

        update:function($super, e)
        {

            $super(e); if(e.eventName == 'click')
            {
                var el = e.event.findElement('span.next, span.prev, span.page'); e.event.stop();

                if(el && el.className.match(/(page|next|prev)/))
                {
                    var url = '/index'; // Backbone.history.getFragment().gsub(/\/(episodes|page)\/(.+)/,'');

                    if(['next','prev'].include(el.className))
                    {
                        var page = el.className, fn = ('get-'+page+'-page-in-collection').camelize();
                        this.parent.controller[fn](url);
                    }
                    else
                    {
                        url += '/page/'+ el.innerHTML.toLowerCase()
                        this.parent.controller.navigate(url);
                    }
                }
            }

            if(e.eventName == 'collection:loaded')
            {
                this.render();
            }
        },

        render:function()
        {
            var th=this, c = this.parent.model.collection, p = {}, useElipsis, elipsisMode, pagination=[];
            $w('currentPage numPages startRange endRange').each(function(property){
                p[property] = c[('get-'+property).camelize()](); // 'currentPage' => 'getCurrentPage'
            });

            if(p.numPages > 1)
            {

                useElipsis = (p.startRange > 1 || (p.numPages - p.endRange) > 0);
                elipsisMode = p.startRange > 1 ? 'start' : 'end';

                if(p.currentPage > 1)
                {
                     pagination.push('<span class="prev">Previous</span>');
                }

                if(useElipsis && elipsisMode == 'start')
                {
                     pagination.push('<span class="page">1</span><span class="elipsis">...</span>');
                }

                ($R(p.startRange,p.endRange)).each(function(i){
                    pagination.push('<span class="page' + (i==p.currentPage ? ' aktiv' : '') +'">'+(i)+'</span>');
                });

                if(useElipsis && elipsisMode == 'end')
                {
                    pagination.push('<span class="elipsis">...</span><span class="page">' + p.numPages + '</span>');
                }

                if(p.endRange !== p.currentPage)
                {
                    pagination.push('<span class="next">Next</span>');
                }

            }

            this.ui.innerCnt.update(pagination.join(''));
        }
    });

    sho.schedules.views.ondemand.Paginator = sho.movies.views.Paginator;


sho.loaded_modules['/lib/js/sho/movies/views/paginator.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.movies.views.GalleryListItem = Class.create({

        _KLASS_ : 'sho.movies.views.GalleryListItem',

        'header' : [
            '<tr class="header">',
                '<th>Title</th>',
                '<th>Genres</th>',
                '<th>On TV</th>',
                '<th>On Demand</th>',
                '<th class="last">Showtime Anytime</th>',
            '</tr>'
            ].join(''),

        'item' : new Template([
            '<tr class="#{klasses}">',
                '<td>',
                    '<a class="title #{redirect}" href="#{url}">#{title}</a><br />',
                    '#{video}',
                '</td>',
                '#{genres}',
                '<td>',
                    '#{nextAiring}',
                '</td>',
                '<td class="on-demand">#{onDemand}</td>',
                '<td class="anytime last">',
                    '#{anyTime}',
                '</td>',
            '</tr>'
        	].join('')),

    	'temporalAvailabilityFlag' : new Template([
    	    '#{startDate} - #{endDate}','#{br}',
            '<b class="#{klass} flag">#{flagText}</b>',
            '#{anytimeLink}'
    	].join('')),


        initialize:function(cfg)
        {
            Object.extend(this, {
                'index' : cfg.index,
                'title' : cfg.title,
                'featured' : ['true',true].include(cfg.isFeatured),
                'redirect' : ['true',true].include(cfg.redirect),
                'url' : cfg.url,
                'onDemand' : cfg.onDemand,
                'anyTime' : cfg.anyTime,
                'nextOn' : cfg.nextOn,
                'genreSet' : cfg.genreSet || [],
                'video' : cfg.video,
                'includeGenres' : cfg.includeGenres
            });
        },

        toStr:function()
        {
            var klasses = [
                this.index % 2 == 0 ? 'alt' : '',
                this.featured ? 'featured' : ''
            ].join(' ');
            return this.item.evaluate({
                'klasses' : klasses,
                'title' : this.title,
                'genres' : (this.includeGenres ? ['<td>',this.getGenres(),'</td>'].join('') : ''),
                'video' : this.getVideo(),
                'url' : this.url,
                'redirect' : this.redirect ? 'no-hijack' : '',
                'nextAiring' : this.getNextAiring(),
                'onDemand' : this.getTemporalAvailability('onDemand'),
                'anyTime' :  this.getTemporalAvailability('anyTime')
            });
        },

        getNextAiring:function()
        {
            return !!this.nextOn ? ([
                this.nextOn.date, ' ', this.nextOn.time, ' on ', this.nextOn.channel.name, '<br />',
                '<a href="', sho.movies.getAiringsUrl(this.url), '" class="disclosure all-airings">Upcoming Airings</a>',
            ].join('')) : 'Not Available';
        },

        getTemporalAvailability:function(t)
        {
            var data = this[t],
                k = t == 'anyTime' ? 'anytime' : 'on-demand',
                learnMoreLink = t == 'anyTime' ? '<br/><a href="/sho/showtime-anytime" class="disclosure no-hijack">LEARN MORE</a>' : '',
                flagtxt = (data || {'status':''}).status.gsub(/_/,' ').toLowerCase()
            ;
            return !!data ? this.temporalAvailabilityFlag.evaluate({
                'flagText' : flagtxt,
                'klass' : k+' '+(data.status.gsub(/_/,'-').toLowerCase()),
                'startDate' : data.startDate,
                'endDate' : data.endDate,
                'br' : flagtxt !== 'available' ? '<br />' : '',
                'anytimeLink' : t == 'anyTime' ? '<br/><a href="' + data.url + '" class="disclosure no-hijack">WATCH NOW</a>' : ''
            })
            :
            'Not Currently Available' + learnMoreLink;
        },

        getGenres:function()
        {
            return this.genreSet.collect(function(g){
                return '<a href="' + sho.movies.getGenrePseudoUrl(g.url) + '">' + g.value + '</a>'
            }).join(', ')
        },

        getVideo:function()
        {
            return !!this.video ? ([
                '<a class="video" href="', this.video.url, '">Trailer</a>'
            ].join('')) : ''
        }

    });

    sho.movies.views.GalleryListItem.getHeader = function(cfg)
    {
        var h = sho.movies.views.GalleryListItem.prototype.header;
        return cfg.includeGenres ? h : h.gsub(/<th>Genres<\/th>/,'');
    }


sho.loaded_modules['/lib/js/sho/movies/views/gallerylistitem.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.movies.views.Gallery = Class.create(sho.schedules.views.ondemand.Gallery, {

        _KLASS_ : 'sho.movies.views.Gallery',

        controls : {},
        regions :  $w('head footer'),
        has_list_view : true,

        initControls:function($super)
        {
            $super();

            this.ui.header = this.ui.head.select('h2')[0];
        },

        update:function($super, e)
        {

            $super(e);

            if(e.eventName == 'view_mode:changed')
            {
                sho.ui.modals.close();
                this.ui.body.className = 'body gallery '+ e.viewMode;
                this.updateControlsWithDelay(e);
                this.render();
            }

            if(e.eventName == 'page:changed')
            {
                this.ui.body.addClassName('loading').update('');
            }

            if(e.eventName == 'collection:loaded')
            {
                this.ui.body.className = 'body gallery '+ e.viewMode; // need this to make availability flags visible
            }

            if(e.eventName == 'gallery:type_changed')
            {
                this.updateBody(e);
            }

            if(['gallery:type_changed','gallery:params_changed'].include(e.eventName))
            {
                this.updateHeader(e);
            }
        },

        renderAsList:function()
        {
            var includeGenres = this.includeGenresInListView;

            this.ui.body.removeClassName('loading').update(['',
            '<table width="100%">',

                (sho.movies.views.GalleryListItem.getHeader({
                    'includeGenres' : includeGenres
                })),

                (this.model.getCollection().collect(function(item,index)
                {
                    return new sho.movies.views.GalleryListItem(_.extend(item, {
                        'index' : index,
                        'redirect' : this.galleryType == 'series', // comedy and reality/docs series thumbs don't get hijacked
                        'includeGenres' : includeGenres
                    })).toStr();
                })),

            '</table>',
            ''].flatten().join(''));

            this.afterRender.bind(this).delay(sho.dom.REDRAW_DELAY);
        },

        updateControlsWithDelay:function(e)
        {
            if(!this.viewToggle)
            {
                this.updateControls.bind(this).delay(sho.dom.REDRAW_DELAY, e);
            }
            else
            {
                this.updateControls(e);
            }
        },

        updateBody:function(e)
        {
            var cls = e.type == 'a-to-z' ? ['genre','a-to-z'] : ['a-to-z','genre'];
            sho.dom.body().removeClassName(cls.shift()).addClassName(cls.shift());

            var fn = e.type == 'a-to-z' ? 'openAtozNav' : 'closeAtozNav'; sho.movies.gallery[fn]();
        },


        updateHeader:function(e)
        {
            if(this.model.galleryType == 'a-to-z')
            {
                this.ui.header.update('&nbsp;'); // header is little more than a shim in atoz mode
                sho.movies.gallery.highlightActiveChar(this.model.params['char']);
            }

            if(this.model.galleryType == 'genre')
            {
                if(this.model.params.genre && this.model.params.genre.slug)
                {
                    this.ui.header.update(this.model.params.genre.slug.gsub(/-/,' '))
                }
            }
        }


    });

sho.loaded_modules['/lib/js/sho/movies/views/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/movies/views.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

	sho.provide('sho.movies.controllers');

    sho.movies.controllers.GalleryController = Backbone.Router.extend(Object.extend(
        Object.clone(sho.schedules.controllers.GalleryController), // leave GalleryController in pristine condition with Object.clone()
    {

        _KLASS_ : 'sho.movies.controllers.GalleryController',

        tracking_base : 'movies',

        index:function()
        {
            sho.schedules.controllers.BaseController.index.apply(this);
        }

    }));


sho.loaded_modules['/lib/js/sho/movies/controllers/gallerycontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/movies/controllers.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.movies.Gallery = Class.create(sho.schedules.Gallery, {

        _KLASS_ : 'sho.movies.Gallery',

        'model_class' : 'sho.movies.models.Gallery',
        'view_class' : 'sho.movies.views.Gallery',
        'controller_class' : 'sho.movies.controllers.GalleryController',
        'include_genres_in_list_view' : true,

        initialize:function($super,cfg)
        {
            $super(cfg);
            this.nav = sho.ui.getComponent('sho-ui-nav-navigator').getComponent('secondary');
            if(this.galleryType == 'a-to-z')
            {
                this.openAtozNav.bind(this).delay(sho.dom.REDRAW_DELAY * 2);
            }
        },

        openAtozNav:function()
        {
            this.nav.activeItem = this.nav.items[1]; this.nav.setActiveItem();
            this.highlightActiveChar(this.params['char']);
        },

        closeAtozNav:function()
        {
            this.nav.close();
            this.highlightActiveChar(null)
        },

        highlightActiveChar:function(c)
        {
            this.nav.ui.container.select('#nav-content-a-to-z li').each(function(el){
                el.className = el.id == ('char-'+c) ? 'aktiv' : '';
            });
        }


    })
sho.loaded_modules['/lib/js/sho/movies/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/movies.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.provide('sho.series');

	sho.provide('sho.series.news');
    sho.series.news = Class.create({

		deliciousURL : 'http://feeds.delicious.com/v2/rss/showtimeonline/',
		tumblrURL : 'http://showtimeallaccess.tumblr.com/tagged/news/rss',
		countParam : '?count=',
		deliciousPageLimit : 5,
		deliciousModalLimit : 40,
		errors : 0,
		tumblrCount : 100, // arbitrary number; need to pull back and parse by category so '4 most recent' won't cut it
		displayLimit : 3, // consider passing in
		feed : [],
		feedCount : 0,
		changeoverDate : new Date("November 08, 2011 17:30:00"), // titles/authors are reversed in delicious before this date

        initialize:function(cfg)
        {
			Object.extend(this, {
                'deliciousTag' : cfg.deliciousTag,
				'container' : cfg.container
            });
			this.container.addClassName('loading');
			this.loadFeeds(this.deliciousPageLimit);
			this.initModal();
        },

		loadFeeds:function(deliciousCount)
		{
			deliciousCount = 40;

			var feedURL = this.deliciousURL + this.deliciousTag + this.countParam + deliciousCount;
			var deliciousFeed = new google.feeds.Feed(feedURL);

			deliciousFeed.setNumEntries(deliciousCount);
			deliciousFeed.setResultFormat(google.feeds.Feed.JSON_FORMAT);
			deliciousFeed.load(function(result) { this.buildArray(result, 'delicious'); }.bind(this));

			var tumblrFeed = new google.feeds.Feed(this.tumblrURL);
			tumblrFeed.setNumEntries(this.tumblrCount);
			tumblrFeed.setResultFormat(google.feeds.Feed.JSON_FORMAT);
			tumblrFeed.load(function(result) { this.buildArray(result, 'tumblr'); }.bind(this));
        },

		buildArray:function(result, feedSource)
		{
			this.container.removeClassName('loading');

			if (result.error || result.feed.entries < 1) {
				this.errors++;
			}
			else {
				result.feed.entries.each(function(entry) {
				  entry.isValid = false;
				  if (feedSource == 'tumblr') {
					entry.categories.each(function(category) {
						if (category == this.deliciousTag) { entry.isValid = true; }
					}.bind(this));
				  }
				  else {
				   	entry.isValid = true;
				  }

				  if (entry.isValid == true) {
					entry.feedSource = feedSource;
					entry.convertedDate = new Date(entry.publishedDate);
					this.feed.push(entry);
				  }
				}.bind(this));
			}

			this.feedCount++;

			if (this.feedCount > 1 && this.feed.length > 0){
				this.feed.sort(this.sortArrayByDate);
				this.writeFeed(this.displayLimit, this.container);
				if ($$('.news-more')[0]) { $$('.news-more')[0].setStyle({'display':'block'}); }
			}
			else if (this.errors > 1) { this.notAvailable(); }

		},

		notAvailable:function()
		{
			$$('.news-feed')[0].update('<p>Not currently available.</p>');
		},

		writeFeed:function(limit, container)
		{
		    log('|news| writeFeed');
			for(i=0;i<limit;i++) {
			    var entry = this.feed[i];
				if (!entry) { return; }
				var p = new Element('p', {'class':'entry'});
				if (entry.feedSource == 'delicious') {
					var description = entry.content;
					var endPoint = description.indexOf('<span');
					if (endPoint != -1) { endPoint = 0; }
					var newDescription = description.slice(0, endPoint);
					if (entry.title) {
						if (entry.convertedDate < this.changeoverDate) {
							p.innerHTML = '<a href="' + entry.link + '">' + description.unescapeHTML() + '</a><br />';
							p.innerHTML += '<em>by ' + entry.title + ' - ' + entry.convertedDate.toDateString() + '</em>';
						}
						else {
							p.innerHTML = '<a href="' + entry.link + '">' + entry.title + '</a><br />';
							p.innerHTML += '<em>by ' + description.unescapeHTML() + ' - ' + entry.convertedDate.toDateString() + '</em>';
						}
						}
				}
				if (entry.feedSource == 'tumblr') {
					var description = entry.content;
					var endPoint = description.indexOf('<span');
					var newDescription = description.slice(0, endPoint);
					if (entry.title) {
						var pubDate = new Date(entry.publishedDate);
						p.innerHTML = '<a href="' + entry.link + '">' + entry.title + '</a><br />';
						p.innerHTML += '<em>by Showtime All Access - ' + entry.convertedDate.toDateString() + '</em>';
						}
				}
				container.appendChild(p);
			}


			var t = sho.analytics.getTracker(); t.debug = true;
			container.select('a').invoke('observe','click', function(e){
				t.trackClick({ 'click' : 'in_the_news' });
			});
		},

		initModal:function()
		{
			var newsModalLink = $$('.news-modal-link')[0];
			newsModalLink.observe('click', function(e){
                e.stop();
                this.newsModal();
            }.bind(this));
		},

		sortArrayByDate:function(s1, s2)
		{
			if (s1.convertedDate > s2.convertedDate) return -1;
			if (s1.convertedDate < s2.convertedDate) return 1;
			return 0;
		},

		newsModal:function()
        {
			var newsModal = sho.ui.modals.create({
                'type' : 'base',
                'title' : 'News',
                'width' : 500,
                'height' : 500,
                'content' : '<div class="news-modal-feed"></div>'
            });

			this.container = $$('.news-modal-feed')[0];
			this.writeFeed(40, this.container);


        }

    });

sho.loaded_modules['/lib/js/sho/series/news.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

 	sho.provide('sho.series.fauxcarousel');

    sho.series.fauxcarousel.Thumb = Class.create({

        _KLASS_ : 'sho.series.fauxcarousel.Thumb',

        parent:null,
        container:null, /* <div class="docked carousel-thumb" /> */
        view : new Template(['',
            '<div id="#{id}" class="thumb #{last}" style="',
                'width:#{width}; ',
            '">',
                '<div class="thumb-inner" style="background-image: url(#{src});">',
                    '<div class="thumb-indicator"></div>',
                    '<div class="title">',
                        '<b>#{title}</b>',
                    '</div>',
                '</div>',
            '</div>',
        ''].join("\n")),

        thumb_source_dimensions : '192x120',
        thumb_height : 90,
        thumb_width : 144,
        image_ratio : 0.625, // 90/144
        base_id : 'carousel-thumb-',

        indicator_styles : {
            aktiv_expanded  : 'height:6px;',
            aktiv_collapsed : 'height:6px;',
            idle_expanded   : 'height:6px;',
            idle_collapsed  : 'height:0px;'
        },

        expanded : true,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'ui' : {},
                'parent' : cfg.parent,              // <filmstrip.js>
                'index' : cfg.index,                // Number
                'id' : this.base_id + cfg.index,    // 'div-id-prefix+index'
                'width' : cfg.width,                // '68.3%'
                'title' : cfg.title,                // 'Quantum of Solace'
                'src' : this.getSrc(cfg.src),
                'useShims' : cfg.useShims,
                'aktiv' : false,
                'last' : cfg.last ? ' last'  : ''   // css hook for pseudos
            });
            this.build();
        },

        getSrc:function(src)
        {
            return src.gsub(/(\d{1,4}x\d{1,4})\.(\D{3})/,this.thumb_source_dimensions + '.#{2}');
        },

        build:function()
        {
            this.parent.ui.innerCnt.insert({
                'bottom' : this.view.evaluate(this)
            });

            this.ui.container = this.parent.ui.innerCnt.select('.thumb:last-child')[0];
            this.ui.innerCnt = (this.ui.container.select('.thumb-inner')[0]);
            this.ui.indicator = this.ui.container.select('.thumb-indicator')[0];
            if(this.useShims) this.drawShim();
        },

        drawShim:function()
        {
            this.parent.ui.container.addClassName('shimmed');
            this.ui.container.setStyle({
                'overflow':'hidden'         // why?
            });
            this.ui.innerCnt.setStyle({
               'background':'none'          // we moved the bg graphic into innerCnt for more accurate margins
            });

            this.ui.innerCnt.insert({'top':'<div class="shim"><div class="shim-inner"></div></div>'});
            this.ui.shim = (this.ui.innerCnt.select('.shim-inner')[0]);
            this.ui.shim.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\',sizingMethod=\'scale\')';
        },


        update:function(e)
        {
            var state = '';

            if(['model:start','model:next','model:set_panel','filmstrip:focus','filmstrip:blur'].include(e.eventName))
            {
                if(this.index == this.model.index)
                {
                    state = 'aktiv_';
                    this.ui.container.className = 'thumb aktiv';
                }
                else
                {
                    state = 'idle_';
                    this.ui.container.className = 'thumb';
                }

                if(e.eventName.match(/filmstrip:(.+)/))
                {
                    this.expanded = (e.eventName.match(/filmstrip:(.+)/)[1] == 'blur' )
                }

                state += this.expanded ? 'expanded' : 'collapsed'

                if(!this.useShims) {
                    this.ui.indicator.morph( this.indicator_styles[state], {
                        duration : 0.33
                    })
                }
            }

        },

        updateShim:function(width)
        {
            var h,w,l,t,s={};

            if(width > this.thumb_width)
            {
                h = Math.floor(width * (this.thumb_height / this.thumb_width));
                t = 0 - (Math.round((h - this.thumb_height) / 2));
                s.top = t;
                s.left = 0;
                s.width = width;
                s.height = h;
            }
            else
            {
                l = Math.round((width - this.thumb_width) / 2);
                s.top = 0;
                s.left = l;
                s.width = this.thumb_width;
                s.height = this.thumb_height
            }

            this.ui.shim.setStyle(sho.object.toPixels(s));
        }

    });


    sho.series.fauxcarousel.Thumb.base_id = sho.series.fauxcarousel.Thumb.prototype.base_id;

sho.loaded_modules['/lib/js/sho/series/fauxcarousel/thumb.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.series.fauxcarousel.FilmStrip = Class.create({

        _KLASS_ : 'sho.series.fauxcarousel.FilmStrip',

        stage:null,
        thumbs:null,    /* array */
        height_open : 96,
        ui : {},
        status : 'init',
        minimum_thumbs : 4,
        custom_width_when_less_than_minimum : '20%',
        klass_names : {
            'custom_width' : 'custom-width',
            'innerCnt' : 'carousel-filmstrip-inner'
        },

        initialize:function(cfg)
        {
            var b=sho.env.browser(),isIE=b.isIE,useShims=b.isIE && b.version < 9;

            Object.extend(this, {
                'stage' : cfg.stage,
                'thumbs' : cfg.thumbs,
                'useShims' : !!useShims,
                'ui' : {
                   container : cfg.container,
                   bounds : cfg.bounds
                }
            });

            this.ui.innerCnt = this.ui.container.select('.' + this.klass_names.innerCnt)[0];
			this.stage.addSubscriber(this);
        },

        drawThumbs:function()
        {
            var th=this,w,width,len = this.thumbs.length;
            var filmstripTotalWidth = this.ui.bounds.getWidth();

			var filmstripCharactersWidth = filmstripTotalWidth - ($('carousel-thumb-0').getWidth());
			var filmstripCharactersPerCent = ((filmstripCharactersWidth*100) / filmstripTotalWidth) - 1;  // prevent last thumb from trying to wrap during resize

            if(this.useCustomWidth())
            {
                this.ui.container.addClassName(this.klass_names.custom_width);
                width = this.custom_width_when_less_than_minimum;
            }
            else
            {
                w = filmstripCharactersPerCent / this.thumbs.length;
                width = w+'%';
            }

			this.thumbs.each(function(thumb) {
			  thumb.setStyle({'width':width});
			}.bind(this));

        },

        setHandlers:function()
        {
            var fn = this.onEnter.bind(this);
            ([this.ui.container,this.ui.bounds]).invoke('observe','mouseenter', fn);

            if(this.useShims) this.stage.addSubscriber(this);
        },

        update:function(e)
        {
            if(e.eventName == 'stage:resize')
            {
                this.drawThumbs();
            }

        },

        getThumbWidth:function(stage, numberOfThumbs)
        {
            if(!this.useCustomWidth())
            {
                return Math.floor(stage.viewport.width / numberOfThumbs);
            }
            else
            {
                var percentToPixels = Number(this.custom_width_when_less_than_minimum.gsub('%', '')) / 100, // 20% -> .20
                    pixels = Math.round(percentToPixels * stage.viewport.width)
                ;
                return pixels
            }

        },

        useCustomWidth:function()
        {
            return this.thumbs.length < this.minimum_thumbs
        },

        withEachThumb:function(fn)
        {
            this.thumbs.each(fn);
        }

    });

sho.loaded_modules['/lib/js/sho/series/fauxcarousel/filmstrip.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.series.fauxcarousel.TextBlock = Class.create({

        _KLASS_ : 'sho.series.fauxcarousel.TextBlock',

        model:null,
        stage:null,
        container:null, /* divElement */
        title:null,     /* string */
        alignment:null, /* vert | horiz */
		adjustmentTop:-40,

        text_bounds:{ 'width':450 },
        font_size:{     /* hash of font-size names and values. Actually, line-height is more relevant here. */
            'large' : 55,
            'medium' : 42,
            'small' : 39
        },
        max_num_lines : 5,
        initial_title_style_delay : sho.dom.REDRAW_DELAY * 8,  // was 4
        show_debug_styles : false,

        initialize:function(cfg)
        {
            Object.extend(this, {
                'stage' : cfg.stage,
                'index' : cfg.index,
                'sizes' :  ['_END_','small','medium','large'],
                'alignment' : cfg.container.className.match(/align-(.+)/)[1], // potential 'align-horiz' option?
                'ui' : {
                    'container' : cfg.container,
                    'innerCnt' : cfg.container.select('.title')[0]
                }
            });
            this.title = this.ui.innerCnt.innerHTML;

           	this.hide();
            this.explodeTitle();
            this.wrap();
            this.styleTitle.bind(this,'small').delay(sho.dom.REDRAW_DELAY);

            this.stage.addSubscriber(this);
        },

        wrap:function()
        {
            this.ui.container.setStyle({'width':this.text_bounds.width+'px'});
            if(this.show_debug_styles) this.ui.container.addClassName('debug')
        },

        explodeTitle:function()
        {
            this.ui.innerCnt.update('<u>'+ this.title.gsub(/\s/,'</u> <u>') + '</u>');
        },

        styleTitle:function(size)
        {
            this.setFont(size);
            this.cacheDimensions();
            this.alignVerticallyAndfocus(this.stage.current());
        },

        setFont:function(size)
        {
            this.ui.container.addClassName('font-'+size);
        },

        cacheDimensions:function()
        {
            this.ui.container._height = this.ui.container.getHeight();
        },

        alignVertically:function(stage)
        {
            if(this.ui.container._height)
            {
                var offset = stage.height - this.ui.container._height,
                    top = Math.round(offset / 2) + stage.top + this.adjustmentTop  // based on comp for faux carousel
                ;
                this.ui.container.setStyle(sho.object.toPixels({'top':top }));
            }
        },

        alignVerticallyAndfocus:function()
        {
            this.alignVertically(this.stage.current());
            this.focus();
        },

        show:function()
        {
            this.ui.container.style.visibility = 'visible';
        },

        hide:function()
        {
            this.ui.container.style.visibility = 'hidden';
        },

        focus:function()
        {
            this.ui.container.style.display = 'none';
			this.show();
			$j(this.ui.container).fadeIn(500, function() {
			});
        },

        blur:function()
        {
            this.ui.container.fade({
                duration : 0.5,
                after : function(tween){
                    tween.element.hide()
                }
            })
        },

        update:function(e)
        {
            if(e.eventName == 'stage:resize')
            {
                this.alignVertically(e.stage);
            }
        },

        log:function(str) // log once
        {
            if(this.index == 0) log(str);
        }


    });

sho.loaded_modules['/lib/js/sho/series/fauxcarousel/textblock.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.series.fauxcarousel.Panel = Class.create({

        _KLASS_ : 'sho.series.fauxcarousel.Panel',
        stage:null,
        index:null,
        container:null, /* <div class="panel" /> */
        image:null,
        title:null,
        base_id : 'carousel-panel-',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'stage' : cfg.stage,
                'index' : cfg.index,
                'container' : cfg.container.setStyle({
                    'position' : 'relative' /* important! needed for animation */
                }),
                'image' : cfg.container.select('img')[0]
            });
            this.textBlock = new sho.series.fauxcarousel.TextBlock({
                'stage' : this.stage,
                'index' : this.index,
                'container' : this.container.select('.text-block')[0]
            });
            this.container.id = this.base_id + this.index;
            this.title = this.textBlock.title.gsub('\'','');
            this.stage.addSubscriber(this);
        },

        update:function(e)
        {
            if(e.eventName =='stage:resize')
            {
                this.image.setStyle(sho.object.toPixels(e.stage))
            }

        }
    });

sho.loaded_modules['/lib/js/sho/series/fauxcarousel/panel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.series.fauxcarousel.Stage = Class.create(Object.extend({

        _KLASS_ : 'sho.series.fauxcarousel.Stage',
        subscribers : [],

        carousel:null,      // <sho.ui.carousel.Carousel>
        dimensions:null,    // { width:number, height:number }
        minimum:null,       // { width:number, height:number }
    	margins:null,       // { top:10,right:0,bottom:50,left:0 }
    	stage:null,

    	set_document_container_constraints:true,    // set outer container's min-width and min-height programatically ?

        initialize:function(cfg)
        {
            Object.extend(this, cfg);
            this.setConstraints();
            this.setHandlers();
        },

        setConstraints:function()
        {
            if(this.set_document_container_constraints && this.minimum.width && this.minimum.height){
                $$('.container').invoke('setStyle', {
                    'minWidth' : this.minimum.width+'px',
                    'minHeight' : this.minimum.height+'px'
                })
            }
        },

        setHandlers:function()
        {
            window.onresize = this.update.bind(this); this.update();
        },

        update:function()
        {
            var th=this,
                natural = this.dimensions,
                viewport = document.viewport.getDimensions(),
                w = sho.number.inRange(viewport.width, this.minimum.width),
                h = sho.number.inRange(viewport.height, this.minimum.height),
                target = {
                    'width' :  w - this.margins.right - this.margins.left,
                    'height' : h - this.margins.top - this.margins.bottom
                },
                sx = target.width / natural.width,
                sy = target.height / natural.height,
                s = {}
            ;
            s.viewport = viewport;

            if(sx > sy)
            {	if (target.width <= this.maximum.width) {
                	s.height = Math.round(natural.height * sx);
                	s.width = target.width;
				}
				else {
					s.height = Math.round(natural.height * (this.maximum.width/natural.width));
					s.width = this.maximum.width;
				}
                s.top = Math.round(0-(s.height - target.height)/2)
                s.left = 0;
            }
            if(sy > sx)
            {
                s.height = target.height;
                s.width = Math.round(natural.width * sy);
                s.left = Math.round(0-(s.width - target.width)/2)
                s.top = 0;
            }

            s.visibleWidth = target.width;
            s.visibleHeight = target.height;

            this.stage = s;
            this.notify();
        },

	    onNotify:function(subscriber)
	    {
	        subscriber.update({
	            'eventName':'stage:resize',
                'stage' : this.stage
            })
	    },

	    getWidth:function()
	    {
	        return this.stage.width;
	    },

	    getHeight:function()
	    {
	        return this.stage.height;
	    },

	    getDimensions:function()
	    {
	        return {
	            'width' : this.stage.width,
	            'height' : this.stage.height,
	            'visibleWidth' : this.stage.visibleWidth,
	            'visibleHeight':this.stage.visibleHeight
	        }
	    },

	    current:function()
	    {
	        return this.stage
	    }

    }, sho.core.Observable ));

sho.loaded_modules['/lib/js/sho/series/fauxcarousel/stage.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.series.fauxcarousel.View = Class.create({

        _KLASS_ : 'sho.series.fauxcarousel.View',
        container : null,
        content : null,
        dimensions : null,
        minimum : null,
        margins : null,

        stage : null,
        panels : [],
		thumbs : [],
        filmstrip:null,
        flashPanel:null,
        base_id : 'carousel-panel-',

        handlers : {},

        initialize:function(cfg)
        {
            Object.extend(this, {
                'container' : cfg.container,
                'content' : cfg.content,
                'dimensions' : cfg.dimensions,
                'minimum' : cfg.minimum,
				'maximum' : cfg.maximum,
                'margins' : cfg.margins
            });

 			this.initStage();
            this.initPanels();
            this.initFilmStrip();
        },

        initStage:function()
        {
            this.stage = new sho.series.fauxcarousel.Stage({
                'dimensions' : this.dimensions,
                'minimum' : this.minimum,
				'maximum' : this.maximum,
                'margins' : this.margins
            });
            this.stage.addSubscriber(this);
        },

        initPanels:function()
        {
            var th=this; this.content.select('.panel').each(function(p,i)
            {
                th.panels.push( new sho.series.fauxcarousel.Panel({
                    'index' : i,
                    'container' : p,
                    'stage' : th.stage
                }));
            });
        },

        initFilmStrip:function()
        {
            var filmstrip = this.container.select('.carousel-filmstrip')[0];
			if (!filmstrip) { return; }
			this.thumbs = filmstrip.select('.thumb');
			this.thumbs = this.thumbs.slice(1,this.thumbs.length); // remove about thumb

			if(this.thumbs.length > 0)
            {
                this.filmstrip = new sho.series.fauxcarousel.FilmStrip({
                    'stage' : this.stage,
                    'thumbs' : this.thumbs,
                    'container' : filmstrip,
                    'bounds' : this.container.select('.carousel-filmstrip-bounds')[0]
                });
            }
            else
            {
                this.filmstrip = { 'update' : function(e){}}
            }
        },


        mouseMove:function(e)
        {
            if(e.findElement('div.panel')) {
                this.update({ eventName : 'content:focus' })
            }
        },

        update:function(e)
        {
            if(e.eventName == 'stage:resize')
            {
                 var w = e.stage.visibleWidth;
    				this.content.setStyle(sho.object.toPixels({
    				    'width'  : w <= this.maximum.width ? w : this.maximum.width,
    				    'height' : e.stage.visibleHeight
    			 }));
            }

			if(e.eventName == 'view:blur' || e.eventName == 'content:focus')
			{
                this.filmstrip.update({eventName:'filmstrip:blur'})
            }
        }
    });












sho.loaded_modules['/lib/js/sho/series/fauxcarousel/view.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.series.fauxcarousel.Carousel = Class.create({

		defaults:{ fullbleed : false },
		view:null,

        initialize:function(cfg)
        {
			this.fullbleed = cfg.fullbleed == undefined ? this.defaults.fullbleed : cfg.fullbleed;

            this.view = new sho.series.fauxcarousel.View({
                'container' : cfg.container,
                'content' : ($$('.carousel-content')[0]),
                'dimensions' : sho.string.toDimensions(cfg.dimensions),
                'minimum' : sho.string.toDimensions(cfg.minimum),
				'maximum' : sho.string.toDimensions(cfg.maximum),
                'margins' : sho.string.toBox(cfg.margins)
            });
        }

    });

    sho.series.FauxCarousel = sho.series.fauxcarousel.Carousel;









sho.loaded_modules['/lib/js/sho/series/fauxcarousel/fauxcarousel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/series/fauxcarousel.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.series.concerns =
    {
        image_prefix : 'http://www.sho.com',
        use_short_urls_in_modals : true,

		getTrackingSlug:function()
		{
			var pageTracking = $$('[name=page-tracking]')[0].readAttribute('content');
			return pageTracking;
		},

		getTrackingSlugFromUrl:function(url,base)
		{
            url = url.gsub(/^\/(sho\/)*/,'');

            url = url.gsub(/:/,'-').gsub(/\//,':');

            url = url.indexOf(base) == -1 ? base+':'+url : url;
            return url;
        }

    }
    ;

    Object.extend(sho.series, sho.series.concerns);

sho.loaded_modules['/lib/js/sho/series/concerns.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.provide('sho.series.controllers')

    sho.series.controllers.EpisodeGuideController = Backbone.Router.extend(Object.extend(sho.schedules.controllers.BaseController, {

        _KLASS_ : 'sho.series.controllers.EpisodeGuideController',

        tracking_base_slug : null,

        initialize:function(cfg)
        {
            this.tracking_base_slug = sho.series.getTrackingSlug();

			Object.extend(this, {
                'model' : cfg.model
            });

            this.route('/airings/:ns_shows_id/:title',  'show_airings', this.showAirings);
            this.route('/images',                       'show_images',  this.showImages);
            this.route('/images/:image_index',          'set_image',    this.setImage);
            this.route('/index',                        'index',        this.index);
            this.initHistory();
        },

        initHistory:function()
        {
            var initialRoute = Backbone.history.start();

			if(!initialRoute)
            {
                this.navigate('/index');
            }

        },

        navigate:function(url, e)
        {
            var fragment = url == '/index' ? url : sho.schedules.getFragment(url);

            if (url.include('airings')) {
				var episodeNumber = '';
				if (e.target.readAttribute('rel')) { episodeNumber = 'episode ' + e.target.readAttribute('rel') + '/'; }
				url = episodeNumber + 'Upcoming airings';
			}

            var t = sho.analytics.getTracker(); t.debug = true;

   			if (url == '/images') url = 'images/1';
  			if (url.include('/images/')) {
  				var idx = url.replace("/images/", "");
  				url = 'images/' + (parseInt(idx));
  			}

  			if(url != '/index') {
  				var trackingSlug = sho.series.getTrackingSlugFromUrl(url,this.tracking_base_slug);
				trackingSlug = trackingSlug.replace("home:", "");
                t.trackPageView({'page': trackingSlug });
  				this.initial_route_tracked = true;
  			}

            if(fragment)
            {
                Backbone.Router.prototype.navigate.call(this, fragment, true );
            }

        },

        showAirings:function(id, slug)
        {
            this.model.setDetail({
                'kind' : 'airing-list',
                'id' : id,
                'slug' : slug
            });
        },

        showImages:function(i)
        {
            this.model.setDetail({
                'kind' : 'slide-show'
            })

            if (i) {
            }

            sho.dom.trigger('photogallery:opened');
        },

        setImage:function(i)
        {
            var idx = Number(i)-1;
            if(this.model.getDetail())
            {
                this.model.getDetail().setIndex(idx);
            }
            else
            {
                this.showImages(i) // should be able to pass in the index and jump to appropriate photo here
            }
        },



    }));

sho.loaded_modules['/lib/js/sho/series/controllers/episodeguidecontroller.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/series/controllers.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

    sho.series.EpisodeGuide = Class.create({

        _KLASS_ : 'sho.series.EpisodeGuide',

        initialize:function(cfg)
        {
            Object.extend(this, {
                'container' : cfg.container
            });

            this.initView();
			this.initModel();
			this.initController();
        },

        initView:function()
       {

           this.view = new sho.schedules.views.Product({
               'container' : this.container
           });
       },

        initModel:function()
        {
            this.model = new sho.schedules.models.Product({
                'view' : this.view
            })
            this.view.model = this.model;
        },

        initController:function()
        {
            this.controller = new sho.series.controllers.EpisodeGuideController({
                'model' : this.model
            });
            this.view.controller = this.controller;
        }

    });
sho.loaded_modules['/lib/js/sho/series/episodeguide.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/series.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    /**
     * sho.sports
     * namespace for sports functionality
    **/

    sho.provide('sho.sports');


    /**
     * sho.sports.events
     * namespace for sports event page
    **/

    sho.provide('sho.sports.events');


    /**
     * sho.sports.events.feed
     * namespace for sports event page
    **/

    sho.provide('sho.sports.events.feed');


    /**
     * sho.sports.events.feed.models
     * namespace for sports event page
    **/

    sho.provide('sho.sports.events.feed.models');



    !function(models)
    {
        _.extend(models,
        {
            'klass' :  (function(k){
                return models[sho.string.capitalize(k)]
            }),

            'exists' : (function(k){
                return !!models.klass(k);
            })
        })

    }(sho.sports.events.feed.models);

sho.loaded_modules['/lib/js/sho/sports/events/feed/models/statics.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.sports.events.feed.models.Feed = Backbone.Model.extend({

        '_KLASS_' : 'sho.sports.events.feed.models.Feed',

        'base_url' :        '/api/sports/events',

        url : function()
        {
            var useStub = sho.env.isLocal() && (window.location.toString().indexOf('/!') > -1),
            u = ['',
                (useStub ? this.base_url.replace(/\/api/,'/!') : this.base_url),
                '/',
                (this.get('id')),
                (useStub ? '.js' : ''),
                (this.has('previewDate') ? '?'+this.get('previewDate') : ''),

            ''].join('');

            log('|model| url='+u);

            return u;
        },

        trigger:function(eventName, eventObject, args)
        {
            if(eventName == 'change:eventPromotionsViewList')
            {
                var th=this;

                this.set({
                    'promotions' : _.collect(args, function(cfg, idx)
                    {
                        cfg.index = idx;
                        cfg.parent = th;
                        return sho.sports.events.feed.models.Promotion.fromAttributes(cfg)
                    })
                })
            }

            Backbone.Model.prototype.trigger.call(this, eventName, eventObject, args);
        },

        fetch:function()
        {
            this.trigger('promotions:loading');
            Backbone.Model.prototype.fetch.call(this);
        },

        promotions:function(idx)
        {
            var promos = this.get('promotions');
            return idx !== undefined ? promos[idx] : promos
        },

        playVideo:function(e)
        {
            sho.behaviors.method('play-video')(e.currentTarget,e);
        }


    });

sho.loaded_modules['/lib/js/sho/sports/events/feed/models/feed.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.sports.events.feed.models.Promotion = Backbone.Model.extend({

        '_KLASS_' : 'sho.sports.events.feed.models.Promotion',


        initialize : function(cfg)
        {
            this.overrideImageDimensions()
        },

        overrideImageDimensions:function()
        {
            var fn = sho.sports.events.feed.views.Promotion.pathWithDimensions,
                atts = this.attributes
            ;

            if( atts.galleryView &&
                atts.galleryView.coverImage &&
                atts.galleryView.coverImage.fullPath )
            {
               this.attributes.galleryView.coverImage.fullPath = fn(atts.galleryView.coverImage.fullPath, atts.featured)
            }

            if( atts.videoView &&
                atts.videoView.image &&
                atts.videoView.image.fullPath )
            {
                this.attributes.videoView.image.fullPath = fn(atts.videoView.image.fullPath, atts.featured)
            }

            if( atts.imageUrl) this.attributes.imageUrl = fn(atts.imageUrl, atts.featured)
        },

        type:function(){
            return this.get('promotionType')
        }
    });

    !function(models)
    {
        models.Promotion.fromAttributes = (function(cfg)
        {
            var model;

            if(models.exists(cfg.promotionType)){
                model = models.klass(cfg.promotionType)
            }
            else // regular old promo model..
            {
                model = models['Promotion']
            }

            return new model(cfg);
        })

    }(sho.sports.events.feed.models)

sho.loaded_modules['/lib/js/sho/sports/events/feed/models/promotion.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    sho.sports.events.feed.models.poll_states = sho.string.toArray('init pending results');

    sho.sports.events.feed.models.Poll = sho.sports.events.feed.models.Promotion.extend({

        '_KLASS_' : 'sho.sports.events.feed.models.Poll',

        'cookie_store' : 'sho_poll_submitted_',

        initialize : function()
        {
            this.set({'cookie':false},{'silent':true});
            this.set({'status':'init'}); // init
            this.copyPollAttributes();
            this.setAnswerPercentageWidths()
            this.setHandlers();
        },

        copyPollAttributes:function()
        {
            if(this.attributes.pollView && this.attributes.pollView.poll)
            {
                this.set(this.attributes.pollView.poll, {'silent':true})
                this.unset('pollView',{'silent':true})
            }
            else
            {
                throw new Error('something very wrong with poll at position #'+ this.get('position'));
            }

            this.cookie('read')
        },

        setHandlers:function()
        {
            if(this.has('parent')){
                var feed = this.attributes.parent;
                this.bind('all', function(eventName, e){
                    log('|poll| sending event `poll:'+eventName+'`')
                    feed.trigger('poll:'+eventName, e)
                })
            }

            this.fn = {
                'onSubmit' : _.bind(this.onSubmit, this)
            }
        },

        trigger:function(eventName, eventObject, args)
        {
            if(eventName == 'change:status')
            {
                this.setStateFlags()
            }

            if(eventName == 'change:cookie' && eventObject.attributes.cookie)
            {
                this.set({'status':'results'})
            }

            Backbone.Model.prototype.trigger.call(this, eventName, eventObject, args);
        },

        setStateFlags:function()
        {
            var th=this, states = sho.sports.events.feed.models.poll_states;

            this.set(states.inject(function(memo,state){
                memo['is-'+state+'-state'] = th.get('status') == state;
                return memo;
            },{}), {'silent':true});
        },

        setAnswerPercentageWidths:function()
        {
            this.attributes.answers = _.collect(this.get('answers'), function(a){
                a.charLength = (a.percentage+'').length; return a
            })
        },

        selectAnswer:function(e)
        {

            var a, i, len=this.get('answers').length, el = e.currentTarget;

            for(i=0; i<len; i++)
            {
                a = this.attributes.answers[i];
                a.isSelected = (a.answerId == sho.dom.data.read(el, 'answer-id'));
            }

            this.trigger('change:selection', {'attributes':this.attributes});
        },


        submitPoll:function(e)
        {
            var answer = _.find(this.get('answers'), function(a){
                return a.isSelected
            })

            if(answer)
            {
                this.set({'status':'pending'})
                sho.$.ajax({
                    'type' : 'POST',
                    'url' : '/api/poll',
                    'data' : {
                        'pollId' : this.get('pollId'),
                        'answerId' : answer.answerId
                    },
                    'success' : this.fn.onSubmit
                })
            }
        },

        onSubmit : function(xhr)
        {
            this.set({'status':'results'})
            this.cookie('write')
        },

        cookie:function(op)
        {
            var key = this.cookie_store + this.get('pollId');

            if(op == 'read')
            {
                this.set({ 'cookie' : !!sho.util.Cookies.read(key) })
            }
            else
            {
                sho.util.Cookies.write(key,1,365)
            }
        }


    });

sho.loaded_modules['/lib/js/sho/sports/events/feed/models/poll.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


sho.loaded_modules['/lib/js/sho/sports/events/feed/models.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.sports.events.feed.views
     * namespace for sports event page views
    **/

    sho.provide('sho.sports.events.feed.views');



    !function($){

    sho.sports.events.feed.views.Feed = klass({

        '_KLASS_' : 'sho.sports.events.feed.views.Feed',

        initialize : function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'model' : cfg.model,
                'columnWidth' : 228 + 20,    // size of smallest unit + margin
                'isotope' : sho.env.isDesktop() && !cfg.disableIsotope, // for dev purposes

                'events': {},   // hash to populate w/ callbacks
                'fn' : {
                    'update' : _.bind(this.update, this),
                    'renderPromo' : _.bind(this.renderPromo, this),
                    'attachCallbacksToView' : _.bind(this.attachCallbacksToView, this),
                    'initIsotope' : _.bind(this.initIsotope, this),
                    'refreshIsotope' : _.bind(this.refreshIsotope, this),
                    'onLayout' : _.bind(this.onLayout, this)
                }
            });

            this.setHandlers();
        },

        setHandlers:function()
        {
            this.model.bind('all', this.fn.update);

            _.each(sho.sports.events.feed.views, this.fn.attachCallbacksToView);
        },

        attachCallbacksToView:function(view,key)
        {
            if(!view.events) return

            var th=this; _.each(view.events, function(method,eventSelector)
            {
                var m = eventSelector.match(/(tap|click)\s(.+)/),
                    eventName = !!m ? m[1] : false,
                    selector = !!m ? m[2] : false
                ;

                if(selector && eventName && (
                    (eventName == 'tap'   && (sho.env.isMobile() || sho.env.isTablet())) ||
                    (eventName == 'click' && sho.env.isDesktop())
                ))
                {
                    th.container.on(eventName, selector, function(e){
                        th.invokeCallback(e,method,key)
                    })
                }
            })
        },

        invokeCallback:function(e,method,key)
        {
            var model = this.model;

            if(sho.sports.events.feed.models[sho.string.capitalize(key)])
            {
                var idx = $(e.currentTarget).parents('.promo').data('index');

                if(idx !== undefined)
                {
                    model = this.model.promotions(idx)
                }
            }

            if(!!model[method])
            {
                sho.dom.trap(e);

                model[method].call(model, e)
            }
        },

        update:function(eventName, e)
        {
            log('|view| `'+eventName+'`');

            if('change:promotions' == eventName)
            {
                this.container.removeClass('loading');
                this.render();
            }

            if(_.include(['poll:change:selection','poll:change:status'], eventName))
            {
                this.render(e.attributes);
            }

            if('view:feed:rendered' == eventName)
            {
                this.isotope && _.delay(this.fn.initIsotope, 1000);
            }

            if('view:promo:rendered' == eventName)
            {
                this.isotope && _.delay(this.fn.refreshIsotope, sho.dom.REDRAW_DELAY_)
            }


        },

        render:function(e)
        {
            var el,
                data,
                all = (e == undefined || e.index == undefined)
            ;
            log('|view| render: '+(all ? 'all':'promo #'+e.index));

            if(all) // render entire feed
            {
                el = this.container;
                data = this.model.promotions()
            }
            else // refresh a single node
            {
                el = $('#promo-id-'+e.index);
                data = [this.model.promotions(e.index)];
            }

            var th=this; el.html(_.collect(data, function(p){
                return th.renderPromo(p, all);
            }).join(''))

            this.update('view:'+(all ? 'feed' : 'promo')+':rendered');

        },

        renderPromo:function(p, includeWrapper)
        {
            var k = sho.string.capitalize(p.type()),        // 1) coerce the promotion type into useable form...
            store = sho.sports.events.feed.views,           // 2) get the template object for the promo in question..
            template = store[k] || store['Promotion'],      // ...
            worker = _.extend({                             // 3) create a worker by merging the model attributes w/ the template object,
                'includeWrapper' : includeWrapper           // resulting in a mustache template infused w/ some optional helper functions
            }, p.attributes, template)

            ;
            return Mustache.to_html(worker.view, worker, (worker.partials || {}))    // render that sucker

        },

        initIsotope:function()
        {
            log('|view| isotope()');
            this.container.isotope({
                'itemSelector' : '.promo',
                'resizeable' : true,
                'masonry' : {
                    'columnWidth' : this.columnWidth
                }
            });
        },


        refreshIsotope:function()
        {
            log('|view| isotope(\'relayout\')');
            this.isotope && this.container.isotope('reLayout');
        },

        onLayout:function()
        {
            log('|feed| onLayout');
        }

    })

    }(sho.$)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/feed.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.sports.events.feed.views.Promotion = {

        'view' : ['',
            '{{#wrap}}',

                '{{#imageUrl}}',
                    '{{#link}}<a href="{{link}}">{{/link}}',
                        '<img src="{{imageUrl}}" class="full-width" />',
                    '{{#link}}</a>{{/link}}',
                '{{/imageUrl}}',

                '<div class="promo-body">',
                    '{{> articleBody }}',
                '</div>',

            '{{/wrap}}',
        ''].join(''),


        'wrap' : (function(){
            return (function(text, render) {
                return render(this.includeWrapper ? ['',
                '<div data-index="{{index}}" id="promo-id-{{index}}" class="promo {{promotionType}}',
                    '{{#featured}} featured{{/featured}}',
                '">',
                    '<div class="debug-label">{{promotionType}} {{position}}</div>',
                    text,
                '</div>',
                ''].join('') : text)
            })
        }),

        'partials' : {
            'articleBody' : ['',

                '{{ > postedDate }}',
                '<h3>{{#link}}<a href="{{link}}">{{/link}}',
                    '{{title}}',
                '{{#link}}</a>{{/link}}</h3>',
                '{{#description}}<p>{{description}}</p>{{/description}}',

                ''].join(''),

            'postedDate' : ['',

                '<span class="posted-date">',
                    '{{#featured}}<b>Featured</b>{{/featured}}{{postedDate}}',
                '</span>',

                ''].join('')
        },

        'pathWithDimensions' : (function(path, isFeatured){
            return isFeatured ? path : path.split('640x360').join('320x180');
        })
    };
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/promotion.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function(views)
    {
        views.Video = _.extend({}, views.Promotion, {

            'events' : {
                'click .video a' : 'playVideo'
            },
            'view' : ['',

                '{{#wrap}}',
                    '<a href="{{videoMediaUrl}}" ',
                        'data-behavior="play-video" ',
                        'data-video-id="{{videoView.id}}" ',
                        'data-click-id="feed:promotion {{index}}" ',
                    '>',
                        '<img style="',
                            'background-size:cover;',
                            'background-image:url({{videoView.image.fullPath}});" ',
                            'src="/assets/images/sports/home/video-icon_320x180.png" ',
                            'class="full-width" ',
                        '/>',
                    '</a>',
                    '<div class="promo-body">',
                        '{{ > postedDate }}',
                        '{{#videoView.title}}',
                            '<h3>',
                                '<a href="{{videoView.url}}" ',
                                    'data-behavior="play-video" ',
                                    'data-video-id="{{videoView.id}}" ',
                                    'data-click-id="feed:promotion {{index}}" ',
                                '>',
                                    '{{videoView.title}}',
                                '</a>',
                            '</h3>',
                            '{{/videoView.title}}',
                        '{{#videoView.description}}<p>({{videoView.time}}) - {{videoView.description}}</p>{{/videoView.description}}',
                    '</div>',
                '{{/wrap}}',

            ''].join(''),

            'videoMediaUrl' : (function(){
                var v = this.videoView,
                    url = v.url
                ;
                if(sho.env.isMobile() || sho.env.isTablet())
                {
                    if(!!v.vendorUrl)
                    {
                        url = v.vendorUrl
                    }
                    else
                    {
                        log('|video| vendorUrl not found for video promotion #'+this.position+' video id=`'+v.id+'`');
                    }
                }
                return url;
            })

        })

    }(sho.sports.events.feed.views)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/video.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function(views)
    {
        views.Gallery = _.extend({}, views.Promotion, {

            'view' : ['',

                '{{#wrap}}',

                    '<a href="{{galleryView.galleryUrl}}">',
                        '<img src="{{galleryView.coverImage.fullPath}}" class="full-width" />',
                    '</a>',

                    '<div class="promo-body">',
                        '<span class="posted-date">{{postedDate}}</span>',
                        '<h3>',
                            '<a href="{{galleryView.galleryUrl}}">{{galleryView.title}}</a>',
                        '</h3>',
                        '<p>',
                            '[{{galleryView.galleryImagesCount}} Photos]',
                        '</p>',
                    '</div>',

                '{{/wrap}}',

            ''].join('')

        })

    }(sho.sports.events.feed.views)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/gallery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function(views)
    {
        views.Poll = _.extend({}, views.Promotion, {

            'events' : {
                'click .submit':        'submitPoll',
                'click .input-radio':   'selectAnswer',
                'tap .submit':          'submitPoll',
                'tap .input-radio':     'selectAnswer'
            },

            'view' : ['',

                '{{#wrap}}',
                    '<div class="promo-body status-{{status}}">',
                        '<span class="posted-date">{{#featured}}<b>Featured</b>{{/featured}}{{postedDate}}</span>',
                        '<h3 class="poll-name">{{name}}</h3>',
                        '<p class="poll-question">{{question}}</p>',
                        '<form action="#">',
                        '<ul>',
                            '{{#answers}}',
                                '<li class="{{#isSelected}}is-selected{{/isSelected}} charlength-{{charLength}}">',
                                    '<span',
                                        '{{#is-results-state}}',
                                            '{{> percentWidth }}',
                                        '{{/is-results-state}}',
                                    '>',
                                        '<div class="input-radio" data-answer-id="{{answerId}}"></div>',
                                        '<em>{{percentage}}%</em> ',
                                        '<b>{{answer}}</b>',
                                    '</span>',
                                '</li>',
                            '{{/answers}}',
                        '</ul>',
                        '<span class="submit">vote</span>',
                        '</form>',
                    '</div>',
                '{{/wrap}}',

            ''].join(''),

            'partials' : {

                'percentWidth' : ['',
                    ' style="-webkit-background-size : {{percentage}}% 100%;',
                                    'background-size : {{percentage}}% 100%;',
                    '"',

                ''].join('')

            }

        })

    }(sho.sports.events.feed.views)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/poll.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function(views)
    {
        views.Image = _.extend({}, views.Promotion, {

            'view' : ['',

                '{{#wrap}}',
                    '{{#link}}<a href="{{link}}">{{/link}}',
                    '<img src="{{imageUrl}}" class="full-width" />',
                    '{{#link}}</a>{{/link}}',
                '{{/wrap}}',

            ''].join('')

        })

    }(sho.sports.events.feed.views)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/image.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function(views)
    {
        views.Quote = _.extend({}, views.Promotion, {

            'view' : ['',

                '{{#wrap}}',
                    '<div class="promo-body">',
                        '{{> postedDate}}',
                        '<h3>"{{description}}"</h3>',
                        '{{#title}}<p class="quote-author">',
                            '{{#link}}<a href="{{link}}">{{/link}}',
                                '{{title}}',
                            '{{#link}}</a>{{/link}}',
                        '</p>{{/title}}',
                    '</div>',
                '{{/wrap}}',

            ''].join('')

        })

    }(sho.sports.events.feed.views)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/quote.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function(views)
    {
        views.Text = _.extend({}, views.Promotion, {

            'view' : ['',

                '{{#wrap}}',

                    '{{#imageUrl}}',
                        '{{#link}}<a href="{{link}}">{{/link}}',
                            '<img src="{{imageUrl}}" class="full-width" />',
                        '{{#link}}</a>{{/link}}',
                    '{{/imageUrl}}',

                    '<div class="promo-body">',
                        '{{> articleBody}}',
                        '<a href="{{link}}" class="more">Read More</a>',
                    '</div>',
                '{{/wrap}}',

            ''].join('')

        })

    }(sho.sports.events.feed.views)
sho.loaded_modules['/lib/js/sho/sports/events/feed/views/text.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/sports/events/feed/views.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($){

    sho.sports.events.feed.Widget = klass({

        '_KLASS_' : 'sho.sports.events.feed.Widget',

        'defaults' : {
        },

        initialize : function(cfg)
        {
            var c = $(cfg.container); _.extend(this, {
                'container' : c,
                'id' : c.data('eventId')
            }),
                matches =     (window.location.search || '').match(/previewDate=\d+/),
                previewDate = !!matches ? matches[0] : null
            ;

            this.model = new sho.sports.events.feed.models.Feed({
                'id' : this.id,
                'previewDate' : previewDate
            });

            this.view = new sho.sports.events.feed.views.Feed({
                'container' : this.container,
                'model' : this.model,
                'disableIsotope' : sho.dom.data.read(this.container, 'disableIsotope')
            });

            this.model.fetch()
        }

    })

    }(sho.$)

    sho.sports.events.Feed = sho.sports.events.feed.Widget;
sho.loaded_modules['/lib/js/sho/sports/events/feed/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/sports/events/feed.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/sports/events.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.sports.fighters
     * namespace for sports fighter pages
    **/

    sho.provide('sho.sports.fighters');



	!function($){

	sho.sports.fighters.FightHistorySection = sho.ui.abbrev.Section.extend({

	    '_KLASS_' : 'sho.sports.fighters.FightHistorySection',

		'root' : 'data.fightHistorySection.itemList',

		'item_class' : 'fighter-history__event',

		'item' : ['',

			'<div class="fighter-history__event">',
				'<span class="fh-td fh__result fh-td fh__result--{{result}}">',
					'<b>{{result}}</b>',
				'</span>',
				'<span class="fh-td fh__event">',
					'<b>',
						'<p>',
							'{{#event.eventTime}}',
								'{{#eventTimeFormatted}}{{event.eventTime}}{{/eventTimeFormatted}}<br />',
							'{{/event.eventTime}}',
							'<small>',
								'{{#event.url}}',
									'<a href="{{event.url}}">{{event.name}}</a>',
								'{{/event.url}}',
								'{{^event.url}}',
									'{{event.name}}',
								'{{/event.url}}',
							'</small>',
							'<br />',
							'<small>{{event.location}}</small>',
						'</p>',
					'</b>',
				'</span>',
				'<span class="fh-td fh__opponent">',
					'<b>',
						'{{opponent}}',
					'</b>',
				'</span>',
				'<span class="fh-td fh__method">',
					'<b>{{method}}</b>',
				'</span> ',
			'</div><!-- END event -->',


		''].join(''),

		'date_format' : 'MMM dd yyyy',

		render:function()
		{
			var view = 	this.item,
			fn=			_.bind(this.eventTimeFormatted, this),
			html = 		_.collect(this.items, function(item){

				item.eventTimeFormatted = function(){
					return fn;
				};

				return Mustache.to_html(view,item);

			}).join('');

			this.container.append(html);
		},

		eventTimeFormatted:function(text,render)
		{
			var timestamp = Number(render(text));
			return new Date(timestamp).toString(this.date_format)
		},

		getExcessItems:function()
		{
			var items= 	this.container.find('.' + this.item_class);
		    var n = this.initialItems-1;
		    return extras= _.select(items, function(item,i){ return i > n });
		},

	})

	}(sho.$)
sho.loaded_modules['/lib/js/sho/sports/fighters/fighthistorysection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



	!function($){

	sho.sports.fighters.VideoSection = sho.ui.abbrev.Section.extend({

	    '_KLASS_' : 'sho.sports.fighters.VideoSection',

		'root' : 'data.videoSection.videoList',

		'row_class' : 'fighter-videos.row',

		'apply_behaviors' : true,

		'row' : ['',

			'<div class="fighter-videos row">',
				'{{#videos}}',
				'<div class="col-sm-4">',
					'{{> video}}',
				'</div>',
				'{{/videos}}',
			'</div>',

		''].join(''),


		'video' : ['',

			'<figure class="video-promo">',
				'<div class="video-promo__image" ',
					'style="background-image:url({{image.fullPath}});"',
				'>',
					'<a href="{{url}}" class="video" data-behavior="{{behavior}}" data-video-id="{{id}}" data-mobile-url="{{vendorUrl}}">',
						'<img src="/assets/images/lib/clear_200x150.png" />',
					'</a>',
				'</div>',
				'<figcaption class="video-promo__caption">',
					'<a href="{{url}}" class="video" data-behavior="{{behavior}}" data-video-id="{{id}}" data-mobile-url="{{vendorUrl}}">',
						'<h5 class="h5">',
							'<span>{{title}}</span> <small>{{#isFull}}Full Episode {{/isFull}}({{time}})</small>',
						'</h5>',
					'</a>',
				'</figcaption>',
			'</figure>',

		''].join(''),


		render:function()
		{
			var n =			3,
			rowTemplate=	this.row,
			videoTemplate= 	this.video,

			behavior = 		sho.env.isDesktop() ? 'play-video' : 'play-mobile-video',

			grouped = _.groupBy(this.items, function(item,idx){
				return Math.floor(idx/n);
			}),

			html = _.collect(grouped, function(items)
			{
				return Mustache.to_html(rowTemplate,  {								// evaluate the template against each row

					'videos': 	items,												// items is an array of all videos grouped into sets of 3: [ [{},{},{}] , [{},{},{}] , [{},{},{}] ]
					'behavior': (function(){ return behavior; }),					// playback behavior is forked by platform, need a helper function here to pass in the string defined above
					'isFull': 	(function(){ return this.typeCode == 'ful' }),		// detect full eps for special text callout...
				},{
					'video': 	videoTemplate										// the video itself is treated as a partial, which is provided in second param to mustache.to_html
				});

			}).join('')
		;

			this.container.append(html);
		},

		getExcessItems:function()
		{
			return this.container.find('.' + this.row_class).not(':first-child');
		},


	})

	}(sho.$)
sho.loaded_modules['/lib/js/sho/sports/fighters/videosection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/sports/fighters.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.sports.polls
     * namespace for sports poll widgets
    **/

    sho.provide('sho.sports.polls');

    !function($)
    {

    sho.sports.polls.Collection = klass({

        '_KLASS_' : 'sho.sports.polls.Collection',

        'use_stubs' : false,
        'base_url'  : '/api/polls/',

        initialize : function(cfg)
        {
            _.extend(this, {
                'container' : $(cfg.container),
                'id' : sho.dom.data.read(cfg.container, 'id'),
                'fn' : {
                    'ready' : _.bind(this.ready, this)
                }
            })
            this.fetch()
        },

        fetch:function()
        {
            $.ajax({
                'type' : 'GET',
                'dataType':'json',
                'url' : this.url(),
                'success' : this.fn.ready,
                'error' : (function(xhr){
                    throw new Error('Error connecting to poll action at `'+this.url+'`');
                })
            })
        },

        ready : function(xhr)
        {
            var c = this.container
            _.each(xhr, function(attrs,idx){
                attrs.featured = idx == 0; // faux featured property: the first poll in the page is always featured
                attrs.container = c;
                new sho.sports.polls.Widget(attrs);
            })
            sho.dom.trigger('stickyfooter:update')
        },

        url:function()
        {
            return this.use_stubs ? '/!/sports/polls-json.js' : (this.base_url + this.id);
        }
    })

    }(sho.$)
sho.loaded_modules['/lib/js/sho/sports/polls/collection.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    sho.sports.polls.Widget = Backbone.Model.extend({

        '_KLASS_' : 'sho.sports.polls.Widget',

        'view' : ['',
            '<div class="poll" data-id="{{id}}" id="poll-{{id}}">',
            '</div>',
        ''].join(''),

        initialize : function(cfg)
        {
            this.container =    $(cfg.container);
            this.id =           cfg.pollView.poll.pollId;
            this.model =        new sho.sports.events.feed.models.Poll(cfg);

            this.fn = {
                'render' : _.bind(this.render, this),
                'update' : _.bind(this.update, this)
            }

            this.initView();
            this.setHandlers();
            this.model.trigger('init',{})
        },

        initView:function()
        {
            this.template =  sho.sports.events.feed.views.Poll
            this.container.append(Mustache.to_html(this.view, {
                'id' : this.id
            }));
            this.innerCntr = this.container.find('#poll-'+this.id);
        },

        setHandlers:function()
        {
            this.model.bind('all', this.fn.update);
            this.attachCallbacksToView(sho.sports.events.feed.views.Poll);
        },

        attachCallbacksToView:function(view)
        {
            var th=this; _.each(view.events, function(method,eventSelector)
            {
                var m = eventSelector.match(/(tap|click)\s(.+)/),
                    eventName = !!m ? m[1] : false,
                    selector = !!m ? m[2] : false
                ;

                if(selector && eventName && (
                    (eventName == 'tap'   && sho.env.isMobile() || sho.env.isTablet()) ||
                    (eventName == 'click' && sho.env.isDesktop())
                ))
                {
                    th.innerCntr.on(eventName, selector, function(e){
                        th.invokeCallback(e,method)
                    })
                }
            })
        },

        invokeCallback:function(e,method)
        {
            if(!!this.model[method])
            {
                sho.dom.trap(e);
                this.model[method].call(this.model, e)
            }
        },

        update:function(eventName,e)
        {
            if(_.include(['change:selection','change:status','init'], eventName)){
                this.render();
            }
        },

        render:function()
        {
            var worker = _.extend({
                'includeWrapper' : false
            }, this.model.attributes, this.template);
            this.innerCntr.html( Mustache.to_html(worker.view, worker, worker.partials));
        }

    })
sho.loaded_modules['/lib/js/sho/sports/polls/widget.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/sports/polls.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    /**
     * sho.sports.streak
     * namespace for sports streak game
    **/

    sho.provide('sho.sports.streak');



    !function($)
    {

    sho.sports.streak.Picker = klass({

        '_KLASS_' :     'sho.sports.streak.StreakPicker',

        'url' :         '/api/sports/streak/pick',

        'labels' :      {
            'on' : 'Your Pick',
            'off' : 'Click to Select'
        },

        initialize:function(cfg)
        {
            var c=$(cfg.container); _.extend(this, {
                'container' :   c,
                'fightId' :     c.data('fightId'),
                'pickId'  :     c.data('pickId'),
                'postFight' :   c.hasClass('streak-picker--is-post-fight')
            });

            this.setHandlers();
            this.initStats();
        },

        setHandlers:function()
        {
            _.bindAll(this, 'onSelectFighter','onBadgeClick','onSetPick','onRemovePick','handleError');
            var evntType = sho.env.isMobile() ? 'tap' : 'click';
            this.container.on(evntType, '.streak-picker__fighter:not(.streak-picker__fighter--has-pick)', this.onSelectFighter);
            this.container.on(evntType, '.streak-picker__badge em', this.onBadgeClick);
        },

        initStats:function()
        {
            var parent = this.container;
            _.each(parent.find('.streak-picker__stats'), function(el,idx){
                new sho.sports.streak.PickerStats({
                    'container' : el,
                    'parent' : parent
                });
            })
        },

        onSelectFighter:function(e)
        {
            if(this.proceedWithClick(e) && !this.hasPick()){
                this.setPick($(e.currentTarget).data('fighter-id'));
            }
        },

        onBadgeClick:function(e)
        {
            if(this.proceedWithClick(e) && this.hasPick()){
                this.removePick();
            }
        },

        setPick:function(fighterId)
        {
            var data = {
                'fightId' : this.fightId,
                'fighterId' : fighterId
            }; $.ajax({
                'url' :  this.url +'?'+ $.param(data),
                'type' : 'PUT',
                'success': this.onSetPick,
                'error': this.handleError
            });

            this.fighterId = fighterId;
            this.setContainerClass('on','--loading');
        },

        onSetPick:function(xhr)
        {
            if(xhr.message == 'Success' && !!xhr.pick)
            {
                this.pickId = xhr.pick.id
                this.setContainerClass('off','--loading');
                this.setContainerClass('on', '--has-pick');
                this.setContainerClass('off','--is-pickable');
                this.updateFighterState('on', this.fighterId);
                this.fighterId = null;

                log('pick id '+xhr.pick.id+' set successfully');
            }
            else
            {
                this.handleError(xhr)
            }
        },

        removePick:function()
        {
             $.ajax({
                'url' : this.url +'/' + this.pickId,
                'type' : 'DELETE',
                'success' : this.onRemovePick,
                'error' : this.handleError
            });

            this.setContainerClass('on','--loading');

        },

        onRemovePick:function(xhr)
        {
            if(xhr.success)
            {
                this.pickId = null;
                this.setContainerClass('off','--loading');
                this.setContainerClass('off','--has-pick');
                this.setContainerClass('on', '--is-pickable');
                this.updateFighterState('off')
                this.trigger('pick:removed')
            }
            else
            {
                this.handleError(xhr)
            }
        },


        handleError:function(xhr)
        {
            this.setContainerClass('off','--loading');
            this.setContainerClass('on', '--is-pickable');
            this.setContainerClass('on', '--is-locked');
        },



        trigger:function(eventName)
        {
            $(this.container).trigger(eventName)
        },


        proceedWithClick:function(e)
        {
            return !this.postFight && !this.isLoading() && !this.isLocked();
        },

        updateFighterState:function(onoff, id)
        {
            this.container.find('.streak-picker__fighter').removeClass('streak-picker__fighter--has-pick');
            this.container.find('.streak-picker__fighter-name').removeClass('streak-picker__fighter-name--is-picked');
            this.container.find('.streak-picker__pick-label').addClass('streak-picker__pick-label--hidden').html(this.labels['off']);

            if(onoff == 'off') return;

            var fighterEl = this.fighters(id);
            fighterEl.addClass('streak-picker__fighter--has-pick');
            fighterEl.find('.streak-picker__fighter-name').addClass('streak-picker__fighter-name--is-picked');
            fighterEl.find('.streak-picker__pick-label').removeClass('streak-picker__pick-label--hidden').html(this.labels['on']);
        },

        fighters:function(id)
        {
            var selector = '.streak-picker__fighter' + (!!id ? '[data-fighter-id^="'+id+'"]' : '');
            return this.container.find(selector);
        },

        setContainerClass:function(on,className)
        {
            var fn = on == 'on' ? 'addClass' : 'removeClass';
            this.container[fn]('streak-picker'+className)
        },

        isLoading:function()
        {
            return this.container.hasClass('streak-picker--loading');
        },

        isLocked:function()
        {
            return this.container.hasClass('streak-picker--is-locked');
        },

        hasPick:function()
        {
            return !!this.pickId;
        }

    });


    }(sho.$);

    sho.sports.getPicker = function(idx)
    {
        return sho.sports.getPickers()[idx];
    };
    sho.sports.getPickers = function()
    {
        fn = sho.ui.getComponent || sho.ui.mobile.getComponent; return fn('sho-sports-streak-picker');
    };
sho.loaded_modules['/lib/js/sho/sports/streak/picker.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/


    !function($){

    sho.sports.streak.PickerStats = klass( _.extend({},
        sho.ui.mobile.swipeable, {

        '_KLASS_' : 'sho.sports.streak.PickerStats',

        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'parent' : cfg.parent,
                'fn' : {
                    'onPickRemoved' :  _.bind(this.onPickRemoved, this)
                }
            });

            if(sho.env.isMobile())
            {
                this.parent.bind('pick:removed', this.fn.onPickRemoved);
                this.applySwipeable();
            }
        },

        onPickRemoved:function(e)
        {
            this._swipeable.innerWidth || this.refreshSwipeable();
        },

        applySwipeable:function()
        {
            this.isSwipeable({
                'container' :   this.container,
                'innerWidth' :  "collect('li')"
            })
        },

        isVisible:function(){
            return $(this.container).css('display') !== 'none';
        }

    }));


    }(sho.$);
sho.loaded_modules['/lib/js/sho/sports/streak/pickerstats.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



    !function($)
    {

    sho.sports.streak.HeroPanelIndicator = klass({

        '_KLASS_' :     'sho.sports.streak.HeroPanelIndicator',

        initialize:function(cfg)
        {
            _.extend(this, {
                'max_width' : 1500,
                'margin_left' :  25,
                'container' : $(cfg.container),
                'fn' : {
                    'onScroll' : _.bind(this.onScroll, this),
                    'onResize' : _.bind(this.onResize, this)
                }
            })

            this.setHandlers();
        },

        setHandlers:function()
        {

            $(window).scroll(this.fn.onScroll);
            if(sho.dom.body().hasClass('has-max-width'))
            {
                $(window).resize(this.fn.onResize);
                this.onResize();
            }
        },

        onScroll:function(e)
        {
            var scrollY = $(window).scrollTop(),
            	el = $('.hero-panel-indicator'),
			    offset = 0,
			    panelHeight = 	525 - offset,
			    panelIdx =		Math.floor((Math.abs(scrollY)) / panelHeight);
			el.find('li').removeClass('streak-active').eq(panelIdx).addClass('streak-active');
			if(scrollY > 1500)
			{
			    $('li').removeClass('streak-active');
				el.find('li').eq(3).addClass('streak-active');
			}

        },


        onResize:function(e)
        {
            var w = sho.dom.viewport().width,
                offset = (w > this.max_width) ?  Math.floor((w - this.max_width) / 2) : 0
            ;
            this.container.css({'left': (this.margin_left + offset) })

        }
    });

    }(sho.$);
sho.loaded_modules['/lib/js/sho/sports/streak/heropanelindicator.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/sports/streak.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
sho.loaded_modules['/lib/js/sho/sports.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/



	sho.provide('sho.search');

	sho.search.trim = function($)
	{

		function initialize()
	    {
	        if (!String.prototype.trim) {
			  String.prototype.trim = function () {
			    return this.replace(/^\s+|\s+$/g, '');
			  };
			}

			var searchForm = _.filter($([$('#results-search-form'), $('.nav-search-form')]), function(ele){
				return ele.length > 0
			})

			if(searchForm.length > 0) {
				$(searchForm).each(function(i){
					$(this).on( "submit", trimQuery)
				})
			}
	    }

		function trimQuery(event)
		{
			var textField =  $(event.currentTarget).find('input[name="q"]')
			var trim = textField.val(function( index, value ) {
			  return value.trim();
			});
		}

	    return {
	        init:initialize
	    }

	}(sho.$)

	document.observe('dom:loaded', sho.search.trim.init );

sho.loaded_modules['/lib/js/sho/search/trimsearchquery.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho/search.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/

sho.loaded_modules['/lib/js/sho.js']=true;
/* END MODULE ----------------------------------------------------------------------------------*/
