
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    AgeGating.js
    @package        models.player
    @author			dpaul
    @modified		10.03.12
    @desc           Mix-in for models.player. Performs the age-gate checks that must be cleared before video playback can begin
    @note           these modules can't be marked up as bona-fide pdoc members because of a namespace collision w/ the model itself.
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.models.player');
    
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
                    // if the vendorId was null, it would actually get trapped here,
                    // which can be quite perplexing to debug. not sure why we can't catch
                    // these kinds of errors elsewhere... look into this!
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
            // compare user's date to a date x years in the past:
            // x is number passed in from VAMS video object
            var restricted_age = this.getRestrictedAge();
            var user = Date.parse(this.get('dob')),
            at_least_this_old = Date.today().add({ years: -restricted_age});
            if(user.compareTo(at_least_this_old) > 0) // returns -1 if user < at_least_this_old, 1 if reverse
            {
                throw new sho.errors.AgeGateError('underage'); 
            }
        },
        
        /*
        =:util */
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
    
    // set up custom errors
    sho.provide('sho.errors');
    sho.errors.AgeGateError = function(msg){ this.message = msg; } 
    sho.errors.AgeGateError.prototype = new Error();

    /* enable reset of lockout for debugging */
    sho.clearLockout = function()
    {
        sho.util.Cookies.clear('sho_video_player_lockout'); return true
    }

    /* Níl a thabhairt suas, Níl a scriosadh! */


