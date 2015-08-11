
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
	
    /* =:controls.BaseControl
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.BaseControl = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.controls.BaseControl',
        
        className : 'control',
        render_on_startup : true,
        
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'controller' : cfg.controller,
                'model' : cfg.model
            });
            
            this.build();
            this.setHandlers();
            if(this.render_on_startup) this.render();
        },
        
        build:function()
        {
            this.container.insert(this.el);
        },
        
        setHandlers:function()
        {
            // this may be a little much for default behavior,
            // controls probably aren't interested in EVERY event..
            this.model.bind('all', this.render.bind(this));
        },
        
        render:function()
        {
            // implement in subclass
        }

    })


