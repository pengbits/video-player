
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   		sho.com <rebuild>
        @project	    video player
        @file		    sleep.js
        @package        models.player
        @author			dpaul
        @modified		03.26.12
        @desc           mix-in for models.player, provides  functionality related to mouse idles (aka sleep). 
        @todo           add ability to prevent sleep while dock is opn

        /* 
        =:models.player.Base
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.models.player');
        sho.video.player.models.player.Sleep = {

            event_responders : {
                'video:loaded' : 'fireInitialSleepIfUsingFlashEvents',
                'change:sleeping' : 'onWakeSleep'             
            },
            
            /* 
            =:startup
            ---------------------------------------------------------------------------------------- */
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
                // we need to fire the intial sleep because the flash won't do anything until there is a wake event..
                if(sho.video.use_flash_sleep_wake_events) this.set({'sleeping':true})
            },
            
            /* 
            =:runtime
            ---------------------------------------------------------------------------------------- */
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
                //console.log('|model| sleep:'+(e.attributes.sleeping))
            },
            
            canSleep:function()
            {
                return !this.get('loading') && !this.get('sleepDisabled')
            },
            
            /* 
            =:public
            ---------------------------------------------------------------------------------------- */
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
        
        /* No surrender, No delete ! */