
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   		sho.com <rebuild>
        @project	    video player
        @file		    stage.js
        @package        models.Stage
        @author			dpaul
        @modified		12.21.11
        @desc           Reworking the 'stage' concept first built in the Carousel, for use in video player.
        @desc           Handles liquid/scalable canvas issues in the carousel. By defining a target
        @desc           and minimum canvas area, the stage can calculate the best possible viewable area
        @desc           for the browser's viewport. The carousel is continually updated with the box's dimensions.
        
        /* =:models.Stage
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.models');
        sho.video.player.models.Stage = Backbone.Model.extend({
            
            _KLASS_ : 'sho.video.player.models.Stage',
            
            attributes : {
                'natural' : '',         // video footprint at natural size
                'adjusted' : '',        // target dimensions and left/top offsets
                'display_mode' : ''     // how to scale the video footprint on resize. 'scale_to_fit' || 'actual_size'
            },   
            
            defaults : {
                'dimensions' : '1280x720',
                'display_mode' : 'actual_size' // 'scale_to_fit' 
            },
            
            fn : {},
            
            /*
            =:startup
            ---------------------------------------------------------------------------------------- */
            initialize:function(cfg)
            {
                this.set({ 
                    'natural' : sho.string.toDimensions(cfg.dimensions || this.defaults.dimensions),
                    'display_mode' : cfg.display_mode || this.defaults.display_mode 
                },{
                    'silent':true
                });
                
                this.setHandlers();
            },
            
            setHandlers:function()
            {
                this.fn.update = this.update.bind(this);
                Event.observe(window, 'resize', this.fn.update);
            },
            
            destroy:function()
            {
                Event.stopObserving(window, 'resize', this.fn.update); 
            },
            
            /*
            =:runtime
            ---------------------------------------------------------------------------------------- */
            update:function()
            {
                var natural = this.get('natural'),
                    display_mode = this.get('display_mode'),
                    target = document.viewport.getDimensions(),
                    sx = target.width / natural.width,
                    sy = target.height / natural.height,
                    s = {}
                ;
                
                if(display_mode == 'scale_to_fit')
                {      
                    // In scale_to_fit mode, the footprint is scaled up to a larger-than-viewport size that ensures no bars are shown.
                    // Using the larger fraction ensures the right side is scaled up.
                    if(sx > sy)
                    {
                        s.height = Math.round(natural.height * sx);
                        s.width = target.width;
                        s.top = Math.round(0-(s.height - target.height)/2)
                        s.left = 0;
                    }
                    else
                    {
                        s.height = target.height;
                        s.width = Math.round(natural.width * sy);
                        s.left = Math.round(0-(s.width - target.width)/2)
                        s.top = 0;
                    }
                }
                
                if(display_mode == 'actual_size')
                {
                    // in actual_size mode, the footprint is the same as the viewport.
                    _.extend(s, {'left':0,'top':0}, target);
                }
                
                this.set({'adjusted':s},{'silent':true});
                this.trigger('resize', s);
            }
            
        });
        
        // export defaults where neccesary - used in experience
        sho.video.default_display_mode = sho.video.player.models.Stage.prototype.defaults.display_mode;

    