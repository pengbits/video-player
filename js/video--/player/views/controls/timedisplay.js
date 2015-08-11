
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
 
    <div class="control piped time-display">
		<span class="time-display-current">00:00</span> / 
		<span class="time-display-duration">00:00</span>
	</div>
 
    /* =:controls.TimeDisplay
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.TimeDisplay = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.TimeDisplay',
        
        className : 'control piped time-display',
        
        // events : {
        //     "click" : "togglePlaying"
        // },
        
        build:function()
        {
            _.extend(this, {
                'current' : this.make('span', {'class':'time-display-current'}, '00:00'),
                'duration' : this.make('span', {'class':'time-display-duration'}, '00:00')
            });
            this.el.insert(this.current);
            this.current.insert({'after':' / '});
            this.el.insert(this.duration);
            
            // call super build last...
            sho.video.player.views.controls.BaseControl.prototype.build.apply(this);
        },
        
        setHandlers:function()
        {
            this.model.bind('all', this.render.bind(this));
        },
        
        render:function(eventName, e)
        {
            if(e && typeof e.position == 'number')
            {
                this.current.update(sho.number.toTimeCode(e.position));
                this.duration.update(sho.number.toTimeCode(e.duration));
            }
            return this;
        }
    })
    
   
      
    
