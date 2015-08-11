
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <common>
    @project	    	_
    @package            lang
    @file		        object.js
    @author				dpaul
    @modified			02.28.13
    @desc               utility functions related to objects
    -------------------------------------------------------------------------------------------- */  

    
    sho.provide('sho.object');
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
        
        //log('|object| '+str);
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
    
    /* No surrender, No delete! */

