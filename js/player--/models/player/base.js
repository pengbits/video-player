
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   		sho.com <rebuild>
        @project	    video player
        @file		    Base.js
        @package        models.player
        @author			dpaul
        @modified		02.02.12
        @desc           mix-in for models.player, provides baseline functionality to model class. 

        /* 
        =:models.player.Base
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.models.player');
        sho.video.player.models.player.Base = {

            _KLASS_ : 'sho.video.player.models.Player',
            
            public_events : ['video:loading','video:loaded','video:error','shareable:success','clipboard:copied','experience:media:finish_line'],
            
            fn : {}, // catch-all for bound callbacks
            
            /*
            =:startup 
            ---------------------------------------------------------------------------------------- */
            initialize:function(cfg)
            {
                var th = this;
                this.setBenchMark('player:init');
                
                // pre-emptively create an instance of REST-backed video model 
                // and proxy its events over to the parent class, but prefix with 'video:'
                this.video = new sho.video.player.models.Video();
                this.video.bind('all', function(eventName){
                    th.trigger('video:'+eventName);
                });
                
                // now do the same for brightcove events
                this.bc_experience = cfg.bc_experience;
                this.bc_experience.bind('all', function(eventName,e){
                    th.trigger('experience:'+eventName,e);
                });
                
                // and stage
                this.stage = new sho.video.player.models.Stage();
                this.stage.bind('resize', function(e){
                    th.trigger('stage:resize', e)
                });
                this.stage.bind('change:display_mode', function(e){
                    th.trigger('stage:change:display_mode', e)
                });
                
                // set initial state
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
                
                // sleep/wake
                this.sleep_wake_supported = (sho.isDesktop() && !sho.video.disable_sleeping && !sho.video.use_flash_sleep_wake_events);
                this.setSleepWakeHandlers();
                
            },
            
            getInitialIsMuted:function()
            {
                var inital = this.cookie_mute_settings && sho.util.Cookies.read(this.cookie_mute_store) == 'true'; return inital;
            },

            /*
            =:runtime
            ---------------------------------------------------------------------------------------- */
            trigger:function(eventName, e)
            {
                // dispatch event responders that were defined in other mix-ins:
                if(!!this.event_responders[eventName]){
                    for(var i=this.event_responders[eventName].length-1; i>-1; i--){
                        var responder = this.event_responders[eventName][i],
                            fn = typeof responder == 'string' ? this[responder] : responder
                        ;
                        fn.apply(this, arguments);
                    }
                }
                
                // implementing trigger() in order to give our model a chance to react to its own events,
                // but we still need to call the super class's trigger method for thing to work properly:
                Backbone.Model.prototype.trigger.call(this, eventName, e);
                
                // broadcast the event publicly if neccessary:
                if(this.public_events.include(eventName)) sho.dom.trigger('video_player:'+eventName, e);
            },
            
            destroy:function()
            {
                this.video.unbind('all');
                if(this.sleep_wake_supported) ($$('body')[0]).stopObserving('mousemove',this.fn.resetSleepCheck);
                this.unbind('all');
                this.stage.destroy();
            },
  
  
            /*
            =:benchmarks
            ---------------------------------------------------------------------------------------- */
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
            
            /*
            =:accessors, =:metadata
            ---------------------------------------------------------------------------------------- */
            getRating:function(){
                // deprecated by getRestrictedAge
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
        
        /* No surrender, No delete ! */