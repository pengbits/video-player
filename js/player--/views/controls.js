
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        controls.js
    @package            video.player.views
    @author			    dpaul
    @modified		    10.11.12
    @desc               wrapper around the player controls
    @note               moved the controls array from class prototype to the initialize block, 
    @notr               as the controls were getting trimmed by 2 each time the player was opened
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.Controls = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Controls',
        
        /**
         * class sho.video.player.views.Controls < Backbone.View
         * Wrapper around the player controls
        **/
        
        /**
         * new sho.video.player.views.Controls(cfg)
         * Create an instance of the Controls view class, which wraps the individual controls 
         * that are housed in an absolutely-positioned container in the bottom of the viewport.
        **/
        initialize:function(cfg)
        {
            /**
             * sho.video.player.views.Controls.controls = []
             * A list of control elements to build up the ui. note that the smart player doesn't have volume controls.
             * they are absolutely positioned, so insertion order should not matter, meaning we can remove
             * the offending flash-only controls from this list at startup.
            **/
     
            this.controls = $w('play-pause timeline closed-captions time-display mute-unmute volume');
            
            // trim volume controls off the end of the list
            sho.video.brightcove.isFlashAPI() || this.controls.splice(-2,2);                       
            
            // build skeleton
            cfg.container.insert([
            '<div class="video-player-controls video-player-controls-outer">',
                '<div class="video-player-controls-inner"></div>',
            '</div>'].join(''));
            
            _.extend(this, {
                'controller' : cfg.controller,
                'container' :  cfg.container.select('.video-player-controls')[0],
                'innerCntr' :  cfg.container.select('.video-player-controls-inner')[0],
                'outerTitle' : cfg.title
            });
                
            var th=this, key='', klass=''; this.controls.each(function(k)
            {
                key = k.capitalize().camelize();
                klass = sho.video.player.views.controls[key]; 
                
                this[key] = new klass({
                    'model' : th.model,
                    'controller' : th.controller,
                    'container' : th.innerCntr
                });
            })
            
            this.setHandlers();
        },
        
        setHandlers:function()
        {
            this.model.bind('player:wake', this.focus.bind(this));
            this.model.bind('player:sleep', this.blur.bind(this));
            this.blurrables = [this.container, this.outerTitle];
        },
        
        focus:function() 
        {
            this.tween('focus');
        },   
        
        blur:function()
        {
            this.tween('blur');
        },

        tween:function(mode)
        {
            if(sho.video.tweens.isSupported('controls', mode))
            {
                $j(this.blurrables).fadeTo(
                    sho.video.tweens.deefault.duration * 1000, 
                    (mode == 'blur' ? 0 : 1)
                );
            }
            else
            {
                this.blurrables.invoke('setStyle', {
                    'display' : (mode == 'blur' ? 'none' : 'block')
                })
            }
        }
        
    })


