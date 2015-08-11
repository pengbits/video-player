
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <common>
    @package            lang
    @file		        string.js
    @author				dpaul
    @modified			11.07.12
    @desc               utility functions related to strings
    @todo               remove prototype dependancy in toSlug by porting string.gsub

    /* =:string
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.string');
    
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

        // Perform transliteration to replace non-ascii characters with an ascii
        // character
        // value = self.mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n, '').to_s

        // Remove single quotes from input
        var value = str.gsub(/[']+/, '')

        // Replace any non-word character (\W) with a space
        value = value.gsub(/\W+/, ' ')

        // Remove any whitespace before and after the string
        //value.strip!

        // All characters should be downcased
        value = value.toLowerCase()

        // Replace spaces with dashes
        value = value.gsub(' ', '-')

        // Return the resulting slug
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
    
    /* No surrender, No delete! */
