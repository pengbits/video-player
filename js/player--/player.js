
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        player.js
    @package            video.player
    @author				dpaul
    @modified		    06.28.12
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video');
    /**
     * sho.video.minimum_flash_version = '9.0.115'
     * The minimum flash version required for video playback.
    **/
    sho.video.minimum_flash_version = '9.0.115';
    
    /**
     * class sho.video.player.Player
     * The wrapper class for the video player, sets up MVC triangle.
     * Aliased as sho.video.Player.
    **/
    sho.provide('sho.video.player');
    sho.video.player.Player = Class.create({

        _KLASS_ : 'sho.video.player.Player',
        
        callbacks : {},
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        /**
         * new sho.video.player.Player(cfg)
         * Instantiate a video player instance. This is not called directly in practice, there is a singleton-style setup
         * that makes use of sho.video.getPlayer().
         *
         * Internally, the constructor does the following:
         *
         * 1. Collects callbacks and initializes the experience instance
         * 2. Checks for minimum version of Flash (if on Desktop)
         * 3. Initializes the Model,Controller,and View, passing an onContainerReady callback to View
         * 4. Passes the container element to the experience when onContainerReady fires, and calls createExperience
         *
        **/
        initialize:function(cfg)
        {   
            // grab callbacks and init experience
            _.extend(this, {
                'errors' : [],
                'bc_experience' : new sho.video.brightcove.Experience({}),
                'callbacks' : {
                    'ready' : cfg.ready || sho.emptyFunction,
                    'error' : cfg.error || sho.emptyFunction
                }
            });
            
            try
            {
                // the minimum version of flash defined above must be present for desktop experience
                if(sho.isDesktop()) this.checkForFlash();
                
                // uncomment this line to use flash sleep:wake events in firefox.. (initial sleep may not be picked up by player.. does this matter?)
                //set to false because the video controls were not appearing at all for full episodes
               sho.video.use_flash_sleep_wake_events = false; //sho.env.browser().isFireFox && !sho.video.disable_sleeping; 
                
                // init model
                // ---------------------------------------------------------------------------------
                this.model = new sho.video.player.models.Player({
                    'bc_experience' : this.bc_experience
                });
                // the model's ready event is the hook into the video load, wire it to cfg.ready, passing the player instance as first param:
                this.model.bind('ready', this.callbacks.ready.curry(this));
                    
                // experimental: try routing error events through the callback instead of views.player:
                this.model.bind('video:error', this.callbacks.error);
                this.model.bind('experience:error', this.callbacks.error);
                
                // init controller
                // ---------------------------------------------------------------------------------
                this.controller = new sho.video.player.controllers.Player({
                    'model' : this.model
                });
            
                // init view
                // ---------------------------------------------------------------------------------
                this.view = new sho.video.player.views.Player({
                    'model' : this.model,
                    'onContainerReady' : this.onContainerReady.bind(this)
                });
                this.view.controller = this.controller
                
            }
            catch(e)
            {
                if(e instanceof sho.errors.FlashPlayerNotFoundError)
                {
                    this.errors.push(e.message);
                    this.callbacks.error(e.message)
                }
                else
                {
                    console.log(e.stack /* good browsers */ || e /* ie */);
                }
            }
        },
        
        onContainerReady:function(el)
        {
            this.bc_experience.container = el;
            this.bc_experience.createExperience();
        },

        /*
        =:shutdown
        ---------------------------------------------------------------------------------------- */
        /**
         * sho.video.player.destroy() -> null
         * Close the player and nullify the model,view,controller and experience instance properties.
         * Aliased in sho.video.statics as sho.video.destroy()
         *
         * fires video_player:destroyed
        **/
        destroy:function()
        {
            (this.bc_experience && this.bc_experience.destroy());   this.bc_experience = null;
            (this.model && this.model.destroy());                   this.model = null;
            (this.view && this.view.destroy());                     this.view = null;
            (this.controller && this.controller.destroy());         this.controller = null;
            
            sho.dom.trigger('video_player:destroyed');
            this.destroySelf();
        },
        
        destroySelf:function()
        {
            sho.video._player_ = null;
        },
        
        /**
         * sho.video.player.close() -> null
         * Close the player and nullify the model,view,controller and experience instance properties. 
         * (Handle a shutdown initiated by clicking on the closer button). This can only be called against the player instance, there is no static counterpart
         *
         * fires video_player:closed
        **/
        close:function() 
        {
            this.destroy();
        },
        
        
        /**
         * sho.video.player.loadVideoById(id) -> Null
         * Calls loadVideoById on player.model, which triggers an ajax load of the video specified by the id param.
        **/
        loadVideoById:function(id)
        {
            this.model.loadVideoById(id);
        },
        
        /*
        =:util  */
        checkForFlash:function()
        {
            if(!swfobject|| !swfobject.hasFlashPlayerVersion(sho.video.minimum_flash_version)) {
                throw new sho.errors.FlashPlayerNotFoundError()
            }
        },
        
        getExperience:function()
        {
            return this.bc_experience
        },
        
        hasErrors:function()
        {
            return this.errors.length > 0
        }
        
    })
    
    // set up custom errors
    sho.provide('sho.errors');
    sho.errors.FlashPlayerNotFoundError = function(msg){ this.message = 'Flash player version '+sho.video.minimum_flash_version+' or higher is required.' ; } 
    sho.errors.FlashPlayerNotFoundError.prototype = new Error();
    
    // convenience alias for constructor
    sho.video.Player = sho.video.player.Player;
