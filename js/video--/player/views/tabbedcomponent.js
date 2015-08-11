
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        about.js
    @package            video.player.views
    @author			    dpaul
    @modified		    12.27.11
    @desc               base class for tabbed components in video player
    
    /* =:views.TabbedComponent
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.TabbedComponent = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.TabbedComponent',
   
        /* 
        =:startup
        ---------------------------------------------------------------------------------------- */
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'innerCntr' : this.el,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'data' : {}
            });
            
            this.build();
            this.setHandlers();
        },
        
        build:function()
        {    
            this.container.insert(this.innerCntr);
        },
        
        setHandlers:function()
        {
            // implement in subclass
        },
        
        /* 
        =:runtime
        ---------------------------------------------------------------------------------------- */
        activate:function() // called by tabs on reveal
        {
            this.render();
        },
        
        deactivate:function() // called by tabs on hide
        {
            // implement in subclass
        },
        
        render:function(data)
        {
            this.innerCntr.update(Mustache.to_html(this.template, (data || this.data), (this.partials || this.views || {})));
        }

    })


