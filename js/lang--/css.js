
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <common>
    @project	    	_
    @package            lang
    @file		        css.js
    @author				dpaul
    @modified			11.06.11
    @desc               utility functions related to css
    -------------------------------------------------------------------------------------------- */  

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
    
    
     
    /* No surrender, No delete! */

