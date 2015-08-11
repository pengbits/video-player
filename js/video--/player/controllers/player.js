
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   			sho.com <rebuild>
        @project	    	video player
        @file		        player.js
        @package            video.player.controllers
        @author			    dpaul
        @modified		    10.03.12
        @desc               controller class for video player, trying a pure Backbone ting!
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.controllers');
        
        /**
         * class sho.video.player.controllers.Player < Backbone.Router
         * controller class for video player
        **/
        
        sho.video.player.controllers.Player = Backbone.Router.extend({

            _KLASS_ : 'sho.video.player.controllers.Player',
            
            fn : {},
            
            /** 
             * new sho.video.player.controllers.Player(cfg)
             * create the player controller, storing a reference to the model and setting event listeners.
            **/
            initialize:function(cfg)
            {
                this.model = cfg.model;
                this.setHandlers();
            },
            
            /**
             * sho.video.player.controllers.Player#setHandlers() -> Null
             * Sets event listeners for the controller. Currently,this is limited to space-bar keypresses, which trigger a play/pause.
            **/
            setHandlers:function()
            {
                this.fn.playPauseOnSpaceBar = this.playPauseOnSpaceBar.bind(this);
                $$('body')[0].observe('keypress', this.fn.playPauseOnSpaceBar);
            },
            
            /**
             * sho.video.player.controllers.Player#playPauseOnSpaceBar() -> Null
             * Callback for the spacebar key-press event
            **/
            playPauseOnSpaceBar:function(e)
            {
                if(e.keyCode == '32' && !e.findElement('input,textarea'))
                {
                    this.togglePlaying();
                }
            },
            
            /**
             * sho.video.player.controllers.Player#destroy() -> Null
             * The controller's shutdown routine. Removes the spacebar key-press listener.
            **/
            destroy:function()
            {
                $$('body')[0].stopObserving('keypress', this.fn.playPauseOnSpaceBar);
            },
            
            /**
             * sho.video.player.controllers.Player#loadVideo(videoId) -> Null
             * Loads a video into the model.
            **/
            loadVideo:function(id)
            {
                //log('|controller| loadVideo:`'+id+'`');
                this.model.loadVideoById(id);
            },
            
            /**
             * sho.video.player.controllers.Player#loadRelatedVideo(videoId) -> Null
             * Called when the user clicks on a video in the related videos tab. Functionally equivalent to [[sho.video.player.controllers.Player#loadVideo]],
             * this is broken out in case we ever want to add different behaviors around this event.
            **/
            loadRelatedVideo:function(id)
            {
                // log('|controller| loadRelatedVideo:`'+id+'`');
                this.loadVideo(id);
            },
            
            /**
             * sho.video.player.controllers.Player#togglePlaying() -> Null
             * Toggle the model's playing state. (Play/Pause).
            **/
            togglePlaying:function()
            {
                this.model.togglePlaying();
            },
            
            /**
             * sho.video.player.controllers.Player#seek(factor) -> Null
             * Change the current position of the video during playback. Expects a value from 0 - 1, rather than a time in mins:seconds
            **/
            seek:function(factor)
            {   
                var duration = this.model.getVideoDuration();
                if(duration && factor)
                {
                    var timeInSeconds = duration * factor; 
                    this.model.seek(timeInSeconds);
                }
            },
            
            /**
             * sho.video.player.controllers.Player#play() -> Null
             * Start/resume video playback by calling play on the model.
            **/
            play:function()
            {
                this.model.play();
            },
            
            
            /**
             * sho.video.player.controllers.Player#pause() -> Null
             * pause video playback by calling pause on the model.
            **/
            pause:function()
            {
                this.model.pause();
            },
            
            /**
             * sho.video.player.controllers.Player#stop() -> Null
             * stop video playback by calling stop on the model.
            **/
            stop:function()
            {
                this.model.stop();
            },
            
            /**
             * sho.video.player.controllers.Player#toggleIsMuted() -> Null
             * Toggle the player sound on and off
            **/
            toggleIsMuted:function()
            {
                this.model.mute(!this.model.isMuted());
            },
            
            /**
             * sho.video.player.controllers.Player#setVolume(volume) -> Null
             * Set volume level
            **/
            setVolume:function(v)
            {
                this.model.setVolume(v);
            },

            /**
             * sho.video.player.controllers.Player#getVolume() -> Number
             * Get the volume level
            **/
            getVolume:function()
            {
                return this.model.getVolume();
            },
            
            /**
             * sho.video.player.controllers.Player#getClosedCaptionsEnabled() -> Null
             * Return true if closed captions is enabled, false otherwise. =:captions
            **/
            getClosedCaptionsEnabled:function()
            {
                return this.model.getClosedCaptionsEnabled()
            },
            
            /**
             * sho.video.player.controllers.Player#setClosedCaptionsEnabled(cc) -> Null
             * enable or disable closed captions by setting the model state.
            **/
            setClosedCaptionsEnabled:function(cc)
            {
                this.model.setClosedCaptionsEnabled(cc)
            },
            
            /**
             * sho.video.player.controllers.Player#toggleClosedCaptions() -> Null
             * Toggle closed captions on or off. 
            **/
            toggleClosedCaptions:function()
            {
                this.model.setClosedCaptionsEnabled(!this.model.getClosedCaptionsEnabled());
            },
            
            /**
             * sho.video.player.controllers.Player#toggleClosedCaptionsUIVisibility() -> Null
             * Hide/show the brightcove ui for changing the closed captions options. 
            **/
            toggleClosedCaptionsUIVisibility:function()
            {
                return false; // not implemented
                // this.model.setClosedCaptionsUIVisible(!this.model.getClosedCaptionsUIVisible())
            },
            
            /**
             * sho.video.player.controllers.Player#showClosedCaptionsOptions() -> Null
             * show the brightcove ui for changing the closed captions options. 
            **/
            showClosedCaptionsOptions:function()
            {
                this.model.showClosedCaptionsOptions();
            },
            
            /**
             * sho.video.player.controllers.Player#setDisplayMode(mode) -> Null
             * Set the player display mode, by passing either 'actual_size' or 'scale_to_fit'. =:display
            **/
            setDisplayMode:function(mode)
            {
                this.model.setDisplayMode(mode); 
            },
            
            /**
             * sho.video.player.controllers.Player#sendEmail(attributes) -> Null
             * Trigger the action to send a video as an email, this is called by the form in the share panel. =:share
            **/
            sendEmail:function(attrs)
            {
                this.model.sendEmail(attrs);
            },
            
            /**
             * sho.video.player.controllers.Player#submitDateOfBirth(attr) -> Null
             * Set the date of birth for the user. Used in age-gating for videos that are rated TV-MA+.
            **/
            submitDateOfBirth:function(attrs)
            {
                this.model.setDateOfBirth(attrs);
            },
            
            /**
             * sho.video.player.controllers.Player#clearHash() -> Null
             * Clear the window's hash value. Useful for when the video title page redirects to the screening room and triggers a video play.
            **/
            clearHash:function()
            {
                window.location.hash = '';
            }
          
        })

    /* No surrender, No delete! */