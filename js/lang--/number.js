
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <common>
    @package            lang
    @file		        string.js
    @author				dpaul
    @modified			11.07.12
    @desc               utility functions related to strings

    /* =:string
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.number');
    
    /**
     * sho.number.toTwoDecimalPlaces(float) -> float
     * round to 2 decimal places
     *
    **/
    sho.number.toTwoDecimalPlaces = sho.number.to2DecimalPlaces = sho.number.toTwo = function(number) 
    {
        // was using Math.round for this, but as seen in https://issues.sho.com/browse/SITE-3247
        // lead to some odd trailing numbers, ie when calling for against sho.number.toTwoDecimalPlaces(7 / 12) => 0.5799999999999999 
        // return (Math.round(number * 100)) / 100;
        return Math.floor(number * 100) / 100;
        
    }
    
    /*
     * returns time stam format for video player. The pass param is a number representing total seconds, example: 175.244
     * the returned string format is -> 1:35
     * this is currently only called in /lib/js/sho/video/player/views/controls/timedisplay.js
    */    
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
    
    /* No surrender, No delete! */
