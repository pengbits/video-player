
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <common>
    @package            lang
    @file		        dimensions.js
    @author				dpaul
    @modified			11.07.12
    @desc               utility functions related to dimensions and layout
    ------------------------------------------------------------------------------------------ */  
    sho.provide('sho.string');
    
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
    
    sho.provide('sho.object');
    
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
    
    /* No surrender, No delete! */

