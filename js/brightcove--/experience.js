
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    experience.js
    @package        video.brightcove
    @author			dpaul
    @modified		07.10.14
    @note           removed getEmbedCode
    -------------------------------------------------------------------------------------------- */

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
    sho.provide('sho.video.brightcove');
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
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
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
        
            // cache bound createExperience for use in teardowns
            this.fn.createExperience = this.createExperience.bind(this);
        
            // set initial state
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
            // log('|getParams| host=`'+host+'`, playerType=`'+this.player_type+'`');
            // log(_.each(this.params_host[host][this.player_type], function(v,k){
            //     log(k+':'+v);
            // }));
        
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
            // if(sho.video.noisy_logging) log('|exprnc| createExperience');
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
            // this may  be called multiple times, so make sure we don't already have a reference to any of the api modules.
            if(!this.player && this.api_type !== null)
            {
                // if(sho.video.noisy_logging) log('|exp| onTemplateLoaded `'+this.api_type+'`');
                this.api =  (this.api_type == 'smart_api' ? brightcove.api.getExperience(this.player_name) : brightcove.getExperience(this.player_name));
                _.extend(this, {
                    'player' :      this.api.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER),
                    'experience' :  this.api.getModule(brightcove.api.modules.APIModules.EXPERIENCE),
                    'content' :     this.api.getModule(brightcove.api.modules.APIModules.CONTENT),
                    'captions' :    this.api.getModule(brightcove.api.modules.APIModules.CAPTIONS)
                });
    
                // set onTemplateReady listener 
                this.fn.onTemplateReady = this.onTemplateReady.bind(this);
                this.experience.addEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, this.fn.onTemplateReady);  
            
                // set onMediaLoad listener (used in async video fetches) 
                if(this.isFlashAPI())
                {
                    this.fn.onMediaLoad = this.onMediaLoad.bind(this);
                    this.content.addEventListener(BCContentEvent.MEDIA_LOAD, this.fn.onMediaLoad);
                }
            
                // signal all done
                this.trigger('template:loaded');
            }
        },
    
    
        /**
         * sho.video.brightcove.Experience#onTemplateReady() -> null
         * Respond to brightcove:api_ready event 2/2
        **/
        onTemplateReady:function(e)
        {
            // if(sho.video.noisy_logging) log('|exprnc| onTemplateReady');
            // unregister template:ready
            this.experience.removeEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, this.fn.onTemplateReady);
        
            // keep a handle on the bound media event listener
            this.fn.onMediaEvent = this.onMediaEvent.bind(this);
        
            // add volume events to list if we want them
            if(this.isFlashAPI())
            {
                this.media_events.push('MUTE_CHANGE'); 
                this.media_events.push('VOLUME_CHANGE');
            }
        
            // register for media playback events
            var th = this; 
            this.media_events.each(function(eventName) { 
                th.player.addEventListener(th.getEventNameAlias(eventName), th.fn.onMediaEvent)
            });
        
            // register for embed code recieved event and 
            // store reference to view changer plug-in
            if(this.isFlashAPI()) this.view_changer = this.experience.getElementByID("viewChanger");
        
            // register for closed =:captions events
            this.fn.onCurrentVideoReady = this.onCurrentVideoReady.bind(this);
            this.fn.onLoadDFXPSuccess =   this.onLoadDFXP.bind(this, 'success');
            this.fn.onLoadDFXPError =     this.onLoadDFXP.bind(this, 'error');
        
            this.captions.addEventListener('dfxpLoadSuccess', this.fn.onLoadDFXPSuccess);
            this.captions.addEventListener('dfxpLoadError', this.fn.onLoadDFXPError);
        
            // all done
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
    
    
        /*
        =:net
        ---------------------------------------------------------------------------------------- */
        /**
         * sho.video.brightcove.Experience#loadVideoById(id) -> Null
         * Load a video into the player by supplying a brightcove title id. 
         * Note: we use __loadVideoById()__, Brightcove uses __loadVideoByID()__
        **/
        loadVideoById:function(id)
        {
            //log('|exp| loadVideoByID:`'+id+'` api_type:`'+this.api_type+'`');
       
            if(this.player)     
            {
                if(this.api_type == 'flash_api'){
                    this.content.getMediaAsynch(id);
                }
                else{
                    this.player.loadVideoByID(id)
                }
                //this.player[this.api_type == 'smart_api' ? 'loadVideoByID' : 'loadVideo'](id);
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
    

        /*
        =:runtime
        ---------------------------------------------------------------------------------------- */
        /**
         * sho.video.brightcove.Experience#onMediaEvent(event) -> Null
         * All-purpose responder for the media events we are monitoring. Finesses the name of the event, captures duration
         * and position since asyncronous getters are such a hassle, and proxies the event over to sho.video.brightcove.Experience's subscribers.
        **/
        onMediaEvent:function(e)
        {
            // cache duration and position. (Note: is this where the scrubber is failing some of the time?)
            this.duration = e.duration; 
            this.position = e.position;
            e.progress = e.position / e.duration;
        
            // now that this callback is defined outside the enumerable scope, we need to restore our quirky event names:
            var eventName = e.type.gsub(/media/,'media:').toLowerCase().gsub(/seeknotify/,'seek_notify').gsub(/(mute|volume)change/,'#{1}_change');
        
            // proxy brightcove event over to model
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
    
    
        /*
        =:resize, =:ipad
        ----------------------------------------------------------------------------------------*/
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
            // resize is called for both apis, event though it is only needed for the smart player (tablet) and IE9/10...
            if(this.isFlashAPI() && !sho.env.browser().isIE) return;
            
            // get the iframe element and size to fit:
            $(this.player_name).setStyle(sho.object.toPixels(dimens));
        },
        
    
        /*
        =:playback
        ---------------------------------------------------------------------------------------- */
        stop:function()
        {
            if(this.isSmartAPI())
            {
                // stop is not supported
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
    
        /*
        =:audio
        ---------------------------------------------------------------------------------------- */
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
            //if(sho.video.noisy_logging) 
            //log('|bc_exprnc| onDisplayModeChanged:'+mode);
            if(this.isFlashAPI() && this.view_changer) this.view_changer.callSWFMethod('onDisplayModeChange', mode);
        },
    
    
        /*
        =:sharing
        ---------------------------------------------------------------------------------------- */
        getEmbedCode:function()
        {
            // this is an async getter, it doesn't return anything. 
            // Observe 'experience:embed_code_ready' to get the snippet.
            return ''
        },
    
    
        /*
        =:captions
        ---------------------------------------------------------------------------------------- */
        loadDFXP:function(url)
        {
            // need to relative url for local testing
            var rel = url.split('http://www.sho.com')[1];
            
            this.trigger('dfxp:loading')
            this.captions.loadDFXP(rel);
        },
    
        onLoadDFXP:function(e, evnt)
        {
            // if this handler is the result of a legacy async call to loadDFXP, we don't want to display captions automatically.
            if (e == 'success' && this.isSmartAPI()) this.captions.setCaptionsEnabled(false); 
            this.trigger('dfxp:load:'+e);
        },
        
        getClosedCaptions:function()
        {
            // log('|exprnc| getCC');
            // we need to account for cases where this method is called before the player module is ready, i.e., during the initial render of the cc button.
            // Also, the smart player api only supports async calls to fetch the captions module, while the flash player returns it immediately, handle that.
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
        
        // at time of this writing there doesn't appear to be either
        // a) a method for returning visibility of the captions options ui
        // b) a method for closing the captions options ui
        // c) an event fired for when it's invoked
        showClosedCaptionsOptions:function()
        {
            this.captions.showOptions(true); // this param seems to be ignored but erring on safe side.. 
        },
    
        /*
        =:shutdown
        ---------------------------------------------------------------------------------------- */
        destroyExperience:function()
        {
            // unregister media event listeners
            var th=this; 
            this.media_events.each(function(eventName){
                th.player.removeEventListener(th.getEventNameAlias(eventName), th.fn.onMediaEvent);
            });
        
            // unregister closed =:captions event listeners
            this.captions.removeEventListener('dfxpLoadSuccess', this.fn.onLoadDFXPSuccess);
            this.captions.removeEventListener('dfxpLoadError', this.fn.onLoadDFXPError);
        
            if(this.isFlashAPI())
            {
                // unregister content module listeners
                this.content.removeEventListener(BCContentEvent.MEDIA_LOAD, this.fn.onMediaLoad);

    			// unload experience
                this.experience.unload();
            }
        
            // delete api and module refs 
            _.extend(this, {
                'api' : null, 'player' : null, 'experience' : null
            });
        },

        destroy:function()
        {
            //this.container = null;                        // why is this neccesary?
            this.player && this.destroyExperience();        // unset brightcove listeners and remove swf
            this.unbind();                                  // remove all callbacks pointed this way.
        },
    

        /*
        =:util
        ---------------------------------------------------------------------------------------- */
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
    
        // flag denoting if the player is for short-form or full episode content
        getPlayerType:function()
        {
            return this.player_type
        },
    
        // set the player to either 'short' or 'full'. a change in type triggers a teardown 
        // of the experience, and a redeploy of the alternate player.
        setPlayerType:function(type)
        {
            // if(sho.video.noisy_logging) log('|exprnc| setPlayerType:'+type);
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

    // export static convenience methods onto sho.video.brightcove:
    $w('onTemplateLoaded isSmartAPI isFlashAPI').each(function(method){
        sho.video.brightcove[method] = function(){
            var experience = sho.video.getExperience(), m = experience[method];
            //log(['|exprnc| static method call:'+method]);
            return m.apply(experience, arguments)
        }
    })
    
    // export static onTemplateError seperately from above, as it has more involved logic,
    // we want to reject all but the geoRestricted errors to avoid recursion issues.
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
