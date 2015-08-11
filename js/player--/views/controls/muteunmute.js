
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        controls.js
    @package            player.views.controls
    @author			    dpaul
    @modified		    12.12.11
    @desc               auto mute/unmute
    
	<div class="control piped audio-mute-unmute">.</div>
	
    /* =:controls.MuteUnmute
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.MuteUnmute = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.MuteUnmute',
        
        className : 'control piped audio-mute-unmute',
        
        events : {
            "click" : "toggleIsMuted"
        },
        
        setHandlers:function()
        {
            this.model.bind('change:muted', this.render.bind(this));
        },
        
        render:function()
        {
            this.el.className = this.className +(this.model.isMuted() ? ' muted' : '');
        },
        
        toggleIsMuted:function()
        {
            this.controller.toggleIsMuted();
        }

    })


