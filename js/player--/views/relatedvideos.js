
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        relatedvideos.js
    @package            video.player.views
    @author			    dpaul
    @modified		    02.09.12
    @desc               list of related videos in a swipeable/panable thumbnail view.
    @note               using iscroll to handle swipes in ipad
    /* =:views.RelatedVideos
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.RelatedVideos = sho.video.player.views.TabbedComponent.extend({

        _KLASS_ : 'sho.video.player.views.RelatedVideos',
  
        className : 'group related-videos-inner',
        
        events : {
            'click' : 'selectVideo'
        },
        
        template : [
        
            '{{#videos}}',
            '<div class="video" data-video-id="{{id}}">',
                '<span class="thumb">',
                    //'<img src="', sho.dom.SPACER, '" style="background-image:url(http://www.sho.com{{image.path}});" />',
                    '<img src="http://www.sho.com{{image.path}}" />',
                '</span>',
                '<span class="title">',
                    '{{contextualTitle}}',
                '<span>',
            '</div>',
            '{{/videos}}',
            '{{^videos}}',
            'There are no related Videos for this title.',
            '{{/videos}}'
        
        ].join(''),
        
        first_render : true,
        standard_num_videos : 10,
        width : 2000, // 200px thumb * 10 videos (todo: make this dynamic, some titles have fewer than 10, for example: 16532
        height : 180,
        thumb_width : 200,
        step_size : 100,
        
        // bound callbacks
        fn : {},
        
   
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        setHandlers:function()
        {
            //sho.isTablet = function(){return true};
            this['set'+ (sho.isTablet() ? 'Tablet' : 'Desktop')+'Handlers'].call(this);
        },
        
        setTabletHandlers:function()
        {
            this.fn.initIScroll = this.initIScroll.bind(this);
        },
        
        setDesktopHandlers:function()
        {
            this.fn.mouseEnter = this.setGlideHandlers.bind(this);
            this.innerCntr.observe('mouseenter', this.fn.mouseEnter);
            
            this.fn.mouseLeave = this.unsetGlideHandlers.bind(this)
            this.innerCntr.observe('mouseleave', this.fn.mouseLeave);
            
            this.fn.onresize = this.setViewportWidth.bind(this)
            this.model.bind('stage:resize', this.fn.onresize);
            this.setViewportWidth();
        },
        
        setGlideHandlers:function()
        {
            this.isAnimating = false;
            this.innerCntr._left = this.innerCntr._left || 0;
            this.fn.mouseMove = this.mouseMove.bind(this);
            this.innerCntr.observe('mousemove', this.fn.mouseMove);
            this.fn.onGlideInterval = this.onGlideInterval.bind(this);
            this.glideItvl =  setInterval(this.fn.onGlideInterval, 41 );
        },
        
        unsetGlideHandlers:function()
        {
            clearInterval(this.glideItvl);
            this.innerCntr.stopObserving('mousemove', this.fn.mouseMove);
        },
        
        
        /*
        =:runtime 
        ---------------------------------------------------------------------------------------- */
        setViewportWidth:function(e)
        {
            this.viewportWidth = document.viewport.getWidth()
        },
        
        mouseMove:function(e)
        {   
            if(this.width < this.viewportWidth && this.innerCntr._left == 0) return;    // nothing to glide! 
            
            var x = e.pageX, w = this.viewportWidth, pan = x/w;
                
            if((pan < 0.33 || pan > 0.66)) 
            {
                this.isAnimating = true;
                this.force = 0.5 - pan;
                this.direction = pan < 0.33 ? 'right':'left';
            }
            else
            {
                this.isAnimating = false;
                this.force = 0;
            }
        },
        
        onGlideInterval:function()
        {
            if(this.isAnimating)
            {
                // apply the force obtained in mousemove to step size
                var step = this.step_size * this.force,
                
                // get the value of the step applied to last position
                left = this.innerCntr._left + step,
                
                // how much of the content is offscreen ?
                offset = this.viewportWidth-this.width,
                
                // is it safe to glide?
                canGlide = (this.direction == 'left' && (offset<left)) || (this.direction == 'right' && left <= 0)
                ;
                
                // if not, snap into either flush left or flush right    
                left = canGlide ? left : (this.direction == 'left' ? offset : 0);
                
                // apply style and cache new position
                this.innerCntr.setStyle({'left':left+'px'})._left = left;
            }
        },
        
        
        selectVideo:function(e)
        {
            e.preventDefault(); var el = Event.findElement(e, '.video'); if(el){
                this.controller.loadRelatedVideo(el.readAttribute('data-video-id'))
            }
        },
    
        render:function()
        {    
            this.data.videos = this.model.getRelatedVideos();                               // populate the view with data
            this.width = this.data.videos.length * this.thumb_width;                        // calculate width now that data is available
            this.innerCntr.setStyle(sho.object.toPixels({'width':this.width, 'left':0 }));  // apply width to container and remove any left-over glide styles
            this.innerCntr._left = 0;
            
            sho.video.player.views.TabbedComponent.prototype.render.call(this);             // call super();
            if(sho.isTablet()) this.fn.initIScroll.delay(sho.dom.REDRAW_DELAY);             // init scroller if neccesary 
        },
        
  
        initIScroll:function()
        {
            if(this.scroller) this.scroller.destroy();
            
            this.scroller = new iScroll(this.container, {
                'vScroll'    : false,   // disable vertical scrolling
                'vScrollbar' : false,   // no vertical scrollbar indicator
                'hScrollbar' : false,   // no horizontal scrollbar indicator
                'momentum'   : true,    // breaks if set to false
                'bounce'     : false    // causes layout issues if set to true 
                // ,'onDestroy' : (function(){
                //     log('|related| iscroll.destroy');
                // })
            });
        }
        
        
     
    })


