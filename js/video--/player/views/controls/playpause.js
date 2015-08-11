
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        controls.js
    @package            player.views.controls
    @author			    dpaul
    @modified		    12.12.11
    @desc               play/pause button

    <div class="control play-pause playing"></div>
	
    /* =:controls.PlayPause
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.PlayPause = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.PlayPause',
        
        className : 'control play-pause',
        
        events : {
            "click" : "togglePlaying"
        },
        
        setHandlers:function()
        {
            this.model.bind('change:playing', this.render.bind(this));
        },
        
        render:function()
        {
            this.el.className = this.className + ' '+(this.model.isPlaying() ? 'playing' : 'paused');
            return this;
        },
        
        togglePlaying:function()
        {
            this.controller.togglePlaying();
        }

    })


