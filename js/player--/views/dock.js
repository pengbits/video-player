
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        dock.js
    @package            video.player.views
    @author			    dpaul
    @modified		    12.22.11
    @desc               parent component for tabbed functionality in bottom of player,
    @desc               should support focus/blur on rollover, expanding up from bottom of screen.

    <div class="video-player-dock video-player-dock-outer aktiv"> // <-- this is drawn by the parent view
		<div class="tabs-head rtl">
			...
		</div>
		<div class="tabs-body">
			...
		</div>
	</div>
	
    /* =:views.Dock
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.Dock = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Dock',
        
        toggle_height : 32,
        fn:{},
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container, // div.video-player-dock
                'model' : cfg.model,
                'controller' : cfg.controller,
                'tweening' : false,
                '_open' : false
            });
            
            this.build();
            this.setHandlers();
        },
        
        build:function()
        {
            this.tabs = new sho.video.player.views.Tabs({
                'container' : this.container,
                'model' : this.model,
                'controller' : this.controller
            })
        },
        
        setHandlers:function()
        {
            this.fn.update = this.update.bind(this);
            this.model.bind('all', this.fn.update);
            this.tabs.bind('all', this.fn.update);
            this.fn.afterTween = this.afterTween.bind(this);
        },
        
        /*
        =:runtime 
        ---------------------------------------------------------------------------------------- */
        update:function(eventName,e)
        {
            //if(eventName.match(/complete|tabs/)) console.log('|dock| '+eventName);
            if(['video:loading','video:changed'].include(eventName)){
                //log(eventName);
                this.tabs.reset();
                this.close();
                window.dock = this;
            }
            if('tabs:activated' == eventName){
                this.open(e);
            }
            if('tabs:collapsed' == eventName){
                this.close();
            }
            if('player:wake' == eventName){
                this.focus();
            }
            if('player:sleep' == eventName){
                this.blur();
            }
            if('experience:media:complete' == eventName){
                if(!this._open) this.activateTab('related-videos');
            }
        },
        
        open:function(e)
        {   
            this.tween('open', e.tab.height + this.toggle_height);
            this.model.disableSleeping();
            this._open = true;
        },
        
        close:function()
        {
            this.tween('close', this.toggle_height);
            this.model.enableSleeping();
            this._open = false;
        },
        
        focus:function() 
        {
            this.tween('focus');
        },
    
        blur:function() 
        { 
            this.tween('blur');
        },
        
        // switching to jQuery animations to fix dropouts
        tween:function(mode, height)
        {
            var t={},
            c = $j(this.container);
            
            if(mode == 'focus')                         t.opacity=1;
            if(mode == 'blur')                          t.opacity=0;
            if(mode == 'open' || mode == 'close')       t.height=height;
            if(this.tweening && mode == 'blur') return  // prevent the loss of controls when mouse idles out in middle of a tween
            
            if(sho.video.tweens.isSupported('dock',mode))
            {
                c.animate(t,sho.video.tweens.deefault.duration * 1000, 'linear', this.fn.afterTween );
            }
            else
            {
                c.css(t); // jQuery css() method doesn't require 'px' for width/height!
            }
        },
        
        afterTween:function(mode)
        {
            // set flag for safe to respond to sleep events
            this.tweening = false; 
            
            // when using flash sleep/wake events, the dock can 'block' the flash layer and prevent the player from waking
            // this is likely to be resolved by adding support for preventing 'sleeping' when the dock is open, which we want anyway..
        },
        
        /*
        =:util */
        // programatically open a tab, ie for debugging purposes
        activateTab:function(t)
        {
            this.tabs.activateTab(t);
        }
        
        
    })

    /* No surrender, No delete! */
