
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    display.js
    @package        models.player
    @author			dpaul
    @modified		01.20.11
    @desc           mix-in for models.player, handles callbacks around display mode changes and resizes
    
    /* 
    =:models.player.Display
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.models.player');
    sho.video.player.models.player.Display = {
        
        event_responders : {
            'stage:resize' : 'onStageResize',
            'stage:change:display_mode' : 'onDisplayModeChanged',
            'experience:media:change' : (function(){
                (function(mode){ 
                    sho.video.getExperience().onDisplayModeChanged(mode); }).delay(1, this.getDisplayMode())
            })
        },
        
        onDisplayModeChanged:function(eventName,e)
        {
            var displayMode = (e && e.attributes) ? e.attributes.display_mode : sho.video.default_display_mode;
            this.bc_experience.onDisplayModeChanged(displayMode);
        },
        
        onStageResize:function(eventName, e)
        {
            //log('|display| resize '+e.width+'x'+e.height);
            this.bc_experience.resize({ 'width':e.width,'height':e.height });
        }
        
       
        
    };
    
    /* No surrender, No delete! */


