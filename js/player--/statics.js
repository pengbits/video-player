
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        statics.js
    @author				dpaul
    @modified			10.26.12
    @note               trying something new for errors - we use the error callback to display the error
    @note               and kill the player instance - this was previously handled in the view.
    -------------------------------------------------------------------------------------------- */  
    
    /**
     * sho.video.player.statics
     * Module of static methods (class methods) which form the public interface for interacting with the player.
     * They are mixed into `sho.video`, so `sho.video.statics.getExperience()` can be accessed as `sho.video.getExperience()`, for example
    **/
    
    sho.provide('sho.video')
    sho.video.statics = 
    {   
        noisy_logging : false,
        
        /* =:private
        ---------------------------------------------------------------------------------------- */
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
        

        /* =:public
        ---------------------------------------------------------------------------------------- */
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
            
            // Added the extra check for playerIsValid? because a player that throws a flashNotFoundException
            // will still be stored on sho.video._player_ and playerExists? will return true
            
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
        
        /*
        =:util 
        ---------------------------------------------------------------------------------------- */
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
        
        /* =:sleep/wake
        ---------------------------------------------------------------------------------------- */
        sleepWake:function(sleep_or_wake)
        {
            //console.log('|statics| '+sleep_or_wake+'!');
            if(sho.video.use_flash_sleep_wake_events && !sho.video.disable_sleeping){
                sho.video.getModel()[sleep_or_wake]();
            }
            return true;
        },
        
        
        /* =:analytics
        ---------------------------------------------------------------------------------------- */
        trackClick:function(str)
        {
            // 'related-videos' => 'player:related_videos'
            sho.video.trackWithDelay('click', 'player:'+str.gsub(/-/,'_'));
        },
        
        trackPlay:function()
        {
            // "Californication S4 E11: Grown Up Talk" => "californication s4 e11 grown up talk"
            sho.video.trackWithDelay('page', 'video:player:'+ sho.video.getModel().getTitle().toLowerCase().gsub(/:/,''));
        },
        
        trackWithDelay:function(type, str)     
        {
            var method = type == 'click' ? 'trackClick' : 'trackPageView',  // set the type of impression to record
                cfg = (type == 'click' ? {'reload':true} : {}),             // click events have to be reloaded, since the tracker will have been used to track a video impression
                impression = {}                                             // impression is a simple hash where the key is either 'click' or 'trackPageView'
            ;   impression[type] = str;
            
            // delay impression by one second to avoid visible 'shudder' in ui
            (function(t){ t[method](impression); }).delay(1, sho.analytics.getTracker(cfg));
        }
        
    };
    
    _.extend(sho.video, sho.video.statics, {
        'sleep' : sho.video.statics.sleepWake.curry('sleep'),
        'wake' : sho.video.statics.sleepWake.curry('wake')       
    });
    
    /* No surrender, No delete! */
